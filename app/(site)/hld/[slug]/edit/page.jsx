import { notFound } from "next/navigation";
import { HldEditor } from "../../../../../components/hld/hld-editor";
import { HldMarkdownAdminEditor } from "../../../../../components/hld/hld-markdown-admin-editor";
import { getHldProblem, readHldProblemMarkdown } from "../../../../../lib/hld-store";
import { isAdminUser, requireUser } from "../../../../../lib/supabase-server";

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
  const user = await requireUser(`/hld/${slug}/edit`);
  if (!isAdminUser(user)) notFound();

  const problem = await getHldProblem(slug);
  if (!problem) notFound();

  if (problem.source === "markdown") {
    const source = await readHldProblemMarkdown(problem.id);
    if (!source) notFound();

    return (
      <HldMarkdownAdminEditor
        initialProblem={problem}
        initialMarkdown={source.markdown}
        sourcePath={source.fileName}
      />
    );
  }

  return (
    <div className="hld-original">
      <main className="page">
        <HldEditor initialProblem={problem} />
      </main>
    </div>
  );
}
