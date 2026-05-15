# 15 · Toggle Switch (`<sc-toggle-switch>`)

> Switch accesible para opciones booleanas (activo/inactivo, enabled/disabled). Construido sobre un `<input type="checkbox">` real con `role="switch"` — el track + thumb son CSS puro encima. Hereda teclado, focus management y form association nativos.
>
> Categoría ⚪ **Pure SC** — el switch del Kit Figma SC (basado en PrimeNG p-toggleswitch) NO se usa directamente. Esta es nuestra versión declarativa con form-pattern propio.

## TL;DR

```html
<sc-toggle-switch
  [checked]="user().active"
  [ariaLabel]="'users.fields.status' | translate"
  (checkedChange)="onActiveChange($event)"
/>
```

## Cuándo usarlo

- Toggle booleano "estado" (activo/inactivo, on/off, enabled/disabled).
- Settings con cambio inmediato (no requieren Save explícito).
- Reemplaza el patrón "checkbox-styled-as-toggle" que vivía duplicado en cada form.

## Cuándo NO usarlo

- Form con múltiples opciones mutuamente exclusivas → `<p-radiobutton>` o `<sc-select-button>` (gap).
- Múltiples opciones independientes → checkbox.
- Acción inmediata destructiva → button + confirm dialog.

## Anatomía

```
┌──────┐
│  ●   │   off  →  track gris claro, thumb a la izquierda
└──────┘

┌──────┐
│   ● │   on   →  track primary navy, thumb a la derecha
└──────┘
```

Track radius full pill, thumb circular blanco con sombra suave. Animación 150ms ease-out.

## API

```typescript
interface ScToggleSwitchProps {
  checked: boolean;                  // requerido — estado bound
  disabled?: boolean;                // default false
  ariaLabel?: string | null;         // a11y — usar cuando no hay label visible
  ariaLabelledBy?: string | null;    // a11y — id de un elemento label externo
}

// Output
(checkedChange): EventEmitter<boolean>;
```

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-secondary-subtle` | track off |
| `--sc-bg-primary` | track on (navy) |
| `--sc-bg-surface` | thumb |
| `--sc-shadow-card` | thumb elevation |
| `--sc-spacing-50` | track padding interior |
| Track size | 36×20 px |
| Thumb size | 16×16 px |
| Transition | 150ms cubic-bezier |

## A11y

- Renderiza un `<input type="checkbox" role="switch">` real → screen readers anuncian "switch, on/off".
- Teclado nativo: **Space** toggles, **Tab** focuses.
- Focus ring visible (`--p-focus-ring-*`).
- Cuando se usa con label externo (el patrón típico en form rows: "Estado [helper text] → toggle"), pasar `[ariaLabelledBy]="labelId"` para asociar.

## Patrón form-row recomendado

El switch suele vivir junto a un label + helper, no dentro de un `<label>` wrapping:

```html
<div class="field field--inline">
  <sc-toggle-switch
    [checked]="form().status === 'active'"
    [ariaLabel]="'users.form.fields.status' | translate"
    (checkedChange)="onStatusChange($event)"
  />
  <div>
    <span class="field__label-inline">{{ 'users.form.fields.status' | translate }}</span>
    <span class="field__help">{{ 'users.form.fields.status_' + form().status | translate }}</span>
  </div>
</div>
```

El estado del helper text actualiza con el toggle (active/inactive).

## Decisiones de diseño SC

- **Real `<input type="checkbox">` debajo**: heredamos comportamiento nativo (form association, validation, keyboard). El track/thumb visual está encima via CSS overlay del label. No reinventamos accesibilidad.
- **`role="switch"`**: ARIA semantics más precisas que el `checkbox` default (los lectores anuncian "on/off" en vez de "checked/unchecked").
- **Sin label interno**: el componente NO renderiza texto. La label vive fuera (helper-style en form rows). Razón: muchos toggle settings necesitan **label + helper + status text** combinados, y meter eso dentro del componente complicaría la API. Mantener el switch atómico simplifica composición.
- **Brand color navy on**: el track activo usa `--sc-bg-primary` (no el azure default de PrimeNG) — alineado con identidad SC.

## Uso en AED

**21 instancias** (top 1 sin doc). Casos típicos:
- Status row en `agent-form-page`, `user-form-page`, `group-form-page` (active/inactive).
- Permisos toggle en `agent-form-page` (manage devices, self-activate, external devices, login override, random order, recording).
- Settings de `group-form-page` (typification).

## Página demo

Pendiente — gallery `/components/toggle-switch` con basic, disabled, paired-with-helper-row, dark mode.

## Figma reference

**Smart Contact Prime kit `❖ ToggleSwitch`**: [node 6738:22645](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22645) — basado en PrimeNG `<p-toggleswitch>`.

Refactor S32: la versión inicial era CSS puro sobre `<input type="checkbox">` nativo. Refactored a wrapper Extended de `<p-toggleswitch>` para minimizar custom y heredar lógica PrimeNG (memoria `minimal-customization`). Track + thumb dimensions matchean el Figma SC 1:1.

**Componente vecino — Toggle Button** (NO confundir): [node 6738:46435](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-46435) — basado en PrimeNG `<p-togglebutton>` (button con estado pressed/unpressed). NO existe en SCDS aún; se promovería como `<sc-toggle-button>` Extended cuando aparezca caso real de uso (gap conocido).
