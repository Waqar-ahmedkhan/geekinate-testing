export default function AgentMark({ className }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      className={className}
    >
      <path d='M12 8V4H8' />
      <rect width='16' height='12' x='4' y='8' rx='2' />
      <path d='M2 14h2' />
      <path d='M20 14h2' />
      <g className='origin-center animate-blink [transform-box:fill-box] motion-reduce:animate-none'>
        <path d='M9 13v2' />
        <path d='M15 13v2' />
      </g>
    </svg>
  );
}
