# ARCHITECTURE.md

System structure, modules, dependencies, and where code lives. Read this before searching the tree — it is meant to save you the
search.

## Shape

One Next.js application at the repo root. There is no separate backend service and no database. Every page renders statically; the
only server code is the route handlers under `app/api/`, which exist to deliver form submissions.

It is **not deployed on Vercel.** Production runs as a Node server we control — `next start` behind a reverse proxy. That matters
in three places: anything reading `x-forwarded-for` depends on the proxy setting it, module-scope state in a route handler is
shared across requests (one process, not one instance per request), and `NEXT_PUBLIC_APP_URL` has to be set in the environment
because nothing defaults it.

```
geekinate/                   the repo, and the application
  AGENTS.md  ARCHITECTURE.md  WORKFLOW.md  QUALITY_AND_SAFETY.md  CLAUDE.md
  geekinate new logo/        brand source assets (see Design system)
  docs/                      briefs written elsewhere and pasted in — the request, not our source
  app/  components/  features/  lib/  constants/  scripts/  public/
```

The repo is named `geekinate`; the folder it is checked out into locally is `geekinate-v2`. The sibling folder `geekinate-v1` is
the archive of the two older sites and holds nothing from this build.

## Module map

| Path | Holds | Notes |
|---|---|---|
| `app/` | Routes only | Pages compose components and do nothing else |
| `app/api/` | Route handlers | `contact/` and `partner/`, both POST-only. The only server code in the project |
| `components/layout/` | Presentational primitives | `Section`, `SectionHead`, `Eyebrow`, `PageHero`, `Card`, `Actions`, `CtaBand`, `StepIndex`, `JsonLd`, `Footer` |
| `components/ui/` | shadcn output | CLI-generated; fork only deliberately |
| `features/` | Page sections | One folder per section, `index.jsx` entry |
| `lib/ui/reusable_components/` | Client components that own behaviour | `BrandMark`, `ClientLogo`, `HoverVideoCard`, `WorkTile`, `VideoSurface`, `InViewVideo`, `SocialIcon`, `TestimonialCard`, `TestimonialMarquee`, `useHoverVideo`, `contact-form/`, `referral-form/`, `cosmos/`, `grain/`, `marquee/`, `nav/`, `preloader/`, `smooth-scroll/`, `substrate/` |
| `lib/boot/ready.js` | The one boot signal the shell shares | `markGlobeReady()` from the canvas, `watchGlobeReady()` from the preloader |
| `lib/scroll/` | Scroll position, stage and the Lenis handle | `progress.js` (the offset singleton), `stage.js` (`heroOut`/`footerIn`), `controller.js` (holds the engine), `lock.js` (body-scroll hold) |
| `lib/input/` | Pointer and globe drag, as mutable singletons | `pointer.js`, `globe.js`. Read per frame, never through React state |
| `lib/globe/` | The globe **pose**, fit, shells and network | Never the particles — those belong to `cosmos` |
| `lib/shape/` | Point samplers the cloud morphs between | `cloud.js`, `glyph.js`, `pillars.js`, `order.js`, `snake.js` |
| `lib/content/index.js` | Every user-facing string for `/` and `/services/[slug]` | Sections read their copy from here |
| `lib/content/partner.js` | Every user-facing string for `/partner` | Rates and the earning window interpolate from `PARTNER` so they cannot drift |
| `lib/analytics.js` | Vendor-neutral event shim | `track()` pushes to `window.dataLayer`; no provider is installed |
| `lib/partner/intent.js` | Which form mode a CTA asked for | `chooseIntent()` from a CTA, `watchIntent()` from the form — same shape as `lib/boot/ready.js` |
| `lib/seo.js` | Metadata + JSON-LD builders | Single definition of metadata shape |
| `lib/utils.js` | `cn`, `orderLabel` | shadcn's class merger, and the shared `01/02/03` label |
| `constants/index.js` | `SITE`, `LAYOUT`, `NAV_LINKS`, `NAV_CTA`, `SOCIALS` | Site identity and static data; `export *` over every sibling file |
| `constants/cosmos.js` | Every tunable the particle canvas reads | Camera pair, morph easing, `globeRoutes`. Read the note at the top before changing the camera |
| `constants/globe.js` | Globe geometry and `GLOBE_PALETTE` | Volt, paper and black. There is no approved blue |
| `constants/preloader.js` | Every tunable the preload gate reads | Ring geometry, milestone weights, the timing floor and the failsafe |
| `constants/marquee.js` | The ticker's transcribed Stokt values | Speed, gap, fade width, padding — measured, not guessed |
| `constants/partner.js` | Commercial terms and form limits | `PARTNER` rates/window/limits, `PARTNER_EVENTS` names. Rates are fixed product requirements, not design values |
| `constants/{cta,grain,substrate,work,lab}.js` | Per-feature tuning numbers | One object per file, named after the file |
| `constants/snake.js` | Tunables for the retired 3D mark | **Mostly dead** — see *Dead code* below. `SNAKE.scrollLerp` is still live, read by `smooth-scroll` |
| `scripts/` | One-off build scripts | `sample-g-path.mjs`, `build-land-mask.mjs`; run by hand, never at runtime |
| `public/brand/` | Mark, lockups, app icon | Brand asset source of truth |

### Dead code

`lib/ui/reusable_components/snake/` and `lib/curve/` are **not mounted or imported by anything**. They are the first 3D mark,
which `cosmos/` replaced on 2026-08-13 when the two scenes became one. They are kept for reference, not because anything runs
them — do not extend them, and do not reason about the current mark from them. The one live thread out of that build is
`constants/snake.js`, which still supplies `SNAKE.scrollLerp` to `smooth-scroll`; `lib/curve/` reads the rest of `SNAKE` but
nothing reads `lib/curve/`.

The split between `components/layout` and `lib/ui/reusable_components` is by **kind**, not convenience: the former is
presentational and mostly server-rendered, the latter holds client components with their own state and effects.

Barrels: `components/index.js` and `lib/ui/reusable_components/index.js`. A new file in either directory is unreachable through the
barrel until it is exported there.

