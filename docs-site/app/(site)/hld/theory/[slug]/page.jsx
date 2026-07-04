import { notFound } from "next/navigation";
import { HldShell } from "../../_components/hld-shell";
import { HldTheoryRenderer } from "../../../../../components/hld/hld-theory-renderer";
import { buildHldNavGroups, buildHldTheoryPageNav } from "../../../../../lib/hld-navigation";
import { listHldProblems } from "../../../../../lib/hld-store";
import { getHldTheoryDoc, listHldTheoryDocs } from "../../../../../lib/hld-theory-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getHldTheoryDoc(slug);
  return {
    title: doc ? `${doc.title} | HLD Theory` : "HLD Theory | 01 Interview"
  };
}

export default async function HldTheoryPage({ params }) {
  const { slug } = await params;
  const [doc, problems, theoryDocs] = await Promise.all([
    getHldTheoryDoc(slug),
    listHldProblems(),
    listHldTheoryDocs()
  ]);

  if (!doc) notFound();

  return (
    <HldShell
      activeSlug={`theory:${doc.id}`}
      groups={buildHldNavGroups(problems, theoryDocs)}
      pageNav={buildHldTheoryPageNav(doc)}
    >
      <HldTheoryRenderer doc={doc} />
    </HldShell>
  );
}
