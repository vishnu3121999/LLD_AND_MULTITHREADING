import DocsWorkspace from "../../../src/main.jsx";

export const metadata = {
  title: "Java Workspace | LLD Playbook"
};

export default function WorkspacePage() {
  return (
    <main className="workspace-route border-t border-[var(--site-border)] bg-[var(--site-bg)]">
      <DocsWorkspace />
    </main>
  );
}