### Page sections

Shape inherited from `../Eleve/development/frontend`:

- `features/<name>/index.jsx` — one page section, one folder, default export named for the folder. Imported as `@/features/services`,
  never `@/features/services/Services`. Sections compose `components/layout` primitives and never import each other.
- `lib/content/index.js` — every user-facing string. Sections destructure their content object on the first line of the component.
- `app/` pages compose sections and do nothing else.

Built so far, in page order: `features/hero` (01), `features/clients`, `features/work` (02), `features/services` (03),
`features/testimonials` (04), `features/cta`, `features/contact`. The service detail route adds `features/service-hero` and
`features/service-dossier` (which owns `Scope.jsx`, `Process.jsx` and `Deliverables.jsx`), and reuses `features/contact`.
`features/partner` holds `/partner`'s fourteen sections; `features/lab` is the `/lab` prototype and is not part of the site.

**Four layout primitives are shared between `/partner` and `/services/[slug]`**, exported from `@/components`: `PageHero` (the
`clear` `min-h-svh` masthead — eyebrow, italic display `h1`, support copy, actions, an optional right-hand `aside`, then a
`Separator` over a mono proof strip), `Actions` (the pill pair), `Card` (the glass panel with `ring-edge` and `shadow-brutal`) and
`CtaBand` (the centred italic closing band). `PageHero` renders the split grid when an `aside` is passed and a single centred
column when it is not — `/partner` passes `FlowRail`, the service pages pass nothing. `Actions` takes a `link` component and a
`meta` mapper so `/partner` can route every pill through its analytics `TrackedLink` while the service pages use a plain
`next/link` with no props leaking onto the anchor. Build a new marketing page out of these rather than a fifth variant.
Section numbers live in the eyebrow copy in `lib/content/index.js` — renumber there if the order changes. The hero carries no copy yet,
so it has no entry there.

## Routes

| Route | File | Rendering |
|---|---|---|
| `/` | `app/page.js` | Static. Composes hero, clients, work, services, testimonials, cta, contact |
| `/services/[slug]` | `app/services/[slug]/page.js` | SSG. One route serves all three services; `generateStaticParams` reads `services` in `lib/content/index.js`, `dynamicParams` is `false` so anything else 404s |
| `/partner` | `app/partner/page.js` | Static. Referral Partner Program — 13 sections from `features/partner`, plus `FAQPage` JSON-LD |
| `/lab` | `app/lab/page.js` | Static, `noindex`. Background prototype — not part of the site |
| `/api/contact` | `app/api/contact/route.js` | Dynamic. Contact form endpoint |
| `/api/partner` | `app/api/partner/route.js` | Dynamic. Dual-intent referral endpoint — see **The referral form** |
| 404 | `app/not-found.js` | Static |
| `/sitemap.xml` | `app/sitemap.js` | Static. Home is listed by hand; the service routes are derived from `services` |
| `/robots.txt` | `app/robots.js` | Static |

`app/layout.js` owns fonts, metadata, the site JSON-LD graph, `Preloader`, `Nav`, `Footer`, and the toaster.

## Layout

**Sections are full width. There is no container and no max-width.** `Section` is the layout box: it carries the only horizontal
gutter on the page, `px-6 md:px-10` — 24px, 40px from `md` — and nothing caps how wide its children grow. A `Container` primitive
used to cap content at 1240, 1440 on the two grids; it was removed on 2026-08-07 at the user's direction. Re-introducing a centred
max-width wrapper is a decision to raise, not a detail.

Two things follow. Grids get the whole viewport minus the gutter, so column counts have to hold up on a wide monitor rather than
inside a 1240 box. And overriding the gutter needs **both** breakpoints — `px-0 md:px-0` — because twMerge tracks responsive
variants separately and a bare `px-0` leaves `md:px-10` standing.

`Section` also carries `relative z-10`, which is what lifts every section over the fixed 3D canvas at `z-0`. Opaque variants
therefore occlude the mark and transparent ones let it through — see *The 3D mark* below.

## Design system

Tailwind v4, CSS-first. **No `tailwind.config.js` exists and adding one is a regression** — the theme lives in `app/globals.css` in
two blocks that do different jobs:

- `:root` — raw brand values, plus shadcn's semantic tokens mapped onto them (`--primary: var(--volt)`, `--border: var(--ink)`).
- `@theme inline` — re-exports those as `--color-*`, `--font-*`, `--shadow-*`, which is what generates the utilities. A new brand
  colour needs an entry in **both** blocks or the utility will not exist.

Palette and geometry are transcribed from `geekinate new logo/geekinate-homepage-v2.html`; see AGENTS.md for the token table and the
rule against inventing values.

## SEO

- `lib/seo.js` is the only place the metadata shape is defined. `buildMetadata({ title, description, path, image })` returns title,
  description, canonical, OpenGraph and Twitter in one object. Pages call it rather than hand-rolling `metadata`.
- `metadataBase` is set once in `app/layout.js`; that is what makes relative canonicals resolve. The title template lives there too.
- JSON-LD is one `@graph` per page through `components/layout/JsonLd.jsx`. Organization is the anchor; `WebSite` and `Service`
  reference it by `@id`. Preserve that linkage when adding node types.
- `next.config.mjs` sends `X-Robots-Tag: noindex, nofollow` on any `*.vercel.app` host so previews cannot outrank production.
  **That host pattern predates the move off Vercel** — see Known gaps.

## The 3D mark — the retired `snake` build

> **This section documents dead code.** `lib/ui/reusable_components/snake/` and `lib/curve/` were the first 3D mark and are
> **mounted nowhere**; `cosmos/` replaced them on 2026-08-13, when the separate globe and hero scenes became one particle system.
> Nothing below describes what currently renders. Numbers here — 18000 dots, volt with normal blending, the sliding window over a
> single spine — are the retired build's, not the live one's.
>
> **The live system is `lib/ui/reusable_components/cosmos/` with `lib/globe/`, `lib/shape/` and `constants/cosmos.js`**, and it is
> described in `AGENTS.md` §Boundaries ("One particle system holds the whole page, and it wears three shapes"). It is not yet
> written up here — see Known gaps.
>
> The section is kept because most of the mechanics below were expensive to learn and several still hold: the SVG-outline trap,
> the silhouette arithmetic, the curvature measurements, and the reduced-motion and scroll-state rules at the end. Read it as
> lessons, not as a map.

