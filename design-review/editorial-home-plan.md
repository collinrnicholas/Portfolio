# Homepage editorial refinement

Source of truth: the completed Silver Graphite preview at port 4176. This isolated portfolio worktree runs on 4177, branch `codex/portfolio-editorial-home-20261018`. Existing palette, content, fonts, navigation structure and two-column desktop hero are approved. This pass changes homepage styling and interaction only.

## Direction

- Focal point: retain the sans/italic hero headline; clarify its weight and breathing room without rewriting it.
- Hierarchy: retain the current hero, remit, portfolio, evidence, approach, independent products and contact order.
- Type: Inter and Newsreader stay. Hero sans weight 600, serif 400. Main desktop prose 18px, supporting prose 16px; deliberately bounded lines. Existing headings stay close to their current scale.
- Composition: preserve container and column structure; normalize major rhythms around 8/16/24/32/40/48/64/80/96px. Remit uses consistent header, label, row and footer alignment.
- Motion: reusable duration/easing/distance/stagger tokens, safe-contrast text entrances, one-time reveals, small arrow responses, location-aware navigation and short page crossfades. Native CSS/JS is appropriate to this static HTML site.

```text
[unchanged two-column desktop hero]
[headline + copy + actions]   [Current Remit + aligned rows]
[unchanged enterprise / outcomes / leadership / independent work / contact]
```

The explicit Silver Graphite brief overrides generic palette, typography or template recommendations. No references are copied. The changes refine the existing editorial composition rather than create a new one.

## Registry review

DesignOS `motion-primitives__in-view` and `motion-primitives__transition-panel` specify React >=18, Tailwind >=4, and the `motion` package. Introducing that runtime for one static homepage would change the project architecture. Retain the already implemented native equivalents: IntersectionObserver for once-only reveals and native CSS directional tab panels. No React dependency is added; no claim of importing those React components is made.

## Acceptance

1. **eh-01 — preservation.** Ten Silver Graphite color tokens, all visible text, links, facts, fonts and page structure stay. Only the homepage loads the new refinement stylesheet and enhancement script. All five supporting HTML routes, shared CSS/JS, resume and images stay byte-identical. Rules: portfolio.hero.claim, color.surfaces, hierarchy.single.primary.
2. **eh-02 — composition.** Desktop retains two columns; existing mobile stacking stays. Homepage rhythm and remit rows use named spacing roles; normal text >=16px except clearly subordinate 14px metadata. No clipping/overflow at 320, 375, 390, 700, 834, 900, 1024, 1280 and 1440px. Rules: responsive.overflow, color.contrast.body, hierarchy.repetition.
3. **eh-03 — interaction.** Hero stagger, 8px panel lift, one-time section reveals, hover/focus/pressed states, directional artifact tabs and active navigation work. Scroll does not alter URL/history. Reduced motion at load/live stops all movement; no-JS content remains readable. Rules: a11y.motion, interaction.focus.visible, interaction.keyboard.order.
4. **eh-04 — evidence.** Desktop/tablet/mobile before/after screenshots, source hashes, factual-content comparison, contrast/axe checks, menu/tab and navigation checks. No serious/critical accessibility issues, browser errors or missing assets. Supporting routes get load and preservation checks. Static HTML has no configured lint, typecheck or production build; run syntax/CSS parsing and browser checks instead. Rules: a11y.axe.critical, a11y.headings.

Baseline snapshot: `.designos/editorial-home/before/`. No push, merge or deployment. No edits to other repositories or previous preview worktrees.
