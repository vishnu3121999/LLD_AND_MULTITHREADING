import { notFound } from "next/navigation";
import { HldShell } from "../_components/hld-shell";
import { HldProblemRenderer } from "../../../../components/hld/hld-renderer";
import { buildHldNavGroups, buildHldPageNav } from "../../../../lib/hld-navigation";
import { getHldProblem, listHldProblems } from "../../../../lib/hld-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = await getHldProblem(slug);
  return {
    title: problem ? `${problem.title} | HLD Academy` : "HLD Problem | HLD Academy"
  };
}

export default async function HldProblemPage({ params }) {
  const { slug } = await params;
  const [problem, problems] = await Promise.all([
    getHldProblem(slug),
    listHldProblems()
  ]);
  if (!problem) notFound();

  return (
    <HldShell
      activeSlug={problem.id}
      groups={buildHldNavGroups(problems)}
      pageNav={buildHldPageNav(problem)}
    >
      <HldProblemRenderer problem={problem} />
    </HldShell>
  );
}
