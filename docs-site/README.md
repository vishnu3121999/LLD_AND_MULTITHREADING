# LLD Playbook Docs Site

Next.js documentation and interview-prep site with the Java source visualizer running through Next.js route handlers.

## Run

```powershell
cd docs-site
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

## Local Data Files

Browser `localStorage` is not used for ongoing app state. Workspace layouts, zoom levels, collapsed modules, code theme, folded methods, and demo auth state are saved into:

```text
docs-site/content/local-data/browser-state.json
```

On first load, old `localStorage` keys that start with `lld-docs.` or `lld-playbook.` are migrated into that file and then removed from the browser.
