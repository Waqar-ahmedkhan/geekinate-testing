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

**The site sells three services**, and `services` in `lib/content/index.js` is the list: **AI Development** (`development`),
**Games & Interactive** (`games`), **Marketing** (`marketing`). The first was **Development & AI** until 2026-10-06, when the user
renamed it sitewide over the client handoff's normalisation (URL unchanged). The last was **Marketing Systems** until 2026-10-02, when the
client's handoff (`../docs/geekinate-copy-and-ui-handoff.md`) renamed it sitewide — nav, cards, footer, page titles, `/partner` and
the work tags alike — and kept every URL. The site once named four pillars with Web Products as its own; Web Products is folded into
AI Development. The pillar vocabulary used to survive as **tags** on the featured work, and since the same handoff it does not:
`work[].disciplines` draws from the three service names only (`Web Products` became `AI Development`, `Marketing Systems` became
`Marketing`). Shifa International, tile 5, is the one `Marketing` tile, on the user's word (2026-09-25). Derive from `services`
rather than transcribing a count anywhere.

**The home hero has no eyebrow.** The three service names sat above the `h1` in mono caps with dot separators, each lighting its
arc group on the globe under hover; on 2026-10-06 the user said the strip gave the hero an "AI vibe" and it was removed, along with
most of the body sentence ("need to reduce this line"), which now fits one line on desktop. Nothing sets `globe.pillar` any more,
so the globe's pillar highlight is dormant — putting the strip back restores it. Do not reintroduce a mono-caps label row there.

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

Since 2026-09-16 there is a fourth shape: **the AI circuit mark on `/services/development`**, instructed from a reference the user
supplied (an "AI" badge on a circuit board, blue on navy — redrawn in volt and paper, because there is no approved blue). It is the
same beads again, not a new scene: 60% of the particles form it beside the hero copy and the other 40% are hidden while it is up.
Three things were asked for by name and are not to be put back: the orbiting white lights on the outer ring ("remove it"), the
ring-and-dot eye inside the A ("remove it"), and the background particles that faded out behind the text while the mark formed
("iski zarurat nhi"). The circuit's first draft did not read as a circuit ("lag hi nhi raha"); what fixed it was thin still traces,
parallel buses with shared 45° bends, hollow vias at the outer ends and pulses that tint rather than swell. Only the Development &
AI page carries a shape — `SERVICE_SHAPES` in `constants/circuit.js` is the list. It is **off since 2026-09-18**: that map is
empty, because the hero now runs the home page's own AI clip in the same slot. Every piece of the mark is still in the tree, and
putting `{ development: 'circuit' }` back in that map restores it. See ARCHITECTURE.md §The service mark.

The camera is the other load-bearing pair: 7.1 degrees at a distance of 60. It is a long lens on purpose, and changing either number
without the other rescales the entire scene. See the note at the top of `constants/cosmos.js`.

**The globe's top sits a fixed gap below the hero's buttons, on every screen.** The globe's top was `GLOBE.apex`, a fixed fraction
of the viewport (about 55% down), while the hero copy is a fixed pixel height — so the copy ran into the globe on any viewport short
enough: phones first (fixed for portrait only on 2026-10-02), then laptops, where at 125% display scaling the buttons sat on the
rim while a 1080p monitor showed a clean gap. On 2026-10-06 the user asked for the same gap on every screen size. The hero marks its
button row `data-globe-floor`; `measureLayout` records that row's bottom as `stage.floor`, and `globeApex` puts the apex
`GLOBE.floorGap` CSS pixels (40) below it at every aspect, so the globe rises on tall screens and drops on short ones. `GLOBE.apex`
is only the fallback for a page with no floor. PR #21's phone recording was made at the old framing, so it has to be re-recorded
when that branch lands or the handoff to the live globe jumps.

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

