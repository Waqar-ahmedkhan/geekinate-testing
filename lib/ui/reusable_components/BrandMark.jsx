const GLYPH =
  'M1298 -104Q1298 -171 1281.0 -224.5Q1264 -278 1236.0 -318.5Q1208 -359 1171.0 -387.5Q1134 -416 1093.5 -434.0Q1053 -452 1011.5 -460.5' +
  'Q970 -469 933 -469H464V-209H933Q986 -209 1012.0 -182.0Q1038 -155 1038 -104V717Q1038 768 1012.0 794.5Q986 821 933 821H464' +
  'Q416 821 388.0 791.5Q360 762 360 717V365Q360 314 387.0 287.0Q414 260 466 260H933V0H464Q427 0 386.0 8.5Q345 17 304.5 35.0' +
  'Q264 53 227.0 81.5Q190 110 162.0 150.5Q134 191 117.0 244.5Q100 298 100 365V717Q100 754 108.5 795.0Q117 836 135.0 876.5' +
  'Q153 917 181.5 954.0Q210 991 250.5 1019.0Q291 1047 344.0 1064.0Q397 1081 464 1081H933Q970 1081 1011.5 1072.5' +
  'Q1053 1064 1093.5 1046.0Q1134 1028 1171.0 999.5Q1208 971 1236.0 930.5Q1264 890 1281.0 837.0Q1298 784 1298 717Z';

export default function BrandMark({ size = 24, bare = false, tight = false, className }) {
  const tile =
    bare || tight ? null : (
      <>
        <rect width='512' height='512' rx='112.6' fill='var(--volt)' />
        <rect x='1.5' y='1.5' width='509' height='509' rx='111.1' fill='none' stroke='var(--ink)' strokeWidth='3' />
      </>
    );
  return (
    <svg
      width={size}
      height={size}
      viewBox={tight ? '112 112 288 288' : '0 0 512 512'}
      role='img'
      aria-label='Geekinate mark'
      className={className}
    >
      {tile}
      <g transform='translate(131.3,310.6) scale(0.1784,-0.1784)' fill='var(--ink)'>
        <path d={GLYPH} />
      </g>
    </svg>
  );
}
