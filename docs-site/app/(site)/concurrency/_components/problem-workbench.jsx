"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Braces,
  Code,
  FlaskConical,
  GripVertical,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Save,
  Terminal,
  WrapText,
  XCircle
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[420px] place-items-center bg-[var(--cor-surface)] text-sm text-[var(--cor-muted)]">
      Loading editor...
    </div>
  )
});

const workerSource = `
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const consoleEntries = [];

function format(value) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.stack || value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function capture(level) {
  return (...args) => {
    consoleEntries.push({
      level,
      message: args.map(format).join(" ")
    });
  };
}

const runnerConsole = {
  log: capture("log"),
  info: capture("info"),
  warn: capture("warn"),
  error: capture("error")
};

const assert = {
  equal(actual, expected, message) {
    if (!Object.is(actual, expected)) {
      throw new Error(message || "Expected " + format(expected) + ", received " + format(actual));
    }
  },
  deepEqual(actual, expected, message) {
    if (format(actual) !== format(expected)) {
      throw new Error(message || "Expected " + format(expected) + ", received " + format(actual));
    }
  },
  ok(value, message) {
    if (!value) {
      throw new Error(message || "Expected value to be truthy");
    }
  },
  async rejects(fn, message) {
    let rejected = false;
    try {
      await fn();
    } catch {
      rejected = true;
    }
    if (!rejected) {
      throw new Error(message || "Expected function to reject or throw");
    }
  }
};

self.onmessage = async (event) => {
  const { code, exportName, tests } = event.data;
  const results = [];

  try {
    const factory = new Function("exportName", "console", code + "\\n; return eval(exportName);");
    const exported = factory(exportName, runnerConsole);

    if (typeof exported !== "function") {
      throw new Error(exportName + " must be defined as a class or constructor function.");
    }

    const submission = { [exportName]: exported };

    for (const test of tests) {
      try {
        const runTest = new Function(
          "submission",
          "assert",
          "delay",
          "console",
          "return (async () => {\\n" + test.code + "\\n})();"
        );
        await runTest(submission, assert, delay, runnerConsole);
        results.push({ name: test.name, status: "passed" });
      } catch (error) {
        runnerConsole.error(test.name + ": " + format(error));
        results.push({
          name: test.name,
          status: "failed",
          message: error && error.message ? error.message : String(error)
        });
      }
    }

    self.postMessage({ status: "complete", results, consoleEntries });
  } catch (error) {
    runnerConsole.error(format(error));
    self.postMessage({
      status: "error",
      message: error && error.message ? error.message : String(error),
      consoleEntries
    });
  }
};
`;

const tabItems = [
  { id: "code", label: "Code", icon: Code },
  { id: "tests", label: "Tests", icon: FlaskConical },
  { id: "console", label: "Console", icon: Terminal }
];

const languageOptions = [
  { id: "javascript", label: "JavaScript", monacoLanguage: "javascript", runnable: true },
  { id: "java", label: "Java", monacoLanguage: "java", runnable: false },
  { id: "cpp", label: "C++", monacoLanguage: "cpp", runnable: false },
  { id: "python", label: "Python", monacoLanguage: "python", runnable: false }
];

const themeOptions = [
  { id: "lldCourseLight", label: "Light" },
  { id: "vs-dark", label: "Dark" },
  { id: "hc-black", label: "Contrast" }
];

const languageStorageKey = "lld-concurrency-editor-language";
const themeStorageKey = "lld-concurrency-editor-theme";

function getCodeStorageKey(slug, language) {
  return `lld-concurrency-code:${slug}:${language}`;
}

function getLanguage(languageId) {
  return languageOptions.find((language) => language.id === languageId) || languageOptions[0];
}

function getTheme(themeId) {
  return themeOptions.find((theme) => theme.id === themeId) || themeOptions[0];
}

function getDefaultEditorThemeId() {
  if (typeof document === "undefined") return "lldCourseLight";
  return document.documentElement.dataset.siteTheme === "midnight" ? "vs-dark" : "lldCourseLight";
}

function getStarterCode(problem, languageId) {
  if (languageId === "javascript") return problem.starterCode;

  if (languageId === "java") {
    return `public class ${problem.exportName} {
  public ${problem.exportName}() {
    // Initialize your state here.
  }

  // Implement the public API described in the requirements.
}`;
  }

  if (languageId === "cpp") {
    return `class ${problem.exportName} {
public:
  ${problem.exportName}() {
    // Initialize your state here.
  }

  // Implement the public API described in the requirements.
};`;
  }

  if (languageId === "python") {
    return `class ${problem.exportName}:
    def __init__(self):
        # Initialize your state here.
        pass

    # Implement the public API described in the requirements.`;
  }

  return problem.starterCode;
}

