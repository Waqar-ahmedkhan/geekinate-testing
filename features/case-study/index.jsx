import Brief from './Brief';
import Intro from './Intro';
import More from './More';
import Solution from './Solution';
import Stack from './Stack';
import { caseStudyContent } from '@/lib/content';

export default function CaseStudy({ project }) {
  const { slug, stack, brief } = project;
  const { intro, visit, actions, stack: stackBlock, brief: briefBlock, solution, more } = caseStudyContent;
  return (
    <>
      <Intro block={intro} visit={visit} project={project} actions={actions} />
      <Stack block={stackBlock} items={stack} />
      <Brief block={briefBlock} brief={brief} />
      <Solution block={solution} points={brief.solution} />
      <More block={more} slug={slug} />
    </>
  );
}
