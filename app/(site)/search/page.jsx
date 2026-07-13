import { Badge } from "../../../components/ui/badge";
import { SearchPanel } from "../../../components/search-panel";

export const metadata = {
  title: "Search | LLD Playbook"
};

export default function SearchPage() {
  return (
    <main className="site-container py-4 lg:py-5">
      <section className="overflow-hidden rounded-lg border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow)]">
        <div className="border-b border-[var(--site-border)] bg-[var(--site-surface-2)] px-5 py-5 sm:px-6">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--site-brand)]">
            Site Search
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[var(--site-heading)]">Search Content</h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-[var(--site-muted)]">
            Local search runs by default. Configure Algolia app ID, search key, and index to switch the API to hosted search.
          </p>
        </div>
        <div className="max-w-4xl p-5 sm:p-6">
          <Badge variant="blue" className="mb-4">Algolia-ready search</Badge>
          <SearchPanel />
        </div>
      </section>
    </main>
  );
}
