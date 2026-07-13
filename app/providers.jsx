"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export function Providers({ children }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      persistence: "localStorage+cookie"
    });
  }, []);

  return children;
}
