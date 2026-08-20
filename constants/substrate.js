// The Life field behind the footer's letterform. Every tunable for it, held here for the same reason COSMOS and GRAIN are: the loop
// that reads them should read as behaviour rather than as a pile of floats.
//
// These are the numbers the page-wide substrate was retired on in 2026-08-13, brought back on 2026-08-20 for the footer alone. The
// two that changed are `opacity` and `seedChance`: the old field was the ground the whole page composited onto and could afford to
// be seen, this one shares a panel with the brightest object on the site and has to sit behind it.
export const SUBSTRATE = {
  // CSS pixels per cell. **This is not the density lever, and reaching for it as one is a trap.** A dot's radius is `cell * dotSize`,
  // so coarsening the grid to thin the field enlarges every dot by exactly as much as it removes — it was taken to 30 on 2026-08-20
  // and the result read as the same field zoomed in, 18px dots on a lattice coarse enough to count. Density belongs to `spawn`,
  // `seedDensity` and `gone`; this only says how fine the grain is. Finer than 18 rather than coarser, so the field reads as grain.
  cell: 16,
  // Generations per second, not frames. The afterglow covers the gap, so the field reads as continuous while the rule runs at a
  // tenth of the render rate.
  stepRate: 6,
  // Per generation, so the wall-clock length of the fade is decay against stepRate rather than decay alone. At 0.88 against six a
  // second a cell takes most of a second to go out.
  decay: 0.88,
  // Chance per cell per generation of a cell appearing out of nothing. Life on an empty grid settles at nothing, and a background
  // that goes blank ten seconds after it is looked at is not a background.
  //
  // This is the floor, and it was taken down to 0.0003 while `density` was being introduced, which was the wrong end to thin from.
  // Simulated over five minutes at that rate the field spent about a minute and a half at effectively nothing: the throttle already
  // backs the supply off as the grid fills, so cutting the supply again only means an empty grid has nothing to restart from.
  spawn: 0.0009,
  // How much of the grid is alive the moment it is allocated. The classic Life soup is around a tenth; this sits well under it
  // because the opening frame is the densest the field ever gets and it is the one the reader arrives on.
  seedDensity: 0.04,
  // The share of the mark's silhouette seeded on any one generation. Sparse seeding lets the rule do the work — stamping the whole
  // silhouette six times a second saturates every cell it touches and the field comes out as a block rather than as life.
  //
  // Held at roughly the old 0.02 rather than cut, and the reason is the rule: a lone cell dies on the next generation, so a stamp
  // sparse enough that its seeds land apart feeds the grid nothing at all. Taken to 0.007 the field died out and took a minute to
  // find its way back. The throttle in SubstrateField is what makes a healthy rate safe — it scales this by the headroom left, so
  // the stamp is at full strength on an empty grid and nearly off on a full one.
  seedChance: 0.03,
  // Dot radius as a share of the cell, so the grain stays proportionate when `cell` is retuned. At 0.3 a cell's dot was two thirds
  // of its own spacing, which closes the gaps between neighbours and turns a field of cells into a halftone screen. At 0.16 against
  // a 16px cell a live dot is about 5px across with 11px of black around it, which is what makes it read as grain rather than tile.
  dotSize: 0.16,
  // The field sits under the particle scene *and* under the panel's own `bg-void/30` tint, so roughly a third of this reaches the
  // eye. That is why it is above the old page-wide 0.44 rather than below it — the number is larger and the result is quieter.
  opacity: 0.6,
  // Below this a cell's afterglow is not worth a path, and it is one of the density levers. At the original 0.02 a dying cell stayed
  // on screen for about thirty generations — five seconds of ghost behind every birth, which is most of what was making the field
  // look solid. At 0.4 the tail is seven generations, so what is lit is close to what is actually alive.
  gone: 0.4,
  // The share of the grid the supply aims at, and the one number that stops the field creeping from sparse to solid over a minute.
  // The stamp and the spontaneous births are both scaled by how far under it the grid is, so the field slows as it fills. See the
  // note in SubstrateField, which is where the drift that used to do this job implicitly was removed.
  //
  // It is an aim rather than a ceiling: what is already seeded keeps growing for several generations after the supply backs off. In
  // simulation over five minutes this settles at about 8.6 per cent alive, peaking near 15 and never falling to nothing — so read
  // this number as roughly half of what the field actually holds, and turn it before any of the others to retune the density.
  //
  // **It stops answering somewhere above here.** Raising it to 0.11 buys a mean of 10.1 per cent and 0.15 buys 11.5, because the rule
  // will not hold much more than that however hard it is fed — B3/S23 kills its own overcrowding. Past this point the levers that
  // still work are `gone`, which decides how much of the afterglow is painted, and `dotSize` and `opacity`, which decide how much
  // each lit cell is worth. Do not chase density with this number alone.
  density: 0.08,
};
