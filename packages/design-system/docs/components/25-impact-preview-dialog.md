# 25 · Impact Preview Dialog (`<sc-impact-preview-dialog>`)

> **Type**: Pure SC · **AED uses**: 2 · **Figma parity**: Sin Figma equivalente

> Diálogo de confirmación que **previsualiza el impacto** de una operación bulk (edit / duplicate) antes de commitirla. Lista los items que van a recibir el cambio, permite quitarlos individualmente con un `×` (hover-revealed), y emite el array de ids sobrevivientes en `(confirm)`.
>
> Categoría ⚪ **Pure SC** — pattern propio (DD#298). Mirror del `ImpactPreviewDialog` del prototipo React.

## TL;DR

```html
<sc-impact-preview-dialog
  [visible]="preview() !== null"
  mode="bulkEdit"
  [title]="'Cambiar tipo a Admin' "
  [items]="preview()?.items ?? []"
  [badge]="{ fieldLabel: 'Tipo', currentValueLabel: 'Agent', newValueLabel: 'Admin' }"
  confirmLabel="Aplicar a 5 usuarios"
  (cancelled)="preview.set(null)"
  (confirm)="applyBulkEdit($event)"
/>
```

## Cuándo usarlo

- Confirmar operación bulk **destructiva o irreversible** donde el usuario puede haberse seleccionado más items de los que pretendía.
- Operación bulk con preview del campo y valor a aplicar (edit), o de duplicación de N entidades.
- Permitir al usuario "podar" la selección antes de confirmar — recovery del error de selección.

## Cuándo NO usarlo

- Delete bulk → usar `<sc-delete-entity-dialog mode="bulk">` (más específico, con typing confirmation).
- Single-item edit → no necesita preview de impacto, basta un toast tras guardar.
- Operación inmediata sin riesgo (toggle status individual) → no requiere dialog.

## Modos

### `bulkEdit` — preview de cambio de valor

```
┌──────────────────────────────────────────────────────────┐
│ Cambiar tipo a Admin                          [✕]        │
├──────────────────────────────────────────────────────────┤
│ Campo TIPO   Agent  →  Admin                             │
│                                                          │
│ ┌─────────────────────────────────────────────────┐     │
│ │ Marta López                              ×      │     │
│ │ Carlos Ruiz                              ×      │     │
│ │ Ana Soto                                 ×      │     │
│ └─────────────────────────────────────────────────┘     │
│                                                          │
│                       [Cancelar]  [Aplicar a 3 usuarios] │
└──────────────────────────────────────────────────────────┘
```

### `duplicate` — preview de duplicación

Similar pero sin badge field/value, y el icon del header es Copy en vez de ArrowRight.

## API

```typescript
interface ImpactItem {
  id: number;
  name: string;
  hint?: string;        // opcional — secondary text (e.g. "(3 grupos)")
}

interface ImpactBadge {
  fieldLabel: string;            // "Tipo"
  currentValueLabel?: string;    // "Agent" — opcional (puede ser vacío en duplicate)
  newValueLabel: string;         // "Admin"
}

interface ScImpactPreviewDialogProps {
  visible: boolean;                          // requerido
  mode: 'bulkEdit' | 'duplicate';            // requerido
  title: string;                             // requerido
  items: readonly ImpactItem[];              // requerido
  badge?: ImpactBadge | null;                // bulkEdit muestra Current → New
  confirmLabel?: string;                     // default 'Aplicar'
  cancelLabel?: string;                      // default 'Cancelar'
}

// Outputs
(cancelled): EventEmitter<void>;
(confirm): EventEmitter<readonly number[]>;  // ids sobrevivientes en orden original
```

## Comportamiento

- Cada chip de la lista tiene `×` hover-revealed que quita ese item del array sobreviviente.
- El `×` está **disabled** cuando solo queda 1 item (template-side guard) — no se puede vaciar la lista accidentalmente.
- Confirm button disabled cuando `survivingItems().length === 0`.
- Reset automático: al recibir `items` nuevos (effect), el chip pruning se resetea (no bleeds entre operaciones).

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-secondary-subtle` | item rows background hover |
| `--sc-bg-danger-subtle` | × button hover |
| `--sc-text-danger` | × icon hover |
| `--sc-icon-subtle` | × icon resting |
| `--sc-border-subtle` | borde lista + dividers |
| `--sc-radius-200` | radius lista |
| `--sc-spacing-100/200/300` | gaps + paddings |
| Item row height | ~40px |
| List max-height | 280px (scroll si más) |

## Decisiones de diseño SC

- **Built on `<sc-dialog>`**: el dialog usa el wrapper SCDS modal — body + footer slots, sombras + radius unificados, mount en `document.body` via styleClass.
- **`::ng-deep .sc-impact-dialog`**: el estilo del header/body/footer se aplica via styleClass al `.p-dialog` porque PrimeNG monta el dialog fuera del component host (body portal). Pattern aceptado en CLAUDE de design-system para resetear chrome PrimeNG.
- **NO auto-close on prune-to-empty**: previo comportamiento auto-cerraba si el usuario quitaba todos los chips. Eliminado (mismo razonamiento que `<sc-delete-entity-dialog>` PR#10): los usuarios perdían la operación por accidente. Ahora la lista mínima es 1 (template guard sobre el ×).
- **Order-preserving confirm output**: el array emitido en `(confirm)` mantiene el orden original de `items` — no el orden de pruning. Esto evita sorpresas en el caller.
- **Badge sólo en bulkEdit**: el badge "Field: current → new" no aplica a duplicate (no hay cambio de valor, solo duplicación).

## A11y

- Modal con `role="dialog"` + `aria-modal="true"` (heredado de `<sc-dialog>`).
- × button en cada chip con `aria-label="Quitar de la operación: <name>"`.
- Confirm button con texto visible incluyendo el count ("Aplicar a 3 usuarios").
- Escape cierra (heredado del modal).

## Uso en AED

**2 instancias**:
- `users-list-page` cuando se commitea un bulk edit.
- `agents-list-page` cuando se duplica una agenda / template.

Otras list pages usan `<sc-delete-entity-dialog mode="bulk">` directamente para delete (sin impact preview porque delete no tiene "field/value preview" — la lista de chips la cubre el delete dialog).

## Página demo

Pendiente — gallery `/components/impact-preview-dialog` con:
- bulkEdit con badge.
- duplicate sin badge.
- Items con hint secundario.
- Chip pruning down to 1 (× disabled).
- Dark mode.

## Figma reference

**No aplica** — pattern in-house. Construido sobre `<sc-dialog>` que sí está alineado con Figma SC.
