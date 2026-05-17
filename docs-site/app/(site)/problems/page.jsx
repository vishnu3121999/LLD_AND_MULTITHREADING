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
    <main className="site-container py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="blue">Solved library</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">LLD Problems</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            Start with the MVP set: Parking Lot, TicTacToe, Vending Machine, BookMyShow, and Splitwise.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/solve">
            Practice a new problem
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
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
                <div className="rounded-md bg-slate-50 p-3">
                  <span className="block text-xs text-slate-500">Difficulty</span>
                  <strong className="text-slate-900">{problem.difficulty}</strong>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <span className="block text-xs text-slate-500">Concurrency</span>
                  <strong className="text-slate-900">{problem.hasConcurrency ? "Yes" : "No"}</strong>
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
    </main>
  );
}
