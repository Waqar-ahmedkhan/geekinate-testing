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

**Dark surfaces are pure black `#000`, not `--ink`.** The logo file backs its dark blocks with `--gk-ink`, but at full-section scale
`#101613` reads as a green colour wash and was rejected on sight (2026-08-07) — the same objection that moved section 02 off `wash`.
`--ink` remains the type, border and shadow token, where the difference from black is imperceptible. Every dark *fill* —
`Section variant='ink'`, `HoverVideoCard`, `WorkTile`, the pending panel — is `bg-black`.

Geometry is as much the brand as the colour: **1.5px ink borders, 20px card radius, hard offset shadows** (`3px 3px 0` /
`2px 2px 0`), no soft elevation, no blur-based depth. `--radius` is `1.25rem` because shadcn derives its whole scale from it.
`border-brutal` and `text-marker` are custom utilities carrying the signature.

**Stack decisions already made.** JavaScript, not TypeScript. App Router. **No `src/` directory.** Tailwind v4 CSS-first with **no
`tailwind.config.js`**. shadcn emits `.jsx` (`tsx: false`). Reversing any of these is a decision to raise, not a refactor to perform.

**No new dependencies without raising it.** There is deliberately no smooth-scroll, animation, form, or data library.

## Conventions

The global guidelines in `~/.claude/CLAUDE.md` apply in full. Project-specific applications:

- `.jsx` for anything rendering markup, `.js` for plain modules. Directory entry points are `index.jsx`, so the import is
  `@/lib/ui/reusable_components/nav`, never `.../nav/Nav`.
- Import order ends with data: components, then `lib/`, then content, then `constants/`, then CSS. Constants last, always.
- Computations come out of JSX. `SectionHead` builds `eyebrowEl` / `bodyEl` above the return rather than inlining ternaries.
- Copy does not get hardcoded into components. If you are writing English inside a `.jsx` file, it belongs in a content module.
- Prettier config is `prettier.config.js` — 140 print width, single quotes, JSX single quotes. Run `npm run format` before finishing.

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

**`max-width: 0` does not collapse a box that has padding.** Everything here is `box-sizing: border-box`, and a border-box element
cannot shrink below its own padding — so a `max-width: 0` element with `pl-2` still occupies 8px. This silently knocked the nav mark
4px off centre. Animate the padding alongside the width, or put the spacing on a parent that also collapses.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

