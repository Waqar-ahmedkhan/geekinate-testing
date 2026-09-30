export const DICE_SCOPES = Object.freeze(['games']);

export const DIE = Object.freeze({
  sides: ['rotateY(0deg)', 'rotateY(180deg)', 'rotateY(90deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'],
  pairs: [
    [1, 6],
    [2, 5],
    [3, 4],
  ],
  pips: { 1: [4], 2: [2, 6], 3: [2, 4, 6], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] },
  rolls: [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
  ],
});
