import { SiteHeader } from "../../components/site-header";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--site-bg)] text-[var(--site-text)]">
      <SiteHeader />
      {children}
    </div>
  );
}
