import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { ContentProtection } from "../../../../components/content-protection";
import { getProblem, problems } from "../../../../lib/site-data";

export function generateStaticParams() {
  return problems.map((problem) => ({ slug: problem.slug }));
}

export function generateMetadata({ params }) {
  const problem = getProblem(params.slug);
  return {
    title: problem ? `${problem.title} | LLD Playbook` : "Problem | LLD Playbook"
  };
}

export default function ProblemPage({ params }) {
  const problem = getProblem(params.slug);
  if (!problem) notFound();

  return (
    <main className="site-container py-8">
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/problems">
          <ArrowLeft size={16} aria-hidden="true" />
          Problems
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            {["Overview", "Actors", "Entities", "Services", "Patterns", "Concurrency", "Code", "Mistakes"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                {item}
              </a>
            ))}
          </div>
        </aside>

        <article className="min-w-0">
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap gap-2">
              <Badge variant="blue">{problem.category}</Badge>
              <Badge variant={problem.hasConcurrency ? "red" : "teal"}>{problem.systemType}</Badge>
              <Badge variant="amber">{problem.difficulty}</Badge>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">{problem.title}</h1>
            <p className="mt-3 text-lg leading-8 text-slate-600">{problem.overview}</p>
          </div>

          <Tabs defaultValue="learning">
            <TabsList>
              <TabsTrigger value="learning">Learning Mode</TabsTrigger>
              <TabsTrigger value="interview">Interview Mode</TabsTrigger>
            </TabsList>

            <TabsContent value="learning" className="space-y-6">
              <Section id="overview" title="Problem Understanding">
                <p>{problem.bestFor}</p>
              </Section>
              <GridSection id="actors" title="Actors and Use Cases" items={problem.actors} />
              <GridSection id="entities" title="Core Entities" items={problem.entities} />
              <GridSection id="services" title="Service / Facade APIs" items={problem.services} mono />
              <GridSection id="patterns" title="Extensibility and Patterns" items={problem.patterns} />
              <GridSection id="concurrency" title="Concurrency Handling" items={problem.concurrency} />
            </TabsContent>

            <TabsContent value="interview" className="space-y-6">
              <Section id="interview" title="Interview Answer">
                <p>
                  I will model {problem.entities.slice(0, 5).join(", ")} and expose the main use cases through a service layer. The design is {problem.systemType.toLowerCase()} and {problem.hasConcurrency ? "needs explicit protection around shared mutable state" : "can start with a single-threaded flow"}.
                </p>
                <p>
                  I will use {problem.patterns.join(", ")} where behavior varies, and keep entities responsible for their own state transitions.
                </p>
              </Section>
            </TabsContent>
          </Tabs>

          <section id="code" className="mt-6 rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-semibold tracking-normal text-slate-950">Code Skeleton</h2>
            </div>
            <ContentProtection watermark={problem.title}>
              <pre className="overflow-auto rounded-b-lg bg-slate-950 p-5 text-sm leading-6 text-slate-100"><code>{problem.code}</code></pre>
            </ContentProtection>
          </section>

          <GridSection id="mistakes" title="Common Mistakes" items={problem.mistakes} className="mt-6" />
        </article>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LockKeyhole className="text-amber-700" size={20} aria-hidden="true" />
                <CardTitle className="text-base">Premium Protection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Protected sections add watermarking, disabled selection, copy/context-menu friction, and route hooks for auth and payment checks.</p>
              <p>No browser control can fully stop determined copying; the goal is to reduce casual copying and protect premium access paths.</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/pricing">View plans</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function GridSection({ id, title, items, mono = false, className = "" }) {
  return (
    <section id={id} className={`rounded-lg border border-slate-200 bg-white p-5 ${className}`}>
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className={`rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 ${mono ? "font-mono" : ""}`}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
