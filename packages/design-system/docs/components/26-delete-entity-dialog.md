# 26 · Delete Entity Dialog (`<sc-delete-entity-dialog>`)

> **Type**: Pure SC · **AED uses**: 8 · **Figma parity**: Sin Figma equivalente

> Diálogo de confirmación compartido para eliminación de entidades (Users, Groups, Agents, Templates, Labels…). Dos modos: **single** (typing confirmation con copy-name shortcut), **bulk** (lista de chips removibles antes de confirmar). Mirror del React prototype (DD#163, DD#172).
>
> Categoría ⚪ **Pure SC** — pattern propio sobre `<sc-modal>`.

## TL;DR

```html
<!-- Single -->
<sc-delete-entity-dialog
  [visible]="deleteVisible()"
  mode="single"
  [items]="[{ id: user.id, name: user.name }]"
  entitySingular="usuario"
  entityPlural="usuarios"
  (cancelled)="cancelDelete()"
  (confirm)="confirmDelete()"
/>

<!-- Bulk -->
<sc-delete-entity-dialog
  [visible]="bulkDeleteVisible()"
  mode="bulk"
  [items]="selectedItemsForDelete()"
  entitySingular="usuario"
  entityPlural="usuarios"
  (cancelled)="cancelBulkDelete()"
  (confirm)="confirmBulkDelete($event)"
/>
```

## Cuándo usarlo

- Single-row delete desde danger zone (`<sc-form-danger-zone>`) o row action.
- Bulk delete desde `<sc-bulk-action-bar>` con N items seleccionados.
- Cualquier acción **irreversible** que merece confirmación con barrera tipo "typing" o "review chips".

## Cuándo NO usarlo

- Operación reversible → toggle inline, no dialog.
- Confirmación de cambio reversible (toggle active) → no aplica.
- Bulk edit (no delete) → `<sc-impact-preview-dialog>`.

## Modos

### `single` — typing confirmation

```
┌──────────────────────────────────────────────────────┐
│ Eliminar usuario                              [✕]    │
├──────────────────────────────────────────────────────┤
│ Vas a eliminar el usuario "Marta López".             │
│ Esta acción no se puede deshacer.                    │
│                                                      │
│ Escribe el nombre para confirmar:                    │
│ ┌──────────────────────────────┐  ┌─────────────┐   │
│ │ [_____________________]      │  │  📋 Copiar  │   │
│ └──────────────────────────────┘  └─────────────┘   │
│                                                      │
│                              [Cancelar]  [Eliminar] │
└──────────────────────────────────────────────────────┘
```

El usuario tiene que tipear "Marta López" para activar Eliminar (case-sensitive). El button **📋 Copiar** es un Fitts shortcut: copia el name al clipboard + emite toast, así el usuario puede pegar (Cmd+V) en vez de tipear.

### `bulk` — chip pruning

```
┌────────────────────────────────────────────────────────┐
│ Eliminar 3 usuarios                          [✕]       │
├────────────────────────────────────────────────────────┤
│ Vas a eliminar los siguientes usuarios.                │
│ Esta acción no se puede deshacer.                      │
│                                                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Marta López                              ×      │   │
│ │ Carlos Ruiz                              ×      │   │
│ │ Ana Soto                                 ×      │   │
│ └─────────────────────────────────────────────────┘   │
│ [Restaurar lista]                                      │
│                                                        │
│                        [Cancelar]  [Eliminar 3 usuarios] │
└────────────────────────────────────────────────────────┘
```

Cada chip removible. Confirmar emite el array de ids sobrevivientes. Si el usuario pruna todo, el botón confirm queda disabled (NO auto-close — pattern aprendido del previo footgun).

## API

```typescript
interface DeletableEntity {
  id: number;
  name: string;
}

interface ScDeleteEntityDialogProps {
  visible: boolean;                          // requerido
  mode: 'single' | 'bulk';                   // requerido
  items: readonly DeletableEntity[];         // requerido (single = array de 1)
  entitySingular: string;                    // "usuario"
  entityPlural: string;                      // "usuarios"
  singleDetailMessage?: string | null;       // opcional — párrafo extra single mode
  bulkFooterMessage?: string | null;         // opcional — párrafo footer bulk mode
}

// Outputs
(cancelled): EventEmitter<void>;
// confirm: null en single, array de ids sobrevivientes en bulk
(confirm): EventEmitter<readonly number[] | null>;
```

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-danger-subtle` | alert banner background |
| `--sc-bg-danger` | Eliminar button |
| `--sc-bg-danger-hover` | Eliminar hover |
| `--sc-text-danger` | alert icon + danger button text |
| `--sc-border-subtle` | dividers + input border |
| Copy button | matches `sc-input` height para alinear |
| Chip dimensions | ~40px height, full-width rows |

## Decisiones de diseño SC

- **Typing confirmation en single (no bulk)**: tipear N nombres para bulk delete sería absurdo. La barrera para bulk es la chip-pruning review — el usuario revisa la lista antes de confirmar.
- **`📋 Copiar` shortcut**: Fitts — el usuario lee el name, lo necesita escribir EXACTO. Copiarlo evita typos. Toast "Copiado al portapapeles" confirma la acción + `Check` icon 2s.
- **NO auto-close on prune-to-empty**: si el usuario quita todos los chips, el dialog se queda abierto con la lista vacía + Confirmar disabled. Previo comportamiento auto-cerraba — perdía la operación por accidente. Cambio en PR#10.
- **`[Restaurar lista]` recovery**: bulk mode tiene botón para re-stage todos los chips originales. Recovery del "pruné todo por error".
- **Built on `<sc-modal>`**: heredamos shell + Escape behavior + body portal.
- **i18n keys parametrizados**: title/subtitle se computan via `translate.instant` con params (`entity`, `count`, `name`) — siempre traducidos correctamente.

## A11y

- Modal con `role="dialog"` + `aria-modal="true"`.
- Input single con `<label for="delete-confirm-input">` asociado.
- Copy button con `aria-label="Copiar nombre al portapapeles"` + estado `Check` cuando copiado.
- × en chips con `aria-label="Quitar de la lista: <name>"`.
- Confirm disabled mientras `!canConfirm()`.
- Lectores anuncian el title vía `aria-labelledby`.

## Uso en AED

**8 instancias**:
- `agent-form-page`, `user-form-page`, `group-form-page` — single mode desde danger zone.
- `agents-list-page`, `users-list-page`, `groups-list-page` — bulk mode desde bulk-action-bar.
- `labels-list-page`, `templates-list-page` — bulk + single (action en row hover).

## Página demo

Pendiente — gallery `/components/delete-entity-dialog` con:
- Single basic.
- Single con typing confirmation animation.
- Single con copy + check feedback.
- Bulk con 3 items.
- Bulk pruned to 1.
- Bulk restaurar lista.
- Dark mode.

## Figma reference

**No aplica** — pattern in-house. Hereda visual de `<sc-modal>` (ya alineado con Figma SC ❖ Dialog).
