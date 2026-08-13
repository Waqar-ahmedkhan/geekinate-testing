import Link from 'next/link';
import { Eyebrow, Section } from '@/components';
import { cn } from '@/lib/utils';
import { heroContent } from '@/lib/content';
import { LAYOUT } from '@/constants';

// Section 01. The particle scene is not here — it is fixed to the viewport from the app shell, behind every section, because it
// travels the whole page and reforms as the mark at the footer. A canvas parented to this section would have its z-index trapped in
// the section's own stacking context and would vanish the moment you scrolled past it.
//
// So the hero is a two-column split where the right column is deliberately empty: the mark occupies it, and the grid exists to keep
// the copy out of it. Everything on the left is one stack — eyebrow, headline, paragraph, actions — centred against the mark rather
// than pinned to the top and bottom rails. The earlier version pushed the actions to the bottom edge and hung the paragraph off the
// bottom-right corner, which read as two unrelated fragments with a hole between them.
// Both actions are on the ink-on-paper system now that the hero's ground is paper. The accent one is filled rather than outlined:
// volt as type on white is under 2:1 against the ground, which is not a contrast a label can be read at — the same reason the
// navbar's CTA has always been a filled pill. Volt carries the accent as a surface here and ink carries the type.
const ACTION = 'border-brutal rounded-full px-6 py-3 text-sm transition-colors duration-200 ease-brutal';

export default function Hero() {
  const { eyebrow, headline, body, actions } = heroContent;
  const actionEls = actions.map(({ label, href, accent }) => (
    <Link
      key={label}
      href={href}
      className={cn(ACTION, accent ? 'bg-volt text-ink shadow-brutal-sm hover:bg-volt/85' : 'text-foreground hover:bg-wash')}
    >
      {label}
    </Link>
  ));
  return (
    // Two things here are load-bearing and neither is obvious.
    //
    // The negative top margin cancels the navbar's rail. The rail is sticky, so it occupies flow space and pushes this section down
    // by its own height — the section box then runs from the rail to the fold, its centre sits half a rail below the viewport's, and
    // the copy ends up centred against nothing. The mark is on a fixed canvas centred on the *viewport*, so the two disagreed by
    // ~38px and the hero read as top-heavy with dead space under the navbar. Pulling the section up under the rail puts both on the
    // same centre line. The navbar simply floats over it, which is what it does on the reference anyway.
    //
    // The gutter is wider than the rest of the site. Every other section is a full-bleed grid whose content starts at the rule; this
    // one is a single column of type with a mark beside it, and at the standard gutter the headline sat against the edge of the glass.
    // `on-light` and not the `paper` variant. The variant paints a fill, and this section's fill would cover the particle scene it
    // exists to frame — the wash under the hero is painted by the substrate canvas beneath the scene instead. The class carries only
    // the token flip, so the type, rules and shadows in here resolve ink-on-white exactly as they do in a paper section.
    <Section
      id='hero'
      variant='clear'
      className='on-light -mt-[var(--nav-rail)] flex min-h-svh items-center px-6 py-16 md:px-14 md:py-20 lg:px-20'
    >
      {/* The hero composes inside a fixed container rather than the full viewport, and the navbar and the particle scene both measure
          against the same number — see LAYOUT.container. Past that width the copy would keep spreading away from the mark. */}
      <div className='mx-auto grid w-full items-center gap-12 md:grid-cols-2' style={{ maxWidth: LAYOUT.container }}>
        {/* Measured to close the gap to the mark. At 34rem the type block ended a third of the way across and left a viewport-wide
            hole between it and the G; the headline now runs the full column and only the paragraph keeps a reading measure. */}
        <div className='flex max-w-[42rem] flex-col items-start gap-6'>
          <Eyebrow>{eyebrow}</Eyebrow>
          {/* The second half at low alpha is the reference's device and the reason the copy is authored as two halves. */}
          <h1 className='font-display text-[clamp(2.5rem,4.9vw,4.6rem)] italic leading-[1.04] tracking-[-0.01em]'>
            {headline.lead} <span className='text-ink/35'>{headline.trail}</span>
          </h1>
          <p className='max-w-[48ch] text-base leading-[1.7] text-mut'>{body}</p>
          <div className='mt-2 flex flex-wrap gap-3'>{actionEls}</div>
        </div>
      </div>
    </Section>
  );
}
