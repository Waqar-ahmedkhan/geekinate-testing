# AGENTS.md

Repository guidance and coding boundaries for Geekinate v2. Start here.

| Need | File |
|---|---|
| Where code lives, how modules relate | `ARCHITECTURE.md` |
| How a change gets investigated, built, verified, approved | `WORKFLOW.md` |
| Review checklist, security, guardrails | `QUALITY_AND_SAFETY.md` |

## The project

Geekinate's agency website, rebuilt from scratch. A single Next.js app living at the repo root — no backend, no database, no
`frontend/` wrapper. The repo is the application. It is **not deployed on Vercel**: production is a Node server we control,
`next start` behind a reverse proxy. See `ARCHITECTURE.md` §Shape for what that changes.

**The site sells three services**, and `services` in `lib/content/index.js` is the list: **Development & AI** (`development`),
**Games & Interactive** (`games`), **Marketing Systems** (`marketing`). This file previously named four pillars with Web Products
as its own — that is no longer true at the service level; Web Products is folded into Development & AI, whose summary reads "Web
products, platforms, and the agents and pipelines that run inside them." The four-pillar vocabulary survives in exactly one
place, as **tags** on the featured work: `work[].disciplines` still uses `AI & Automation`, `Games & Interactive`,
`Marketing Systems` and `Web Products`. Derive from `services` rather than transcribing a count anywhere.

Design direction is not open to invention: it is decided in the Asana thread *Revamp Web Design to a modern design*, with
`wearestokt.com` as the agreed base, `denqid.com` for the hero, and `landing.love/categories/agency` for further reference. It is
being built **section by section**, hero first.

Reference material sits one level up in `../`: `geekinate-site-spec.md` (intended build), `nudot-spec.md` (motion vocabulary),
`geekinate-site/` (the shipped static predecessor), and `Eleve/development/frontend` (the folder conventions this repo follows).

## Commands

Run everything from the repo root:

| Command | Notes |
|---|---|
| `npm run dev` | Turbopack dev server. **Port 3008**, pinned in the script so it never collides with a sibling project (Eleve holds 3006) |
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
leftward, `gap: 150`, `padding: 10`, `fadeWidth: 46` (so the `mask-image` stops land at 23% and 77%). Stokt has no hover slowdown
(`hoverFactor` is 1 there); ours eases to quarter speed on hover (`hoverFactor: 0.25`, lerped by `hoverEase` — a full stop was
rejected as "ruk jata hai") with a crossfade to the colour logo set, both instructed by the user on 2026-08-28 and a deliberate
deviation from the transcription. The running speed was measured back at 40.00 px/s in this build. Retuning any of them is a
design decision to raise, not a tidy-up. The logos are **real client marks** as of 2026-08-27, exported twice from
the supplied originals that stay beside them in `public/media/clients/`: ink-on-transparent (`*.webp`) and original-colour
(`*-color.webp`, LinkTax refilled in its brand navy because its white type cannot sit on the light strip). The strip runs the
**ink** set — the colour set was shown for review on 2026-08-27 and the switch back to black was instructed on 2026-08-28;
flipping `src` values in `lib/content/index.js` is the whole change either way.

**The preload gate must never be able to trap the page.** `lib/ui/reusable_components/preloader` holds a black overlay over
everything until the globe paints its first frame, which reaches it through `lib/boot/ready.js`. That signal can legitimately never
arrive — no WebGL, a throttled tab, a context loss — so `PRELOADER.maxMs` completes the gate regardless. Removing that failsafe, or
gating on a signal without one, ships a black screen to whoever the globe fails for. `minMs` is the other half: it stops a warm
cache flashing the overlay for three frames.

**The service page speaks the partner page's language, and the two share their primitives.** `/services/[slug]` has been through
three shapes. It was first built as the home page's own language and rejected on 2026-09-04 as "a replica of home page"; it then ran
a bespoke Swiss-grid dossier — opaque `ink` masthead, full-bleed 12-column ledger rows, a gsap-scrubbed process spine, a sticky
right-hand index rail — and that was rejected on 2026-09-08 for the opposite reason: `/partner` had shipped in the meantime and been
approved, so the site now carried two unrelated marketing layouts. The instruction was to make the service pages consistent with
`/partner` **and to share the code rather than build a second design**.

