# Build Prompt: Geekinate 3D Scroll Snake Hero

Paste this whole file into your coding agent (Cursor, Claude Code, Codex) as the task brief.

---

## 1. Context

You are building the hero and page-wide signature animation for **Geekinate 2.0**, an AI-first digital studio site.

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
**3D:** three.js via React Three Fiber (`@react-three/fiber`), with `@react-three/drei` helpers.
**Scroll:** Lenis for smooth scroll, driving a single global scroll-progress value.

Note that shadcn/ui is for the DOM chrome only (nav, buttons, forms). It has nothing to do with the 3D scene. Do not try to build the scene out of UI primitives.

---

## 2. The concept

The Geekinate logo is a single letterform: a stylised **"G"**.

On page load, the hero shows that "G" rendered as a **3D tube**, a soft-lit, rounded, physical-looking ribbon sitting in space. It is not an image or an SVG. It is real geometry with real lighting and real depth.

As the user scrolls, the G **unravels**. The tube's head detaches from the letterform and begins travelling through the page as a snake-like ribbon, weaving between and behind the content sections, moving in three dimensions (going closer to camera, further away, crossing behind text, curling around a section). The tail follows behind, so mid-journey the letterform is gone and only a travelling ribbon remains.

At the bottom of the page, the snake **reforms into the "G"** and settles.

The entire animation is **scroll-scrubbed**. There is no autoplay. If the user stops scrolling, the snake stops exactly where it is. If the user scrolls up, it runs backwards. Scroll position is the single source of truth for animation time.

---

## 3. Core architecture: one master curve, one sliding window

Do not implement this as a morph between two separate shapes. That approach is fragile and expensive. Use this instead:

Build **one continuous 3D curve** (the "master spine") composed of three concatenated regions:

```
[ REGION A: the G letterform ]
        |
[ REGION B: the journey through all page sections ]
        |
[ REGION C: the G letterform again ]
```

The snake is a **fixed-arc-length window** sliding along this master spine.

- At `scrollProgress = 0`, the window sits exactly over Region A, so the visible tube reads as the letter G.
- As scroll increases, the window slides forward. The head leaves the letterform while the tail is still inside it, which produces the unravel for free, with no morph maths and no popping.
- Through the middle of the page, the window is entirely inside Region B, so it reads as a travelling snake.
- At `scrollProgress = 1`, the window has slid onto Region C, so the G reassembles, again for free.

**Window length must equal (or slightly exceed) the arc length of the G letterform path.** Otherwise the G will never look complete at the start or end.

**Exploit the letter's natural gap.** The letter G has an opening in its bowl. Orient Region A so that the snake's head and tail meet at that opening. The seam then reads as part of the letterform instead of a bug.

Transitions between A and B, and between B and C, must be C1 continuous (matching tangents), otherwise the tube will visibly kink at the handoff.

---

## 4. Assets and preconditions

Before writing scene code, confirm these exist. If any are missing, stop and ask.

1. **The Geekinate logo as SVG**, ideally a single-stroke / monoline version of the G, not a filled outline. If only a filled outline exists, run a centerline trace first, or manually author a single open path that follows the letterform's stroke. Tracing the outline of a filled shape will produce a snake that runs around the _edge_ of the letter, which looks wrong.
2. **Brand color tokens** (hex values) already present in the Tailwind theme.
3. Whether the letterform path is open or closed, and where its endpoints sit.

Write a one-off build script, `scripts/sample-g-path.ts`, that:

- Loads the logo SVG.
- Uses `svg-path-properties` (or `SVGGeometryElement.getPointAtLength` in a headless DOM) to sample **N uniformly spaced points** along the G path, where N is configurable and defaults to 256.
- Normalises them into a centered, unit-scaled coordinate space.
- Writes the result to `lib/curve/g-points.json`.

Never sample the SVG at runtime. Bake it.

---

## 5. Scroll system

