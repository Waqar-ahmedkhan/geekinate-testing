# Geekinate 2.0: Footer rebuild spec

## 0. Task

Rebuild the site footer. The current footer has a giant particle "G" floating in the middle of a mostly empty black area, with four link columns pushed to the top right. It reads as unfinished because the footer has no job beyond holding links, and the G is decoration rather than part of the composition.

Replace it with a footer built on two combined ideas:

1. **Scroll reveal curtain.** The footer sits behind the page content. As the visitor reaches the end of the page, the main content slides up like a curtain and reveals the footer underneath.
2. **Signature wall.** The word GEEKINATE is set at display size across the full footer width and cropped by the bottom edge of the viewport. The existing particle system stops being a floating logo and instead becomes the letter G inside that word.

The particle field assembles into the G while the curtain is opening, so the reveal and the logo formation are one scroll-linked moment.

Do not treat this as a decoration pass. The footer is the last conversion surface on an agency site, so it needs a real call to action, real contact affordances, and a clear terminal edge.

---

## 1. Stack and current state

- Next.js (App Router) with TypeScript
- Tailwind CSS + shadcn/ui
- GSAP with ScrollTrigger already in the project
- Three.js already in the project
- The current footer already renders a particle "G": a grain density field in brand green with a small percentage of off white grains, plus a hover effect that scatters and re-forms the grains

Reuse the existing particle material, shader and grain look. Change only the target sampling, the scale, the placement and the trigger logic. Do not rewrite the renderer from scratch.

Before writing code, read the existing footer component and the existing particle module and report what you found, including where the particle target positions come from (SDF, alpha map, glyph raster, or point cloud). Adapt the plan to what is actually there.

---

## 2. Layout structure

Footer content, top to bottom, on a 12 column grid with the same container width and side padding used elsewhere on the site.

**Block A: call to action**

- Eyebrow label, small mono, uppercase
- Oversized headline, two lines maximum
- Email as a large link, not small body text. This is the primary action.
- Optional secondary text link to the contact page

**Block B: hairline divider**

Full container width, 1px, very low opacity white.

**Block C: navigation grid**

- Columns 1 to 4: identity block. Logo lockup, "Remote, Worldwide", the two office lines (Sparta NJ, USA and Twinhub I-8 Markaz Islamabad, Pakistan), each with a live local clock, and an availability pill with a pulsing green dot.
- Columns 5 to 12: four link columns (Index, Services, Legal, Socials) laid out evenly.

Services is the commercially important column. Give it more visual weight than Legal: either place it first among the four, or give its links slightly larger type. Do not let all four column headings read at identical weight.

**Block D: meta bar**

Hairline divider, then a single row: copyright on the left, a "back to top" control on the right.

**Block E: the wordmark**

- The word GEEKINATE, full container width, set as large as it can go while staying on one line
- Translated down so roughly 26 to 30 percent of the cap height is cropped by the bottom edge of the footer. It should read as bleeding off the page, not as a word with a lot of space under it.
- The leading G glyph is the particle canvas. The remaining letters E E K I N A T E are real text.

Vertical rhythm target: Block A gets the most space, then a clear gap, then C and D compact, then the wordmark anchoring the bottom. Nothing should float in dead space.

---

## 3. Scroll reveal mechanics

Preferred implementation (simplest and most robust):

```
<main class="relative z-10 bg-[#000]">  ...all page sections...  </main>
<footer class="sticky bottom-0 z-0 h-[min(100svh,780px)]"> ... </footer>
```

The main content needs an opaque background and a higher stacking context so it visually covers the footer until it scrolls past. The footer sticks to the bottom of the viewport as it enters, so the content appears to slide up off it.

Requirements:

- No ancestor of the footer may have `overflow: hidden` or `overflow-x: clip`, since that kills position sticky. Audit the layout wrapper and fix it if needed.
- If the sticky approach fights an existing smooth scroll library (Lenis or similar), fall back to: `position: fixed` footer plus a spacer div in flow whose height equals the footer height. Pick one, do not ship both.
- Drive reveal progress with a single GSAP ScrollTrigger on the footer element: `start: "top bottom"`, `end: "bottom bottom"`, `scrub: 0.6`. Expose progress as a normalized 0 to 1 value that the particle system reads.
- The curtain edge should feel clean. Add a very subtle top hairline or 1px inner shadow on the main content wrapper so the seam is intentional rather than accidental.

While the curtain opens, run a short staggered entrance on the footer text: CTA headline first, then columns, then meta bar. Keep it restrained, opacity plus 12px of y translate, 0.5s, no bounce. The particle assembly is the main event and the text should not compete with it.

---

## 4. The particle G