It now runs: `PageHero` (`clear`, `min-h-svh`), then Scope as a `paper` band of `Card`s, Deliverables as an `ink` band, Process
as a `paper` band of `StepIndex` steps against a sticky header, then `CtaBand`, then the reused `Contact` — every section
`mx-auto max-w-6xl`, alternating paper and ink, exactly as `/partner` does. The dossier's own devices are gone: no index rail, no
ledger grid, no gsap timeline, no full-bleed. `Contact` no longer takes a `className` because nothing needs to override its width
any more.

**The service page names itself in the eyebrow, not the `h1`** — the same mapping `/partner` uses. Eyebrow is the page's name
("Development & AI" / "Referral Partner Program"); the `h1` is the promise, in italic display with one volt phrase. The service name
still reaches search through the metadata title and the `Service` JSON-LD, so do not "fix" this by promoting the title back to `h1`.

**The service hero carries no aside, for now.** It was built as a split with the service's clip in a bordered panel on the right,
matching `/partner`'s `FlowRail`; the panel was pulled on 2026-09-08 ("remove this temporarily") and the content centred. `PageHero`
switches to a single centred column whenever no `aside` is passed, so restoring it is a matter of passing the panel back — the clip
is still in `lib/content/index.js`.

**The Guide never moves the page by itself, and it calls OpenAI with no ceiling above it.** It docks in the
`/services/development` hero — `guidedServices` in `lib/content/guide.js` picks the pages — and floats once the dock is off screen
or under the sheet. A `goToSection` call used to scroll the moment the reply streamed in, which took the page away before the
answer could be read; since 2026-09-14 it renders a button under that reply instead, labelled from `guideContent.jumps`, and the
page moves only when the visitor presses it. `highlight` is the one action that still runs on arrival, because it moves nothing.
The Blueprint section, its form and its `/api/blueprint` routes were removed the same day. On cost: `maxOutputTokens`, the
500-character message cap, the eight-turn cap and the 20-per-day throttle bound how large and how often requests are — **none of
them stop a bill.** The hard limit lives in the OpenAI dashboard and nothing here can set it, so never describe this feature as
spend-capped.

**The in-process throttle assumes exactly one Node process.** `app/api/{partner,guide}` keep their counters in a module-scope
`Map`. That is real on a single `next start`, resets on restart, and **silently multiplies by the worker count** under pm2 cluster
mode or two containers. It also depends on the reverse proxy setting `x-forwarded-for`: without it every visitor keys to `'local'`
and one submitter throttles the site. Neither has been verified on the real host. In dev, editing a route hot-reloads the module
and wipes the counter, which reads as the limiter not working — it is.

**A host that builds from the repo has to be given `OPENAI_API_KEY` itself.** Every `.env*` file except `.env.example` is
gitignored, so a Vercel deploy has no key unless it is set in the project's environment settings, and a variable added after a
deploy only takes effect on the next one. Without it `/api/guide` answers 503 `not-configured` and the chat reads "The guide is
not running right now." — which is exactly what staging showed on 2026-09-14 while the same page answered locally. A Vercel
deploy also runs more than one instance, so the throttle above is per instance there.

**Read `node_modules/ai/docs/` before touching the AI SDK, the same way you would for Next.** It is v7 and the surface moves.
Three things already caught: `Output.object` takes Zod, Valibot or a raw JSON Schema and **not yup**, so the model's shape goes
through `jsonSchema()` (the removed Blueprint rode yup on its `validate` hook); `generateObject`, `maxTokens` and tool `parameters` are all gone; and
`zod` sits in the lockfile only as a required peer of `ai`, so importing it would be depending on a transitive.

**A sticky grid item is not clamped to its own row.** `Process`, `Deliverables` and `Contact` all put `lg:sticky` directly on a
`<header>` grid child, which is safe only because those grids have one row. The Blueprint (removed 2026-09-14) added a second, full-width row and the
header slid straight over it. If a grid with a sticky header ever gains another row, wrap the header in a stretching grid item so
the sticky is bounded by the row — and drop `items-start`, which stops the wrapper stretching.

