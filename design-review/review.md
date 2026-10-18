# What this experiment changes

Reviewed October 17, 2026 (America/New_York). The public domain is **collinnicholas.com** (two ls). The live page inspected in Chrome still displayed an Employ Senior PM profile; the separate active local profile checkout already contained newer Persado content. The six-route DesignOS pilot is a third, older visual rebuild. This experiment starts from the pilot for its real case-study routes and carries forward the newer professional copy without changing either existing checkout.

## Findings and priorities

1. **Work is too far from the first impression.** The live page presents five large general statistics, then a philosophy section before product work. This is a design judgment: it emphasizes claims before showing the product decisions behind them. Put a real artifact in the hero and selected work immediately below it. DesignOS rules: `portfolio.hero.claim`, `portfolio.proof.density`, `hierarchy.first.view`.
2. **The live navigation offers destinations that do not exist.** Walkthrough links and enterprise case-study cards point to `#`; the booking link points to generic calendly.com. A reader who wants evidence reaches a dead end. Use actual product URLs, the existing case pages, email and the correct LinkedIn profile; omit nonexistent video playback and booking experiences.
3. **Professional positioning is out of date.** Public content says current Senior PM at Employ and explores Senior/Principal PM roles; the newer owner-maintained profile and public resume say Director of Product at Persado, August 2026 to present. Separate current Persado responsibilities from historical Employ/Jobvite outcomes. These remain owner-provided career claims, not an independent financial audit.
4. **Product proof is visually interchangeable.** The pilot uses repeated wordmark panels for three different products. Show real PM Toolkit screens and distinct, explicitly illustrative BidPacket/Arclo workflows. Explain the problem, decision, and artifact a viewer can inspect. Avoid an invented screenshot, user count or conversion claim.
5. **The pilot has measured accessibility issues.** Existing DesignOS audit `20261017-135159-collinnicholas-audit-c8ia`: F-001 includes footer text at 2.29:1 contrast; F-002 includes a 31×20px Previous highlight control; F-004 reports a home h1→h3 heading skip. F-005's 12px minimum is a readability heuristic, not proof every label must be 16px. The redesign fixes contrast, touch targets, semantics and prose size, then measures again.

The old audit captured 18/18 route/viewport combinations and grouped 21 findings (3 objective, 6 heuristic, 12 subjective). Its repeated element counts should not be treated as precise defect totals: some titles preserve a single-route count while merged measurements aggregate routes. This experiment compares concrete facts rather than reporting a misleading percentage score.

## Reference use

- **DesignOS:** read `PROGRESS.md`, all relevant role skills, knowledge search and saved portfolio decision. The saved direction is “Single claim + one artifact; display scale 56/36/28.” The existing CLI audit works. Phase 3 automated build/validation/comparison commands remain gated; agents perform those handoffs explicitly.
- **UI/UX Pro Max:** fetched the [official repository](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) at `56ea9cf174ed86786187daa9de0e6247cb0747e4` into a temporary reference checkout, read its skill and executed its Python search. Two overall design-system results did not fit the portfolio identity and were rejected. Useful targeted results: `portfolio-grid`, `minimalism-and-swiss-style`, News Editorial typography, touch/focus/reduced-motion guidance. No skill or dependency was installed in the portfolio.
- **Motion Primitives:** inspected official [Transition Panel](https://motion-primitives.com/docs/transition-panel), [Animated Background](https://motion-primitives.com/docs/animated-background) and [In View](https://motion-primitives.com/docs/in-view) docs/source. The prototype adapts those patterns in native CSS/JS because this is a static site. It does not use the React package. User-driven view changes replace carousel autoplay; reduced motion is explicit.

## Asset provenance

PM Toolkit UI images come from the owner's existing `ThePMToolkit/client/public/screenshots/` directory and are real product screenshots of sample content. BidPacket/Arclo/Loupe interface illustrations represent workflows and must be labeled as such. No private dashboard screenshots, prospect lists, secrets, or third-party stock imagery are used.

The current two-page public resume was copied unchanged from the actively edited profile checkout into this isolated preview and rendered for verification; the original pilot's stale three-page resume was replaced only here. No resume was authored in this experiment.

## Scope and release status

This is a local visual experiment on `codex/portfolio-designos-preview-20261017`. It is not merged with `origin/main` or the active profile branch. No push, deployment, external form submission, or messaging is part of this task. Before an eventual release, reconcile the final content branch and preview branch, then explicitly authorize publishing.
