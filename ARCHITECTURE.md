# ARCHITECTURE.md

System structure, modules, dependencies, and where code lives. Read this before searching the tree — it is meant to save you the
search.

## Shape

One Next.js application at the repo root. There is no backend service, no API layer, and no database. Everything renders statically.

```
geekinate/                   the repo, and the application
  AGENTS.md  ARCHITECTURE.md  WORKFLOW.md  QUALITY_AND_SAFETY.md  CLAUDE.md
  geekinate new logo/        brand source assets (see Design system)
  app/  components/  features/  lib/  constants/  public/
```

The repo is named `geekinate`; the folder it is checked out into locally is `geekinate-v1`. The repo named `geekinate-v1` is the
archive of the two older sites and holds nothing from this build.

## Module map

| Path | Holds | Notes |
|---|---|---|
| `app/` | Routes only | Pages compose components and do nothing else |
| `components/layout/` | Presentational primitives | `Section`, `SectionHead`, `Eyebrow`, `JsonLd`, `Footer` |
| `components/ui/` | shadcn output | CLI-generated; fork only deliberately |
| `features/` | Page sections | One folder per section, `index.jsx` entry |
| `lib/ui/reusable_components/` | Client components that own behaviour | `BrandMark`, `HoverVideoCard`, `WorkTile`, `VideoSurface`, `InViewVideo`, `TestimonialCard`, `TestimonialMarquee`, `useHoverVideo`, `nav/` |
| `lib/content.js` | Every user-facing string | Sections read their copy from here |
| `lib/seo.js` | Metadata + JSON-LD builders | Single definition of metadata shape |
| `lib/utils.js` | `cn` | shadcn's class merger |
| `constants/index.js` | `SITE`, `NAV_LINKS`, `SOCIALS` | Site identity and static data |
| `public/brand/` | Mark, lockups, app icon | Brand asset source of truth |

The split between `components/layout` and `lib/ui/reusable_components` is by **kind**, not convenience: the former is
presentational and mostly server-rendered, the latter holds client components with their own state and effects.

Barrels: `components/index.js` and `lib/ui/reusable_components/index.js`. A new file in either directory is unreachable through the
barrel until it is exported there.

### Page sections

Shape inherited from `../Eleve/development/frontend`:

- `features/<name>/index.jsx` — one page section, one folder, default export named for the folder. Imported as `@/features/services`,
  never `@/features/services/Services`. Sections compose `components/layout` primitives and never import each other.
- `lib/content.js` — every user-facing string. Sections destructure their content object on the first line of the component.
- `app/` pages compose sections and do nothing else.

Built so far, in page order: `features/work` (02), `features/services` (03), `features/testimonials` (04). The hero is 01 and does
not exist yet. Section numbers live in the eyebrow copy in `lib/content.js` — renumber there if the order changes.

## Routes

| Route | File | Rendering |
|---|---|---|
| `/` | `app/page.js` | Static. Composes work, services, testimonials |
| 404 | `app/not-found.js` | Static |
| `/sitemap.xml` | `app/sitemap.js` | Static. **Routes are listed by hand** — nothing is discovered |
| `/robots.txt` | `app/robots.js` | Static |

`app/layout.js` owns fonts, metadata, the site JSON-LD graph, `Nav`, `Footer`, and the toaster.

## Layout

**Sections are full width. There is no container and no max-width.** `Section` is the layout box: it carries the only horizontal
gutter on the page, `px-6 md:px-10` — 24px, 40px from `md` — and nothing caps how wide its children grow. A `Container` primitive
used to cap content at 1240, 1440 on the two grids; it was removed on 2026-08-07 at the user's direction. Re-introducing a centred
max-width wrapper is a decision to raise, not a detail.

Two things follow. Grids get the whole viewport minus the gutter, so column counts have to hold up on a wide monitor rather than
inside a 1240 box. And overriding the gutter needs **both** breakpoints — `px-0 md:px-0` — because twMerge tracks responsive
variants separately and a bare `px-0` leaves `md:px-10` standing.

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

## The featured work section

`features/work` — section 02, on `default` (white). It started on `wash`, but the volt tint read as greenish cream against the dark
tiles and was rejected; white against the ink services block gives the alternation without the colour cast. Modelled on
wearestokt.com's portfolio grid, measured live.

Three columns, 16px gaps, 10px radius, with an asymmetric span rhythm: **2+1 / 3 / 1+1+1**. Aspect follows the span — 1-col square,
2-col 2:1, 3-col 16:9. Below `lg` it degrades to two columns and then one, with spans collapsing to squares.

**The rhythm needs exactly six projects.** Removing one leaves a hole in a row, so `span` values in `lib/content.js` have to change
with the count.

Tiles are `object-fit: cover` so media fills the frame, with the title and discipline chips overlaid bottom-left directly on the
media — no scrim, matching the reference. A project with no `href` renders as a `div` rather than a dead link, which is what all six
placeholders currently do.

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

`HoverVideoCard` renders a marked *Media pending* panel when `media.sources` is empty, so no `<video>` ever points at a missing file.
Adding real clips is a content edit — drop files into `public/media/services/` and list them in `lib/content.js` as
`{ src, type }`, webm first with an mp4 fallback second, since Safari's webm support is unreliable.

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
flat strip. Quote lengths are deliberately uneven in `lib/content.js` for the same reason — equal-length cards flatten it too.

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
columns are `footerColumns` in `lib/content.js`: Index is `NAV_LINKS`, Socials is `SOCIALS`, and **Services is derived from the
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

Deliberately absent: no smooth-scroll library, no animation library, no form library, no data layer. Adding any of those is an
architectural decision, not a detail — raise it first.

## Known gaps

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
- Services copy in `lib/content.js` is placeholder wording pending sign-off. The structure is settled.
- **The footer clip is `stokt-golf-ball-render.webm` — wearestokt.com's own render, with their wordmark printed on the balls. MUST
  NOT SHIP.** It is also 13MB and WebM-only, so Safari falls through to the black panel and every other browser pays for it on
  first paint. The replacement needs an H.264 MP4 alongside the WebM, a poster, and a far smaller file.
- `footerContent.location` reads `Remote — Worldwide` as a placeholder. The reference carries a city line there; confirm what
  Geekinate should say.
- **All twelve testimonials are invented**, names and roles included. They must be replaced with real, cleared quotes before this
  is public — fabricated client praise is the one placeholder on the page that is not merely unfinished. No headshots exist
  either, so the avatar renders the speaker's initials rather than stock faces standing in for clients.
- The footer's Legal column links nowhere — no privacy or terms page exists.
- `NAV_LINKS` points at anchors no section defines yet.
- The `nextjs-agent-rules` block at the bottom of `AGENTS.md` is written by `next dev` on every run and is **not** part of this
  document set. Commit it rather than fighting the diff.
