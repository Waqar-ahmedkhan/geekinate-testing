# AGENTS.md

Repository guidance and coding boundaries for Geekinate v1. Start here.

| Need | File |
|---|---|
| Where code lives, how modules relate | `ARCHITECTURE.md` |
| How a change gets investigated, built, verified, approved | `WORKFLOW.md` |
| Review checklist, security, guardrails | `QUALITY_AND_SAFETY.md` |

## The project

Geekinate's agency website, rebuilt from scratch. A single Next.js app living at the repo root — no backend, no database, no
`frontend/` wrapper. The repo is the application.

The site will sell four service pillars: **AI & Automation, Games & Interactive, Marketing Systems, Web Products**.

Design direction is not open to invention: it is decided in the Asana thread *Revamp Web Design to a modern design*, with
`wearestokt.com` as the agreed base, `denqid.com` for the hero, and `landing.love/categories/agency` for further reference. It is
being built **section by section**, hero first.

Reference material sits one level up in `../`: `geekinate-site-spec.md` (intended build), `nudot-spec.md` (motion vocabulary),
`geekinate-site/` (the shipped static predecessor), and `Eleve/development/frontend` (the folder conventions this repo follows).

## Commands

Run everything from the repo root:

| Command | Notes |
|---|---|
| `npm run dev` | Turbopack dev server. **Port 3007**, pinned in the script so it never collides with a sibling project (Eleve holds 3006) |
| `npm run build` | A failure here is usually a prerender error, not a compile error |
| `npm run lint` | Warnings ship as errors. Clear them, do not suppress |
| `npm run format` | Prettier across the repo |

There is no test runner. See `WORKFLOW.md` for what verification replaces it.

## Boundaries

These are the rules that have actually been broken or nearly broken. Treat them as hard.

**Build only what was asked.** An empty directory is not a specification, and neither is a sibling project's shape. When a request
names one deliverable, build that one; if the surroundings suggest more, ask rather than build speculatively. The site is being
assembled a section at a time — do not scaffold sections nobody requested.

**Do not invent brand values.** Palette and geometry are transcribed from `geekinate new logo/geekinate-homepage-v2.html`. If a token
looks wrong, check that file before changing it.

| Token | Value | Role |
|---|---|---|
| `--volt` | `#b8e01b` | The only accent |
| `--ink` | `#101613` | Type, every border, hard shadows |
| `--ink-soft` | `#3a423d` | Secondary type |
| `--grey` | `#5b6b62` | Muted type, eyebrows |
| `--white` | `#fdfdfb` | Page background and card fill |
| `--wash` | `#f4f7ea` | Volt-tinted panels |
| `--footer-mut` / `--footer-line` | `#b9c2bc` / `#2a312c` | Reserved for the dark footer |

**The hero globe is on volt, and the blue it was built in has been reversed.** The reference agreed on 2026-08-13
(`docs/istockphoto-1405728317-612x612.jpg`) is blue on navy, and the first build copied that palette with volt held back for the arcs
and flares. It was rejected the same day: blue is a second accent this site does not have, and it made the hero read as a different
product from the page under it. `GLOBE_PALETTE` in `constants/globe.js` is now volt, paper and black — the three values the mark is
already built from. There is no approved blue anywhere in this project.

**Dark surfaces are pure black `#000`, not `--ink`.** The logo file backs its dark blocks with `--gk-ink`, but at full-section scale
`#101613` reads as a green colour wash and was rejected on sight (2026-08-07) — the same objection that moved section 02 off `wash`.
`--ink` remains the type, border and shadow token, where the difference from black is imperceptible. Every dark *fill* —
`Section variant='ink'`, `HoverVideoCard`, `WorkTile`, the pending panel — is `bg-black`.

Geometry is as much the brand as the colour: **1.5px ink borders, 20px card radius, hard offset shadows** (`3px 3px 0` /
`2px 2px 0`), no soft elevation, no blur-based depth. `--radius` is `1.25rem` because shadcn derives its whole scale from it.
`border-brutal` and `text-marker` are custom utilities carrying the signature.