Built to the brief in `docs/geekinate-hero-3d-prompt.md`, which specifies five phases. Phases 1 and 2 were built: the letterform
rendered, and the scroll-driven unravel and reassembly worked.

| File | Responsibility |
|---|---|
| `scripts/sample-g-path.mjs` | Bakes the centreline to `lib/curve/g-points.json`. Run by hand |
| `lib/curve/gCurve.js` | JSON to a `CatmullRomCurve3`, with a shallow sine in Z |
| `lib/curve/journeyCurve.js` | Region B. Waypoints from constants, lead points from the letterform's end tangents |
| `lib/curve/masterSpine.js` | A + B + C as one curve, and the sliding window over it |
| `lib/scroll/progress.js` | The single scroll-progress store. A mutated module singleton, deliberately |
| `constants/snake.js` | Every tunable |
| `smooth-scroll/index.jsx` | Lenis at the app shell. Renders nothing |
| `snake/index.jsx` | Fixed full-viewport wrapper; dynamic-imports the scene with `ssr: false` |
| `snake/Scene.jsx` | `<Canvas>`. No lights, no environment — points are unlit |
| `snake/SnakeDots.jsx` | The particle cloud, the per-frame window, the pointer gather, the camera rig |

Mechanics worth knowing before editing:

- **`public/brand/geekinate-mark.svg` is a filled outline, not a stroke.** Sampling its path traces the *edge* of the letter and
  produces a tube running around the glyph rather than through it. The outline does carry a dead-uniform 260-unit stroke width, so
  the centreline is exact arithmetic — five straight runs and four quarter-arcs of radius 235 — and no tracing library is needed.
  The derivation is written out at the top of the generator. **Never sample the SVG at runtime.**
- The centreline is an **open spiral** of roughly one and a half turns: tail at the bottom spur, head at the bar tip inside the
  bowl. Being open it has no seam, so the brief's advice about hiding the join in the letter's gap does not apply here.
- **Silhouette is the centreline bounds grown by the tube radius on every side.** Sizing off the bounds alone under-reads the mark
  by twice the radius, which is 17% of its width. Scale is derived per frame from `viewport` rather than fixed, because the camera's
  field of view is vertical and a fixed scale that frames well on a laptop runs off both edges of a phone.
- **Tube radius is capped by the bowl's aperture.** The bar tip and the right-hand run sit 0.18203 apart in normalised units, so
  anything from 0.091 up closes the opening the head has to travel out through from Phase 2 onward. It runs at 0.085.
- **The mark is a particle cloud, not a solid tube.** That was a direction change on 2026-08-10: the reference is the centre
  element on thestart.com.au, which the brief's §15 explicitly said not to copy. The instruction supersedes the brief; raise it in
  the Asana thread rather than reverting it. Points are unlit, so the material, taper, gradient, three lights and the whole
  environment rig came out with the tube.
- 18000 dots, each with a fixed place in the ribbon — distance along the window, angle, radius, shade — recomputed into a position
  every frame. **Fixed, not re-randomised:** rolling new values per frame boils the cloud instead of carrying it along the spine.
  Radius is `sqrt` of a uniform random, which fills the volume evenly; a raw uniform crowds the axis and leaves the surface bare.
- Frames are cross-product, not Frenet. The dots sit symmetrically around the axis, so the frame's roll is invisible and none of
  Frenet propagation's flipping is worth paying for.
- **Volt, with normal blending.** Paper-white additive dots were built first and read beautifully on the black hero, then vanished
  completely over the white Work and Testimonials sections. Volt is the one palette token with contrast against both grounds, and
  it forces opaque normal blending, because additive light dots on white saturate to nothing.
- The pointer gathers dots toward itself and tints them paper, measured off the reference, which gathers rather than repels. It is
  tracked on `window`, not through R3F's `state.pointer`, because the canvas is `pointer-events: none` and so receives no events.
- **The canvas is a sibling of the hero section, never a child.** See the stacking-context trap in `AGENTS.md`.
- The camera pans after the window's centre. Not decoration: see the curvature note below.

### The spine and the window

One curve — letterform, journey, letterform — with a fixed-arc-length window sliding along it. Not a morph between two shapes: the
unravel and the reassembly are both just the window moving, so neither needs any code of its own.

- **The window is exactly the letterform's arc length** (`windowSlack` 1). Shorter and the G never looks complete at either end.
- **The journey is resampled to the letterform's point spacing before concatenation.** A Catmull-Rom answers a spacing jump with a
  curvature spike, and the raw gap between the two regions is 0.012 against 1.3.
- **Curvature is a measured quantity here, not an aesthetic one.** Turn rate in degrees per unit of arc: the letterform's own
  corners run about 410 and are the ceiling, because those corners are what the mark already reads correctly through. Current spine:
  joins 32 and 39, journey 367. Tightest radius of curvature anywhere is 0.139 against a tube radius of 0.085 — below that the tube
  passes through itself. **Re-author the journey and re-measure; do not eyeball it.**
- Geometry is rebuilt every frame from the window and the previous one disposed, which is the brief's accepted v1. The rebuild is
  skipped when damped progress has not moved by `progressEpsilon`, so a hero at rest costs nothing.
- Scroll never touches React state. Lenis writes `raw`, the scene damps toward `damped` inside `useFrame`, and the tube reads only
  `damped`. A re-render per scroll frame would cost more than the scene it drives.
- **`html { scroll-behavior: smooth }` had to come out of `globals.css`.** Lenis drives the scroll position itself and the CSS
  smoothing fights it; anchor links are handed back to Lenis through its own `anchors` option.
- Under `prefers-reduced-motion` **Lenis is never instantiated** and the window stays parked on Region A. The journey is the whole
  effect and there is no meaningful quieter version of it, so the honest reduction is no motion at all.

