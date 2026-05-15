# 33 · Confirm Host (`<sc-confirm-host>`)

> Host único que renderiza todas las confirmaciones programáticas de la app (route-guard discard, futuro logout, etc.) a través del shell canónico `<sc-modal>`. Lee state de `ConfirmHostService` y rutea clicks de buttons de vuelta al service. Mounted una vez en `app.component.html`.
>
> Categoría ⚪ **Pure SC** — pattern app-level. Composición sobre `<sc-modal>` (Extended).

## TL;DR

```html
<!-- En app.component.html, una sola vez -->
<sc-confirm-host />
```

```typescript
// En cualquier servicio / guard, pedir confirmación:
const ok = await this.confirmService.request({
  title: 'Descartar cambios',
  message: 'Has hecho cambios que no se guardarán.',
  acceptLabel: 'Descartar',
  rejectLabel: 'Seguir editando',
  acceptTone: 'danger',
  emphasis: 'reject',  // → reject button = primary visual
});
if (ok) { /* descartar */ }
```

## Cuándo usarlo

- Confirmaciones **programáticas** disparadas desde servicios / guards / efectos (no desde un template directamente).
- Casos donde el llamador es async y necesita `await` el resultado (boolean).
- Reemplaza `window.confirm()` con un dialog branded.

## Cuándo NO usarlo

- Confirmaciones específicas de feature → usar `<sc-modal>` directo en el template de esa feature.
- Delete entity → usar `<sc-delete-entity-dialog>` (chrome especializado).
- Bulk operation → usar `<sc-impact-preview-dialog>`.

## Anatomía

```
┌────────────────────────────────────────┐
│  [⚠️]  Descartar cambios        [✕]    │
├────────────────────────────────────────┤
│  Has hecho cambios que no se          │
│  guardarán.                            │
│                                        │
│         [Seguir editando]  [Descartar] │
│         ↑ primary           ↑ danger   │
└────────────────────────────────────────┘
```

Alert icon leading + title + message + 2 buttons. El **énfasis** (cuál button es primary visualmente) configurable.

## API

```typescript
// State enviada por ConfirmHostService
interface ConfirmState {
  title: string;
  message: string;
  acceptLabel?: string;            // default "Aceptar"
  rejectLabel?: string;            // default "Cancelar"
  acceptTone?: 'primary' | 'danger';
  emphasis?: 'accept' | 'reject';  // qué button visualmente "primary"
}

// Service public API
interface ConfirmHostService {
  state: Signal<ConfirmState | null>;
  request(options: ConfirmRequest): Promise<boolean>;
  accept(): void;
  reject(): void;
}
```

El componente NO tiene props. Lee `host.state()` del service injected.

## Button class computation

| `emphasis` | `acceptTone` | Accept button | Reject button |
|---|---|---|---|
| `accept` (default) | `primary` (default) | `btn btn--primary` | `btn btn--secondary` |
| `accept` | `danger` | `btn btn--danger` | `btn btn--secondary` |
| `reject` | `primary` | `btn btn--secondary` | `btn btn--primary` |
| `reject` | `danger` | `btn btn--danger-subtle` | `btn btn--primary` |

`emphasis: 'reject'` se usa cuando QUEDARSE en la operación actual es lo seguro (e.g. "Descartar cambios" — el primary debe ser "Seguir editando" para evitar destruction accidental).

## Tokens consumidos

Hereda los del `<sc-modal>` (ver `docs/components/11-modal.md`). Sin styling adicional propio relevante.

| Token | Uso |
|-------|-----|
| `--sc-icon-warning` | alert icon (lucide AlertTriangle) |
| Button tokens | heredan del global `_buttons.scss` |

## Decisiones de diseño SC

- **Singleton host**: un solo `<sc-confirm-host>` mounted globalmente evita N modals competing si dos servicios piden confirm simultáneamente. El service cola las requests (FIFO) o reemplaza la actual (overwrite) — decisión del service, no del componente.
- **Service-driven, async Promise**: `request()` devuelve Promise<boolean> → el guard puede `await`. Más limpio que callbacks.
- **`emphasis: 'reject'` para flow safety**: cuando el accept es destructivo y reject es safe, hacemos el reject visualmente primary. Evita que el usuario hit Enter por inercia destruyendo data.
- **Construido sobre `<sc-modal>`**: heredamos shell + Escape behavior + body portal + a11y. Si `<sc-modal>` evoluciona, este host se beneficia gratis.

## A11y

- Modal con `role="dialog"` + `aria-modal="true"` (heredado).
- Title con `aria-labelledby` apuntando al h2.
- Escape cierra como reject.
- Focus inicial en el button "safe" según emphasis (no destructive).

## Uso en AED

**1 instancia** (singleton):
- `app.component.html` — mounted una vez global.

Disparado desde:
- `dirty-form.guard.ts` cuando el usuario navega fuera de un form sucio.
- Futuro: logout confirmation, batch delete trigger from CLI, etc.

## Página demo

Pendiente — gallery `/components/confirm-host` con:
- emphasis accept + tone primary.
- emphasis accept + tone danger (delete pattern).
- emphasis reject (descartar cambios).
- Long message.
- Dark mode.

## Figma reference

**No aplica** — composición sobre `<sc-modal>` (que sí tiene Figma reference). Si Marta modela el flujo confirm específicamente, anotar URL.
