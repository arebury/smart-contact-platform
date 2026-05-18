# 17 · Label Chip (`<sc-label-chip>`)

> **Type**: Pure SC · **AED uses**: 3 · **Figma parity**: 1:1 con Figma

> Chip categórico pequeño para etiquetas removibles. Renderiza una "label de Smart Contact" (entidad del CRUD de etiquetas, con color y nombre) en table cells, agent rows, picker selections, etc. Opcionalmente removable con un `×` inline.
>
> Categoría ⚪ **Pure SC** — wrapper sobre el modelo de datos `Label` (no PrimeNG `<p-tag>`, que cubre `<sc-tag>` cuando se cocine). NO confundir con `<p-tag>` / futuro `<sc-tag>` — este es **específico de la entidad Label** (color + name de la entity).

## TL;DR

```html
<sc-label-chip [label]="{ name: 'VIP', color: 'red' }" />

<!-- Removable -->
<sc-label-chip
  [label]="{ name: chip.name, color: chip.color }"
  [removable]="true"
  (remove)="onLabelRemove(chip.id)"
/>

<!-- Tamaño compacto (xs) para table cells densas -->
<sc-label-chip [label]="lbl" size="xs" />
```

## Cuándo usarlo

- Renderizar **entidades Label** del CRUD (la lista de etiquetas que el supervisor gestiona): VIP, Cobros, Trial, etc.
- Picker de etiquetas en formularios (agent-form: "Etiquetas asignadas") con `[removable]`.
- Table cells donde se muestran etiquetas asociadas a un agente / grupo / cliente.

## Cuándo NO usarlo

- Tag genérico de severity / status (success/warn/danger) → futuro `<sc-tag>` (gap conocido, customs-catalog §5.3).
- Chip de filtro de búsqueda → `<sc-search>` o un filter-chip dedicado.
- Indicador de selección múltiple temporal → `<p-chip>` raw o badge.

## Anatomía

```
┌─────────────┐
│ ● VIP       │   ← dot color + name (size=sm)
└─────────────┘

┌─────────────┐
│ ● VIP   ×   │   ← removable adds × button right
└─────────────┘

[●VIP]            ← size=xs (compact for dense cells)
```

Dot circular pequeño + nombre. Sin border en `xs`, con border subtle en `sm`. Background tinted con el color de la label.

## API

```typescript
interface LabelChipModel {
  name: string;
  color: LabelColor;  // 'blue' | 'red' | 'green' | 'yellow' | ...
}

interface ScLabelChipProps {
  label: LabelChipModel;          // requerido
  size?: 'sm' | 'xs';             // default 'sm'
  removable?: boolean;            // default false — añade × button
}

// Output
(remove): EventEmitter<void>;     // emitido al click del × — caller decide si elimina la asignación
```

## LabelColor disponibles

Los colores de etiqueta se definen en `apps/supervisor/src/app/features/admin/labels/data/labels-data.ts` (`LABEL_COLORS`). Cada color tiene 4 tokens asociados:

| Token | Uso |
|-------|-----|
| `--sc-label-<color>-bg` | background del chip (tinted) |
| `--sc-label-<color>-text` | color del nombre |
| `--sc-label-<color>-border` | border subtle (sm size) |
| `--sc-label-<color>-dot` | color del punto leading |

Los 4 tokens se inyectan al chip via CSS vars (`--chip-bg`, `--chip-text`, `--chip-border`, `--chip-dot`) calculadas en el computed `cssVars()` del componente. Esto permite ampliar la paleta sin tocar el chip.

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-label-<color>-*` | familia completa por color (bg / text / border / dot) |
| `--sc-spacing-50` | gap interno y padding xs |
| `--sc-spacing-100` | padding sm |
| `--sc-radius-full` | border-radius (pill) |
| `--sc-font-size-50` | text xs |
| `--sc-font-size-100` | text sm |
| Dot size | 6px (xs), 8px (sm) |
| Close button size | 14px |

## Decisiones de diseño SC

- **Pintar el dot SIEMPRE**: incluso en xs el dot es visible (6px). Sin dot el chip es solo texto, pierde la metáfora "etiqueta de color" del modelo Label.
- **Color de la entity, no severity**: este chip NO refleja status (success/error) sino la categoría arbitraria asignada por el usuario. El sistema admite cualquier color de la paleta `LabelColor`.
- **`[removable]` opcional**: list cells suelen pintar `<sc-label-chip>` sin × (solo display). Pickers de formulario añaden `[removable]` para permitir quitar la asignación inline.
- **`(remove)` solo emite — no muta**: el caller decide qué hacer (eliminar de un Set, refrescar lista, etc.). Mantiene el chip stateless.
- **`event.stopPropagation()` en × click**: evita que el click del × propague al chip entero (que puede tener su propio handler como abrir detalle).

## Uso en AED

**3 instancias**:
- `agent-form-page` advanced section "Etiquetas asignadas" — picker con `[removable]`.
- List cells de agentes que muestran las etiquetas vinculadas (read-only).

## Página demo

Pendiente — gallery `/components/label-chip` con:
- Todos los colores de la paleta `LabelColor`.
- Sizes sm + xs lado a lado.
- Removable vs no-removable.
- Wrap behavior en contenedores estrechos.

## Figma reference

Smart Contact Prime kit tiene `❖ Chip` ([node 6738:55109](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-55109)) — el sc-label-chip COVERS ese Figma (categorical con color custom + removable). El `❖ Tag` Figma ([node 6738:55116](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-55116)) cubre severity-fill, es el gap `<sc-tag>` pendiente.
