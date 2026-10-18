# Portfolio Redesign — Silver Graphite Design System

## Role

Act as a Principal Product Designer and Senior Frontend Engineer specializing in premium editorial websites, design systems, typography, and refined interaction design.

Your task is to update my existing personal portfolio at `~/dev/collinnicholas-site` to a new visual identity called **Silver Graphite**.

**This is a visual refinement, not a redesign or rebuild.**

The current site already has a strong layout, typography, and content hierarchy. Preserve those elements while introducing a sophisticated monochromatic design system.

## 1. Design direction

**Theme:** Silver Graphite

**Style:** Modern Editorial Minimalism × Premium Technology

**Visual references:**
- Apple — refined light interfaces, precision, whitespace, visual hierarchy
- Rauno Freiberg (rauno.me) — interaction quality, subtle motion, attention to detail
- Linear — disciplined spacing, borders, and component consistency

The desired result should feel:
- Premium and carefully art-directed
- Minimal without being bland
- Cool-toned without feeling sterile
- Professional without feeling corporate
- Modern without looking like a generic SaaS template
- Appropriate for a Director of Product with a strong background in AI, technology, and product leadership

Avoid beige, cream, sage green, royal blue, purple gradients, and decorative visual effects.

## 2. Color system — Silver Graphite

Implement the following design tokens.

| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#F4F5F6` | Primary page background |
| `--color-surface` | `#E7E9EC` | Cards and highlighted content |
| `--color-surface-elevated` | `#FFFFFF` | Elevated interactive surfaces |
| `--color-text-primary` | `#22262C` | Headlines and main text |
| `--color-text-secondary` | `#59616B` | Supporting text |
| `--color-accent` | `#6D777F` | Restrained interactive accents |
| `--color-border` | `#D4D8DD` | Borders and dividers |
| `--color-button-primary` | `#22262C` | Primary CTA backgrounds |
| `--color-button-text` | `#FFFFFF` | Primary CTA text |
| `--color-hover` | `#DDE1E6` | Subtle hovered surfaces |

Do not simply find and replace color hex values.

Inspect existing CSS, Tailwind configuration, and component tokens first. Establish semantic tokens and migrate components consistently.

Avoid excessive shadows. Use subtle borders, tonal surfaces, and spacing to establish hierarchy.

Ensure readable text contrast in all states.

## 3. Preserve the existing homepage

The existing homepage hero has the following characteristics:

**Left column**
- Collin Nicholas branding and top navigation
- Director of Product · Persado eyebrow
- Bold sans-serif headline: "Product leadership."
- Italic serif headline: "From strategy to value."
- Supporting leadership description
- Primary and secondary CTAs
- Location text

**Right column**
- Current Remit panel
- Growth, retention, and product design headline
- Product responsibility rows
- Dividers and supporting metadata

Preserve this layout and content.

Specifically:
- Maintain the two-column hero.
- Retain the headline's sans-serif and italic serif pairing.
- Preserve the existing font families unless a clear rendering issue exists.
- Retain the Current Remit card.
- Retain navigation structure.
- Preserve existing routes, links, content, and responsive behaviors.
- Preserve all factual career information.

Do not invent accomplishments, rewrite marketing copy, or modify business claims.

## 4. Component styling updates

### Navigation

- Use the primary background with subtle separation from page content.
- Keep the existing wordmark and navigation layout.
- Use charcoal for primary navigation text.
- Use subtle underline or opacity transitions for hover and active states.
- Keep the Let's Talk button outlined with a graphite border.
- Avoid introducing a new navigation layout.

### Primary CTA

- Background: `#22262C`
- Text: `#FFFFFF`
- Subtle radius consistent with the existing design
- Hover: slightly lighter graphite
- Refined arrow movement on hover
- No glow, gradients, or excessive scale effects

### Current Remit card

- Replace the pale sage background with `#E7E9EC`.
- Replace green typography with charcoal.
- Use `#D4D8DD` for dividers.
- Preserve the existing information structure.
- Use consistent vertical spacing.
- Keep the card visually calm and balanced.

### Typography

- Headlines: `#22262C`
- Body copy: `#59616B`
- Metadata: muted graphite with accessible contrast
- Keep the bold sans-serif and italic serif pairing.

### Content cards

- Use tonal variations of silver and graphite.
- Prefer subtle borders over pronounced shadows.
- Keep corners consistent.
- Preserve the hierarchy between primary and supporting information.

## 5. Apply consistently across the portfolio

Review all existing routes and apply the new semantic color tokens consistently.

Include:
- Homepage
- Leadership content
- Work and case studies
- About page
- Contact experience
- Footer and navigation
- Responsive layouts
- Interactive components

Do not force every section to use the same background color.

Use alternating surfaces where helpful:
- Primary background: `#F4F5F6`
- Elevated content: `#FFFFFF`
- Highlighted sections: `#E7E9EC`

Allow authentic product screenshots and case-study imagery to retain their original colors. The surrounding interface should remain predominantly monochromatic.

## 6. Motion and interaction

Preserve any existing high-quality animations.

Use Motion Primitives and Motion for React where appropriate, but do not add dependencies unless necessary.

Target motion behavior:

| Interaction | Treatment |
|---|---|
| Hero headline | Subtle staggered fade and 12–16px rise |
| Supporting content | Gentle delayed reveal |
| Current Remit card | Soft fade and 8px entrance lift |
| Primary CTA | Smooth tonal transition and small arrow movement |
| Navigation | Animated underline or subtle opacity |
| Content cards | Restrained hover feedback |
| Section reveals | One-time fade and slight upward movement |
| Page transitions | Short, understated crossfade |

Motion should feel smooth, refined, and intentional.

Do not use:
- Magnetic cursors
- Particle effects
- Excessive parallax
- Animated gradients
- Large zoom effects
- Constant looping animations
- Overly elastic spring effects

Respect reduced-motion preferences.

## 7. Responsive and accessibility requirements

Test desktop, tablet, and mobile layouts.

Ensure:
- No horizontal overflow
- No text clipping or awkward headline breaks
- Accessible contrast
- Keyboard focus visibility
- Readable body text
- Consistent spacing across viewports
- No unnecessary layout shift
- No animation-dependent content visibility

## 8. Implementation constraints

1. Inspect the current implementation before modifying files.
2. Create an isolated Git branch or worktree.
3. Preserve component structure and business logic.
4. Centralize colors as semantic design tokens.
5. Avoid unnecessary dependencies.
6. Do not introduce a new component framework.
7. Do not modify Loop or other repositories.
8. Do not deploy, merge, or push automatically.
9. Do not rewrite existing content.
10. Do not change typography or layout unless needed for visual consistency.

## 9. Validation

After implementation:

1. Run lint, type checks, tests, and production build as available.
2. Open the portfolio using Playwright.
3. Capture desktop and mobile screenshots of all configured routes.
4. Check visual consistency and contrast.
5. Verify hover, focus, and responsive states.
6. Compare against the original design.
7. Confirm no functionality or content was lost.
8. Generate a before-and-after comparison report.

If DesignOS is available, use its reviewer and QA capabilities for validation.

## 10. Deliverables

Provide:
- Implemented Silver Graphite design system
- Centralized semantic color tokens
- Updated page and component styling
- Preserved original content and structure