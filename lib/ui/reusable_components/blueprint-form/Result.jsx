import { Card, Eyebrow, StepIndex } from '@/components';
import { Button } from '@/components/ui/button';
import { blueprintForm, services } from '@/lib/content';

const COLUMN = 'flex flex-col gap-5 rounded-lg border-[1.5px] border-ink bg-paper p-6 shadow-brutal md:p-8';
const HEADING = 'font-display text-2xl leading-none tracking-[-0.01em] text-ink';
const ROW = 'flex gap-4 border-t-[1.5px] border-line pt-4 first:border-t-0 first:pt-0';

export default function Result({ blueprint, onAgain, ref }) {
  const { result } = blueprintForm;
  const pillar = services.find(({ slug }) => slug === blueprint.pillar);
  const todayEls = blueprint.today.map(({ step, friction }, index) => (
    <li key={step} className={ROW}>
      <StepIndex value={index + 1} />
      <span className='flex flex-col gap-1'>
        <span className='text-base leading-[1.4] text-foreground'>{step}</span>
        <span className='text-sm leading-[1.5] text-mut'>{friction}</span>
      </span>
    </li>
  ));
  const automatedEls = blueprint.automated.map(({ step, handledBy }, index) => (
    <li key={step} className={ROW}>
      <StepIndex value={index + 1} />
      <span className='flex flex-col gap-1'>
        <span className='text-base leading-[1.4] text-foreground'>{step}</span>
        <span className='text-sm leading-[1.5] text-mut'>{handledBy}</span>
      </span>
    </li>
  ));
  const opportunityEls = blueprint.opportunities.map(({ title, outcome, effort }) => (
    <div key={title} data-reveal='build'>
      <Card onPaper>
        <Eyebrow>{`${result.opportunities.effortLabel} — ${effort}`}</Eyebrow>
        <h4 className='text-xl leading-tight tracking-[-0.01em] text-foreground'>{title}</h4>
        <p className='text-sm leading-[1.6] text-mut'>{outcome}</p>
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
      <div className='flex flex-col gap-2'>
        <h3 id='blueprint-result' className='font-display text-3xl leading-none tracking-[-0.01em] text-ink'>
          {result.title}
        </h3>
        <p className='max-w-[62ch] text-base leading-[1.6] text-mut'>{blueprint.businessSummary}</p>
      </div>
      <div className='grid gap-4 lg:grid-cols-2 [&>*]:min-w-0' data-reveal='panel'>
        <section className={COLUMN} data-reveal='column'>
          <header className='flex flex-col gap-1'>
            <h4 className={HEADING}>{result.today.heading}</h4>
            <Eyebrow>{result.today.note}</Eyebrow>
          </header>
          <ol className='flex flex-col gap-4'>{todayEls}</ol>
        </section>
        <section className={COLUMN} data-reveal='column'>
          <header className='flex flex-col gap-1'>
            <h4 className={HEADING}>{result.automated.heading}</h4>
            <Eyebrow>{result.automated.note}</Eyebrow>
          </header>
          <ol className='flex flex-col gap-4'>{automatedEls}</ol>
        </section>
      </div>
      <div className='flex flex-col gap-4'>
        <h4 className={HEADING}>{result.opportunities.heading}</h4>
        <div className='grid gap-4 md:grid-cols-3 [&>*]:min-w-0'>{opportunityEls}</div>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-line pt-6'>
        {pillar ? <Eyebrow>{`${result.pillarLabel} — ${pillar.title}`}</Eyebrow> : null}
        <Button
          type='button'
          onClick={onAgain}
          variant='outline'
          className='h-11 rounded-full border-[1.5px] border-ink bg-paper px-6 text-ink hover:bg-wash'
        >
          {result.again}
        </Button>
      </div>
    </div>
  );
}
