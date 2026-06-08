import Link from "next/link";

export default function HldLayout({ children }) {
  return (
    <div className="hld-original">
      <header className="topbar">
        <Link className="brand" href="/hld">
          <img className="brand-logo" src="/logo.png" alt="01 Interview" />
          <span className="brand-text">HLD Academy</span>
        </Link>

        <nav className="topbar-nav">
          <Link href="/hld">Library</Link>
          <Link href="/hld/markdown-guide">Markdown Guide</Link>
          <Link className="btn btn-primary" href="/hld/new">+ New Problem</Link>
        </nav>
      </header>

      <main className="page">{children}</main>
    </div>
  );
}
