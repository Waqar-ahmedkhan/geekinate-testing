import Capture from './Capture';
import { Card, Eyebrow, StepIndex } from '@/components';
import { Button } from '@/components/ui/button';
import { blueprintForm, services } from '@/lib/content';

const TITLE = 'font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.1] tracking-[-0.01em] text-foreground';
const HEADING = 'text-xl leading-tight tracking-[-0.01em] text-foreground';
const ROW = 'flex gap-4 border-t-[1.5px] border-line pt-4 first:border-t-0 first:pt-0';
const STEP = 'text-base leading-[1.4] text-foreground';
const NOTE = 'text-sm leading-[1.5] text-mut';
const QUIET = 'border-line bg-transparent text-mut shadow-none';

const stepRow = ({ step, detail, index, quiet }) => (
  <li key={step} className={ROW}>
    <StepIndex value={index + 1} className={quiet ? QUIET : undefined} />
    <span className='flex flex-col gap-1'>
      <span className={STEP}>{step}</span>
      <span className={NOTE}>{detail}</span>
    </span>
  </li>
);

export default function Result({ blueprint, onAgain, ref }) {
  const { result } = blueprintForm;
  const pillar = services.find(({ slug }) => slug === blueprint.pillar);
  const todayEls = blueprint.today.map(({ step, friction }, index) => stepRow({ step, detail: friction, index, quiet: true }));
  const automatedEls = blueprint.automated.map(({ step, handledBy }, index) => stepRow({ step, detail: handledBy, index }));
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
      <div className='grid gap-4 lg:grid-cols-2 [&>*]:min-w-0'>
        <div data-reveal='column'>
          <Card className='gap-5'>
            <header className='flex flex-col gap-1'>
              <h4 className={HEADING}>{result.today.heading}</h4>
              <Eyebrow>{result.today.note}</Eyebrow>
            </header>
            <ol className='flex flex-col gap-4'>{todayEls}</ol>
          </Card>
        </div>
        <div data-reveal='column'>
          <Card onPaper className='gap-5'>
            <header className='flex flex-col gap-1'>
              <h4 className={HEADING}>{result.automated.heading}</h4>
              <Eyebrow>{result.automated.note}</Eyebrow>
            </header>
            <ol className='flex flex-col gap-4'>{automatedEls}</ol>
          </Card>
        </div>
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
