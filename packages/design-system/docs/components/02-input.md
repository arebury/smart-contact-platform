# 02 · Input (`<sc-input>`)

> Text input para formularios SC. Cubre los casos text/email/password/tel/url/search.
> Para `input-number`, `input-group` (con addons) e `input-otp`, ver componentes separados (TBD).

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

## Tamaños

| size | Padding vertical | Font size |
|------|-----------------|-----------|
| `sm` | 4px | `--sc-font-size-100` (12px) |
| `md` (default) | `--sc-spacing-200` (8px, vía sc-preset) | `--sc-font-size-200` (14px) |
| `lg` | 12px | `--sc-font-size-300` (16px) |

## Tokens consumidos

Todos los visuales vienen de `sc-preset.ts` → `semantic.colorScheme.{light,dark}.formField.*`:

- `background`, `disabledBackground`, `color`, `disabledColor`
- `placeholderColor`, `invalidPlaceholderColor`
- `borderColor`, `hoverBorderColor`, `focusBorderColor`, `invalidBorderColor`
- `shadow`

Cambiar la apariencia de TODOS los inputs SC = editar `sc-preset.ts`, no este componente.

## Accesibilidad

- Si pasas `[label]`, se renderiza un `<label for="...">` real (no aria-label) — funciona con screen readers + click-to-focus.
- Si pasas `[required]`, se añade `aria-required="true"` al input.
- Si hay `[error]` o el FormControl está invalid+touched, se añade `aria-invalid="true"`.
- El texto de error/helper se asocia via `aria-describedby` con el input para que el screen reader lo lea.

## Layout & no-CLS

- El espacio del `__msg` (helper/error) tiene `min-height: 1.25em` — el layout NO se desplaza cuando aparece/desaparece el mensaje.
- Los iconos están absolutos sobre el input — no empujan el placeholder.

## Decisiones de divergencia con Figma

- **Border radius**: la Figma usa 6px. Mantenemos via `sc-preset.formField.borderRadius = var(--sc-radius-200)`. ✓ aligned.
- **Padding Y**: Figma usa 8px en tamaño normal. Mantenemos via `sc-preset.formField.paddingY = var(--sc-spacing-200)`. ✓ aligned.
- **Float Label** y **Ifta Label** del Figma: NO implementados en v0.1. Si aparece caso real, cocinar variante después.
- **Filled variant** del Figma: NO implementado. Es un look "input con valor pre-relleno" que en Angular se consigue con CSS `:not(:placeholder-shown)` si hace falta — sin variante explícita.

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
