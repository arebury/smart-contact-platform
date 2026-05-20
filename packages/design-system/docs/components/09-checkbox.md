# 09 · Checkbox (`<sc-checkbox>`)

> **Type**: Pure SC · **AED uses**: 6 · **Figma parity**: 1:1 con Figma

> Checkbox custom de SC con soporte tri-state (none / some / all). El selector es `sc-checkbox` por razón histórica — ES el checkbox de facto en AED (6 usos), no hay otro componente checkbox.
>
> **Auditado 1:1 con Figma `Smart Contact Prime → ❖ Checkbox` (canvas `6738:22640`) — Session 30.** 60 variants Figma (ejes: Hover / Selected / Focus / Disabled / Filled / Size). El estado `'some'` (indeterminate) es una **extensión SC**, no existe en Figma.

## TL;DR

```html
<sc-checkbox
  [state]="checkboxState"
  (cycle)="onToggle($event)"
>
  Etiqueta del checkbox
</sc-checkbox>
```

## Cuándo usarlo

- Selección binaria simple (true / false) en formularios o filtros.
- Header de tabla para "select all" con estado mixto (none / some / all).
- Toggle de feature flags o settings booleanos.

## Cuándo NO usarlo

- Selección entre múltiples opciones excluyentes → radios o `<sc-select>`.
- Toggle prominente (acciones, not selection) → `<sc-toggleswitch>`.

## API

```typescript
interface ScCheckboxProps {
  state: 'none' | 'some' | 'all';   // requerido
  disabled?: boolean;
  ariaLabel?: string | null;
  size?: 'sm' | 'md' | 'lg';        // default 'md' (17.5px)
  filled?: boolean;                  // bg slate-50 cuando unchecked
  // Output
  cycle: (next: boolean) => void;   // se llama al click; emite el next intended state
}
```

### Cycle behavior

| state actual | Click → emite | Razón |
|--------------|---------------|-------|
| `none` | `true` (= "select all") | el usuario quiere marcar |
| `all` | `false` (= "clear") | el usuario quiere desmarcar |
| `some` | `false` (= "clear") | mixto → primer click limpia |

El componente NUNCA emite `'some'`. El consumer mantiene su propio estado tri-state y se lo pasa al input.

## Tokens consumidos (Figma → SC) — matriz exhaustiva

Verificados Session 30 vía MCP.

### Default Normal (idle, unchecked) — node `148:6319`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `checkbox/width` | `17.5` | `.tri-checkbox__box` raw |
| `checkbox/height` | `17.5` | raw |
| `checkbox/border/radius` | `4` | raw (off-scale `--sc-radius-*`) |
| `checkbox/background` | `#ffffff` | `--sc-bg-surface` |
| `checkbox/border/color` | `#cbd5e1` (slate-300) | `--sc-border-default` |
| Border width | `1px` | raw |

### Selected (checked) — node `148:6324`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `checkbox/checked/background` | `#3b82f6` (azure = Aura primary) | **`--sc-bg-primary` (navy)** — brand divergence |
| `checkbox/checked/border/color` | `#3b82f6` | **`--sc-bg-primary` (navy)** |
| `checkbox/icon/checked/color` | `#ffffff` | `--sc-color-gray-0` |
| `checkbox/icon/size` | `12.25` | `.tri-checkbox__mark` raw |

### Size = Small — node `7154:140007`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `checkbox/sm/width` | `14` | `.tri-checkbox--sm .tri-checkbox__box` raw |
| `checkbox/sm/height` | `14` | raw |
| `app/sm/font/size` | `12.25` | label font-size sm |
| `app/sm/line/height` | `17.5` | label line-height sm |
| Icon size (proporcional 70%) | `9.8` | raw |

### Size = Large — node `7154:140599`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `checkbox/lg/width` | `21` | `.tri-checkbox--lg .tri-checkbox__box` raw |
| `checkbox/lg/height` | `21` | raw |
| `app/lg/font/size` | `15.75` | label font-size lg |
| `app/lg/line/height` | `24.5` | label line-height lg |
| Icon size (proporcional 70%) | `14.7` | raw |

### Filled = True — node `5801:52774`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `checkbox/filled/background` | `#f8fafc` (slate-50) | `--sc-color-gray-50` via `.tri-checkbox--filled .tri-checkbox__box` |

### Estados sin Figma variant

- **Hover (Hover=True nodes)**: Figma muestra hover idle/checked. SC delega al browser default + el preset (sin override propio). Si se quiere un hover marcado más fuerte, añadir después.
- **Focus (Focus=True nodes)**: SC pinta `outline: 2px solid var(--sc-color-electric-blue-500)` con `offset 2`. Coincide con focus ring genérico SC. Figma usa azure outline; SC usa electric-blue (más vibrante).
- **Disabled (Disabled=True nodes)**: SC aplica `opacity: 0.6` (matches Figma `disabled/opacity: 60%`).
- **Indeterminate**: NO existe en Figma como variant. SC custom — mismo bg que checked + barra horizontal en lugar de ✓.

## Brand divergences

- **Checked color**: Figma `#3b82f6` (azure = Aura primary). SC override a `--sc-bg-primary` (navy-500). Mismo trade-off documentado en button[severity=primary], tabs[active], select[focus]. **Decisión Session 30**: alineado a navy-500 (antes era blue-700 más oscuro).
- **Focus outline**: SC usa electric-blue en lugar del azure de Figma. Coherente con el resto del DS (focusRing del preset).
- **Indeterminate**: extensión SC. Aprovecha estilo "checked" + bar horizontal. Figma no lo modela.

## Migración / patrones AED actuales

AED tiene 6 usos:
- `aed-agentes-page.component.html` (2× bulk-select)
- `agent-form-page.component.html` (3× checkboxes individuales)
- `agent-channel-table.component.html` (1× bulk-select)

Ninguno necesita cambio — el API (`state` + `cycle`) se mantiene. El cambio Session 30 es solo visual:
- Tamaño box: 18×18 → 17.5×17.5
- Border color: slate-400 (strong) → slate-300 (default)
- Border width: 1.5 → 1
- Checked bg: blue-700 → blue-500 (--sc-bg-primary)

Diff visible al ojo: el checkbox marcado va a verse ligeramente menos oscuro (azul medio vs azul muy oscuro), bordes 0.5px más finos.

## Página demo

Aún no hay página dedicada. Cuando esté, irá en `apps/ds-docs/src/app/pages/checkbox/`. **TODO Session 31**: crear gallery `/components/checkbox` con basic, sizes, filled, disabled, tri-state.

## Figma reference

`Smart Contact Prime → ❖ Checkbox` (canvas `6738:22640`). 60 variants total.
