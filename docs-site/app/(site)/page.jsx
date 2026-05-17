import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, BrainCircuit, Code2, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { NewsletterForm } from "../../components/newsletter-form";
import { SearchPanel } from "../../components/search-panel";
import { problems, stackItems, templateSteps } from "../../lib/site-data";

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container grid min-h-[calc(100vh-4rem)] gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:py-12">
          <div className="max-w-3xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
              <BrainCircuit size={16} aria-hidden="true" />
              Template-based LLD practice
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                Solve LLD problems with one reusable interview framework.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Move from vague problem statements to requirements, actors, entities, services, patterns, concurrency risks, code skeletons, and interview-ready answers.
              </p>
            </div>
            <SearchPanel compact />
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/solve">
                  Start practice
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/problems">
                  Explore problems
                  <BookOpen size={18} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-100 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 size={18} aria-hidden="true" />
                <strong>LLD solution frame</strong>
              </div>
              <Badge variant="blue">MVP</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {templateSteps.slice(0, 12).map((step, index) => (
                <div key={step} className="rounded-md border border-slate-800 bg-slate-900 p-3">
                  <span className="text-xs text-slate-400">Step {index + 1}</span>
                  <p className="mt-1 text-sm font-medium leading-5 text-slate-100">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Solved Problem Library</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Each solution uses the same structure so users learn the thinking process, not just the answer.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/problems">
              View all
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {problems.slice(0, 5).map((problem) => (
            <Card key={problem.slug}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{problem.title}</CardTitle>
                  <Badge variant={problem.hasConcurrency ? "red" : "teal"}>{problem.difficulty}</Badge>
                </div>
                <CardDescription>{problem.bestFor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {problem.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/problems/${problem.slug}`}>
                    Open solution
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="site-container grid gap-6 py-12 lg:grid-cols-3">
          <Card className="shadow-none">
            <CardHeader>
              <Boxes className="text-teal-700" size={24} aria-hidden="true" />
              <CardTitle>Template Engine</CardTitle>
              <CardDescription>The root template is rendered as the master reference and reused across problem pages.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <ShieldCheck className="text-blue-700" size={24} aria-hidden="true" />
              <CardTitle>Premium Guardrails</CardTitle>
              <CardDescription>Auth, payments, rate-limit hooks, watermarking, and casual copy friction are wired for protected sections.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <Search className="text-amber-700" size={24} aria-hidden="true" />
              <CardTitle>Search and Analytics</CardTitle>
              <CardDescription>Search has local results now and can switch to Algolia. PostHog loads when project keys are configured.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="site-container grid gap-6 py-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Production Stack</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">The app is scaffolded around the requested stack while preserving the existing Java visualizer and docs editor.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stackItems.map((item) => (
            <div key={item.layer} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm text-slate-950">{item.layer}</strong>
                <Badge variant="blue">{item.tool}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="site-container grid gap-6 py-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">
              <LockKeyhole size={16} aria-hidden="true" />
              Premium updates
            </div>
            <h2 className="text-2xl font-semibold tracking-normal">Get new solved problems and pattern notes.</h2>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
