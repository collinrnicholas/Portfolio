# Silver Graphite editorial homepage refinement

Validated October 18, 2026. Homepage preview: <http://127.0.0.1:4177/>. Before-and-after report: <http://127.0.0.1:4177/design-review/editorial-home-comparison.html>.

## Scope and preservation

Worktree `/Users/test/dev/collinnicholas-editorial-home`, branch `codex/portfolio-editorial-home-20261018`, carries forward the completed Silver Graphite preview at port 4176. That preview remains unchanged. No pushes, commits, merges or deployments were made.

Only `index.html` gains two asset includes. Its original HTML otherwise matches exactly; all headline copy, factual career content, links, sections and markup are preserved. New `css/editorial-home.css` and `js/editorial-home.js` load only on the homepage. Twenty-two other source files—including all shared CSS/JS, the five supporting routes, resume and images—are byte-identical to the completed Silver Graphite baseline. The ten approved color tokens are unchanged.

The branch diff includes carried uncommitted work from earlier preview passes. This refinement is assessed against `.designos/editorial-home/before/manifest.json`, not the older Git base.

## Refinements

- Stronger Inter headline weight, retained Newsreader italic, 18px desktop introduction, bounded line lengths and fluid tablet sizes. Both headline clauses remain intact at 320px without rewriting them.
- Remit heading, responsibility rows and metadata share consistent insets and spacing. Label/value alignment and 20px desktop row padding create a quieter hierarchy. The narrow two-column breakpoint uses a fluid Remit heading to preserve its two intended lines.
- Named spacing roles unify hero, enterprise evidence, approach, product grid and contact. Two-column hero and existing mobile stacking are retained.
- Reusable motion tokens: micro 120ms, state/page 180ms, panels 240ms, sections 320ms, hero 480ms; stagger 60ms; text/panel/section movement 14/8/12px; two easing curves. Secondary text starts at safe opacity; no content is hidden pending JavaScript.
- Buttons and navigation share control radii, visible focus, tonal pressed states and restrained arrow movement. The section indicator follows Leadership or Work, clears for contact, and never mutates URL/history during passive scroll. Geometry is cached on resize/content changes; scroll reads only scroll position.
- Existing once-only IntersectionObserver reveals, directional artifact tabs and live reduced-motion cancellation remain. No pointer effects, scrolling library, loops or new dependencies were added.

DesignOS registry entries `motion-primitives/in-view` and `motion-primitives/transition-panel` require React >=18, Tailwind >=4 and Motion. This static page uses the existing native equivalents rather than adding an unrelated framework/runtime. This is a documented implementation choice, not a claim that React components were imported.

## Validation

All four acceptance criteria in `editorial-home-plan.md` pass.

- Three matched before/after viewport pairs at 1440x900, 834x1112 and 390x844, with full-page and fold screenshots. All rendered text and palette roles match the baseline.
- Twelve responsive widths: 320, 375, 390, 700, 701, 834, 900, 901, 1024, 1100, 1280 and 1440px. No horizontal overflow; hero and Remit heading clauses stay intact.
- Zero serious/critical axe violations, browser errors, missing image assets or heading regressions. Existing minor `aria-allowed-role` on a figure/tabpanel remains documented; this pass does not claim universal accessibility compliance.
- Keyboard menu paths pass on tablet/mobile; nine artifact-tab keyboard checks pass. CTA hover, focus and pressed states retain readable contrast and avoid button movement.
- Nine section-state checks verify Leadership, Work and contact behavior across desktop/tablet/mobile, including visible active indicators in open mobile menus. Passive scroll leaves URL/history unchanged.
- One-time reveal fires once across two visits to the same section. Reduced motion at load and during the hero stops all running motion and restores full-opacity content. No-JS content, Remit panel and product imagery remain readable.
- Five supporting routes load successfully and do not include the new homepage assets.
- All nine CSS files parse, JavaScript syntax checks and `git diff --check` pass. This static repository has no configured lint, TypeScript or production-build command; none was invented.

The full matrix and DesignOS audit captured the final default composition at desktop/tablet/mobile. Subsequent changes only corrected contact activation and Remit heading sizing below 800px; targeted interaction and twelve-width checks cover those revisions. Captured default styles at 1440/834/390px are unchanged.

DesignOS final run `20261018-135911-collinnicholas-audit-89ny`: three views captured, zero critical/high/objective findings. Five heuristic advisories remain (four medium, one low): existing type scale, small metadata, spacing, radii and timing variety. They are not treated as authorization to rewrite the approved design. Vision-model review was disabled; captures were inspected directly.

## Evidence

- Final acceptance and coverage: `.designos/editorial-home/final-validation.json`
- Source hashes: `.designos/editorial-home/final-source-hashes.json`
- Matrix and matched captures: `.designos/editorial-home/qa/final/`
- Final navigation, pressed states and motion: `.designos/editorial-home/qa/interaction-results.json`
- Final Remit wrapping probes: `.designos/editorial-home/qa/remit-responsive-final.json`
- Interactive comparison verification: `.designos/editorial-home/qa/report-validation.json`
- DesignOS report: `.designos/runs/20261018-135911-collinnicholas-audit-89ny/report.html`

If the local server needs restarting, run `python3 -m http.server 4177 --bind 127.0.0.1` from this worktree. The prior Silver Graphite preview remains on 4176.
