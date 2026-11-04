# AGENTS.md

Repository guidance and coding boundaries for Geekinate v2. Start here.

| Need | File |
|---|---|
| Where code lives, how modules relate | `ARCHITECTURE.md` |
| How a change gets investigated, built, verified, approved | `WORKFLOW.md` |
| Review checklist, security, guardrails | `QUALITY_AND_SAFETY.md` |

## The project

Geekinate's agency website, rebuilt from scratch. A single Next.js app living at the repo root — no backend, no database, no
`frontend/` wrapper. The repo is the application. It is **deployed on Cloudflare's free Workers plan** (decided 2026-10-16, in
the account the team was invited to, not the user's own): `next build` writes a static export to `out/`, Cloudflare serves those
files as static assets, and one small Worker in `worker/` answers `/api/*` — the form endpoints. There is no `next start` any
more. See `ARCHITECTURE.md` §Shape for what that changes. The first deploy landed in the user's own account by mistake; since
2026-10-21 the site is Worker `geekinate-com` in **Nouman.digg@gmail.com's Account**, and `account_id` in `wrangler.jsonc` pins
every deploy there. **Since 2026-10-28 it is geekinate.com**: the zone moved from OnlyDomains' DNS to Cloudflare (registrar still
OnlyDomains, nameservers `kai`/`mimi.ns.cloudflare.com`), the apex and `www` are the Worker's custom domains (`routes` in
`wrangler.jsonc`), and the previous site on a Hetzner server (65.109.164.70) no longer receives traffic. The Migadu mail records
moved with the zone unchanged, DKIM CNAMEs DNS-only. `geekinate-com.nouman-digg.workers.dev` still serves the same build,
`noindex` through `public/_headers`.

**The site sells three services**, and `services` in `lib/content/index.js` is the list: **Development & AI** (`development`),
**Games & Interactive** (`games`), **Marketing** (`marketing`). **The names live in one place**, `serviceNames` in
`lib/content/shared.js`, and everything else reads them from there — the service cards, page titles and eyebrows, the footer,
`/partner`'s cards and referral options, and the home page's `<title>`, which `joinNames` builds from them
(`short` is the name that title uses, so Games reads *Games* there). Instructed 2026-10-26: "iska kuch esa karo ky bad jb b
titles change karne hoon ak hi jagah sy karun". Never type a service name into a component or another content module. The
first service was **Development & AI**, then **AI Development** from 2026-10-06 (the user's rename over the first handoff's
normalisation), and **Development & AI** again since 2026-10-26, on the second handoff and the user's word (URL unchanged
throughout). The last was **Marketing Systems** until 2026-10-02, when the client's handoff
(`../docs/geekinate-copy-and-ui-handoff.md`) renamed it. The site once named four pillars with Web Products as its own; Web
Products is folded into Development & AI. **The work tiles do not carry service names.** Since the handover of 2026-10-26
(`../docs/geekinate-website-copy-handover-2026-10-26.md`) each project's `disciplines` is the service actually delivered —
*Brand Identity & Web Development*, *AR Game Development* and so on — and the case page's *Service* row is the same string in
sentence case (`sentenceCase`). The pillar a project belongs to is its `service` slug, which picks its contact pitch and the
form's topic; keep the two apart. Derive from `services` rather than transcribing a count anywhere.

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
| `npm run build` | Static export to `out/`, then `scripts/flatten-segments.mjs`. A failure here is usually a prerender error, not a compile error |
| `npm run preview` | `wrangler dev` on **port 3007**: serves `out/` and runs the Worker, so this is the only local way to submit a form. Build first |
| `npm run deploy` | `wrangler deploy` from this machine. Normally unused: Cloudflare builds and deploys from GitHub on push |
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
`worker-mailer` is the second, raised and approved on 2026-10-21 so the forms can send through an SMTP mailbox (Gmail first, the
Migadu mailbox since 2026-11-04) rather than wait on Resend's domain verification. It is pinned to 1.2.1, the version Eleve runs.

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
is only the fallback for a page with no floor. The phone hero's still follows the same floor: PR #21 recorded it at the old
framing, so it was re-recorded when that branch landed (2026-10-28), and its layer is placed from `stage.floor` as well.

