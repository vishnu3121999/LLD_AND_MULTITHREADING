import "./globals.css";
import "../src/styles.css";
import { Providers } from "./providers";

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
    icon: "/logo.png",
    apple: "/logo.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
