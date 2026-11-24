import type { Chapter } from './CONTENT_SCHEMA';

export const chapters: Chapter[] = [
  { id: 'intro', year: 2019, milestoneIds: [], people: [], duration: 3.5, art: 'ledger' },
  { id: 'origin', year: 2019, milestoneIds: ['origin', 'first-systems'], people: ['usama'], duration: 4.4, art: 'ledger' },
  {
    id: 'engineering',
    year: 2021,
    milestoneIds: ['adil-joins', 'twinhub-launch'],
    people: ['usama', 'adil'],
    duration: 4.7,
    art: 'mobile',
  },
  {
    id: 'growth',
    year: 2022,
    milestoneIds: ['nouman-joins', 'shifa-growth'],
    people: ['usama', 'adil', 'nouman'],
    duration: 4.8,
    art: 'merge',
  },
  {
    id: 'interactive',
    year: 2024,
    milestoneIds: ['waqar-joins'],
    people: ['usama', 'adil', 'nouman', 'waqar'],
    duration: 4.6,
    art: 'phone',
  },
  {
    id: 'studio',
    year: 2026,
    milestoneIds: ['geekinate-v2'],
    people: ['usama', 'adil', 'nouman', 'waqar'],
    duration: 5.3,
    art: 'world',
  },
];
