# 04 · Select (`<sc-select>`)

> Dropdown / single-select para formularios SC. Envuelve PrimeNG `<p-select>` con la chrome SCDS. Para multi-select usar `<sc-multi-select>` (TBD).

## TL;DR

```html
<sc-select
  label="Ciudad"
  placeholder="Elige ciudad"
  [options]="cities"
  optionLabel="label"
  optionValue="code"
  [(value)]="cityCode"
/>
```

## Cuándo usarlo

- Selección entre opciones predefinidas (3+ items).
- Reemplaza los `<select>` nativos repartidos por los forms de AED (20+ en agent-form, group-form, config pages).
- Para 2 opciones, considera `<sc-toggle-switch>` o radios.
- Para opciones con búsqueda obligatoria (50+ items), añade `[filter]="true"`.

## Cuándo NO usarlo

- Multi-selección → `<sc-multi-select>` (TBD).
- Autocomplete con sugerencias remotas → `<sc-autocomplete>` (TBD).
- Selección visual (colores, avatars) → `<sc-color-dot-picker>` o componente específico.
- Selección como navegación → `<sc-tabs>` o `<sc-segmented>`.

## API

```typescript
interface ScSelectProps<T = unknown> {
  // Chrome (mirrors sc-input)
  size?: 'sm' | 'md' | 'lg';   // default 'md'
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  inputId?: string;             // auto: 'sc-select-N'
  name?: string;

  // Options
  options: readonly T[];
  optionLabel?: string;         // default 'label'
  optionValue?: string;         // si unset, bindea el objeto entero

  // Extras
  showClear?: boolean;          // muestra "×" para limpiar selección
  filter?: boolean;             // habilita búsqueda dentro del dropdown
  filterBy?: string;            // campos a buscar, ej. 'label,region'
  emptyFilterMessage?: string;  // copy cuando filter no devuelve nada
  emptyMessage?: string;        // copy cuando options está vacío

  // Two-way binding
  value?: unknown;              // model() — usar [(value)]="signal"
  // o ngModel via ControlValueAccessor
  // o formControl via ReactiveForms
}
```

## Tipos de opciones

### a) String[] — el caso más simple

```html
<sc-select label="Fruta" [options]="['Manzana', 'Pera']" [(value)]="fruit" />
```

`fruit` es `string | undefined`.

### b) Objetos + `optionValue` — guarda solo una propiedad

```typescript
cities = [
  { label: 'Madrid', code: 'MAD' },
  { label: 'Barcelona', code: 'BCN' },
];
cityCode = signal<string | undefined>('MAD');
```

```html
<sc-select [options]="cities" optionLabel="label" optionValue="code" [(value)]="cityCode" />
```

`cityCode` es `string | undefined` (= el código).

### c) Objetos sin `optionValue` — bindea el objeto entero

```html
<sc-select [options]="cities" optionLabel="label" [(value)]="cityObj" />
```

`cityObj` es `{ label, code } | undefined`. Útil si necesitas más que el id.

## Estados visuales (de Figma)

| Estado | Trigger | Visual |
|--------|---------|--------|
| Default | — | border slate-300, shadow sutil |
| Hover | mouseover | border más oscuro |
| Focus | tab / click | border primary + focus ring |
| Disabled | `[disabled]="true"` | bg disabled, cursor not-allowed |
| Invalid | `[error]="..."` o FormControl invalid+touched | border danger |
| Filled (con valor) | usuario seleccionó | texto slate-700 en lugar de placeholder slate-500 |

## Tokens consumidos (Figma → tokens SC)

- `--p-select-border-color` ← `--sc-color-gray-300` (= `#cbd5e1`)
- `--p-select-background` ← `--sc-color-gray-0` (= `#ffffff`)
- `--p-select-border-radius` ← `--sc-radius-200` (= `6px`)
- `--p-select-padding-x/y` ← `10.5px / 7px` (Figma)
- `--p-select-shadow` ← drop-shadow `#1212170D` offset (0,1) radius 2
- Chevron 14px slate-400, dropdown area 35px wide
- Label `--sc-text-secondary` (slate-700), 14px Inter
- Helper `--sc-text-secondary`, 12px

## Migración desde `<select>` nativo

**Antes** (patrón típico en AED):

```html
<div class="field">
  <label class="field__label" for="city">Ciudad</label>
  <select id="city" class="field__select" [value]="form().city" (change)="onCity($event)">
    @for (c of cities; track c.code) {
      <option [value]="c.code">{{ c.label }}</option>
    }
  </select>
  <span class="field__help">Elige la ciudad del agente.</span>
</div>
```

**Después**:

```html
<sc-select
  label="Ciudad"
  [options]="cities"
  optionLabel="label"
  optionValue="code"
  helperText="Elige la ciudad del agente."
  [(value)]="form().city"
/>
```

Se eliminan: el wrapper `.field`, el `<option>` loop manual, y el handler `(change)` con conversión.

## Página demo

`apps/ds-docs/src/app/pages/select/select-gallery.component.html` → ruta `/components/select`.

## Figma reference

`Smart Contact Prime → ❖ Select` (node `6738:22642`). Frame `Parts` arriba (label/placeholder/text), `select-input` debajo con la matriz de estados.
