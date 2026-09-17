import Card from './Card';

const LIFT =
  'transition-[translate,box-shadow] duration-[280ms] ease-in group-hover/lift:-translate-x-[3px] group-hover/lift:-translate-y-[3px] group-hover/lift:shadow-[6px_6px_0_var(--ink)] group-hover/lift:duration-[620ms] group-hover/lift:ease-spring motion-reduce:transition-none';

export default function LiftCard({ onPaper, className, children }) {
  return (
    <div className='group/lift h-full'>
      <Card onPaper={onPaper} className={className} shellClassName={LIFT}>
        {children}
      </Card>
    </div>
  );
}
