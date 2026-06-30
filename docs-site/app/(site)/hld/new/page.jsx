import { HldEditor } from "../../../../components/hld/hld-editor";

export const metadata = {
  title: "New HLD Problem | LLD Playbook"
};

export default function NewHldProblemPage() {
  return (
    <div className="hld-original">
      <main className="page">
        <HldEditor />
      </main>
    </div>
  );
}