**The client marquee's numbers are transcribed, not chosen.** `constants/marquee.js` holds values read off `wearestokt.com` on
2026-08-25 — the live Framer `Ticker`'s own props plus its computed styles, not an eyeballed reconstruction: `speed: 40` px/s
leftward, `gap: 150`, `padding: 10`, `fadeWidth: 46` (so the `mask-image` stops land at 23% and 77%). Stokt has no hover slowdown
(`hoverFactor` is 1 there); ours eases to quarter speed on hover (`hoverFactor: 0.25`, lerped by `hoverEase` — a full stop was
rejected as "ruk jata hai") with a crossfade to the colour logo set, both instructed by the user on 2026-08-28 and a deliberate
deviation from the transcription. Below `md` the strip's gap is 56, not 150 (`phoneGap`, instructed 2026-10-23: a phone showed
one logo at a time). The running speed was measured back at 40.00 px/s in this build. Retuning any of them is a
design decision to raise, not a tidy-up. The logos are **real client marks** as of 2026-08-27, exported twice from
the supplied originals that stay beside them in `public/media/clients/`: ink-on-transparent (`*.webp`) and original-colour
(`*-color.webp`, LinkTax refilled in its brand navy because its white type cannot sit on the light strip). The strip runs the
**ink** set — the colour set was shown for review on 2026-08-27 and the switch back to black was instructed on 2026-08-28;
flipping `src` values in `lib/content/index.js` is the whole change either way.

