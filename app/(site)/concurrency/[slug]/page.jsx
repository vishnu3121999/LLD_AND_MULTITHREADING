import { notFound } from "next/navigation";
import { ConcurrencyLessonRenderer } from "../_components/concurrency-lesson-renderer";
import { ConcurrencyShell } from "../_components/concurrency-shell";
import {
  allConcurrencyLessons,
  getAdjacentConcurrencyLessons,
  getConcurrencyLesson
} from "../../../../lib/concurrency-curriculum";

export function generateStaticParams() {
  return allConcurrencyLessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = getConcurrencyLesson(slug);

  return {
    title: lesson ? `${lesson.title} | LLD Concurrency` : "Concurrency Lesson | LLD Playbook"
  };
}

export default async function ConcurrencyLessonPage({ params }) {
  const { slug } = await params;
  const lesson = getConcurrencyLesson(slug);
  if (!lesson) notFound();

  const { previous, next } = getAdjacentConcurrencyLessons(slug);
  const isProblem = lesson.kind === "problem";
  const pageNav = isProblem
    ? []
    : [
        { href: "#overview", label: "Overview" },
        ...lesson.sections.map(([title], index) => ({
          href: `#section-${index + 1}`,
          label: title
        })),
        ...(lesson.mistakes.length > 0 ? [{ href: "#mistakes", label: "Common Mistakes" }] : []),
        { href: "#navigation", label: "Next / Previous" }
      ];

  return (
    <ConcurrencyShell activeSlug={lesson.slug} pageNav={pageNav}>
      <ConcurrencyLessonRenderer
        lesson={lesson}
        previous={toNavLesson(previous)}
        next={toNavLesson(next)}
      />
    </ConcurrencyShell>
  );
}

function toNavLesson(lesson) {
  if (!lesson) return null;
  return {
    slug: lesson.slug,
    title: lesson.title
  };
}