**Stack decisions already made.** JavaScript, not TypeScript. App Router. **No `src/` directory.** Tailwind v4 CSS-first with **no
`tailwind.config.js`**. shadcn emits `.jsx` (`tsx: false`). Reversing any of these is a decision to raise, not a refactor to perform.

**No new dependencies without raising it.** There is deliberately no smooth-scroll, form, or data library. `three`,
`@react-three/fiber` and `@react-three/drei` are the one granted exception — raised and approved on 2026-08-10 for the hero brief in
`docs/geekinate-hero-3d-prompt.md`. That approval covers the rest of that brief's list too (`lenis`, `zustand`, `maath`, `leva`,
`@react-three/postprocessing`), but each installs with the phase that uses it. It does not extend to anything else.

**One particle system holds the whole page, and it wears three shapes.** There is a single WebGL canvas, mounted from the app shell
as a fixed sibling of every section (`lib/ui/reusable_components/cosmos`). The 26,000 particles in it are the hero's globe, the
scattered field through the body, and the letterform the footer reassembles — in that order down the page, driven by two independent
ScrollTriggers (`#hero` closes the globe, `footer` opens the mark) and mixed against the scattered pose in the vertex shader.

This replaced two separate scenes on 2026-08-13, and the reason is worth keeping: a stock-illustration globe bolted above a site with
its own material reads as two products. A globe made of the mark's own beads, shaded by the mark's own shader and disturbed by the
mark's own cursor, reads as one object wearing a different shape. **Do not give the globe its own canvas, its own camera or its own
dot material.** `lib/globe` owns the land *pose*, the fit, and the shells and network around it — never the particles.

The camera is the other load-bearing pair: 7.1 degrees at a distance of 60. It is a long lens on purpose, and changing either number
without the other rescales the entire scene. See the note at the top of `constants/cosmos.js`.

**The client marquee's numbers are transcribed, not chosen.** `constants/marquee.js` holds values read off `wearestokt.com` on
2026-08-25 — the live Framer `Ticker`'s own props plus its computed styles, not an eyeballed reconstruction: `speed: 40` px/s
leftward, `gap: 150`, `padding: 10`, `fadeWidth: 46` (so the `mask-image` stops land at 23% and 77%), and no hover slowdown
(`hoverFactor` is 1 there). The running speed was measured back at 40.00 px/s in this build. Retuning any of them is a design
decision to raise, not a tidy-up. The logos themselves are **placeholders** — there are no client logo files in this repo. Do not
invent brands to fill the strip; `ClientLogo` draws a geometric mark and `Client Logo 01`…`08` until real files land in
`public/media/clients/`.

**The preload gate must never be able to trap the page.** `lib/ui/reusable_components/preloader` holds a black overlay over
everything until the globe paints its first frame, which reaches it through `lib/boot/ready.js`. That signal can legitimately never
arrive — no WebGL, a throttled tab, a context loss — so `PRELOADER.maxMs` completes the gate regardless. Removing that failsafe, or
gating on a signal without one, ships a black screen to whoever the globe fails for. `minMs` is the other half: it stops a warm
cache flashing the overlay for three frames.

**Nothing below the hero is 3D.** Work, Services and Testimonials stay on the flat system — white ground, ink borders, hard offset
shadows, no blur-based depth — and they are opaque, which is what hides the scattered field behind them. Reaching for a soft shadow,
a glow or a gradient down there because "the hero does it" is the misreading to avoid.

**The hero paints no ground of its own.** The canvas is fixed at `z-[1]` and every `Section` is `relative z-10`, so a background on
section 01 would cover the very thing it exists to frame. The black comes from `html`.

## Conventions

The global guidelines in `~/.claude/CLAUDE.md` apply in full. Project-specific applications:

