# 21 · Form Danger Zone (`<sc-form-danger-zone>`)

> Sección "danger zone" al final de un form edit. Alberga acciones irreversibles (delete, transfer, archive) **fuera del scan path principal** del usuario. Visual frame + trigger button; la confirmación se gestiona aparte (pair típico: `<sc-delete-entity-dialog>` o `<sc-impact-preview-dialog>`).
>
> Categoría ⚪ **Pure SC** — pattern industria (GitHub, Stripe, Linear). Versión SC con borde + chrome rojo subtle + button danger.

## TL;DR

```html
<sc-form-danger-zone
  descriptionKey="users.form.danger_zone_description"
  (action)="requestDelete()"
/>

<!-- Después, el form muestra el confirm dialog: -->
<sc-delete-entity-dialog
  [visible]="deleteVisible()"
  mode="single"
  [items]="deleteItems()"
  ...
/>
```

## Cuándo usarlo

- Form Create/Edit page de una entidad (user, agent, group...) en modo `edit`.
- Colocar al final del form body (después de la última `<sc-section-card>`).
- Cuando la acción es **irreversible** (delete) o **alto impacto** (transfer ownership, archive).

## Cuándo NO usarlo

- Modo `create` — la entidad no existe aún, no hay nada que destruir.
- Acción reversible (toggle status active/inactive) → toggle inline en la card de identidad.
- List page (no en form) — para multi-delete usar `<sc-bulk-action-bar>` + `<sc-delete-entity-dialog mode="bulk">`.

## Anatomía

```
┌──────────────────────────────────────────────────────┐  ← border red subtle
│  Zona de peligro                                     │  ← title
│  ────────────────────────────────────────────────    │
│  Esta acción eliminará el usuario permanentemente    │  ← description (caller)
│  y no podrá deshacerse.                              │
│                                                      │
│                                  [🗑️  Eliminar]      │  ← action button (danger)
└──────────────────────────────────────────────────────┘
```

Border + bg tinted en red subtle. Title secondary. Description body. Button danger a la derecha.

## API

```typescript
interface ScFormDangerZoneProps {
  titleKey?: string;              // default 'common.danger_zone.title' = "Zona de peligro"
  descriptionKey: string;         // requerido — describe qué pasa al confirmar
  actionKey?: string;             // default 'common.delete' = "Eliminar"
  disabled?: boolean;             // default false
}

// Output
(action): EventEmitter<void>;     // emit al click del button — caller abre el dialog
```

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-danger-subtle` | fondo de la card |
| `--sc-border-danger` | borde rojo subtle |
| `--sc-text-danger` | title + button text |
| `--sc-bg-danger` | button background (default state) |
| `--sc-bg-danger-hover` | button hover |
| `--sc-spacing-300/400` | paddings |
| `--sc-radius-200` | border-radius |
| Trash icon | 14px (lucide Trash2) |

## Decisiones de diseño SC

- **Out of scan path**: la danger zone vive al final del form, lejos de los campos editables y del Save button. Razón: el usuario que solo quería "actualizar el teléfono" no debe encontrarse con un botón Delete cerca del flujo principal. Convention GitHub/Stripe.
- **Frame + trigger, no confirm**: este componente NO contiene la lógica de confirmación. Solo dispara `(action)`. El parent decide qué dialog abrir (`<sc-delete-entity-dialog>`, `<sc-impact-preview-dialog>`...). Mantener responsabilidades separadas.
- **`titleKey` opcional con default i18n**: la mayoría de casos usa "Zona de peligro" estándar. El override es para casos como "Transferir agente" donde la palabra "peligro" no encaja.
- **`actionKey` opcional**: default "Eliminar". Override para "Archivar", "Transferir", "Resetear".

## A11y

- `<section>` con `aria-labelledby` apuntando al `<h2>` del title — los lectores anuncian "section, Zona de peligro".
- Button con texto visible + icon `aria-hidden="true"`.
- Color rojo NO es el único indicador (texto + icono lo refuerzan — accesible para daltonismo).

## Uso en AED

**3 instancias**:
- `agent-form-page` modo `edit` — bottom de la sección Identidad.
- `user-form-page` modo `edit` — bottom de la sección Identidad.
- `group-form-page` modo `edit` — bottom de la sección Identidad.

Siempre debajo de la última `<sc-section-card>` del form. Solo renderizado en modo edit.

## Página demo

Pendiente — gallery `/components/form-danger-zone` con basic, disabled, custom action ("Archivar"), dark mode.

## Figma reference

**No aplica** — pattern in-house. Visual inspiración: GitHub settings danger zone, Stripe organization delete. Si Marta lo modela, anotar URL.