## The navbar

`lib/ui/reusable_components/nav` — a measured reconstruction of antimetal.com's navbar, with one deliberate deviation: Antimetal
splits links and CTA into separate left and right pills; ours merges them into a single right-hand `MenuPill`.

| File | Responsibility |
|---|---|
| `index.jsx` | Two-pill rail, collapse threshold, mobile repositioning |
| `GlassPill.jsx` | Shared glass capsule surface |
| `ProgressRing.jsx` | Scroll progress as a stroke tracing the pill outline |
| `NavLinks.jsx` | Links plus the sliding hover highlight |
| `useScrollProgress.js` | Lerped scroll progress and raw offset |

Mechanics worth knowing before editing:

- Progress is a **stroke on the pill's own outline**, not a bar. `pathLength="1"` plus `stroke-dasharray: 1` makes
  `stroke-dashoffset` literally `1 - progress`; the head dot uses `getPointAtLength(progress × getTotalLength())`. Both forms are
  correct regardless of how a browser scales `pathLength` — do not change one without the other.
- The ring's width comes from a `ResizeObserver` on the pill, not the target constant, because the pill spends 600ms mid-transition
  and the outline has to follow the painted box.
- **One threshold governs both the collapse and the ring: half way down the hero.** Above it the pill is a wide bar with no ring;
  crossing it collapses the bar to the mark and starts the ring from empty. The ring never draws on the wide bar. Progress is
  remapped onto `threshold → page bottom` rather than being raw page progress, so it genuinely starts at zero when it appears.
- The threshold measures `#hero` when that section exists and falls back to half the viewport until then. A hero built without that
  id silently gets the fallback.
- `useScrollProgress` returns three values and the split matters: **raw `offset`** drives the collapse so bar becomes pill exactly at
  the threshold, while **lerped `smoothOffset`** drives the ring so it trails. That reproduces a smooth-scroll feel without adding
  Lenis site-wide, and snaps instantly under `prefers-reduced-motion`.
- All nav state updates inside the rAF tick, so a throttled tab leaves it stale until focus returns. Fine for users, but it means
  programmatic scrolling in a background tab cannot verify this component — use real wheel events.
- The centre pill animates `width`. This is intentional and matches the source; a transform-scale substitute would distort the glass
  and desync the ring geometry.
- **Both rails retreat while the footer is against them**, or the pills sit on its column headings and its copyright line. Each
  leaves by its nearest edge; the fixed bottom pill clears its own 16px offset too (`calc(100% + 1rem)`), or a sliver stays on
  screen. The links remain in the DOM and focusable while off screen, as they do on the reference.
- **The retreat trigger is the collision line, not the footer entering the viewport.** An `IntersectionObserver` on the `<footer>`
  with default options fires the moment one pixel of it clears the bottom edge — a whole viewport of scrolling too early, so the
  nav disappears while the section above still fills the screen. A negative bottom `rootMargin` shrinks the observation box to the
  rail's own strip (rail height + 24px of lead), so intersecting means the footer has genuinely reached the rail. That margin
  depends on viewport height, so the observer is rebuilt on resize.
- Stokt does fire on plain viewport entry — its navbar leaves a full screen early — and that was rejected here on sight
  (2026-08-07). The retreat itself is theirs: translate the whole bar by its own height, ease it back on the way out.

## Hover-to-play video

Two sections use it, so the behaviour lives in one place:

- `useHoverVideo` — owns the ref and the enter/leave handlers. Leave **rewinds to frame 0** rather than pausing in place, which is a
  deliberate deviation from Stokt; resuming mid-motion on re-hover reads as a stall. Playback is skipped entirely under
  `prefers-reduced-motion`.
- `VideoSurface` — renders the `<video>` (`loop`, `muted`, `playsInline`, `preload="metadata"`, poster) or, when `media.sources` is
  empty, a marked *Media pending* panel. Nothing ever points at a missing file. `fit` picks `contain` or `cover`.

The pending panel is black even on light sections, because tiles overlay light text on their media and a pale placeholder would make
that text unreadable.

## The preload gate

`lib/ui/reusable_components/preloader` is the first child of the body and the last thing to leave. It is a black overlay at
`z-[100]` — above the nav's `z-50` and the grain wake's `z-20` — carrying the volt `BrandMark` at viewport centre, a grain ring
orbiting it, and a percentage in the bottom-right corner.

**It reuses the cursor wake's particle pool rather than growing a second one.** `grain/pool.js` used to read `GRAIN.ringRadius`,
`ringOrbit`, `ringPerSecond` and `ringLife` straight out of the constants, which pinned the ring to one size. `shedRing` and
`stepGrain` now take a ring descriptor — `{ x, y, presence, radius, orbit, rate, life }` — so the cursor passes its 34px ring and
the preloader passes its 100px one into the same maths. Both callers build that object once and mutate it per frame; nothing
allocates inside the loop.

The gate is driven by three milestones, weighted in `constants/preloader.js`: fonts ready, document complete, and the globe's first
painted frame. The third arrives through `lib/boot/ready.js` — `CosmosCanvas` already had an `onFirstFrame` callback for dropping its
CSS stand-in, and it now calls `markGlobeReady()` from the same place. The displayed number eases toward whichever is larger, the
weighted milestone total or a slow drift, and is capped below 100 until every milestone lands.

Two limits keep it honest in both directions. `minMs` stops a warm cache flashing the overlay for three frames. `maxMs` is a
failsafe: if WebGL never initialises, or the tab is throttled so `requestAnimationFrame` never runs, the loader completes on time
anyway rather than trapping the page behind a black screen. The overlay holds `overflow: hidden` on `html` while it is up and
restores the previous value the moment it starts fading, so the page is scrollable through the fade.

Under `prefers-reduced-motion` the canvas work is skipped entirely — mark, counter and gate stay, the orbit does not.

## The client marquee

`features/clients` sits directly under the hero and is the site's first opaque section, which is what closes the globe off. It is
`variant='paper'` — light ground, as on the reference — and being opaque is the point: on `clear` the fixed 3D canvas shows straight
through the strip and the logos fight the globe's particles. It carries no eyebrow; the strip is the whole section.

