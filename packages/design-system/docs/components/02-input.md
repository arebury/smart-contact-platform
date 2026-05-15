# 02 · Input (`<sc-input>`)

> Text input para formularios SC. Cubre los casos text/email/password/tel/url/search.
> Para `input-number`, `input-group` (con addons) e `input-otp`, ver componentes separados (TBD).
>
> **Auditado 1:1 con Figma `Smart Contact Prime → ❖ Inputtext` (canvas `6738:46804`) — Session 30.** 240 variants en Figma (8 ejes: State / Invalid / Disabled / Filled / Size / IftaLabel / FloatLabel / FloatLabelVariant). Tokens extraídos vía MCP en nodos canónicos por size y por variant.

## TL;DR

```html
<sc-input
  label="Email"
  type="email"
  placeholder="tu@empresa.com"
  helperText="Lo usaremos para confirmar tu cuenta."
  [required]="true"
  [(value)]="email"
/>
```

## Cuándo usarlo

- Cualquier campo de formulario que pida texto, email, teléfono, URL o contraseña.
- Reemplaza el patrón `<div class="field"><label><input class="field__input">...</div>` que estaba duplicado en cada form de AED.

## Cuándo NO usarlo

- Para valores numéricos → usar `<sc-input-number>` (TBD, cocinar cuando aparezca caso real).
- Para OTP / códigos de verificación → usar `<sc-input-otp>` (TBD).
- Para inputs con icono interactivo + texto + botón (search bar pro, prefix dropdown) → `<sc-input-group>` (TBD).
- Para checkbox / radio → usar componentes específicos (`<sc-tri-state-checkbox>`).

## API

```typescript
interface ScInputProps {
  // Visual
  size?: 'sm' | 'md' | 'lg';   // default 'md'
  label?: string;               // si presente, renderiza <label>
  required?: boolean;           // añade * rojo después del label
  helperText?: string;          // texto debajo del input
  error?: string;               // mensaje error (overrides helperText, pinta borde rojo)
  leftIcon?: string;            // PrimeIcon class, ej. 'pi pi-search'
  rightIcon?: string;           // PrimeIcon class

  // HTML
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';  // default 'text'
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  inputId?: string;             // si no se pasa, se auto-genera 'sc-input-N'
  name?: string;
  autocomplete?: string;        // ej. 'email', 'current-password', 'tel'
  maxlength?: number;
  filled?: boolean;             // variant Figma `Filled=True`: bg slate-50 soft

  // Two-way binding (cualquiera funciona)
  value?: string;               // model() — usar `[(value)]="signal"`
  // o ngModel via ControlValueAccessor
  // o formControl via ReactiveForms
}
```

## Bindings soportados

### Signals (recomendado para código nuevo)

```html
<sc-input [(value)]="emailSignal" />
```

```typescript
emailSignal = signal('');
```

### ngModel (forms-driven legacy)

```html
<sc-input [(ngModel)]="email" />
```

### Reactive Forms

```html
<sc-input
  [formControl]="emailControl"
  [error]="emailControl.touched && emailControl.invalid ? 'Inválido' : undefined"
/>
```

```typescript
emailControl = new FormControl('', [Validators.required, Validators.email]);
```

## Estados visuales

| Estado | Trigger | Visual |
|--------|---------|--------|
| Default | — | border default, bg surface |
| Hover | mouseover | border strong |
| Focus | tab / click | border primary, focus ring |
| Disabled | `[disabled]="true"` | bg disabled, color disabled, sin pointer |
| Readonly | `[readonly]="true"` | mismo color, sin cursor de edición |
| Invalid | `[error]` set OR FormControl invalid + touched | border error |

## Tamaños (verificados Figma)

| size | Padding (x / y) | Font size | Icon |
|------|------------------|-----------|------|
| `sm` | 8.75 / 5.25 | 12.25px | 12.25px |
| `md` (default) | 10.5 / 7 | 14px | 14px |
| `lg` | 12.25 / 8.75 | 15.75px | 15.75px |

Todos decimales raw (off-scale en `--sc-spacing-*` / `--sc-font-size-*`). Ver tabla completa de tokens al final del doc.

