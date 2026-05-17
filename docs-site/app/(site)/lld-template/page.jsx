import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getTemplateHtml } from "../../../lib/template-content";
import { templateSteps } from "../../../lib/site-data";

export const metadata = {
  title: "LLD Template | LLD Playbook"
};

export default function TemplatePage() {
  const html = getTemplateHtml();

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="site-container grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
          <div>
            <Badge variant="teal">Master reference</Badge>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-slate-950">Verbose LLD Interview Template</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              This page renders the template file from the workspace and turns it into the reference structure used across problem pages.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/solve">
                  Use in practice
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/problems">Open solved examples</Link>
              </Button>
            </div>
          </div>
          <Card className="shadow-none">
            <CardHeader>
              <FileText className="text-blue-700" size={24} aria-hidden="true" />
              <CardTitle>Template Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {templateSteps.slice(0, 10).map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-2">
                    <span className="grid h-6 w-6 place-items-center rounded bg-slate-950 text-xs font-semibold text-white">{index + 1}</span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="site-container py-10">
        <article className="prose-template max-w-5xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft md:p-8" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </main>
  );
}
