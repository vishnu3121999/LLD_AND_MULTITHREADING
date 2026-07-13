import { BehavioralShell } from "../../../components/behavioral/behavioral-shell";
import { BehavioralStoryBuilder } from "../../../components/behavioral/story-builder";
import { getBehavioralCurriculum } from "../../../lib/behavioral-content";

export const metadata = {
  title: "Behavioral Interviews | 01 Interview"
};

export default async function BehavioralPage() {
  const curriculum = await getBehavioralCurriculum();

  return (
    <BehavioralShell activeSlug="story-builder" items={curriculum.items}>
      <BehavioralStoryBuilder />
    </BehavioralShell>
  );
}