## Accesibilidad

- Si pasas `[label]`, se renderiza un `<label for="...">` real (no aria-label) — funciona con screen readers + click-to-focus.
- Si pasas `[required]`, se añade `aria-required="true"` al input.
- Si hay `[error]` o el FormControl está invalid+touched, se añade `aria-invalid="true"`.
- El texto de error/helper se asocia via `aria-describedby` con el input para que el screen reader lo lea.

## Layout & no-CLS

- El espacio del `__msg` (helper/error) tiene `min-height: 1.25em` — el layout NO se desplaza cuando aparece/desaparece el mensaje.
- Los iconos están absolutos sobre el input — no empujan el placeholder.

## Float Label (composición con `<p-floatlabel>`)

`<sc-input>` está pensado para el patrón **label encima del input** (gestiona el `<label>` por dentro). Para el patrón **label flotante** — el que entra/sale del campo al hacer focus — usar el wrapper nativo de PrimeNG `<p-floatlabel>` envolviendo un `pInputText`, sin `<sc-input>`. Los tokens visuales (border, focus ring, paleta) se aplican igual porque `pInputText` lee de `sc-preset.formField.*`.

Tres variantes según dónde aparece el label cuando el campo está enfocado:

| Variante | Comportamiento | Cuándo usarla |
|---|---|---|
| `over` (default) | Label dentro al estar vacío; sube fuera al hacer focus o tener valor. | Forms compactos donde la label arriba ocuparía demasiado vertical. |
| `in` | Label dentro siempre, encogido arriba cuando hay valor. | Forms muy densos (filtros, búsquedas avanzadas). |
| `on` | Label sentado sobre el borde superior del input. | Materializa-style; útil cuando la label es larga. |

```typescript
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [FloatLabelModule, InputTextModule, FormsModule],
  template: `
    <p-floatlabel variant="over">
      <input pInputText id="email" [(ngModel)]="email" autocomplete="email" />
      <label for="email">Email</label>
    </p-floatlabel>

    <p-floatlabel variant="in">
      <input pInputText id="name" [(ngModel)]="name" autocomplete="off" />
      <label for="name">Nombre completo</label>
    </p-floatlabel>

    <p-floatlabel variant="on">
      <input pInputText id="company" [(ngModel)]="company" autocomplete="organization" />
      <label for="company">Empresa</label>
    </p-floatlabel>
  `,
})
export class FormWithFloatLabel {
  email = '';
  name = '';
  company = '';
}
```

**No-goal actual**: integrar `[floatLabel]="'in' | 'on' | 'over'"` como prop de `<sc-input>`. Cocinar sólo cuando aparezca un caso real en AED que necesite combinar float label con la API de `<sc-input>` (helper, error, iconos). De momento, los dos patrones coexisten.

## Migración desde el patrón AED viejo

**Antes**:
```html
<div class="field">
  <label class="field__label" for="agent-email">
    {{ 'agents.form.email.label' | translate }}
    <span class="field__required">*</span>
  </label>
  <input
    id="agent-email"
    type="email"
    class="field__input"
    [class.field__input--error]="!!errors()['email']"
    [value]="form().email"
    (input)="onEmailChange($event)"
  />
  <span class="field__error">{{ errors()['email'] }}</span>
</div>
```

**Después**:
```html
<sc-input
  inputId="agent-email"
  type="email"
  [label]="'agents.form.email.label' | translate"
  [required]="true"
  [value]="form().email"
  (valueChange)="onEmailChange($event)"
  [error]="errors()['email']"
/>
```

12+ líneas → 8 líneas. Sin clases `.field__*` que mantener. Estado de error declarativo.


## Tokens consumidos (Figma → SC) — matriz exhaustiva por variant

Auditado Session 30. Tokens verificados vía `mcp__claude_ai_Figma__get_variable_defs` en nodos canónicos del Figma `Smart Contact Prime → ❖ Inputtext` (canvas `6738:46804`).