**Size and placement**

- The G is no longer sized independently. Its box is the G glyph box inside the wordmark.
- Measure the glyph at runtime: render a hidden reference span with the same font, size and tracking, measure the leading G with `getBoundingClientRect()` (or Canvas `measureText` with `actualBoundingBox*` metrics), then absolutely position the particle canvas over that box.
- Render the visible wordmark as the full word with the leading G set to `color: transparent` so metrics, kerning and text selection all stay correct, and the canvas simply overlays it. Keep the transparent G in the DOM for screen readers and for the no-canvas fallback.
- Re-measure on resize and on font load (`document.fonts.ready`). Debounce resize at 150ms.
- Net effect: the G ends up roughly half or less of its current rendered size, which is the size reduction that was asked for. Do not hardcode a pixel size.

**Scroll-linked assembly**

- At reveal progress 0: particles are scattered. Scatter them below the wordmark baseline with random x jitter across the container width, so they read as rising into place, not exploding outward.
- At reveal progress 1: particles sit at their sampled G target positions.
- Interpolate with an eased lerp per particle, plus a small per-particle delay derived from a hash of its index, so the shape resolves progressively rather than all at once. Target roughly 0.12 to 0.2 of normalized progress as the spread of that stagger.
- Add a small amount of curl or perlin noise to the in-flight path so travel does not look linear.
- The assembly must be scrubbable in both directions. Scrolling back up should disassemble.

**Hover and cursor**

- Keep the existing hover dispersion effect. Retune its force so it still reads at the smaller scale, since the same displacement in pixels will look much stronger on a smaller shape.
- Add cursor repulsion: particles within a radius of the pointer push away and ease back. Radius around 90px, falloff smooth, return easing slow (roughly 0.06 lerp).
- Add discoverability, because right now nobody knows the G is interactive:
  - A small mono label near the G reading `hover` in low opacity, which fades out permanently after the first pointer interaction (persist that in `sessionStorage`)
  - A slow idle breathing motion, roughly a 4 second cycle, very low amplitude, so the shape reads as alive at rest
  - A cursor state change over the canvas area

**Density and color**

- Keep the current grain density look and the small percentage of off white grains, that detail is good.
- Drop the green fill to around 0.85 opacity and place a soft radial glow behind the wordmark (brand green, roughly 8 percent opacity, large blur) so the green mass sits in the page rather than floating on pure black.

---

## 5. Tokens

Add these as CSS variables or Tailwind theme extensions rather than inline hex values. Read the existing brand green from the project config and use that token, do not invent a new green.

**Color**

| Role | Value |
| --- | --- |
| Footer background | `#000000` |
| Text primary | `#FFFFFF` |
| Text secondary (links at rest) | `#A1A1A1` |
| Text muted (column headings, meta) | `#6B6B6B` |
| Hairline | `rgba(255,255,255,0.08)` |
| Accent | existing brand green token |

**Type**

| Element | Spec |
| --- | --- |
| Eyebrow | mono, 11px, uppercase, tracking 0.14em, text muted |
| CTA headline | `clamp(2.5rem, 6vw, 5.5rem)`, weight 500, tracking -0.02em, line height 0.95 |
| Email link | `clamp(1.25rem, 2.5vw, 2rem)`, weight 400 |
| Column heading | mono, 11px, uppercase, tracking 0.1em, text muted |
| Nav link | 15px, text secondary at rest, white on hover |
| Meta / clocks | mono, 12px, text muted |
| Wordmark | `clamp(6rem, 19vw, 18rem)`, weight 500, tracking -0.04em, line height 0.8 |

Column headings in small uppercase mono against 15px sans links is the single change that will do the most to make this footer read as designed rather than defaulted. Do not skip it.

**Spacing**

Footer top padding around 120px on desktop, CTA block to divider around 80px, divider to nav grid around 56px, nav grid to meta bar around 48px, meta bar to wordmark around 64px.

---

## 6. Copy

Write real copy, not placeholders. The brand positioning is "We build the technology that grows your business" and the services are AI and Automation, Games and Interactive, Marketing Systems, Web Products.

Use this, or propose two alternatives and pick the strongest:

- Eyebrow: `Start a project`
- Headline: `Tell us what you are trying to grow.`
- Email link: `hello@geekinate.com`
- Availability pill: `Available for new projects`
- Back to top control label: `Back to top`

Rules for all copy in this footer:

- Sentence case, not title case
- No exclamation marks
- **No em dashes anywhere**, in copy, in comments, or in any generated content
- Say what happens, do not sell. "Start a project" beats "Let's create something amazing together"

---

## 7. Micro interactions

