import DocsWorkspace from "../../../src/main.jsx";

export const metadata = {
  title: "Java Workspace | LLD Playbook"
};

export default function WorkspacePage() {
  return (
    <main className="workspace-route border-t border-slate-200 bg-slate-50">
      <DocsWorkspace />
    </main>
  );
}
