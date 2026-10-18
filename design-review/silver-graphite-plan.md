# Silver Graphite refinement plan

The owner-provided brief is the authority: preserve the approved executive homepage, six routes, all content, Inter/Newsreader typography, and responsive geometry. Source repository is `collinnicholas-site` (`Portfolio.git`); the described homepage exists in its approved `collinnicholas-designos-preview` worktree. This separate worktree carries that exact approved baseline. Neither source checkout is edited.

## Direction

- Focal point: unchanged "Product leadership. From strategy to value." and Current Remit card.
- Hierarchy: unchanged executive story, evidence, independent products, and contact.
- Type: existing Inter sans and Newsreader italic serif; sizes and wrapping preserved.
- Surfaces: base #F4F5F6, highlighted #E7E9EC, elevated #FFFFFF; primary #22262C, secondary #59616B, border #D4D8DD, accent #6D777F. Accent is not used for small text when it fails contrast.
- Motion: 14px hero entrance, 8px remit entrance, short crossfade and tab feedback; remove ambient loops, spotlight, magnetic effects, heavy shadows, elastic easing and decorative gradients. Content remains readable without animation or JavaScript.

```text
Existing two-column hero stays:
[role / sans + italic headline / copy / CTAs] [Current Remit / responsibility rows]
Existing mobile stacking and all section geometry stay.
```

This is deliberately a refinement of the owner's specific composition, not a new template. Generic font, layout and palette recommendations do not replace the explicit brief.

## Acceptance

1. **sg-01 — semantic palette.** Ten requested color tokens resolve exactly; all six routes use the Silver Graphite interface and preserve original screenshot colors. Normal text contrasts >=4.5:1; CTA and focus states are readable. Rules: color.contrast.body, color.surfaces, color.gradients, interaction.focus.visible.
2. **sg-02 — preservation.** All six HTML files, resume and image assets have the same hashes as the approved baseline; all copy, links, DOM structure, typography and settled geometry are preserved. Rules: portfolio.hero.claim, hierarchy.repetition. Owner requirement overrides any style heuristic suggesting layout or copy edits.
3. **sg-03 — restrained motion.** No magnetic transforms, pointer spotlight, ambient gradients, infinite loops or elastic springs. Existing tabs, menu, number reveal and short page transitions work; reduced motion at load and live suppresses movement. Rules: a11y.motion, interaction.hover.touch.
4. **sg-04 — measured review.** Six routes x desktop/tablet/mobile screenshots, no 320px overflow, missing assets, browser errors or serious/critical axe violations. Natural keyboard menu/tab navigation and no-JS readability pass. Before/after comparison captures matching viewports with source hashes and measured deltas. Rules: a11y.axe.critical, a11y.headings, interaction.keyboard.order.

## Evidence and limits

Before snapshot: `.designos/silver-graphite/before/manifest.json` plus HTML/CSS/JS copies. The existing preview at port 4175 remains available for side-by-side review; the Silver Graphite worktree runs on port 4176. Static HTML has no package manifest, lint, typecheck or production build; syntax, CSS parsing, HTTP, structure, browser and DesignOS checks replace unavailable commands. No dependencies, commits, pushes, merges or deployments are needed for this local refinement.