The ticker itself is `lib/ui/reusable_components/marquee` — a generic component that takes any children and loops them. Values in
`constants/marquee.js` are **transcribed from `wearestokt.com`, not invented**: they were read off the live Framer `Ticker`
component's props and its computed styles, and the running speed was measured back at 40.00 px/s in this build. Changing any of
them is a design decision, not a tidy-up.

| Value | What it is |
|---|---|
| `speed: 40` | Pixels per second, leftward |
| `gap: 150` | Between items, and between the repeated groups |
| `fadeWidth: 46` | Total percentage of the strip spent fading, split across the two edges — `mask-image` stops land at 23% and 77% |
| `padding: 10` | The frame's own padding |
| `hoverFactor: 0.25` | **Ours, not Stokt's** — the pace the track eases to while the pointer is inside the frame |
| `hoverEase: 0.08` | **Ours** — the per-frame lerp toward that pace, so hover reads as a slow-down, not a switch |

The track is measured rather than guessed: a `ResizeObserver` reads the first group's width, and the component renders exactly
enough copies to cover the frame plus one. The wrap span is a group's width plus the gap, so the loop is seamless at any viewport.
Hover is ours, not Stokt's. Pointer entry eases the track to `hoverFactor` of its speed through a per-frame lerp of
`hoverEase`, and every `ClientLogo` crossfades to its colour export over the same beat. A full stop was rejected — the strip has
to keep moving.

