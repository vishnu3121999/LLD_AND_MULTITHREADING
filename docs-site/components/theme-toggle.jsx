"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { fileStorageGetItem, fileStorageSetItem, migrateLegacyBrowserStorage } from "../lib/file-storage-client";
import { Button } from "./ui/button";

const SITE_THEME_STORAGE_KEY = "lld-playbook.site-theme";
const LOCAL_THEME_STORAGE_KEY = "lld-playbook.site-theme.local";

function applyTheme(theme, { broadcast = false } = {}) {
  const normalizedTheme = theme === "midnight" ? "midnight" : "studio";
  document.documentElement.dataset.siteTheme = normalizedTheme;
  document.documentElement.classList.toggle("site-midnight", normalizedTheme === "midnight");
  document.documentElement.classList.toggle("site-studio", normalizedTheme === "studio");
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
      const localTheme = window.localStorage.getItem(LOCAL_THEME_STORAGE_KEY);
      if (localTheme && !cancelled) {
        setTheme(applyTheme(localTheme));
      }

      await migrateLegacyBrowserStorage();
      const storedTheme = await fileStorageGetItem(SITE_THEME_STORAGE_KEY);
      if (!cancelled && storedTheme) {
        const normalizedTheme = applyTheme(storedTheme);
        window.localStorage.setItem(LOCAL_THEME_STORAGE_KEY, normalizedTheme);
        setTheme(normalizedTheme);
      } else if (!cancelled && !localTheme) {
        setTheme(applyTheme("studio"));
      }
    }

    function handleThemeChange(event) {
      if (!cancelled) setTheme(applyTheme(event.detail?.theme));
    }

    window.addEventListener("lld-site-theme-change", handleThemeChange);
    loadTheme();
    return () => {
      cancelled = true;
      window.removeEventListener("lld-site-theme-change", handleThemeChange);
    };
  }, []);

  async function toggleTheme() {
    const nextTheme = theme === "studio" ? "midnight" : "studio";
    const normalizedTheme = applyTheme(nextTheme, { broadcast: true });
    window.localStorage.setItem(LOCAL_THEME_STORAGE_KEY, normalizedTheme);
    setTheme(normalizedTheme);
    await fileStorageSetItem(SITE_THEME_STORAGE_KEY, normalizedTheme);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={toggleTheme} title="Toggle site theme" className="h-8 px-2.5 text-[13px]">
      {theme === "studio" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
      <span className="hidden sm:inline">Theme</span>
    </Button>
  );
}