**The Elevé tile plays its intro once, and hover runs a second clip.** Instructed 2026-09-22: the Elevé render — tile 1
that morning, the full-width tile 3 since the afternoon's swap with the AR game — plays itself when the tile scrolls into
view, once, and after that the tile answers hover with a different clip — the logo colouring in — not a replay. Its `work`
entry carries both as `media` and `hoverMedia`; `WorkTile` stacks the second over the first and
fades it in under the pointer. Do not collapse them into one clip, loop the intro, or let hover restart it. The hover clip's
ground is white, so `hoverMedia.tone: 'light'` turns the caption ink for it; drop that and the title disappears on hover. The
intro starts the moment half the tile is on screen, with no dwell — `INTRODUCE` in `constants/video.js`. It went there and
back: half on screen was the first cut, then nine tenths held for 600ms after the clip ran out while the tile was still
scrolling in ("jb taak pura tile dekhne pohonchta hoon video khatam bhi hochuki hoti hai", 2026-09-22), and on 2026-09-25 the
dwell was reversed because it made the visitor stop scrolling before anything moved ("video should start as soon as I enter
to the viewport of the 3 tile, and cross it half"). Both complaints are real; the latest instruction wins. And hover
does nothing while the intro runs ("jb autoplay wali video chal rahi hai toh hover wali nhi chaly gi", same day): the reveal
is gated on the intro's `ended` event, in both the handlers and the CSS, and starts on its own if the pointer is already there.
Every hover clip on every tile loops until the pointer leaves ("sare tiles ki video loop may play hoti rahy gi sirf tb stop
hogi jb hover hat jaye ga", 2026-09-22); only the intro is one-shot, and it is cut at 1.0s because its export held a still for
four seconds past the flicker-in, which read as the clip running on with nothing happening.

**The copy sells, and the contact prompt follows the page.** Instructed 2026-09-25: every page but `/partner` was rewritten
because the old copy read as dry and gave nobody a reason to get in touch ("very boring and completely non-sense"). The voice
now is the partner page's: second person, the visitor's problem first, short declaratives, a concrete outcome, a direct ask.
Do not drift back to the wry, understated register ("Games people finish", "How it runs."). **No proof point is invented** —
no project counts, percentages or client results that nobody supplied; the facts rows keep the claims that were already
there. The contact heading and intro are `contactContent.pitches[topic]`, keyed `home` or by service slug: a service page
passes its slug and a case page passes its project's `service`, so the marketing page never asks what you want to automate.
The service pages carried a `CtaBand` before the contact section, its line each service's `handoff`, until 2026-10-02: the client's
handoff called it a repeat of the contact and work buttons right before the form, and the user had it removed from all three
service pages. `/partner` keeps its own band.

**The client's copy handoff outranks the sales voice where they disagree.** On 2026-10-02 the client sent
`../docs/geekinate-copy-and-ui-handoff.md` and the user said to proceed with it. It asks for plain, conversational copy that says
what the visitor can do and what Geekinate does, with no unsupported promise — so "free traffic", "growth never stalls", "every
lead traced" and a universal "4 to 6 weeks" are out wherever they still stand. Applied so far: the naming above, the home page's
copy (hero, clients, work, services, contact), and the CTA convention — every button that opens an enquiry reads **Let's talk**,
every button to the work grid reads **See our work** (`/#work`), and the form submits with **Send enquiry**. **There is one
contact form and every page shows it**, interest question included: the handoff drew those six options for Marketing, and the user
put them on the shared form instead ("all pages will show the same contact us form") — do not fork the form per service. Since
2026-10-06 the options are a single-choice dropdown, not chips (instructed) — a Radix `Select` from the already-installed `radix-ui`
package, because the native `select`'s option list cannot be styled and was called "very bad" on sight. **The *Ready to Geekinate?* line sits above every
contact form**: `Contact` renders `features/cta` itself (2026-10-06, "should be default and always top on the contact us form"),
so no page adds it separately. The nav CTA goes to the
current page's own `#contact` on `/services/*` and `/work/*` (`CONTACT_ROUTES`) and to `/#contact` everywhere else. The home page's
`Process` link was removed because the home page has no `#process` to land on. The Marketing page carries the handoff's copy
section by section: its own Scope and Process eyebrows and headings through `service.sections` (merged over the shared
`servicePageContent.blocks`), a small label on each scope card, an intro line under the Deliverables and Process headings, no facts
strip, and a single fixed contact heading under a *Let's talk* eyebrow. AI Development and Games keep their own copy.

**The case pages take the old site's content order and Stokt's case-study layout.** Instructed 2026-09-24: `/work/[slug]`
carries the portfolio page on geekinate.com in order (title, cover, Requirements / Challenge / Solution, technologies, three
more projects, contact), laid out as wearestokt.com's Heron case study below the hero: a statement-and-paragraph intro with a
ruled facts table, a tech-stack marquee strip, then editorial text sections. The hero alone is the old site's — centred title,
the clip below it straddling the black ground and a white panel with the old band's curved edge — instructed by screenshot
("make hero section exact same like the previous version") after a Stokt media-card hero ran for an afternoon, so the route
carries no `HeroSheet`. Two layouts invented without the reference were rejected the same day — the old page copied band for
band ("very bad"), then a card-heavy rework ("still very poor") — so reach for the reference before inventing a third. Do not bring the old page's look across (the green blobs, the
check-circle bullets, the logo strip). **Four of the five pages are drafted copy** — only Twinhub's is transcribed from the old
site — so treat every word on the AR game, Elevé, VR game and Shifa International pages as a placeholder until the real copy
replaces it. See ARCHITECTURE.md §The case pages.

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

It now runs: `PageHero` (`clear`, `min-h-svh`), then Scope as a `paper` band of `Card`s, Deliverables as a full-height `ink` section of four statement cards, Process
as a `paper` band of `StepIndex` steps against a sticky header, then the reused `Contact` (a `CtaBand` sat before it until
2026-10-02) — every section
`mx-auto max-w-6xl`, alternating paper and ink, exactly as `/partner` does. The dossier's own devices are gone: no index rail, no
ledger grid, no gsap timeline, no full-bleed. `Contact` no longer takes a `className` because nothing needs to override its width
any more.

**The service page names itself in the eyebrow, not the `h1`** — the same mapping `/partner` uses. Eyebrow is the page's name
("Development & AI" / "Referral Partner Program"); the `h1` is the promise, in italic display with one volt phrase. The service name
still reaches search through the metadata title and the `Service` JSON-LD, so do not "fix" this by promoting the title back to `h1`.

**Every service hero carries an aside, and it is the service's own clip.** The hero was built as a split with the
clip in a bordered panel on the right, matching `/partner`'s `FlowRail`; the panel was pulled on 2026-09-08 ("remove this
temporarily") and the content centred. On 2026-09-16 `/services/development` went back to the split, with the text on the left and
the AI circuit mark on the right (instructed: object right of the text, and "sirf is AI waly ko service page par laga do"). On
2026-09-18 the mark was taken out of that slot and the clip put back in it — the same `/media/services/ai.mp4` the home page's
Development & AI card runs, in a bare square with no border or panel. The square carries `ground-patch` so the clip's black
background blends away — see the `mix-blend-screen` trap; do not "tidy" that class off. It plays itself once when it first comes on screen and
after that only on hover, which is `useHoverVideo({ introduce: true })` and the card's own `loop: false`. `SERVICE_CLIPS` in
`constants/ai.js` is the list of slugs that get one, and a slug outside it falls back to the centred hero. Games and Marketing joined the
list on 2026-09-22, once the Development & AI page was signed off ("make rest of the services pages as well like a AI & development
service page"): each runs the clip its home-page card already runs (`game.mp4`, `marketing.mp4`, both cut on black — measured, every
corner reads `0 0 0`, so the blend holds), and each took a `scopeIntro` line for the Scope head, which only Development carried before.

**The Guide never moves the page by itself, and it calls OpenAI with no ceiling above it.** It is **off for now**: pulled from the
`/services/development` hero on 2026-09-16 ("remove chat agent for now") by emptying `guidedServices` in `lib/content/guide.js`,
which hands that hero's aside to the clip (the Guide wins the slot over `SERVICE_CLIPS` when a slug is in both). Every piece of it is
still in the tree; putting `'development'` back in that array restores it. When on, it docks in the hero and floats once the dock is
off screen or under the sheet. A `goToSection` call used to scroll the moment the reply streamed in, which took the page away before
the answer could be read; since 2026-09-14 it renders a button under that reply instead, labelled from `guideContent.jumps`, and the
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

**A sticky grid item is not clamped to its own row.** `Process` and `Contact` both put `lg:sticky` directly on a
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

**The Scope cards answer hover, and only hover.** A scroll-in fade-up was turned down on sight on 2026-09-15 and must not come
back. `DeckCard` (the card tips a degree and a volt card slides out from under it) was picked from
the second prototype round and shipped. On 2026-09-17 the user asked to try round two's option G instead, "just wanna see how
it will look": `LiftCard` lifts the card 3px on a spring with its shadow growing to 6px, `RollIndex` rolls each digit of the
index through a full turn in volt, and the detail follows a beat behind. It is **on trial**, and `DeckCard` stays in the tree
unused until the call is made, so reverting is a two-line import swap in `Scope.jsx`. Round one's objection to a plain lift
("the hover every site already has") is why the roll is not optional here. The titles are white at rest and turn volt on the
same hover, a plain colour transition (2026-09-16): a volt marker that wiped across the title while the type flipped to ink was
rejected ("green highlighter na aye"), so do not put a background behind the title. The cursor stays an arrow and there is no
arrow icon: these cards link nowhere. On the Games page the index is a die (instructed 2026-09-30: "replace that simple
counter with dice ... each card stops at that specific dice number"): `RollDie` is drawn in CSS rather than reusing the hero's
3D model, rolls on the same hover and lands on the card's number. Only slugs in `DICE_SCOPES` get it; the other services keep
the rolling digits.

**The Process steps are big type that runs itself, and a row never changes height.** It went through three shapes on
2026-09-16. All four steps open was the original. A hover accordion (the step under the cursor opens, the rest close) was
instructed from a reference and then rejected the same day as reading empty ("khali khali"): four single words carrying half a
full-screen section, with step 01 already open on arrival. Three layouts were prototyped; a list beside a black stage card was
built and turned down ("woh bura lag raha hai"), and option C was picked: `Cycle` (in `lib/ui/reusable_components` since 2026-09-24) sets each step
name in the display face, dims the inactive ones, and lights the active step. It starts on step 01 and advances every
`PROCESS.dwellMs` once half of it is on screen, with a volt bar filling along the top of the active row; hover or focus on the
step list holds the step, and leaving resumes. The hold sits on the `ol`, not the
wrapper: pausing while the pointer rested on the heading ("How it runs." then) read as the section freezing for no reason.

**Every sentence in a `Cycle` is on screen all the time** (2026-10-02). Until then only the active row showed its sentence on
desktop and the inactive names sat at `text-mut/40`, so a visitor read one sentence per 4.2 seconds and the faded names measured
about 1.9:1 against paper. The client's handoff asked for every row readable without hover or a timer, and the user picked keeping
the moving highlight with the text always shown: inactive names are `text-mut/70` (about 3:1, the floor for type this large),
inactive sentences full `text-mut`, and the active row turns both to `text-foreground`. The `ol` is a grid and each row a
`subgrid`, so the name column is as wide as the widest name and every sentence starts on the same line; with independent row
grids the sentences started wherever their own name ended. Only colour changes between states, so no row changes height: a
row that grew would push the next one under a still pointer and the hover would oscillate. Below `md` every sentence sits under
its name.

**Deliverables runs the same list, mirrored.** Instructed 2026-09-18 ("same design uper waly section may bhi kardo ... but flip
karky"): the four statement cards on the black band were replaced by the Process list, so `Cycle` serves both — and since 2026-09-24 the case page's Solution band too, on black but *not* mirrored (heading left, list right, instructed after a mirrored first cut) — and the section
is the one component with `mirror` passed — the list takes the wide column on the left and the sticky header sits in the narrow
one on the right, the reverse of Process. The mirror is a CSS `order` on the `ol`, not a DOM swap, so the header still comes
first when the grid stacks below `lg`. The list's colours are `text-foreground` and `text-mut`, never `text-ink`/`text-grey`, or
it would not survive the move from a paper band to an ink one. The deliverables in `lib/content/index.js` were rewritten from
single sentences to `{ title, detail }` the same day, because the design needs a one-word name to set in display type.

**`CtaBand` breaks its line before the volt phrase.** Instructed 2026-09-18 ("let's new line par ajaye ga"): the trail is a
`block` span, so "Got a vibe coded app?" and "Let's Geekinate it." are always two lines rather than wrapping wherever the
measure lands. `/partner` shares the band and reads the same way.

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

**`mix-blend-screen` needs a backdrop inside the same stacking context, or it does nothing — and the page's ground is not a
flat colour.** The hero clip is a black-backed video on a black page, and `mix-blend-screen` alone left it as a visible box:
`Section` is `relative z-10` and `HeroSheet`'s hero wrapper carries a gsap transform, either of which forms an isolated blending
group, so the video had nothing to blend with and painted its own `#000` over a page that is `--void` `#050704` — darker than
its surroundings, which is what made the rectangle read. Painting the slot flat `--void` was not enough either: `html` carries
two fixed radial gradients over that colour (the volt wash from the bottom, the paper one from the top), so a flat patch cut a
hole in the glow and the box came back, brightest on short viewports. The slot now carries `ground-patch`: the `ground` utility
that `html` itself uses, so the blend resolves against the page's real colour, plus a 9% feather on all four edges. The feather
is load-bearing — `background-attachment: fixed` re-anchors to the transformed ancestor once the sheet starts receding, which
puts a whole viewport's gradient inside a 453px square and reads as a bright box mid-scroll. Feathered, the mismatch is a soft
glow instead of an edge: the worst inside/outside difference across three viewports and three scroll positions measures two
levels. Measure that difference before and after any change here; five levels is enough to see.

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

**A portalled popover leaves `.on-paper` behind, and the paper focus outline beats Tailwind.** Radix renders a `Select`'s list in a
portal on `body`, outside the paper section, so `shadow-brutal` resolved to the root's faint volt shadow until the list itself was
given `on-paper`. Inside it, `.on-paper :focus-visible` drew a 2px ink ring around whichever option the pointer was on, and
`outline-none` could not remove it: that rule is unlayered CSS in `globals.css`, and unlayered declarations beat everything in
Tailwind's `@layer utilities` whatever the specificity. The options carry `outline-none!`; their highlight colour is the focus cue.

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

**A CSS cube's front face is magnified by its own perspective, and that is what blurs it.** `RollDie` first placed each face
at `translateZ(half)` around the cube's centre, the textbook layout — which puts the resting face half a die *towards* the
viewer, so `perspective` scales it: 28px drew at 30.68px on a fractional pixel, and the dice read as blurred on sight
(2026-09-30). Pushing the whole cube back by half its depth, ahead of the rotations, puts the resting face on the page plane at
scale 1 on whole pixels. Measure the face's `getBoundingClientRect` against its box before trusting a 3D element's sharpness.

**`max-width: 0` does not collapse a box that has padding.** Everything here is `box-sizing: border-box`, and a border-box element
cannot shrink below its own padding — so a `max-width: 0` element with `pl-2` still occupies 8px. This silently knocked the nav mark
4px off centre. Animate the padding alongside the width, or put the spacing on a parent that also collapses.

**A barrel imported by one client component ships everything the barrel re-exports.** `features/cta` is a client component and
imports `Section` from `@/components`; that barrel re-exports `Footer`, which imports `lib/ui/reusable_components`, which
re-exports the Guide and the referral form. With no `sideEffects` field, Turbopack could not prove the unused re-exports were
safe to drop, so the root layout's chunk carried the AI SDK, `zod`, `@ai-sdk/gateway` and the referral form's Radix parts to
every page — 600KB raw, half of it from a feature that is switched off (found 2026-09-25). `"sideEffects": ["*.css"]` in
`package.json` is the fix, and it has a cost: a module imported only for what it does on import, with no export used, is now
dropped. Import such a module where its export is used, or list it in that array. Check the root layout's chunk for `zod`
after touching either barrel.

**Anything the layout mounts must not import three.** `SubstrateField` read the glyph mask off `getCloud()`, and that one import
put three.js core, the globe build and the land mask into every page's first-load JS, ahead of the lazy `Scene` it was meant to
wait for. Data that crosses from the canvas to the rest of the shell goes through a plain singleton — `lib/shape/footprint.js`,
the same shape as `lib/boot/ready.js`.

**Do not put `preload="metadata"` back into the video markup.** It looks like the cheap setting, and Chrome still fetched every
clip on the home page at 0.7s — nine of them, about 1.3MB — alongside the stylesheet and the fonts. `VideoSurface` renders
`preload="none"` and warms each clip itself: near the viewport, or after `load` for a hero clip passed `eager`. See ARCHITECTURE.md
§Hover-to-play video.

**The globe is paused while the preloader covers it, and the preloader is not what makes the page slow.** After its two ready
frames the canvas skips rendering until the gate opens, which is invisible behind the black overlay. Opening the gate on mount to
"speed things up" was measured on 2026-09-25 and scored lower (TBT 860ms against 490ms), because the globe then draws from the
first frame. See ARCHITECTURE.md §Performance before trying it again.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

