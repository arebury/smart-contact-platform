# 04 · Select (`<sc-select>`)

> Dropdown / single-select para formularios SC. Envuelve PrimeNG `<p-select>` con la chrome SCDS. Para multi-select usar `<sc-multi-select>` (TBD).
>
> **Auditado 1:1 con Figma `Smart Contact Prime → ❖ Select` (canvas `6738:22642`) — Session 30.** 258 variants en Figma (8 ejes: State / Invalid / Disabled / Filled / Size / IftaLabel / FloatLabel / FloatLabelVariant / Group). Tokens extraídos vía MCP en cada variant clave.

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

## Tokens consumidos (Figma → SC) — matriz exhaustiva por variant

Auditado Session 30. Tokens verificados vía MCP en cada variant del Figma `Smart Contact Prime → ❖ Select` (canvas `6738:22642`).

### Default Normal — node `6195:7753`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `select/padding/x` | `10.5` | preset `formField.paddingX` (raw) |
| `select/padding/y` | `7` | preset `formField.paddingY` (raw) |
| `select/border/radius` | `6` | `--sc-radius-200` |
| `select/background` | `#ffffff` | `--sc-color-gray-0` |
| `select/border/color` | `#cbd5e1` | `--sc-color-gray-300` (slate) |
| `select/placeholder/color` | `#64748b` | `--sc-color-gray-500` |
| `select/dropdown/color` | `#94a3b8` | `--sc-color-gray-400` (chevron) |
| `select/dropdown/width` | `35` | área click chevron |
| `select/shadow` | `#1212170D` offset(0,1) r2 | preset formField.shadow |
| `icon/size` | `14` | chevron 14×14 |

### Size = Small — node `7154:136752`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `select/sm/font/size` | `12.25` | sc-select.scss `.sc-select--sm .p-select-label` raw |
| `select/sm/padding/x` | `8.75` | raw |
| `select/sm/padding/y` | `5.25` | raw |

### Size = Large — node `7154:137061`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `select/lg/font/size` | `15.75` | sc-select.scss `.sc-select--lg .p-select-label` raw |
| `select/lg/padding/x` | `12.25` | raw |
| `select/lg/padding/y` | `8.75` | raw |

### Filled = True — node `6195:7785`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `select/filled/background` | `#f8fafc` | `--sc-color-gray-50` via `.sc-select--filled` |
| (border, padding, shadow, chevron) | iguales que Default | hereda preset |

### Invalid = True — node `6195:7816`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `select/invalid/border/color` | `#f87171` (red-400) | `--sc-border-error` ✓ ya alineado |
| `select/invalid/placeholder/color` | `#dc2626` (red-600) | `--sc-text-danger` ✓ ya alineado |

### Hover / Focus / Disabled

- **Hover (`6195:7769`)**: preset CSS `hoverBorderColor: --sc-border-strong` (slate-400).
- **Focus (`6195:7777`)**: preset CSS `focusBorderColor: --sc-bg-primary` (SC navy). Figma muestra azure `#3b82f6` — divergencia de brand documentada (mismo trade-off que sc-input).
- **Disabled (`6195:7761`)**: `disabled/opacity: 60%` (token global) + chrome del preset.

## Divergencias documentadas

- **Padding decimal (10.5/7, 8.75/5.25, 12.25/8.75)**: heredado del preset.formField. Compartido con sc-input / sc-datepicker.
- **Focus border color**: preset usa SC navy en vez del azure Figma (focus ring electric-blue suple el accent).
- **Ifta Label / Float Label variants**: 4 valores × 2 booleanos en Figma. NO implementados como props del `<sc-select>`. Composición Float Label = `<p-floatlabel>` por fuera, igual que con sc-input.
- **Group=True (option groups)**: Figma muestra group headers. PrimeNG p-select lo soporta nativamente con `[group]="true"` + `optionGroupLabel`. NO expuesto aún en el wrapper — añadir cuando aparezca caso real.

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
