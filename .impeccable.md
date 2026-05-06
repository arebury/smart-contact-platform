## Design Context

### Users
Internal supervisors and admins of the Smart Contact contact-center platform.
They use this product all day at a desktop, often switching between dense
list views and long forms. Context is operational, not casual: they need to
find a record, edit it, save it, and move on without friction.

### Brand Personality
Three words: **calm · dense · operational**. Not playful. Not luxurious. Not
"techy" in the cyberpunk sense. The product should read as a quiet,
trustworthy instrument — closer to a serious B2B dashboard (Linear, Tuple,
Stripe internal) than a marketing site.

### Aesthetic Direction
- **Theme**: light. Operators sit in lit offices and look at this for hours.
  Dark mode would be aesthetic-first and ergonomic-second; not the right
  trade for this audience.
- **Tone**: refined-minimal with operational density. Information forward,
  ornament back. White-space serves grouping, not breathing-room-for-its-own-sake.
- **Reference**: the Smart Contact Figma at file `Dle87qs0Pjq0OjIaaCfmm7`
  is the canonical visual brief. Mirror its tokens, type ramp, and toast /
  dialog patterns precisely.
- **Anti-references**: glassmorphism, neon accents, gradient backgrounds,
  border-left severity stripes, cyan-on-dark dashboards, "modern SaaS"
  illustrated empty states with abstract shapes.

### Design Principles
1. **No layout shift.** Reserve space for everything that can appear or
   disappear (validation messages, bulk action bars, chip lanes,
   conflict warnings). DD#8 is law, not preference.
2. **Tokens always.** Every color, radius, spacing and font value goes
   through `--sc-*` (or `--p-*` only inside §4 of sc-tokens.css). Raw
   hex / rgba in component SCSS is a bug.
3. **Buttons feel tactile.** Hover transitions ≤100ms; press is `scale(0.98)`
   with zero transition. The interface should respond instantly — fade-out
   on click reads as lag.
4. **Information is dense, not crowded.** 12–14px body, ~22px line-height,
   8/16/24/40 spacing scale. No oversized hero sections, no decorative
   icons-with-rounded-squares above headings.
5. **A11y is non-optional.** Visible `:focus-visible` outlines, `aria-live`
   on async surfaces (toasts, validation), Escape closes overlays,
   keyboard tab order matches visual order. Reduced-motion respected.

### Banned patterns (carry-over from /impeccable)
- `border-left: Npx solid <color>` (N>1) as a severity / accent stripe on
  cards, callouts, alerts, list rows. Use full borders, background tints,
  or no decoration at all.
- Gradient text (`background-clip: text` + `linear-gradient`).
- Pure `#000` / `#fff` — every neutral tints toward the brand hue via
  the gray scale already in `sc-tokens.css`.
- Default Inter / DM Sans / Plus Jakarta in places where Smart Contact's
  brand has already specified Inter (we keep Inter where the design system
  says Inter, but never default-reach to it without checking the tokens
  first).
