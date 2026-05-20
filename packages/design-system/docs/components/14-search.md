# 14 · Search (`<sc-search>`)

> **Type**: Extended · **AED uses**: 8 · **Figma parity**: 1:1 con Figma

> Input de búsqueda con icon overlay decorativo a la izquierda + clear
> button automático + opcional shortcut hint (`⌘K`, `/`). Replica el
> patrón `.page__search` que vivía duplicado en 6 SCSS distintos de AED
> list-pages, ahora unificado en un componente del DS.

## TL;DR

```html
<sc-search
  [(value)]="searchQuery"
  placeholder="Buscar agente…"
  shortcutHint="⌘K"
  (keydown)="onSearchKey($event)"
/>
```

## Cuándo usarlo

- **Toolbar de lista** (agents/groups/labels/templates/repos): icon search
  a la izquierda + input + ⌘K hint cuando vacío + × cuando hay texto.
- **Picker dentro de formulario** (agendas, plantillas en agent-form):
  icon search + input + × cuando hay texto (sin ⌘K hint porque vive
  dentro de un sub-section, no es atajo global).
- **Filter dropdown header**: misma chrome embebida en menús de filtro.

## Cuándo NO usarlo

- Para input de texto regular (formulario) → `<sc-inputtext>` con `[label]`,
  `[helperText]`, `[error]`.
- Para input + addon button con border merge (ej. "+ Añadir") →
  `<p-inputgroup>` directo + `<sc-inputtext>` dentro (caso del tag-input en
  aed-servicio).
- Para input numérico → `<sc-input-number>`.

## API

```typescript
interface ScSearchProps {
  // Visual
  size?: 'sm' | 'md' | 'lg';     // default 'md'
  placeholder?: string;
  filled?: boolean;               // variant slate-50 bg (alineado con sc-inputtext)
  disabled?: boolean;

  // HTML
  inputId?: string;               // auto: 'sc-search-N'
  name?: string;
  autoFocus?: boolean;

  // Search-specific
  showClear?: boolean;            // default true — botón × cuando hay texto
  shortcutHint?: string;          // ej. '⌘K' o '/' — visible cuando vacío + sin foco
  clearAriaLabel?: string;        // default 'Clear search' — pasar i18n key resuelto

  // Two-way binding
  value?: string;                  // model() — [(value)]="signal"
  // o ngModel via ControlValueAccessor
  // o formControl via ReactiveForms
}
```

## Outputs

| Output | Tipo | Cuándo |
|--------|------|--------|
| `valueChange` | `string` | Auto-emit del model (every keystroke + clear). |
| `keydown` | `KeyboardEvent` | Re-emit del keydown del input. Útil para que el consumer maneje Esc/Enter sin tener que envolver el `<sc-search>` en un wrapper con `(keydown)`. |

## Public API (TS)

| Método | Descripción |
|--------|-------------|
| `focus()` | Enfoca el `<input>` interno. Útil para atajos globales del consumer (ej. el `⌘K` listener del shell focusea el search). |

## Composición interna

```
<p-iconfield iconPosition="left">
  <p-inputicon><lucide-icon Search /></p-inputicon>
  <input pInputText type="search" ... />
  @if (showClear && value) {
    <button class="sc-search__clear">×</button>
  } @else if (shortcutHint && !value) {
    <kbd class="sc-search__kbd">⌘K</kbd>
  }
</p-iconfield>
```

Compone PrimeNG nativo (`<p-iconfield>` + `<p-inputicon>` + `pInputText`
directive) — siguiendo regla anti-divergencia #1 del customs-catalog
(`¿PrimeNG ya lo expone?`). El `IconField` es el patrón nativo PrimeNG
para inputs con icon overlay decorativo (vs `InputGroup` que es para
addons con border merge — distinta semántica).

## Estados visuales

| Estado | Trigger | Visual |
|--------|---------|--------|
| Default | — | border slate-300, icon search slate-400 |
| Hover | mouseover | border strong (heredado de sc-preset.formField) |
| Focus | tab / click | border primary + focus ring electric-blue |
| Filled (con texto) | `value !== ''` | clear button × visible derecha; kbd hint oculto |
| Empty + hint | `value === '' && shortcutHint` | kbd hint visible derecha (`⌘K`) |
| Empty + focus | input focused | kbd hint desaparece (`opacity: 0`) |
| Disabled | `[disabled]="true"` | bg disabled, clear button inerte |

## Tokens consumidos

Hereda de `sc-preset.ts → semantic.formField.*` (border, radius, padding,
focus ring) — mismo bridge que `sc-inputtext`. NO redefine tokens propios.

