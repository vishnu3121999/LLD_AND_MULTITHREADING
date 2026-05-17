import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
