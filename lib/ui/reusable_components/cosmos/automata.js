// Conway's rule, on the CPU.
//
// This was a GPU ping-pong first: two render targets, a step shader, and a pass that stamped the mark's particles into the grid. It
// was the obvious way to do it and it produced nothing readable — the display path checked out under a forced value, both off-screen
// passes stayed black, and the next step would have been another guess at the renderer's state.
//
// The arithmetic makes the whole argument moot. The grid is about 137 x 61, so a generation is 8,400 cells and roughly 67,000
// neighbour reads. At eleven generations a second that is under a million operations — less than a single frame of the particle
// shader, which does 26,000 vertices sixty times a second. There is nothing to optimise here, and no render targets to get wrong.
//
// The grid is a torus: neighbours wrap at every edge, which is what lets the display slide the lattice past its own bounds without a
// seam.
export function createLife() {
  let cols = 0,
    rows = 0;
  let cells = new Uint8Array(0),
    next = new Uint8Array(0),
    glow = new Float32Array(0),
    pixels = new Uint8Array(0);

  const resize = (nextCols, nextRows) => {
    if (nextCols === cols && nextRows === rows) return false;
    cols = nextCols;
    rows = nextRows;
    const total = cols * rows;
    cells = new Uint8Array(total);
    next = new Uint8Array(total);
    glow = new Float32Array(total);
    pixels = new Uint8Array(total * 4);
    return true;
  };

  // Cells are seeded in grid coordinates, wrapped, so a caller can stamp across the seam without checking for it.
  const seed = (col, row) => {
    if (cols === 0) return;
    const x = ((col % cols) + cols) % cols,
      y = ((row % rows) + rows) % rows;
    cells[y * cols + x] = 1;
  };

  const step = (decay, spawn) => {
    for (let y = 0; y < rows; y += 1) {
      const up = ((y - 1 + rows) % rows) * cols,
        mid = y * cols,
        down = ((y + 1) % rows) * cols;
      for (let x = 0; x < cols; x += 1) {
        const left = (x - 1 + cols) % cols,
          right = (x + 1) % cols;
        const count =
          cells[up + left] +
          cells[up + x] +
          cells[up + right] +
          cells[mid + left] +
          cells[mid + right] +
          cells[down + left] +
          cells[down + x] +
          cells[down + right];
        const here = cells[mid + x];
        // B3/S23, then the one departure: a rare birth out of nothing. Life on an empty grid settles at nothing, and a background
        // that goes blank ten seconds after load is not a background.
        let alive = here ? count === 2 || count === 3 : count === 3;
        if (!alive && Math.random() < spawn) alive = true;
        const index = mid + x;
        next[index] = alive ? 1 : 0;
        // The afterglow. A cell that dies fades over several generations rather than vanishing — without it a grid switching on and
        // off at the step rate is a flicker, not a texture.
        glow[index] = alive ? 1 : glow[index] * decay;
        pixels[index * 4 + 1] = glow[index] * 255;
        pixels[index * 4 + 3] = 255;
      }
    }
    const swap = cells;
    cells = next;
    next = swap;
  };

  return {
    resize,
    seed,
    step,
    get pixels() {
      return pixels;
    },
    get cols() {
      return cols;
    },
    get rows() {
      return rows;
    },
  };
}
