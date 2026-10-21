# ARCHITECTURE.md

System structure, modules, dependencies, and where code lives. Read this before searching the tree — it is meant to save you the
search.

## Shape

One Next.js application at the repo root. There is no separate backend service and no database. Every page renders statically; the
only server code is the three POST handlers in `worker/`, which exist to deliver form submissions.

**It runs on Cloudflare's free Workers plan** (since 2026-10-16). Before that, the plan was a Node server running `next start`
behind a reverse proxy, with a Vercel project as staging. The free plan caps a Worker at 10ms of CPU per request and 100,000
requests a day, while static asset requests are free and unmetered. So the site is built to keep pages off the Worker entirely:

| Piece | File | What it does |
|---|---|---|
| Static export | `next.config.mjs` | `output: 'export'` writes every route to `out/` as HTML plus RSC `.txt` payloads. `images.unoptimized`, because the export has no image server and every image here is already a small webp |
| Segment copy | `scripts/flatten-segments.mjs` | Runs after `next build`; works around the export's prefetch file names (AGENTS.md §Traps) |
| Worker config | `wrangler.jsonc` | Worker `geekinate-com`, `nodejs_compat`, assets from `./out`. `run_worker_first: ["/api/*"]` is the only route the Worker sees before the assets; `404-page` serves `out/404.html`; `auto-trailing-slash` maps `/partner` to `partner.html` |
| Worker | `worker/index.js` | Routes `/api/contact`, `/api/partner` and `/api/guide` to their handlers, answers 405 to anything but POST, and hands every other path back to `env.ASSETS` |
| Handlers | `worker/{contact,partner,guide}.js` | The former `app/api/*/route.js` files, moved unchanged apart from the visitor key. Each exports `POST(request)` and reads secrets from `process.env` |
| Mailer | `worker/mailer.js` | Shared by the contact and partner handlers. Sends over SMTP (port 587, `worker-mailer`) when `SMTP_HOST`, `SMTP_USER` and `SMTP_PASS` are set, through Resend's API otherwise; `CONTACT_FROM` is parsed from `Name <address>` |
| Throttle | `worker/throttle.js` | `createThrottle({ ms, max })` returns a per-isolate sliding-window check. Contact allows five per ten minutes, partner five a minute, the Guide `GUIDE.window` |
| Asset headers | `public/_headers` | `noindex, nofollow` on any `*.workers.dev` host, and a year's immutable cache on `/_next/static/*`. Cloudflare applies it to static responses only, never to the Worker's |

Deploys are Cloudflare **Workers Builds** in Nouman.digg@gmail.com's Account (pinned by `account_id`), connected to
`github.com/geekinate/geekinate` on `main`: build command `npm run build`, deploy command `npx wrangler deploy`. The live URL is
`geekinate-com.nouman-digg.workers.dev`. `wrangler` is not a dependency; `npm run preview` and `npm run deploy` pin it through `npx` instead.
Three consequences follow from the platform:

- **Module-scope state is per isolate.** A counter in a handler is shared only by the requests one isolate happens to serve, so
  the throttles in `worker/contact.js`, `worker/partner.js` and `worker/guide.js` are best-effort.
- **The visitor's address is `cf-connecting-ip`.** Cloudflare sets it, so nothing depends on a proxy.
- **`NEXT_PUBLIC_APP_URL` is a build variable.** It is baked into every page at `next build`, so it is set in the Worker's build
  settings, not with its runtime secrets. See AGENTS.md §Boundaries.

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
| `worker/` | The Cloudflare Worker | `index.js` routes `/api/*`; `contact.js`, `partner.js` and `guide.js` are the POST handlers. The only server code in the project, and outside Next: `next dev` does not run it |
| `lib/ai/` | The Guide's server half, and the page-control bus | `knowledge.js` (grounding, derived), `prompts.js`, `tools.js` (`goToSection`, `highlight`), `sections.js` (id lookup), `bus.js` (`runPageActions`) |
| `components/layout/` | Presentational primitives | `Section`, `SectionHead`, `Eyebrow`, `PageHero`, `Card`, `DeckCard`, `LiftCard`, `RollIndex`, `RollDie`, `Actions`, `CtaBand`, `StepIndex`, `JsonLd`, `Footer`, `HydrationSplit` |
| `components/ui/` | shadcn output | CLI-generated; fork only deliberately |
| `features/` | Page sections | One folder per section, `index.jsx` entry |
| `lib/ui/reusable_components/` | Client components that own behaviour | `BrandMark`, `ClientLogo`, `Cycle`, `HoverVideoCard`, `WorkTile`, `VideoSurface`, `InViewVideo`, `SocialIcon`, `TestimonialCard`, `TestimonialMarquee`, `useHoverVideo`, `contact-form/`, `referral-form/`, `cosmos/`, `grain/`, `guide/`, `hero-sheet/`, `marquee/`, `nav/`, `preloader/`, `smooth-scroll/`, `substrate/` |
| `lib/boot/ready.js` | The one boot signal the shell shares | `markGlobeReady()` from the canvas, `watchGlobeReady()` from the preloader |
| `lib/scroll/` | Scroll position, stage and the Lenis handle | `progress.js` (the offset singleton), `stage.js` (`heroOut`/`footerIn`), `controller.js` (holds the engine), `lock.js` (body-scroll hold), `sheet.js` (whether `HeroSheet` covers the hero) |
| `lib/input/` | Pointer and globe drag, as mutable singletons | `pointer.js`, `globe.js`. Read per frame, never through React state. The globe drag takes mouse and touch; `#hero` is `touch-pan-y` so a sideways swipe turns the globe and a vertical one still scrolls (mouse-only until 2026-10-08) |
| `lib/globe/` | The globe **pose**, fit, shells and network | Never the particles — those belong to `cosmos` |
| `lib/shape/` | Point samplers the cloud morphs between | `cloud.js`, `glyph.js`, `circuit.js` (the service mark), `pillars.js`, `order.js`, `snake.js`, and `footprint.js`: the glyph mask and cloud scale the footer automata read, so they never import the three-backed cloud |
| `lib/media/preload.js` | When a clip may start downloading | `preloadWhenNear` (one shared `IntersectionObserver`, a quarter viewport ahead) and `preloadAfterLoad` (hero clips, from window `load`) |
| `lib/content/index.js` | Every user-facing string for `/` and `/services/[slug]` | Sections read their copy from here |
| `lib/content/work.js` | The five projects and every string on `/work/[slug]` | One entry per project feeds its home-page tile and its case page; `href` is derived from `WORK.path` |
| `lib/content/guide.js` | Every user-facing string for the Guide | `guidedServices` picks the service pages that carry it; `jumps` labels the button under a reply |
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
| `constants/{cta,grain,sheet,substrate,work,lab}.js` | Per-feature tuning numbers | One object per file, named after the file. `WORK` is the case-page path and the related count |
| `constants/circuit.js` | The AI circuit mark's geometry and tuning, and `SERVICE_SHAPES` | Which service slug wears which shape; empty since 2026-09-18, so no page wears one |
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
`features/testimonials` (04), `features/contact` (which renders `features/cta` above itself). The service detail route adds `features/service-hero` and
`features/service-dossier` (which owns `Scope.jsx`, `Process.jsx` and `Deliverables.jsx`), and reuses `features/contact`.
`features/partner` holds `/partner`'s fourteen sections; `features/legal` renders both legal pages; `features/lab` is the `/lab`
prototype and is not part of the site.
The case route adds `features/case-hero` (which owns the hero's `Cover.jsx`) and `features/case-study` (which owns
`Intro.jsx`, `Stack.jsx`, `Brief.jsx`, `Solution.jsx` and `More.jsx`), and reuses `features/contact`.
`Scope`'s cards are `LiftCard`s with a `RollIndex`, on trial since 2026-09-17: on hover the card lifts 3px on the `ease-spring`
curve in `globals.css` while its shadow grows to 6px, each index digit rolls a strip of eleven glyphs up `10em` so it lands on
the digit it started from (the second digit 70ms behind), and the title and detail rise 2px after it. Leaving snaps the strips back
with no transition, so the roll only ever plays forward. The group is `group/lift` on a static wrapper, so the moving card never
slides out from under the pointer. It is CSS only: Tailwind's `hover` variants already require a hover-capable pointer, so
touch screens see still cards, and `motion-reduce` drops the movement. `DeckCard`, the shipped tip-and-sheet hover, is unused
but kept until the trial is decided; see `AGENTS.md`. Card titles are white and turn volt on the same hover (2026-09-16).
A slug in `DICE_SCOPES` (`constants/dice.js`; `games` only, since 2026-09-30) swaps `RollIndex` for `RollDie`: a CSS cube,
volt faces with ink pips and a 1.5px ink edge, sized by `--die` on its stage, whose front face is the card's number and whose
other faces keep opposite sides summing to seven. On hover it tumbles one whole turn on each of two axes (`DIE.rolls`, the
directions varying per face value) over 1.3s on an ease-out, and so lands on the number it started from; it shares
`RollIndex`'s snap-back on leave, which is invisible because the landed orientation is the resting one. The first cut rolled
two turns in 900ms and was called too fast (2026-09-30). The cube is pushed back half its depth (`translateZ(calc(var(--die)/-2))`
ahead of the rotations) so the resting face sits on the page plane; see the trap in `AGENTS.md`. The stage and cube are
`block` spans: an inline span ignores `size-*`, and the die collapses to nothing.
`Process` and `Deliverables` are both thin server components over `Cycle` (`lib/ui/reusable_components/Cycle.jsx` since 2026-09-24,
when the case page's Solution became its third user and it left the dossier so sections would not import each other): it draws the
sticky header and the numbered list, and owns the active row, an `IntersectionObserver` that starts the autoplay once half of the
list is on screen, and the hold on hover or focus over the list only. `Deliverables` passes `mirror`, which flips the grid to
`8fr_4fr` and puts the `ol` in `lg:order-first`, and runs it on an `ink` band; the row colours are token-based
(`text-foreground`, `text-mut`) so the same component reads on paper and on black. `PROCESS` in `constants/process.js` carries the dwell and the in-view share; the bar's fill is the
`step-fill` keyframe in `globals.css`, its duration set inline from the same constant so the two cannot drift. See `AGENTS.md`.

**Four layout primitives are shared between `/partner` and `/services/[slug]`**, exported from `@/components`: `PageHero` (the
`clear` `min-h-svh` masthead — eyebrow, italic display `h1`, support copy, actions, an optional right-hand `aside`, then a
`Separator` over a mono proof strip, dropped with its rule when `proof` is empty — Games has no facts row since 2026-09-30), `Actions` (the pill pair), `Card` (the glass panel with `ring-edge` and `shadow-brutal`) and
`CtaBand` (the centred italic closing band). `PageHero` renders the split grid when an `aside` is passed and a single centred
column when it is not — `/partner` passes `FlowRail`, and every `/services/[slug]` whose slug is in `SERVICE_CLIPS` (all three since
2026-09-22) passes `Clip`, the square that runs the service's own `media` through `VideoSurface` and
`useHoverVideo({ introduce: true })` on `ground-patch`, so `mix-blend-screen` has the page's own ground to drop the clip's black
onto; a slug outside that list passes nothing and centres. `ground` in `globals.css` is that
ground — the `--void` fill and the two fixed radial glows, applied to `html` itself and reused by the patch; `ground-patch` adds
the edge feather that keeps the patch from reading as a box once the sheet's transform re-anchors the fixed gradients.
`CtaBand` sets its volt trail as a `block` span, so the closing line always breaks before it. `Actions` takes a `link` component and a
`meta` mapper so `/partner` can route every pill through its analytics `TrackedLink` while the service pages use a plain
`next/link` with no props leaking onto the anchor. Build a new marketing page out of these rather than a fifth variant. Both pages
pass their hero to `HeroSheet`, so everything after it slides up over it — see **The hero sheet**.
Section numbers live in the eyebrow copy in `lib/content/index.js` — renumber there if the order changes. The hero carries no copy yet,
so it has no entry there.

## Routes

| Route | File | Rendering |
|---|---|---|
| `/` | `app/page.js` | Static. Composes hero, clients, work, services, testimonials, cta, contact |
| `/services/[slug]` | `app/services/[slug]/page.js` | SSG. One route serves all three services; `generateStaticParams` reads `services` in `lib/content/index.js`, `dynamicParams` is `false` so anything else 404s |
| `/work/[slug]` | `app/work/[slug]/page.js` | SSG. One case page per entry in `work` (`lib/content/work.js`), `dynamicParams` `false`. See **The case pages** |
| `/partner` | `app/partner/page.js` | Static. Referral Partner Program — 13 sections from `features/partner`, plus `FAQPage` JSON-LD |
| `/lab` | `app/lab/page.js` | Static, `noindex`. Background prototype — not part of the site |
| `/api/contact` | `worker/contact.js` | Worker. Contact form endpoint |
| `/api/partner` | `worker/partner.js` | Worker. Dual-intent referral endpoint — see **The referral form** |
| `/api/guide` | `worker/guide.js` | Worker. Streams the Guide's replies — see **The Guide** |
| 404 | `app/not-found.js` | Static |
| `/sitemap.xml` | `app/sitemap.js` | Static, `force-static` (the export requires it). Home is listed by hand; the service and work routes are derived from `services` and `work` |
| `/robots.txt` | `app/robots.js` | Static, `force-static` |

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

**Every text button is one of two variants on the shadcn `Button`** (2026-10-02, after the user found the volt buttons' type too
thin). `volt` is the call to action: volt fill, 1.5px ink border, Red Hat Display 600, the `brutal-sm` hard shadow that lifts a
pixel to `brutal` on hover. `line` is the secondary: a 30% foreground border that firms up on hover, so it reads on black and on
paper alike. Sizes `pill` (48px, 15px type) and `pill-sm` (36px, the nav). There is no arrow icon: one was added after Stokt's
buttons and removed on sight the same day ("remove these Arrows"). Links use `cn(buttonVariants(...))` rather than `Button asChild` where they are not
already a `Button`, and `Actions` is the one place a page's button row is built — the home hero used to carry its own copy of
those classes. Before this the site had five separately styled volt buttons in two weights.

## SEO

- `lib/seo.js` is the only place the metadata shape is defined. `buildMetadata({ title, description, path, image })` returns title,
  description, canonical, OpenGraph and Twitter in one object. Pages call it rather than hand-rolling `metadata`.
- `metadataBase` is set once in `app/layout.js`; that is what makes relative canonicals resolve. The title template lives there too.
- The share image is `public/images/openGraph.png` (`SITE.ogImage`), the designer's own Canva export (page 7 of *OG image
  Geekinate*, 2026-09-25), and every page carries it; `buildMetadata`'s `image` is the per-page override. It must stay 1200×630
  because the metadata declares those dimensions. Replacing it is a file swap: export from Canva rather than screenshot the editor,
  which captures at the zoom level and bleeds the editor's grey into the edge. Its URL is made absolute from `SITE.url`, and every page is
  prerendered, so `NEXT_PUBLIC_APP_URL` has to be set when `next build` runs — a build variable on Cloudflare. Without it the HTML ships
  `http://localhost:3000/images/openGraph.png`, which no crawler can fetch.
