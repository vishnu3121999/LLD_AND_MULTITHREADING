"use client";

import { useEffect, useMemo } from "react";

export function ContentProtection({ children, watermark = "LLD Playbook Premium", enabled = true }) {
  const watermarkText = useMemo(() => `${watermark} - ${new Date().toISOString().slice(0, 10)}`, [watermark]);

  useEffect(() => {
    if (!enabled) return undefined;

    function block(event) {
      event.preventDefault();
    }

    function blockKeys(event) {
      const key = event.key.toLowerCase();
      const protectedCombo = (event.ctrlKey || event.metaKey) && ["c", "s", "p", "u"].includes(key);
      if (protectedCombo || key === "printscreen") {
        event.preventDefault();
      }
    }

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", blockKeys);
    };
  }, [enabled]);

  return (
    <div className={enabled ? "protected-content relative overflow-hidden" : "relative"}>
      {enabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, transparent 0 80px, rgba(15,23,42,0.7) 80px 81px), repeating-linear-gradient(135deg, transparent 0 220px, rgba(15,23,42,0.4) 220px 221px)`
          }}
        />
      )}
      {enabled && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-center text-2xl font-semibold uppercase tracking-normal text-slate-900 opacity-[0.06] [transform:rotate(-18deg)]">
          {watermarkText}
        </div>
      )}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
