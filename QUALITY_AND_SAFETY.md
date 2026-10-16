# QUALITY_AND_SAFETY.md

Review standards, bug fixing, security, and guardrails. `WORKFLOW.md` covers how work gets done; this covers what must hold before it
ships.

## Review checklist

Ordered by what actually goes wrong in this repo.

**Correctness**
- Does it build and lint clean, with no suppressions added to get there?
- Was it opened in a browser? Anything visual or interactive is unverified until it has been.
- Client-side effects: are listeners removed, observers disconnected, animation frames cancelled **and their ref ids reset**?
- Does the change survive StrictMode's dev double-mount?

**Scope**
- Does the diff do only what was asked? Extra files, extra sections, and helpful-but-unrequested refactors are review failures.
- Were temporary test scaffolds removed?

**Brand and design system**
- Hardcoded colours, radii, or shadows instead of tokens. Any new brand value needs an entry in **both** `:root` and `@theme inline`.
- Values that contradict `geekinate new logo/geekinate-homepage-v2.html`.
- Soft shadows or blur-based depth, which are off-brand.

**Conventions**
- Copy hardcoded into `.jsx` instead of a content module.
- New barrel files not exported from `index.js`.
- Import order — constants last.
- `.jsx` versus `.js` chosen correctly.

**Accessibility**
- Landmarks and heading order. One `<h1>` per page; `SectionHead` takes an `as` prop for exactly this.
- Interactive elements reachable and visible on keyboard focus, not hover only.
- Decorative SVG marked `aria-hidden`; meaningful marks given a label.
- Motion respects `prefers-reduced-motion`.

**SEO** — a functional requirement here, not polish.
- New routes call `buildMetadata` rather than hand-rolling `metadata`.
- New routes are **added to `app/sitemap.js` by hand**; nothing is discovered automatically.
- JSON-LD additions keep the `@id` linkage back to the Organization node.
- Facts live in server-rendered markup. Per `../geekinate-site-spec.md` §1.2, a client-only or canvas layer may decorate but must
  never be the only source of a fact — if a crawler cannot see it, it does not exist.

## Fixing bugs

Find the cause before changing code. The traps in `AGENTS.md` exist because symptoms here have repeatedly pointed away from their
cause — a silent `undefined` import surfacing as a prerender error naming no file, a frozen animation that was a paused
`requestAnimationFrame`, a stale ref id surviving a remount.

- Reproduce first. Confirm the mechanism by measuring, not by inferring.
- Fix the cause, not the symptom. Removing a symptom you do not understand hides it.
- Do not silence a linter or design-tool finding to make it go away. Fix it, or classify it as intentional **with a stated reason**.
  Suppress only when a human has confirmed the intent.
- When a fix reveals a non-obvious trap, write it into `AGENTS.md` with its symptom.

## Security

The current attack surface is small — a static marketing site with no auth, no user input, and no data layer. Keep it that way
deliberately rather than by accident.

- **No secrets in the repo.** `.env` is gitignored; `.env.example` carries names and safe defaults only. Anything named
  `NEXT_PUBLIC_*` is shipped to the browser — never put a secret behind that prefix.
- `SITE.url` falls back to `http://localhost:3000`. That fails quietly: a production build with `NEXT_PUBLIC_APP_URL` unset emits
  localhost canonicals, OG URLs, and sitemap entries. Verify it is set per environment.
- `dangerouslySetInnerHTML` is used in exactly one place — `JsonLd`, over `JSON.stringify` of values we control. Any other use needs
  justification, and never over user-supplied or fetched content.
- External links use `rel='noreferrer'` with `target='_blank'`.
- The `*.workers.dev` hosts are held out of the index by the `X-Robots-Tag` rule in `public/_headers`. Preserve it, and add the
  staging host to it if staging ever moves to a custom domain.

**When more server-side code arrives** — it goes in `worker/`, and the spec anticipates handlers that fetch user-supplied URLs — that is the point to add
input validation, SSRF protection on outbound fetches, and rate limiting. Do not add a route that fetches an arbitrary URL without
them.

## Database safety

No database exists in this project. The team standard still applies the moment one does: **soft delete only, never hard delete**, and
migrations reviewed before they run. Raise it as an architectural decision rather than adding a data layer inline.

## Guardrails

- **No `console.*` anywhere.** Remove it, or use `process.stdout.write` / `process.stderr.write` where a script genuinely must report
  to a terminal.
- **No warnings.** Lint warnings ship as errors.
- No `tailwind.config.js`, no `src/` directory, no TypeScript. These are settled decisions.
- No new dependency without raising it first.
- Never commit or push unless asked. Never skip hooks or bypass signing.
- Destructive and outward-facing actions — deleting files, force-pushing, publishing, sending anything externally — get confirmed
  first, every time. Approval for one does not carry to the next.
