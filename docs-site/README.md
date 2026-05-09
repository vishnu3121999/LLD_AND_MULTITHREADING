# LLD Docs Site

Local documentation site with a Java source visualizer.

## Run

```powershell
cd docs-site
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:5173`.

## Add Docs

Add markdown files in `content/docs`. Restart the app to refresh the docs list.

## Java Visualizer

Paste a local folder path and scan. The backend recursively reads `.java` files and removes imports, constructors, getters, and setters before sending code blocks to the UI.
