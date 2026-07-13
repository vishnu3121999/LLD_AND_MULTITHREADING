# 01interview

Next.js documentation and interview-prep site with the Java source visualizer running through Next.js route handlers.

## Run

```powershell
cd 01interview
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:5173`.

The dev script starts the Next.js app on `http://127.0.0.1:5173`. Java workspace APIs are served from the same app under `/api/java/*`.

## Java Visualizer

Open `/workspace`. The Next.js Java API recursively reads `.java` files from `content/java-modules`, removes imports, constructors, getters, and setters for the visualizer view, and returns raw files for the editor-style reader view.

## Integrations

Copy `.env.example` to `.env.local` and fill keys as needed:

- Supabase for auth
- Stripe for checkout
- Algolia for hosted search
- PostHog for analytics
- Resend for newsletter contacts

Auth is server-enforced for `/workspace`, `/solve`, `/api/java/*`, and checkout. Without Supabase URL and anon key, those protected routes redirect to `/auth` or return an auth configuration error.

Search and newsletter still have local/demo fallbacks when their provider keys are missing.

## Content

- `/lld-template` renders the root `template.md`.
- `/problems` renders structured solved LLD problems from `lib/site-data.js`.
- `/roadmaps` and `/cheatsheets` are MDX pages.
- Java examples live under `content/java-modules/<module>/src/<page>`.

### Highlighting Text

The renderer does not automatically highlight tokens such as `FR-*`, `NF-*`, numbers, latencies, or units. Content appears exactly as authored unless explicit markdown or HTML styling is used.

Use `<mark>...</mark>` when a specific word, phrase, or value should be highlighted:

```md
Read latency should stay under <mark>100ms</mark>.
This depends on <mark>FR-2</mark>.
```

This also works inside structured HLD sections such as Non-Functional Requirements.

Use backticks for identifiers, code-like values, routes, keys, and formulas:

```md
Use `GET /products/{id}` and store counters in `product_stats`.
```

## Workspace Layout Storage

Workspace code-block positions, block sizes, block zoom, page zoom, constructor visibility, and folded methods are saved per signed-in Supabase user in:

```text
public.workspace_layouts
```

Run `supabase/workspace-layouts.sql` in the Supabase SQL editor before enabling this in production.

## Local Data Files

Browser `localStorage` is not used for ongoing app state. Local-only UI preferences, such as code theme and collapsed module state, are saved into:

```text
content/local-data/browser-state.json
```

On first load, old `localStorage` keys that start with `lld-docs.` or `lld-playbook.` are migrated into that file and then removed from the browser. Old local workspace layouts are used only as a fallback/import source; users should click Save layout to store them in their profile.
