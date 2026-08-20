# Geekinate 2.0: Footer rebuild, split layout (v2)

## 0. Context

This replaces the previous footer build. That version used a full width particle wordmark cropped by the bottom edge plus a sticky scroll reveal. It was reviewed and rejected as visually too heavy, so **remove all of it**: the scroll reveal, the sticky positioning, the spacer, the giant wordmark and the scroll-linked particle assembly. The footer goes back to being a normal in-flow block.

Also revert any `overflow` changes that were made to layout wrappers purely to make sticky positioning work.

The new direction is a split footer: **all content on the left, the logo mark on the right, at roughly half its original size.**

The brief that matters here: the footer should feel finished and quiet. It closes the page. It does not compete with the hero. If a choice is between more effect and more restraint, choose restraint.

---

## 1. Stack and current state

- Next.js (App Router), TypeScript
- Tailwind CSS + shadcn/ui
- GSAP available (ScrollTrigger no longer needed in this component)
- Three.js available, existing particle system renders the "g" as a grain density field in brand green with a small percentage of off white grains, with a hover dispersion effect

Before writing code, read the current footer component and the particle module, then report what you found and flag anything in this spec that conflicts with the existing implementation.

---

## 2. The core problem to solve

The original footer failed for two reasons, and only one of them was the logo size:

1. The logo was too large and floated with no relationship to anything else on the page
2. Roughly two thirds of the footer was empty, and there was no call to action anywhere in it

Shrinking the mark and moving it right fixes the first problem and **makes the second one worse** unless the freed space is filled with real content. So this rebuild does both: the mark shrinks and moves right, and the left side gets an actual closing block.

If you finish and any region of the footer is a large empty rectangle, the build is not done.

---

## 3. Layout

12 column grid, same container width and side padding as the rest of the site.

```
+-------------------------------------------------------------+
|  eyebrow                                     |              |
|  CTA headline                                |              |
|  hello@geekinate.com                         |     [ g ]    |
|                                              |              |
|  ---------------------------------------     |              |
|                                              |              |
|  Index    Services    Legal    Socials       |              |
|  ...      ...         ...      ...           |              |
|                                              |              |
|  Sparta NJ 09:41    Islamabad 18:41          |              |
|  . Available for new projects                |              |
+-------------------------------------------------------------+
|  (c) 2026 Geekinate. All rights reserved.        Back to top |
+-------------------------------------------------------------+
```

**Left region: columns 1 to 7**

- Block A, call to action: eyebrow label, headline (two lines maximum), email as a large link. This is the primary action on the whole footer.
- Hairline divider
- Block B, navigation: four link columns in one row (Index, Services, Legal, Socials)
- Block C, identity strip: the two office lines with live local clocks, and an availability pill with a pulsing dot

**Right region: columns 9 to 12**

- The logo mark, nothing else. No links, no text.

**Full width bottom: meta bar**

- Hairline divider spanning the whole container, then a single row: copyright left, back to top control right

**The alignment rule that makes this work**

The optical bottom of the mark sits on the **same hairline** as the meta bar divider. It shares a baseline with the left content instead of floating in its own column. Do not vertically center it in the right region, that is what made the original feel unanchored.

**Height**

The footer should be noticeably shorter than the previous version. Target roughly 520 to 620px on desktop. Do not size it to the viewport.

---

## 4. The mark

**Size**

`height: clamp(180px, 20vw, 320px)`, width follows the mark's aspect ratio. This is roughly 45 percent of the previous rendered size.

**Swappable renderer**

The review feedback said "simple logo icon (g)", which could mean either keeping the particle treatment at a smaller size or dropping it for the flat logo mark. Rather than guessing, build both behind one prop so the team can compare without another build cycle:

```tsx
<FooterMark variant="particles" | "flat" sampling="fill" | "contour" />
```

Both variants must fill the exact same box, so switching does not shift the layout by a pixel. Default to `variant="particles" sampling="contour"`.

**Making the particle version read lighter**

The original looked like a solid green blob because particles were distributed evenly across the filled glyph area. Two changes fix that:

