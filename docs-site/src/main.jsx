"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import {
  ChevronDown,
  ChevronRight,
  GitCompareArrows,
  FileCode2,
  FolderTree,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from "lucide-react";
import { fileStorageGetItem, fileStorageSetItem, migrateLegacyBrowserStorage } from "../lib/file-storage-client";

hljs.registerLanguage("java", java);

const API_BASE = "";
const SITE_THEME_STORAGE_KEY = "lld-playbook.site-theme";
const MIN_BLOCK_WIDTH = 140;
const MIN_BLOCK_HEIGHT = 90;
const CANVAS_SIZE = 100000;

export default function App() {
  const appRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [siteTheme, setSiteTheme] = useState("studio");
  const [codeTheme, setCodeTheme] = useState("github-dark");
  const [javaModules, setJavaModules] = useState([]);
  const [collapsedModules, setCollapsedModules] = useState({});
  const [workspacePrefsReady, setWorkspacePrefsReady] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [workspaceMode, setWorkspaceMode] = useState("visualizer");
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedDiff, setSelectedDiff] = useState(null);
  const [javaMode, setJavaMode] = useState("page");
  const [reorganizeRequest, setReorganizeRequest] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspacePrefs() {
      await migrateLegacyBrowserStorage();
      const [storedSiteTheme, storedCodeTheme, storedCollapsedModules] = await Promise.all([
        fileStorageGetItem(SITE_THEME_STORAGE_KEY),
        fileStorageGetItem("lld-docs.code-theme"),
        fileStorageGetItem("lld-docs.collapsed-modules")
      ]);

      if (cancelled) return;
      setSiteTheme(normalizeSiteTheme(storedSiteTheme));
      setCodeTheme(normalizeCodeTheme(storedCodeTheme));
      setCollapsedModules(parseJsonValue(storedCollapsedModules, {}));
      setWorkspacePrefsReady(true);
    }

    loadWorkspacePrefs();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function syncSiteTheme(event) {
      const nextTheme = event.detail?.theme;
      if (nextTheme) setSiteTheme(normalizeSiteTheme(nextTheme));
    }

    window.addEventListener("lld-site-theme-change", syncSiteTheme);
    return () => {
      window.removeEventListener("lld-site-theme-change", syncSiteTheme);
    };
  }, []);

  useEffect(() => {
    if (!workspacePrefsReady) return;
    fileStorageSetItem("lld-docs.code-theme", codeTheme);
  }, [codeTheme, workspacePrefsReady]);

  useEffect(() => {
    if (!workspacePrefsReady) return;
    fileStorageSetItem("lld-docs.collapsed-modules", JSON.stringify(collapsedModules));
  }, [collapsedModules, workspacePrefsReady]);

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
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await appRef.current?.requestFullscreen();
    } catch {
      // Fullscreen can be blocked by the browser if not triggered by a direct user gesture.
    }
  }

  function moveFullscreenPage(direction) {
    const pages = javaModules.flatMap((module) => module.pages || []);
    if (pages.length === 0) return;

    const currentIndex = Math.max(0, pages.findIndex((page) => page.id === selectedPage?.id));
    const nextIndex = (currentIndex + direction + pages.length) % pages.length;
    const nextPage = pages[nextIndex];

    setSelectedModule(nextPage.module);
    setSelectedPage(nextPage);
    setWorkspaceMode("visualizer");
    setJavaMode("page");
  }

  return (
    <div ref={appRef} className={`app-shell site-${siteTheme} ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          {!sidebarCollapsed && (
            <button className="icon-toggle" onClick={() => setCodeTheme((value) => value === "github-dark" ? "github-light" : "github-dark")} title="Toggle code theme">
              {codeTheme === "github-dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              <span>Code theme</span>
            </button>
          )}
          {!sidebarCollapsed && (
            <div className="workspace-mode-buttons" aria-label="Workspace mode">
              <button className={workspaceMode === "visualizer" ? "active" : ""} onClick={() => setWorkspaceMode("visualizer")} title="Java visualizer">
                <LayoutGrid size={16} aria-hidden="true" />
              </button>
              <button className={workspaceMode === "reader" ? "active" : ""} onClick={() => setWorkspaceMode("reader")} title="Editor view">
                <FolderTree size={16} aria-hidden="true" />
              </button>
            </div>
          )}
          {!sidebarCollapsed && (
            <button className="sidebar-toggle" onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
              {isFullscreen ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
            </button>
          )}
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <JavaPageNav
            modules={javaModules}
            selectedModule={selectedModule}
            workspaceMode={workspaceMode}
            collapsedModules={collapsedModules}
            selectedPage={selectedPage}
            selectedDiff={selectedDiff}
            javaMode={javaMode}
            onToggleModule={(moduleName) => setCollapsedModules((current) => ({ ...current, [moduleName]: !current[moduleName] }))}
            onSelectPage={(page) => {
              setSelectedModule(page.module);
              setSelectedPage(page);
              setSelectedDiff(null);
              setJavaMode("page");
            }}
            onSelectDiff={(diffSelection) => {
              setSelectedModule(diffSelection.module);
              setWorkspaceMode("visualizer");
              setSelectedPage(diffSelection.targetPage);
              setSelectedDiff(diffSelection);
              setJavaMode("diff");
            }}
            onReorganizePage={(page) => {
              setSelectedModule(page.module);
              setWorkspaceMode("visualizer");
              setSelectedPage(page);
              setSelectedDiff(null);
              setJavaMode("page");
              setReorganizeRequest({ pageId: page.id, requestedAt: Date.now() });
            }}
          />
        )}
      </aside>

      <main className="main-panel">
        {workspaceMode === "reader"
          ? <JavaCodeReader selectedPage={selectedPage} codeTheme={codeTheme} />
          : <JavaVisualizer javaModules={javaModules} selectedPage={selectedPage} selectedDiff={selectedDiff} mode={javaMode} codeTheme={codeTheme} reorganizeRequest={reorganizeRequest} prefsReady={workspacePrefsReady} />}
      </main>
    </div>
  );
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function JavaPageNav({ modules, selectedModule, workspaceMode, collapsedModules, selectedPage, selectedDiff, javaMode, onToggleModule, onSelectPage, onSelectDiff, onReorganizePage }) {
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
            <button className="module-title-button" onClick={() => onToggleModule(module.name)} title={collapsedModules[module.name] ? "Expand module" : "Collapse module"}>
              {collapsedModules[module.name] ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
              <strong>{formatModuleTitle(module.name)}</strong>
            </button>
          </div>
          {!collapsedModules[module.name] && module.pages.map((page) => {
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

                {workspaceMode === "visualizer" && isDiffActive && (
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

function formatModuleTitle(name) {
  return name
    .replace(/^\d+_?/, "")
    .replaceAll("_", " ")
    .trim() || name;
}

function JavaCodeReader({ selectedPage, codeTheme }) {
  const [pageData, setPageData] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedPage) {
      setPageData(null);
      setSelectedFileId("");
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({
      module: selectedPage.module,
      package: selectedPage.packageName
    });

    setLoading(true);
    setError("");
    setPageData(null);
    setSelectedFileId("");

    fetch(`${API_BASE}/api/java/page?${params.toString()}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load files");
        if (cancelled) return;
        setPageData(payload);
        setSelectedFileId(payload.files?.[0]?.id || "");
      })
      .catch((readerError) => {
        if (cancelled) return;
        setError(readerError.message);
        setPageData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPage?.id]);

  const isCurrentReaderPage = pageData?.id === selectedPage?.id;
  const files = isCurrentReaderPage ? pageData?.files || [] : [];
  const selectedFile = files.find((file) => file.id === selectedFileId) || files[0] || null;
  const highlightedCode = useMemo(() => {
    if (!selectedFile) return "";
    return hljs.highlight(selectedFile.rawCode || selectedFile.codeWithConstructors || selectedFile.code || "", { language: "java" }).value;
  }, [selectedFile]);

  if (!selectedPage) {
    return (
      <section className="code-reader-view empty-workspace">
        <FileCode2 size={28} aria-hidden="true" />
        <span>Select a Java package to open the editor view.</span>
      </section>
    );
  }

  return (
    <section className={`code-reader-view theme-${codeTheme}`}>
      <aside className="reader-file-pane">
        <div className="reader-file-pane-header">
          <strong>{selectedPage.packageName}</strong>
          <span>{files.length} files</span>
        </div>
        {loading && <div className="reader-status">Loading files...</div>}
        {error && <div className="reader-status error-text">{error}</div>}
        {!loading && !error && (
          <FileTree files={files} selectedFileId={selectedFile?.id || ""} onSelectFile={setSelectedFileId} />
        )}
      </aside>

      <section className="reader-editor-pane">
        {selectedFile ? (
          <>
            <div className="reader-editor-tab">
              <FileCode2 size={16} aria-hidden="true" />
              <span>{selectedFile.relativePath}</span>
            </div>
            <pre className="reader-code-pre code-pre hljs">
              <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            </pre>
          </>
        ) : (
          <div className="reader-empty-state">Select a file to view source.</div>
        )}
      </section>
    </section>
  );
}

