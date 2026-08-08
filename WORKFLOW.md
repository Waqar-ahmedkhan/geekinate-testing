# WORKFLOW.md

How a change moves from request to done. Read `AGENTS.md` first for the boundaries this operates inside.

The governing constraint: **this site is built one section at a time, and the visual direction is a team decision, not an
implementation detail.** Most of the discipline below exists to keep those two facts true.

## 1 · Investigate

Before writing anything, establish what already decides the answer. In rough order of authority:

1. The Asana thread for the task. Design direction lives in *Revamp Web Design to a modern design*; workflow standards in
   *AI Workflows*. Fetch the actual comments — a link title is not the decision.
2. `AGENTS.md` and `ARCHITECTURE.md` in this repo.
3. The brand source in `geekinate new logo/`.
4. Reference sites named in the thread. When copying behaviour from one, **measure it** — open the page, read the DOM and computed
   styles, sample values at more than one state. Eyeballed reconstructions drift.
5. Sibling projects in `../` for convention, `Eleve/development/frontend` in particular.

If two sources conflict, the Asana thread wins and the conflict gets raised.

## 2 · Plan

State the plan before building when the change is more than a small edit: what will be created, what will change, and what is
deliberately being left out.

Surface assumptions explicitly rather than burying them. If a decision would materially change the work — palette, stack, scope,
where a component lives — ask once, with options, and proceed on a stated default rather than blocking.

Raise a concern once. If it is reaffirmed, that is the decision; build it and move on.

## 3 · Implement

- Smallest change that satisfies the request. No speculative sections, files, or abstractions.
- Follow the conventions in `AGENTS.md`. Match the surrounding code's density and idiom.
- Copy goes in content modules, never inline in `.jsx`.
- New primitives get exported from the relevant barrel or they are unreachable.
- Reusable behaviour goes in `lib/ui/reusable_components/`; presentational pieces in `components/layout/`.

## 4 · Verify

There is no test runner, so verification is manual and non-negotiable. A change is not done until all of these pass:

| Gate | Command / action |
|---|---|
| Formatting | `npm run format` |
| Lint | `npm run lint` — clean, no suppressions |
| Build | `npm run build` — clean, and check the route table is what you expect |
| Real browser | Load the page and look at it |

**Browser verification is required for anything visual or interactive.** A clean build only proves it compiles. Scroll it, hover it,
watch the transition. Read computed styles when the behaviour is numeric rather than trusting a screenshot.

Two known artefacts that are not bugs: a backgrounded tab pauses `requestAnimationFrame`, so scroll-driven UI freezes mid-transition
under automation; and programmatic `window.scrollTo` does not drive sites that run their own smooth-scroll loop.

If a temporary scaffold was needed to test — a tall spacer to create scroll height, for example — **remove it before reporting done**
and say that you did.

## 5 · Approve

Report what actually happened. If a gate failed, say so with the output. If part of the scope was skipped, say which part and why.
Do not describe unverified work as verified.

Call out separately:

- Assumptions made where a question went unanswered.
- Anything deliberately left unfinished, and what it needs.
- Deviations from a reference or from the agreed direction, so nobody "restores" them later by mistake.
- Design-tool findings that were left unfixed on purpose, with the reason.

Visual direction needs a human yes. Build it, show it, and let the decision come back.

## 6 · Record

Documentation is part of the change, not a follow-up:

- Structural changes update `ARCHITECTURE.md`.
- New boundaries, traps, or reversed decisions update `AGENTS.md`.
- A trap that cost real debugging time gets written down with its symptom, so the next person recognises it rather than rediscovers
  it.

These files are only worth maintaining if they stay true. A stale line here is worse than a missing one.
