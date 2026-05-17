import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { patternCards } from "../../../lib/site-data";

export const metadata = {
  title: "Pattern Decision Guide | LLD Playbook"
};

export default function PatternsPage() {
  return (
    <main className="site-container py-10">
      <div className="mb-8">
        <Badge variant="amber">Decision guide</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Pattern Decision Cards</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
          Use patterns only when they protect an extensibility point or simplify state transitions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {patternCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>Interview decision checklist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong className="text-sm text-slate-950">Use when</strong>
                <ul className="mt-2 space-y-2">
                  {card.useWhen.map((item) => (
                    <li key={item} className="rounded-md bg-teal-50 p-2 text-sm text-teal-900">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong className="text-sm text-slate-950">Avoid when</strong>
                <ul className="mt-2 space-y-2">
                  {card.avoidWhen.map((item) => (
                    <li key={item} className="rounded-md bg-red-50 p-2 text-sm text-red-900">{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
