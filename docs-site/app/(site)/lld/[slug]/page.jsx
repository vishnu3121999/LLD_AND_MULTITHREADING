import { notFound } from "next/navigation";
import { LldLessonRenderer } from "../_components/lld-lesson-renderer";
import { LldShell } from "../_components/lld-shell";
import { getLldCurriculum, getLldLesson } from "../../../../lib/lld-content-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lesson = await getLldLesson(slug);

  return {
    title: lesson ? `${lesson.title} | Low Level Design` : "Low Level Design | 01 Interview"
  };
}

export default async function LldLessonPage({ params }) {
  const { slug } = await params;
  const { modules, allLessons } = await getLldCurriculum();
  const lesson = allLessons.find((item) => item.slug === slug);
  if (!lesson) notFound();

  const lessonIndex = allLessons.findIndex((item) => item.slug === slug);
  const previous = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const next = lessonIndex >= 0 && lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;
  const headingNav = lesson.headings.map((heading) => ({
    href: `#${heading.id}`,
    label: heading.title
  }));
  const pageNav = [
    { href: "#overview", label: "Overview" },
    ...headingNav,
    { href: "#navigation", label: "Next / Previous" }
  ];

  return (
    <LldShell activeSlug={lesson.slug} modules={modules} pageNav={pageNav}>
      <LldLessonRenderer
        lesson={toPublicLesson(lesson)}
        previous={toNavLesson(previous)}
        next={toNavLesson(next)}
      />
    </LldShell>
  );
}

function toPublicLesson(lesson) {
  const { sourceDir, sourceOrder, sourcePath, ...publicLesson } = lesson;
  return publicLesson;
}

function toNavLesson(lesson) {
  if (!lesson) return null;
  return {
    slug: lesson.slug,
    title: lesson.title
  };
}
