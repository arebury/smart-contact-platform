# 11 · Modal / Dialog (`<sc-modal>`)

> **Type**: Extended · **AED uses**: 2 · **Figma parity**: 1:1 con Figma

> Shell modal canónico con header + body slot + footer. Envuelve `<p-dialog>` de PrimeNG con focus trap / ESC / mask / animación, pero la chrome visual es 100% SC.
>
> **Auditado 1:1 con Figma `Smart Contact Prime → ❖ ConfirmDialog` (canvas `6738:50207`) — Session 30.** Tokens `dialog/*` extraídos vía MCP (Dialog y ConfirmDialog comparten el mismo set de tokens — son el spec del shell, ConfirmDialog es solo un caso de uso típico).
>
> Las URLs Figma que dio el usuario (ConfirmDialog `6738:50207` y ConfirmPopup `6738:50208`) son patrones específicos. El componente `<sc-modal>` es el SHELL general que cubre cualquier caso de uso (confirm, form, info, picker, etc.) — el body es free-slot.

## TL;DR

```html
<sc-modal
  [visible]="open()"
  title="¿Eliminar agente?"
  subtitle="Esta acción no se puede deshacer."
  [icon]="trashIcon"
  (cancelled)="open.set(false)"
>
  <!-- Body slot: cualquier markup. Stacking natural. -->
  <p>El agente y todos sus mensajes serán eliminados permanentemente.</p>
  <sc-input label="Escribe el nombre para confirmar" [(value)]="confirmName" />

  <!-- Footer slot (proyectado vía [modal-actions]): action row -->
  <div modal-actions>
    <button class="btn btn--secondary" (click)="open.set(false)">Cancelar</button>
    <button class="btn btn--danger" (click)="confirm()">Eliminar</button>
  </div>
</sc-modal>
```

## Anatomía

```
┌──────────────────────────────────────┐
│  [icon] Title                   [×]  │  ← header (slot via inputs)
│         Subtitle                     │
├──────────────────────────────────────┤
│                                      │
│  <ng-content> — free slot, stacks    │  ← body (free slot)
│  cualquier markup (párrafos, forms,  │
│  componentes sc-*, listas, etc.)     │
│                                      │
├──────────────────────────────────────┤
│           [Cancelar]  [Confirmar]    │  ← footer (slot via [modal-actions])
└──────────────────────────────────────┘
```

NO hay líneas divisorias entre header / body / footer — la jerarquía sale del padding scheme + tipografía (Figma reference).

## Slots

### Header — input-driven (no projection)

| Prop | Tipo | Notas |
|------|------|-------|
| `title` | `string` | **requerido** — título principal del modal |
| `subtitle` | `string \| null` | secondary line bajo el título |
| `icon` | `LucideIcon \| null` | icono leading 28×28 (Figma `confirmdialog/icon/size`) |
| `closable` | `boolean` | default `true` — muestra el botón `×` |

### Body — free projection (`<ng-content>`)

Cualquier markup. **Stacking natural**: el body es `display: flex; flex-direction: column; gap: var(--sc-spacing-300)` por defecto, así que los elementos directos quedan apilados con 16px de gap. Override en el wrapper si necesitas otro layout (grid, horizontal, etc.).

```html
<sc-modal title="Editar agente" [visible]="...">
  <!-- elementos se apilan verticalmente con gap automático -->
  <sc-input label="Nombre" [(value)]="name" />
  <sc-input label="Email" type="email" [(value)]="email" />
  <sc-select label="Grupo" [options]="groups" [(value)]="groupId" />
  <sc-toggle-switch [checked]="active" label="Activo" />

  <div modal-actions>
    <button class="btn btn--secondary" (click)="dismiss()">Cancelar</button>
    <button class="btn btn--primary" (click)="save()">Guardar</button>
  </div>
</sc-modal>
```

### Footer — slot-attribute projection (`<ng-content select="[modal-actions]">`)

Elementos con atributo `modal-actions` quedan proyectados al footer. Layout horizontal, alineados a la derecha, gap 7px (Figma `dialog/footer/gap`).

```html
<div modal-actions>
  <button class="btn btn--secondary">Cancelar</button>
  <button class="btn btn--primary">Confirmar</button>
</div>
```

Si tu modal no necesita footer, pasa `[hasFooter]="false"`.

### Bodyless (modal compacto)

Para confirmaciones simples donde la descripción cabe en el subtitle:

```html
<sc-modal
  title="¿Descartar cambios?"
  subtitle="Perderás lo que has editado en este formulario."
  [bodyless]="true"
  [visible]="open()"
>
  <div modal-actions>
    <button class="btn btn--secondary" (click)="dismiss()">Cancelar</button>
    <button class="btn btn--danger" (click)="discard()">Descartar</button>
  </div>
</sc-modal>
```

Sin el `body` slot, el modal se contrae: header + footer pegados sin band visual entre ellos.

## API

```typescript
interface ScModalProps {
  visible: boolean;                  // requerido
  title: string;                     // requerido
  subtitle?: string | null;
  icon?: LucideIcon | null;
  width?: string;                    // default '440px' (CSS unit)
  closable?: boolean;                // default true
  hasFooter?: boolean;               // default true
  bodyless?: boolean;                // default false
  // Output
  cancelled: () => void;             // emitted on close (X click, ESC, mask click)
}
```

## Tokens Figma → SC

Verificados vía MCP en `dialog/*` (node `323:12318` ConfirmDialog=True).

### Geometría (compartida con cualquier Dialog SC)