`ClientLogo` is a `next/image` over the real marks. The source files the client supplied on 2026-08-27 sit untouched in
`public/media/clients/`; each was flattened to a single-colour glyph in `--ink`, trimmed, and exported as a 160px-tall
transparent WebP under a kebab-case name — twice over, as the ink glyph and an original-colour `*-color.webp` that the component
stacks behind it and crossfades up on hover. `clients` in `lib/content/index.js` carries `{ name, src, width, size }` — width is the file's own,
`size` is the display height in pixels. **Heights are deliberately not uniform**: a uniform height makes the compact lockups
(Elevé, LVL AZN) read tiny beside wide wordmarks — flagged by the user on sight — so each mark's `size` approximates equal
visual area (height ∝ 1/√aspect, clamped to 28–58) and `md` scales all of them by 1.15 through the `--logo-h` custom property.
Two conversion recipes were needed: darkness-as-alpha for marks on white or transparent ground (this is also what discards LVL
AZN's white sticker outline and every white backing), and
colour-distance-from-background for LinkTax, whose source is light type on a solid blue JPG — its floor threshold exists
because boosted JPG noise otherwise survives as a grey wash. The originals stay in the folder as the source of truth for
re-exports; only the `.webp` files are referenced.

## The featured work section

`features/work` — section 02: the existing tile grid, now presented inside riseatseven.com's work-section treatment, measured live
at 1905×911 on 2026-08-27 — a light frame with a pinned dark panel that the grid scrolls through. The reference's *inner* design
(project-name list, side images) was explicitly not copied; only the frame and the scroll mechanics were.

The measured anatomy, and ours next to it:

| Piece | Reference | Ours |
|---|---|---|
| Light gutter | `px-4 md:px-7` on #efeeec | Same paddings, `bg-paper` |
| Runway | 6473px tall block, plain flow | Height set from the grid: content height + 2 × 28px, floored at one viewport |
| Pinned wrapper | `sticky top-0`, viewport-high, `py-7` | Same, from `lg` only |
| Dark panel | #111212, `rounded-3xl`, `overflow-hidden`, fills wrapper | Same but `bg-black`, per the dark-fill rule |
| Content motion | Columns scrubbed `y`, `ease: none`, `top top → bottom bottom` | The whole grid, same mapping — 1:1 with page scroll |

Mechanics worth knowing before editing:

- **The runway height is written by a `ResizeObserver` on the grid**, so tile media loading or viewport changes re-fit it, and each
  write calls `ScrollTrigger.refresh()`. The scrub's ends are `top top → bottom bottom` with function-based values, so the mapping
  stays 1:1 whatever the runway becomes.
- **The section is `variant='clear'` with `bg-paper`, deliberately not `paper`.** Everything visible inside it is the black panel,
  so the content wants the root dark-side tokens, and the nav's surface detection (below) must not read the section as a light
  band. The paper class here would be wrong twice.
- **Pinning is `lg`-and-`prefers-reduced-motion`-gated through `gsap.matchMedia`.** Below `lg`, or reduced, the runway height is
  cleared and the panel is just a dark rounded box the page scrolls past — the reference disables its pin on touch the same way.
- The grid itself is unchanged: three columns, 16px gaps, 10px tile radius, span rhythm **2+1 / 3 / 1+1+1**, aspect following span,
  degrading to two columns then one below `lg`. **The rhythm needs exactly six projects** — `span` values in `lib/content/index.js`
  change with the count. Tiles overlay title and discipline chips on the media with no scrim; a project with no `href` renders a
  `div` rather than a dead link.

**The nav reads page surfaces from live layout, and this section is why.** `Nav` classifies the pill's ground by `.on-paper` bands
measured from the DOM; those offsets go stale the moment a runway height is written after mount — every section below shifts by
~1.7 viewports and the ring paints ink over black (found on the CTA, 2026-08-27). The bands are re-measured by a `ResizeObserver`
on `document.body`, so any layout-height change — this runway, media loading, a future pinned section — refreshes them.

## The services section

`features/services` renders four `HoverVideoCard`s inside a dark `Section` — one row of four at `xl`, two up at `sm`, stacked below
that. Modelled on wearestokt.com's services grid, measured live.

Four cards abreast need width: much under 280px each and the media box is too small for the loops to read. Full-bleed sections give
them the whole viewport, which is what lets the single row hold at `xl`.

The effect there is entirely the **video content**, not the code: each card holds one `<video>` — `loop`, `muted`, `playsInline`,
`preload="metadata"`, `autoplay` off, poster shown until playback starts, `object-fit: contain`. Hover plays that card's video only.

Two deliberate deviations from the reference:

- **Mouse-leave rewinds to frame 0**, where Stokt pauses in place. Resuming mid-motion on re-hover reads as a stall.
- Cards carry a **1px gradient ring** (`linear-gradient(126deg, …)` behind an inset fill) rather than a flat border. Stokt does the
  same trick; it is what stops a large dark card reading as a plain rectangle. On our black section the ring is paper at low alpha.

The clips are cut on black, so the media box **bleeds to the card's edges** — `-mx-5` cancels the card's own padding, the card
clips it, and the video carries `mix-blend-screen` so its ground drops out into the card fill instead of reading as a rectangle
sitting inside it. A clip on any other ground will not survive that blend. The box is `aspect-square`; it was `9/10` until the
cards read too tall (2026-09-02). Both clips are listed with `loop: false`: each plays once per hover and holds its last frame
instead of rewinding.

The Development & AI card runs `ai.mp4`. A drawn canvas workflow board — nine modules wired by PCB traces, a run walking down to
the output — was built to replace it and rejected on 2026-09-03; the clip stays. The board is recoverable from commit `31ae7fb`
if the idea comes back, and should not be rebuilt from scratch.

A card with no `media` renders **no media box at all** — the Marketing card has run that way since its stock clip was cut on
2026-09-02 — so no `<video>` ever points at a missing file. Adding a clip is a content edit: drop the file into
`public/media/services/` and list it in `lib/content/index.js` as `{ src, type }`. The shipped clips are mp4; a webm has to be listed
first and always paired with an mp4 fallback, since Safari's webm support is unreliable.

Playback is skipped entirely under `prefers-reduced-motion`.

## The testimonials section

`features/testimonials` — section 04, on white so it alternates against the black services block above it. Modelled on
wearestokt.com's testimonials block, measured live.

The head is **centred**, with a volt asterisk closing the sentence and a mono footnote in volt beneath it. That is why it does not
use `SectionHead`: that primitive is the left-aligned pattern with a grey body paragraph, and bending it to centred-plus-accent-
plus-footnote would cost more than reusing it saves. It composes `Eyebrow` directly instead.

The row is **full-bleed** — cards drift past both edges — so the `Section` drops its horizontal gutter with `px-0 md:px-0` (both
breakpoints, per the twMerge trap) and the header carries `px-6 md:px-10` itself.

| Measured | Value |
|---|---|
| Card | 370px wide, 14px radius, 32px padding, quote-to-attribution gap 32px |
| Attribution row | avatar 46px circle / name 16px / role 10px mono, gaps 16px and 6px |
| Track | 30px gaps, each card in a fixed 520px slot |

**The stagger is the anchor sequence, not the content.** Every card sits in a 520px slot anchored top, middle or bottom; the
sequence is authored per card on the reference and is transcribed as `ANCHORS` in `TestimonialMarquee`. Without it the row is a
flat strip. Quote lengths are deliberately uneven in `lib/content/index.js` for the same reason — equal-length cards flatten it too.

`TestimonialMarquee` owns the motion, with no animation library:

- The list renders **twice** and the offset wraps at half the track width. Any wrap point short of that shows the seam as a gap on
  the right edge. The duplicate copies are `aria-hidden`.
- A rAF loop advances the offset at 40px/s. **The frame id resets to `0` on cleanup** — StrictMode's dev remount otherwise sees a
  stale id and never schedules again.
- Pointer drag moves the same offset directly, with pointer capture so a drag that leaves the element still tracks. Hover pauses
  the drift.
- The cursor is hidden over the track and replaced by the reference's circular **DRAG** badge, positioned at the pointer.
- `prefers-reduced-motion` skips the loop entirely: the drift is the whole effect and there is no meaningful reduced version.

Twelve testimonials, because a wide viewport needs the list to fill twice over and `ANCHORS` is written for twelve. Changing the
count means changing that sequence.

## The pre-contact CTA

`features/cta` — the giant scroll-scrubbed line between Testimonials and Contact, on `ink` (black, paper type — built dark,
flipped light on 2026-08-27, flipped back to dark on 2026-08-28; both calls were the user's, so treat the surface as taste
still settling, not a derivable rule). A
measured reconstruction of riseatseven.com's "Ready to Rise at Seven?" section, taken live at 1905×911 on 2026-08-27. Set in
`font-sans` at `font-semibold` — Red Hat Display is the brand face nearest the reference's grotesque, and the serif was rejected on
sight as a different section.

The reference values were read out of the page's own GSAP runtime and confirmed against an rAF recorder sampling `(scrollY, x, y)`
through real wheel scroll — the tween-vars alone mislead here, because the sweep's from-value only shows up empirically. They live
in `constants/cta.js`:

| Measured | Value |
|---|---|
| Type | One line, `16vw` desktop / `30vw` mobile, weight 600 (the reference's 500 read thin at our sizes), `tracking -0.035em`, `leading-tight`, letters split into individual spans |
| Sweep | `x` from `+1.07 × viewport width` — the whole line starts off-screen right — to the **last word centred in the viewport** (measured off the word's own span, so the copy can change), `ease: none`, from `top 70%` |
| Drift | `y` from `dip` 0.16 to `drop` 0.44 × stage height across the same range — the reference starts at 0, ours starts one dip low so the line rises as it crosses — with the line anchored to the stage's **top**, not its centre |
| Letters | `yPercent -60, rotate 10` settling to 0 with `back.inOut(4)` — the reference ran duration 2.5 / stagger 0.35 from `top 77%`, ours runs 1 / 0.5 from `top 70%` to the unpin, because the centred rest pose lengthened the sweep and the reference timing finished every wave before its letter scrolled into view (2026-08-27) |

The three of those together are what make the motion read as the reference's: the line enters the frame at the bottom-right corner
already mid-wave, crosses the section diagonally — leftward from the sweep, upward because the page scrolls faster than the drift —
and leaves its tail high in the frame as the next block arrives. Start the line on-screen, or centre it in the trigger, and the
whole figure collapses into an ordinary marquee; that misread shipped once (2026-08-27) and was rejected the same day.

**The section pins, and that is ours, not the reference's.** Rise at Seven gives the line one viewport of passage, and at our line
lengths the tail was gone before it could be read — rejected on sight (2026-08-27), with the instruction to hold the section until
the whole line has been seen and only then hand over to Contact. So the `Section` wraps a tall scroll frame (`105svh`, `160svh`
from `lg` — tuned three times on 2026-08-27 against the live page: `280svh` too slow, `200svh` too fast, `240svh` still too slow
once the rest pose changed) with a sticky stage (`35svh` / `100svh`) pinned to its top; the stage owns the `overflow-hidden`.
The rest pose centres the line's **last word** — the brand name — not the line's tail; the earlier tail-at-50vw pose parked the
question mark at centre and was rejected for exactly that. Both tweens end at
`bottom bottom+=hold` before the frame unpins, so the sweep's length adapts to any viewport from the frame's own height. Retuning
the passage length means changing the frame heights *and* knowing the sweep stretches with them.

**The sweep's `hold` is 0, and that is the second user correction on this section.** The first cut held the settled tail for a
0.35-viewport beat before unpinning, which reads fine downward and is a dead zone upward: re-entering from Contact took three wheel
ticks of frozen frame before anything moved, and it was rejected for exactly that (2026-08-27) — the line must answer the first
tick of reverse scroll. Both tweens carry `hold: 0` now — the letter wave ends on the same unpin boundary as the sweep, where
scrub means motion in both directions immediately.

Mechanics worth knowing before editing:

- **The sweep endpoints are measured off the line itself**, so the copy can change length without retuning: the start pose puts the
  line's head `headVw` of a viewport past the right edge, and the rest pose reads the last word's own box and centres that. Both
  recompute on refresh through GSAP's function-based values plus `invalidateOnRefresh`.
- **The drift is a fraction of the trigger's height, not the viewport's.** The reference tuned `y: 400` against a `100vh` desktop
  trigger and hides the section below `lg`; ours renders at every width, and 0.44 × a `35svh` mobile trigger is what keeps the line
  inside the section there.
- The reference splits words into per-letter `div`s with no accessible text. Ours keeps the split spans `aria-hidden` behind an
  `aria-label` on the `h2`.
- ScrollTrigger is already registered and driven by Lenis in `smooth-scroll/index.jsx`; the section registers it again only because
  the registration is idempotent and the component should not depend on mount order.
- Under `prefers-reduced-motion` no tween is created: the line rests at the head pose with its tail clipped, letters settled.
- The section is deliberately hidden from no one — the reference shows this block only from `lg` up, which was judged a bug for us
  rather than a behaviour to transcribe.

## The footer

`components/layout/Footer.jsx` — site chrome, rendered from `app/layout.js` rather than composed into a page, so it is not a
numbered section. A measured reconstruction of wearestokt.com's footer, taken live at 1920.

| Measured | Value |
|---|---|
| Inset from the page edge | 16px on all four sides |
| Card radius | 12px |
| Inner padding | 24px |
| Card height | One viewport minus the inset — `calc(100svh - 2rem)` |
| Column heading | 18px, paper |
| Links, address, email | 16px, `--footer-mut`, `line-height 1.1`, `tracking -0.02em` |
| Heading-to-list gap / link-to-link gap | 16px / 10px |

The **12px radius** is the reference's, not the brand's 20px — the same call the work grid made at 10px, because both blocks are
transcriptions rather than compositions.

**The inset has been argued once already.** It was stripped on 2026-08-07 as container design — a light frame around a black panel
read as stray page background — and restored the same day once the testimonials row landed above it and the frame read as
intentional. Both positions are on record; do not "fix" it back without asking.

The card is **black** with the type sitting directly on the footage, no scrim, which is why `--footer-mut` (#b9c2bc) exists: it
was reserved for this surface long before the surface did.

The top row splits 50/50 — lockup, location and email on the left, four columns spread with `justify-between` on the right. Those
columns are `footerColumns` in `lib/content/index.js`: Index is `NAV_LINKS`, Socials is `SOCIALS`, and **Services is derived from the
`services` array in the same file** so the pillar list cannot drift from the section that renders it. Legal has no pages yet;
an empty `href` renders as plain text rather than a dead link, the same rule `WorkTile` follows.

`InViewVideo` fills the card. It is the third playback mode in the codebase and the only one not driven by hover: an
`IntersectionObserver` starts a **one-shot** render as the panel arrives and rewinds it on the way out, matching the reference,
where the clip plays once rather than looping. Autoplay is deliberately not used — a video at the bottom of the page would spend
bandwidth and decode budget before anyone scrolled to it. `VideoSurface` gained a `loop` prop for this; it still defaults to
`true`, so the hover surfaces are untouched. Playback is skipped entirely under `prefers-reduced-motion`.

**The navbar retreats over the footer** — the reference's behaviour, described under the navbar below. `Footer` carries
`relative z-50` to match `Nav`'s own so nothing shows through during the 420ms retreat.

## Dependencies and why

| Package | Why |
|---|---|
| `next` 16.3, `react` 19.2 | App Router, JavaScript, no `src/` |
| `tailwindcss` v4 + `@tailwindcss/postcss` | CSS-first theming |
| `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` | shadcn's runtime |
| `lucide-react` | Icon set shadcn is configured against |
| `sonner` + `next-themes` | Toaster; `next-themes` arrives only as sonner's peer |
| `shadcn` | The CLI, kept as a dependency by its own installer |
| `three`, `@react-three/fiber`, `@react-three/drei` | The 3D mark. Raised and approved 2026-08-10 against the standing no-new-deps rule |
| `lenis` | Scroll smoothing, and the clock the 3D mark runs on. Same approval, added with Phase 2 |
| `gsap` | The frame loop the whole site runs on — `gsap.ticker` drives Lenis, the canvases and the marquees — plus `ScrollTrigger` for the work pin and the CTA reveal. Same approval |

Deliberately absent: no form library, no data layer. Adding either is an architectural decision, not a detail — raise it first. The
3D stack is the one exception and it was granted for the hero brief specifically; the remainder of that brief's list — `zustand`,
`maath`, `leva`, `@react-three/postprocessing` — is approved in principle but **not installed**, because nothing built so far uses
any of it. Install each with the phase that needs it, not ahead of it. Scroll progress is a plain module singleton rather than
Zustand, which the brief explicitly allows and which costs one file.

**`zustand` and `zod` both resolve from `node_modules` today without being declared** — `zustand` arrives under
`@react-three/fiber`, `zod` under the `shadcn` CLI. So `import { create } from 'zustand'` will appear to work and then break the
day a transitive version moves. Anything this project actually depends on gets its own `package.json` entry.

## Known gaps

- **The live particle system is not documented in this file.** `cosmos/`, `lib/globe/` and `lib/shape/` have no section of their
  own; `AGENTS.md` §Boundaries is currently the only prose describing them, and *The 3D mark* below documents the retired build
  it replaced. Anyone working on the canvas has to read the code. This is the largest gap in this document.
- **`next.config.mjs`'s `X-Robots-Tag` rule only matches `*.vercel.app` hosts.** Production is not on Vercel, so if staging has
  moved off a `vercel.app` domain that rule protects nothing and the staging host is indexable. Confirm the real staging hostname
  and widen the rule, or the preview outranks production.
- **The in-memory rate limiter in `app/api/partner/route.js` assumes one process and a proxy that sets `x-forwarded-for`.** With
  no such header every visitor keys to `'local'` and one submitter throttles the whole site; under pm2 cluster mode or multiple
  containers each worker keeps its own counter and the limit silently multiplies. Neither has been verified on the real host.
- `SITE.ogImage` points at `/images/openGraph.png`, which does not exist. A 1200×630 image is needed; the square app icon is not a
  substitute because the metadata declares those dimensions.
- `constants/index.js` carries `// PLACEHOLDER` contact and social values.
- **Placeholder media, two kinds — check the filename prefix.** `stokt-*` was taken from wearestokt.com to exercise the layouts and
  **must not ship**; one services clip carries their wordmark on a keycap. `pexels-*` is Pexels stock, free for commercial use with
  no attribution, so it is safe to ship but says nothing about Geekinate. Replace both with real work. **No tile is on the
  *Media pending* panel any more** — Services' Marketing Systems card took a Pexels clip on 2026-08-07, since Stokt runs three
  service cards and there was no fourth render to transcribe.
- **Encode clips as H.264 (`avc1`) in MP4 or VP9 in WebM.** A clip that was H.265/HEVC (`hvc1`) rendered as a blank tile in Chrome on
  Windows, which cannot decode HEVC without Microsoft's paid extension — and it fails silently, with no media error event, so it
  presents as "not loading" rather than "unsupported". `WorkTile` carries `bg-ink` so a tile that has not painted still reads as a
  dark surface instead of dumping light overlay text onto the page background.
- **No poster images exist.** With `preload="metadata"` and no `poster`, a resting card can paint black rather than a first frame —
  reliably so in Safari. Produce a poster per clip alongside the loops.
- Services copy in `lib/content/index.js` is placeholder wording pending sign-off. The structure is settled.
- **The footer clip is `stokt-golf-ball-render.webm` — wearestokt.com's own render, with their wordmark printed on the balls. MUST
  NOT SHIP.** It is also 13MB and WebM-only, so Safari falls through to the black panel and every other browser pays for it on
  first paint. The replacement needs an H.264 MP4 alongside the WebM, a poster, and a far smaller file.
- `footerContent.location` reads `Remote — Worldwide` as a placeholder. The reference carries a city line there; confirm what
  Geekinate should say.
- **All twelve testimonials are invented**, names and roles included. They must be replaced with real, cleared quotes before this
  is public — fabricated client praise is the one placeholder on the page that is not merely unfinished. No headshots exist
  either, so the avatar renders the speaker's initials rather than stock faces standing in for clients.
- The footer's Legal column links nowhere — no privacy or terms page exists. `/partner`'s consent checkboxes therefore state the
  Privacy Policy as plain text with no link, and section 10 omits the `Read referral terms →` link entirely rather than pointing at
  a placeholder. Both need wiring when those pages exist, along with the `partner_terms_click` event.
- **`/partner` cannot actually deliver a submission yet.** `app/api/partner/route.js` returns `503 not-configured` unless
  `PARTNER_WEBHOOK_URL`/`CONTACT_WEBHOOK_URL`, or `RESEND_API_KEY` + `PARTNER_TO`/`CONTACT_TO` + `CONTACT_FROM`, are set. Until then
  every real submit shows the failure panel with the mailto fallback.
- No analytics provider is installed. `lib/analytics.js` queues events on `window.dataLayer` for whichever provider lands.
- `NAV_LINKS` points at anchors no section defines yet.
- **The hero has no copy.** No H1, no CTA, no eyebrow — the mark alone. The brief requires those to be real DOM above the canvas,
  and they wait on wording rather than being invented. Nothing in `lib/content/index.js` covers section 01 yet.
- **The 3D mark stops at Phase 2.** No camera rig, no length gradient, no taper, no post-processing, no mobile downgrade. Phases 3
  to 5 in `docs/geekinate-hero-3d-prompt.md` are unbuilt.
- **The journey is invisible.** Every section below the hero is opaque and sits above the canvas, so the mark only shows through
  the hero's own viewport and, at the very bottom, over the footer. Which sections go transparent is the brief's §9 per-section
  design decision and belongs to Phase 3, alongside the camera rig that frames the travelling head.
- **The journey waypoints are shape control points, not section keyframes.** They are tuned for curvature, not for where any
  section actually sits, and there are five of them because one had to be chamfered. Phase 3 re-authors them against real sections
  and adds the per-section swing the brief asks for.
- Frame rate has not been measured on real hardware. Verification ran under SwiftShader, which proves it renders, not that it is
  fast — and the per-frame geometry rebuild is the thing most likely to cost. Phase 5 owns the performance guards.
- The `nextjs-agent-rules` block at the bottom of `AGENTS.md` is written by `next dev` on every run and is **not** part of this
  document set. Commit it rather than fighting the diff.
