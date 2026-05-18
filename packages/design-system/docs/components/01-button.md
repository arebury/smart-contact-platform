# 01 · Button (`<p-button>`)

> **Type**: Custom-preset · **AED uses**: 38 · **Figma parity**: 1:1 con Figma

> Botón de acción. SCDS NO envuelve PrimeNG aquí — usa `<p-button>` directo con overrides en `sc-preset.ts`. Categoría 🟣 **Custom-preset**.
>
> **Auditado 1:1 con Figma `Smart Contact Prime → ❖ Button` (canvas `6738:49717`) — Session 30.** 1965 variants en Figma (9 ejes: Severity / State / Disabled / Icon Only / Raised / Rounded / Text / Outlined / Link). Tokens extraídos vía MCP en nodos canónicos por severity y por variant flag.

## TL;DR

```html
<p-button label="Guardar" />
<p-button label="Cancelar" severity="secondary" />
<p-button label="Borrar" severity="danger" icon="pi pi-trash" />
<p-button severity="info" icon="pi pi-info" rounded />
```

Importar:

```typescript
import { ButtonModule } from 'primeng/button';
```

## Cuándo usarlo

- CTA principal de una pantalla / form / modal.
- Acciones secundarias (cancel, dismiss, alt path).
- Toolbar icon-only buttons.
- Botones de filtros / chips de acción.

## Cuándo NO usarlo

- Para navegación entre pantallas → usar `<a routerLink>` o `<sc-tabs>`.
- Para acción inline en una celda de tabla → `<sc-inline-rename-cell>` u otro especializado.
- Para "guardar inline" en un campo → patrón propio (sticky-form-header).

## Severities (matriz colores Figma → SC)

Tabla 1:1 verificada vía Figma MCP. Mostramos background del idle state — hover/active heredados de Aura.

| Severity | Figma bg | Figma node | SC mapping | Notas |
|----------|----------|------------|------------|-------|
| `primary` | `#3b82f6` (azure-500) | `10:124` | **`--sc-color-blue-500`** (navy) | **Brand divergence**: SC primary = navy (brand identity); Figma muestra azure (Aura default). Override en `sc-preset.semantic.primary`. |
| `secondary` | `#f1f5f9` (slate-100) bg, `#475569` (slate-600) text | `10:126` | iguales (heredado de `--sc-color-gray-*` post Fase 1 audit) | ✓ aligned |
| `success` | `#22c55e` (green-500) | `10:128` | `--sc-color-green-500` (`#22c55e`) | ✓ aligned |
| `info` | `#0ea5e9` (sky-500) | `10:130` | **`--sc-color-electric-blue-500`** (`#1464fe`) | **Brand divergence**: SC info = electric-blue. Override en `sc-preset.primitive.sky → electric-blue` (línea 108-120). Documentado: "info button matches AED's info treatment (Message, Toast, etc.)". |
| `warn` | `#f97316` (orange-500) | `10:132` | **`--sc-color-amber-500`** (`#f59e0b`) | **Brand divergence**: SC warn = amber (matches Message/Toast warn). Override en `sc-preset.primitive.orange → amber` (línea 132-144). |
| `help` | `#a855f7` (purple-500) | `10:134` | `--sc-color-purple-500` (`#a855f7`) | ✓ aligned (mismo hex) |
| `danger` | `#ef4444` (red-500) | `10:138` | `--sc-color-red-500` (`#ef4444`) | ✓ aligned |
| `contrast` | (variable) | `6846:8539` | hereda Aura defaults | invertido según mode (oscuro en light, claro en dark) |
| `plain` | transparent / outlined | n/a | hereda Aura defaults | rarely used in AED |

## Visual tokens base (común a todas las severities)

Extraídos de los nodos arriba. Idénticos en todas las variants Solid:

