# 29 · Photo Upload (`<sc-photo-upload>`)

> **Type**: Pure SC · **AED uses**: 2 · **Figma parity**: Sin Figma equivalente

> Botón circular tipo "avatar uploader". Hover overlay con icono cámara, hidden file input, validación de tipo + tamaño locales, emite el data URL via `(photoChange)`. Fallback decoroso si la entidad no tiene foto: `<sc-illustrated-avatar>` hasheado del name.
>
> Categoría ⚪ **Pure SC** — pattern propio. Mirror del React prototype photo button.

## TL;DR

```html
<!-- Size md: avatar + hint row + remove link (form body) -->
<sc-photo-upload
  [photo]="form().photo"
  [name]="form().name"
  [ariaLabel]="'common.photo.change' | translate"
  (photoChange)="onPhotoChange($event)"
/>

<!-- Size sm: solo avatar (sticky header leading slot) -->
<sc-photo-upload
  size="sm"
  [photo]="form().photo"
  [name]="form().name"
  (photoChange)="onPhotoChange($event)"
/>
```

## Cuándo usarlo

- Form Create/Edit de entidad con foto (agents, users).
- Leading slot del `<sc-sticky-form-header>` (size `sm`).
- Como input principal o como avatar previewer.

## Cuándo NO usarlo

- Upload de archivos no-imagen → componente diferente.
- Upload múltiple → no soportado (single file only).
- Read-only avatar display → `<sc-illustrated-avatar>` directo, sin uploader.

## Sizes

### `md` (default, 64×64)

```
┌──────┐
│  [📷]│  ← hover: camera overlay
│      │
└──────┘
  JPG/PNG/GIF, máx 800KB
   [Eliminar foto]
```

### `sm` (44×44, sin hint row)

```
┌────┐
│ [📷]│  ← hover overlay only
└────┘
```

Sin texto hint, sin remove link. Para uso en sticky header donde el espacio es premium.

## API

```typescript
interface ScPhotoUploadProps {
  photo?: string | null | undefined;   // data URL actual; null/undefined = sin foto
  name?: string | null | undefined;    // opcional — drives illustrated-avatar fallback
  ariaLabel?: string;                  // default 'Cambiar foto'
  size?: 'md' | 'sm';                  // default 'md'
}

// Output
(photoChange): EventEmitter<string | null>;
// emite data URL al subir; null al click "Eliminar foto"
```

## Fallback chain (no photo)

1. `[name]` set → render `<sc-illustrated-avatar>` hasheado del nombre. Mismo retrato que la list cell, así el form preview matchea visualmente lo que el usuario ve en la tabla.
2. No name → `UserCog` lucide icon (placeholder genérico para entidades no-persona).

## Validación

| Constraint | Valor | Toast |
|---|---|---|
| Allowed types | `image/jpeg`, `image/png`, `image/gif` | "Formato no válido" (i18n `common.photo.invalid_type`) |
| Max size | 800 KB | "Archivo demasiado grande" (i18n `common.photo.too_large`) |

Errores se muestran via `MessageService` (PrimeNG `<p-toast>`). El form no recibe nada — el upload se cancela silenciosamente.

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-secondary-subtle` | placeholder background |
| `--sc-icon-subtle` | camera + placeholder icons |
| `--sc-bg-overlay-subtle` | hover overlay |
| `--sc-shadow-card` | sombra del círculo |
| `--sc-text-secondary` | hint text |
| `--sc-text-danger` | remove link |
| Border-radius | 50% (full circle) |
| Camera icon | 20px (md) / 16px (sm) |
| Hint font-size | 50 |

## Decisiones de diseño SC

- **Input reset post-pick**: tras seleccionar un archivo, el `<input type="file">` se resetea con `input.value = ''`. Sin esto, re-seleccionar el MISMO archivo no dispara `change` (event nativo deduplicate by value). Pattern conocido.
- **Validación cliente, no servidor**: por ahora no hay backend, todo es prototype. Cuando llegue real upload, mover validación a server-side adicional (mantener cliente como UX feedback).
- **Fallback en cascada**: photo → illustrated (con name) → UserCog. El illustrated wins sobre el UserCog porque la consistencia entre tabla y form es más importante que el placeholder genérico.
- **`undefined` aceptado en `[photo]`**: las entities tienen `Agent.photo?: string`. Acceptar undefined evita `?? null` glue en consumers.
- **`size="sm"` para sticky header**: el header tiene altura limitada. La 64×64 default no cabe — sm es 44×44 sin hint/remove.
- **Camera icon hover only**: sin hover el avatar se ve "neutral" (no como editable). Hover lo revela. Reduce noise visual cuando el usuario no está interactuando.

## A11y

- Button con `aria-label` traducible.
- File input `type="file"` accept="image/*" oculto vía CSS (no `display:none` que rompe a11y — usar visually-hidden).
- Image con `alt={name}` cuando hay photo; con `alt=""` cuando es illustrated (decorativo, el name vive en el form aparte).
- Camera icon decorativo (`aria-hidden="true"`).
- "Eliminar foto" como `<button>` real, no span clickable.

## Uso en AED

**2 instancias**:
- `agent-form-page` sticky header leading slot (`size="sm"`).
- `user-form-page` sticky header leading slot (`size="sm"`).

(Históricamente había instancias `size="md"` dentro del form body, removidas tras DD#54 — el header rico lleva el preview, evitando doble photo picker confuso.)

## Página demo

Pendiente — gallery `/components/photo-upload` con:
- md basic (sin photo).
- md con photo subida.
- md con name (illustrated fallback).
- sm basic.
- Hover camera overlay demo.
- Validación type/size con toast.
- Dark mode.

## Figma reference

**No aplica** — pattern in-house. Si el equipo de diseño lo modela en Smart Contact Prime, anotar URL.

## Deuda

**Ninguna.** El consumer pasa `[size]="sm"` directamente desde `<sc-sticky-form-header>` (slot leading) — sin `::ng-deep` requerido. Verificado S32 (la deuda histórica `00-diagnosis.md` Fase 4 ya estaba resuelta).
