import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { categories, problems } from "../../../lib/site-data";

export const metadata = {
  title: "Solved LLD Problems | LLD Playbook"
};

export default function ProblemsPage() {
  return (
    <main className="site-container py-4 lg:py-5">
      <section className="overflow-hidden rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
        <div className="border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
                LLD Academy
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--site-heading)]">Problem Library</h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--site-muted)]">
                Start with the MVP set: Parking Lot, TicTacToe, Vending Machine, BookMyShow, and Splitwise.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                Browse sections
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--site-text)]">
              <Filter size={16} aria-hidden="true" />
              Categories
            </span>
            {categories.map((category) => (
              <Badge key={category} variant="default">{category}</Badge>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {problems.map((problem) => (
              <Card key={problem.slug}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>{problem.title}</CardTitle>
                    <Badge variant={problem.hasConcurrency ? "red" : "teal"}>{problem.systemType}</Badge>
                  </div>
                  <CardDescription>{problem.bestFor}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md bg-[var(--site-surface-2)] p-3">
                      <span className="block text-xs text-[var(--site-muted)]">Difficulty</span>
                      <strong className="text-[var(--site-heading)]">{problem.difficulty}</strong>
                    </div>
                    <div className="rounded-md bg-[var(--site-surface-2)] p-3">
                      <span className="block text-xs text-[var(--site-muted)]">Concurrency</span>
                      <strong className="text-[var(--site-heading)]">{problem.hasConcurrency ? "Yes" : "No"}</strong>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/problems/${problem.slug}`}>
                      Open solution
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
