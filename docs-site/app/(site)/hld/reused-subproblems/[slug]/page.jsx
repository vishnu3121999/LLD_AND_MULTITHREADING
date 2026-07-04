import { notFound } from "next/navigation";
import { HldShell } from "../../_components/hld-shell";
import { HldTheoryRenderer } from "../../../../../components/hld/hld-theory-renderer";
import { buildHldNavGroups, buildHldTheoryPageNav } from "../../../../../lib/hld-navigation";
import { getHldReusedSubproblemDoc, listHldReusedSubproblemDocs } from "../../../../../lib/hld-reused-subproblems-store";
import { listHldProblems } from "../../../../../lib/hld-store";
import { listHldTheoryDocs } from "../../../../../lib/hld-theory-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getHldReusedSubproblemDoc(slug);
  return {
    title: doc ? `${doc.title} | HLD Reused Subproblems` : "HLD Reused Subproblem | 01 Interview"
  };
}

export default async function HldReusedSubproblemPage({ params }) {
  const { slug } = await params;
  const [doc, problems, theoryDocs, reusedSubproblemDocs] = await Promise.all([
    getHldReusedSubproblemDoc(slug),
    listHldProblems(),
    listHldTheoryDocs(),
    listHldReusedSubproblemDocs()
  ]);

  if (!doc) notFound();

  return (
    <HldShell
      activeSlug={`reused-subproblems:${doc.id}`}
      groups={buildHldNavGroups(problems, theoryDocs, reusedSubproblemDocs)}
      pageNav={buildHldTheoryPageNav(doc)}
    >
      <HldTheoryRenderer doc={doc} label="Reused Subproblem" />
    </HldShell>
  );
}
