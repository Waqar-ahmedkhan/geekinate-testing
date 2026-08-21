export function createLife() {
  let cols = 0,
    rows = 0;
  let cells = new Uint8Array(0),
    next = new Uint8Array(0),
    glow = new Float32Array(0),
    pixels = new Uint8Array(0);
  let population = 0;

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

  const scatter = (density) => {
    for (let index = 0; index < cells.length; index += 1) if (Math.random() < density) cells[index] = 1;
  };

  const seed = (col, row) => {
    if (cols === 0) return;
    const x = ((col % cols) + cols) % cols,
      y = ((row % rows) + rows) % rows;
    cells[y * cols + x] = 1;
  };

  const step = (decay, spawn) => {
    let living = 0;
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
        let alive = here ? count === 2 || count === 3 : count === 3;
        if (!alive && Math.random() < spawn) alive = true;
        const index = mid + x;
        next[index] = alive ? 1 : 0;
        living += alive ? 1 : 0;
        glow[index] = alive ? 1 : glow[index] * decay;
        pixels[index * 4 + 1] = glow[index] * 255;
        pixels[index * 4 + 3] = 255;
      }
    }
    const swap = cells;
    cells = next;
    next = swap;
    population = living;
  };

  return {
    resize,
    scatter,
    seed,
    step,
    get pixels() {
      return pixels;
    },
    get cols() {
      return cols;
    },
    get population() {
      return population;
    },
    get rows() {
      return rows;
    },
  };
}
