import { Badge } from "../../../components/ui/badge";
import { SolveWorkspace } from "../../../components/solve-workspace";

export const metadata = {
  title: "Practice Solver | LLD Playbook"
};

export default function SolvePage() {
  return (
    <main className="site-container py-10">
      <div className="mb-8">
        <Badge variant="teal">Interactive template solver</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Solve a New LLD Problem</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
          Convert a vague prompt into actors, entities, APIs, extensibility points, concurrency risks, and a compact interview answer.
        </p>
      </div>
      <SolveWorkspace />
    </main>
  );
}