- Install and initialise **Lenis** at the app shell level.
- Expose a single global scroll-progress store (Zustand is fine, or a plain ref-based context). It holds `raw` (0 to 1 across the full document) and `damped`.
- Damp `raw` toward `damped` inside `useFrame` with a lerp factor around 0.08 to 0.12. Everything in the scene reads `damped`, never `raw`. This is what makes the motion feel expensive rather than twitchy.
- Do **not** use drei's `<ScrollControls>`. It expects DOM inside the canvas and fights a real marketing page.
- GSAP ScrollTrigger is optional and only for DOM-level section reveals, not for the tube.
- Never write scroll values into React state. Mutate refs and read them in `useFrame`. A React re-render per scroll frame will kill the page.

---

## 6. The curve system

Create `lib/curve/` with:

**`gCurve.ts`**

- Loads `g-points.json`, maps to `THREE.Vector3`, applies a small per-point Z offset so the letterform is not perfectly flat (a subtle wave gives it dimensionality under lighting).
- Returns a `THREE.CatmullRomCurve3`.

**`journeyCurve.ts`**

- An authored array of control points describing the snake's path through the page, expressed as **section keyframes**. One entry per page section, each with a target position, a depth (Z), and an optional "swing" amplitude.
- Vary Z meaningfully. The snake should pass in front of the camera plane in some sections and recede far behind in others. Flat Z is the single fastest way to lose the 3D feel.
- Returns a `THREE.CatmullRomCurve3`.

**`masterSpine.ts`**

- Concatenates gCurve, journeyCurve, gCurve into one point array with smoothed joins.
- Exposes `getWindowPoints(progress: number, windowLength: number, segments: number): Vector3[]`, which returns the snake's current spine points.
- Use arc-length parameterisation (`curve.getSpacedPoints`), not uniform `t`, or the snake will speed up and slow down arbitrarily.

---

## 7. The tube: geometry, material, lighting

**Geometry (v1):**
Rebuild `THREE.TubeGeometry` each frame from the current window points. Use `tubularSegments: 200`, `radialSegments: 12`, `closed: false`. Dispose the previous geometry every frame to avoid a leak. This is acceptable for v1 and holds 60fps on desktop.

**Geometry (upgrade path, only if v1 drops frames):**
Build a static unwrapped-tube geometry once, where each vertex carries `(u along length, angle around tube)`. Write the spine positions and Frenet frames into a `DataTexture` each frame and displace vertices in a custom vertex shader. Zero geometry allocation per frame. Do not build this first. Only reach for it if profiling demands it.

**Taper:** Radius should not be constant. Taper the head and tail so the snake has a nose and a point, rather than looking like a cut pipe. Feed a radius function into the tube builder.

**Material:** `MeshPhysicalMaterial` with a low-to-mid roughness, mild metalness, and a clearcoat layer. Aim for the look of a soft, injection-moulded object under studio light, not chrome, and not glass. Chrome reads as a default; avoid it.

**Color:** Run the brand palette _along the tube's length_ using the geometry's `uv.x`, either as vertex colors or a small gradient texture. The color travelling along the ribbon is a large part of what sells the motion.

**Lighting:**

- `<Environment preset="studio" />` from drei for the base reflections.
- One key directional light, one cool rim light from behind, one very soft fill.
- Real contact shadows are not needed since the snake floats.

**Post-processing** (`@react-three/postprocessing`), all subtle:

- Bloom, low intensity, high threshold. Only the brightest specular highlights should bloom.
- N8AO or SSAO for depth grounding.
- Very light chromatic aberration at the frame edges.
- Vignette.
- Depth of field is optional and expensive. Add it last, and only if the frame budget allows.

Restraint matters here. The signature is the snake itself. Everything around it stays quiet.

---

## 8. Camera choreography

Camera is on a rail, also driven by `damped` scroll progress.

- **0.00 to 0.08:** Camera locked head-on to the plane of Region A. The G is centered and fills a comfortable portion of the viewport. This is the load state and must look composed and deliberate as a still frame.
- **0.08 to 0.90:** Camera tracks along an authored path, keeping the snake's head loosely framed. Offset the framing so the head does not sit under DOM headlines. Add a small amount of ambient drift (very low amplitude sine on position and rotation) so the frame never feels locked.
- **0.90 to 1.00:** Camera eases back into a head-on framing of Region C. The G reassembles and settles.

Use `damp3` / `damp` from `maath` for camera position and lookAt rather than raw assignment, so camera motion always trails the scroll slightly.

---

## 9. Layering the canvas against page content

Use a **single global canvas**, fixed to the viewport:

