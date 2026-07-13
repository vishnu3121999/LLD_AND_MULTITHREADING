"use client";

import { useEffect, useState } from "react";

const DEFAULT_LIVE_INTERVAL_MS = 1500;

export function useLiveDocument(initialDocument, {
  enabled = true,
  intervalMs = DEFAULT_LIVE_INTERVAL_MS,
  url = ""
} = {}) {
  const [document, setDocument] = useState(initialDocument);

  useEffect(() => {
    setDocument(initialDocument);
  }, [initialDocument]);

  useEffect(() => {
    if (!enabled || !url) return undefined;

    let cancelled = false;
    let inFlight = false;

    async function refreshDocument() {
      if (inFlight || window.document?.hidden) return;
      inFlight = true;

      try {
        const response = await fetch(withNoStoreParam(url), { cache: "no-store" });
        const nextDocument = await response.json().catch(() => null);
        if (cancelled || !response.ok || !nextDocument) return;

        setDocument((currentDocument) => (
          getDocumentFingerprint(nextDocument) === getDocumentFingerprint(currentDocument)
            ? currentDocument
            : nextDocument
        ));
      } catch {
        // Live refresh is opportunistic; keep the last rendered content on transient failures.
      } finally {
        inFlight = false;
      }
    }

    const interval = window.setInterval(refreshDocument, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [enabled, intervalMs, url]);

  return document;
}

function withNoStoreParam(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}live=${Date.now()}`;
}

function getDocumentFingerprint(document) {
  if (!document) return "";

  return [
    document.id || document.slug || "",
    document.updated_at || "",
    hashString(JSON.stringify(document))
  ].join("|");
}

function hashString(value) {
  const text = String(value || "");
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }

  return String(hash);
}
