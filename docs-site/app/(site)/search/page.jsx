import { Badge } from "../../../components/ui/badge";
import { SearchPanel } from "../../../components/search-panel";

export const metadata = {
  title: "Search | LLD Playbook"
};

export default function SearchPage() {
  return (
    <main className="site-container py-10">
      <div className="mb-8">
        <Badge variant="blue">Algolia-ready search</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950">Search Content</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
          Local search runs by default. Configure Algolia app ID, search key, and index to switch the API to hosted search.
        </p>
      </div>
      <div className="max-w-3xl">
        <SearchPanel />
      </div>
    </main>
  );
}
