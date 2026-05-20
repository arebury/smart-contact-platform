# 13 · Section Card (`<sc-section-card>`)

> **Type**: Pure SC · **AED uses**: 12 · **Figma parity**: Sin Figma equivalente

> Tarjeta con borde + header opcional usada para **agrupar campos** dentro de un formulario (configuración, edición de entidad). Mirror del patrón `SectionCard` del prototipo React. Soporta modo `collapsible` para secciones "advanced" que deberían estar plegadas por defecto.
>
> Categoría ⚪ **Pure SC** — patrón app-specific, NO existe en el Smart Contact Prime kit ni en PrimeOne. Inspiración: form sections de Linear / Notion / Stripe.

## TL;DR

```html
<sc-section-card
  titleKey="agents.form.section.contact"
  hintKey="agents.form.section.contact_hint"
  anchorId="agent-section-contact"
  [icon]="userIcon"
>
  <!-- body slot: any fields -->
  <sc-inputtext label="Email" type="email" [(value)]="email" />
  <sc-inputtext label="Teléfono" type="tel" [(value)]="phone" />
</sc-section-card>
```

## Cuándo usarlo

- Agrupar **5+ campos relacionados** en un form largo (agent / group / user / config pages).
- Crear secciones identificables que `<sc-form-section-nav>` pueda scroll-spy + jump-to.
- Esconder "advanced settings" tras un toggle (`[collapsible][initiallyCollapsed]`).

## Cuándo NO usarlo

- Form corto (<5 fields) sin necesidad de agrupar → flat `<form>`.
- Vista de lectura (no editable) → componente distinto (TBD `<sc-info-card>` o similar).
- Sub-secciones dentro del mismo grupo → no anidar `<sc-section-card>`; usar headings inline.

## Anatomía

```
┌──────────────────────────────────────────────┐
│ [icon] Contacto                  Opcional    │  ← head: icon + title + hint
├──────────────────────────────────────────────┤
│                                              │
│  <ng-content> — campos / contenido           │  ← body slot
│                                              │
└──────────────────────────────────────────────┘
```

Modo `collapsible`:

```
┌──────────────────────────────────────────────┐
│ [icon] Ajustes avanzados              v      │  ← head as button + chevron
└──────────────────────────────────────────────┘
                                                  ← body collapsed
```

Border subtle, radius medium, sombra suave (Linear/Stripe vibe).

## API

```typescript
interface ScSectionCardProps {
  titleKey: string;                  // requerido — clave i18n del título
  hintKey?: string | null;           // opcional — clave i18n de descripción/hint
  anchorId?: string | null;          // opcional — para scroll-spy de form-section-nav
  icon?: LucideIcon | null;          // opcional — icono leading del header
  collapsible?: boolean;             // default false — header se convierte en toggle
  initiallyCollapsed?: boolean;      // default false — solo aplica si collapsible
}
```

## Body slot

Free projection (`<ng-content>`). Pinta cualquier markup dentro: campos `<sc-inputtext>`, `<sc-select>`, grids con `.grid--2`, etc.

```html
<sc-section-card titleKey="agents.form.section.identity">
  <div class="grid grid--2">
    <sc-inputtext label="Nombre" [(value)]="name" />
    <sc-inputtext label="DNI" [(value)]="dni" />
  </div>
  <sc-inputtext label="Email" type="email" [(value)]="email" />
  <sc-select label="Idioma" [options]="langs" optionLabel="label" optionValue="code" [(value)]="lang" />
</sc-section-card>
```

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-surface` | fondo de la card |
| `--sc-border-default` | borde de la card |
| `--sc-border-subtle` | divider header / body |
| `--sc-radius-300` | border-radius (8px) |
| `--sc-shadow-card` | sombra de elevación |
| `--sc-spacing-300/400` | paddings header / body |
| `--sc-spacing-200` | gap entre icon / title / hint |
| `--sc-spacing-400` | margin-bottom entre sections consecutivas |
| `--sc-text-primary` | title color |
| `--sc-text-secondary` | hint color |
| `--sc-form-anchor-offset` | scroll-margin-top para anchor jumps (default 80px) |
| Transitions: `--sc-transition-fast` (120ms) | border + shadow hover |
| Icon size | 16px (consistent con form labels) |
| Chevron size (collapsible) | 16px |

## Modos

### Default (siempre abierto)

```html
<sc-section-card titleKey="..." [icon]="...">
  <!-- fields -->
</sc-section-card>
```

### Collapsible (toggleable)

```html
<sc-section-card
  titleKey="agents.form.section.advanced"
  hintKey="agents.form.section.advanced_hint"
  [icon]="settingsIcon"
  [collapsible]="true"
  [initiallyCollapsed]="true"
>
  <!-- advanced fields hidden initially -->
</sc-section-card>
```

El usuario puede expandir/colapsar manualmente; el user-toggle gana sobre `initiallyCollapsed` para la sesión actual.

### Anchor (form-section-nav scroll-spy)

```html
<sc-section-card anchorId="agent-section-contact" titleKey="...">
  <!-- this section is scrollable from sc-form-section-nav links -->
</sc-section-card>
```

El `anchorId` se expone como `[id]` y `[data-section-anchor]` para que `<sc-form-section-nav>` lo encuentre y haga scroll smooth con offset (`--sc-form-anchor-offset` cubre la sticky header).

## Accesibilidad

- En modo `collapsible`: el `<header>` es un `<button>` real con `aria-expanded`.
- Title como `<h2>` (heading semántico) — los lectores de pantalla pueden saltar entre secciones via navegación por headings.
- Body sin role específico; el contenido proyectado mantiene su propia semántica (form, inputs, etc.).

## Decisiones de diseño SC

- **Sin "tinted strip" en el header**: forma anterior tenía el header con bg color distinto al body. Refactor reciente lo quitó — la tipografía + un divider sutil son suficientes para jerarquía (más Linear / less Bootstrap).
- **Card no anidable**: poner `<sc-section-card>` dentro de otro NO es soportado. Para sub-secciones, usar headings inline o un componente diferente.
- **Chevron only en collapsible**: en modo default, NO se renderiza chevron — el card está siempre abierto.
- **scroll-margin-top con var**: permite a `<sc-form-section-nav>` ajustar el offset según la sticky header dinámica de cada feature.

## Uso en AED

Usado en TODAS las form pages largas:
- `agent-form-page` (Identidad / Contacto / Grupos / Canales / Permisos / Avanzado)
- `group-form-page` (Identidad / Agentes / Capacidad / Avanzado)
- `user-form-page` (similar)
- `aed-*-page` (config pages)

Combinado con `<sc-form-section-nav>` y `<sc-sticky-form-header>` forma el patrón canónico de formulario largo SC.

## Página demo

Pendiente Session 31 — gallery `/components/section-card` con basic, con hint, collapsible, anchor (mostrando link a `<sc-form-section-nav>`).

## Figma reference

**No aplica** — pattern in-house de SC. Si el equipo de diseño lo modela en Smart Contact Prime, anotar URL y promocionar a 🟢 Extended con audit.