- `sampling="contour"`: sample particle targets along the glyph outline rather than across its filled area, with a small amount of inward jitter. Roughly 2000 to 2600 particles. This reads dramatically lighter while keeping the grain identity intact and is the recommended default.
- `sampling="fill"`: keep area sampling but vary density, sparser toward the center and denser toward the edges, so the shape reads as a form rather than a mass. Reduce total count to around 3500. Drop green fill opacity to about 0.8.

Keep the small percentage of off white grains in both modes, that detail is good and it is what stops the shape looking flat.

No background glow. The previous build had one and it added to the heaviness.

**Interaction**

- Keep the existing hover dispersion, but retune the force. The same pixel displacement will read much stronger at this smaller scale, so roughly halve it.
- Cursor repulsion within about a 70px radius, smooth falloff, slow return (lerp around 0.06).
- Very low amplitude idle drift on a 5 to 6 second cycle. It should be barely perceptible. If it is noticeable as an animation, it is too strong.
- Discoverability: a small mono `hover` label below the mark at low opacity, which fades out permanently after the first pointer interaction (persist in `sessionStorage`). Skip this in the `flat` variant.

**No scroll-linked behaviour of any kind.** No assembly, no scrub, no parallax.

---

## 5. Ambient particle field (feature flagged, off by default)

Optional layer for review only. A very sparse, very low opacity particle field spread across the full footer width, so the mark reads as a density peak within a field rather than an isolated object.

- Opacity 3 to 5 percent, roughly 600 particles across the whole footer
- Reacts to cursor movement anywhere in the footer with gentle push and settle
- Behind a single boolean flag, default **off**

Build it, ship it off. It exists so the team can see it as a toggle rather than as another rejected build. Do not enable it without a decision.

---

## 6. Tokens

Read the brand green from the existing project config. Do not introduce a new green.

**Color**

| Role | Value |
| --- | --- |
| Background | `#000000` |
| Text primary | `#FFFFFF` |
| Nav links at rest | `#A1A1A1` |
| Column headings, meta, clocks | `#6B6B6B` |
| Hairline | `rgba(255,255,255,0.08)` |
| Accent | existing brand green token |

**Type**

| Element | Spec |
| --- | --- |
| Eyebrow | mono, 11px, uppercase, tracking 0.14em, muted |
| CTA headline | `clamp(2rem, 4vw, 3.5rem)`, weight 500, tracking -0.02em, line height 1.05 |
| Email link | `clamp(1.125rem, 2vw, 1.75rem)`, weight 400 |
| Column heading | mono, 11px, uppercase, tracking 0.1em, muted |
| Nav link | 15px, `#A1A1A1` at rest, white on hover |
| Meta, clocks, availability | mono, 12px, muted |

The column headings in small uppercase mono against 15px sans links is the single highest impact typography change in this footer. Do not skip it.

Give the Services column slightly more visual weight than the other three, either by placing it first or by setting its links one step larger. It is the commercially important column and it should not read identically to Legal.

**Spacing**

Footer top padding around 96px, CTA block to divider around 56px, divider to nav row around 40px, nav row to identity strip around 40px, identity strip to meta bar around 40px, meta bar padding 24px vertical.

---

## 7. Copy

Write real copy. Brand positioning is "We build the technology that grows your business". Services are AI and Automation, Games and Interactive, Marketing Systems, Web Products.

- Eyebrow: `Start a project`
- Headline: `Tell us what you are trying to grow.`
- Email link: `hello@geekinate.com`
- Availability: `Available for new projects`
- Back to top: `Back to top`

Rules for all copy in this component:

- Sentence case, never title case
- No exclamation marks
- **No em dashes anywhere**, in copy, comments or commit messages
- Say what happens rather than selling it

---

## 8. Micro interactions

Keep these light. The previous build was rejected for heaviness, so restraint applies here too.