| Token Figma | Valor | Mapeo SC |
|-------------|-------|----------|
| `dialog/background` | `#ffffff` | `--sc-modal-bg = --sc-color-gray-0` |
| `dialog/border/color` | `#e2e8f0` (slate-200) | `--sc-modal-border` (era blue-100, **fix Session 30**) |
| `dialog/border/radius` | `12` | `--sc-modal-radius = --sc-radius-400` |
| `dialog/shadow` | double drop-shadow `#0000001A` offset(0,8)r10-6 + offset(0,20)r25-5 | `--sc-modal-shadow` (double layer) |
| `dialog/color` | `#334155` (slate-700) | content text color |
| `dialog/header/padding` | `17.5` raw decimal | `--sc-modal-padding` |
| `dialog/header/gap` | `7` | `--sc-modal-header-gap` |
| `dialog/content/padding/{left,right,bottom}` | `17.5` | idem (top: 0 para evitar doble padding con header) |
| `dialog/footer/padding/{left,right,bottom}` | `17.5` | idem (top: 0) |
| `dialog/footer/gap` | `7` | `--sc-modal-footer-gap` |
| `dialog/title/font/size` | `17.5` raw | `--sc-modal-title-font-size` |
| `dialog/title/font/weight` | `600` (semibold) | `--sc-modal-title-font-weight` |

### ConfirmDialog-specifics (extension del shell)

| Token Figma | Valor | Notas |
|-------------|-------|-------|
| `confirmdialog/icon/color` | `#334155` (slate-700) | el icono del confirmdialog |
| `confirmdialog/icon/size` | `28` | `--sc-modal-head-icon-size` (28×28) |

ConfirmDialog usa los mismos `dialog/*` tokens del shell + estas dos additions para el icono leading.

### ConfirmPopup (componente distinto, no es sc-modal)

ConfirmPopup (canvas `6738:50208`) es un popup anclado a un trigger button. **No es lo mismo que sc-modal**. Si en algún momento aparece caso real en AED para confirmaciones inline (sin modal), considerar `<p-confirmPopup>` directo o crear `<sc-confirm-popup>` separado. Tokens documentados al final por completeness.

| Token Figma | Valor |
|-------------|-------|
| `confirmpopup/background` | `#ffffff` |
| `confirmpopup/border/color` | `#e2e8f0` |
| `confirmpopup/border/radius` | `6` (más pequeño que dialog) |
| `confirmpopup/content/padding` | `10.5` |
| `confirmpopup/content/gap` | `14` |
| `confirmpopup/footer/padding/*` | `10.5` |
| `confirmpopup/footer/gap` | `7` |
| `confirmpopup/icon/size` | `21` |
| `confirmpopup/gutter` | `10` (anchor distance to trigger) |
| `confirmpopup/shadow` | smaller double-layer than dialog |

## Cambios Session 30 (visual diff en AED)

- Border color: blue-100 → **slate-200** (fix — el azul claro era un legado pre-audit).
- Padding header / body / footer: mixed (24/20) → **17.5 uniforme** con scheme top:0 en body y footer (evita doble padding en costuras).
- Header gap: 12px → **7px**.
- Footer gap: 32px (`spacing-600`) → **7px**. ⚠ El gap previo era una decisión SC ("opposing choices breathing room"). Si Marta prefiere mantener wider gap, se puede sobreescribir vía `[modal-actions]` wrapper CSS o reintroducir como prop opcional.
- Title font: tokens `h4` → **17.5px / weight 600** (raw Figma decimals).
- Shadow single 24px → **double layer** matching Figma reference (more elevated).
- Removed border-bottom from header + border-top from footer — Figma no tiene dividers internos. El padding scheme + tipografía dan la jerarquía sin necesidad de líneas.
- Body slot: ahora `display: flex; flex-direction: column; gap: 16px` por defecto (era plain block) — **stacking natural** de elementos hijos sin necesidad de wrapper.

## SC extensions sobre PrimeNG Dialog

1. **3-slot shell pattern** (header / body / footer) — PrimeNG p-dialog tiene su propia chrome con `header` / `content` / `footer` templates, pero SC los reemplaza completamente para que la API sea declarativa (inputs en lugar de templates).
2. **Body slot stacking default** — `<ng-content>` es `display: flex; flex-direction: column; gap` para que el patrón más común (form vertical) funcione sin wrapper.
3. **`[bodyless]` mode** — compact confirm dialogs sin body band visual.
4. **Lucide icon en header** — SC usa `LucideAngularModule` en lugar de la PrimeIcon que esperaría Aura.

## Migración / patrones AED actuales

`<sc-modal>` se usa en varios sitios de AED (confirm-host, impact-preview-dialog, delete-entity-dialog, otros). El cambio Session 30 es solo visual:
- Bordes más sutiles (slate-200 vs blue-100)
- Padding más ligero (17.5 vs 24)
- Title más pequeño (17.5 vs h4 que era ~20)
- Footer gap más tight (7 vs 32)

API sin cambios — ningún callsite necesita actualización.

## Página demo

Pendiente Session 31 — gallery `/components/modal` con basic / confirm / form-inside-modal / scrolling-body / bodyless.

## Figma references

- `Smart Contact Prime → ❖ ConfirmDialog` (canvas `6738:50207`)
- `Smart Contact Prime → ❖ ConfirmPopup` (canvas `6738:50208`) — NO es sc-modal, componente distinto
- (Future) `Smart Contact Prime → ❖ Dialog` (canvas TBD — usuario nos pasará URL si decide separar)
