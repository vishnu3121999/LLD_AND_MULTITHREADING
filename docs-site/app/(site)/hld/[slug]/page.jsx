import { notFound } from "next/navigation";
import { HldProblemRenderer } from "../../../../components/hld/hld-renderer";
import { getHldProblem } from "../../../../lib/hld-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = await getHldProblem(slug);
  return {
    title: problem ? `${problem.title} — HLD Academy` : "HLD Problem — HLD Academy"
  };
}

export default async function HldProblemPage({ params }) {
  const { slug } = await params;
  const problem = await getHldProblem(slug);
  if (!problem) notFound();

  return <HldProblemRenderer problem={problem} />;
}