- **Nav links:** a small brand green dot fades and slides in from the left on hover while the label shifts 10px right, 0.25s ease out. Pick this or an underline sweep, not both.
- **Email link:** underline draws left to right on hover, plus a diagonal arrow that translates up and right.
- **External links (Socials):** keep the existing arrow glyph, animate it up and right on hover.
- **Availability dot:** 2 second pulse, scale and opacity only.
- **Live clocks:** `Intl.DateTimeFormat` with `timeZone: "America/New_York"` and `timeZone: "Asia/Karachi"`, hour and minute only, updating every 30 seconds. Render a static server-safe placeholder and hydrate on the client to avoid an SSR mismatch.
- **Back to top:** circular ghost button, border hairline, arrow rotates or translates on hover, smooth scroll to top.

---

## 8. Responsive

- **Desktop, 1280px and up:** full spec as written.
- **Tablet, 768 to 1279px:** nav grid becomes 2 columns over 2 rows. Wordmark shrinks with the clamp. Particle count reduced to roughly 40 percent. Scroll reveal stays on.
- **Mobile, under 768px:** disable the sticky reveal and render the footer as a normal in-flow block. Stack the CTA, identity block, then link columns as a 2 column grid. The wordmark stays but crops harder, and the particle canvas is replaced with a static pre-rendered G (a lightweight sprite or a single draw with no animation loop) unless the device reports high capability. A 60fps particle field is not worth the battery cost in a footer on mobile.

---

## 9. Accessibility and performance

- `prefers-reduced-motion: reduce` disables the scroll assembly, the idle breathing and the entrance stagger. The footer renders static and in normal flow, and the G renders in its final formed state immediately.
- All interactive elements need a visible keyboard focus ring. Do not rely on hover only for any information.
- The wordmark must be real, selectable, screen reader readable text. The canvas is `aria-hidden="true"`.
- Nav uses `<nav>` with an `aria-label`, and column headings are real heading elements or `<h2>` with a visually hidden variant if the visual size is too small for a heading.
- Contrast: 15px `#A1A1A1` on `#000000` passes, but verify the muted `#6B6B6B` on any text that carries meaning rather than decoration, and lift it if it fails.
- Pause the `requestAnimationFrame` loop with an `IntersectionObserver` when the footer is out of the viewport, and on `document.visibilitychange`.
- Clamp device pixel ratio at 2.
- Particle count: 7000 desktop, 3000 tablet, static on mobile. Make it a single configurable constant.
- Clean up on unmount: kill the ScrollTrigger instance, cancel the rAF, dispose geometry, material and renderer, remove resize and pointer listeners.
- Target: no layout shift on footer mount, and no more than 3ms of main thread work per frame from the particle update.

---

## 10. Constraints

- Only touch the footer component, the particle module and whatever layout wrapper needs its overflow fixed for sticky to work. Do not restructure routes, do not change nav content, do not touch other sections.
- Keep everything in TypeScript with strict types. No `any` on the particle buffers.
- Tailwind for layout and type. A small scoped CSS module is acceptable for keyframes and for anything Tailwind cannot express cleanly.
- Reuse existing shadcn primitives where they fit rather than hand rolling buttons.
- Commit the work in logical steps: layout and copy first, then scroll reveal, then particle rework, then micro interactions and polish. Verify the page still renders correctly after each step.

---

## 11. Acceptance criteria

- [ ] Scrolling to the end of the page reveals the footer as a curtain, with no jump, no flicker and no double scrollbar
- [ ] The G is visibly part of the word GEEKINATE, correctly baseline aligned and kerned, at roughly half or less of its previous rendered size
- [ ] Particles assemble into the G as the curtain opens and disassemble on scroll up, smoothly scrubbable in both directions
- [ ] Hover on the G still produces the existing dispersion effect, retuned so it reads correctly at the smaller scale
- [ ] The footer has a real call to action above the fold of its own reveal
- [ ] No region of the footer is a large empty rectangle. Every block has content or intentional, rhythmic negative space
- [ ] Both office clocks show correct local time and do not throw a hydration warning
- [ ] Reduced motion renders a fully static, fully usable footer
- [ ] Mobile renders a normal in-flow footer with no particle animation loop running
- [ ] No em dashes appear anywhere in the output
- [ ] Lighthouse performance on the page does not drop by more than 2 points versus the current build

---

## 12. Output

Before writing code:

1. Report what the existing footer and particle module actually do, and flag anything in this spec that conflicts with them.
2. State the reveal implementation you picked (sticky or fixed plus spacer) and why.
3. State how you are measuring the G glyph box.

Then build it, and after building, walk the acceptance criteria one by one and report pass or fail for each with a note on anything you could not verify locally.
