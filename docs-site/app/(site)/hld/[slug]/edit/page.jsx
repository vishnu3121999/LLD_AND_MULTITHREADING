import { notFound } from "next/navigation";
import { HldEditor } from "../../../../../components/hld/hld-editor";
import { getHldProblem } from "../../../../../lib/hld-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = await getHldProblem(slug);
  return {
    title: problem ? `Edit ${problem.title} | HLD Library` : "Edit HLD Problem | LLD Playbook"
  };
}

export default async function EditHldProblemPage({ params }) {
  const { slug } = await params;
  const problem = await getHldProblem(slug);
  if (!problem) notFound();
  return <HldEditor initialProblem={problem} />;
}