- JSON-LD is one `@graph` per page through `components/layout/JsonLd.jsx`. Organization is the anchor; `WebSite` and `Service`
  reference it by `@id`. Preserve that linkage when adding node types.
- `public/_headers` sends `X-Robots-Tag: noindex, nofollow` on any `*.workers.dev` host so the Cloudflare URL cannot outrank
  production. It replaced a `*.vercel.app` rule in `next.config.mjs`, which a static export cannot carry — see Known gaps for the
  Vercel staging project that rule used to cover.

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
- **The CTA follows the page.** `Nav` derives `ctaHref` from the pathname and hands it to `MenuPill` and `MobileMenu`: a route
  under `CONTACT_ROUTES` (`/services/`, `/work/`) carries its own `Contact`, so the CTA is `NAV_CTA.local` (`#contact`); anywhere
  else it is `/#contact`. A new route with its own contact section joins that list or its CTA leaves the page.

## Hover-to-play video

Two sections use it, so the behaviour lives in one place:

- `useHoverVideo` — owns the ref and the enter/leave handlers. Leave **rewinds to frame 0** rather than pausing in place, which is a
  deliberate deviation from Stokt; resuming mid-motion on re-hover reads as a stall. Playback is skipped entirely under
  `prefers-reduced-motion`.
- **A touch screen plays each clip when half of it is on screen** and pauses and rewinds it when it leaves, since nothing can
  hover there. A work tile waits longer: `useHoverVideo({ line })` shrinks the arrival observer's root to the top `line` of the
  viewport, and `WorkTile` passes `WORK.playLine` (0.7), so its clip starts when the tile's centre crosses 70% of the screen
  height and the still is on screen first (2026-10-14). Leaving is a second observer on the full viewport, so a tile scrolled
  back below the line keeps playing until it is off screen, and a clip that has started is not restarted by small scrolls —
  without that guard a `loop: false` clip that had ended replayed at every threshold step. A touch screen is `TOUCH_SCREEN` in `constants/video.js`, `(hover: none), (pointer: coarse)`: the second half
  catches phones that report a hover-capable primary pointer. The hook follows that query's `change` event instead of reading
  it once at mount. Reading it once is what made every clip sit still in the 2026-10-12 recording: Chrome's device toolbar
  switched on after the page had loaded flips the query, and nothing was listening.
- **A refused `play()` unlocks every clip on the next tap.** `playWhileShown` in `lib/media/autoplay.js` runs the in-view rule
  for the hook and for `InViewVideo`. iOS refuses a `play()` made without a gesture in Low Power Mode, under thermal throttling
  and with *Auto-Play Video Previews* switched off. WebKit adds those restrictions to each element when it is created and lifts
  them for good from an element that calls `play()` or `load()` while a gesture is being handled (`HTMLMediaElement.cpp`). The
  first fix (2026-10-12) retried only the clips on screen at the next `touchend`, so a clip that arrived during a flick waited
  for another touch, and the iPhone played "sometimes, mostly not". Now the first refusal marks the page as restricted, and the
  next `touchend` or `click` that carries user activation (`navigator.userActivation.isActive`, or a `click` alone where that
  API is missing) plays the clips in view and calls `load()` on every clip that has not played yet. Each later clip then plays
  as it arrives with no further gesture, and a clip leaves the list the first time it plays. A page that never sees a refusal
  never reloads anything. Measured in Chrome with `play()` and `load()` patched to model WebKit's per-element unlock: two
  refusals in view, one tap in the gutter, then every clip on the page played on arrival with no further refusal; unpatched, no
  `load()` ran. Whether the end of a scroll counts as a gesture on iOS is not known, because that dispatch code is not public,
  so a restricted iPhone shows posters until its first tap.
- `VideoSurface` — renders the `<video>` (`loop`, `muted`, `playsInline`, `preload="none"`, poster) or, when `media.sources` is
  empty, a marked *Media pending* panel. Nothing ever points at a missing file. `fit` picks `contain` or `cover`.
- **No clip downloads during boot.** `VideoSurface` server-renders `preload="none"` and flips its own element to `metadata`
  (`auto` on a touch screen, where the clip is about to play by itself) through `lib/media/preload.js`: a quarter viewport
  before it scrolls into view, or, for a hero clip passed `eager`
  (`features/service-hero/Clip`, `features/case-hero/Cover`), once the window `load` event has fired. `preload="metadata"` in the
  HTML was the old default, and it started all nine home-page clips (about 1.3MB) at 0.7s, alongside the CSS and fonts: on
  PageSpeed's mobile throttle the render-blocking stylesheet did not land until 4s. A hover or an intro that calls `play()`
  before the warm-up still loads the clip. `poster={false}` drops the native poster where `WorkTile` lays its own `next/image`
  over the clip, so the still is not fetched twice.