**Nothing below the hero is 3D.** Work, Services and Testimonials stay on the flat system — white ground, ink borders, hard offset
shadows, no blur-based depth — and they are opaque, which is what hides the scattered field behind them. Reaching for a soft shadow,
a glow or a gradient down there because "the hero does it" is the misreading to avoid.

**The hero paints no ground of its own.** The canvas is fixed at `z-[1]` and every `Section` is `relative z-10`, so a background on
section 01 would cover the very thing it exists to frame. The black comes from `html`.

**The service and partner heroes sit under a sheet.** Instructed 2026-09-14: past the hero, the next white section has to slide up
over it like a sheet rather than scroll it away. `HeroSheet` does it for `/services/[slug]` and `/partner` alike — the page passes
its hero as `hero` and every later section as children — so a new marketing page reuses it rather than restyling a section. From
`lg` up the hero is held `sticky` for one `100svh` of scroll while the sheet rises, rounded at its top edge, and the hero scales
back and darkens underneath (`SHEET` in `constants/sheet.js`). Below `lg` the hero scrolls normally and only the rounded edge
arrives: held on a phone, the stacked hero parks the Guide's chat under the thumb for a whole screen of scroll, and a swipe on its
log moves the log instead of the page. The sheet wrapper is a plain, unpositioned `div` on purpose: `Nav` reads
`.on-paper` bands from `offsetTop`, and a `relative` wrapper would shift every band by the hero's height. See ARCHITECTURE.md
§The hero sheet.

**The Scope cards answer hover, and only hover.** Picked on 2026-09-15 after two rounds of prototypes: a scroll-in fade-up was
turned down on sight, and a card that simply lifts on a bigger shadow read as the hover every site already has. `DeckCard` tips
the card a degree and slides a volt card out from under it, which takes over the hard shadow. The cursor stays an arrow and there
is no arrow icon: these cards link nowhere, and a hover that promised a click was the objection raised against animating them at
all. Do not bring a scroll reveal back to this grid.

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

**A page with no `#hero` used to park the particle cloud in its globe pose forever.** `stage.heroOut` only advanced while `#hero`
was on the page, so on `/services/[slug]` it stayed at `0`, `orbiting` stayed at `1`, and the globe never sank or dispersed. Every
section above the footer is opaque there, so it presented as "the globe appears in the footer" rather than as a stuck stage value.
`measureStage` now falls back to `heroOut = 1` when the page carries no hero, which is the honest reading: no hero, nothing to
disperse from. Any future route without a `#hero` depends on that fallback.

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

**`id="hero"` is load-bearing, and `/services/[slug]` depends on not having one.** `measureStage` falls back to `heroOut = 1` when
the page carries no `#hero`, which is what stops the particle cloud parking in its globe pose. Any new section on that route takes
its own id — the dossier's take `scope`, `process` and `deliverables` — and never `hero`. The hero itself is `hero-service`, and
under `HeroSheet` it is stuck, so nothing may try to scroll to it.

**The shadcn `Button` base has no `cursor-pointer`.** Every button built from it sits on a default arrow until the class is added
by hand. The site's own chips already do this; new buttons must too.

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

**A shadcn default that references `--border` or `--muted-foreground` does not adapt to `.on-paper`.** Both are declared on
`:root` as `var(--line)` / `var(--paper-mut)`, and custom-property substitution happens where the declaration lives — so they lock
to the root's dark values and `.on-paper`'s override never reaches them. `Separator` rendered white-on-white and the accordion
chevron was invisible on every paper section. Use `border-line` and `text-mut`, which resolve per element. This has now bitten
three generated components; check any new shadcn output for these two tokens before trusting it.

**Radix emits `data-state="checked"`, not `data-checked`.** The `radix-nova` shadcn style writes `data-checked:` variants
throughout `checkbox.jsx` and `radio-group.jsx`, so every checked-state style in them is dead on arrival — a selected radio simply
renders as unselected. Retarget to `data-[state=checked]:`. Safer still for anything load-bearing: derive the class from React
state, the way `contact-form` styles its chips.

**`npx shadcn add` installs a junk npm package called `cn`.** It writes `import { cn } from "cn"` instead of the configured
`@/lib/utils` alias and then installs a real, unrelated package of that name to satisfy it. Both times it has run here it did this.
After every `add`: fix the imports and `npm remove cn`, then confirm `package.json` and the lockfile show no diff.

