import { Check } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { PricingAction } from "../../../components/pricing-action";

export const metadata = {
  title: "Pricing | LLD Playbook"
};

export default function PricingPage() {
  const features = [
    "Full protected code skeletons",
    "Premium solved problems",
    "Guided practice workspace",
    "Pattern decision notes",
    "Newsletter updates"
  ];

  return (
    <main className="site-container py-4 lg:py-5">
      <section className="overflow-hidden rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
        <div className="border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-5 py-5 sm:px-6">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
            Subscription
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--site-heading)]">Payment Gateway Integration</h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--site-muted)]">
            The checkout route uses Stripe when keys are configured and falls back to a demo redirect during local development.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-[var(--site-border)] bg-[var(--site-surface-2)] p-5">
            <Badge variant="amber">Stripe checkout</Badge>
            <h2 className="mt-4 text-xl font-semibold text-[var(--site-heading)]">Launch-ready premium access</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--site-muted)]">
              Keep the pricing surface compact and consistent with the learning pages while checkout configuration remains environment-driven.
            </p>
          </div>

          <Card>
            <CardHeader>
              <Badge variant="blue" className="w-fit">Premium</Badge>
              <CardTitle className="text-3xl">$9</CardTitle>
              <p className="text-sm leading-6 text-[var(--site-muted)]">One-time access for the current premium set.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[var(--site-text)]">
                    <Check size={16} className="text-[var(--site-good)]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <PricingAction />
              <p className="text-xs leading-5 text-[var(--site-muted)]">Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to enable live checkout.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