| Token Figma | Valor | Notas |
|-------------|-------|-------|
| `button/padding/x` | `10.5` | matches `--p-button-padding-x` ← preset.formField.paddingX |
| `button/padding/y` | `7` | matches `--p-button-padding-y` ← preset.formField.paddingY |
| `button/border/radius` | `6` | `--sc-radius-200` |
| `button/label/font/weight` | `500` | medium |
| `app/font/size` | `14` | `--sc-font-size-200` |
| `button/gap` | `7` | gap icon-label |

## Variant flags

### `[outlined]` — node `11:3201` (Primary outlined)

- `button/outlined/primary/color`: `#3b82f6` (text azure)
- `button/outlined/primary/border/color`: `#bfdbfe` (azure-200) — borde tenue
- Background transparent
- Mismas paddings/radius/weight/gap

Análogamente para outlined-secondary/success/info/warn/help/danger/contrast (no extraídos uno-por-uno, pero el patrón es texto = severity-500, border = severity-200, bg transparent).

### `[text]` — node `11:2234`

- Color: severity-500
- Sin border, sin background
- Mismas paddings

### `[link]` — node `4452:50769`

- Color: severity-500
- Sin border, sin background, sin padding chrome
- Underline en hover

### `[rounded]` — node `11:1331`

- Mismas medidas que Solid pero border-radius = `28` (token Figma `button/rounded/border/radius`)
- Útil para botones-pill (chip-like)

### `[raised]` — node `11:799`

- Mismas medidas que Solid + drop shadow
- Aura aplica un shadow extra al Solid

### `[icon]` only — Figma axis `Icon Only=True`

- Sin label
- Width = `button/icon/only/width` = 35px (cuadrado)

## Brand divergences (consolidadas)

| Severity | Figma | SC | Razón |
|----------|-------|----|----|
| Primary | azure | navy `--sc-color-blue-500` | Brand identity SC |
| Info | sky | electric-blue `--sc-color-electric-blue-500` | Coherencia con Message / Toast info de AED |
| Warn | orange | amber `--sc-color-amber-500` | Coherencia con Message / Toast warn de AED |

Las 3 divergencias están implementadas en `sc-preset.ts`:
- `primitive.sky → electric-blue` (lines 108-120) — afecta SOLO button[severity=info]
- `primitive.orange → amber` (lines 132-144) — afecta SOLO button[severity=warn]
- `semantic.primary → blue (navy)` (lines 147-158) — afecta el primary global

## Sizes — divergencia

Figma NO modela sizes para Button (1965 variants pero ninguno por size axis — solo una densidad). Aura nativo sí expone `size="small" | "large"`. SC permite usar el atributo Aura, pero NO está validado en Figma. Si se usa, documentar como decisión.

## Estados visuales

| Estado | Tratamiento |
|--------|-------------|
| Idle | Color severity-500 (Solid) / severity-200 border (Outlined) |
| Hover | Aura sube intensidad: severity-600 (Solid) / severity-50 bg (Outlined) |
| Active | Aura: severity-700 |
| Disabled | `disabled/opacity: 60%` (token global) |
| Focus | Focus ring `--sc-color-electric-blue-500` (preset `focusRing`) |

## Accesibilidad

- `<p-button>` renderiza `<button>` nativo. Soporta `[disabled]`, `[aria-label]`, `[tabindex]`.
- Icon-only buttons NECESITAN `[aria-label]` o `[pTooltip]`.
- El focus ring (2px electric-blue) es visible siempre (no oculto por outline:none).

## Para más detalle

- Implementación PrimeNG: `node_modules/primeng/button` (componente standalone).
- Bridge SC: `packages/design-system/tokens/sc-preset.ts` — buscar `primitive.sky`, `primitive.orange`, `semantic.primary`.
- Catalog visual: `apps/ds-docs/src/app/pages/button/buttons-gallery.component.html`.

## Figma reference

`Smart Contact Prime → ❖ Button` (canvas `6738:49717`). 1965 variants total. Frames principales:
- `Components` (`6738:55124`) — un único showcase
- `button` (`6847:16863`, `7593:174348`, `10:125`) — 3 variantes principales con matrices