**The Elevé tile rests on a still, and hover runs a clip of its own.** Tile 1 shows the brand render's settled
frame (`eleve-mockup.webp`, the last frame of `eleve-mockup.mp4`) and answers hover with a different clip, fading it in under
the pointer: `eleve-hover.mp4`, the site scrolling on a laptop over a concrete plinth, supplied on 2026-10-26 ("jb us par hover
karyn gyn toh yeh video play hogi"), and **the case page's hero runs the same clip** (`eleveClip` is both `hoverMedia` and
`cover`), on the client's word the next day ("the hero video inside eleve also needs to match the one on homepage"). From
2026-10-21 to 2026-10-26 both ran `eleve-site.mp4` ("hover par jo video ati hai usko replace karna hai, eleve detailed page ky
top par hero section may jo video hai us sy"), which now stays in `public/media/work/` unused, as does the logo colouring in on
white, `eleve-logo.mp4`, the hover before that. **Tile 5, Shifa Foundation USA, works like Twinhub and the games**: one clip,
`shifa.mp4` (the Shifa Foundation USA footage), resting on its own first frame (`shifa.webp`) and playing on hover,
and the same clip is its case page's `cover`. Instructed 2026-10-27 ("uski starting sy ak image lo or uski as thumbnail use
karlo"). From 2026-10-26 to then it was a still-and-hover pair resting on the client's Canva card (*5x growth in online giving
for a US nonprofit*), which stays in `public/media/work/` as `shifa-poster.webp`, padded square, unused. The stats count-up
before that is deleted: its agency figures (150+ projects, 95% satisfaction) were the handover's P0. **Do not reword supplied
artwork to match a copy document**: on 2026-10-26 the Canva card was redrawn here with the handover's transaction-volume line,
and the client asked the next day why it no longer matched Canva. Where artwork and copy disagree, raise it and leave the
artwork alone. On 2026-10-21 Elevé moved from the
full-width tile 3 to tile 1 and the AR game took tile 3. A video-only swap was tried first and left each title over the other
project's clip ("Tile par likha hai AR game jb ky video eleve ki hai"), so **a clip, its title, its tags and its case link
travel as one project**: reorder `projects` and swap their `span`, never the media alone. From 2026-09-22 to 2026-10-06 the
render itself played as a one-shot intro when
half the tile came on screen, with hover gated on its `ended` event; on 2026-10-06 the user had the intro removed because of
its flicker-in ("jb yeh tile view port may ata hai toh video start hoti hai jis may flicker hai ... flicker na ho bs screen asi
ho, or hover par woh video chaly"). So a tile with `hoverMedia` now renders `media.poster` as its base and no base video, and
hover works from the first moment. `eleve-mockup.mp4` stays in `public/media/work/` unused; restoring the intro means giving
`media` its sources back and the gating `WorkTile` had. Do not put the intro's autoplay back. A touch screen is the one
exception, and it plays the hover clip, not the intro: a phone has no hover, so since 2026-10-12 the hover clip plays in view,
like every other clip there, after the user reported it as the one tile that never moved on a phone. Since 2026-10-14 every
work tile waits for its centre to cross 70% of the screen height (`WORK.playLine`) before its clip starts, because at half on
screen the clip covered the still before anyone saw it ("on mobile the thumbnail image doesn't show up at all").
**Every tile's caption is paper, Shifa's included** (instructed 2026-10-27, "Shifa tile ka caption uniform kardo wapis"). Shifa's
was ink from 2026-10-26 ("kardo dark", because the paper chip read faint on the pale Canva card), went paper and back to ink on
2026-10-27, and is paper for good now that the tile rests on its footage rather than the pale card. No tile carries a `tone`.
A hover clip on a white ground, as
the logo clip was, needs `hoverMedia.tone: 'light'` to turn the caption ink while it shows, or the title disappears. Every hover clip on every tile loops until the pointer leaves ("sare tiles ki video loop may play hoti rahy gi
sirf tb stop hogi jb hover hat jaye ga", 2026-09-22).

**The copy sells, and the contact prompt follows the page.** Instructed 2026-09-25: every page but `/partner` was rewritten
because the old copy read as dry and gave nobody a reason to get in touch ("very boring and completely non-sense"). The voice
now is the partner page's: second person, the visitor's problem first, short declaratives, a concrete outcome, a direct ask.
Do not drift back to the wry, understated register ("Games people finish", "How it runs."). **No proof point is invented** —
no project counts, percentages or client results that nobody supplied; the facts rows keep the claims that were already
there. The contact heading and intro are `contactContent.pitches[topic]`, keyed `home` or by service slug: a service page
passes its slug and a case page passes its project's `service`, so the marketing page never asks what you want to automate.
A project can override that with its own `contact` pitch, passed as `Contact`'s `pitch`; only Shifa does, because the Marketing
prompt about bookings and buying does not fit a fundraising story (handover, 2026-10-26). **The reply time is one working day**
everywhere — contact, success message, the visitor's confirmation email and `/partner` — and it is written once, `replyWindow`
in `lib/content/shared.js`. It was two working days until 2026-10-26, when the owner confirmed one.
The service pages carried a `CtaBand` before the contact section, its line each service's `handoff`, until 2026-10-02: the client's
handoff called it a repeat of the contact and work buttons right before the form, and the user had it removed from all three
service pages. `/partner` keeps its own band.

**The client's copy handoff outranks the sales voice where they disagree.** On 2026-10-02 the client sent
`../docs/geekinate-copy-and-ui-handoff.md` and the user said to proceed with it. It asks for plain, conversational copy that says
what the visitor can do and what Geekinate does, with no unsupported promise — so "free traffic", "growth never stalls", "every
lead traced" and a universal "4 to 6 weeks" are out wherever they still stand. Applied so far: the naming above, the home page's
copy (hero, clients, work, services, contact), and the CTA convention — every button that opens an enquiry reads **Let's talk**,
every button to the work grid reads **See our work** (`/#work`), and the form submits with **Send enquiry**. The contact column
is shorter than the handoff wrote it, on the user's word (2026-10-25, "text looks excessive" on a phone): a two-sentence home
intro and one next-steps line, `contactContent.next`, where three numbered steps stood. Do not put the steps back. **There is one
contact form and every page shows it**, interest question included: the handoff drew those six options for Marketing, and the user
put them on the shared form instead ("all pages will show the same contact us form") — do not fork the form per service. Since
2026-10-06 the options are a single-choice dropdown, not chips (instructed) — a Radix `Select` from the already-installed `radix-ui`
package, because the native `select`'s option list cannot be styled and was called "very bad" on sight. **The *Ready to Geekinate?* line sits above every
contact form**: `Contact` renders `features/cta` itself (2026-10-06, "should be default and always top on the contact us form"),
so no page adds it separately. The nav CTA goes to the
current page's own `#contact` on `/services/*` and `/work/*` (`CONTACT_ROUTES`) and to `/#contact` everywhere else. The home page's
`Process` link was removed because the home page has no `#process` to land on. The Marketing page carries the handoff's copy
section by section: its own Scope and Process eyebrows and headings through `service.sections` (merged over the shared
`servicePageContent.blocks`), an intro line under the Deliverables and Process headings, no facts strip, and a single fixed contact
heading under a *Let's talk* eyebrow. Development & AI and Games keep their own copy. Its scope cards carried a small label over a
sentence title until 2026-10-07, when the client's revised copy made the service name the sole heading over one paragraph — the
same number, heading, paragraph shape the other two service pages run — so `Scope` no longer takes a `label`.

**The case pages take the old site's content order and Stokt's case-study layout.** Instructed 2026-09-24: `/work/[slug]`
carries the portfolio page on geekinate.com in order (title, cover, Requirements / Challenge / Solution, technologies, three
more projects, contact), laid out as wearestokt.com's Heron case study below the hero: a statement-and-paragraph intro with a
ruled facts table, a tech-stack marquee strip, then editorial text sections. The hero alone is the old site's — centred title,
the clip below it straddling the black ground and a white panel with the old band's curved edge — instructed by screenshot
("make hero section exact same like the previous version") after a Stokt media-card hero ran for an afternoon, so the route
carries no `HeroSheet`. Two layouts invented without the reference were rejected the same day — the old page copied band for
band ("very bad"), then a card-heavy rework ("still very poor") — so reach for the reference before inventing a third. Do not bring the old page's look across (the green blobs, the
check-circle bullets, the logo strip). **The copy on all five pages is the client's**, from the handover of 2026-10-26
(`../docs/geekinate-website-copy-handover-2026-10-26.md`): first person ("we", "our"), the service actually delivered, and no
result beyond what the owner approved — Shifa's 5× transaction volume is the only figure. Elevé stays inside brand and website;
Twinhub covers its CMS, SEO, social and paid work without occupancy figures (the handover wrote *TwinHub*; the client
corrected it to **Twinhub** everywhere on 2026-10-27); both games are named client commissions. The games' card and `h1`
titles are **Augmented Reality Video Game** and **Virtual Reality Video Game** (instructed 2026-10-27, title only — their
category chips keep *AR Game Development* and *VR Game Development*, and their `meta` titles keep the handover's strings). Until then
four of the five were drafted here. Each page's `<title>` and description are its `meta`, separate from the card title, and
Shifa's tools strip is labelled *Platforms & Tools* (`stackLabel`) because its tools are WordPress and fundraising platforms,
not this site's stack. The Shifa route stays `/work/shifa-international` under the new name. See ARCHITECTURE.md §The case pages.

**The preload gate must never be able to trap the page.** `lib/ui/reusable_components/preloader` holds a black overlay over
everything until the globe paints its first frame, which reaches it through `lib/boot/ready.js`. That signal can legitimately never
arrive — no WebGL, a throttled tab, a context loss — so `PRELOADER.maxMs` completes the gate regardless. Removing that failsafe, or
gating on a signal without one, ships a black screen to whoever the globe fails for. `minMs` is the other half: it stops a warm
cache flashing the overlay for three frames.

**Phones open on a still of the globe, and the live globe replaces it on its first frame.** Below `48rem` (`PHONE.query`)
there is no preloader: the hero paints a still of the globe, the scene loads one frame after first paint exactly as on a
desktop, and the still is dropped the moment the live globe draws. The still is the scene's own frame at clock zero, and the
cloud's randoms are seeded, so the swap shows nothing but the globe starting to turn. From 2026-09-25 to 2026-10-28 the still
became an eight-second recording and the live scene waited for the first touch, or for 2.5s before the recording ended; the
user turned both down on 2026-10-28 ("home page par globe ki recording ya usko touch par nhi jaga sakty koi or solution
dhundo"), so do not bring back a recording or an input gate. Re-record the still with `scripts/record-phone-globe.mjs` whenever
the globe's look, fit or seed changes. See ARCHITECTURE.md §Performance.

**The globe runs only on a hardware GPU.** `lib/boot/gpu.js` asks a Web Worker to open an `OffscreenCanvas` WebGL context with
`failIfMajorPerformanceCaveat` and to read its renderer; a refused context, or a renderer that names software rasterising
(`SOFTWARE_GL`: SwiftShader, llvmpipe, Microsoft's Basic Render Driver), means no scene at all. A phone keeps the still, a
desktop keeps the glow, and the preloader is told the globe is ready so it never waits out its failsafe. PageSpeed's lab has no
GPU: there the globe drew in SwiftShader at 300–520ms a frame, and on 2026-10-28 the home page scored 40 with 20,350ms of total
blocking time while `/services/development`, with no globe, scored 89. Real phones render it on their GPU. The probe runs in a
worker because opening a context is itself a long task under software rendering (1.9s at 10x); it falls back to the main
thread where a worker cannot open WebGL, as on Safari before 17. Do not remove the gate to "get the globe into PageSpeed".

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

**There is no AI chat on the site.** The Guide, an OpenAI-backed chat that docked in the Development & AI hero, was
switched off on 2026-09-16 ("remove chat agent for now") and deleted on 2026-10-28 on the user's word ("agar use nhi hota toh
please isko remove hi kardo"), together with `/api/guide`, `lib/ai/`, the `ai` and `@ai-sdk/openai` packages and its two
secrets. Switched off, it still cost every service page about 290KB of AI SDK and `zod`, because the service hero, a server
component, imported it to decide whether to render it. Bringing a chat back is new work, not a revert: it needs a hard spend
limit in the provider's dashboard and Cloudflare rate limiting in front of it before it goes live.

**The in-process throttle is per isolate, so on Cloudflare it is a speed bump, not a limit.** `worker/{contact,partner}.js` each
keep their counters in a module-scope `Map`, built by `createThrottle` in `worker/throttle.js`. Cloudflare runs the Worker in many isolates across many machines and recycles them
freely, so a visitor whose requests land on different isolates gets a fresh count on each, and nothing survives a redeploy. The
visitor key is `cf-connecting-ip`, which Cloudflare sets on every request and a client cannot forge; it was `x-forwarded-for`
while the site ran behind its own proxy. A real limit needs Cloudflare's own rate limiting (a Worker binding or a WAF rule) — raise
it before anything that costs money per request sits behind the Worker.

**Secrets live in the Worker's settings, and `NEXT_PUBLIC_APP_URL` lives in the build's.** Every `.env*` file except `.env.example`
is gitignored, so Cloudflare sees none of them. The form keys (`CONTACT_*`, `SMTP_*`, `RESEND_API_KEY`,
`PARTNER_*`) are **runtime** secrets, set under the Worker's *Settings → Variables and Secrets*; the routes
read them through `process.env`, which `nodejs_compat` fills from the Worker's environment. `NEXT_PUBLIC_APP_URL` is read by
`next build` and baked into every page, so it goes under *Settings → Build → Variables* instead, and a change to it only shows after
a rebuild. Without a form key `/api/contact` answers 503 and the form shows its fallback panel. `OPENAI_API_KEY` and `AI_USER_SALT`
belonged to the removed Guide; nothing reads them, and they can be deleted from the Worker.

**The forms send through the hello@geekinate.com mailbox on Migadu.** Since 2026-11-04 `worker/mailer.js` signs in to
`smtp.migadu.com` on 587 with STARTTLS as `hello@geekinate.com`, which is also `CONTACT_FROM` (`Geekinate <hello@geekinate.com>`)
and `CONTACT_TO`, so enquiries land in the same mailbox they are sent from. The mailbox was created by Adil, who holds the Migadu
account and its password. Migadu's own setup sheet gives 465 with implicit TLS, and both ports signed in on the day of the switch,
so the mailer's 587 was kept and the switch was secrets only. From 2026-10-21 until then the forms went through Adil's Gmail
(`smtp.gmail.com`, the old site's app password, from and to madilmazhar@gmail.com), because Resend's test sender delivers only to
the Resend account's owner and geekinate.com has no Resend DNS. geekinate.com's MX, SPF and DKIM all point at Migadu. Delete
`SMTP_PASS` and the forms fall back to Resend. Each enquiry sends two mails, so Migadu's daily outbound limit on the plan is the
form's real ceiling.

**The contact form confirms to the visitor, and is rate-limited because it does.** Instructed 2026-10-21: after the enquiry is
accepted, `worker/contact.js` mails the visitor `contactContent.confirmation` with their message quoted. **Since 2026-10-29 the
form answers before any mail is sent**: the Gmail round (connect, STARTTLS, sign-in, send) held the "Message sent" panel for 2–3
seconds, reported on a live test. `deliver` now runs the whole send in `ctx.waitUntil`, tries the enquiry twice, and mails the
visitor only once the enquiry went through. The price is that an enquiry that fails both tries is lost without the visitor
seeing the failure panel; there is no store to recover it from, so watch the Worker's logs after any mail change. Mailing an
address the visitor typed is what makes the form usable to send mail to strangers from our account, so the same change added a
throttle of five per ten minutes per IP. The mailer also flattens every subject to one line: `worker-mailer` writes an all-ASCII
subject into the header unencoded, so a name with a line break in it would have added headers.

**Both contact mails are minimal, on the user's word.** Both are HTML with their plain text kept as the fallback, built on one
layout, `worker/email.js`. The page is plain white with a small ink lockup and a sans heading. The message is quoted behind a
2px volt rule, which is the only accent. The action is an underlined text link, and a grey footer under a thin rule says why
the mail was sent, links the site and `SOCIALS`, and carries the copyright line. The first designed version (2026-11-04) was the
site's card language: black masthead, bordered card with a hard shadow, a volt marker on an italic serif heading, mono-caps
labels, a pill button and a black footer. The user turned it down the same day ("mujhe minimalist design acha lagta hai"), so
do not bring back the card, black blocks, pills or marker. The team's enquiry (`worker/enquiry.js`, since 2026-11-04) lists
the visitor's details over their message, with a *Reply to* link that opens a reply addressed to them. Its copy and field
labels are `contactContent.enquiry`, and the plain-text enquiry reads the same labels. Brand values come from
`constants/email.js`. The logo is `public/brand/geekinate-lockup-light.png` because mail clients do not render SVG. Every link
and image is built from the request's own origin, since `NEXT_PUBLIC_APP_URL` is a build variable the Worker never sees.
Everything the visitor typed goes through `escapeHtml`, and the reply link is URL-encoded before that.

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
arrives: held on a phone, the stacked hero parked the Guide's chat (since removed) under the thumb for a whole screen of scroll. The
sheet wrapper is a plain, unpositioned `div` on purpose: `Nav` reads
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
measure lands. `/partner` shares the band and reads the same way. Keep the space between the lead and that span: a block
break is visual only, and without the space a screen reader read "client.Earn" as one word (found 2026-10-26, a handover
accessibility check). Any heading split across spans needs the same space.

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
without a colliding sibling file (`@/constants`) resolve normally. The Worker bundle depends on the same file: wrangler's esbuild
reads `jsconfig.json` too, which is the only reason `worker/*.js` can import `@/lib/content` and `@/constants`.

**A static export writes nested-route prefetch files where the client does not look.** Next 16.3's export saves the page
segment of `/services/development` as `services/development/__next.services/$d$slug/__PAGE__.txt`, a nested folder, while the
client router prefetches `services/development/__next.services.$d$slug.__PAGE__.txt`, a dotted file name. Served as-is, every
nested route's prefetch 404s and the click falls back to fetching the whole `.txt` payload. Navigation still works, so it
presents only as red rows in the network panel and a slower click. `scripts/flatten-segments.mjs` runs after `next build` and
copies each nested file to its dotted name. Top-level routes (`/partner`, `/lab`) have the same shape one level down and are
covered by the same copy. If a Next upgrade makes the 404s disappear without the script, drop it.

**`npm run dev` has no `/api`.** The form endpoints live in `worker/`, which Next does not run, so a form submitted against the
dev server gets a 404 and shows its failure panel. That is not a regression in the form. Build and use `npm run preview`, and pass
a test webhook with `--var CONTACT_WEBHOOK_URL:http://127.0.0.1:<port>` rather than pointing a local run at the real inbox.

**`wrangler dev` locks `out/` on Windows.** With the preview running, `next build` fails with `EBUSY: resource busy or locked,
rmdir '...\out'`. Stopping the npm task is not enough. `workerd.exe` and `esbuild.exe` outlive it and keep the lock, so kill those
too before rebuilding.

**A wrangler login that sees two accounts deploys to whichever it is told.** The user's Cloudflare login is a member of their own
account and of Nouman's, and the site's first deploy went to their own — a live `geekinate.am-musawir.workers.dev` nobody meant
to run. `account_id` in `wrangler.jsonc` is what pins it. Do not drop it, and do not override it with `CLOUDFLARE_ACCOUNT_ID`.
The Worker's `name` must also match the dashboard's (`geekinate-com`): a CLI deploy under another name creates a second Worker
beside it, and Workers Builds flags the mismatch and opens a PR to rename it in the file.

**Every push to `main` deploys the live site.** Workers Builds on `geekinate-com` was connected to `geekinate/geekinate` on
2026-10-21: production branch `main`, `npm run build`, `npx wrangler deploy`, with `NEXT_PUBLIC_APP_URL` as its build variable.
The live Worker's secrets select the SMTP mailer, so a `main` without `worker/mailer.js` would deploy a form that fails every
enquiry. Land a branch on `development` first and release it to `main` the usual way; never push to `main` to test.

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

**An iPhone does not blend a `<video>`.** iOS Safari hands video to its own hardware layer, and a blend mode on that layer is
not applied, so a black-cut clip with `mix-blend-screen` paints its own black square. Chrome on every platform blends it, which
is why the services cards looked right everywhere but on the iPhone (reported 2026-10-12, not reproducible off-device). The
cards no longer blend: their gradient lies over the clip as a plain translucent layer, which is the same arithmetic as a screen
blend onto white at low alpha (ARCHITECTURE.md §The services section). The service hero's `Clip` still uses
`mix-blend-screen` over `ground-patch`, whose ground carries volt, so it cannot take the same trick and has not been checked
on an iPhone. Do not reach for a blend mode on video for anything new.

**An iPhone can refuse every `play()` until a tap, and the tap unlocks only the elements that act on it.** Low Power Mode,
thermal throttling and the *Auto-Play Video Previews* setting each make WebKit refuse a muted inline `play()` with
`NotAllowedError`. The restriction is per element and comes off only when that element calls `play()` or `load()` inside a
gesture. It presents as "clips play sometimes, mostly not" (2026-10-12) — whatever arrived within a few seconds of a tap
played — and desktop Chrome cannot show it without patching `play()`. Any new autoplaying video goes through
`playWhileShown` in `lib/media/autoplay.js`, or it stands still on those phones. See ARCHITECTURE.md §Hover-to-play video.

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

**A covered element is still on screen.** Under `HeroSheet` the Guide's dock never left the viewport — the sheet slid over it —
so an `IntersectionObserver` on the dock kept reporting it visible, and the floating launcher would not appear until the released
hero had scrolled a whole viewport further. Occlusion is invisible to `IntersectionObserver`; v2's `isVisible` would see it but is
Chromium-only. `HeroSheet` published whether it covered the hero through `lib/scroll/sheet.js` (`markSheet` / `watchSheet`,
the same singleton shape as `lib/boot/ready.js`) for the Guide's dock; that signal went with the Guide on 2026-10-28, so anything
inside a hero that hides or pauses on "left the screen" needs it brought back.

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
re-exported the Guide (since removed) and the referral form. With no `sideEffects` field, Turbopack could not prove the unused re-exports were
safe to drop, so the root layout's chunk carried the AI SDK, `zod`, `@ai-sdk/gateway` and the referral form's Radix parts to
every page — 600KB raw, half of it from a feature that is switched off (found 2026-09-25). `"sideEffects": ["*.css"]` in
`package.json` is the fix, and it has a cost: a module imported only for what it does on import, with no export used, is now
dropped. Import such a module where its export is used, or list it in that array. Check the root layout's chunk for the referral
form's Radix parts after touching either barrel.

**Anything the layout mounts must not import three.** `SubstrateField` read the glyph mask off `getCloud()`, and that one import
put three.js core, the globe build and the land mask into every page's first-load JS, ahead of the lazy `Scene` it was meant to
wait for. Data that crosses from the canvas to the rest of the shell goes through a plain singleton — `lib/shape/footprint.js`,
the same shape as `lib/boot/ready.js`.

**A `Suspense` boundary in the static export paints after the footer.** React outlines a large completed boundary: the HTML
carries an empty `<template id="B:0">` where the content belongs, the content itself in a hidden `<div id="S:0">` after the
footer, and an inline `$RC` script that moves it into place on a frame or a timer of 300ms and more. Behind a hero that fills the
screen that is invisible. Behind a shorter one the browser paints the footer right under the hero and then shoves it thousands of
pixels down: PageSpeed scored `/work/eleve` at a layout shift of 0.447 for it (2026-10-28), and a local server never shows it,
because the whole document arrives at once. Only put `HydrationSplit` under a hero that is at least `min-h-svh`, and count
`<template id="B:` in the built HTML when in doubt.

**A file replaced under its old name in `public/media` stays old in every browser that has it.** `public/_headers` gives
`/media/*` an hour of `max-age` and a day of `stale-while-revalidate`, and the names carry no hash. On 2026-10-29 the new
Shifa master went out over the old `shifa-hover.mp4`: the hover played the new clip while the still in front of it was the
old frame, because the browser had kept the image and fetched the video afresh. The server sent the new files the whole time,
so `curl` cannot show it. A replaced asset takes a new file name and the old file is deleted.

**Do not put `preload="metadata"` back into the video markup.** It looks like the cheap setting, and Chrome still fetched every
clip on the home page at 0.7s — nine of them, about 1.3MB — alongside the stylesheet and the fonts. `VideoSurface` renders
`preload="none"` and warms each clip itself: near the viewport, or after `load` for a hero clip passed `eager`. See ARCHITECTURE.md
§Hover-to-play video.

**The globe is paused while the preloader covers it, and the preloader is not what makes the page slow.** After its two ready
frames the canvas skips rendering until the gate opens, which is invisible behind the black overlay. Opening the gate on mount to
"speed things up" was measured on 2026-09-25 and scored lower (TBT 860ms against 490ms), because the globe then draws from the
first frame. See ARCHITECTURE.md §Performance before trying it again. That measurement was on every device; phones have since
dropped the preloader for a different reason — they no longer load the scene at all until the first input.

**"After load" is not after the first paint.** In Lighthouse's observed trace window `load` fired at about 140ms and the first
paint landed near 300ms, so a request started on `load` still counts as loaded before the LCP. Anything deferred for the first
paint goes through `watchSettled` in `lib/boot/settled.js` — `load` plus one painted frame — not a bare `load` listener.

**Lighthouse at its default 4x on this machine reads about forty points above PageSpeed.** The first performance pass scored 82
locally and PSI printed 42 for the same build (2026-09-25): this machine's benchmark index is about 2,760, and PSI's CPU is far
slower. `--throttling.cpuSlowdownMultiplier=10` brought staging to 47 here against PSI's 42. Profile and score at 10x, or the
work that matters on PSI never shows up as a long task.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

