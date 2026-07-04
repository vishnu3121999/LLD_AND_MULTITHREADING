import "./globals.css";
import "../src/styles.css";
import Script from "next/script";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const themeInitScript = `
try {
  var theme = window.localStorage.getItem("lld-playbook.site-theme.local");
  theme = theme === "midnight" ? "midnight" : "studio";
  document.documentElement.dataset.siteTheme = theme;
  document.documentElement.classList.toggle("site-midnight", theme === "midnight");
  document.documentElement.classList.toggle("site-studio", theme === "studio");
} catch (error) {
  document.documentElement.dataset.siteTheme = "studio";
  document.documentElement.classList.add("site-studio");
}
`;

export const metadata = {
  title: "LLD Playbook",
  description: "Template-based low-level design interview preparation with Java visualizations.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "256x256" }
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          id="site-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