- `.jsx` for anything rendering markup, `.js` for plain modules. Directory entry points are `index.jsx`, so the import is
  `@/lib/ui/reusable_components/nav`, never `.../nav/Nav`.
- Import order ends with data: components, then `lib/`, then content, then `constants/`, then CSS. Constants last, always.
- Computations come out of JSX. `SectionHead` builds `eyebrowEl` / `bodyEl` above the return rather than inlining ternaries.
- Copy does not get hardcoded into components. If you are writing English inside a `.jsx` file, it belongs in a content module.
- Prettier config is `prettier.config.js` — 140 print width, single quotes, JSX single quotes. Run `npm run format` before finishing.
- **No comments in code.** The whole tree was stripped on 2026-08-21 — no `//`, no `/* */`, no `{/* */}` in JSX, no `/* */` in CSS, none inside the GLSL held in template literals, and no banner emitted by `scripts/build-land-mask.mjs`. Do not reintroduce them. Rationale goes in these four `.md` files or in the commit message; the **Traps** section above is where a hard-won debugging lesson belongs now. A tool directive (`eslint-disable`, `prettier-ignore`) is the only exception, and needs a reason before it is added.

## Traps

**`@/components` resolves to the wrong file without help.** `jsconfig.json` carries an entry that looks redundant:

```json
"@/components": ["./components/index.js"]
```

Without it, `import { Section } from '@/components'` resolves to the **`components.json` shadcn config file**, because resolution
tries `components.json` before `components/index.js`. The failure is silent — every named import returns `undefined` and the build
dies at prerender with `Element type is invalid ... got: undefined`, naming no file. Do not remove that mapping. Directory barrels
without a colliding sibling file (`@/constants`) resolve normally.

**rAF frame ids in refs survive StrictMode's dev remount.** Cleanup must reset the id to `0` after `cancelAnimationFrame`, or the
second mount sees a stale non-zero id, never schedules another frame, and the animation silently freezes. This already cost real
debugging time in `useScrollProgress`.

**A backgrounded tab pauses rAF entirely.** Scroll-driven UI appears frozen mid-transition when inspected through browser
automation, and any state that updates inside a rAF tick simply stops. Programmatic `window.scrollTo` cannot verify scroll-linked
components there — use real wheel events, which activate the tab. `html { scroll-behavior: smooth }` compounds it: a smooth
programmatic scroll in a paused tab never advances at all. That is the browser, not a bug — do not "fix" it.

**`cn()` overrides do not cross breakpoints.** twMerge tracks each responsive variant separately, so passing `mb-0` to a component
whose base classes are `mb-8 md:mb-10` kills only `mb-8` — the `md:mb-10` survives and stacks with whatever the parent applies. Pass
`mb-0 md:mb-0`. This silently doubled a section's header gap.

**A logo SVG is almost never a path you can sample.** `public/brand/geekinate-mark.svg` is a filled outline, so its `d` traces the
*edge* of the letter, not its stroke. Feeding that to a tube builder wraps geometry around the glyph instead of running through it —
and it looks plausible enough in a thumbnail to waste an hour. Check for a uniform stroke width before reaching for a tracing
library; this mark has one, so `scripts/sample-g-path.mjs` derives the centreline arithmetically instead.

**A positioned ancestor with a z-index traps a fixed child's z-index.** `Section` carries `relative z-10`, which opens a stacking
context. The 3D canvas was rendered inside the hero's `Section` with `fixed inset-0 z-40`, and that 40 is scoped to the hero's own
z-10 layer — so every later section painted over it. It renders correctly in the hero, because nothing overlaps the first section,
which makes it present as "the mark vanishes as soon as you scroll past the hero" rather than as a layering fault. The canvas is a
**sibling** of the section now. Two other diagnoses were chased first, so check the DOM ancestry before the maths.