- **Nav links:** small brand green dot fades and slides in from the left while the label shifts 10px right, 0.25s ease out. Pick this or an underline sweep, not both.
- **Email link:** underline draws left to right on hover, arrow glyph translates up and right.
- **External links in Socials:** existing arrow glyph translates up and right.
- **Availability dot:** 2 second pulse, scale and opacity only.
- **Live clocks:** `Intl.DateTimeFormat` with `timeZone: "America/New_York"` and `timeZone: "Asia/Karachi"`, hour and minute only, updating every 30 seconds. Render a static server safe placeholder and hydrate on the client so there is no SSR mismatch warning.
- **Back to top:** circular ghost button with a hairline border, arrow translates up on hover, smooth scroll to top.
- **Footer entrance:** a single restrained reveal when the footer enters the viewport, opacity plus 10px y translate, 0.4s, small stagger across the blocks. One `IntersectionObserver`, fires once. No scrub.

---

## 9. Responsive

- **1280px and up:** full spec as written.
- **1024 to 1279px:** left region widens to columns 1 to 8, mark to columns 9 to 12 and shrinks with the clamp.
- **768 to 1023px:** mark moves above the content, right aligned, at 60 percent size. Nav becomes 2 columns over 2 rows. Particle count reduced to about 40 percent.
- **Under 768px:** stack everything. CTA, then nav as a 2 column grid, then identity strip, then meta bar. The mark renders as the static flat logo at around 120px, right aligned in the CTA block. No animation loop runs on mobile.

---

## 10. Accessibility and performance

- `prefers-reduced-motion: reduce` disables idle drift, entrance reveal and the ambient field. The mark renders static and fully formed.
- Visible keyboard focus ring on every interactive element. Nothing communicated by hover alone.
- Canvas is `aria-hidden="true"`. The logo has an accessible text alternative in the DOM.
- `<nav>` with an `aria-label`. Column headings are real headings.
- Verify contrast on `#6B6B6B` for anything carrying meaning rather than decoration, and lift it if it fails.
- Pause the `requestAnimationFrame` loop with an `IntersectionObserver` when the footer is out of view, and on `document.visibilitychange`.
- Clamp device pixel ratio at 2.
- Particle counts as a single configurable constant: contour 2400 desktop, fill 3500 desktop, 40 percent on tablet, zero on mobile.
- Full cleanup on unmount: cancel rAF, dispose geometry, material and renderer, remove all listeners, disconnect observers.
- No layout shift on mount.

---

## 11. Constraints

- Touch only the footer component and the particle module. Do not change routes, nav content or other sections.
- Delete the previous footer's scroll reveal code rather than leaving it behind a flag. Dead code from a rejected direction will confuse the next person.
- TypeScript strict. No `any` on particle buffers.
- Tailwind for layout and type. A scoped CSS module is fine for keyframes only.
- Reuse existing shadcn primitives where they fit.
- Commit in steps: remove the old build, then layout and copy, then the mark, then micro interactions. Verify the page renders after each step.

---

## 12. Acceptance criteria

- [ ] All scroll reveal and sticky positioning code from the previous build is removed, and any wrapper `overflow` workarounds are reverted
- [ ] The mark sits in the right region at roughly 45 percent of its previous size, with its optical bottom on the meta bar hairline
- [ ] Switching between `variant="particles"` and `variant="flat"` causes zero layout shift
- [ ] `sampling="contour"` visibly reads lighter than `sampling="fill"`, and both are switchable for review
- [ ] The footer has a real call to action with the email as its primary link
- [ ] No region of the footer is a large empty rectangle
- [ ] Footer total height is between 520 and 620px on a 1440px viewport
- [ ] Both clocks show correct local time with no hydration warning
- [ ] Reduced motion renders a fully static and fully usable footer
- [ ] No animation loop runs on mobile
- [ ] The ambient field flag defaults to off
- [ ] No em dashes appear anywhere in the output

---

## 13. Output

Before writing code:

1. Report what the current footer and particle module do, and what needs deleting from the previous build
2. State how you are sampling the glyph contour, and whether the existing particle module already supports outline sampling or needs it added
3. Flag anything in this spec that conflicts with the existing implementation

After building, take screenshots of three states for review: `particles + contour`, `particles + fill`, and `flat`. Then walk the acceptance criteria one by one and report pass or fail with a note on anything you could not verify locally.
