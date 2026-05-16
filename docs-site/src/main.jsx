import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import {
  Bold,
  Code,
  Code2,
  FilePlus2,
  GitCompareArrows,
  FileCode2,
  Heading1,
  Heading2,
  Italic,
  LayoutGrid,
  List,
  ListOrdered,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Quote,
  Save,
  Sun,
  Trash2,
  Type,
  Underline
} from "lucide-react";
import "./styles.css";

hljs.registerLanguage("java", java);

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5174";
const MIN_BLOCK_WIDTH = 140;
const MIN_BLOCK_HEIGHT = 90;
const CANVAS_SIZE = 100000;

function App() {
  const appRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [siteTheme, setSiteTheme] = useState(() => normalizeSiteTheme(localStorage.getItem("lld-docs.site-theme")));
  const [codeTheme, setCodeTheme] = useState(() => normalizeCodeTheme(localStorage.getItem("lld-docs.code-theme")));
  const [javaModules, setJavaModules] = useState([]);
  const [collapsedModules, setCollapsedModules] = useState(() => JSON.parse(localStorage.getItem("lld-docs.collapsed-modules") || "{}"));
  const [selectedModule, setSelectedModule] = useState("");
  const [moduleMode, setModuleMode] = useState("java");
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedDiff, setSelectedDiff] = useState(null);
  const [javaMode, setJavaMode] = useState("page");
  const [reorganizeRequest, setReorganizeRequest] = useState(null);

  useEffect(() => {
    localStorage.setItem("lld-docs.site-theme", siteTheme);
  }, [siteTheme]);

  useEffect(() => {
    localStorage.setItem("lld-docs.code-theme", codeTheme);
  }, [codeTheme]);

  useEffect(() => {
    localStorage.setItem("lld-docs.collapsed-modules", JSON.stringify(collapsedModules));
  }, [collapsedModules]);

  useEffect(() => {
    fetch(`${API_BASE}/api/java/pages`)
      .then((response) => response.json())
      .then((payload) => {
        const modules = payload.modules || [];
        setJavaModules(modules);
        if (modules[0]?.name) setSelectedModule(modules[0].name);
        const firstPage = modules[0]?.pages?.[0] || null;
        if (firstPage) setSelectedPage(firstPage);
      })
      .catch(() => setJavaModules([]));
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    function handleKeyboard(event) {
      if (isEditableTarget(event.target)) return;

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

      if (!isFullscreen) return;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        moveFullscreenPage(1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        moveFullscreenPage(-1);
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [isFullscreen, javaModules, selectedPage]);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await appRef.current?.requestFullscreen();
  }

  function moveFullscreenPage(direction) {
    const pages = javaModules.flatMap((module) => module.pages || []);
    if (pages.length === 0) return;

    const currentIndex = Math.max(0, pages.findIndex((page) => page.id === selectedPage?.id));
    const nextIndex = (currentIndex + direction + pages.length) % pages.length;
    const nextPage = pages[nextIndex];

    setSelectedModule(nextPage.module);
    setSelectedPage(nextPage);
    setModuleMode("java");
    setJavaMode("page");
  }

  return (
    <div ref={appRef} className={`app-shell site-${siteTheme} ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <Code2 size={24} aria-hidden="true" />
            <div>
              <strong>LLD Docs</strong>
              <span>Java workspace</span>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="theme-panel">
            <button className="icon-toggle" onClick={() => setSiteTheme((value) => value === "studio" ? "midnight" : "studio")} title="Toggle site theme">
              {siteTheme === "studio" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
              <span>Site</span>
            </button>
            <button className="icon-toggle" onClick={() => setCodeTheme((value) => value === "github-dark" ? "github-light" : "github-dark")} title="Toggle code theme">
              {codeTheme === "github-dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              <span>Code</span>
            </button>
          </div>
        )}

        {!sidebarCollapsed && (
          <JavaPageNav
            modules={javaModules}
            selectedModule={selectedModule}
            moduleMode={moduleMode}
            collapsedModules={collapsedModules}
            selectedPage={selectedPage}
            selectedDiff={selectedDiff}
            javaMode={javaMode}
            onSelectModuleMode={(moduleName, mode) => {
              setSelectedModule(moduleName);
              setModuleMode(mode);
              if (mode === "java") {
                const page = javaModules.find((module) => module.name === moduleName)?.pages?.[0];
                if (page && selectedPage?.module !== moduleName) setSelectedPage(page);
              }
            }}
            onToggleModule={(moduleName) => setCollapsedModules((current) => ({ ...current, [moduleName]: !current[moduleName] }))}
            onSelectPage={(page) => {
              setSelectedModule(page.module);
              setModuleMode("java");
              setSelectedPage(page);
              setJavaMode("page");
            }}
            onSelectDiff={(diffSelection) => {
              setSelectedModule(diffSelection.module);
              setModuleMode("java");
              setSelectedPage(diffSelection.targetPage);
              setSelectedDiff(diffSelection);
              setJavaMode("diff");
            }}
            onReorganizePage={(page) => {
              setSelectedModule(page.module);
              setModuleMode("java");
              setSelectedPage(page);
              setSelectedDiff(null);
              setJavaMode("page");
              setReorganizeRequest({ pageId: page.id, requestedAt: Date.now() });
            }}
          />
        )}
      </aside>

      <main className="main-panel">
        {moduleMode === "docs"
          ? <ModuleDocsEditor moduleName={selectedModule} />
          : <JavaVisualizer javaModules={javaModules} selectedPage={selectedPage} selectedDiff={selectedDiff} mode={javaMode} codeTheme={codeTheme} reorganizeRequest={reorganizeRequest} />}
      </main>
    </div>
  );
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function JavaPageNav({ modules, selectedModule, moduleMode, collapsedModules, selectedPage, selectedDiff, javaMode, onSelectModuleMode, onToggleModule, onSelectPage, onSelectDiff, onReorganizePage }) {
  function showDiff(module, page, sourcePackage) {
    if (!sourcePackage || sourcePackage === page.packageName) return;
    onSelectDiff({
      id: `diff::${module.name}::${sourcePackage}::${page.packageName}`,
      module: module.name,
      from: sourcePackage,
      to: page.packageName,
      targetPage: page
    });
  }

  function defaultSourceFor(module, page) {
    const index = module.pages.findIndex((candidate) => candidate.id === page.id);
    return module.pages[index - 1]?.packageName
      || module.pages.find((candidate) => candidate.id !== page.id)?.packageName
      || "";
  }

  return (
    <div className="java-nav">
      <span className="nav-label">Modules</span>
      {modules.map((module) => (
        <section key={module.name} className="module-group">
          <div className="module-header">
            <button className="module-collapse-button" onClick={() => onToggleModule(module.name)} title={collapsedModules[module.name] ? "Expand module" : "Collapse module"}>
              <span aria-hidden="true">{collapsedModules[module.name] ? "+" : "-"}</span>
            </button>
            <strong>{module.name}</strong>
            <div className="module-mode-buttons">
              <button className={selectedModule === module.name && moduleMode === "java" ? "active" : ""} onClick={() => onSelectModuleMode(module.name, "java")} title="Java visualizer">
                <LayoutGrid size={14} aria-hidden="true" />
              </button>
              <button className={selectedModule === module.name && moduleMode === "docs" ? "active" : ""} onClick={() => onSelectModuleMode(module.name, "docs")} title="Docs">
                <FilePlus2 size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
          {!collapsedModules[module.name] && selectedModule === module.name && moduleMode === "java" && module.pages.map((page) => {
            const isNormalActive = javaMode === "page" && page.id === selectedPage?.id;
            const isDiffActive = javaMode === "diff" && selectedDiff?.targetPage?.id === page.id;
            const sourceOptions = module.pages.filter((candidate) => candidate.id !== page.id);
            const sourcePackage = isDiffActive ? selectedDiff.from : defaultSourceFor(module, page);
            const previousPage = findPreviousPage(modules, page);

            return (
              <div key={page.id} className={`package-entry ${isNormalActive || isDiffActive ? "active" : ""}`}>
                <div className="package-row">
                  <button className="package-name-button" onClick={() => onSelectPage(page)}>
                    <span>{page.title}</span>
                    <small>{page.count}</small>
                  </button>
                  <button
                    className="package-action-button"
                    onClick={() => onReorganizePage(page)}
                    disabled={!previousPage}
                    title={previousPage ? `Reorganize from ${previousPage.title}` : "No previous package"}
                    aria-label={previousPage ? `Reorganize from ${previousPage.title}` : "No previous package"}
                  >
                    <LayoutGrid size={14} aria-hidden="true" />
                  </button>
                  <button
                    className={isDiffActive ? "active package-action-button package-diff-button" : "package-action-button package-diff-button"}
                    onClick={() => showDiff(module, page, sourcePackage)}
                    disabled={sourceOptions.length === 0}
                    title="Diff"
                    aria-label="Diff"
                  >
                    <GitCompareArrows size={14} aria-hidden="true" />
                  </button>
                </div>

                {isDiffActive && (
                  <label className="source-picker">
                    <span>Source</span>
                    <select value={selectedDiff.from} onChange={(event) => showDiff(module, page, event.target.value)}>
                      {sourceOptions.map((sourcePage) => (
                        <option key={sourcePage.id} value={sourcePage.packageName}>
                          {sourcePage.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function ModuleDocsEditor({ moduleName }) {
  const editorRef = useRef(null);
  const [versions, setVersions] = useState([]);
  const [version, setVersion] = useState("");
  const [draftName, setDraftName] = useState("");
  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!moduleName) return;
    refreshVersions();
  }, [moduleName]);

  useEffect(() => {
    if (!moduleName || !version) {
      setHtml("");
      return;
    }

    fetch(`${API_BASE}/api/module-docs/${moduleName}/${version}`)
      .then((response) => response.ok ? response.json() : { html: "" })
      .then((payload) => setHtml(payload.html || ""))
      .catch(() => setHtml(""));
  }, [moduleName, version]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  useEffect(() => {
    if (!moduleName || !version) return;
    const timeout = window.setTimeout(() => {
      saveDoc("Autosaved");
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [html, moduleName, version]);

  async function refreshVersions() {
    const response = await fetch(`${API_BASE}/api/module-docs?module=${encodeURIComponent(moduleName)}`);
    const payload = await response.json();
    setVersions(payload.versions || []);
    const first = payload.versions?.[0] || "";
    setVersion((current) => current && payload.versions?.includes(current) ? current : first);
  }

  async function prefillTemplate() {
    const response = await fetch(`${API_BASE}/api/module-docs/template?module=${encodeURIComponent(moduleName)}`);
    const payload = await response.json();
    setHtml(payload.html || "");
    setStatus("Template loaded");
  }

  async function saveDoc(successStatus = "Saved") {
    const name = version || draftName.trim();
    if (!name) {
      setStatus("Create or select a version first");
      return;
    }

    const body = {
      module: moduleName,
      version: name,
      html: editorRef.current?.innerHTML || ""
    };

    const response = await fetch(`${API_BASE}/api/module-docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      setStatus("Save failed");
      return;
    }

    setVersion(name);
    setDraftName("");
    await refreshVersions();
    setStatus(successStatus);
  }

  async function createVersion() {
    const name = draftName.trim();
    if (!name) {
      setStatus("Enter a version name");
      return;
    }
    setVersion(name);
    setHtml("");
    setStatus("New version ready");
  }

  async function deleteVersion() {
    if (!version) return;
    if (!window.confirm(`Are you sure you want to delete ${moduleName}/${version}?`)) return;

    await fetch(`${API_BASE}/api/module-docs/${moduleName}/${version}`, { method: "DELETE" });
    setVersion("");
    setHtml("");
    await refreshVersions();
    setStatus("Deleted");
  }

  function format(command, value = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setHtml(editorRef.current?.innerHTML || "");
  }

  return (
    <section className="docs-editor-view">
      <div className="docs-editor-topbar">
        <div className="version-controls">
          <strong>{moduleName || "Module"} Docs</strong>
          <select value={version} onChange={(event) => setVersion(event.target.value)}>
            <option value="">Select version</option>
            {versions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="new-version" />
          <button onClick={createVersion}><FilePlus2 size={16} aria-hidden="true" /> New</button>
          <button onClick={prefillTemplate}><Type size={16} aria-hidden="true" /> Template</button>
          <button onClick={saveDoc}><Save size={16} aria-hidden="true" /> Save</button>
          <button className="danger-button" onClick={deleteVersion} disabled={!version}><Trash2 size={16} aria-hidden="true" /> Delete</button>
        </div>
        <span>{status}</span>
      </div>

      <div className="format-toolbar">
        <button onClick={() => format("bold")}><Bold size={16} /></button>
        <button onClick={() => format("italic")}><Italic size={16} /></button>
        <button onClick={() => format("underline")}><Underline size={16} /></button>
        <button onClick={() => format("formatBlock", "h1")}><Heading1 size={16} /></button>
        <button onClick={() => format("formatBlock", "h2")}><Heading2 size={16} /></button>
        <button onClick={() => format("insertUnorderedList")}><List size={16} /></button>
        <button onClick={() => format("insertOrderedList")}><ListOrdered size={16} /></button>
        <button onClick={() => format("formatBlock", "blockquote")}><Quote size={16} /></button>
        <button onClick={() => format("formatBlock", "pre")}><Code size={16} /></button>
      </div>

      <article
        ref={editorRef}
        className="rich-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={() => setHtml(editorRef.current?.innerHTML || "")}
      />
    </section>
  );
}

function JavaVisualizer({ javaModules, selectedPage, selectedDiff, mode, codeTheme, reorganizeRequest }) {
  const [pageData, setPageData] = useState(null);
  const [layouts, setLayouts] = useState({});
  const [constructorVisibility, setConstructorVisibility] = useState(() => readJsonStorage("lld-docs.show-constructors", {}));
  const [collapsedMethods, setCollapsedMethods] = useState(() => readJsonStorage("lld-docs.collapsed-methods", {}));
  const [parentZoom, setParentZoom] = useState(1);
  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeLayoutPageId = mode === "diff" ? selectedDiff?.targetPage?.id : selectedPage?.id;

  useEffect(() => {
    const activeSelection = mode === "diff" ? selectedDiff?.targetPage : selectedPage;
    if (!activeSelection) return;

    const targetParams = new URLSearchParams({
      module: activeSelection.module,
      package: activeSelection.packageName
    });

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/java/page?${targetParams.toString()}`)
      .then(async (response) => {
        const targetPage = await response.json();
        if (!response.ok) throw new Error(targetPage.error || "Unable to load page");

        if (mode !== "diff") {
          setPageData(targetPage);
          return;
        }

        const diffParams = new URLSearchParams({
          module: selectedDiff.module,
          from: selectedDiff.from,
          to: selectedDiff.to
        });

        const diffResponse = await fetch(`${API_BASE}/api/java/diff?${diffParams.toString()}`);
        const diffPage = await diffResponse.json();
        if (!diffResponse.ok) throw new Error(diffPage.error || "Unable to load diff");

        setPageData(mergeTargetWithDiff(targetPage, diffPage));
      })
      .catch((pageError) => {
        setError(pageError.message);
        setPageData(null);
      })
      .finally(() => setLoading(false));
  }, [selectedPage, selectedDiff, mode]);

  useEffect(() => {
    if (!activeLayoutPageId || !pageData?.files) return;
    const saved = localStorage.getItem(layoutStorageKey(activeLayoutPageId));
    if (saved) {
      setLayouts(JSON.parse(saved));
      return;
    }
    setLayouts(buildInitialLayouts(pageData.files));
  }, [activeLayoutPageId, pageData?.files]);

  useEffect(() => {
    if (!activeLayoutPageId) return;
    const saved = localStorage.getItem(parentZoomStorageKey(activeLayoutPageId));
    setParentZoom(saved ? Number(saved) || 1 : 1);
  }, [activeLayoutPageId]);

  useEffect(() => {
    if (!activeLayoutPageId || Object.keys(layouts).length === 0) return;
    localStorage.setItem(layoutStorageKey(activeLayoutPageId), JSON.stringify(layouts));
  }, [layouts, activeLayoutPageId]);

  useEffect(() => {
    if (!activeLayoutPageId) return;
    localStorage.setItem(parentZoomStorageKey(activeLayoutPageId), String(parentZoom));
  }, [parentZoom, activeLayoutPageId]);

  useEffect(() => {
    localStorage.setItem("lld-docs.show-constructors", JSON.stringify(constructorVisibility));
  }, [constructorVisibility]);

  useEffect(() => {
    localStorage.setItem("lld-docs.collapsed-methods", JSON.stringify(collapsedMethods));
  }, [collapsedMethods]);

  useEffect(() => {
    function handleZoom(event) {
      if (!event.ctrlKey || event.altKey || event.metaKey) return;
      const direction = zoomDirection(event);
      if (direction === 0) return;

      event.preventDefault();

      if (hoveredBlockId) {
        setLayouts((current) => {
          const layout = current[hoveredBlockId];
          if (!layout) return current;
          return {
            ...current,
            [hoveredBlockId]: {
              ...layout,
              zoom: clampZoom((layout.zoom || 1) + direction * 0.1)
            }
          };
        });
        return;
      }

      setParentZoom((current) => clampParentZoom(current + direction * 0.1));
    }

    window.addEventListener("keydown", handleZoom);
    return () => window.removeEventListener("keydown", handleZoom);
  }, [hoveredBlockId]);

  const files = pageData?.files || [];

  useEffect(() => {
    if (mode !== "page" || !selectedPage || !reorganizeRequest) return;
    if (reorganizeRequest.pageId !== selectedPage.id || files.length === 0) return;
    reorganizeFromPreviousPackage(selectedPage);
  }, [reorganizeRequest, mode, selectedPage?.id, files]);

  function toggleConstructors(fileId) {
    if (!activeLayoutPageId) return;
    const storageKey = constructorVisibilityKey(activeLayoutPageId, fileId);
    setConstructorVisibility((current) => ({
      ...current,
      [storageKey]: !current[storageKey]
    }));
  }

  function toggleMethodFold(fileId, methodKey) {
    if (!activeLayoutPageId) return;
    const storageKey = methodFoldStorageKey(activeLayoutPageId, fileId, methodKey);
    setCollapsedMethods((current) => ({
      ...current,
      [storageKey]: !current[storageKey]
    }));
  }

  function reorganizeFromPreviousPackage(targetPage) {
    const previousPage = findPreviousPage(javaModules, targetPage);
    if (!previousPage || !activeLayoutPageId || files.length === 0) return;

    const previousLayouts = readJsonStorage(layoutStorageKey(previousPage.id), {});
    const nextLayouts = buildLayoutsFromPreviousPackage(files, previousLayouts);
    setLayouts(nextLayouts);

    const previousZoom = localStorage.getItem(parentZoomStorageKey(previousPage.id));
    if (previousZoom) setParentZoom(Number(previousZoom) || 1);
  }

  return (
    <section className={`visualizer-view theme-${codeTheme}`}>
      {error && <div className="error-banner">{error}</div>}

      <CodeWorkspace
        files={files}
        deletedFiles={pageData?.deletedFiles || []}
        layouts={layouts}
        activePageId={activeLayoutPageId}
        constructorVisibility={constructorVisibility}
        collapsedMethods={collapsedMethods}
        parentZoom={parentZoom}
        onLayoutChange={(fileId, layout) => setLayouts((current) => ({ ...current, [fileId]: layout }))}
        onHoverBlock={setHoveredBlockId}
        onToggleConstructors={toggleConstructors}
        onToggleMethodFold={toggleMethodFold}
      />
    </section>
  );
}

function CodeWorkspace({ files, deletedFiles, layouts, activePageId, constructorVisibility, collapsedMethods, parentZoom, onLayoutChange, onHoverBlock, onToggleConstructors, onToggleMethodFold }) {
  const workspaceRef = useRef(null);

  if (!files.length) {
    return (
      <div className="empty-workspace">
        <FileCode2 size={28} aria-hidden="true" />
        <span>Select a Java package page to load code blocks.</span>
      </div>
    );
  }

  return (
    <div className="workspace" ref={workspaceRef}>
      {deletedFiles.length > 0 && <DeletedFilesPanel files={deletedFiles} />}
      <div className="workspace-grid" style={{ width: `${CANVAS_SIZE * parentZoom}px`, height: `${CANVAS_SIZE * parentZoom}px` }}>
        <div className="workspace-content" style={{ transform: `scale(${parentZoom})`, width: `${CANVAS_SIZE}px`, height: `${CANVAS_SIZE}px` }}>
          {files.map((file, index) => {
            const layout = layouts[file.id] || defaultLayout(index);
            const visibilityKey = constructorVisibilityKey(activePageId, file.id);
            const hasConstructorToggle = Boolean(file.codeWithConstructors || file.diffLinesWithConstructors);
            const canToggleConstructors = Boolean(file.hasConstructors && hasConstructorToggle);
            return (
              <DraggableCodeBlock
                key={file.id}
                file={file}
                layout={layout}
                showConstructors={Boolean(constructorVisibility[visibilityKey])}
                hasConstructorToggle={hasConstructorToggle}
                canToggleConstructors={canToggleConstructors}
                activePageId={activePageId}
                collapsedMethods={collapsedMethods}
                parentZoom={parentZoom}
                workspaceRef={workspaceRef}
                onHover={(value) => onHoverBlock(value ? file.id : null)}
                onLayoutChange={(nextLayout) => onLayoutChange(file.id, nextLayout)}
                onToggleConstructors={() => onToggleConstructors(file.id)}
                onToggleMethodFold={(methodKey) => onToggleMethodFold(file.id, methodKey)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DeletedFilesPanel({ files }) {
  return (
    <aside className="deleted-files-panel">
      <strong>Deleted files</strong>
      <ul>
        {files.map((file) => (
          <li key={file.relativePath}>{file.relativePath}</li>
        ))}
      </ul>
    </aside>
  );
}

function DraggableCodeBlock({ file, layout, showConstructors, hasConstructorToggle, canToggleConstructors, activePageId, collapsedMethods, parentZoom, workspaceRef, onHover, onLayoutChange, onToggleConstructors, onToggleMethodFold }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const displayedCode = showConstructors && file.codeWithConstructors ? file.codeWithConstructors : file.code;
  const displayedDiffLines = showConstructors && file.diffLinesWithConstructors ? file.diffLinesWithConstructors : file.diffLines;
  const highlightedCode = useMemo(() => {
    if (displayedDiffLines) return renderDiffHtml(displayedDiffLines);
    return "";
  }, [displayedDiffLines]);
  const foldableCode = useMemo(() => {
    if (file.diffLines) return null;
    return buildFoldableCode(displayedCode);
  }, [displayedCode, file.diffLines]);
  const codeFontSize = Math.round(Math.min(32, Math.max(8, (10 + layout.width / 125 + layout.height / 240) * (layout.zoom || 1))));

  function startDrag(event) {
    if (event.target.closest(".resize-handle")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: layout.x,
      originY: layout.y
    };
  }

  function moveDrag(event) {
    if (!dragRef.current) return;
    const next = {
      ...layout,
      x: dragRef.current.originX + (event.clientX - dragRef.current.startX) / parentZoom,
      y: dragRef.current.originY + (event.clientY - dragRef.current.startY) / parentZoom
    };
    onLayoutChange(clampToWorkspace(next, workspaceRef.current));
  }

  function endDrag() {
    dragRef.current = null;
  }

  function startResize(event, edges) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      edges,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...layout }
    };
  }

  function moveResize(event) {
    if (!resizeRef.current) return;

    const { edges, startX, startY, origin } = resizeRef.current;
    const dx = (event.clientX - startX) / parentZoom;
    const dy = (event.clientY - startY) / parentZoom;
    const next = { ...origin };

    if (edges.includes("e")) {
      next.width = Math.max(MIN_BLOCK_WIDTH, origin.width + dx);
    }

    if (edges.includes("s")) {
      next.height = Math.max(MIN_BLOCK_HEIGHT, origin.height + dy);
    }

    if (edges.includes("w")) {
      const width = Math.max(MIN_BLOCK_WIDTH, origin.width - dx);
      next.x = origin.x + origin.width - width;
      next.width = width;
    }

    if (edges.includes("n")) {
      const height = Math.max(MIN_BLOCK_HEIGHT, origin.height - dy);
      next.y = origin.y + origin.height - height;
      next.height = height;
    }

    onLayoutChange(clampToWorkspace(next, workspaceRef.current));
  }

  function endResize() {
    resizeRef.current = null;
  }

  function handleCodeWheel(event) {
    const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX;
    if (horizontalDelta === 0) return;

    const target = event.currentTarget;
    const maxScrollLeft = target.scrollWidth - target.clientWidth;
    if (maxScrollLeft <= 0) return;

    const nextScrollLeft = Math.min(Math.max(0, target.scrollLeft + horizontalDelta), maxScrollLeft);
    target.scrollLeft = nextScrollLeft;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <article
      className={`code-block status-${file.status || "normal"} ${hasConstructorToggle ? "has-constructor-toggle" : ""}`}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      title={file.relativePath}
      style={{
        transform: `translate(${layout.x}px, ${layout.y}px)`,
        width: `${layout.width}px`,
        height: `${layout.height}px`
      }}
    >
      {hasConstructorToggle && (
        <button
          className={`constructor-toggle-button ${showConstructors && canToggleConstructors ? "active" : ""} ${canToggleConstructors ? "" : "unavailable"}`}
          type="button"
          aria-pressed={showConstructors && canToggleConstructors}
          title={canToggleConstructors ? showConstructors ? "Hide constructors" : "Show constructors" : "No constructors found"}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            if (!canToggleConstructors) return;
            onToggleConstructors();
          }}
        >
          C
        </button>
      )}
      <pre
        className={`code-pre hljs ${file.diffLines ? "diff-pre" : ""}`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={handleCodeWheel}
        style={{ fontSize: `${codeFontSize}px` }}
      >
        {file.diffLines ? (
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        ) : (
          <code className="code-lines">
            {renderFoldableCode({
              foldableCode,
              activePageId,
              fileId: file.id,
              collapsedMethods,
              onToggleMethodFold
            })}
          </code>
        )}
      </pre>
      {["n", "ne", "e", "se", "s", "sw", "w", "nw"].map((handle) => (
        <span
          key={handle}
          className={`resize-handle resize-${handle}`}
          onPointerDown={(event) => startResize(event, handle)}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        />
      ))}
    </article>
  );
}

function clampToWorkspace(layout, workspace) {
  const width = Math.max(MIN_BLOCK_WIDTH, layout.width);
  const height = Math.max(MIN_BLOCK_HEIGHT, layout.height);
  const maxX = Math.max(16, (workspace?.scrollWidth || CANVAS_SIZE) - 80);
  const maxY = Math.max(16, (workspace?.scrollHeight || CANVAS_SIZE) - 80);

  return {
    ...layout,
    width,
    height,
    zoom: layout.zoom || 1,
    x: Math.min(Math.max(16, layout.x), maxX),
    y: Math.min(Math.max(16, layout.y), maxY)
  };
}

function buildInitialLayouts(files) {
  return Object.fromEntries(files.map((file, index) => [file.id, defaultLayout(index)]));
}

function buildLayoutsFromPreviousPackage(files, previousLayouts) {
  return Object.fromEntries(files.map((file, index) => {
    const previousLayout = previousLayouts[file.id];
    return [file.id, previousLayout ? { ...previousLayout } : defaultLayout(index)];
  }));
}

function findPreviousPage(modules, selectedPage) {
  if (!selectedPage) return null;
  const module = modules.find((candidate) => candidate.name === selectedPage.module);
  const pages = module?.pages || [];
  const index = pages.findIndex((page) => page.id === selectedPage.id);
  if (index <= 0) return null;
  return pages[index - 1];
}

function defaultLayout(index) {
  const column = index % 3;
  const row = Math.floor(index / 3);
  return {
    x: 24 + column * 620,
    y: 24 + row * 500,
    width: 560,
    height: 420,
    zoom: 1
  };
}

function layoutStorageKey(pageId) {
  return `lld-docs.layouts.${pageId}`;
}

function parentZoomStorageKey(pageId) {
  return `lld-docs.parentZoom.${pageId}`;
}

function constructorVisibilityKey(pageId, fileId) {
  return `${pageId || "unknown"}::${fileId}`;
}

function methodFoldStorageKey(pageId, fileId, methodKey) {
  return `${pageId || "unknown"}::${fileId}::${methodKey}`;
}

function readJsonStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
}

function buildFoldableCode(code) {
  const lines = code.split("\n");
  const highlightedLines = lines.map((line) => hljs.highlight(line || " ", { language: "java" }).value);
  const foldsByStart = new Map(findFoldableMethods(code).map((fold) => [fold.startLine, fold]));
  return { lines, highlightedLines, foldsByStart };
}

function renderFoldableCode({ foldableCode, activePageId, fileId, collapsedMethods, onToggleMethodFold }) {
  if (!foldableCode) return null;

  const rendered = [];
  const hiddenLines = new Set();

  for (let lineIndex = 0; lineIndex < foldableCode.lines.length; lineIndex += 1) {
    if (hiddenLines.has(lineIndex)) continue;

    const fold = foldableCode.foldsByStart.get(lineIndex);
    const isCollapsed = fold ? Boolean(collapsedMethods[methodFoldStorageKey(activePageId, fileId, fold.key)]) : false;

    rendered.push(
      <span key={`line-${lineIndex}`} className={`code-line ${fold ? "foldable-code-line" : ""}`}>
        {fold ? (
          <button
            className="method-fold-button"
            type="button"
            aria-label={isCollapsed ? "Expand method" : "Collapse method"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Expand method" : "Collapse method"}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMethodFold(fold.key);
            }}
          >
            {isCollapsed ? "+" : "-"}
          </button>
        ) : (
          <span className="method-fold-spacer" aria-hidden="true" />
        )}
        <span className="code-line-content" dangerouslySetInnerHTML={{ __html: foldableCode.highlightedLines[lineIndex] || " " }} />
      </span>
    );

    if (fold && isCollapsed) {
      for (let hiddenIndex = lineIndex + 1; hiddenIndex < fold.endLine; hiddenIndex += 1) {
        hiddenLines.add(hiddenIndex);
      }

      rendered.push(
        <span key={`fold-${lineIndex}`} className="code-fold-placeholder">
          <span className="method-fold-spacer" aria-hidden="true" />
          <span className="code-line-content">...</span>
        </span>
      );
    }
  }

  return rendered;
}

function findFoldableMethods(source) {
  const masked = maskJavaCommentsAndStrings(source);
  const folds = [];

  for (let index = 0; index < masked.length; index += 1) {
    if (masked[index] !== "{") continue;

    const signatureStart = findJavaSignatureStart(masked, index);
    if (signatureStart < 0) continue;

    const signature = source.slice(signatureStart, index).trim();
    if (!looksLikeJavaMethodSignature(signature)) continue;

    const close = findJavaMatchingBrace(masked, index);
    if (close < 0) continue;

    const declarationStart = methodDeclarationStartOffset(source, signatureStart, index);
    const startLine = lineNumberAt(source, declarationStart);
    const openLine = lineNumberAt(source, index);
    const endLine = lineNumberAt(source, close);
    if (endLine <= openLine) {
      index = close;
      continue;
    }

    folds.push({
      key: methodFoldKey(signature),
      startLine,
      endLine
    });
    index = close;
  }

  return folds;
}

function methodFoldKey(signature) {
  return signature.replace(/\s+/g, " ").slice(0, 180);
}

function methodDeclarationStartOffset(source, signatureStart, braceIndex) {
  const signature = source.slice(signatureStart, braceIndex);
  let cursor = signatureStart;

  for (const line of signature.split("\n")) {
    const firstNonSpace = line.search(/\S/);
    const trimmed = line.trim();
    const lineStart = cursor;
    cursor += line.length + 1;

    if (!trimmed || trimmed.startsWith("@")) continue;
    return firstNonSpace >= 0 ? lineStart + firstNonSpace : lineStart;
  }

  return signatureStart;
}

function lineNumberAt(source, offset) {
  let line = 0;
  for (let index = 0; index < offset; index += 1) {
    if (source[index] === "\n") line += 1;
  }
  return line;
}

function findJavaSignatureStart(masked, braceIndex) {
  let index = braceIndex - 1;
  while (index >= 0 && /\s/.test(masked[index])) index -= 1;
  if (index < 0 || masked[index] !== ")") return -1;

  while (index >= 0) {
    const char = masked[index];
    if (char === ";" || char === "}" || char === "{") return skipJavaWhitespace(masked, index + 1);
    index -= 1;
  }

  return skipJavaWhitespace(masked, 0);
}

function skipJavaWhitespace(source, start) {
  let index = start;
  while (index < source.length && /\s/.test(source[index])) index += 1;
  return index;
}

function findJavaMatchingBrace(masked, openIndex) {
  let depth = 0;
  for (let index = openIndex; index < masked.length; index += 1) {
    if (masked[index] === "{") depth += 1;
    if (masked[index] === "}") depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function looksLikeJavaMethodSignature(signature) {
  const normalized = signature.replace(/\s+/g, " ");
  if (!normalized.includes("(") || !normalized.includes(")")) return false;
  if (/\b(if|for|while|switch|catch|try|synchronized|do|else|new|class|interface|enum|record)\b/.test(normalized)) return false;
  return /[\w>\]\)]\s+\w+\s*\([^)]*\)$|^\s*(public|protected|private)?\s*\w+\s*\([^)]*\)$/.test(normalized);
}

function maskJavaCommentsAndStrings(source) {
  const chars = Array.from(source);
  let state = "code";

  for (let index = 0; index < chars.length; index += 1) {
    const current = chars[index];
    const next = chars[index + 1];

    if (state === "code") {
      if (current === "/" && next === "/") {
        chars[index] = " ";
        state = "lineComment";
      } else if (current === "/" && next === "*") {
        chars[index] = " ";
        chars[index + 1] = " ";
        index += 1;
        state = "blockComment";
      } else if (current === "\"") {
        chars[index] = " ";
        state = "string";
      } else if (current === "'") {
        chars[index] = " ";
        state = "char";
      }
    } else if (state === "lineComment") {
      if (current === "\n") {
        state = "code";
      } else {
        chars[index] = " ";
      }
    } else if (state === "blockComment") {
      chars[index] = " ";
      if (current === "*" && next === "/") {
        chars[index + 1] = " ";
        index += 1;
        state = "code";
      }
    } else if (state === "string") {
      chars[index] = " ";
      if (current === "\\" && next) {
        chars[index + 1] = " ";
        index += 1;
      } else if (current === "\"") {
        state = "code";
      }
    } else if (state === "char") {
      chars[index] = " ";
      if (current === "\\" && next) {
        chars[index + 1] = " ";
        index += 1;
      } else if (current === "'") {
        state = "code";
      }
    }
  }

  return chars.join("");
}

function zoomDirection(event) {
  if (event.key === "+" || event.key === "=") return 1;
  if (event.key === "-" || event.key === "_") return -1;
  return 0;
}

function clampZoom(value) {
  return Math.min(2.5, Math.max(0.5, Number(value.toFixed(2))));
}

function clampParentZoom(value) {
  return Math.min(2, Math.max(0.25, Number(value.toFixed(2))));
}

function mergeTargetWithDiff(targetPage, diffPage) {
  const deletedFiles = diffPage.files
    .filter((file) => file.status === "removed")
    .map((file) => ({
      fileName: file.fileName,
      relativePath: file.relativePath
    }));

  const diffByPath = new Map(
    diffPage.files
      .filter((file) => file.status !== "removed")
      .map((file) => [file.relativePath, file])
  );

  return {
    ...targetPage,
    mode: "diff",
    diff: {
      from: diffPage.from,
      to: diffPage.to,
      changed: diffPage.count
    },
    deletedFiles,
    files: targetPage.files.map((file) => {
      const diffFile = diffByPath.get(file.relativePath);
      if (!diffFile) return { ...file, status: "unchanged" };
      return {
        ...file,
        status: diffFile.status,
        hasConstructors: file.hasConstructors || diffFile.hasConstructors,
        diffLines: diffFile.diffLines,
        diffLinesWithConstructors: diffFile.diffLinesWithConstructors
      };
    })
  };
}

function renderDiffHtml(diffLines) {
  return diffLines.map((line) => {
    if (line.type === "separator") {
      return `<span class="diff-line diff-separator">...</span>`;
    }

    const marker = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
    return `<span class="diff-line diff-${line.type}"><span class="diff-marker">${marker}</span>${escapeHtml(line.text)}</span>`;
  }).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeSiteTheme(value) {
  if (value === "midnight") return "midnight";
  return "studio";
}

function normalizeCodeTheme(value) {
  if (value === "light") return "github-light";
  if (value === "dark") return "github-dark";
  if (value === "github-light") return "github-light";
  return "github-dark";
}

createRoot(document.getElementById("root")).render(<App />);
