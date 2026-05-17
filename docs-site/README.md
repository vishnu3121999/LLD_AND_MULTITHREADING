# LLD Playbook Docs Site

Next.js documentation and interview-prep site with the existing Java source visualizer preserved.

## Run

```powershell
cd docs-site
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:5173`.

The dev script starts:

- Next.js frontend on `http://127.0.0.1:5173`
- Existing Java/docs API on `http://127.0.0.1:5174`

## Java Visualizer

Open `/workspace`. The backend recursively reads `.java` files and removes imports, constructors, getters, and setters before sending code blocks to the UI.

## Integrations

Copy `.env.example` to `.env.local` and fill keys as needed:

- Supabase for auth
- Stripe for checkout
- Algolia for hosted search
- PostHog for analytics
- Resend for newsletter contacts

Without keys, auth, checkout, search, and newsletter features run in local demo/fallback mode.

## Content

- `/lld-template` renders the root `template.md`.
- `/problems` renders structured solved LLD problems from `lib/site-data.js`.
- `/roadmaps` and `/cheatsheets` are MDX pages.

## Local Data Files

Browser `localStorage` is not used for ongoing app state. Workspace layouts, zoom levels, collapsed modules, code theme, folded methods, and demo auth state are saved into:

```text
docs-site/content/local-data/browser-state.json
```

On first load, old `localStorage` keys that start with `lld-docs.` or `lld-playbook.` are migrated into that file and then removed from the browser.

Module docs created from the workspace Docs tab are saved as HTML versions under:

```text
docs-site/content/module-docs/<module>/<version>.html
```