export function ProblemWorkbench({ lesson }) {
  const problem = lesson.problem;
  const editorRef = useRef(null);
  const workspaceRef = useRef(null);
  const [code, setCode] = useState(problem.starterCode);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("lldCourseLight");
  const [activeTab, setActiveTab] = useState("code");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [runError, setRunError] = useState("");
  const [consoleEntries, setConsoleEntries] = useState([]);
  const [saveState, setSaveState] = useState("Ready");
  const [loadedSavedCode, setLoadedSavedCode] = useState(false);
  const [problemWidth, setProblemWidth] = useState(43);
  const [wordWrap, setWordWrap] = useState(true);
  const [editorFullScreen, setEditorFullScreen] = useState(false);
  const currentLanguage = getLanguage(selectedLanguage);
  const currentTheme = getTheme(editorTheme);
  const codeStorageKey = getCodeStorageKey(lesson.slug, currentLanguage.id);

  const passedCount = useMemo(
    () => results.filter((result) => result.status === "passed").length,
    [results]
  );

  const runTests = useCallback(() => {
    if (!currentLanguage.runnable) {
      const message = `${currentLanguage.label} editing is enabled, but browser execution is currently available only for JavaScript. Running ${currentLanguage.label} tests requires a backend runner or a language runtime in the browser.`;
      setRunning(false);
      setRunError(message);
      setResults([]);
      setActiveTab("console");
      setConsoleEntries([{ level: "warn", message }]);
      return;
    }

    setRunning(true);
    setRunError("");
    setResults([]);
    setActiveTab("tests");
    setConsoleEntries([{ level: "info", message: "Running tests..." }]);

    const blob = new Blob([workerSource], { type: "text/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    const timeoutId = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      setRunning(false);
      setRunError("Execution timed out. Check for infinite loops or unresolved promises.");
      setConsoleEntries((current) => [
        ...current,
        { level: "error", message: "Execution timed out after 3 seconds." }
      ]);
    }, 3000);

    worker.onmessage = (event) => {
      window.clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      setRunning(false);

      const nextConsole = event.data.consoleEntries?.length
        ? event.data.consoleEntries
        : [{ level: "info", message: "No console output." }];

      if (event.data.status === "complete") {
        setResults(event.data.results);
        setConsoleEntries([
          ...nextConsole,
          {
            level: "info",
            message: `${event.data.results.filter((result) => result.status === "passed").length}/${problem.tests.length} tests passed.`
          }
        ]);
      } else {
        setRunError(event.data.message || "The submission could not be evaluated.");
        setConsoleEntries(nextConsole);
      }
    };

    worker.onerror = (error) => {
      window.clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      setRunning(false);
      setRunError(error.message || "The runner failed before tests could complete.");
      setConsoleEntries([{ level: "error", message: error.message || "The runner failed." }]);
    };

    worker.postMessage({
      code,
      exportName: problem.exportName,
      tests: problem.tests
    });
  }, [code, currentLanguage, problem.exportName, problem.tests]);

  const saveCode = useCallback(() => {
    localStorage.setItem(codeStorageKey, code);
    setSaveState("Saved");
  }, [code, codeStorageKey]);

  const formatCode = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const action = editor.getAction("editor.action.formatDocument");
    if (action) {
      await action.run();
      setCode(editor.getValue());
      setSaveState("Formatted");
    }
  }, []);

  function resetCode() {
    localStorage.removeItem(codeStorageKey);
    setCode(getStarterCode(problem, currentLanguage.id));
    setResults([]);
    setRunError("");
    setConsoleEntries([]);
    setSaveState("Starter code");
    setActiveTab("code");
  }

  function handleEditorMount(editor) {
    editorRef.current = editor;
  }

  function startResize(event) {
    if (!workspaceRef.current) return;
    event.preventDefault();
    const rect = workspaceRef.current.getBoundingClientRect();

    function handleMove(moveEvent) {
      const next = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setProblemWidth(Math.min(58, Math.max(32, next)));
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function handleLanguageChange(nextLanguageId) {
    const nextLanguage = getLanguage(nextLanguageId);
    localStorage.setItem(languageStorageKey, nextLanguage.id);
    setSelectedLanguage(nextLanguage.id);
    const nextStorageKey = getCodeStorageKey(lesson.slug, nextLanguage.id);
    const savedCode = localStorage.getItem(nextStorageKey);
    setCode(savedCode || getStarterCode(problem, nextLanguage.id));
    setResults([]);
    setRunError("");
    setConsoleEntries([]);
    setSaveState(savedCode ? "Restored" : "Starter code");
    setActiveTab("code");
  }

  function handleThemeChange(nextThemeId) {
    const nextTheme = getTheme(nextThemeId);
    localStorage.setItem(themeStorageKey, nextTheme.id);
    setEditorTheme(nextTheme.id);
  }

  useEffect(() => {
    const storedLanguage = getLanguage(localStorage.getItem(languageStorageKey));
    const storedThemeId = localStorage.getItem(themeStorageKey) || getDefaultEditorThemeId();
    const storedTheme = getTheme(storedThemeId);
    const nextStorageKey = getCodeStorageKey(lesson.slug, storedLanguage.id);
    const savedCode = localStorage.getItem(nextStorageKey);

    setSelectedLanguage(storedLanguage.id);
    setEditorTheme(storedTheme.id);

    if (savedCode) {
      setCode(savedCode);
      setSaveState("Restored");
    } else {
      setCode(getStarterCode(problem, storedLanguage.id));
      setSaveState("Starter code");
    }
    setLoadedSavedCode(true);
  }, [lesson.slug, problem]);

  useEffect(() => {
    function handleSiteThemeChange() {
      if (localStorage.getItem(themeStorageKey)) return;
      setEditorTheme(getDefaultEditorThemeId());
    }

    window.addEventListener("lld-site-theme-change", handleSiteThemeChange);
    return () => window.removeEventListener("lld-site-theme-change", handleSiteThemeChange);
  }, []);

  useEffect(() => {
    if (!loadedSavedCode) return undefined;
    setSaveState("Autosaving...");
    const timeoutId = window.setTimeout(() => {
      localStorage.setItem(codeStorageKey, code);
      setSaveState("Autosaved");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [code, codeStorageKey, loadedSavedCode]);

  useEffect(() => {
    function handleKeyDown(event) {
      const usesModifier = event.ctrlKey || event.metaKey;
      if (!usesModifier) return;

      if (event.key === "Enter") {
        event.preventDefault();
        runTests();
      }

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveCode();
      }

      if (event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        formatCode();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formatCode, runTests, saveCode]);

  const resultSummary = results.length > 0 ? `${passedCount}/${problem.tests.length}` : `0/${problem.tests.length}`;

  return (
    <section
      ref={workspaceRef}
      className={
        editorFullScreen
          ? "fixed inset-3 z-50 grid rounded-lg bg-[var(--cor-bg)] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
          : "grid gap-0 xl:grid-cols-[var(--problem-width)_10px_minmax(420px,1fr)]"
      }
      style={{ "--problem-width": `${problemWidth}%` }}
    >
      {!editorFullScreen && (
        <article
          id="problem"
          className="scroll-mt-24 rounded-l-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
        >
          <div className="border-b border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-5 py-5 sm:px-6">
            <h1 className="text-3xl font-semibold leading-tight tracking-normal text-[var(--cor-heading)]">
              {lesson.title}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--cor-muted)]">
              {lesson.summary}
            </p>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6">
            <ProblemSection title="Statement" items={problem.statement} />
            <ProblemSection title="Requirements" items={problem.requirements} ordered />

            <div id="contract" className="scroll-mt-24 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface-2)] p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cor-brand)]">
                Submit Contract
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--cor-muted)]">
                Keep the public class name as <code className="rounded bg-[var(--cor-surface)] px-1.5 py-0.5 font-mono text-xs text-[var(--cor-heading)]">{problem.exportName}</code>. The runner creates instances from that class and validates the API in the browser.
              </p>
            </div>

            <div id="interview-notes" className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-normal text-[var(--cor-heading)]">Interview notes</h2>
              <div className="mt-3 grid gap-3">
                {lesson.sections.map(([title, body]) => (
                  <div key={title} className="rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface)] p-4">
                    <h3 className="text-sm font-semibold text-[var(--cor-heading)]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--cor-muted)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      )}

      {!editorFullScreen && (
        <button
          type="button"
          onPointerDown={startResize}
          className="hidden cursor-col-resize items-center justify-center bg-transparent text-slate-300 transition hover:text-[var(--cor-brand)] xl:flex"
          aria-label="Resize problem and editor panes"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
      )}

      <aside
        id="editor"
        className={`scroll-mt-24 overflow-hidden border border-[var(--cor-border)] bg-[var(--cor-surface)] shadow-[0_8px_28px_rgba(15,23,42,0.04)] ${
          editorFullScreen
            ? "rounded-lg"
            : "rounded-r-lg xl:sticky xl:top-16 xl:max-h-[calc(100vh-4.5rem)]"
        }`}
      >
        <div className="flex flex-col gap-3 border-b border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`${lesson.slug}-language`}>
                Editor language
              </label>
              <select
                id={`${lesson.slug}-language`}
                value={currentLanguage.id}
                onChange={(event) => handleLanguageChange(event.target.value)}
                className="h-9 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] px-3 text-sm font-semibold text-[var(--cor-heading)] outline-none transition hover:border-[var(--cor-brand)] focus:border-[var(--cor-brand)]"
              >
                {languageOptions.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.label}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor={`${lesson.slug}-theme`}>
                Editor theme
              </label>
              <select
                id={`${lesson.slug}-theme`}
                value={currentTheme.id}
                onChange={(event) => handleThemeChange(event.target.value)}
                className="h-9 rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] px-3 text-sm font-semibold text-[var(--cor-heading)] outline-none transition hover:border-[var(--cor-brand)] focus:border-[var(--cor-brand)]"
              >
                {themeOptions.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={saveCode}
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] text-[var(--cor-heading)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-brand)]"
                aria-label="Save code"
                title="Save"
              >
                <Save size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={formatCode}
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] text-[var(--cor-heading)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-brand)]"
                aria-label="Format code"
                title="Format"
              >
                <Braces size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={resetCode}
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] text-[var(--cor-heading)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-brand)]"
                aria-label="Reset code"
                title="Reset"
              >
                <RotateCcw size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={runTests}
                disabled={running}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--cor-brand)] bg-[var(--cor-brand)] px-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play size={15} aria-hidden="true" />
                {running ? "Running" : "Run"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--cor-surface)] text-[var(--cor-heading)] shadow-sm"
                        : "text-[var(--cor-muted)] hover:bg-[var(--cor-surface)] hover:text-[var(--cor-heading)]"
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {tab.label}
                    {tab.id === "tests" && (
                      <span className="rounded-full border border-[var(--cor-border)] px-1.5 py-0.5 font-mono text-[10px]">
                        {resultSummary}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 text-xs text-[var(--cor-muted)]">
              <span className="mr-2 hidden sm:inline">{saveState}</span>
              <button
                type="button"
                onClick={() => setWordWrap((current) => !current)}
                className={`grid h-8 w-8 place-items-center rounded-md border transition ${
                  wordWrap
                    ? "border-[var(--cor-brand)] bg-[var(--cor-brand-soft)] text-[var(--cor-brand)]"
                    : "border-[var(--cor-border)] bg-[var(--cor-surface)] text-[var(--cor-muted)] hover:border-[var(--cor-brand)]"
                }`}
                aria-label="Toggle word wrap"
                title="Toggle word wrap"
              >
                <WrapText size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setEditorFullScreen((current) => !current)}
                className="grid h-8 w-8 place-items-center rounded-md border border-[var(--cor-border)] bg-[var(--cor-surface)] text-[var(--cor-muted)] transition hover:border-[var(--cor-brand)] hover:text-[var(--cor-brand)]"
                aria-label={editorFullScreen ? "Exit full screen editor" : "Open full screen editor"}
                title={editorFullScreen ? "Exit full screen" : "Full screen"}
              >
                {editorFullScreen ? (
                  <Minimize2 size={15} aria-hidden="true" />
                ) : (
                  <Maximize2 size={15} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={editorFullScreen ? "h-[calc(100vh-12rem)]" : "h-[calc(100vh-14.4rem)] min-h-[520px]"}>
          {activeTab === "code" && (
            <CodeEditor
              label={`${lesson.title} code editor`}
              value={code}
              onChange={setCode}
              onMount={handleEditorMount}
              language={currentLanguage.monacoLanguage}
              theme={currentTheme.id}
              wordWrap={wordWrap}
            />
          )}

          {activeTab === "tests" && (
            <TestsPanel
              problem={problem}
              results={results}
              runError={runError}
              passedCount={passedCount}
              onRun={runTests}
              running={running}
            />
          )}

          {activeTab === "console" && (
            <ConsolePanel entries={consoleEntries} />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--cor-border)] bg-[var(--cor-surface)] px-4 py-2 text-xs text-[var(--cor-muted)]">
          <span>{saveState}</span>
          <span>Ctrl/Cmd+Enter run | Ctrl/Cmd+S save | Ctrl/Cmd+Shift+F format</span>
        </div>
      </aside>
    </section>
  );
}

function CodeEditor({ label, value, onChange, onMount, language, theme, wordWrap }) {
  return (
    <MonacoEditor
      aria-label={label}
      height="100%"
      language={language}
      theme={theme}
      value={value}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("lldCourseLight", {
          base: "vs",
          inherit: true,
          rules: [
            { token: "comment", foreground: "64748b", fontStyle: "italic" },
            { token: "keyword", foreground: "6d28d9", fontStyle: "bold" },
            { token: "number", foreground: "b45309" },
            { token: "string", foreground: "047857" },
            { token: "type.identifier", foreground: "0369a1" }
          ],
          colors: {
            "editor.background": "#fbfdff",
            "editor.foreground": "#1f2937",
            "editorLineNumber.foreground": "#94a3b8",
            "editorLineNumber.activeForeground": "#4f46e5",
            "editor.selectionBackground": "#dbeafe",
            "editorCursor.foreground": "#4f46e5",
            "editor.lineHighlightBackground": "#f1f5f9"
          }
        });
      }}
      onMount={onMount}
      onChange={(nextValue) => onChange(nextValue || "")}
      options={{
        automaticLayout: true,
        bracketPairColorization: { enabled: true },
        cursorBlinking: "smooth",
        fontFamily: "JetBrains Mono, Cascadia Code, Consolas, monospace",
        fontLigatures: true,
        fontSize: 13,
        formatOnPaste: true,
        formatOnType: true,
        lineHeight: 22,
        lineNumbers: "on",
        minimap: { enabled: false },
        padding: { top: 16, bottom: 16 },
        renderWhitespace: "selection",
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        tabSize: 2,
        wordWrap: wordWrap ? "on" : "off"
      }}
    />
  );
}

