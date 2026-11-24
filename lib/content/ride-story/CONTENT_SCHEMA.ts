export type Metric = { value: number; unit: string; qualifier?: string };
export type Milestone = {
  id: string;
  month: string;
  year: number | null;
  title: string;
  action: string;
  context: string;
  evidence: string;
  consequence: string;
  trigger: string | null;
  people: string[];
  metrics: Metric[];
  assetIds: string[];
};
export type Chapter = { id: string; year: number; milestoneIds: string[]; people: string[]; duration: number; art: string };
export function validateStory(events: Milestone[], chapters: Chapter[], people: Record<string, unknown>, assets: Record<string, unknown>) {
  const ids = new Set(events.map((event) => event.id));
  if (ids.size !== events.length || new Set(chapters.map((c) => c.id)).size !== chapters.length) throw Error('Duplicate story ID');
  for (const event of events) {
    if (event.people.some((id) => !(id in people)) || event.assetIds.some((id) => !(id in assets))) throw Error(event.id);
  }
  for (const chapter of chapters) {
    if (
      !(chapter.duration > 0) ||
      !(chapter.art in assets) ||
      chapter.people.some((id) => !(id in people)) ||
      chapter.milestoneIds.some((id) => !ids.has(id))
    )
      throw Error(chapter.id);
  }
}
