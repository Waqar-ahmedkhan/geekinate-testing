import Card from './Card';

const DECK = 'group/deck relative isolate h-full';
const SHEET =
  'absolute inset-0 z-0 rounded-lg border-[1.5px] border-ink bg-volt shadow-brutal opacity-0 transition-[translate,rotate,opacity] delay-[0ms,0ms,320ms] duration-[320ms,320ms,0ms] ease-in group-hover/deck:translate-x-[7px] group-hover/deck:translate-y-2 group-hover/deck:rotate-[1.8deg] group-hover/deck:opacity-100 group-hover/deck:delay-0 group-hover/deck:duration-[460ms,460ms,0ms] group-hover/deck:ease-brutal motion-reduce:transition-none';
const LIFT =
  'relative z-10 origin-[24%_100%] transition-[translate,rotate,box-shadow] duration-[320ms] ease-in group-hover/deck:-translate-x-0.5 group-hover/deck:-translate-y-[5px] group-hover/deck:-rotate-[1.2deg] group-hover/deck:shadow-none group-hover/deck:duration-[460ms] group-hover/deck:ease-brutal motion-reduce:transition-none';

export default function DeckCard({ onPaper, className, children }) {
  return (
    <div className={DECK}>
      <span aria-hidden='true' className={SHEET} />
      <Card onPaper={onPaper} className={className} shellClassName={LIFT}>
        {children}
      </Card>
    </div>
  );
}