function TestsPanel({ problem, results, runError, passedCount, onRun, running }) {
  const visibleResults = results.length > 0
    ? results
    : problem.tests.map((test) => ({ ...test, status: "idle" }));

  return (
    <div id="tests" className="h-full overflow-y-auto bg-[var(--cor-surface)] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--cor-heading)]">Test results</h3>
          <p className="mt-1 text-sm text-[var(--cor-muted)]">
            Sample tests run in your browser against the required class contract.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-3 py-1.5 font-mono text-xs font-bold text-[var(--cor-muted)]">
            {passedCount}/{problem.tests.length} passed
          </span>
          <button
            type="button"
            onClick={onRun}
            disabled={running}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--cor-brand)] bg-[var(--cor-brand)] px-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play size={15} aria-hidden="true" />
            {running ? "Running" : "Run"}
          </button>
        </div>
      </div>

      {runError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
          {runError}
        </div>
      )}

      <div className="mt-5 grid gap-3">
        {visibleResults.map((result) => (
          <div
            key={result.name}
            className="flex items-start gap-3 rounded-lg border border-[var(--cor-border)] bg-[var(--cor-surface-2)] px-4 py-3 text-sm"
          >
            {result.status === "passed" ? (
              <CheckCircle2 size={18} className="mt-0.5 flex-none text-[var(--cor-good)]" aria-hidden="true" />
            ) : result.status === "failed" ? (
              <XCircle size={18} className="mt-0.5 flex-none text-[var(--cor-danger)]" aria-hidden="true" />
            ) : (
              <span className="mt-1 h-4 w-4 flex-none rounded-full border border-slate-300" />
            )}
            <span className="min-w-0">
              <span className="block font-medium text-[var(--cor-heading)]">{result.name}</span>
              {result.message && (
                <span className="mt-1 block break-words text-xs leading-5 text-[var(--cor-danger)]">
                  {result.message}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsolePanel({ entries }) {
  const visibleEntries = entries.length > 0
    ? entries
    : [{ level: "info", message: "Console output from your code and the runner will appear here." }];

  return (
    <div id="console" className="h-full overflow-y-auto bg-slate-950 p-4 font-mono text-[13px] leading-6 text-slate-100">
      {visibleEntries.map((entry, index) => (
        <div key={`${index}-${entry.message}`} className="flex gap-3 border-b border-white/5 py-2 last:border-b-0">
          <span className={`w-12 flex-none uppercase ${
            entry.level === "error"
              ? "text-red-300"
              : entry.level === "warn"
                ? "text-amber-300"
                : "text-sky-300"
          }`}>
            {entry.level}
          </span>
          <span className="min-w-0 whitespace-pre-wrap break-words">{entry.message}</span>
        </div>
      ))}
    </div>
  );
}

function ProblemSection({ title, items, ordered = false }) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <div className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-normal text-[var(--cor-heading)]">{title}</h2>
      <ListTag className={`mt-3 space-y-2 text-sm leading-6 text-[var(--cor-muted)] ${ordered ? "list-decimal pl-5" : "list-disc pl-5"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}
