import { contactContent, services, work } from '@/lib/content';
import { SITE } from '@/constants';

const paired = (title, detail) => `${title} — ${detail}`;

export const knowledge = {
  studio: { name: SITE.name, summary: SITE.description, email: SITE.email },
  services: services.map(({ slug, title, summary, facts, scope, steps, deliverables }) => ({
    slug,
    title,
    summary,
    facts: facts.map(({ label, value }) => paired(label, value)),
    scope: scope.map(({ title: capability, detail }) => paired(capability, detail)),
    process: steps.map(({ title: step, detail }) => paired(step, detail)),
    deliverables,
  })),
  projects: work.map(({ title, disciplines }) => ({ title, disciplines })),
  engagement: contactContent.steps.map(({ title, detail }) => paired(title, detail)),
};

export const knowledgeText = JSON.stringify(knowledge);
