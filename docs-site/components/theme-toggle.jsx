"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { fileStorageGetItem, fileStorageSetItem, migrateLegacyBrowserStorage } from "../lib/file-storage-client";
import { Button } from "./ui/button";

const SITE_THEME_STORAGE_KEY = "lld-playbook.site-theme";

function applyTheme(theme, { broadcast = false } = {}) {
  const normalizedTheme = theme === "midnight" ? "midnight" : "studio";
  document.documentElement.dataset.siteTheme = normalizedTheme;
  if (broadcast) {
    window.dispatchEvent(new CustomEvent("lld-site-theme-change", { detail: { theme: normalizedTheme } }));
  }
  return normalizedTheme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("studio");

  useEffect(() => {
    let cancelled = false;

    async function loadTheme() {
      await migrateLegacyBrowserStorage();
      const storedTheme = await fileStorageGetItem(SITE_THEME_STORAGE_KEY);
      if (!cancelled) setTheme(applyTheme(storedTheme));
    }

    loadTheme();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleTheme() {
    const nextTheme = theme === "studio" ? "midnight" : "studio";
    const normalizedTheme = applyTheme(nextTheme, { broadcast: true });
    setTheme(normalizedTheme);
    await fileStorageSetItem(SITE_THEME_STORAGE_KEY, normalizedTheme);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={toggleTheme} title="Toggle site theme">
      {theme === "studio" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
      <span className="hidden sm:inline">Theme</span>
    </Button>
  );
}
