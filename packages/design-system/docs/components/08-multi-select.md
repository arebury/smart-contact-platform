# 08 · MultiSelect (`<sc-multi-select>`)

> **Type**: Extended · **AED uses**: 0 · **Figma parity**: 1:1 con Figma

> Dropdown multi-selección para formularios SC. Envuelve PrimeNG `<p-multiselect>` con la chrome SCDS. Hermano de `<sc-select>` — mismos tokens visuales, semántica diferente (array value).
>
> **Auditado 1:1 con Figma `Smart Contact Prime → ❖ MultiSelect` (canvas `6738:22651`) — Session 30.** 257 variants (ejes: Mode Basic/Chips + los mismos 8 de Select). Tokens `multiselect/*` IDÉNTICOS a `select/*`.

## TL;DR

```html
<sc-multi-select
  label="Canales"
  placeholder="Elige canales"
  [options]="channels"
  optionLabel="label"
  optionValue="code"
  display="chip"
  [(value)]="selectedCodes"
/>
```

## Cuándo usarlo

- Asignación múltiple (canales, roles, etiquetas, permisos).
- Filtros con múltiples valores simultáneos.
- AED hoy no lo usa nativamente (sin migración pendiente, ready-for-use).

## Cuándo NO usarlo

- Selección única → `<sc-select>`.
- Si el dominio tiene < 5 opciones y el usuario suele marcar la mayoría → considerar checkboxes inline (`<sc-tri-state-checkbox>` por opción).
- Tag input con creación libre de tags → `<sc-chips>` (TBD).

## API

```typescript
interface ScMultiSelectProps<T = unknown> {
  // Chrome (mirrors sc-select)
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  inputId?: string;
  name?: string;

  // Options
  options: readonly T[];
  optionLabel?: string;         // default 'label'
  optionValue?: string;

  // MultiSelect-specific
  display?: 'comma' | 'chip';   // default 'comma'
  filter?: boolean;
  filterBy?: string;
  showToggleAll?: boolean;      // default true
  selectionLimit?: number;
  maxSelectedLabels?: number;   // default 3 — tras este num, folds a "{0} seleccionados"
  selectedItemsLabel?: string;  // default '{0} seleccionados'
  showClear?: boolean;
  emptyFilterMessage?: string;
  emptyMessage?: string;
  filled?: boolean;

  // Value (array)
  value?: unknown[];            // model() — usar [(value)]="signal"
}
```

## Tokens consumidos (Figma → SC) — matriz exhaustiva

Tokens `multiselect/*` son **literalmente idénticos** a `select/*` (verificado side-by-side). Reuso del bridge formField completo + overrides específicos en sc-multi-select.scss.

### Default Normal — node `6220:7022`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `multiselect/padding/x` | `10.5` | preset `formField.paddingX` |
| `multiselect/padding/y` | `7` | preset `formField.paddingY` |
| `multiselect/border/radius` | `6` | `--sc-radius-200` |
| `multiselect/background` | `#ffffff` | `--sc-color-gray-0` |
| `multiselect/border/color` | `#cbd5e1` | `--sc-color-gray-300` |
| `multiselect/placeholder/color` | `#64748b` | `--sc-color-gray-500` |
| `multiselect/dropdown/color` | `#94a3b8` | `--sc-color-gray-400` |
| `multiselect/dropdown/width` | `35` | chevron área |
| `multiselect/shadow` | `#1212170D` offset(0,1) r2 | preset formField.shadow |

### Size = Small — node `7154:137768`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `multiselect/sm/font/size` | `12.25` | sc-multi-select.scss `.sc-multi-select--sm .p-multiselect-label` raw |
| `multiselect/sm/padding/x` | `8.75` | raw |
| `multiselect/sm/padding/y` | `5.25` | raw |

### Size = Large — node `7154:138077`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `multiselect/lg/font/size` | `15.75` | sc-multi-select.scss `.sc-multi-select--lg .p-multiselect-label` raw |
| `multiselect/lg/padding/x` | `12.25` | raw |
| `multiselect/lg/padding/y` | `8.75` | raw |

### Filled = True — node `6220:7054`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `multiselect/filled/background` | `#f8fafc` | `--sc-color-gray-50` via `.sc-multi-select--filled` |

### Invalid = True — node `6220:7085`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `multiselect/invalid/border/color` | `#f87171` (red-400) | `--sc-border-error` ✓ |
| `multiselect/invalid/placeholder/color` | `#dc2626` (red-600) | `--sc-text-danger` ✓ |

### Mode = Chips — node `174:6351`

Los chips dentro del input usan los mismos tokens base. La visualización (pills removibles con × cada uno) la maneja PrimeNG con su propio styling — no requiere override SC.

### Hover / Focus / Disabled

- Hover (`6220:7038`): preset CSS `hoverBorderColor: --sc-border-strong` (slate-400).
- Focus (`6220:7046`): preset CSS `focusBorderColor: --sc-bg-primary` (navy — brand divergence vs Figma azure).
- Disabled (`6220:7030`): `disabled/opacity: 60%` + preset chrome.

## Divergencias documentadas

- **Idéntico chrome a sc-select**: el patrón visual es 100% el mismo. Diferencia conceptual = un dropdown que puede tener 0+ valores en vez de 0/1.
- **Padding decimal** (10.5/7, 8.75/5.25, 12.25/8.75): heredado del preset.formField.
- **Focus border navy**: divergencia documentada (mismo trade-off que sc-inputtext/sc-select).
- **Mode=Chips vs comma**: ambos disponibles vía `[display]` prop. Default `comma`.
- **`Group=True`**: Figma muestra option groups. PrimeNG p-multiselect lo soporta nativamente con `[group]="true"` + `optionGroupLabel`. NO expuesto aún en el wrapper.

## Migración desde checkbox list o `<select multiple>`

**Antes** (patrón típico):
```html
<div class="field">
  <label class="field__label">Canales</label>
  <select multiple [value]="form().channels" (change)="onChannels($event)">
    <option *ngFor="let c of channels" [value]="c.code">{{ c.label }}</option>
  </select>
</div>
```

**Después**:
```html
<sc-multi-select
  label="Canales"
  [options]="channels"
  optionLabel="label"
  optionValue="code"
  display="chip"
  [(value)]="form().channels"
/>
```

## Página demo

`apps/ds-docs/src/app/pages/multi-select/multi-select-gallery.component.html` → ruta `/components/multi-select`.

## Figma reference

`Smart Contact Prime → ❖ MultiSelect` (canvas `6738:22651`). 257 variants total.
