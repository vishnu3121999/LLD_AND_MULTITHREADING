import { notFound } from "next/navigation";
import DocsWorkspace from "../../../../../src/main.jsx";
import { getJavaModules } from "../../../../../lib/java-workspace/java-workspace";

export async function generateStaticParams() {
  const modules = await getJavaModules();
  return modules.flatMap((module) => (
    module.pages.map((page) => ({
      module: page.module,
      packageName: page.packageName
    }))
  ));
}

export async function generateMetadata({ params }) {
  const routeParams = await params;
  const moduleName = decodePathParam(routeParams.module);
  const packageName = decodePathParam(routeParams.packageName);

  return {
    title: `${packageName} | ${formatModuleTitle(moduleName)} | Java Workspace`
  };
}

export default async function WorkspacePackagePage({ params }) {
  const routeParams = await params;
  const moduleName = decodePathParam(routeParams.module);
  const packageName = decodePathParam(routeParams.packageName);
  const modules = await getJavaModules();
  const page = modules
    .find((module) => module.name === moduleName)
    ?.pages.find((candidate) => candidate.packageName === packageName);

  if (!page) notFound();

  return (
    <main className="workspace-route border-t border-[var(--site-border)] bg-[var(--site-bg)]">
      <DocsWorkspace initialModule={page.module} initialPackage={page.packageName} />
    </main>
  );
}

function decodePathParam(value) {
  try {
    return decodeURIComponent(value || "");
  } catch {
    return value || "";
  }
}

function formatModuleTitle(name) {
  return name
    .replace(/^\d+_?/, "")
    .replaceAll("_", " ")
    .trim() || name;
}
