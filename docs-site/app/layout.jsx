import "./globals.css";
import "../src/styles.css";
import { Providers } from "./providers";

export const metadata = {
  title: "LLD Playbook",
  description: "Template-based low-level design interview preparation with Java visualizations."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
