# 10 · Toast (`<p-toast>` + custom template)

> **Type**: Custom-preset · **AED uses**: 1 · **Figma parity**: 1:1 con Figma

> Notificación efímera (success / info / warn / error / secondary / violet) anclada a una esquina. SCDS NO crea un componente standalone — usa el `<p-toast>` de PrimeNG con un `pTemplate="message"` override + tokens `--sc-toast-*` (capa 4). Categoría: 🟣 **Custom-preset + custom template**.
>
> **Auditado 1:1 con Figma `Smart Contact Prime → ❖ Toast` (canvas `6738:53165`) — Session 30.** 24 close-button variants + 6 severities. Tokens extraídos por severity.

## TL;DR

```typescript
import { MessageService } from 'primeng/api';

constructor(private messages = inject(MessageService)) {}

this.messages.add({
  severity: 'success',
  summary: 'Guardado',
  detail: 'Cambios aplicados.',
  life: 3000,
});
```

El template del toast vive **inline** en `apps/supervisor/src/app/app.component.html` (no es un componente importable). Está conectado al servicio `MessageService` que cualquier componente puede inyectar y llamar `add()` para mostrar un toast.

## Cuándo usarlo

- Confirmar acción exitosa ("Guardado", "Eliminado", "Renombrado").
- Notificar error recuperable ("No se pudo guardar — reintenta").
- Avisar de cambio de estado de fondo ("Nuevo agente conectado").
- Patrón **undo**: toast con botón "Deshacer" durante un breve período de gracia tras una acción destructiva (ver `UndoStackService`).

## Cuándo NO usarlo

- Texto crítico que el usuario DEBE leer → `<sc-modal>` con confirmación.
- Estado permanente (banner de "Trial expira en 3 días") → componente banner inline (TBD).
- Mensaje persistente sobre un campo → helper text inline en `<sc-inputtext>`.

## API (MessageService.add)

```typescript
interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
  summary?: string;          // título (negrita)
  detail?: string;           // cuerpo descriptivo
  life?: number;             // ms antes de auto-dismiss (default 3000)
  sticky?: boolean;          // true = no auto-dismiss
  data?: {
    undoEntryId?: string;    // SC extension — añade botón "Deshacer"
    [key: string]: unknown;
  };
}
```

### Severities y su mapeo SC

| `severity` | Color guide | SC tone | Cuándo usar |
|------------|-------------|---------|-------------|
| `success` | green-200 border, green-600 icon | celebración | guardado, completado |
| `info` | azure-200 border, azure-600 icon, electric-blue icon-bg | informativo | notificación de fondo |
| `warn` | amber-200 border, amber-600 icon | atención | quota baja, dependencia |
| `error` | red-200 border, red-600 icon | recuperable | "no se pudo guardar" |
| `secondary` | **violet** (SC override, NO slate de Figma) | "neutral notice" | "borrador creado", "renombrado" |
| `contrast` | (no usado en AED) | high-contrast | reservado |

**SC overload**: el slot `severity='secondary'` de PrimeNG está mapeado a un **violeta** custom (no al slate de Figma). Es deliberado — el "neutral notice" en AED necesitaba ser más visible que el slate apagado. La paleta violet es SC-only (no existe en Figma toast variants).

## Tokens consumidos (Figma → SC) — matriz exhaustiva

Verificados Session 30. Geometría compartida entre severities, colores por severity.

### Geometría compartida (todas las severities)

| Token Figma | Valor | Mapeo SC | Notas |
|-------------|-------|----------|-------|
| `toast/width` | `350` | `--sc-toast-width: 350px` | (era 400, fix Session 30) |
| `toast/border/radius` | `6` | `--sc-toast-radius: var(--sc-radius-200)` | (era 12, fix) |
| `toast/content/padding` | `10.5` | `--sc-toast-padding-{x,y}: 10.5px` | raw decimal Figma |
| `toast/content/gap` | `7` | `--sc-toast-gap-content: 7px` | icon ↔ body |
| `toast/text/gap` | `7` | `--sc-toast-gap-text: 7px` | summary ↔ detail |
| `toast/icon/size` | `15.75` | `--sc-toast-icon-size: 15.75px` | glyph (era 24, fix) |
| `toast/close/button/width` | `24.5` | `--sc-toast-close-button-width: 24.5px` | |
| `toast/close/button/height` | `24.5` | `--sc-toast-close-button-height: 24.5px` | |
| `toast/close/button/border/radius` | `12.25` | `--sc-toast-close-button-radius: 12.25px` | = w/2 → circular |
| `toast/close/icon/size` | `14` | `--sc-toast-close-icon-size: 14px` | |
| `toast/blur` | `1.5` | `--sc-toast-backdrop-blur: 1.5px` | backdrop-filter |
| `toast/summary/font/size` | `14` | `--sc-toast-summary-font-size: 14px` | |
| `toast/summary/font/weight` | `500` | `--sc-toast-summary-font-weight: 500` | medium |
| `toast/detail/font/size` | `12.25` | `--sc-toast-detail-font-size: 12.25px` | raw |
| `toast/detail/font/weight` | `500` | `--sc-toast-detail-font-weight: 500` | |
| `toast/<sev>/shadow` | `#0X0X0X0A offset(0,4) r8` | `--sc-toast-shadow` | flatten para todas las severities |

