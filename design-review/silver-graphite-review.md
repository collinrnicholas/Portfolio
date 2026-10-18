# Silver Graphite — implementation and comparison

Validated locally on October 18, 2026. No commit, merge, push or deployment was performed.

## Preview

- Silver Graphite: <http://127.0.0.1:4176/>
- Interactive comparison: <http://127.0.0.1:4176/design-review/silver-graphite-comparison.html>
- Original approved preview: <http://127.0.0.1:4175/>
- Worktree: `/Users/test/dev/collinnicholas-silver-graphite`
- Branch: `codex/portfolio-silver-graphite-20261018`

The named repository, `/Users/test/dev/collinnicholas-site`, belongs to `collinrnicholas/Portfolio`. Its checked-out version predates the executive hero described in the brief. This isolated worktree therefore starts from the same Git base and carries the approved uncommitted preview as its visual/content baseline. Both source checkouts are untouched. The branch diff includes that carried baseline; the visual-refinement diff is defined against `.designos/silver-graphite/before/manifest.json`, not against the older Git base.

## Implemented

| File | Change |
| --- | --- |
| `css/tokens.css` | Ten exact owner-specified semantic colors; compatible aliases for existing components; cool neutral ramp and accessible state roles. Existing type and spacing scales retained. |
| `css/studio.css` | Components consume semantic roles for navigation, CTAs, cards, artifacts, page heroes, contact and footer. Consistent silver/white surfaces; graphite outlined contact control; no strong shadows. Pressed controls retain full opacity for contrast. |
| `css/executive.css` | Silver Current Remit card, charcoal copy and semantic dividers. Same dimensions and information structure. Safe-contrast 14px text and 8px panel entrances. |
| `css/motion.css` | Short entrance, underline, arrow, tab and page-crossfade behavior. Removed ambient gradients, grain, looping washes, pointer spotlights, zoom/lift and elastic easing. |
| `js/motion.js` | Removed pointer tracking/magnetic behavior and image hiding. One-time in-view enhancement; existing numeric reveal and live reduced-motion cancellation retained. |

No dependency or framework was added. Motion remains native CSS/JavaScript, appropriate for the existing static implementation. Inter, Newsreader, content, headings, links and responsive composition are unchanged. Authentic product screenshots retain their original pixels and colors. The illustrative BidPacket/Loupe frames and Arclo frame are part of the surrounding interface and now use neutral surfaces, including a charcoal Arclo panel.

## Measured validation

- **18/18** before/after route/viewport comparisons pass: six routes at 1440px, 834px and 390px. Matching full-page screenshots exist for every pair, with homepage fold captures at all three sizes.
- All 18 preserve rendered text, settled dimensions/page positions, font families/sizes/weights, leading and tracking. Animation transforms were temporarily neutralized in both versions for geometry measurement; CSS transforms change offset parents, so raw `offsetTop` is not a valid cross-version comparison.
- **14 source files** remain byte-identical to the approved preview: six HTML pages, résumé, five images, main.js and studio.js. No factual or marketing copy was edited. Only the five styling/motion files above differ from the approved baseline.
- Zero serious/critical axe violations, load failures, missing image assets, heading regressions or 320px horizontal overflows. All six mobile keyboard menus pass; nine artifact-tab checks pass across desktop/tablet/mobile.
- Primary/secondary links, navigation, contact button and tabs pass pressed-state contrast checks. Representative CTA hover and graphite focus states pass. Full-opacity pressed states were verified separately after the full matrix; this final state-only correction does not change default geometry or captures.
- Desktop and mobile reduced-motion switches were tested during active number tickers: numbers immediately reach and retain `$1.76M`, `36%`, `1,500`, with zero running animations. No-JavaScript content remains readable, including the Current Remit panel and first product image.
- Every route/viewport pair in the interactive report was opened and both screenshots loaded, with no report browser errors.
- All eight CSS files parse using the existing DesignOS PostCSS installation; all three JS files pass `node --check`; `git diff --check` passes. This static repository has no package manifest or configured lint, TypeScript, unit-test or production-build command; none was invented.
- **73 local links** checked for existing file and fragment targets, with no failures.

Contrast from the rendered token pairs: primary on base 13.92:1; secondary on base 5.75:1; secondary on silver 5.16:1; white on primary CTA 15.20:1; white on hovered CTA 10.69:1. See browser evidence for actual computed state colors.

## DesignOS review

Before: `20261018-132911-collinnicholas-audit-prdy`.
After: `20261018-133649-collinnicholas-audit-pzpz`.

Both capture all 18 views. The final audit has **zero critical, high or objective findings**, with the same six existing heuristic advisories (five medium, one low) about typography, spacing, radius and timing. Those advisories do not authorize changes to the owner's requested preserved layout/type. The first after pass caught insufficient contrast during early supporting-hero frames; the entrance opacity was corrected, and a fresh DesignOS audit passes.

The DesignOS axe run includes best-practice rules and still records the existing minor figure/tabpanel ARIA warning. The unchanged résumé also retains its older team-size figure; reconcile it in a separately authorized content release. Neither is represented as fixed by a visual-only pass. Vision-model review was disabled; final desktop/mobile images were inspected directly.

## Evidence

- Acceptance: `design-review/silver-graphite-plan.md`
- Full comparison: `.designos/silver-graphite/validation/results.json`
- Mid-animation reduced motion and report controls: `.designos/silver-graphite/validation/final-focused-results.json`
- Pressed states: `.designos/silver-graphite/validation/final-active-states.json`
- Local links: `.designos/silver-graphite/static-checks.json`
- Before hashes: `.designos/silver-graphite/before/manifest.json`
- Final hashes: `.designos/silver-graphite/final-source-hashes.json`
- DesignOS reports: `.designos/runs/<run-id>/report.html`

The original preview stays on 4175. To restart this worktree's server later, run `python3 -m http.server 4176 --bind 127.0.0.1` from its directory. Publication remains a separate owner decision; this pass only supplies a local, reviewable visual refinement.
