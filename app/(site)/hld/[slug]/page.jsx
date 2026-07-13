import { notFound } from "next/navigation";
import { HldShell } from "../_components/hld-shell";
import { HldProblemRenderer } from "../../../../components/hld/hld-renderer";
import { buildHldNavGroups, buildHldPageNav } from "../../../../lib/hld-navigation";
import { listHldReusedSubproblemDocs } from "../../../../lib/hld-reused-subproblems-store";
import { getHldProblem, listHldProblems } from "../../../../lib/hld-store";
import { listHldTheoryDocs } from "../../../../lib/hld-theory-store";
import { getCurrentUser, isAdminUser } from "../../../../lib/supabase-server";

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
  const [problem, problems, theoryDocs, reusedSubproblemDocs, user] = await Promise.all([
    getHldProblem(slug),
    listHldProblems(),
    listHldTheoryDocs(),
    listHldReusedSubproblemDocs(),
    getCurrentUser()
  ]);
  if (!problem) notFound();

  return (
    <HldShell
      activeSlug={problem.id}
      groups={buildHldNavGroups(problems, theoryDocs, reusedSubproblemDocs)}
      pageNav={buildHldPageNav(problem)}
    >
      <HldProblemRenderer problem={problem} isAdmin={isAdminUser(user)} />
    </HldShell>
  );
}