### Per-severity

| Severity | `bg` (Figma) | `bg` (SC) | `border` | `icon color` |
|----------|--------------|-----------|----------|--------------|
| success  | `#f0fdf4f2` (green-50 alpha 95%) | `color-mix(green-50 95%, transparent)` | `green-200` | `green-600` |
| info     | `#eff6fff2` (blue-50 alpha 95%) | `color-mix(azure-50 95%, transparent)` | `azure-200` | `azure-600` |
| warn     | `#fefce8f2` (yellow-50 alpha 95%) | `color-mix(amber-50 95%, transparent)` | `amber-200` | `amber-600` |
| error    | `#fef2f2f2` (red-50 alpha 95%) | `color-mix(red-50 95%, transparent)` | `red-200` | `red-600` |
| secondary | `#f1f5f9` (slate-100, sólido) | **violet (SC overload)** | violet-200 | violet-600 |
| contrast | high-contrast slate | (no en AED) | — | — |

**Backdrop blur 1.5px** + bg con alpha 95% → efecto "frosted glass" (notification flotante sobre contenido). Este patrón es 100% Figma — no es invento SC.

## SC extensions sobre PrimeNG

1. **Action button** (`data: { undoEntryId }`) — añade un botón "Deshacer" al template. Figma NO modela este slot. Implementado en `app.component.html` con `@if (message.data?.undoEntryId)`. Estilizado con dos variantes: outlined neutral (default) y solid primary (`data-action="solid"` en el toast root o `.sc-toast__action--solid` en el button).

2. **Icon-square chrome** — el glyph va dentro de un cuadrado coloreado con el `--sc-toast-<sev>-icon-bg`. Figma muestra el glyph "pelado" sin background. Esta extensión añade peso visual + permite invertir el color del glyph (blanco sobre color). Mantenido en SC.

3. **Severity `secondary` → violet** — overload documentado arriba.

4. **Position fija `bottom-right`** — Figma no especifica posición. PrimeNG soporta `bottom-right / top-right / center / etc.` Configurado en `<p-toast position="bottom-right">` en `app.component.html`.

## Patrón Undo

```typescript
// Triggering an undoable action
const undoId = this.undoStack.push({ type: 'delete-agent', id });
this.messages.add({
  severity: 'success',
  summary: this.translate.instant('agents.deleted', { name }),
  life: 5000,
  data: { undoEntryId: undoId },
});
```

El botón "Deshacer" llama `onUndoClick(undoId)` en `AppComponent` que invoca `UndoStackService.undo(undoId)`. El toast se cierra cuando el botón se pulsa OR cuando expira `life`.

## Migración / patrones AED actuales

8+ callsites de `messages.add()` en AED ya usan severities standard. No cambia el API — solo cambia el aspecto visual:
- Más compacto (350 vs 400 width, 10.5 vs 16 padding)
- Bordes más sutiles (severity-200 vs severity-500/600)
- Bg semi-transparente con blur (frosted glass)
- Close button circular 24.5px

Diff visible al ojo: el toast quedará más ligero y elegante. Test en sesión 31.

## Página demo

Pendiente para Session 31 — gallery `/components/toast` con basic, severities, undo action, sticky, long message wrap.

## Figma reference

`Smart Contact Prime → ❖ Toast` (canvas `6738:53165`).
- `Parts` (`6872:72565`) — 24 close-button variants (Severity × Hover × Focus)
- `Components` (`6872:72567`) — 6 toasts canónicos por severity (Success/Info/Warn/Error/Secondary/Contrast)
- `Examples` (`6872:72569`) — light + dark mode previews