- `useHoverVideo({ introduce: true })` — the clip plays itself once, then answers hover like any other. It starts the moment
  `INTRODUCE.ratio` of it (half, measured against the shorter of the clip and the viewport so a tall clip can still qualify)
  is on screen, with no dwell. Half with no dwell was the first cut; on 2026-09-22 it became nine tenths held for 600ms,
  because the one-second Elevé intro finished while the tile was still arriving; on 2026-09-25 that was reversed on
  instruction, because the dwell made the visitor stop scrolling before the tile did anything. Measured after the change at
  1440×900: at 30% on screen the clip is still at frame 0, and past half it plays. The service hero's `Clip` uses the same
  mode with `loop={false}`; it is fully on screen at load, so it now starts as soon as it can play instead of 600ms later.
  `constants/video.js` holds the ratio.
- `useHoverVideo({ hoverOnly: true })` — for a clip that exists only under the pointer, stacked over another and faded in by CSS.
  Enter restarts it from frame 0 and leave **pauses it in place**: the layer is fading out at that moment, and a rewind on leave
  would snap it to its first frame mid-fade. On a touch screen it plays in view like any other clip. `WorkTile` uses it for a
  tile that carries `hoverMedia`, and shows the layer while that clip is actually playing (its `playing` and `pause` events),
  not on `:hover`, so the fade waits for frames on desktop and the layer appears at all on a phone.

The pending panel is black even on light sections, because tiles overlay light text on their media and a pale placeholder would make
that text unreadable.

## The preload gate

`lib/ui/reusable_components/preloader` is the first child of the body and the last thing to leave. It is a black overlay at
`z-[100]` — above the nav's `z-50` and the grain wake's `z-20` — carrying the volt `BrandMark` at viewport centre, a grain ring
orbiting it, and a percentage in the bottom-right corner.

**It reuses the cursor wake's particle pool rather than growing a second one.** `grain/pool.js` used to read `GRAIN.ringRadius`,
`ringOrbit`, `ringPerSecond` and `ringLife` straight out of the constants, which pinned the ring to one size. `shedRing` and
`stepGrain` now take a ring descriptor — `{ x, y, presence, radius, orbit, rate, life }` — and the preloader passes its 100px one
into that maths, building the object once and mutating it per frame so nothing allocates inside the loop. The cursor wake used to
pass a 34px ring of its own that orbited the pointer while the page scrolled; that ring was removed on 2026-09-15 on instruction,
and the wake now sheds only its movement trail and calls `stepGrain` with no ring.

The gate is driven by three milestones, weighted in `constants/preloader.js`: fonts ready, document complete, and the globe's first
painted frame. The third arrives through `lib/boot/ready.js` — `CosmosCanvas` already had an `onFirstFrame` callback for dropping its
CSS stand-in, and it now calls `markGlobeReady()` from the same place. The displayed number eases toward whichever is larger, the
weighted milestone total or a slow drift, and is capped below 100 until every milestone lands.

Two limits keep it honest in both directions. `minMs` stops a warm cache flashing the overlay for three frames. `maxMs` is a
failsafe: if WebGL never initialises, or the tab is throttled so `requestAnimationFrame` never runs, the loader completes on time
anyway rather than trapping the page behind a black screen. The overlay holds `overflow: hidden` on `html` while it is up and
restores the previous value the moment it starts fading, so the page is scrollable through the fade.

Under `prefers-reduced-motion` the canvas work is skipped entirely — mark, counter and gate stay, the orbit does not.

**The globe stops rendering while the overlay covers it.** Once the canvas has drawn the two frames that call
`markGlobeReady()`, `TickerLoop` in `cosmos/Scene.jsx` skips `advance` until `lib/boot/gate.js` opens, which the preloader does
the moment its fade starts. The overlay is opaque black, so nothing visible is lost, and the frames it saves are the heaviest the
page draws. The hold leans on the same `maxMs` failsafe as everything else here: a gate that never opened would freeze the globe
as well as hide it.

## Performance

Measured 2026-09-25, against a PageSpeed Insights mobile score of 35 on the staging deploy. The PSI API was over its daily
quota that day, so the numbers are local Lighthouse 13.5 (mobile preset: simulated 4G, 4x CPU) against `next start`, median of
three runs. This machine is faster than PSI's: staging scored 54 here the same morning it scored 35 there, so read the table as
relative, not as the score PSI will print.

| Home page | Score | LCP | TBT | Speed Index | Transfer |
|---|---|---|---|---|---|
| Before | 60 | 4.9s | ~800ms | 4.8s | 1,262KB |
| After | 82 | 3.8s | ~260ms | 4.0s | 702KB |

The service, case and partner pages landed at 78–82 on the same build. What moved it, in the order it was found:

- **The barrel carried the Guide into every page.** See the trap in `AGENTS.md`. `"sideEffects": ["*.css"]` in `package.json`
  took the AI SDK, `zod`, the referral form and its Radix parts (about 350KB raw) out of the root layout's chunk.
- **`SubstrateField` imported the three-backed cloud** for its glyph mask, so three.js core, the globe build and the land mask
  sat in every page's first-load JS. They now reach it through `lib/shape/footprint.js`, and three loads only with `Scene`.
- **No clip downloads during boot** — see *Hover-to-play video*.
- **`angleOrder` called `atan2` inside the sort comparator**, about 900,000 calls for 30,000 points. The angles are computed once
  now; the order it returns is identical, checked element for element against the old comparator.
- **The scene is built in separate tasks.** `prepareCloud` builds the globe and the cloud one task apart before the `Canvas`
  mounts, `sampleGlyph` yields between its passes (`nextTask` in `lib/utils.js`), and `gl.compileAsync` compiles the shaders
  before the first `advance` rather than inside it.
- **The globe does not render under the overlay** — see *The preload gate*.
- **`HydrationSplit`** (`components/layout`) wraps each band below a hero in its own `Suspense`, so React 19 hydrates them as
  separate, time-sliced units instead of one long task. It adds no DOM.
- **`Scene` is imported one frame after first paint**, so the 245KB three chunk does not compete with the first paint's bytes.
- `ClientLogo` asked `next/image` for 2048px logos; its intrinsic size is now the displayed size.

Measured and left alone:

- **The preloader.** Opening the gate on mount scored lower — TBT 860ms against 490ms — because the globe then renders from the
  first frame. Speed Index improved (4.1s to 1.6s) but not by enough. Removing it is a design call in any case.
- **Fonts.** All five preloaded files are in use.
- **`experimental.inlineCss`.** It duplicates the stylesheet into the RSC payload for an estimated 50ms.

What is left is the `Scene` chunk (three plus R3F, about 190ms to evaluate on the throttled CPU), hydration, and the
preloader's frames, which run long under headless Chrome's software GPU — the environment PSI measures in. The work clips are
the next lever for real phones rather than for the score: `geekinate-ar-game.mp4` is 4.8MB and autoplays in view on touch.

Attribute before optimising. Build once with `productionBrowserSourceMaps: true` (never commit it) and map chunk bytes and
CPU-profile samples back to source files; the barrel leak and the sort were both invisible until then.

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

`features/work` — section 02: a flat tile grid on a `paper` band, headed by the section title with the All work link opposite it.
It ran riseatseven.com's treatment from 2026-08-27 to 2026-09-18 — a light frame holding a pinned black panel that the grid
scrolled through, with a runway whose height was written from the grid and a gsap scrub mapping the grid's `y` 1:1 to page
scroll. That was removed on instruction ("remove the scroll effect and black background"), against wearestokt.com's *Featured
Work* as the new reference: the grid sits on the page, the page scrolls it, and nothing is pinned. `constants/work.js` went with
it — `framePad` and `pinMinWidth` had no other reader.

The section is now a plain server component. It is `variant='paper'`, not `clear` with `bg-paper`: the band really is light now,
so the nav's surface detection must read it, which is the reverse of what the panel version needed.

- The grid is six columns from `lg`, 16px gaps, 10px tile radius, and `span` counts sixths: rhythm **4+2 / 6 / 3+3**, aspect
  following span, degrading to two columns then one below `lg`. The full-width tile was 16:9 while it ran the AR game and is
  **2:1 since 2026-09-22**, when the Elevé pair moved onto it: that clip is a 2:1 render whose logo starts 2% in from the
  left and whose badge ends 2% from the right, and a 16:9 cover would have cut 5.5% off each of them. The AR game took the
  full-width tile back on 2026-10-21 and the 2:1 stayed, cover-cropping its 16:9 frame exactly as tile 1 already did. It was three columns at **2+1 / 3 / 1+1+1** until 2026-09-17, when
  the middle tile of the last row (an `AI & Automation` Pexels clip) was removed on instruction and the two left took half each;
  thirds cannot hold a half, hence sixths. A half tile is `lg:aspect-[3/2]`, which lands within a few pixels of the first row's
  height. **The rhythm needs exactly five projects** — `span` values in `lib/content/work.js` change with the count.
- Tiles are `WorkTile`: black fill, 1.5px ink border and hard shadow, with the title and discipline chips overlaid on the media
  and no scrim. A project with no `href` renders a `div` rather than a dead link.
