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
    <main className="site-container py-10">
      <div className="mb-8 max-w-3xl">
        <Badge variant="amber">Stripe checkout</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Payment Gateway Integration</h1>
        <p className="mt-3 text-lg leading-8 text-slate-600">
          The checkout route uses Stripe when keys are configured and falls back to a demo redirect during local development.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-start-2">
          <CardHeader>
            <Badge variant="blue" className="w-fit">Premium</Badge>
            <CardTitle className="text-3xl">$9</CardTitle>
            <p className="text-sm leading-6 text-slate-600">One-time access for the current premium set.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check size={16} className="text-teal-700" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
            <PricingAction />
            <p className="text-xs leading-5 text-slate-500">Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to enable live checkout.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