function FileTree({ files, selectedFileId, onSelectFile }) {
  const tree = useMemo(() => buildFileTree(files), [files]);
  return (
    <div className="reader-file-tree">
      {tree.map((node) => (
        <FileTreeNode key={node.path} node={node} selectedFileId={selectedFileId} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
}

function FileTreeNode({ node, selectedFileId, onSelectFile, depth = 0 }) {
  if (node.type === "folder") {
    return (
      <div>
        <div className="reader-tree-folder" style={{ paddingLeft: `${8 + depth * 14}px` }}>
          <ChevronDown size={14} aria-hidden="true" />
          <span>{node.name}</span>
        </div>
        {node.children.map((child) => (
          <FileTreeNode key={child.path} node={child} selectedFileId={selectedFileId} onSelectFile={onSelectFile} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <button
      className={`reader-tree-file ${selectedFileId === node.file.id ? "active" : ""}`}
      style={{ paddingLeft: `${24 + depth * 14}px` }}
      onClick={() => onSelectFile(node.file.id)}
      title={node.file.relativePath}
    >
      <span>{node.name}</span>
    </button>
  );
}

function buildFileTree(files) {
  const root = [];
  const folders = new Map();

  for (const file of files) {
    const parts = file.relativePath.split("/");
    let current = root;
    let currentPath = "";

    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (index === parts.length - 1) {
        current.push({ type: "file", name: part, path: currentPath, file });
        continue;
      }

      let folder = folders.get(currentPath);
      if (!folder) {
        folder = { type: "folder", name: part, path: currentPath, children: [] };
        folders.set(currentPath, folder);
        current.push(folder);
      }

      current = folder.children;
    }
  }

  return sortTree(root);
}

function sortTree(nodes) {
  return nodes
    .map((node) => node.type === "folder" ? { ...node, children: sortTree(node.children) } : node)
    .sort((left, right) => {
      if (left.type !== right.type) return left.type === "folder" ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
}

function JavaVisualizer({ javaModules, selectedPage, selectedDiff, mode, codeTheme, reorganizeRequest, prefsReady }) {
  const [pageData, setPageData] = useState(null);
  const [layouts, setLayouts] = useState({});
  const [layoutsPageId, setLayoutsPageId] = useState(null);
  const [layoutsSource, setLayoutsSource] = useState("empty");
  const [constructorVisibility, setConstructorVisibility] = useState({});
  const [collapsedMethods, setCollapsedMethods] = useState({});
  const [parentZoom, setParentZoom] = useState(1);
  const [parentZoomSource, setParentZoomSource] = useState("empty");
  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeLayoutPageId = mode === "diff" ? selectedDiff?.targetPage?.id : selectedPage?.id;

  useEffect(() => {
    const activeSelection = mode === "diff" ? selectedDiff?.targetPage : selectedPage;
    if (!activeSelection) {
      setPageData(null);
      return;
    }

    let cancelled = false;

    const targetParams = new URLSearchParams({
      module: activeSelection.module,
      package: activeSelection.packageName
    });

    setLoading(true);
    setError("");
    setPageData(null);

    fetch(`${API_BASE}/api/java/page?${targetParams.toString()}`)
      .then(async (response) => {
        const targetPage = await response.json();
        if (!response.ok) throw new Error(targetPage.error || "Unable to load page");
        if (cancelled) return;

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
        if (cancelled) return;

        setPageData(mergeTargetWithDiff(targetPage, diffPage));
      })
      .catch((pageError) => {
        if (cancelled) return;
        setError(pageError.message);
        setPageData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPage, selectedDiff, mode]);

  useEffect(() => {
    if (!prefsReady) return;
    let cancelled = false;

    async function loadGlobalVisualizerPrefs() {
      const [storedConstructorVisibility, storedCollapsedMethods] = await Promise.all([
        fileStorageGetItem("lld-docs.show-constructors"),
        fileStorageGetItem("lld-docs.collapsed-methods")
      ]);

      if (cancelled) return;
      setConstructorVisibility(parseJsonValue(storedConstructorVisibility, {}));
      setCollapsedMethods(parseJsonValue(storedCollapsedMethods, {}));
    }

    loadGlobalVisualizerPrefs();
    return () => {
      cancelled = true;
    };
  }, [prefsReady]);

  useEffect(() => {
    setLayouts({});
    setLayoutsPageId(null);
    setLayoutsSource("empty");
    setParentZoomSource("empty");
  }, [activeLayoutPageId]);

  useEffect(() => {
    if (!prefsReady || !activeLayoutPageId || !pageData?.files) return;
    if (pageData.id !== activeLayoutPageId) return;
    let cancelled = false;

    async function loadLayouts() {
      const saved = await fileStorageGetItem(layoutStorageKey(activeLayoutPageId));
      if (cancelled) return;
      if (saved) {
        setLayouts(parseJsonValue(saved, {}));
        setLayoutsPageId(activeLayoutPageId);
        setLayoutsSource("saved");
        return;
      }
      setLayouts(buildInitialLayouts(pageData.files));
      setLayoutsPageId(activeLayoutPageId);
      setLayoutsSource("generated");
    }

    loadLayouts();
    return () => {
      cancelled = true;
    };
  }, [prefsReady, activeLayoutPageId, pageData?.files]);

  useEffect(() => {
    if (!prefsReady || !activeLayoutPageId) return;
    let cancelled = false;

    async function loadParentZoom() {
      const saved = await fileStorageGetItem(parentZoomStorageKey(activeLayoutPageId));
      if (!cancelled) {
        setParentZoom(saved ? Number(saved) || 1 : 1);
        setParentZoomSource(saved ? "saved" : "generated");
      }
    }

    loadParentZoom();
    return () => {
      cancelled = true;
    };
  }, [prefsReady, activeLayoutPageId]);

  useEffect(() => {
    if (!prefsReady || layoutsSource === "generated" || !activeLayoutPageId || layoutsPageId !== activeLayoutPageId || Object.keys(layouts).length === 0) return;
    fileStorageSetItem(layoutStorageKey(activeLayoutPageId), JSON.stringify(layouts));
  }, [layouts, layoutsPageId, layoutsSource, activeLayoutPageId, prefsReady]);

  useEffect(() => {
    if (!prefsReady || parentZoomSource === "generated" || !activeLayoutPageId) return;
    fileStorageSetItem(parentZoomStorageKey(activeLayoutPageId), String(parentZoom));
  }, [parentZoom, parentZoomSource, activeLayoutPageId, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    fileStorageSetItem("lld-docs.show-constructors", JSON.stringify(constructorVisibility));
  }, [constructorVisibility, prefsReady]);

  useEffect(() => {
    if (!prefsReady) return;
    fileStorageSetItem("lld-docs.collapsed-methods", JSON.stringify(collapsedMethods));
  }, [collapsedMethods, prefsReady]);

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
          setLayoutsSource("user");
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

      setParentZoomSource("user");
      setParentZoom((current) => clampParentZoom(current + direction * 0.1));
    }

    window.addEventListener("keydown", handleZoom);
    return () => window.removeEventListener("keydown", handleZoom);
  }, [hoveredBlockId]);

  const isCurrentVisualizerPage = pageData?.id === activeLayoutPageId;
  const files = isCurrentVisualizerPage ? pageData?.files || [] : [];

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

  async function reorganizeFromPreviousPackage(targetPage) {
    const previousPage = findPreviousPage(javaModules, targetPage);
    if (!previousPage || !activeLayoutPageId || files.length === 0) return;

    const previousLayouts = await readJsonFileStorage(layoutStorageKey(previousPage.id), {});
    const nextLayouts = buildLayoutsFromPreviousPackage(files, previousLayouts);
    setLayouts(nextLayouts);
    setLayoutsPageId(activeLayoutPageId);
    setLayoutsSource("user");

    const previousZoom = await fileStorageGetItem(parentZoomStorageKey(previousPage.id));
    if (previousZoom) {
      setParentZoom(Number(previousZoom) || 1);
      setParentZoomSource("user");
    }
  }

  return (
    <section className={`visualizer-view theme-${codeTheme}`}>
      {error && <div className="error-banner">{error}</div>}

      <CodeWorkspace
        files={files}
        deletedFiles={isCurrentVisualizerPage ? pageData?.deletedFiles || [] : []}
        layouts={layouts}
        activePageId={activeLayoutPageId}
        constructorVisibility={constructorVisibility}
        collapsedMethods={collapsedMethods}
        parentZoom={parentZoom}
        onLayoutChange={(fileId, layout) => {
          if (layoutsPageId !== activeLayoutPageId) return;
          setLayoutsSource("user");
          setLayouts((current) => ({ ...current, [fileId]: layout }));
        }}
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

async function readJsonFileStorage(key, fallback) {
  return parseJsonValue(await fileStorageGetItem(key), fallback);
}

function parseJsonValue(value, fallback) {
  try {
    return JSON.parse(value || "null") || fallback;
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

if (typeof document !== "undefined") {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  }
}
