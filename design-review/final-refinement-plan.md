# Focused homepage refinement

Inspected the existing port-4177 homepage at 1440x900 and 390x844 before implementation. Existing Silver Graphite palette, Inter/Newsreader pairing, headline/body font sizes/weights, two-column desktop hero, content, navigation and component structure are approved and stay.

Observed: desktop lede ends with a short trailing line; mobile hero padding and gap defer the Remit panel; the panel has equal context-to-title and title-to-data gaps, weakening grouping; the hero entrance sequence can settle sooner.

Plan: balance the short hero paragraph without content edits, preserve readable natural-wrap fallback, increase desktop headline-to-copy spacing by 8px, tighten mobile hero padding by 8px and inter-column gap by 8px, group the Remit context/header more closely while separating the responsibility rows, and reduce hero duration/stagger to 320/50ms. Existing tokens and native motion implementation suffice; no React dependency or new component is justified.

Acceptance:
1. All original source files except index.html and css/editorial-home.css are byte-identical. The index change only wraps the existing product–engineering phrase in a nonbreaking inline span, retaining its exact text. Ten palette tokens, all text, font sizes/families, headline/body weights, routes and links stay. Only the Remit context label gains medium weight for hierarchy. No new component or framework.
2. Desktop retains two columns, mobile retains existing stacking. Paragraph balance improves desktop rag; mobile Remit moves higher. Hero and panel headings remain intact; no horizontal overflow at 320, 375, 390, 700, 701, 834, 900, 901, 1024, 1100, 1280 and 1440px.
3. Existing menu, artifact tabs, active navigation and button hover/focus/pressed behavior work. Keyboard focus receives the same restrained arrow feedback; reduced motion suppresses it. Initial/live reduced motion and no-JS remain usable.
4. Matching desktop/mobile/tablet screenshots; syntax/CSS checks, source hashes, axe, responsive and focused interactions pass. Known minor ARIA warning and heuristic advisories are reported honestly.

Only the existing homepage stylesheet and one typographic inline span change. Previous previews stay untouched. No push, merge, commit or deployment.
