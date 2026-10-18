# Executive content pass: initial independent validation

Run: `executive-2026-10-18T12-50-36-155Z`. Raw evidence and screenshots: `.designos/qa/executive-2026-10-18T12-50-36-155Z/`.

This describes the initial frozen content pass, before the owner's subsequent clarification about team leadership and partner scope. It is not final validation of that forthcoming revision.

| Item | Initial verdict | Evidence |
| --- | --- | --- |
| exec-01 | Pass | Current Director of Product title, Persado remit and leadership action are visible. The responsibility map uses 16px descriptions and 14px category labels. Desktop and mobile screenshots were visually inspected. |
| exec-02 | Fail | Current responsibilities and three complementary results precede independent products in DOM and visual order. The three homepage results are grouped under “Jobvite & Employ,” whereas the detailed source attributes all three to Jobvite, 2021–2025. The homepage needs precise company/period context to satisfy the written acceptance. |
| exec-03 | Pass for initial facts | Six routes consistently identify the current employer, retain bounded independent-project descriptions, and contain no inflated CPO/VP title or flagged unsupported claim. All local fragment destinations work, including `work.html#persado`, whose target starts at 109.7px below an 89px header. New owner facts require another review. |
| exec-04 | Fail | One serious mobile contrast failure remains in the hero map. All 18 route/viewport requests, six 320px probes, heading outlines, assets, browser errors, artifact tabs, initial reduced motion and no-JS content otherwise passed. A menu timing probe needs correction and confirmation. |

The mobile contrast failure is the “Persado” map label at 4.14:1 while the scroll-driven `studio-mask` reveal is partially transparent. It is not an invented typography minimum. Remove opacity from that presentation transition or otherwise maintain contrast throughout it. Startup hero fades also warrant review at the actual animation boundary.

The automated 36% flags are intermediate presentation frames from the existing 900ms ticker. The source, accessible final value and settled number say 36% YoY customer-activity growth; SMS volume is separately labeled as 10% YoY. The QA harness now waits for the ticker's final values before assessing factual copy.

The mobile menu opened and closed correctly, returned focus on Escape, and closed after navigation. The test attempted to focus a child before its opening transition reached visibility. The corrected probe waits for the link to become visible, then tests focus; this requires confirmation in the final run.

Additional measured evidence:

- 18/18 pages returned HTTP 200. All have one h1 and no skipped heading levels.
- No browser errors, failed requests or missing local assets were recorded.
- All six routes fit 320px; all six mobile pages have no measured target under 44×44px.
- All 27 desktop and 25 mobile keyboard stops were visible and outlined.
- ArrowRight moves focus and selected state to the second artifact tab. All three panels and their images load on selection.
- No-JS desktop/mobile pages retain the responsibility map and first product artifact, with no overflow.
- All recorded UI file hashes were unchanged across the run. Final QA additionally hashes all CSS and JS, including the existing motion layer.

Axe also reports one minor `aria-allowed-role` issue for the existing figure used as a tabpanel. This did not trigger the serious/critical acceptance threshold, but it remains a real semantic residual until corrected.