**R3F's `viewport` is measured from the camera to the world origin, so never derive a scale from it if anything moves the camera.**
`state.viewport` is `getCurrentViewport(camera, [0,0,0], size)`. Panning the camera increases that distance, which grows
`viewport.height`. Sizing the scene off it then makes a closed loop — bigger scene, centroid further out, camera pans further,
bigger still — and the object leaves the frustum within a few frames. It presents as "the scene renders at load and disappears the
moment you scroll", which reads like a scroll bug and is not one. Derive from the camera's own fov and its fixed distance to the
subject plane instead, and take the aspect ratio from `state.size`.

**Additively blended light particles are invisible on light ground.** The dot cloud is paper-white with `AdditiveBlending`, which
is exactly right over the black hero and vanishes completely over the white Work and Testimonials sections. Three separate
diagnoses were wasted on geometry before the buffers were read and turned out to be perfectly healthy the whole time — positions
in frame, 18000 points drawn every frame, no NaN. If a particle layer "disappears", check what is behind it before touching the
maths.

**A curve's end tangent is not the direction you assume it is.** Joining Region B onto the letterform, the obvious move is to place
the lead control point along +x, because both of the glyph's ends run along +x. They do not: the shallow sine in Z tilts each end
tangent about seven degrees out of plane, and a lead placed along +x concentrates that seven degrees at a single point. It measured
**1110 degrees of turn per unit of arc against the letterform's own corners at 410** — and on screen it looked like a shading seam,
not a crease, so it was easy to dismiss as a reflection. Read the tangent off the curve with `getTangentAt` and it drops to 32.

**Curvature on the spine is a measured quantity.** Screenshots cannot tell a crease from a hard-edged softbox reflection, and two
wrong root causes survived visual inspection before the numbers were taken. Walk the spine at uniform arc length, take the angle
between consecutive tangents, and compare against the letterform's own corners — nothing may turn harder than the mark already
turns, and nothing may drop below a radius of curvature of the tube radius or the tube passes through itself.

**A tube's silhouette is its spine plus its radius, on every side.** Fitting the 3D mark to the viewport off its centreline bounds
under-reads the width by 17% and clips it off both edges of a phone. The camera's field of view is vertical, so width is the axis
that fails first and it fails only at narrow aspect ratios — a desktop check will not catch it.

**Wall-clock timing measures nothing about a scroll- or rAF-driven animation under browser automation.** Sampling a marquee's
transform, sleeping four seconds through a tool call, and sampling again read the ticker back at **1.62 px/s against an actual
40.00** — because the tab is backgrounded between calls and `requestAnimationFrame` is paused for almost all of that wall time,
while `performance.now()` keeps counting. The number looks like a plausible bug in the animation, which is what makes it dangerous.
Sample inside a `requestAnimationFrame` loop and derive the rate from **its** timestamps, which only advance while the loop runs;
then take a `computer` action to activate the tab and read the buffer back.

**Count the animation loops before blaming the particles.** The home page felt slow and the 30,000-point canvas was the obvious
suspect; it was not the cost. Instrumenting `requestAnimationFrame`, `getBoundingClientRect`, `scrollHeight`, `scrollWidth` and
`elementFromPoint` from the console read back **9.6 rAF callbacks scheduled per frame** across about ten independent loops, with
**2.1 `scrollHeight` reads, 1.1 `scrollWidth` reads and 2.6 rect reads per frame** interleaved between those loops' transform
writes — a forced layout several times a frame. Two of the loops (both marquees) ran off-screen forever, and `useScrollProgress`
called `setState` every frame, which re-rendered the whole nav twice per frame because `ProgressRing` answered with a `setState` of
its own. Continuous scroll values belong in a ref written straight to the DOM; React state is for the booleans that actually change
the tree. Instrument the counters before optimising the shader.

**`max-width: 0` does not collapse a box that has padding.** Everything here is `box-sizing: border-box`, and a border-box element
cannot shrink below its own padding — so a `max-width: 0` element with `pl-2` still occupies 8px. This silently knocked the nav mark
4px off centre. Animate the padding alongside the width, or put the spacing on a parent that also collapses.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