- **A tile with `hoverMedia` rests on a still and reveals a second clip.** The Elevé tile (tile 1 since 2026-10-21, the full-width
  tile 3 before that): `media` is only a `poster` (the brand render's last frame) plus its `focus`, so the tile renders no base
  video at all, and `hoverMedia` is the same `eleve-site.mp4` the case page's hero runs as its `cover` (`eleveSiteClip`);
  `hoverMedia` sits over the still at `opacity-0` and fades in while it plays (`REVEAL`), restarted from frame 0 on every
  enter, looping for as long as the pointer stays, and paused in place on leave so the fade-out shows the frame it reached.
  `hoverMedia.tone: 'light'` flips the caption to ink while the clip shows, for a clip with a white ground, where the paper
  title and chips would vanish; the logo clip needed it, and the site clip, on a dark ground, does not. Until 2026-10-06 `media` was a one-shot intro clip that played when half the tile came on
  screen, with hover gated on its `ended` event (`introduced`); the user had it removed for its flicker-in, and the gating
  went with it. On a touch screen the hover clip plays in view and fades out on scroll-out, instructed 2026-10-12 when the
  tile was the one clip on the page that never moved on a phone. Below `sm` the 2:1 clip is cropped square and its
  *Elevate Your Space* line sits under the caption.
- **A tile with `media.poster` shows the poster whenever its clip is not playing.** The native `poster` attribute only covers
  the time before first playback; once a hover has run the clip, a rewound `<video>` shows its own frame 0, and for the laptop
  clips that frame is a different render of the screen than the still the designer supplied. So `WorkTile` also lays the poster
  over the clip as a `next/image` (`fill`, `sizes` by span) and drives its opacity from the clip's `playing` and `pause` events:
  it fades out as frames start flowing and back in on leave, on scroll-out under touch, and when a `loop: false` clip ends,
  which is how wearestokt.com's tiles rest on a still and play on hover. `media.loop` and `hoverMedia.loop` are honoured and
  default to `true`: **every hover clip loops until the pointer leaves**, instructed 2026-09-22 ("sare tiles ki video loop may
  play hoti rahy gi sirf tb stop hogi jb hover hat jaye ga"). The stats count-up and the Elevé logo reveal ran `loop: false`
  for an afternoon, holding their final frames, and were switched to loop on that instruction. Only the intro of a pair
  stays one-shot.

**The nav reads page surfaces from live layout.** `Nav` classifies the pill's ground by `.on-paper` bands measured from the DOM,
and those offsets go stale whenever a layout height is written after mount — the removed runway did exactly that, shifting every
section below by ~1.7 viewports and painting an ink ring over black (found on the CTA, 2026-08-27). The bands are re-measured by a
`ResizeObserver` on `document.body`, so media loading or any future pinned section still refreshes them.

## The case pages

`/work/[slug]`, added 2026-09-24: one page per featured-work tile, and every tile on the home grid now links to its page. The
content order comes from the old site's portfolio page (geekinate.com/portfolio/Fintech_SAAS_App): title, cover, Requirements /
Challenge / Solution, technologies, three more projects, contact. **The layout is transcribed from wearestokt.com's own case
study** (wearestokt.com/case-study-collection/heron, read at 1568×900 the same day), because Stokt is the agreed base for the
whole site and two layouts invented without it were rejected first:

1. The old page transcribed band for band: a text-only full-screen hero, the clip a whole screen below it, then three identical
   full-width numbered lists, a lone band of technology pills and a More band held at full height. Rejected as "very bad".
2. A rework through the ui-ux-pro-max checklist: the clip moved under a left-aligned headline in the hero, a ruled spec sheet,
   Requirements and Challenge as two glass cards with volt step badges, Solution as a grid of `LiftCard`s. Rejected as "still
   very poor". Boxes inside boxes, and nothing like the reference the rest of the site is built on.

| Piece | What it is | Stokt's |
|---|---|---|
| `CaseHero` (`features/case-hero`) | **The old site's hero, on our ground** (instructed 2026-09-24, "make hero section exact same like the previous version", with a screenshot of geekinate.com's Fintech SAAS App page). The project `title` centred in display type, one line on a desktop, and below it the tile's clip in a bordered frame with an ink hard shadow, 16:9 unless the media carries a `ratio`, capped at `62svh` of height. The frame plays the project's `cover` when it has one and its tile `media` otherwise; only Elevé has one (below). A `paper` panel starts 42% of the way down the frame and runs to the hero's foot, so the frame straddles the black ground and the white page as the old mockup straddled its green band; the panel's top edge dips in the middle through a radial `mask-image`, the old band's curve | Stokt's Heron hero card ran here for an afternoon and was replaced on this instruction |
| `Intro` | `paper`, continuous with the hero's panel. The project's `headline` as a display statement on the left, its `mark` in italic; on the right the summary, a hairline table of the `facts` plus *Service* and, when the project has a `url`, *Visit the website*, then the *Let’s talk* pill (*Build something like this* until 2026-10-02) | Heron's *[ INTRO ]*, with Kastle's ruled Client / Year / link table on the right |
| `Stack` | A thin `ink` strip: the *Tech stack* label beside a `Marquee` of the stack in mono caps with volt squares, the client strip's own component at a 64px gap. The label sits above the marquee below `md` | Heron's *[ TECH STACK ]* strip |
| `Brief` | `paper`. Requirements and Challenge side by side as two editorial columns, each an eyebrow, a display heading and a hairline-ruled numbered list | |
| `Solution` | `ink`. The service page's Deliverables list, reused on instruction (2026-09-24, "reuse this or this based on dark or light section"): `Cycle` on a dark band, heading left and list right — it ran mirrored like Deliverables for an hour and was flipped back on instruction ("left section moves to right and right to left"). Each solution point is `{ title, detail }`: a short name set in display type, the sentence beside it. The names were added that day; the sentences are the brief's own, Twinhub's still the old site's except the SEO line, cut to its first sentence because `Cycle` keeps every sentence in the layout and the full line made row 07 visibly taller than the rest | |
| `More` | `paper`, closed by a hairline before `Contact`: the next three projects in `work` order, wrapping, as `WorkTile`s at `aspect-[3/2]` through the tile's `className`. The clips were exported for the 3:2 and 2:1 slots with the caption zone at the bottom, and a square crop pushed the Shifa figures under the caption | |

Mechanics worth knowing before editing:

- **There is no `HeroSheet` on this route.** The hero's lower half is already white, so a white sheet rising over it would read
  as nothing, and the old page has no sheet either. Every other marketing page keeps it. The `compact` flags on the sections are
  inert here for the same reason.
- **The white panel is marked `.on-paper` so the nav reads it**, and `Nav` measures `.on-paper` bands with `offsetTop`, which is
  relative to the nearest positioned ancestor — the hero `Section` here, not the page. It measures right only because the hero
  starts at the top of the document. Put anything above the hero and the nav's surface detection over the panel goes wrong.
- **The Elevé intro plays once and rests on its last frame**, through `useHoverVideo({ introduce: true })`; the frame is fully on
  screen at load, so the half-on-screen rule passes at once. A looping clip plays through `InViewVideo` while the frame is in view.
- **The frame crops with `object-cover` to 16:9**: Twinhub's square clip keeps its whole laptop inside that crop and the Shifa
  grid loses only its outer rules. Elevé's cover is the same square mockup, so it crops identically.
- There is no `CtaBand`: the old page goes straight from View More to the form. The page carries no `#hero` (the hero is `hero-work`), so the particle cloud takes the heroless path the service
  pages rely on.

**Elevé's hero runs its own clip, not the tile's, and it wears Twinhub's laptop.** The first cover (2026-09-24) was
`../VideoClips/Project 4 Hover Video.mp4`, a laptop in a dark room shot from a distance; on 2026-09-25 the user asked for the
laptop to sit exactly as it does on Twinhub's page ("the laptop in the video is a bit far"). `eleve-site.mp4` is now Twinhub's
own mockup source (`../VideoClips/work-specs/tile-4.mp4`, 2880², 190 frames at 30fps, static camera, head-on screen) with
the live eleve.space scroll composited into the screen. Measured in that source: the screen's content rectangle is x 441–2412,
y 779–2052, and the notch is x 1291–1502 down to y 828, filled `#161616` with ~4px corners. The composite puts a black
52px menu band across the top of the screen with the notch redrawn over it, as macOS does, because the notch otherwise lands
on Elevé's nav links; the page fills the 1972×1222 below it. The page was recorded frame by frame in headless Chrome over
CDP at 1440×892 CSS and DPR 2, `window.scrollTo` per frame with an eased curve: hero held 0.8s, then Amenities, Spaces and
Membership, each held, the last until the loop. **The page's own motion runs on the recording's clock, not the wall's**: a
frame takes about half a second to capture, and the first cut let the hero's background video play in real time meanwhile,
so its footage raced through at ~16× and read as the site being broken ("hero section ki video within 1 sec puri guzar kar
nechy scroll hojata hai"). Every `video` is paused and seeked to `frame / 30` and every `document.getAnimations()` entry
(the marquee, the nav's transitions) is paused and stepped 33.3ms per frame before the capture. Composited with ffmpeg
`overlay`, scaled to 1440², H.264 High, `-preset slow -crf 20`, no audio, `+faststart` — 0.9MB. `eleve-site.webp` is its
first frame, 64KB. Re-record it the same way when the
Elevé site changes; the tile keeps its intro-and-reveal pair either way.

**Four of the five pages carry drafted copy.** Only Twinhub had a case study on the old site, and its Requirements, Challenge,
Solution and stack are transcribed from it (geekinate.com/portfolio/Twinhub_-_Coworking_Space_Website), as is its *Visit* link.
The AR game, Elevé, the VR game and Shifa International were drafted on 2026-09-24, with the user's go-ahead, from what their
clips show: headline, summary, facts, brief and stack alike. Elevé's stack is the one drafted part read off a real
source, the `../Eleve/development/frontend` package. Tile 5 was named Shifa International by the user the same day. See
Known gaps.

On 2026-09-25 every page's copy was rewritten into the sales voice (see AGENTS.md, *The copy sells*). Twinhub's brief was
rephrased from the transcription point for point, with nothing added that the old page did not say. Shifa International was
reframed as a **marketing** project on the user's word: `disciplines` is `Marketing` (`Marketing Systems` until the 2026-10-02
rename), `service` is `marketing`, and
its facts and brief now describe a campaign instead of a website. Every project carries a `service` slug so the case page's
`Contact` can ask the matching question.

## The services section

`features/services` renders four `HoverVideoCard`s inside a dark `Section` — one row of four at `xl`, two up at `sm`, stacked below
that. Modelled on wearestokt.com's services grid, measured live.

Four cards abreast need width: much under 280px each and the media box is too small for the loops to read. Full-bleed sections give
them the whole viewport, which is what lets the single row hold at `xl`.

The effect there is entirely the **video content**, not the code: each card holds one `<video>` — `loop`, `muted`, `playsInline`,
`preload="none"` until it nears the viewport (see *Hover-to-play video*), `autoplay` off, a frame-0 poster shown until playback starts,
`object-fit: contain`. Hover plays that card's video only.

Two deliberate deviations from the reference:

- **Mouse-leave rewinds to frame 0**, where Stokt pauses in place. Resuming mid-motion on re-hover reads as a stall.
- Cards carry a **1px gradient ring** (`linear-gradient(126deg, …)` behind an inset fill) rather than a flat border. Stokt does the
  same trick; it is what stops a large dark card reading as a plain rectangle. On our black section the ring is paper at low alpha,
  and the same gradient at half strength lies across the black fill as a sheen.

The clips are cut on black, so the media box **bleeds to the card's edges** — `-mx-5` cancels the card's own padding, the card
clips it, and the card's sheen (`ring-edge` at `opacity-50`) is a layer **over** the clip rather than a fill under it, so the
clip's black takes exactly the colour of the card around it instead of reading as a rectangle. That is the screen blend done
without a blend mode: screening a clip onto white at alpha *a* over black gives `V(1 - a) + a`, which is white at alpha *a* laid
over the clip. Until 2026-10-12 the clip carried `mix-blend-screen` over a `glass` fill, which showed every iPhone a black square
in each card (see the iOS trap in `AGENTS.md`). Measured at 390px wide, the media box and the fill below it read the same value
(15 at the bottom-left corner), three levels darker than the old glass tint. A clip on any other ground will not survive this. The box is `aspect-square`; it was `9/10` until the
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
flat strip. Equal-length quotes flatten it too; the real ones vary enough on their own.

`TestimonialMarquee` owns the motion, with no animation library:

- The list renders **twice** and the offset wraps at half the track width. Any wrap point short of that shows the seam as a gap on
  the right edge. The duplicate copies are `aria-hidden`.
- A rAF loop advances the offset at 40px/s. **The frame id resets to `0` on cleanup** — StrictMode's dev remount otherwise sees a
  stale id and never schedules again.
- Pointer drag moves the same offset directly, with pointer capture so a drag that leaves the element still tracks. Hover pauses
  the drift.
- **The track is `touch-pan-y`.** Without it a phone claims every touch for page scrolling and fires `pointercancel` a few pixels
  in, so a 200px swipe moved the cards 33px and the row read as undraggable (2026-10-08). Horizontal swipes now reach the drag
  and vertical ones still scroll the page. The hover slowdown and the **DRAG** badge answer mouse pointers only.
- **A touch drag runs on touch events, not pointer events.** `touch-pan-y` was enough for Android and not for the iPhone
  (2026-10-12). Safari's direction lock on a `pan-y` element is unreliable (WebKit bug 232545), and the first fix only added a
  non-passive `touchmove` that called `preventDefault()` on a sideways swipe while the drag itself stayed on pointer events —
  and a pointer Safari cancels mid-swipe (`pointercancel`, then `pointerleave`) ended the drag through either handler. Measured
  in Chrome by firing those two events four moves into a swipe: the shipped code moved the row 6px of a 150px swipe, the
  touch-event version followed it exactly. The frame's own `touchstart` / `touchmove` / `touchend` now drive a touch drag:
  the axis locks after `SLOP` pixels, a sideways swipe calls `preventDefault()` and moves the offset, and a vertical or
  two-finger gesture is let go. The pointer handlers ignore `pointerType: 'touch'`, so mouse and pen keep pointer capture.
  React's `onTouchMove` cannot do this, because React registers touch listeners as passive.
- **The card under the finger lights like a hovered one.** Tailwind's `hover:` only applies under `(hover: hover)`, so on a phone
  no card ever turned volt (2026-10-08). The marquee records the pressed card's index until release or cancel and the card
  carries `data-held`; its colours use the `lit` / `group-lit` variants in `globals.css`, which match hover on hover-capable
  devices and `[data-held]` everywhere, so each colour is written once for both.
- The cursor is hidden over the track and replaced by the reference's circular **DRAG** badge, positioned at the pointer.
- `prefers-reduced-motion` skips the loop entirely: the drift is the whole effect and there is no meaningful reduced version.

Eight testimonials since 2026-09-25. The anchor is picked by the card's position in the list, not in the doubled track, so both
copies carry the same sequence — indexing the track instead jumps every card vertically at the wrap whenever the count is not a
multiple of `ANCHORS`' twelve. Half the track has to be at least a viewport wide or the seam shows: eight cards give 3185px at
`sm` and up, which clears everything short of a 5K screen at 1x. A shorter list needs more cards, not a slower drift.

The card's avatar reads initials off the capitalised words of `name`, so the two anonymous Clutch reviews, which carry the
reviewer's role as their name, render `OI` and `DD` rather than `O&` and `Do`. The handoff forbids inventing a person or company
for them; their caption ends `· Clutch` instead (2026-09-25), which says where the review is verified and why no name
is given.

## The pre-contact CTA

`features/cta` — the giant scroll-scrubbed line above every contact form, on `ink` (black, paper type — built dark,
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
| Type | One line, `16vw` at every width, weight 600 (the reference's 500 read thin at our sizes), `tracking -0.035em`, `leading-tight`, letters split into individual spans |
| Sweep | `x` from `+1.07 × viewport width` — the whole line starts off-screen right — to the **last word centred in the viewport** (measured off the word's own span, so the copy can change), `ease: none`, from `top 70%` |
| Drift | `y` from `dip` 0.16 to `drop` 0.44 × stage height across the same range — the reference starts at 0, ours starts one dip low so the line rises as it crosses — with the line anchored to the stage's **top**, not its centre |
| Letters | `yPercent -60, rotate 10` settling to 0 with `back.inOut(4)` — the reference ran duration 2.5 / stagger 0.35 from `top 77%`, ours runs 1 / 0.5 from `top 70%` to the unpin, because the centred rest pose lengthened the sweep and the reference timing finished every wave before its letter scrolled into view (2026-08-27). Ending the wave at `top top` instead, so the pinned frame always showed a whole line, was tried on 2026-10-06 and rejected outright — keep the wave running through the pin |

The three of those together are what make the motion read as the reference's: the line enters the frame at the bottom-right corner
already mid-wave, crosses the section diagonally — leftward from the sweep, upward because the page scrolls faster than the drift —
and leaves its tail high in the frame as the next block arrives. Start the line on-screen, or centre it in the trigger, and the
whole figure collapses into an ordinary marquee; that misread shipped once (2026-08-27) and was rejected the same day.

**The section pins, and that is ours, not the reference's.** Rise at Seven gives the line one viewport of passage, and at our line
lengths the tail was gone before it could be read — rejected on sight (2026-08-27), with the instruction to hold the section until
the whole line has been seen and only then hand over to Contact. So the `Section` wraps a tall scroll frame (`160svh` — tuned
three times on 2026-08-27 against the live page: `280svh` too slow, `200svh` too fast, `240svh` still too slow once the rest pose
changed) with a sticky `100svh` stage pinned to its top; the stage owns the `overflow-hidden`. Those are the `lg` values; below
`lg` the frame is `90svh` around a `50svh` stage (see below).

**Phones run the desktop figure, not a variant of it** (2026-10-08). Below `lg` the line was `30vw` in a `35svh` stage inside a
`105svh` frame. At that size *Geekinate?* is wider than a phone, so the rest pose centred a word that could not fit and parked
"eekinate" cropped at both edges, and the 65svh of frame under the short stage read as an empty black screen. Since the rest pose
centres the last word, the type size is bounded by that word: at `16vw` it fits with margin at every width.

**Phones get a shorter passage, with the same type and the same motion** (2026-10-14). At `16vw` in a full-height stage a phone
showed one thin line on a black screen for 2.6 screens of scrolling, and the user found it too long ("mobile par ... kafi lamba
feel hota hai ... scroll karty raho bs"): the sweep's travel is measured in screen widths and the passage in screen heights, so a
tall narrow screen scrolls far for little movement. Below `lg` the stage is `50svh` inside a `90svh` frame, so the band takes
1.9 screens to pass, fills half the screen while pinned, and Contact rises under it. The 2026-10-08 objection to a short stage
was the frozen line over 65svh of black after the wave had ended; that came from ending at `bottom bottom`, which on a short
stage arrives well before the unpin, and the end now follows the stage.
The rest pose centres the line's **last word** — the brand name — not the line's tail; the earlier tail-at-50vw pose parked the
question mark at centre and was rejected for exactly that. Both tweens end at
`bottom <stage height + hold>px` — the frame's bottom meeting the stage's bottom, which is the unpin — so the sweep's length
adapts to any viewport from the frame's own height, and a stage shorter than the screen still ends its wave at the unpin. With
a full-height stage that is the same point as `bottom bottom`, which is what it read until 2026-10-14. Retuning
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
  trigger and hides the section below `lg`; ours renders at every width on the same `100svh` stage.
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

The top row splits 50/50 — the lockup on the left, four columns spread with `justify-between` on the right. Those
columns are `footerColumns` in `lib/content/index.js`: Index is `NAV_LINKS`, Socials is `SOCIALS`, and **Services is derived from the
`services` array in the same file** so the pillar list cannot drift from the section that renders it. An empty `href` renders as
plain text rather than a dead link, the same rule `WorkTile` follows. Quick links end with *Partner with Us*, *Privacy Policy* and
*Terms & Conditions* (2026-10-06).

**Below `lg` the particle letterform has a slot of its own.** From `lg` the mark forms in the card's right half beside the links.
Below it there is no right half, and the mark used to form at the viewport's centre — straight over the link columns on every
phone and tablet (2026-10-08). The footer now renders an empty `data-footer-mark` box (`flex-1`, `min-h-64`, `lg:hidden`) between
the links and the social row. `measureLayout` reads it into `footerMark` in `lib/scroll/stage.js`: the box's centre in viewport
pixels at the page's final scroll, its smaller side, and its centre as a share of the card's height. `MorphCloud` lowers the mark
onto that centre through `uOffsetY` and shrinks it to `COSMOS.footerMarkFill` of the box, both mixed by `stage.form` so the
scattered field mid-page is untouched; `SubstrateField` seeds its automata at the same share. A hidden box measures `0`, which is
how desktop falls back to the old pose. On a short phone the `min-h-64` makes the card taller than the viewport rather than letting
the mark overlap the links again.

## The legal pages

`/privacy-policy` and `/terms-and-conditions` (paths in `LEGAL`, `constants/index.js`) render `features/legal` from
`legalPages` in `lib/content/legal.js`: a dark title band (eyebrow, italic display `h1`, last-updated line) over a `paper` band of
ruled sections in a `max-w-3xl` column, after Stokt's own `/policies/privacy-policy` (title, date, plain `h2` sections, no index).
The copy was drafted on 2026-10-06 from what the site actually does — no analytics or cookies (the `dataLayer` pushes reach no
tag), self-hosted fonts and media, the contact and referral form fields, the referral throttle's in-memory IP — and **needs the
client's or a lawyer's review**: it names no legal entity, address or governing law because none was supplied. Change the
policy's wording before adding analytics. Both pages are in the sitemap.

**The direct email address is not in the footer.** It sat under the lockup for part of 2026-09-16 and was moved on instruction
to `features/contact`, centred under both columns. On 2026-09-17 it became two lines, picked from a four-option prototype: a mono
`Eyebrow` reading "Or contact us directly at" (`contactContent.direct`) over the address in the display serif with its volt
underline. A single line mixing the small grey sans lead with the larger serif address read as the address pasted into the
sentence, which is why the two no longer share a baseline. Contact is shared, so this shows on the home page and every service page.

**The contact heading is not shared.** `Contact` takes a `topic` (default `home`) and reads its typed headings and intro from
`contactContent.pitches[topic]`: `/services/[slug]` passes the slug and `/work/[slug]` passes the project's `service`. Before
2026-09-25 every page cycled the same four questions, so the marketing page asked "What do you want to automate?" under a
CtaBand reading "Let's automate it." The steps, the form and the address stay shared.

**The enquiry carries the service.** `Contact` resolves its `topic` against `services` and passes the title to `ContactForm`, which
posts it as `topic`; `/api/contact` writes it into the enquiry as a `Service:` line. The home page has no topic and sends none.
Every field has a visible label above it (2026-10-02, from the client's handoff: placeholders were the only labels before), in the
referral form's style — mono caps, a red `*` on required fields and `(optional)` on the rest.

**A page's pitch can carry its own eyebrow, and one heading stays still.** `pitches[topic].eyebrow` replaces *Contact* (Marketing
reads *Let's talk*), and `TypedHeading` does not animate a single phrase, which is how the Marketing page gets the handoff's static
heading. `Cycle` takes `block.intro` as a line under its heading, and when any title has a space it sets the titles smaller with the
sentence underneath instead of beside, because Marketing's steps are sentences ("Then, we agree on what to fix.") that no
max-content column could hold at display size. `Scope` cards are number, title, paragraph on every service page; the Marketing
page's optional `label` eyebrow went with the client's revised copy on 2026-10-07.

**Every contact form asks what the visitor wants help with** (2026-10-02). The handoff drew six options for the Marketing page; the
user had them put on the one shared form instead, so the home page, every service page and every case page carry the same
question: `contactContent.interests`. It began as six toggle chips; since 2026-10-06 it is one optional dropdown (instructed:
"instead of these chips can we place dropdown or select here?"). A native `select` shipped first and was rejected the same day
("looking very bad") because its option list is the browser's own; it is now Radix `Select` from the `radix-ui` package that was
already installed. The trigger is styled like the text fields with *Choose one* as the placeholder and a chevron that turns over
when open; the list opens 8px below at the trigger's width (flipping above near the bottom of the screen), in the form's own
geometry — ink border, 20px-scale radius, hard ink shadow — with hovered options on `wash` and the chosen one on `volt` with a
check. The form still posts `interests` as an array — `toPayload` wraps the one
choice — so `/api/contact` and any webhook reading it are unchanged; the route keeps only labels from that same list and writes
them into the enquiry as an `Interested in:` line. The message box below is labelled *Tell us a
little more*, because the select now asks the handoff's *What would you like help with?*. The old `topics` list (*Closest to*),
which nothing rendered, went with it. The typed heading holds each complete
question for `TYPED.holdMs` (4000, the handoff's minimum), reserves the longest question's height so nothing below moves, stops
under reduced motion, and gives screen readers the first phrase only — which is why the home list starts with "What are we
building together?", the handoff's fallback, and runs the client's order from there.

`InViewVideo` fills the card. It is the third playback mode in the codebase and the only one not driven by hover: an
`IntersectionObserver` starts a **one-shot** render as the panel arrives and rewinds it on the way out, matching the reference,
where the clip plays once rather than looping. Autoplay is deliberately not used — a video at the bottom of the page would spend
bandwidth and decode budget before anyone scrolled to it. `VideoSurface` gained a `loop` prop for this; it still defaults to
`true`, so the hover surfaces are untouched. Playback is skipped entirely under `prefers-reduced-motion`. The in-view rule is
`playWhileShown`, shared with the hook's touch path, so the tap that unlocks a restricted iPhone unlocks this clip too.

**The navbar retreats over the footer** — the reference's behaviour, described under the navbar below. `Footer` carries
`relative z-50` to match `Nav`'s own so nothing shows through during the 420ms retreat.

## The Guide

**Off since 2026-09-16:** `guidedServices` is empty, so no page mounts it. The description below is what returns when
`development` goes back in that array.

`/services/development` docks a chat panel in its hero, `lib/ui/reusable_components/guide`. It answers from a knowledge object
derived from the site's own content, streams through `/api/guide`, and can point at four sections of the page — `scope`,
`process`, `deliverables` and `contact`, which is `TARGET_IDS` in `constants/ai.js`.

| File | Responsibility |
|---|---|
| `guide/index.jsx` | Dock, floating launcher, greeting, nudges, the request and the stream loop |
| `guide/Chat.jsx` | The log, the starters, the button under a reply, the field |
| `guide/stream.js` | Reads the UI message stream: `textOf`, `actionsOf`, `jumpOf` |
| `worker/guide.js` | Cross-origin check, turn cap, credential check, throttle, then `streamText` |
| `lib/ai/prompts.js` + `lib/ai/tools.js` | The system prompt, and the two tools the model may call |
| `lib/ai/bus.js` | `runPageActions`: `goToSection` scrolls, `highlight` outlines |

**A reply never moves the page.** A `goToSection` call is read off the streamed message by `jumpOf`, carried on the message as
`jump`, and rendered as a button under the reply once it has finished streaming. The page scrolls when the visitor presses it;
pressed from the floating panel, the panel closes first. Scrolling on arrival was the first build and was rejected on 2026-09-14
because the page left before the answer could be read. `highlight` still runs as soon as it arrives, because it moves nothing.
The tools exclude `hero-service`: under `HeroSheet` the hero is stuck, and `scrollToElement` would measure its stuck position.

**It floats on either of two signals.** Its own `IntersectionObserver` catches the hero scrolling away; `watchSheet` catches the
sheet covering a dock that is still geometrically on screen. While floating, the dock is `inert` as well as `aria-hidden`, so a
covered field cannot take focus.

**Grounding is derived, never transcribed.** `lib/ai/knowledge.js` is built from `services`, `work` and `contactContent` and
stringified once at module load. `testimonials` is excluded — it was written when they were invented, and nothing has asked for
them since they became real. `work` is included with its placeholder
titles, and the system prompt forbids presenting any of them as a named case study — see Known gaps.

**Cost control, in the order it runs:** cross-origin check, the eight-turn cap, the credential check, then a 20-per-day throttle
keyed on a salted IP hash; every message is trimmed to 500 characters and replies stop at `maxOutputTokens`. All of that bounds
how large and how often requests are; **none of it can stop a bill.** The ceiling is set in the OpenAI dashboard under Settings →
Limits and nothing in this repo can set it.

**"The guide is not running right now." means the route has no key.** Without `OPENAI_API_KEY` the route answers 503
`not-configured` and the chat shows `guideContent.unavailable`. Every `.env*` file but the example is gitignored, so a host that
builds from the repo needs the key in its own settings — on Cloudflare a Worker secret, which takes effect without a rebuild.

The Blueprint, a generated Today-vs-automated block that sat under Deliverables with `/api/blueprint` and `/api/blueprint/email`
behind it, was removed on 2026-09-14 at the user's instruction. Its code is in git history before that date.

## The hero sheet

`lib/ui/reusable_components/hero-sheet`, instructed on 2026-09-14: on `/services/[slug]` and `/partner`, scrolling past the dark
hero should read as the white section beneath sliding up over it like a sheet, not as the hero scrolling away. One component
serves both routes; each passes its hero as `hero` and every later section as children. The hold, the recede and the cover signal
run from `lg` up (`SHEET.holdFrom`); below it the hero scrolls normally under the sheet's rounded edge.

| Piece | What it is |
|---|---|
| Stage | The hero, `relative z-10`, and from `lg` `sticky` with `top: min(0px, 100svh - var(--hero-h))`. A `ResizeObserver` writes `--hero-h` and refreshes ScrollTrigger |
| Spacer | `h-svh`, after the stage inside the same plain wrapper — the stage's containing block — so the hero is held for one small viewport of scroll |
| Sheet | A plain `div` pulled up by `-mt-[100svh]`, so it starts where the hero ends. Its first child takes `rounded-t-3xl`, and every direct `<section>` child is at least `min-h-svh` with its content centred on a flex column (instructed 2026-09-15), through the `sheet-screen` variant in `globals.css`. A `Section` passed `compact` renders `data-compact` and keeps its natural height: `CtaBand` and `Terms`, whose content filled under 55% of a 911px viewport and read as empty at full height (rejected on sight the same day). `Deliverables` was compact too until 2026-09-17, when two short black bands on one page read as two banners; it now fills the screen by carrying its four items as large display-type cards in a 2x2 grid, 615px of content on a 900px viewport, rather than by being stretched. `Process` was compact from 2026-10-02 to 2026-10-06, with no bottom padding, because it sat paper against the paper `Contact` and two full-screen paper bands left a wide white gap; since `Contact` brings the black *Ready to Geekinate?* band with it, the user asked for Process at full height again ("this section must be full height") and it is no longer compact. `Cta`'s own section is compact, so the sheet never restyles its scroll stage. A child that is not a `<section>` gets none of it |
| Recede | One scrubbed timeline over the sheet's `top bottom → top top`: the hero scales to `SHEET.recede.scale` while a black shade rises to `SHEET.recede.dim` |
| Cover signal | An `IntersectionObserver` on the sheet with `SHEET.coverMargin`: `markSheet(true)` once its top edge passes mid-viewport |

Mechanics worth knowing before editing:

- **The hold lasts one `svh`, and that is exactly enough.** `PageHero` is `min-h-svh`, so the sheet's top reaches the top of the
  viewport on the same frame the stage releases, and the hero leaves already covered. Every section after it has to stay opaque,
  or the released hero shows through.
- **The hold starts at `lg`, the breakpoint the Work pin already uses.** Below it the hero stacks — 1315px tall at 390×844, with
  the Guide's dock filling most of the screen. Held there, the dock sits under the thumb for a whole screen of scroll, and a swipe
  that lands on its chat log scrolls the log, or with `overscroll-behavior: contain` nothing at all. Measured before the gate went
  in: wheel input over the dock left the page parked at 480px. So below `lg` the stage is plain `relative`, the recede and the
  cover signal are not armed, and the Guide floats on its own `IntersectionObserver` as it always did.
- **A hero taller than the viewport sticks by its bottom edge.** A short laptop screen can still sit under the hero's height at
  `lg`; `top` goes negative by the difference, so the proof strip is read before the sheet arrives rather than covered unseen.
- **The sheet wrapper is deliberately unpositioned.** `Nav` measures `.on-paper` bands with `offsetTop`, which is relative to the
  nearest positioned ancestor, so a `relative` wrapper shifts every band by the hero's height. The sections keep their own
  `relative z-10`, and later DOM order is what paints them over the stage.
- **The stage's `z-10` is for the canvas, not the sheet.** `sticky` opens a stacking context; without its own z-index the hero
  would paint below the fixed particle canvas at `z-[1]`.
- **The recede is gated on `prefers-reduced-motion: no-preference` as well as `lg`.** Under reduce the sheet still covers the hero
  — that is layout — but nothing scales or darkens.
- **Covered is not off screen.** See the trap in `AGENTS.md`; the Guide listens to `watchSheet` for exactly this.

Measured on `/services/development` at 1568×911 on 2026-09-14: 300px into the page the sheet's top sat at 611, the hero at scale
0.980 and the shade at 0.198; at 700px the sheet's top was at 211, the launcher had appeared and the dock was inert.

## The service mark

Added 2026-09-16: the particle cloud forms an "AI" circuit mark in the right-hand column of the `/services/development` hero. It is a
fourth pose of the one cloud, mixed in the vertex shader after the globe and footer poses — no second canvas, camera or material.

| Piece | What it is |
|---|---|
| Slot | `features/service-hero` passes `PageHero` an empty square `div` with `data-cosmos-shape='circuit'` when `SERVICE_SHAPES` names the slug. That map is empty since 2026-09-18 — the hero's aside is the AI clip now — so nothing below fires until a slug is put back in it. The Guide still wins the aside if a slug is in `guidedServices`, and `SERVICE_CLIPS` wins it before the shape |
| Sampler | `lib/shape/circuit.js` → `sampleCircuit(count)`: the letters, circuit buses, vias and two rings, drawn in a unit square. Every bead where `index % 5 < 3` joins (18,000 of 30,000), assigned in angle order so beads travel radially; the rest get kind `0` |
| Buffers | `cloud.js` allocates `aShape`, `aShapeNormal`, `aShapeData` empty and fills them the first time a page asks for the shape (`wearShape`) |
| Placement | `stage.js` measures the slot on layout, `MorphCloud` turns its box into `uShapeMatrix` every frame — centre from the slot, scale from its size over `CIRCUIT.fit`, turn from `CIRCUIT.pose` plus the shared pointer tilt |
| Motion | `circuit()` in the vertex shader: pulses run along traces toward the letters and tint them paper; hovering the mark sends a ripple out from the cursor (`uShapeFireAt`/`uShapeFireTime`, at most every `CIRCUIT.fireRest` seconds) |
| Scroll | `stage.shapeGlow` dims the mark as the sheet rises (over `COSMOS.shapeSpan` of a viewport); `stage.shapeIn` holds it formed until one more viewport has passed (`COSMOS.shapeHold`), so it scatters only once covered |
| Solo | `uShapeSolo` hides the non-member beads outright while the mark is up. They return only after it has scattered, because the footer G needs them |

Mechanics worth knowing before editing:

- **The slot is measured, never read per frame.** `getBoundingClientRect` in the frame loop is the forced-layout cost the
  animation-loop trap describes. `measureLayout` records offsets on resize; `measureShape` reconstructs the slot's viewport position
  from the scroll offset.
- **`offsetTop` on a sticky element moves with the scroll.** Read on 2026-09-16: the `HeroSheet` stage reported `offsetTop` 0, 300,
  600, 900 at scroll 0, 300, 600, 900 while its rect stayed at 0. So the slot's offsets are summed only up to the sticky holder, and
  the holder's own position is rebuilt from its parent's document top, its computed `top` and its parent's height — the sticky rule
  itself. This assumes the holder is its parent's first child, which is how `HeroSheet` is built.
- **Scatter starts when the slot's centre passes the middle of the viewport.** On `lg` that is scroll 0, so the mark dims with the
  sheet. Below `lg` the hero scrolls normally and the slot starts below the text; a first version keyed on "fully in view" had the
  mark two-thirds scattered by the time a phone user reached it.
- **Opacity is `max(footer, shapeMix² × glow)`.** On a page with no shape both shape terms are 0 and the heroless rule is unchanged.

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
| `ai` + `@ai-sdk/openai` | The Guide. Raised and approved 2026-09-09 for the Blueprint against the standing no-new-deps rule, and the Guide has used them since. `zod` appears in the lockfile as a required peer of `ai`; nothing here imports it |
| `yup` | **Unused since 2026-09-14.** It was the Blueprint's validator and nothing imports it now. Removing it or reusing it is a decision to raise |
| `gsap` | The frame loop the whole site runs on — `gsap.ticker` drives Lenis, the canvases and the marquees — plus `ScrollTrigger` for the work pin, the CTA reveal and the hero sheet. Same approval |

Deliberately absent: no form library, no data layer. Adding either is an architectural decision, not a detail — raise it first. The
3D stack is the one exception and it was granted for the hero brief specifically; the remainder of that brief's list — `zustand`,
`maath`, `leva`, `@react-three/postprocessing` — is approved in principle but **not installed**, because nothing built so far uses
any of it. Install each with the phase that needs it, not ahead of it. Scroll progress is a plain module singleton rather than
Zustand, which the brief explicitly allows and which costs one file.

**`zustand` and `zod` both resolve from `node_modules` today without being declared** — `zustand` arrives under
`@react-three/fiber`, `zod` under the `shadcn` CLI. So `import { create } from 'zustand'` will appear to work and then break the
day a transitive version moves. Anything this project actually depends on gets its own `package.json` entry.

## Known gaps

- **There is no spend ceiling on the Guide.** `/api/guide` calls OpenAI directly, so the only limits are `maxOutputTokens`, the
  message and turn caps and the per-IP throttle — all of which bound size and rate, none of which stop a bill. A hard limit has to
  be set in the OpenAI dashboard under Settings → Limits, and it is not known whether one is.
- **Four case pages run drafted copy, and it reads as fact.** Since 2026-09-24 `work` holds real project names, but only
  Twinhub's page is sourced from the old site (rephrased on 2026-09-25, no claims added). Shifa International is now framed as
  a marketing campaign on the user's word, but what the campaign was is still unknown. The AR game, Elevé, the VR game and Shifa International carry headlines,
  facts, briefs and stacks drafted from their clips (see **The case pages**) — the games' platforms and engines, Elevé's brand
  work, Shifa's whole brief. Each needs the real copy before it is public, the same standing as the invented testimonials.
  The Guide's prompt still tells it never to present a `projects` entry as a named case study, which stays right while that
  copy is unconfirmed; revisit that line once it is.
- **The live particle system is not documented in this file.** `cosmos/`, `lib/globe/` and `lib/shape/` have no section of their
  own; `AGENTS.md` §Boundaries is currently the only prose describing them, and *The 3D mark* below documents the retired build
  it replaced. Anyone working on the canvas has to read the code. This is the largest gap in this document.
- **The Vercel staging project is unprotected once this branch lands.** Its `*.vercel.app` noindex rule lived in `next.config.mjs`,
  which a static export cannot carry, and its forms have no `/api` any more. Retire that project, or it serves an indexable copy
  of the site with broken forms.
- **The in-memory rate limiters in `worker/contact.js`, `worker/partner.js` and `worker/guide.js` are per isolate.** Cloudflare spreads requests over
  many isolates, so the limits are best-effort. A real one is Cloudflare rate limiting, and it should exist before the Guide is
  switched back on.
- `constants/index.js` carries `// PLACEHOLDER` contact and social values.
- **Placeholder media, two kinds — check the filename prefix.** `stokt-*` was taken from wearestokt.com to exercise the layouts and
  **must not ship**; one services clip carries their wordmark on a keycap. `pexels-*` is Pexels stock, free for commercial use with
  no attribution, so it is safe to ship but says nothing about Geekinate. Replace both with real work. **No tile is on the
  *Media pending* panel any more** — Services' Marketing card took a Pexels clip on 2026-08-07, since Stokt runs three
  service cards and there was no fourth render to transcribe.
- **The first real work clips were `geekinate-*`.** Supplied on 2026-09-17 from `../VideoClips/work`: the AR game runs the
  full-width tile (as instructed, "the biggest one on the screen") and the VR game ran the Games & Interactive tile below it
  until 2026-09-22, replacing the two Pexels clips those tiles carried. Both were re-encoded from the originals with audio
  stripped (tiles are always muted) and `+faststart`: the AR clip at 1920×1080, the VR clip at 1280×720 because its tile never
  shows more. The tiles kept placeholder titles and slugs until the case pages named them on 2026-09-24. The VR clip
  showed UFC branding on the TV in frame, and its 16:9 frame in a 3:2 tile needed `media.focus: '25% 50%'` to keep the player
  in the headset; `VideoSurface` applies any `media.focus` as `object-position`, and the Elevé intro on tile 1 still uses it.
- **Tiles 2 and 5 took designed stills and clips on 2026-09-22**, from `../VideoClips/work-specs`: the twinhub site on a
  laptop (square, tile 2) and a stats count-up over a photo (3:2, tile 5). A third pair, the Elevé site on a laptop (3:2),
  went onto tile 4 first and was taken off the same day — "4th tile may AR video game wali video thi pehly woh hi rehne do" —
  so tile 4 runs the VR game again (re-encoded from its original, since the earlier file had never been committed) and
  that pair's files were later deleted as untracked leftovers. The Elevé site clip came back on 2026-09-24 as the Elevé case
  page's hero cover — see **The case pages**. The files arrived named
  `tile-4` for the square and `tile-2` for the 3:2, the reverse of the spec sheet's numbering — they were placed by aspect,
  since the spec's slot 2 is the square and slot 4 the 3:2, and the backgrounds were exported at exactly those slots' listed
  sizes (584×584 and 884×589). Clips re-encoded as above: the square at 1080×1080, the 3:2 pair cropped to an exact 3:2 and
  scaled to 1440×960. The backgrounds are the posters, converted to WebP at the size supplied, which is 1× for the slot — on
  a 2× display they upscale about 1.5×; ask for 2× exports (1168×1168 and 1768×1178) if that shows. Both loop under the
  pointer (see the poster note above). Tile 2's discipline tag read AI & Automation, a placeholder on a web product, until it
  became Web Products with its case page on 2026-09-24; no tile carries AI & Automation now.
- **The Elevé pair (2026-09-22) opened on tile 1 and moved to the full-width tile 3 the same day**, swapping with the AR game,
  which now runs tile 1 with its 16:9 frame cover-cropped to 2:1 ("3 tile ki video 1 tile may ly jao or 1st tile ki video
  3rd tile may"). `eleve-mockup.mp4` (the brand render, intro) and `eleve-logo.mp4` (the logo colouring in on white, hover)
  (unused since 2026-10-06; the tile shows `eleve-mockup.webp`, its last frame, exported with ffmpeg at WebP quality 82, 82KB)
  were re-encoded from `../VideoClips/work-specs/tile-1.mp4` and `tile-1-1.mp4`, 4072×2036 sources, at 1920×960
  — the 2:1 tile never shows more — with audio stripped, `+faststart` and CRF 22, which lands the static renders at 266KB and
  67KB. The mockup export carries its own ink frame, `#101615` about 60px down each side and 80px top and bottom, which read as
  padding inside the tile (asked about 2026-09-22); the encode crops it off first, `crop=3780:1890:146:80`, a centred 2:1
  window inside the frame. Re-export from the source with that crop, or the padding comes back. **The intro is cut at 1.0s**
  (`-t 1.0`): the export runs 5s, but frame-to-frame motion ends at 0.70s — the logo's flicker-in — and the remaining 4.3s is
  a still, which read as the clip "still running" with nothing happening; the cut keeps the flicker plus a 0.3s hold on the
  final frame, which the tile then rests on. **The logo reveal is cut at 2.5s** the same way: its colour fill has faded out
  by 2.33s and the export held the finished logo for the remaining 2.7s, which under a looping hover read as a frozen image. They replaced the Stokt fish-eye laptop clip. The spec sheets beside them (`1-tile-numbers.png`, `2-safe-areas.png`)
  number the tiles and mark the bottom band as the text zone the clips keep clear; the logo clip's ground is white, which is why
  it carries `tone: 'light'`. The render's own logo sits in its left third, outside the sheet's centred mobile safe area, so
  the intro carries `focus: '0% 50%'`: the square crop below `sm` shows the logo over the office rather than an empty desk. The
  discipline tags travelled with the clips, so tile 1 reads Games & Interactive and tile 3 Web Products (Development & AI since
  2026-10-02). On 2026-10-21 the pair went back to tile 1 and the AR game to tile 3, this time as whole projects, because a
  video-only swap left each title over the other's clip; the hover clip became `eleve-site.mp4`, the case page's cover, so
  `eleve-logo.mp4` is unused too.
- **Encode clips as H.264 (`avc1`) in MP4 or VP9 in WebM.** A clip that was H.265/HEVC (`hvc1`) rendered as a blank tile in Chrome on
  Windows, which cannot decode HEVC without Microsoft's paid extension — and it fails silently, with no media error event, so it
  presents as "not loading" rather than "unsupported". `WorkTile` carries `bg-ink` so a tile that has not painted still reads as a
  dark surface instead of dumping light overlay text onto the page background.
- **Every clip that rests on screen has a poster.** Until 2026-10-12 only work tiles 2 and 5 did, so the AR and VR tiles and
  every service card showed black until the clip had loaded, which on a phone was a black tile for a second or two on every
  scroll, and on Safari, which does not paint a first frame from metadata, black until it played. The AR, VR and three service
  posters are each clip's own frame 0 as WebP (`ffmpeg -frames:v 1 -c:v libwebp`), so the hand-off to the playing clip does
  not jump. A new clip ships with one.
- Services copy in `lib/content/index.js` is placeholder wording pending sign-off. The structure is settled.
- **The footer clip is `stokt-golf-ball-render.webm` — wearestokt.com's own render, with their wordmark printed on the balls. MUST
  NOT SHIP.** It is also 13MB and WebM-only, so Safari falls through to the black panel and every other browser pays for it on
  first paint. The replacement needs an H.264 MP4 alongside the WebM, a poster, and a far smaller file.
- `footerContent.location` reads `Remote — Worldwide` as a placeholder. The reference carries a city line there; confirm what
  Geekinate should say.
- **The testimonials are real but not yet cleared.** Since 2026-09-25 they are the eight from
  `../docs/geekinate-testimonial-handoff.md`: three verified Clutch reviews and six from the live homepage (Twinhub sits in both),
  lightly edited for card length. The handoff asks Geekinate to confirm the edited homepage quotes may be reused and the named
  attributions are still current before this is public. Twinhub's is credited to Jahangir Afzal, not the Clutch reviewer, because
  the reviewer is no longer active there. No headshots exist, so the avatar renders initials rather than stock faces.
- The footer's Legal column links nowhere — no privacy or terms page exists. `/partner`'s consent checkboxes therefore state the
  Privacy Policy as plain text with no link, and section 10 omits the `Read referral terms →` link entirely rather than pointing at
  a placeholder. Both need wiring when those pages exist, along with the `partner_terms_click` event.
- **`/partner` delivers only where its secrets are set.** `worker/partner.js` returns `503 not-configured` unless
  `PARTNER_WEBHOOK_URL`/`CONTACT_WEBHOOK_URL`, or `PARTNER_TO`/`CONTACT_TO` + `CONTACT_FROM` with either the `SMTP_*` trio or
  `RESEND_API_KEY`, are set, and the failure panel then shows the mailto fallback. The live Worker has the SMTP route set.
- No analytics provider is installed. `lib/analytics.js` queues events on `window.dataLayer` for whichever provider lands.
- **The client's copy handoff is applied** (`../docs/geekinate-copy-and-ui-handoff.md`, 2026-10-02): naming, CTA convention,
  home copy, the shared form with its interest chips, the Marketing page, and the doc's one-line contact questions for
  Development & AI and Games, which no longer rotate. Two of its release checks failed and are fixed: over a paper band the nav
  pills turn `bg-void/80` (the links measured about 2.4:1 on the 50% glass, about 5.3:1 now), and `.on-paper :focus-visible`
  draws a solid 2px ink outline, because the volt-at-50% ring all but vanished on white. The closing `CtaBand` is gone from all three service pages on the
  user's word. The reply time stays at two working days on the user's word, although the handoff also says one.
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