**A grid item will not shrink below its content.** Grid and flex children default to `min-width: auto`, so a two-column editorial
grid that stacks on mobile can still force its track wider than the container — `/partner`'s contact grid overflowed 320px by 12px
this way, and the offenders all measured as the *column*, not the thing inside it that was actually too wide. `[&>*]:min-w-0` on
the grid is the fix; chasing the widest descendant is a dead end.

**A fixed full-viewport canvas that stops drawing keeps its last frame forever.** `SubstrateField` paints the footer's automata
grid onto a `fixed inset-0` canvas and parks its ticker when an `IntersectionObserver` says the footer left the screen — but it
never cleared. On a client navigation the footer goes off-screen, the ticker stops, and the frame that was on the canvas stays
painted over the next page's hero. It presents as "the hero shows the footer's dots until I refresh", which reads like a 3D bug and
is not one: the WebGL canvas was innocent both times it was blamed. Anything that stops an rAF loop over a persistent canvas has to
wipe it in the same breath — on the stop, on an empty measurement, and in cleanup.

**Lenis's scroll position goes stale across a client navigation.** `pageOffset()` prefers `scrollProgress.offset`, which is fed by
Lenis's `scroll` event. Next scrolls the window to the top on a route change, but Lenis is mounted in the app shell and is never
told, so it keeps reporting the previous page's offset until the user scrolls. `measureStage` then computed `footerIn ≈ 1` on a page
scrolled to `0`, and the particle cloud stayed in its footer letterform. The tell is that `window.scrollY` and the stage disagree —
check that before touching the shader. `resetStage()` in `lib/scroll/stage.js` runs one frame after each pathname change and resyncs
the engine (`syncScrollEngine`), the cached offset, and the layout. Any future scroll-derived state needs the same reset.

**A Lenis glide survives a client navigation, and drags the new page back down.** Clicking a service card on the home page within
about a second of scrolling landed `/services/development` at 3200px — the old page's scroll target, deep in the contact form on a
4831px page — instead of the top; the same click 2.5s after the last wheel tick landed at 0. Next does scroll to the top
(`documentElement.scrollTop = 0` in `layout-router`), but Lenis ignores native scroll events while `isScrolling === 'smooth'`, so
the next frame of the old lerp writes its own value straight back. `syncScrollEngine` could not rescue it: `resize()` sets the
target to the current position, and `scrollTo` returns early on an unchanged target without stopping the animation.
`SmoothScroll` now calls `settleScrollEngine()` — `stop()` then `start()`, which is Lenis's own reset — in a layout effect keyed on
the pathname, so it runs in the same commit as Next's scroll handler, before any frame of the old glide can. Do not swap it for
`scrollTo(y, { immediate: true })`: that sets `preventNextNativeScrollEvent`, which swallows the scroll event Next's reset produces.

**`IntersectionObserver`'s ratio is relative to the target, not the viewport.** A threshold of `0.5` on a section taller than the
screen can never fire, silently. Compare `intersectionRect.height` against `Math.min(sectionHeight, innerHeight) * 0.5` instead.

**A covered element is still on screen.** Under `HeroSheet` the Guide's dock never leaves the viewport — the sheet slides over it —
so an `IntersectionObserver` on the dock keeps reporting it visible, and the floating launcher would not appear until the released
hero had scrolled a whole viewport further. Occlusion is invisible to `IntersectionObserver`; v2's `isVisible` would see it but is
Chromium-only. `HeroSheet` publishes whether it covers the hero through `lib/scroll/sheet.js` — `markSheet` / `watchSheet`, the
same singleton shape as `lib/boot/ready.js` — and the dock floats on either signal. Anything inside a hero that hides or pauses
on "left the screen" needs the same second listener.

**An in-page hash link does not fire `hashchange` here.** With Lenis anchors and the Next router in play, a CTA pointing at
`#refer-a-lead` scrolls but never notifies a `hashchange` listener, so anything keyed on it works on a cold load and silently fails
on a click. Publish the intent through a module singleton instead — `lib/partner/intent.js`, the same shape as `lib/boot/ready.js`.

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

