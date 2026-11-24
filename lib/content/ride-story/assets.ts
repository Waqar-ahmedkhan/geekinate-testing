export const assets = Object.fromEntries(
  ['ledger', 'mobile', 'merge', 'phone', 'world'].map((id) => [
    id,
    {
      src: '/media/fieldbook/' + id + '.svg',
      kind: 'Original editorial illustration',
      owner: 'Created for this fieldbook',
    },
  ])
);
