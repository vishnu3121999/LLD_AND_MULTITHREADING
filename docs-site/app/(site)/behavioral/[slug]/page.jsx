import { notFound } from "next/navigation";
import { BehavioralQuestionPage } from "../../../../components/behavioral/behavioral-question-page";
import { BehavioralShell } from "../../../../components/behavioral/behavioral-shell";
import { BehavioralStoryBuilder } from "../../../../components/behavioral/story-builder";
import { getBehavioralCategory, getBehavioralCurriculum } from "../../../../lib/behavioral-content";

export async function generateStaticParams() {
  const curriculum = await getBehavioralCurriculum();
  return [
    { slug: "story-builder" },
    ...curriculum.categories.map((category) => ({ slug: category.slug }))
  ];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (slug === "story-builder") {
    return { title: "Story Builder | Behavioral Interviews" };
  }

  const category = await getBehavioralCategory(slug);
  return {
    title: category ? `${category.title} | Behavioral Interviews` : "Behavioral Interviews"
  };
}

export default async function BehavioralCategoryPage({ params }) {
  const { slug } = await params;
  const curriculum = await getBehavioralCurriculum();

  if (slug === "story-builder") {
    return (
      <BehavioralShell activeSlug="story-builder" items={curriculum.items}>
        <BehavioralStoryBuilder />
      </BehavioralShell>
    );
  }

  const category = curriculum.categories.find((item) => item.slug === slug);
  if (!category) notFound();

  return (
    <BehavioralShell activeSlug={category.slug} items={curriculum.items}>
      <BehavioralQuestionPage category={category} />
    </BehavioralShell>
  );
}
