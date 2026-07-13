import { notFound } from "next/navigation";
import { HldMarkdownAdminEditor } from "../../../../../../components/hld/hld-markdown-admin-editor";
import {
  getHldReusedSubproblemDoc,
  readHldReusedSubproblemMarkdown
} from "../../../../../../lib/hld-reused-subproblems-store";
import { isAdminUser, requireUser } from "../../../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getHldReusedSubproblemDoc(slug);
  return {
    title: doc ? `Edit ${doc.title} | HLD Reused Subproblems` : "Edit HLD Reused Subproblem"
  };
}

export default async function EditHldReusedSubproblemPage({ params }) {
  const { slug } = await params;
  const user = await requireUser(`/hld/reused-subproblems/${slug}/edit`);
  if (!isAdminUser(user)) notFound();

  const doc = await getHldReusedSubproblemDoc(slug);
  if (!doc) notFound();

  const source = await readHldReusedSubproblemMarkdown(doc.id);
  if (!source) notFound();

  return (
    <HldMarkdownAdminEditor
      initialProblem={doc}
      initialMarkdown={source.markdown}
      sourcePath={source.fileName}
      saveUrl={`/api/hld/reused-subproblems/${doc.id}/markdown`}
      backHref={`/hld/reused-subproblems/${doc.id}`}
      headerLabel="Admin Reused Subproblem"
      savedMessage="Saved to reused subproblem index.md"
    />
  );
}
