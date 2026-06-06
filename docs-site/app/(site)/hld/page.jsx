import Link from "next/link";
import { listHldProblems } from "../../../lib/hld-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "HLD Academy — Library"
};

export default async function HldLibraryPage() {
  const problems = await listHldProblems();

  return (
    <>
      <section className="hero">
        <h1>Master High-Level Design</h1>
        <p>A library of system design problems written like real interview docs — with diagrams, deep dives, and trade-offs.</p>
        <Link className="btn btn-primary btn-lg" href="/hld/new">+ Author a new problem</Link>
      </section>

      <section className="library">
        <h2>Library</h2>
        {problems.length > 0 ? (
          <div className="card-grid">
            {problems.map((problem) => (
              <Link className="problem-card" href={`/hld/${problem.id}`} key={problem.id}>
                <div className="problem-card-tags">
                  {problem.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
                </div>
                <h3>{problem.title}</h3>
                <p>{problem.summary}</p>
                <div className="problem-card-foot">
                  <span>Updated {problem.updated_at ? problem.updated_at.slice(0, 10) : ""}</span>
                  <span className="arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>No problems yet. Click <strong>+ New Problem</strong> to write your first one.</p>
          </div>
        )}
      </section>
    </>
  );
}