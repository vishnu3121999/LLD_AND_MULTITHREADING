import { Badge } from "../../../components/ui/badge";
import { AuthPanel } from "../../../components/auth-panel";

export const metadata = {
  title: "Sign in | LLD Playbook"
};

export default function AuthPage() {
  return (
    <main className="site-container grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
      <section className="max-w-3xl">
        <Badge variant="blue">Supabase auth</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Sign In To Continue</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
          Protected areas are guarded by server-verified Supabase sessions.
        </p>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold tracking-normal text-slate-950">Protected after sign-in</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["Practice solver", "Stripe checkout session"].map((item) => (
              <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Supabase may rate-limit repeated sign-up or confirmation-email requests. If that happens, wait for the cooldown and use Sign in after confirming the email.
        </div>
      </section>
      <section>
        <AuthPanel />
      </section>
    </main>
  );
}