### Default (State=Default, Normal, Filled=False, IftaLabel=False, FloatLabel=False) — node `23:834`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `inputtext/padding/x` | `10.5` | preset `formField.paddingX = '10.5px'` (raw, off-scale) |
| `inputtext/padding/y` | `7` | preset `formField.paddingY = '7px'` (raw, off-scale) |
| `inputtext/border/radius` | `6` | `--sc-radius-200` |
| `inputtext/background` | `#ffffff` | `--sc-color-gray-0` |
| `inputtext/border/color` | `#cbd5e1` | `--sc-color-gray-300` (Aura slate) |
| `inputtext/focus/border/color` | `#3b82f6` | `--sc-color-azure-500` |
| `inputtext/placeholder/color` | `#64748b` | `--sc-color-gray-500` |
| `inputtext/shadow` | `#1212170D` offset(0,1) r2 | preset formField.shadow |
| `text/color` | `#334155` | `--sc-text-secondary` (slate-700) |
| `app/font/size` | `14` | `--sc-font-size-200` |

### Size = Small — node `7039:21970`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `inputtext/sm/font/size` | `12.25` | sc-input.scss `.sc-input--sm` raw px |
| `inputtext/sm/padding/x` | `8.75` | raw px |
| `inputtext/sm/padding/y` | `5.25` | raw px |
| `iconfield/figma/sm/icon/size` | `12.25` | sc-input.scss `.sc-input--sm .sc-input__icon` raw |

### Size = Large — node `7039:74791`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `inputtext/lg/font/size` | `15.75` | sc-input.scss `.sc-input--lg` raw px |
| `inputtext/lg/padding/x` | `12.25` | raw px |
| `inputtext/lg/padding/y` | `8.75` | raw px |
| `iconfield/figma/lg/icon/size` | `15.75` | sc-input.scss `.sc-input--lg .sc-input__icon` raw |

### Filled = True — node `1729:42481`

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `inputtext/filled/background` | `#f8fafc` | `--sc-color-gray-50` via `.sc-input--filled` |
| (border, padding, shadow, focus) | iguales que Default | hereda preset |
| (hover en filled) | `--sc-color-gray-100` (slate-100 brightness step) | sc-input.scss hover override |

### Invalid = True

| Token | Tratamiento |
|-------|-------------|
| Border color | `--sc-border-error` via sc-preset `colorScheme.{light,dark}.formField.invalidBorderColor` |
| Placeholder color | `--sc-text-danger` via `invalidPlaceholderColor` |

### Disabled = True

| Token Figma | Valor |
|-------------|-------|
| `disabled/opacity` | `60%` (global, no específico de input) |

(El input desactivado hereda chrome desactivado del preset: bg `--sc-bg-disabled`, color `--sc-text-disabled`.)

### Hover / Focus

- **Hover**: no es variant Figma separada — preset CSS aplica `hoverBorderColor: --sc-border-strong` (slate-400).
- **Focus**: variant Figma marca `inputtext/focus/border/color = #3b82f6`; preset usa `focusBorderColor: --sc-bg-primary`. **Divergencia**: preset usa la primary del brand SC (`--sc-color-blue-500`) en lugar del azure puro Aura. Decisión consciente — el focus ring sí usa electric-blue por consistencia con el resto de UI SC.

## Divergencias documentadas

- **Padding decimal (10.5 / 7, 8.75 / 5.25, 12.25 / 8.75)**: valores raw px porque caen off-scale en `--sc-spacing-*`. Honesto 1:1 con Figma > tokens "limpios". Aplica a sc-input y, vía preset, a sc-select / sc-datepicker / cualquier formField PrimeNG.
- **Icon size raw decimal (12.25, 15.75)**: misma justificación. `--sc-icon-size-*` no contempla decimales.
- **Focus border color**: preset usa `--sc-bg-primary` (brand navy) en vez del Figma `#3b82f6` (azure). Decisión SC: el accent visible (electric blue) lo aplica el focusRing CSS, mientras el border respeta la primary. Cambio TBD si la audit visual dice que falta accent.
- **Float Label / Ifta Label variants** (4 valores × 2 booleans en Figma): NO implementados como props del `<sc-input>`. La composición Float Label se hace afuera vía `<p-floatlabel>` envolviendo `<sc-input>` (ver sección 9 de la página demo). Ifta Label sin caso real en AED.
