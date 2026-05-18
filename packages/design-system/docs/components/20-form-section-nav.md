# 20 · Form Section Nav (`<sc-form-section-nav>`)

> **Type**: Pure SC · **AED uses**: 3 · **Figma parity**: Sin Figma equivalente

> Navegación tab-style controlada usada dentro de un form largo para conmutar entre **secciones**. El parent dueño de `[activeId]`, el nav emite `(activeChange)` al click. Cada sección se renderiza como pane independiente (no scroll), no como bloques apilados.
>
> Categoría ⚪ **Pure SC** — pattern in-house, similar a tabs verticales de Linear / Notion. NO confundir con `<p-tabs>` (que cubre pestañas horizontales clásicas).

## TL;DR

```html
<sc-form-section-nav
  [sections]="navSections()"
  [activeId]="activeSection()"
  [compact]="true"
  (activeChange)="activeSection.set($event)"
/>

<!-- Parent renderiza solo la sección activa: -->
@switch (activeSection()) {
  @case ('user-section-identity') {
    <sc-section-card anchorId="user-section-identity" ...>...</sc-section-card>
  }
  @case ('user-section-permissions') { ... }
}
```

## Cuándo usarlo

- Form pages largas con 3+ secciones lógicas (agents, groups, users).
- Necesitas que cada sección sea un pane **independiente** (no scroll lineal) — el usuario puede saltar sin scroll y la sticky-header se mantiene.
- Quieres que la sección actual sea route-stable (el ID se puede sincronizar con deep links si llega caso).

## Cuándo NO usarlo

- Form corto (<3 secciones) → flat, sin nav.
- Pestañas top-level de una página entera → `<p-tabs>` horizontal (jerarquía diferente).
- Sub-secciones dentro de una `<sc-section-card>` → no anidar; usar `<details>` o headings inline.

## Anatomía

```
┌────────────────────────┐
│  [icon] Identidad      │  ← link activo (bg tinted, current)
│  [icon] Grupos         │  ← link normal
│  [icon] Permisos       │
│  [icon] Avanzado       │
└────────────────────────┘
```

Aside vertical fijo a la izquierda del form body. En modo `[compact]`, sin outer card chrome.

## API

```typescript
interface FormNavSection {
  id: string;            // stable id usado por el parent
  labelKey: string;      // i18n key del label
  icon?: LucideIcon;     // opcional — leading icon
}

interface ScFormSectionNavProps {
  sections: readonly FormNavSection[];   // requerido
  activeId?: string | null;              // qué sección está activa
  labelKey?: string;                     // aria-label del nav, default 'common.form_nav.label'
  compact?: boolean;                     // default false — drops outer card chrome
}

// Output
(activeChange): EventEmitter<string>;
```

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-surface` | nav background (no-compact) |
| `--sc-bg-secondary-subtle` | link activo background |
| `--sc-border-default` | borde del nav (no-compact) |
| `--sc-text-secondary` | link inactive |
| `--sc-text-primary` | link activo |
| `--sc-spacing-100/200/300` | paddings + gaps |
| `--sc-radius-100/200` | radius del link + outer card |
| Icon size | 15px |
| Transition | 120ms ease |

## Decisiones de diseño SC

- **Controlled, no internal state**: el parent dueño de `activeId`. Esto permite que el parent decida el orden inicial (en `edit` mode user-form / group-form mueven "Identidad" al final del nav porque rara vez se toca después de crear).
- **`<a href="#">` con preventDefault**: el link es semánticamente un anchor (keyboard accessible nativo), pero el comportamiento es controlled — `preventDefault` evita scroll jump y delega la activación al parent.
- **`role="tab"` + `aria-current="true"`**: el lector anuncia "tab, current" sobre el link activo. Mejor que role="link" porque la metáfora es de tabs (no de navegación).
- **`[compact]` para embedding**: cuando el nav vive ya dentro de otra card / aside, el outer chrome de la propia nav causa doble-borde. `[compact]` lo quita.
- **NO scroll-spy automático**: el nav NO auto-detecta scroll. Las form pages SC usan **paneo (switch)**, no scroll — cuando el usuario clica una sección, solo esa sección se renderiza. Si en futuro se quiere scroll-spy, añadir `[scrollSpy]` prop y usar IntersectionObserver.

## A11y

- `<nav>` con `aria-label` traducible.
- `<a role="tab">` con `aria-current="true"` en el activo.
- Iconos con `aria-hidden="true"` (decorativos — el label ya tiene el contexto).
- Teclado: Tab navega entre links, Enter/Space activa (comportamiento nativo del `<a>`).

## Uso en AED

**3 instancias**:
- `agent-form-page` aside izquierdo.
- `user-form-page` aside izquierdo.
- `group-form-page` aside izquierdo.

Combinado con `<sc-section-card>` (`anchorId` matches `section.id`) + `<sc-sticky-form-header>` forma el patrón canónico de form largo SC.

## Página demo

Pendiente — gallery `/components/form-section-nav` con basic, sin icons, compact, dark mode.

## Figma reference

**No aplica** — pattern in-house. Visual similar a tabs verticales de Linear / Notion settings. Si se modela en Figma, anotar.
