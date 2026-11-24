# RideMyPark documentary verification

Open /fieldbook with npm run dev. The documentary uses React in the existing Next App Router. The schema and story modules are TypeScript. The master clock is one GSAP timeline per mounted player. Seek operations suppress sound callbacks. Native anchors work independently of the player. The reduced-motion preference removes camera travel and visual entrances.

Chromium Playwright exercised all five chapter buttons at 1920×1080, 1440×900, 1024×768, 768×1024, 390×844 and 360×800. Each check verified the cumulative names, eleven archive entries and absence of document-level horizontal overflow. Additional checks exercised play, pause, resume, sound activation, skip, an expandable archive record and internal anchor destinations. No page errors were captured. Screenshots from the final spread are in qa/. Mobile shows the art stacked above a horizontally scrollable chapter selector.

Historical portraits and original UI screens are pending licensed files. The miniature world is an illustrated linked network. Audio is an original cue, and the chapter durations are editorial. The checks use Chromium mobile viewports; native iOS Safari has not been tested.

## 2026-11-20 refinement

Added a scroll-linked scissor head on the dashed logbook seam and paired procedural blade-scrape cues. Enter the fieldbook unlocks Web Audio; the player listens for shared mute changes. The welcome lettering now eases in over 1.5 seconds and shrinks upward on scroll. Chapter typography uses masked upward entrances, with a stable copy area. Fixed duplicate sibling keys on year and caption nodes, which caused stale headings to accumulate during playback.

Formatting and ESLint pass. Chrome confirmed Enter activates the Sound on control and playback. The browser connection timed out before the final timeline, mobile and reduced-motion checks; those checks remain pending. The initial sandbox build failed because Turbopack could not bind its local process port. Existing detector advisories about the equalizer animation name and the established paper geometry are retained intentionally.

## Development server recovery

The old Next.js process on port 3008 held the socket but timed out without sending a response after 12 seconds. Stopped only this repository's confirmed Next.js processes and restarted `npm run dev` on the same port. Two subsequent `/fieldbook` requests returned HTTP 200 in 0.168s and 0.154s; the response contains the fieldbook heading and `data-scissors` markup. No cache removal or dependency change was needed. This confirms server response recovery, not a complete browser performance audit.

## Slower storytelling and replay

Restored the main story's chord and beat cues. Paper cutting now uses alternating blade contact and paper-fibre rasp cues only from actual scroll updates inside the timeline, at least 480ms apart and after 28px of movement. It has no interval or queued repeating sound; each stroke decays within 320ms. Scissor motion works when muted too.

The story now loops with a 1.2s finale hold and restarts on viewport re-entry; reduced motion keeps manual playback. Chapter timing is slower, with clock-driven text entrances and exits, balanced caption lines and six accessible chapter progress buttons. Chrome verified the chapter controls and the 2026 finale returning to 2019 automatically. The timeline scissors were visually verified on the central dashed seam. Formatting and ESLint pass. HTTP returned 200 in 0.392s. Production build remains blocked by the environment's Turbopack child-process port permission error, even with escalation; no production build success is claimed. Audio was inspected in code but not independently auditioned through the browser tool.

## Background server and text-first sequence

Port 3008 had no listener. Started `npm run dev` detached with output in `/tmp/geekinate-dev-3008.log`; subsequent home and fieldbook requests returned HTTP 200 in 0.392s and 0.189s. Removed the story chapter bars and bottom progress hairline as requested. Chapter text now precedes new portraits by 1.5s, with 1.25s eased entrances and sound callbacks on the same master clock. Removed character idle bobbing, reaction nudges and chapter wipes for a calmer sequence. ESLint passed; final visual synchronization still needs browser review.

## Growth trajectory and pre-footer CTA

Reused `features/cta` immediately before the shared footer; Chrome confirmed the animated black section. The logbook now has a growth-trajectory heading and intro plus a ruled “What changed” outcome at each milestone, sourced from each existing milestone's `consequence`. No new numerical growth claims were added. Chrome confirmed all eight outcomes in the rendered page. Final trajectory viewport inspection was inconclusive because browser scrolling returned to the opening; do not treat it as completed responsive visual QA. Formatting and ESLint pass.

## Default sound and deeper polish

Sound preference starts on. Web Audio unlock is attempted on mount and retried on pointer/keyboard interaction as browser policy requires. Enter respects mute rather than forcing sound back on. A shared output gain makes mute fade current cues as well as block new ones, and audio initialization failures are handled. A temporary Node harness verified default-on, unlock, mute gain, preservation of mute, and re-enable.

Added visible keyboard-accessible previous, restart and next controls, removed invisible map click zones, enlarged playback/sound controls to 44px, softened card easing, reduced portrait outline weight, and improved phone title/map framing. Chrome checked 1536px desktop and 390×844 mobile: neither has document horizontal overflow; navigation controls measure 44px high. Restart and pause were exercised, default Sound on was confirmed, and mute remained off after Enter. Viewport override was reset. Browser errors inspected came from the installed React DevTools extension's instrumentation (`chrome-extension://.../installHook.js`); no extension settings were changed. Audio timbre was not independently auditioned. Detector advisories for the existing equalizer keyframe name and established paper styling remain intentional. Production build retains the previously documented Turbopack environment restriction.

## Layered story synchronization

Removed the small previous/restart/next row at the user's request, retaining Pause and Sound plus automatic replay. Text leads each portrait by 1.5s; entrances use distinct directions and durations. Portrait whoosh lengths and landing callbacks share the same entry-duration value as the rendered pose. Finale timing is centralized in `FINALE` for burst and staggered sticker cues. Arbitrary repeating beats were removed from playback. Active story sources are tracked and stopped on pause, visibility loss, reduced-motion changes and unmount; timeline paper-cutting sources remain independent. Resuming mid-entry creates a whoosh for the remaining movement duration.

Chrome confirmed the cleaned opening without the small row, default Sound on, and text preceding the portraits. ESLint passes. The temporary audio harness passes mute/unlock and active-source stop/cleanup checks. Actual perceived audio synchronization and timbre still need a listening check; no claim of frame-perfect audio measurement is made.

## Four-direction masked entrances

Restored left, top, right and bottom entrances with 0.85–0.9s motion and restrained overshoot. Start offsets use portrait-relative percentages large enough to put each incoming layer fully outside the map; earlier fixed 75–110px offsets started the portraits visibly inside it. The map itself now has no transform. Sound callbacks still read the same entry durations, and year stickers follow landing by 120ms. Finale title follows the name stickers. Chrome verified `overflow: hidden`, 20px radius, map transform `none`, and cumulative portrait counts from one to four; screenshots captured the first portrait crossing the left edge and the fourth crossing the bottom edge. ESLint passes. Listening verification remains separate.

## Poster-triggered paper sound

Removed the moving scissors and their scroll-position audio handler. The timeline now uses a normal solid spine. Poster-bearing milestone cards call the paper-cut cue from their entrance animation's `onStart`; plain scroll movement and text-only cards do not trigger it. The current card reverse/replay behavior is retained. Chrome confirms zero scissor nodes, seven posters and the normal spine. Formatting and ESLint pass. Audio timbre still requires listening verification.

## Tighter story pacing

Shortened chapter durations from 32.4s to 27.3s total (about 16%), replay hold from 1.2s to 0.8s, text entrances to 0.9s and the text-to-portrait lead to 1.25s. Portrait entrances are 0.8–0.85s with slightly less overshoot; sound uses those same durations. Chrome checked the updated opening flow. ESLint passes. Neither `.codex/agents.md` nor `.codex/AGENTS.md` exists in the repository; root guidance remains applicable.