Específicos del componente:
- `--sc-spacing-200/150` — padding right reservado para clear/kbd slot.
- `--sc-bg-elevated` — fondo del kbd hint.
- `--sc-text-subtle` — color del kbd + icon search.
- `--sc-color-electric-blue-500` — focus ring del clear button.
- `--sc-font-family-mono` — kbd hint typography.

## Divergencias documentadas

- **No tiene chrome de formField completo** (label / helper / error /
  required asterisk). Decisión consciente: search bars en AED viven en
  toolbars / pickers donde el label es contextual (header de la página
  ya dice "Agentes" → el search no necesita label "Buscar"). Si llega
  caso de search dentro de un formulario que requiera label/error,
  usar `<sc-inputtext type="search">` directo con `[leftIcon]` cuando
  exista `sc-input-group` (gap §5.1 customs-catalog).
- **shortcutHint desaparece al focus**: no es prop, es comportamiento
  hardcoded. Patrón GitHub / Linear / Slack. Si llegara caso de "hint
  siempre visible", añadir `[hintAlwaysVisible]` prop (no urgente).
- **Type fijo `search`** del native input: aprovecha autocomplete=off
  + Esc behavior nativo del browser. NO exponer `type` como prop —
  divergiría del componente target.

## Patrones de uso

### List page toolbar (con ⌘K hint global)

```html
<header class="page__head">
  <sc-page-header title="Agentes" />
  <sc-search
    [(value)]="searchQuery"
    [placeholder]="'agents.search_placeholder' | translate"
    shortcutHint="⌘K"
    [clearAriaLabel]="'labels.clear_search' | translate"
    (keydown)="onSearchKey($event)"
  />
</header>
```

### Picker dentro de sub-section (sin atajo global)

```html
<sc-search
  size="sm"
  [(value)]="scheduleSearch"
  [placeholder]="'agents.form.advanced.agendas.search_placeholder' | translate"
  [clearAriaLabel]="'common.search_clear' | translate"
/>
```

### Atajo global focusea el search (TS)

```typescript
@HostListener('document:keydown', ['$event'])
onShortcut(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    this.searchRef()?.focus();
  }
}
```

```html
<sc-search #searchRef ... />
```

## Migración desde `.page__search` legacy (AED)

**Antes** (chrome duplicado en 6 SCSS distintos):

```html
<div class="page__search">
  <lucide-icon class="page__search-icon" [img]="searchIcon" [size]="14" />
  <input
    type="text"
    class="page__search-input"
    [placeholder]="..."
    [value]="searchQuery()"
    (input)="searchQuery.set($any($event.target).value)"
    (keydown)="onSearchKey($event)"
  />
  @if (searchQuery()) {
    <button class="page__search-clear" (click)="searchQuery.set('')">×</button>
  } @else {
    <kbd class="page__search-kbd">⌘K</kbd>
  }
</div>
```

**Después**:

```html
<sc-search
  [(value)]="searchQuery"
  [placeholder]="'...' | translate"
  shortcutHint="⌘K"
  (keydown)="onSearchKey($event)"
/>
```

Limpiar `.page__search*` del SCSS local (movido al componente SC).

## Página demo

`apps/ds-docs/src/app/pages/search/search-gallery.component.html` →
ruta `/components/search` en ds-docs.

## Figma reference

Página dedicada `❖ Search` en Smart Contact Prime UI Kit Pro:
[`node-id=11861-55210`](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=11861-55210).

**Estado al cierre Session 31**: la página existe vacía, pendiente de que
Marta la complete con los variants. Mientras tanto, los building blocks
del Kit (`❖ InputText` + `❖ IconField` + `❖ InputIcon`) cubren la
composición — Marta puede arrastrarlos hasta que tenga ratio para
crear el componente dedicado.

**Variants a documentar en Figma** (siguiendo el spec del código):

| Variant | Slots | AED usage |
|---------|-------|-----------|
| `Idle empty` | icon-left + input + kbd hint | list-pages (cuando vacío + sin foco) |
| `Filled` | icon-left + input + clear (×) | list-pages cuando hay texto, pickers cuando hay texto |
| `Focused empty` | icon-left + input + (sin hint, sin clear) | cualquier consumer en foco sin texto |
| `Size sm` | mismo shape, font 12.25 / padding decimal | pickers dentro de sub-sections |

Cuando Marta complete la página Figma, actualizar este spec doc con
los node-ids puntuales de cada variant y los boundVariables de cada
slot.
