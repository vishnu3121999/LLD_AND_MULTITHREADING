import { Badge } from "../../../components/ui/badge";
import { AuthPanel } from "../../../components/auth-panel";

export const metadata = {
  title: "Sign in | LLD Playbook"
};

export default function AuthPage() {
  return (
    <main className="site-container grid gap-8 py-10 lg:grid-cols-[1fr_440px] lg:items-start">
      <div>
        <Badge variant="blue">Supabase auth</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">User Auth</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
          Auth is wired for Supabase email/password. Local demo mode keeps the website usable without credentials.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {["Protect premium problem sections", "Track purchases and access", "Store practice drafts", "Attach watermark identity"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">{item}</div>
          ))}
        </div>
      </div>
      <AuthPanel />
    </main>
  );
}
