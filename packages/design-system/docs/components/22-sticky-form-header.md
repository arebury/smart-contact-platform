# 22 · Sticky Form Header (`<sc-sticky-form-header>`)

> Cabecera sticky en el top de toda Create/Edit page (Users, Groups, Agents, etc.). Muestra entity eyebrow + name (display o editable inline) + slots para leading (avatar/photo) y meta (badges, info) + actions cluster (Save / Cancel / opcional Back). El "Save" muestra spinner mientras `[saving]`; disabled mientras `[canSave]` es false.
>
> Categoría ⚪ **Pure SC** — pattern in-house. Mirror visual de `<sc-page-header>` (mismas dimensiones de icon chip 44×44, mismo title size) — la app entera se siente como una misma familia entre list pages y entity edit pages.

## TL;DR

```html
<sc-sticky-form-header
  [mode]="mode()"
  [entityKey]="mode() === 'create' ? 'users.form.create_title' : 'users.entity_singular'"
  [name]="form().name"
  [canSave]="canSave()"
  [saving]="saving()"
  namePlaceholderKey="users.form.fields.name"
  (nameChange)="onNameRename($event)"
  (save)="save()"
  (cancelled)="cancel()"
>
  <span header-leading>
    <sc-photo-upload size="sm" [photo]="form().photo" [name]="form().name"
                     (photoChange)="onPhotoChange($event)" />
  </span>
  <span header-pills>
    @if (mode() === 'edit') {
      <span class="pill pill--status">{{ statusLabel }}</span>
    }
  </span>
  <span header-meta>
    @if (mode() === 'edit') { <span>{{ form().email }}</span> }
  </span>
</sc-sticky-form-header>
```

## Cuándo usarlo

- Top de cualquier Create/Edit form page (users, agents, groups, etc.).
- Combinado con `<sc-form-section-nav>` (aside) + `<sc-section-card>` (sections) + `<sc-form-danger-zone>` (footer) = patrón canónico form SC.

## Cuándo NO usarlo

- List pages → `<sc-page-header>` (no sticky, no save actions).
- Form embedded en modal → el `<sc-modal>` ya tiene su propio header.
- Form mínimo single-field → no necesita header completo, basta un title inline.

## Modos

### `create` — name editable inline

```
┌────────────────────────────────────────────────────────┐
│  [avatar]  USUARIOS                                    │
│            [_____________________]      [💾 Guardar]   │
│            (input name placeholder)                    │
└────────────────────────────────────────────────────────┘
```

El name es un `<input>` con `[placeholder]` de `namePlaceholderKey`. Save disabled hasta que `canSave()` sea true.

### `edit` — name display con pencil inline rename

```
┌────────────────────────────────────────────────────────┐
│  [avatar]  USUARIO                                     │
│            Marta López ✏️  [pill] [pill]    [💾 Save]  │
│            ✉️ marta@empresa.com  📞 +34 ...            │
└────────────────────────────────────────────────────────┘
```

El name es texto + pencil button. Click pencil → inline rename con check/cancel.

## API

```typescript
interface ScStickyFormHeaderProps {
  mode: 'create' | 'edit';           // requerido — switches name input vs display
  entityKey: string;                  // i18n key: eyebrow text
  name: string;                       // current entity name
  canSave?: boolean;                  // default true — disables Save button
  saving?: boolean;                   // default false — replaces Save with spinner
  namePlaceholderKey?: string;        // create-mode input placeholder, default 'common.name_placeholder'
  showBack?: boolean;                 // default false — adds Atrás button before Save
}

// Outputs
(nameChange): EventEmitter<string>;
(save): EventEmitter<void>;
(cancelled): EventEmitter<void>;

// Imperative API
startEditing(): void;                 // parent puede disparar inline rename desde menu
contains(target: Node | null): boolean; // helper para click-outside detection
```

## Slots proyectados

| Slot | Uso |
|---|---|
| `[header-leading]` | Avatar / photo / illustrated-avatar a la izquierda del title block |
| `[header-pills]` | Badges inline al lado del name (status, type, tier...) |
| `[header-meta]` | Línea inferior con info contextual (email, phone, extension...) |

Todos los slots aceptan `<span>` o cualquier content; el SCSS los colapsa via `:empty` cuando no hay contenido.

**Importante**: los slot wrappers deben vivir FUERA de `@if` condicional. Angular's content projection resuelve slot membership de la estructura estática — un slot attribute dentro de `@if` puede registrarse vacío. Pattern documentado en JSDoc de `agent-form-page`.

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-surface` | header background |
| `--sc-border-default` | bottom border |
| `--sc-shadow-popover` | sombra sticky |
| `--sc-text-primary` | name display |
| `--sc-text-secondary` | entity eyebrow + meta |
| `--sc-spacing-300/400` | paddings |
| Title font-size | 300 |
| Eyebrow font-size | 100 (uppercase) |
| Meta font-size | 50 |
| Icon chip size | 44×44 (leading) |
| Z-index | sticky overlay layer |

## Decisiones de diseño SC

- **Mirror del page-header**: mismas dimensiones que `<sc-page-header>`. Cuando navegas de `/admin/usuarios` → `/admin/usuarios/123`, el header NO cambia de altura ni de jerarquía visual.
- **Name editable inline (mode edit)**: el pencil + check/cancel inline evita un dialog "Edit name" separado. Friction-less.
- **Save button con spinner**: `[saving]` reemplaza el text por un Loader2 icon spinning. UX clara de "está guardando, no clickees otra vez".
- **Sin Delete en este header**: delete vive en `<sc-form-danger-zone>` al final del form. Mantenerlo fuera del top de scan path es deliberado.
- **`[showBack]` opt-in**: default es false porque el breadcrumb global ya da una vía atrás. Solo se activa en contextos donde el breadcrumb no es visible (modals, deep links).
- **`contains()` imperative**: el parent puede preguntarle al header "¿el target del click vive dentro de ti?" para implementar click-outside del rename input sin acoplar al DOM.

## A11y

- `<header>` con landmark implícito (banner).
- `<h1 class="visually-hidden">` con el name como source de truth para screen readers. El eyebrow visible es `aria-hidden` para evitar doble lectura.
- Pencil + check + cancel buttons todos con `aria-label` traducible.
- Input name con `aria-label`.
- Save button con `[disabled]` cuando `!canSave() || saving()` — keyboard + screen reader respetan disabled.

## Uso en AED

**3 instancias**:
- `agent-form-page` top.
- `user-form-page` top.
- `group-form-page` top.

Siempre el primer elemento del template Create/Edit page.

## Página demo

Pendiente — gallery `/components/sticky-form-header` con:
- Mode create (input name).
- Mode edit (display + pencil + rename inline).
- Saving state (spinner).
- Con/sin showBack.
- Con todos los slots vs slots vacíos.
- Dark mode.

## Figma reference

**No aplica** — pattern in-house. Mirror visual con `<sc-page-header>`. Si Marta modela ambos como una familia, anotar URL.

## Deuda

**Ninguna.** El SCSS actual NO contiene `::ng-deep` — el `<sc-photo-upload>` proyectado via slot `header-leading` se redimensiona desde el consumer pasando `[size]="sm"` directamente. La deuda histórica documentada en `audit/00-diagnosis.md` Fase 4 ya fue resuelta en sesión previa (verificado S32).