```
position: fixed; inset: 0; pointer-events: none;
```

The page's DOM sections scroll normally over it.

To get the weaving effect (snake sometimes in front of content, sometimes behind), do **not** build two canvases. Instead:

- Place the canvas at a mid z-index.
- Sections that should **occlude** the snake get an opaque background and sit above the canvas.
- Sections that the snake should pass **in front of** get a transparent background and sit below the canvas.
- Decide this per section, deliberately, as a design choice.

This gives a convincing weave at roughly zero extra cost.

---

## 10. Performance, responsiveness, fallbacks

- `<Canvas dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: 'high-performance' }}>`
- Add drei's `<AdaptiveDpr pixelated />` and `<PerformanceMonitor />`. Drop dpr and disable post-processing automatically when frame time degrades.
- Import the whole 3D bundle with `next/dynamic` and `{ ssr: false }`. three.js must not run through SSR.
- Suspense fallback should be the flat SVG G, correctly positioned, so the hero has a stable LCP and no layout shift while the scene boots.
- **Mobile:** do not ship the full scene. Reduce to `radialSegments: 6`, no post-processing, shorter journey with fewer keyframes. If mobile still struggles, fall back to a 2D SVG version of the same idea (a stroke-dashoffset G that draws and travels on scroll). The concept survives the downgrade; the frame rate does not survive the full scene.
- **`prefers-reduced-motion`:** render the static 3D G, skip the journey entirely, no scroll-driven motion.

---

## 11. Accessibility

- All hero copy, the H1, and the CTAs are real DOM elements, never drawn into the canvas.
- Canvas gets `aria-hidden="true"` and `pointer-events: none`.
- Keyboard focus states on all interactive DOM elements remain fully visible above the canvas.
- The page must be completely readable and usable with WebGL unavailable.

---

## 12. File structure

```
components/
  canvas/
    GlobalCanvas.tsx        // fixed <Canvas>, lights, env, post-processing
  hero/
    SnakeTube.tsx           // the tube mesh, per-frame geometry update
    CameraRig.tsx           // scroll-driven camera
    HeroCopy.tsx            // DOM headline, CTA (shadcn)
lib/
  curve/
    g-points.json           // baked output
    gCurve.ts
    journeyCurve.ts
    masterSpine.ts
  three/
    tubeMaterial.ts
hooks/
  useScrollProgress.ts
scripts/
  sample-g-path.ts
config/
  snake.ts                  // all tunables
```

---

## 13. Tunables

Put every magic number in `config/snake.ts`, exported as a typed object: window arc length, tube base radius, taper curve, radial and tubular segments, color stops, damping factors, camera offsets, per-section keyframes, phase boundaries.

Wire up **leva** as a dev-only panel bound to that config, so the motion can be tuned live in the browser instead of through recompiles. Strip it from production builds.

---

## 14. Build in phases

Do not attempt all of this in one pass. Build and verify in this order.

**Phase 1.** Baked G points render as a static `TubeGeometry` in a fixed canvas, correctly lit. Acceptance: it looks like the logo, in 3D, and it looks good as a still frame.

**Phase 2.** Master spine assembled, sliding window implemented, wired to Lenis scroll. Acceptance: scrolling unravels the G and reforms it, with no kinks at the region joins, and it runs cleanly in reverse.

**Phase 3.** Journey curve authored per section, camera rig added. Acceptance: the snake meaningfully travels the page in three dimensions and the camera framing never collides with headline text.

**Phase 4.** Material, gradient, taper, lighting, post-processing. Acceptance: it reads as a physical object, not a coloured line.

**Phase 5.** Performance guards, mobile path, reduced-motion path, accessibility pass. Acceptance: 60fps on a mid-range laptop, usable on a mid-range phone, fully readable with WebGL off.

---

## 15. Non-goals

- Do not copy thestart.com.au. That site uses floating 3D props. Ours uses one branded object. The reference is the _feeling_ of tactile studio-lit 3D, nothing more.
- No autoplay, no timeline that runs independently of scroll.
- No scroll hijacking, no fake momentum, no jump-to-section snapping. Lenis smoothing only.
- No particles, no starfields, no glowing grids. One idea, executed precisely.
- Do not put text, buttons, or layout inside the canvas.
