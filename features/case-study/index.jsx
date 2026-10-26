import Brief from './Brief';
import Intro from './Intro';
import More from './More';
import Solution from './Solution';
import Stack from './Stack';
import { caseStudyContent } from '@/lib/content';

export default function CaseStudy({ project }) {
  const { slug, stack, stackLabel, brief } = project;
  const { intro, visit, actions, stack: stackBlock, brief: briefBlock, solution, more } = caseStudyContent;
  const stackHead = { ...stackBlock, label: stackLabel ?? stackBlock.label };
  return (
    <>
      <Intro block={intro} visit={visit} project={project} actions={actions} />
      <Stack block={stackHead} items={stack} />
      <Brief block={briefBlock} brief={brief} />
      <Solution block={solution} points={brief.solution} />
      <More block={more} slug={slug} />
    </>
  );
}
