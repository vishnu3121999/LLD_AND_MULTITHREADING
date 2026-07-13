# Local Data

Runtime UI state that used to live in browser localStorage is stored in `browser-state.json`.

The file is created automatically by `/api/local-data` for local-only preferences such as code theme and collapsed module state.

Workspace code-block layouts are now saved per signed-in user in Supabase through `/api/workspace/layout`. Existing local layout data can still be loaded as a fallback, then saved into the user's profile with the workspace Save layout button.
