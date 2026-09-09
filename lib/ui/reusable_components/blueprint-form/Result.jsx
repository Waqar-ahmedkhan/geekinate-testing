import Capture from './Capture';
import Transform from './Transform';
import { Card, Eyebrow } from '@/components';
import { Button } from '@/components/ui/button';
import { blueprintForm, services } from '@/lib/content';

const TITLE = 'font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.1] tracking-[-0.01em] text-foreground';
const HEADING = 'text-xl leading-tight tracking-[-0.01em] text-foreground';
const NOTE = 'text-sm leading-[1.5] text-mut';

export default function Result({ blueprint, onAgain, ref }) {
  const { result } = blueprintForm;
  const pillar = services.find(({ slug }) => slug === blueprint.pillar);
  const opportunityEls = blueprint.opportunities.map(({ title, outcome }) => (
    <div key={title} data-reveal='build'>
      <Card onPaper>
        <h4 className={HEADING}>{title}</h4>
        <p className={NOTE}>{outcome}</p>
      </Card>
    </div>
  ));

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby='blueprint-result'
      className='flex scroll-mt-[var(--nav-rail)] flex-col gap-8 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink'
    >
      <div className='flex flex-col gap-2' data-reveal='head'>
        <h3 id='blueprint-result' className={TITLE}>
          {result.title}
        </h3>
        <p className='max-w-[62ch] text-base leading-[1.6] text-mut'>{blueprint.businessSummary}</p>
      </div>
      <div data-reveal='column'>
        <Transform blueprint={blueprint} />
      </div>
      <div className='flex flex-col gap-4'>
        <h4 className={HEADING}>{result.opportunities.heading}</h4>
        <div className='grid gap-4 md:grid-cols-3 [&>*]:min-w-0'>{opportunityEls}</div>
      </div>
      <div data-reveal='capture'>
        <Capture blueprint={blueprint} />
      </div>
      <div className='flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-line pt-6'>
        {pillar ? <Eyebrow>{`${result.pillarLabel} — ${pillar.title}`}</Eyebrow> : null}
        <Button
          type='button'
          onClick={onAgain}
          variant='outline'
          className='h-11 cursor-pointer rounded-full border-[1.5px] border-ink bg-paper px-6 text-ink hover:bg-wash'
        >
          {result.again}
        </Button>
      </div>
    </div>
  );
}
