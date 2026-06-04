<!-- Base del port del proyecto convergido. Generado + verificado adversarialmente contra el código real (workflow multi-agente) en S70 (2026-06-04). Decisiones fijas: DD-12 (naming) + escala 14-base. -->

# Manifiesto de convergencia — Smart Contact Design System

> Documento base del port. Define cómo se construye el proyecto convergido = unión del SCDS nuestro + la librería `smartcontact-ui` de los devs. Versión inicial; pendientes y validaciones de ejecución en §8.

---

## 1. Propósito y alcance

Este manifiesto es la **base del port** del proyecto convergido: un único Design System que une lo construido por nosotros (SCDS, paquete `@sc/design-system`) con la librería `smartcontact-ui` de los devs (`@smartcontact/styles` + `@smartcontact/icons` + `@smartcontact/components`).

**Qué cubre:** el catálogo unión de componentes, la resolución de los solapes, los huecos de cobertura, la estructura de empaquetado objetivo y el plan de port por fases.

**Filosofía — "nosotros definimos, ellos construyen":** el proyecto convergido es **nuestro**. No se empuja a su repo. Se monta con **su estructura de empaquetado** (split de 3 paquetes publicables vía ng-packagr + `provideSmartContactUi()`) + **todo lo nuestro** (tokens 14-base, contrato `--sc-*`, preset que referencia `var(--sc-*)`, tooling de parity) + **los primitivos suyos que nos faltan** (los wrappers PrimeNG genéricos que no tenemos). Nosotros fijamos el contrato (naming, escala, tokens, preset); ellos lo construyen leyendo el Figma/Kit Pro.

**Anclaje a fuente de verdad:** el Figma / Smart Contact Prime UI Kit Pro manda en naming y métricas. Los `--sc-*` son la única fuente de verdad de valores; el preset solo redirige `--p-*` → `--sc-*`.

---

## 2. Decisiones fijas

Decisiones ya cerradas. No se re-litigan; se reflejan tal cual.

### 2.1 Naming — DD-12 (extiende DD-8)

**Regla del nombre unificado:**

- Si el componente **envuelve un componente PrimeNG** → `sc-` + nombre PrimeNG **pegado** (sin guión). Ejemplos: `p-inputtext` → `sc-inputtext`, `p-toggleswitch` → `sc-toggleswitch`, `p-radiobutton` → `sc-radiobutton`, `p-progressbar` → `sc-progressbar`, `p-progressspinner` → `sc-progressspinner`.
- Si es **invención propia sin equivalente PrimeNG** → kebab descriptivo. Ejemplos: `sc-section-card`, `sc-empty-state`, `sc-bulk-action-bar`.

**Razón:** el Figma/Kit Pro nombra los componentes pegado, y los devs construyen leyendo el Figma. Hablar el mismo idioma.

**Quién realinea:** los **devs** realinean los **5** que hoy llevan guión. Nosotros: **0 renames**. (Los 5 son exactamente `sc-input-text`, `sc-toggle-switch`, `sc-radio-button`, `sc-progress-bar`, `sc-progress-spinner`. `sc-bulk-transcription-modal` lleva guiones internos pero es kebab-custom legítimo — flujo de negocio, no wrapper PrimeNG — y por eso **no cuenta** ni se realinea.)

| Nombre dev actual (con guión) | Nombre unificado DD-12 (pegado) |
|---|---|
| `sc-input-text` | `sc-inputtext` |
| `sc-toggle-switch` | `sc-toggleswitch` |
| `sc-radio-button` | `sc-radiobutton` |
| `sc-progress-bar` | `sc-progressbar` |
| `sc-progress-spinner` | `sc-progressspinner` |

### 2.2 Escala — 14-base manda

- **Fuente de verdad:** Figma / Kit Pro → escala **14-base** (rampa única `m×14px`: 7 / 14 / 21 / 28 …), naming derivado del valor (`v/14`: `--sc-scale-1`, `--sc-scale-0-875`, `--sc-scale-1-125`), valores con `px` explícito.
- **Su repo usa 8-point** (4 / 8 / 12 / 16 / 24 / 32, unitless, naming numérico escalonado `--sc-spacing-50/100/200…`) → **converge a 14-base**. Su `spacing.css`/`radius.css` 8-point se sustituyen por nuestra escala.
- Font-size y line-height son **alias semánticos de `--sc-scale-*`**.

> **Choque bloqueante a resolver primero:** ambos usan prefijo `--sc-*` pero con **dos sistemas incompatibles** (8-point unitless `--sc-spacing-100`=8 vs 14-base px `--sc-scale-1`=14px) y dos convenciones de naming. La convergencia exige **una sola tabla de escala — la nuestra, 14-base —** regenerada en el paquete de tokens de ellos, y un barrido de sus wrappers que hoy consumen `--sc-spacing-*`/`--sc-space-*` para que apunten a `--sc-scale-*`.

### 2.3 Contrato `--sc-*` y preset

- **`--sc-*` = única fuente de verdad** de valores (7 capas `tokens/layers/01-primitive…07-dark.css`).
- **Preset que referencia `var(--sc-*)`** (el nuestro, `definePreset(Aura, …)`): cada slot apunta a `var(--sc-color-*)` / `var(--sc-radius-*)`. Cambias el token y el preset lo hereda sin tocar el `.ts`.
- **NO** se adopta su `base.ts` con **hex hardcodeados** (`#ef4444ff`, corporativo `#344a70`…): es doble fuente y drift garantizado. Su preset se **reescribe** para apuntar a `var(--sc-*)`.
- **Sí** se conserva la **modularización por-componente** de su preset: **~82 módulos por-componente + `base.ts` + `index.ts` (que cierra con `} satisfies Preset` y `export default`) + `extend.ts` = 85 ficheros** en `theme/sc-preset/` — más limpia que nuestro `sc-preset.ts` monolítico. Nuestros overrides se portan a esa estructura.
- **Tooling de parity/gen es nuestro** (`tokens:parity`, `tokens:gen`, `tokens:import`): es el guardarraíl pre-commit que ellos no tienen. Se conecta a su `convert-tokens.js` (su "import") — no se pierde.

### 2.4 Estructura / empaquetado objetivo

**Su estructura de empaquetado + nuestros tokens/preset/tooling.** Split de 3 paquetes ng-packagr publicables (`@smartcontact/styles`, `@smartcontact/icons`, `@smartcontact/components`) + `sc-demo` privado de referencia. API de setup pública `provideSmartContactUi()`. Detalle concreto en §6.

---

## 3. Catálogo unión (tabla Rosetta)

Una fila por componente del **unión**. Marca: **común** (en ambos), **solo nuestro**, **solo suyo**. El *Nombre unificado* sigue DD-12 (pegado para wrappers PrimeNG, kebab para custom). Orden: comunes → wrappers PrimeNG → custom.

Convención de columnas: `¿Nuestro?` / `¿Suyo?` = aparece hoy en ese catálogo; cuando el nombre difiere entre lados se anota el alias.

### 3.1 Comunes (en ambos catálogos)

| Nombre unificado | Base PrimeNG | Tipo | ¿Nuestro? | ¿Suyo? | Acción / estado |
|---|---|---|---|---|---|
| `sc-inputtext` | `p-inputtext` | wrapper | Sí (`sc-inputtext`) | Sí (alias `sc-input-text`) | Convergir. Devs renombran `sc-input-text` → `sc-inputtext` (DD-12). Conservar nuestra chrome de campo (label/required/helper/error) + CVA + variantes filled/iftaLabel. Nota: **`filled` existe en AMBOS lados** (su `variant: 'outlined'\|'filled'`); el aporte exclusivo de ellos es `fluid` (+ `size`, `readonly`) — reconciliar sin doble-trabajo. |
| `sc-select` | `p-select` | wrapper | Sí (`sc-select`) | Sí (`sc-select`) | Convergir. Mismo nombre. Conservar nuestra re-proyección de `pTemplate` (item/selectedItem), iftaLabel, appendTo, CVA; reconciliar con su API (`showClear`, `filter`). |
| `sc-toggleswitch` | `p-toggleswitch` | wrapper | Sí (`sc-toggleswitch`) | Sí (alias `sc-toggle-switch`) | Convergir. Devs renombran `sc-toggle-switch` → `sc-toggleswitch` (DD-12). Nuestra API estable `[checked]`/`(checkedChange)`; reconciliar `readonly`/`size`/`inputId` de ellos. |
| `sc-dialog` | `p-dialog` | wrapper | Sí (`sc-dialog`) | Sí (`sc-dialog`) | Convergir. Mismo nombre, **APIs divergentes**: el nuestro pinta toda la card (header icon+title+subtitle+close, footer projection) con `[visible]` declarativo; el suyo es wrapper fino con `header`/`position`/`draggable`. Validar al migrar: conservar nuestra card canónica como capa sobre el wrapper fino, o unificar inputs. |
| `sc-checkbox` | `p-checkbox` (suyo) / nativo (nuestro) | **divergente** | Sí (custom, `<input>` nativo tri-estado) | Sí (wrapper `p-checkbox`) | **Validar al ejecutar.** El nuestro es custom deliberado (a11y nativa, tri-estado none/some/all imperativo); el suyo wrappea `p-checkbox` con `indeterminate`. Decidir base única manteniendo el tri-estado. Sin nombre que cambiar. |

### 3.2 Solo nuestro — wrappers PrimeNG (los ganan ellos)

| Nombre unificado | Base PrimeNG | Tipo | ¿Nuestro? | ¿Suyo? | Acción / estado |
|---|---|---|---|---|---|
| `sc-datepicker` | `p-datepicker` | wrapper | Sí | No | Portar. Su preset ya cubre `datepicker` sin wrapper Angular — encaja directo. |
| `sc-multiselect` | `p-multiselect` | wrapper | Sí | No | Portar. Chrome de campo + CVA + display chip/comma. |
| `sc-inputnumber` | `p-inputtext` (sobre `<input type=number>`) | wrapper | Sí | No | Portar. `primengBase` efectivo = directiva `pInputText`; decisión deliberada vs `p-inputNumber` (documentada). |
| `sc-search` | `p-iconfield` (+ `p-inputicon` + `pInputText`) | wrapper | Sí | No | Portar. Clear button + hint de atajo + CVA + `focus()` público. |
| `sc-inputgroup` | `p-inputgroup` | wrapper | Sí | No | Portar. Addons left/right por content projection. |
| `sc-divider` | `p-divider` | wrapper | Sí | No | Portar. Wrapper 1:1 del Kit Pro (cocinado S69). |
| `sc-column-selector` | `p-popover` | wrapper | Sí | No | Portar. Popover gestor de columnas (visibilidad + CDK drag-drop, persistido en localStorage). |
| `sc-group-popover` | `p-popover` | wrapper | Sí | No | Portar. Celda inline con conteo + lista flotante. |
| `sc-confirmdialog` | `p-confirmdialog` | wrapper | Sí (`sc-confirm-host`) | No | Portar. **Nombre actual `sc-confirm-host` es kebab**; bajo DD-12, al envolver `p-confirmdialog` el unificado pegado sería `sc-confirmdialog`. Validar rename (depende de si se considera wrapper 1:1 o host de servicio — ver §8). Acoplado a `ConfirmHostService` (vive en `@core`). |

### 3.3 Solo nuestro — custom (los ganan ellos)

| Nombre unificado | Base PrimeNG | Tipo | ¿Nuestro? | ¿Suyo? | Acción / estado |
|---|---|---|---|---|---|
| `sc-bulk-action-bar` | none | custom | Sí | No | Portar. Barra de acciones fija al seleccionar filas. Helper `useBulkEntityI18n` acompaña. |
| `sc-bulk-edit-menu` | `p-button` (+ 2× `sc-select`) | custom | Sí | No | Portar. Editor inline "Cambiar [campo] a [valor] [Aplicar]". |
| `sc-color-dot-picker` | none | custom | Sí | No | Portar. Picker de puntos de color (form de Labels). Comparte `LabelColor` con tag/chip. |
| `sc-command-palette` | none | custom | Sí | No | Portar. Overlay Cmd/Ctrl+K. Acoplado a `CommandPaletteService` (`@core`). |
| `sc-empty-state` | none | custom | Sí | No | Portar. Card de empty-state con reserva de min-height (no CLS). |
| `sc-form-danger-zone` | `p-button` (botón interno) | custom | Sí | No | Portar. Sección de acciones irreversibles. |
| `sc-form-section-nav` | none | custom | Sí | No | Portar. Nav de secciones in-form (tabs) con variante flush + dots de error. |
| `sc-icon` | none | custom | Sí | No | **Reconciliar con `@smartcontact/icons`.** Ambos lados tienen `<sc-icon>`; el suyo es paquete propio más maduro (Material Symbols generados). Migrar el nuestro (Material Symbols por ligadura, ejes FILL/wght/opsz) al paquete de iconos de ellos. **Ojo dependencia transitiva:** sus wrappers no usan `<sc-icon>` directo sino que pasan por `sc-component-icon-resolver` (capa de compat de nombres pi→Material) — ver §5.a / §8.8. |
| `sc-inline-rename-cell` | none | custom | Sí | No | Portar. Celda de nombre editable in-place (`<input>` nativo). |
| `sc-keyboard-shortcuts` | none | custom | Sí | No | Portar. Cheat sheet de atajos (tecla `?`). Acoplado a `KeyboardShortcutsService` (`@core`). |
| `sc-page-header` | none | custom | Sí | No | Portar. Header de página estático (rutas no-entidad). |
| `sc-photo-upload` | none | custom | Sí | No | Portar. Uploader de avatar redondo; fallback a ilustración por hash (alimenta el tipo Image de `sc-avatar`). |
| `sc-section-card` | none | custom | Sí | No | **Portar + evolucionar.** Custom legítimo (Figma lo etiqueta "Custom"). Evolucionar al sistema anidado Section → Subsection → Slot del Figma. Ver §4.3. |
| `sc-sticky-form-header` | `p-button` (botón interno) | custom | Sí | No | Portar **retenido**. Ya no en uso activo; conservado para rollback (DD#65). |
| `sc-delete-entity-dialog` | `p-dialog` (vía `sc-dialog`) | custom (compone) | Sí | No | Portar. Compone `sc-dialog` + `p-button`. Acoplado a `ClipboardService`/`MessageService`. |
| `sc-impact-preview-dialog` | `p-dialog` (vía `sc-dialog`) | custom (compone) | Sí | No | Portar. Previsualiza operación bulk con chips podables. |

### 3.4 Solo suyo — wrappers PrimeNG (los ganamos nosotros)

| Nombre unificado | Base PrimeNG | Tipo | ¿Nuestro? | ¿Suyo? | Acción / estado |
|---|---|---|---|---|---|
| `sc-avatar` | `p-avatar` | wrapper | No (teníamos `sc-illustrated-avatar`) | Sí | **Ganar (canónico).** El componente real de ellos expone **`size: 'normal'\|'large'\|'xlarge'` + `shape: 'square'\|'circle'`** (API actual). La **spec Figma objetivo** es más rica (Type Label/Icon/Image, Size 28/42/56, + Badge + AvatarGroup): el Badge y el AvatarGroup son **nodos del Figma, no API construida** — no existen como componentes en su repo, así que serían **trabajo de port**, no algo ya ganado. Nuestro `sc-illustrated-avatar` era el divergente → se retira como standalone, su fallback por hash alimenta el tipo Image. Ver §4.2. |
| `sc-badge` | `p-badge` | wrapper | No | Sí | Ganar. variant→severity, size sm/md/lg/xl. |
| `sc-button` | `p-button` | wrapper | No (lo usábamos como `p-button` directo) | Sí | Ganar. variant/appearance (filled/outlined/text/link), icon, loading. Centraliza el botón que hoy embebemos suelto en varios custom. |
| `sc-card` | `p-card` | wrapper | No | Sí | Ganar. Tarjeta genérica header/subheader (distinta de `sc-section-card`, que es custom de jerarquía). |
| `sc-chip` | `p-chip` | wrapper | No (teníamos `sc-label-chip`) | Sí | **Ganar.** Chip con remoción/disabled. Nuestro sistema de 8 colores categóricos + puntito entra como **variante** (styling). Ver §4.1. |
| `sc-drawer` | `p-drawer` | wrapper | No | Sí | Ganar. Drawer lateral (posición, fullScreen). |
| `sc-message` | `p-message` | wrapper | No | Sí | Ganar. Mensaje inline por severity (closable, variant simple/outlined/text). |
| `sc-panel` | `p-panel` | wrapper | No | Sí | Ganar. Panel colapsable/toggleable. |
| `sc-progressbar` | `p-progressbar` | wrapper | No | Sí (alias `sc-progress-bar`) | Ganar. Devs renombran `sc-progress-bar` → `sc-progressbar` (DD-12). |
| `sc-progressspinner` | `p-progressspinner` | wrapper | No | Sí (alias `sc-progress-spinner`) | Ganar. Devs renombran `sc-progress-spinner` → `sc-progressspinner` (DD-12). |
| `sc-radiobutton` | `p-radiobutton` | wrapper | No | Sí (alias `sc-radio-button`) | Ganar. Devs renombran `sc-radio-button` → `sc-radiobutton` (DD-12). |
| `sc-skeleton` | `p-skeleton` | wrapper | No | Sí | Ganar. Placeholder skeleton (shape/animation/dimensiones). |
| `sc-tag` | `p-tag` | wrapper | No (teníamos `sc-label-chip`) | Sí | **Ganar (canónico para etiquetas de solo lectura).** Estandarizar a `sc-tag` nuestros 3 usos de solo lectura. Sistema de 8 colores + puntito entra como variante. Ver §4.1. |
| `sc-textarea` | `p-textarea` (`pTextarea`) | wrapper | No | Sí | Ganar. Textarea (autoResize, rows, invalid, fluid). |
| `sc-toast` | `p-toast` | wrapper | No | Sí | Ganar. Contenedor de toasts alimentado por `ScToastService` (`provideScToast`). Infra de notificación que nos falta. |

### 3.5 Solo suyo — custom + servicios (los ganamos nosotros)

| Nombre unificado | Base PrimeNG | Tipo | ¿Nuestro? | ¿Suyo? | Acción / estado |
|---|---|---|---|---|---|
| `ScDynamicDialogService` (+ `ScDynamicDialogRef`, `provideScDynamicDialog`) | `primeng/dynamicdialog` (`DialogService`) | servicio | No | Sí | **Ganar (infra).** Servicio genérico para abrir cualquier componente standalone como diálogo al vuelo (`inputValues`). No lo tenemos. Ver §4.4. |
| `sc-bulk-transcription-modal` | none | custom (negocio) | Sí (nuestra impl en Memory) / Sí (impl de ellos) | Sí | **NO es pieza de DS.** Flujo de negocio → feature de **Memory**. Al migrar Memory se valida nuestra implementación vs la suya. Ver §4.4. |

---

## 4. Solapes resueltos

Los 4 solapes detectados están **resueltos y validados con Figma**. Principio rector: **los solapes NO son duplicados a fundir a la fuerza.** Política: conservar lo construido + ganar los genéricos PrimeNG que faltan + diferir refactors.

### 4.1 tag / chip / label-chip → `sc-tag` + `sc-chip` (puntito = variante)

- **`sc-tag`** (su wrapper `p-tag`) = canónico para **etiquetas de solo lectura**, que es como las usamos (3 sitios, sin quitar). Se estandarizan a `sc-tag`. (Su `sc-tag` no tiene remoción; su `sc-chip` sí es removible/disabled — coherente con esta asignación read-only vs quitable.)
- **`sc-chip`** (su wrapper `p-chip`) = canónico cuando hay **quitables** (botón × / removible).
- **`sc-label-chip` (nuestro) se RETIRA** como componente aparte. Su **sistema de 8 colores categóricos + puntito** se mete como **VARIANTE** (styling) de `sc-tag`/`sc-chip`, **no** como componente propio. Los tokens `--sc-label-*` (tipo `LabelColor`, 8 colores cerrados) y el `LABEL_COLORS` que comparte con `sc-color-dot-picker` se conservan como la paleta de esa variante.
- **A validar visualmente** al ejecutar: que el puntito + los 8 colores se vean 1:1 con el Figma dentro de `sc-tag`/`sc-chip` (ver §8).

### 4.2 avatar → un solo `sc-avatar` (ilustración = fallback)

- **UN solo `sc-avatar`** alineado al **Figma genérico** (`❖ Avatar` PrimeOne 4.0). **Spec Figma objetivo:** `Type=Label/Icon/Image`, `Size=28/42/56`, `Circle true/false`, **+ Badge + AvatarGroup**. **API actual del componente de ellos:** `size: 'normal'\|'large'\|'xlarge'`, `shape: 'square'\|'circle'` — sin AvatarGroup ni Badge como componentes (no existen `avatar-group.component.ts` ni wrapper overlaybadge en su repo). Por tanto **Badge y AvatarGroup son trabajo de port hacia la spec Figma**, no algo ya construido. El `sc-avatar` de ellos es la mejor base existente; el nuestro era el divergente.
- **`sc-illustrated-avatar` (nuestro) se RETIRA** como componente standalone. Su comportamiento — **si no hay foto, ilustración SVG por hash del nombre** (pools `illustrated`/`abstract`) — se conserva como **FALLBACK** que alimenta el **tipo Image** de `sc-avatar`. La foto subida sigue ganando sobre la ilustración.
- `sc-photo-upload` se reconecta a ese fallback (hoy ya cae a `sc-illustrated-avatar`/glifo).

### 4.3 section-card → SE QUEDA + evoluciona a Section → Subsection → Slot

- **`sc-section-card` SE QUEDA.** Es **custom legítimo**: el Figma lo etiqueta **"Custom"**, y `card`/`panel` (`sc-card`/`sc-panel`) **no cubren la jerarquía** Section → Subsection → Slot.
- **PERO** el `Section` del Figma es una **evolución más rica** que el código actual: una **Section contiene 1–4 Subsections**, y **cada Subsection contiene 1–5 Slots**.
- **Converger = EVOLUCIONAR** `sc-section-card` a ese sistema anidado (subsecciones + slots), **no tirarlo**. Se conservan sus modos actuales (collapsible, variante flush). Diseño del API anidado a validar al ejecutar (ver §8).

### 4.4 dynamic dialog → SEPARAR en servicio + flujo de negocio

Dos cosas distintas que no se mezclan:

1. **Servicio genérico `ScDynamicDialogService`** (el suyo): infra reutilizable para **abrir cualquier componente standalone como diálogo al vuelo** con `inputValues`, envolviendo `DialogService.open` de `primeng/dynamicdialog`. Expone `open<…>(componentType, config)` → `ScDynamicDialogRef` propio (observables `onClose`/`onDestroy`/… + `close()`/`destroy()`), con `provideScDynamicDialog()`. **No lo tenemos → lo GANAMOS** como infra de DS. (Nuestros diálogos hoy usan el patrón `[visible]` declarativo; este servicio es complementario, no lo reemplaza.)
2. **`sc-bulk-transcription-modal`** = **FLUJO DE NEGOCIO**, no pieza de DS. Sigue siendo **feature de Memory**. Al **migrar Memory** se valida **nuestra implementación vs la suya** (la de ellos compone `sc-button` + `sc-toggle-switch`, i18n propio `sc.bulkTranscriptionModal`, animaciones hero/delta y contadores elegibles).

---

## 5. Huecos

### 5.a Solo ellos → los ganamos nosotros

Wrappers PrimeNG genéricos que **no tenemos** y entran al DS convergido:

- `sc-avatar` (canónico, ver §4.2), `sc-badge`, `sc-button`, `sc-card`, `sc-chip`, `sc-drawer`, `sc-message`, `sc-panel`, `sc-progressbar`, `sc-progressspinner`, `sc-radiobutton`, `sc-skeleton`, `sc-tag`, `sc-textarea`, `sc-toast`.
- Infra: `ScDynamicDialogService` (+ `ScDynamicDialogRef` + `provideScDynamicDialog`), `ScToastService` (+ `provideScToast`).
- **Infra de iconos que se arrastra al portar sus wrappers:** `sc-component-icon-resolver` (`lib/core/icons/`) — capa de compat de nombres de icono **pi→Material Symbols** de la que dependen avatar/button/chip/message/tag y otros. **Decidir si se porta tal cual o se sustituye por nuestro mapeo** al ganar sus wrappers; es una dependencia transitiva real. Junto con ello llegan los **tipos públicos** de `lib/core/types` (`theme-component.types.ts`: `ScSeverity`/`ScComponentSize`/`ScInputVariant`/`ScDialogPosition`/`ScAvatarSize`/`ScAvatarShape`/`ScSkeletonShape`/`ScSkeletonAnimation`/`ScProgressBarMode`; `button.types.ts`; `badge.types.ts`), exportados por su `public-api` — superficie a portar/reconciliar.
- **Cobertura de preset sin wrapper aún** (su `sc-preset` cubre ~80–87 módulos PrimeNG): `accordion`, `datatable`, `breadcrumb`, `menu`, `stepper`, `tabs`, etc. → ganamos el **styling** vía preset aunque el **wrapper Angular** todavía no exista (ver 5.c).

### 5.b Solo nosotros → los ganan ellos

Todo lo de §3.2 + §3.3: los wrappers PrimeNG que solo tenemos (`sc-datepicker`, `sc-multiselect`, `sc-inputnumber`, `sc-search`, `sc-inputgroup`, `sc-divider`, `sc-column-selector`, `sc-group-popover`, `sc-confirmdialog`/`sc-confirm-host`) y **todos nuestros custom** (`sc-bulk-action-bar`, `sc-bulk-edit-menu`, `sc-color-dot-picker`, `sc-command-palette`, `sc-empty-state`, `sc-form-danger-zone`, `sc-form-section-nav`, `sc-icon`, `sc-inline-rename-cell`, `sc-keyboard-shortcuts`, `sc-page-header`, `sc-photo-upload`, `sc-section-card`, `sc-sticky-form-header`, `sc-delete-entity-dialog`, `sc-impact-preview-dialog`).

> **Deuda de aislamiento a saldar al portar:** varios custom nuestros acoplan servicios que viven **fuera** del package, en `apps/supervisor/@core`/`@shared`: `CommandPaletteService`, `ConfirmHostService`, `KeyboardShortcutsService`, `ClipboardService`, `MessageService`, `NAV_ICONS`, `@shared/utils/icon-size`. No son 100% portables sin mover/abstraer esos paths. Resolver al meterlos en `@smartcontact/components`.

### 5.c Faltan en ambos (huecos reales del DS)

Componentes que **ninguno de los dos** tiene como wrapper Angular, pero el **preset de ellos ya estila** — candidatos a crear durante el port:

- **`sc-datatable`** (wrapper de tabla / data-table) — el más prioritario: las list pages lo necesitan y hoy no hay wrapper en ningún lado (solo styling en preset).
- `sc-accordion`, `sc-breadcrumb`, `sc-menu`, `sc-stepper`, `sc-tabs` — estilados por preset, sin wrapper Angular en ninguno de los dos catálogos.

---

## 6. Estructura y empaquetado objetivo

**Molde:** su split de paquetes + `provideSmartContactUi()` + nuestros tokens/preset/tooling.

### 6.1 Split de 3 paquetes ng-packagr publicables + demo

| Paquete | npm name | Origen | Contenido | peerDeps clave |
|---|---|---|---|---|
| tokens | `@smartcontact/styles` | su `projects/design-tokens/` | **nuestros tokens 14-base** (7 capas `01-primitive…07-dark.css`, escala `--sc-scale-*`, alias font-size/line-height) + reset/globals | — (solo tslib) |
| iconos | `@smartcontact/icons` | su `projects/ui-smartcontact-icons/` | `<sc-icon>` + Material Symbols generados (migrar nuestro `components/icon/` aquí — el suyo es más maduro) | `@angular/core` + `@angular/common` |
| componentes | `@smartcontact/components` | su `projects/ui-smartcontact/` | wrappers `sc-*` (los suyos + todos los nuestros) + **preset modular** + `provideSmartContactUi` | primeng, @primeuix/themes, `@smartcontact/icons`, `@smartcontact/styles`, ngx-translate |
| demo | (privado) | su `projects/sc-demo/` | app consumidora de referencia | — |

Cada lib compila con **ng-packagr** (`ng-package.json` → `dist/<lib>`); peerDeps por versión exacta. Esto da **publicabilidad real**, que es lo que hoy nos falta (paquete único privado consumido por path).

### 6.2 Tokens y preset dentro del molde

- **Tokens:** portar nuestras capas 14-base a `src/lib/styles/` de `@smartcontact/styles`, **sustituyendo** su `spacing.css`/`radius.css` 8-point. Conservar su patrón de **auto-generación desde `tokens.json` Figma** (`convert-tokens.js`) pero **alimentado por nuestra ley de escala** (lo que hoy hace `tokens:gen`) — **fundir ambos generadores en uno**.
- **Preset:** dentro de `@smartcontact/components`, estructura **modular por-componente** de ellos (**~82 módulos por-componente + `base.ts` + `index.ts` con `} satisfies Preset` + `extend.ts` = 85 ficheros**), pero con **cada slot apuntando a `var(--sc-*)`** como nuestro `sc-preset.ts`. **Reescribir su `base.ts`** (quitar hex hardcodeados). `prefix:'p'` (variables runtime `--p-*` → redirigidas a `--sc-*`).
- **Tooling de parity/gen nuestro** se conecta a su pipeline: su `convert-tokens.js` = el "import"; nuestro `tokens:parity` = el guardarraíl pre-commit (cruza `tokensprime.json` Kit Pro contra `--sc-*` + preset, bloquea drift). No se pierde.

### 6.3 API de setup pública

- **`provideSmartContactUi(config?)`** (de ellos, en `@smartcontact/components`) como **única frontera de setup**: envuelve `providePrimeNG` + aplica el preset. Elimina el cableado a mano que hoy repite cada app nuestra (`providePrimeNG({ theme: { preset: ScPreset … }})`).
- `prefix` defaultea a `'p'` en su provider, lo que **coincide** con lo que necesitamos — mantener.
- **Acción de port (no estado actual):** su provider hoy defaultea `darkModeSelector: config.theme?.darkModeSelector ?? 'none'`, es decir, **el dark-mode-selector viene desactivado por defecto**. Al adoptar el provider hay que **cambiar ese default `'none'` → `.sc-dark`** para alinearlo con nuestra clase de dark mode. Es trabajo a hacer, no algo que el código de ellos ya traiga.

### 6.4 Build / export portable

- Pipeline de ellos: `build:design-tokens` → `build:icons` → `build:components` (cada uno `ng build <proj>` → `dist/<proj>`); export = `ng build` + `npm pack dist/<proj> --pack-destination dist/archives`.
- **Arreglar el lock a Windows:** sus `export:*` usan `powershell …` para crear `dist/archives` → reemplazar por Node / `mkdir -p` portable (CI Linux + macOS). El flujo `ng build → npm pack → dist/archives` se conserva.

### 6.5 Consumo final por una app

Patrón de ellos, tres piezas con frontera limpia:

1. CSS global: `@import @smartcontact/styles/index.css` + `@import @smartcontact/icons/…`.
2. Provider: `provideSmartContactUi()` en `app.config.ts`.
3. Wrappers `sc-*` standalone desde `@smartcontact/components`.

Nuestras apps (**supervisor**, **ds-docs**) migran de imports por path de monorepo a los **paquetes versionados**.

---

## 7. Plan de port (fases)

> Orden por dependencia: nada de componentes antes de que la escala/preset estén sólidos. El choque de escala §2.2 es **bloqueante** y va en Fase 0.

### Fase 0 — Resolver el choque de escala (bloqueante)

- Decidir tabla única = **14-base nuestra**, regenerada en `@smartcontact/styles`.
- Barrido de los wrappers `sc-*` **de ellos** que consumen `--sc-spacing-*`/`--sc-space-*` → repuntar a `--sc-scale-*`.
- Fundir `convert-tokens.js` (su import) + `tokens:gen` (nuestra ley) en un generador único.

### Fase 1 — Fundaciones (tokens / escala / preset / setup)

- Montar el split de 3 paquetes ng-packagr + `sc-demo` (estructura de ellos).
- Portar capas 14-base + alias semánticos a `@smartcontact/styles`.
- Reescribir su preset modular para apuntar a `var(--sc-*)` (quitar hex de `base.ts`); portar nuestros overrides a la estructura por-componente.
- Conectar `tokens:parity`/`tokens:gen`/`tokens:import` al pipeline; arreglar `export:*` (Windows → Node).
- Publicar `provideSmartContactUi()` como frontera de setup, **cambiando el default `darkModeSelector` `'none'` → `.sc-dark`**; reconciliar `@smartcontact/icons` con nuestro `sc-icon` (migrar el nuestro al paquete suyo) y decidir destino de `sc-component-icon-resolver`.

### Fase 2 — Primitivos PrimeNG que faltan

- **De ellos → nosotros (5.a):** ganar `sc-avatar`, `sc-badge`, `sc-button`, `sc-card`, `sc-chip`, `sc-drawer`, `sc-message`, `sc-panel`, `sc-progressbar`, `sc-progressspinner`, `sc-radiobutton`, `sc-skeleton`, `sc-tag`, `sc-textarea`, `sc-toast` + infra `ScToastService` / `ScDynamicDialogService` (+ se arrastra `sc-component-icon-resolver` y `lib/core/types`).
- **De nosotros → ellos (5.b wrappers):** portar `sc-datepicker`, `sc-multiselect`, `sc-inputnumber`, `sc-search`, `sc-inputgroup`, `sc-divider`, `sc-column-selector`, `sc-group-popover`, `sc-confirmdialog`.
- **Comunes (3.1):** convergir `sc-inputtext` / `sc-select` / `sc-toggleswitch` / `sc-dialog` / `sc-checkbox` (renames del lado de ellos + reconciliar APIs; decidir base de `sc-checkbox`).
- **Hueco real (5.c):** crear `sc-datatable` (prioritario) y, según necesidad, `sc-accordion`/`sc-breadcrumb`/`sc-menu`/`sc-stepper`/`sc-tabs`.

### Fase 3 — Custom nuestros

- Portar todos los custom de §3.3 a `@smartcontact/components`.
- **Saldar la deuda de aislamiento** (5.b): abstraer/mover `CommandPaletteService`, `ConfirmHostService`, `KeyboardShortcutsService`, `ClipboardService`, `MessageService`, `NAV_ICONS`, `icon-size` para que los custom sean portables.
- `sc-sticky-form-header` se porta **retenido** (rollback DD#65).

### Fase 4 — Solapes (migraciones)

- **tag/chip/label-chip (§4.1):** retirar `sc-label-chip`; meter 8 colores + puntito como variante de `sc-tag`/`sc-chip`; migrar los 3 usos de solo lectura a `sc-tag`.
- **avatar (§4.2):** retirar `sc-illustrated-avatar` standalone; cablear el fallback por hash al tipo Image de `sc-avatar`; reconectar `sc-photo-upload`. Portar Badge + AvatarGroup hacia la spec Figma (no existen aún como componentes).
- **section-card (§4.3):** evolucionar a Section → Subsection → Slot (1–4 / 1–5).
- **dynamic-dialog (§4.4):** integrar `ScDynamicDialogService` como infra (ya ganado en Fase 2).

### Fase 5 — Flujos / piloto en su lab

- Migrar **Memory** y, al hacerlo, validar `sc-bulk-transcription-modal` nuestro vs el suyo (§4.4).
- Migrar **supervisor** y **ds-docs** de imports por path a los paquetes versionados.
- Usar `sc-demo` como app de referencia / piloto de validación.

> **Red de seguridad:** tras cualquier toque cross-surface (tokens, preset, renames cross-app, sweeps masivos), correr `npm run e2e` por inercia (smoke AED + Memory + ds-docs).

---

## 8. Pendientes / anexos — a validar al ejecutar

1. **`sc-section-card` → Section/Subsection/Slot (§4.3):** diseñar el API anidado (Section contiene 1–4 Subsections; Subsection contiene 1–5 Slots) **1:1 con el Figma "Section"**, conservando collapsible + flush. Sacar medidas reales del Figma antes de codear.
2. **`ScDynamicDialogService` (§4.4):** al ganarlo, verificar que `inputValues` + el `ScDynamicDialogRef` propio (observables + `close()`/`destroy()`) encajan con nuestros patrones; convive con —no reemplaza— el patrón `[visible]` declarativo de nuestros diálogos actuales.
3. **`sc-bulk-transcription-modal` (§4.4):** al **migrar Memory**, comparar nuestra implementación vs la suya (componibilidad `sc-button`+`sc-toggleswitch`, i18n, animaciones hero/delta, contadores elegibles) y elegir/fundir. **No** es pieza de DS.
4. **Cheque visual del puntito (§4.1):** verificar 1:1 contra Figma que los 8 colores categóricos + el puntito se ven correctos como **variante** de `sc-tag`/`sc-chip` (no como componente aparte).
5. **`sc-checkbox` — base única (§3.1):** decidir entre nuestro `<input>` nativo tri-estado (a11y de browser) y su wrapper `p-checkbox` con `indeterminate`, **conservando el tri-estado** none/some/all. Validar al ejecutar.
6. **`sc-dialog` — reconciliar APIs (§3.1):** nuestro `sc-dialog` pinta toda la card canónica (`[visible]` declarativo, header icon+title+subtitle+close, footer projection); el suyo es wrapper fino (`header`/`position`/`draggable`). Decidir si la card canónica nuestra se mantiene como capa sobre el wrapper fino o se unifican inputs.
7. **`sc-confirm-host` → ¿`sc-confirmdialog`? (§3.2):** decidir si bajo DD-12 se renombra a `sc-confirmdialog` (envuelve `p-confirmdialog`) o se mantiene el nombre de host por su acoplamiento a `ConfirmHostService`. Borde de la regla pegado-vs-kebab.
8. **`sc-icon` vs `@smartcontact/icons` + `sc-component-icon-resolver` (§3.3 / §5.a):** confirmar que la migración al paquete de iconos de ellos conserva nuestros ejes FILL/wght/opsz (font-variation-settings) y el proveedor por ligadura; **decidir si se porta su `sc-component-icon-resolver` (compat pi→Material) tal cual o se sustituye por nuestro mapeo**, sabiendo que casi todos sus wrappers dependen de él.
9. **Deuda de aislamiento (§5.b):** inventariar y resolver los acoplamientos a `@core`/`@shared` antes de declarar portables los custom.
10. **Naming aliases vivos durante la transición:** mientras los devs realinean sus 5 (`input-text`/`toggle-switch`/`radio-button`/`progress-bar`/`progress-spinner` → pegado), mantener nota de alias en ambos lados para no romper imports a media migración.

---

## 9. Contraste con las convenciones documentadas de los devs (`AGENTS.md` + skills)

Su repo trae un setup de agente (Codex) que **codifica** sus convenciones: `AGENTS.md`, `PROMPTS.md` y skills `.agents/skills/*` (`token-inspector`, `component-generator`, `primeng-wrapper`, `docs-generator`, `workspace-sync`, `smartcontact-i18n`, `smartcontact-consumer-integration`, `angular-version-migration`). Contrastadas contra este manifiesto:

### 9.1 Coincidencias (su doctrina = la nuestra)

- **Tokens:** su `AGENTS.md` fija *"nunca inventar tokens · `--sc-*` = contrato público · `--p-*` = capa adaptadora (preset/wrapper internals) · los custom NO dependen de `--p-*` · la paleta se alinea por el preset, no copiando variables PrimeNG"*. Es **idéntico** a nuestra arquitectura (DD-1/DD-2 + migration-safety). **El plan la cumple incluso mejor:** su `base.ts` hardcodea hex (viola su propio "no hardcodear"); §6.2 lo reescribe a `var(--sc-*)`.
- **Wrapper vs custom = principio de reutilización:** su regla *"usa wrapper PrimeNG si el comportamiento existe / es un primitivo estilizado; custom solo si es composite / layout / no soportado"* es la misma lente de reutilización (minimal customization). La auditoría de reutilización (§10, pendiente) se apoya en SU propia regla.
- **Pipeline de agente** (token-inspector → component-generator → primeng-wrapper → docs-generator → workspace-sync) = la maquinaria de *"ellos construyen"*. El proyecto convergido encaja en ese pipeline.
- Standalone Angular 21, "extender el repo, no inventar arquitectura", docs-driven, i18n no en wrappers primitivos (texto vía inputs del consumer): alineado.

### 9.2 Choques documentados (el port toca sus DOCS, no solo el código)

1. **Naming — su `AGENTS.md` + skills mandan kebab-case + BEM** (`sc-toggle-switch`, `sc-button--primary`), y usan `sc-toggle-switch`/`sc-input-text` como **componentes de referencia** de las skills. DD-12 fija **pegado** para wrappers PrimeNG. → Converger **no es solo renombrar 5 selectores**: hay que **actualizar `AGENTS.md` + `component-generator` + `primeng-wrapper` + los ejemplos de referencia** a pegado, o su Codex seguirá generando kebab. (La regla kebab para *custom* sí se conserva — ahí no hay choque.)
2. **Escala — sus skills mandan tokens unitless + `calc(var(--token)/16*1rem)`** (base 16). La nuestra es **14-base en px explícito** (§2.2). → Converger la escala **cambia también su convención de generación** (la regla del `/16` en `token-inspector`/`primeng-wrapper`), no solo los valores de los tokens.

### 9.3 Acción de port derivada

Añadir a la Fase 0/1 (§7): **actualizar sus instrucciones de agente** como parte de la convergencia —
- `AGENTS.md` §"Follow naming conventions" + §"Reference Components" → naming pegado para wrappers PrimeNG (DD-12).
- `component-generator` / `primeng-wrapper` SKILL → ejemplos `sc-toggleswitch`/`sc-inputtext`; regla de conversión numérica `/16*1rem` → px 14-base (`var(--sc-scale-*)` directo).
- `token-inspector` → apuntar a la escala 14-base unificada.

Sin esto, el pipeline de los devs **regeneraría la divergencia** que estamos cerrando. (Choque no bloqueante para escribir el manifiesto, sí imprescindible antes de que "ellos construyan".)

---

## 10. Auditoría de reutilización (custom → ¿primitivo PrimeNG?)

Lente (= la regla wrapper-vs-custom de su `AGENTS.md`): para cada custom "puro" (`Base PrimeNG = none`), ¿hay un primitivo PrimeNG que **ninguno de los dos** envolvió y que lo cubriría? Cruzado contra el catálogo **completo** de PrimeNG 21 (~90 componentes).

| Custom nuestro | Primitivo PrimeNG candidato | Clasificación | Acción al portar |
|---|---|---|---|
| `sc-inline-rename-cell` | **`p-inplace`** (+ `p-inputtext`) | **reutilizar** | `p-inplace` ES exactamente "mostrar → editar in-place". Reconstruir encima en vez de `<input>` a mano. |
| `sc-photo-upload` | **`p-fileupload`** (+ `sc-avatar`) | **reutilizar** | `p-fileupload` aporta la mecánica de subida; nuestra parte = display avatar + fallback ilustración. |
| `sc-command-palette` | `p-dialog` + `p-autocomplete`/`p-listbox` | componer | Overlay Cmd/Ctrl+K sobre primitivos en vez de bespoke total. |
| `sc-keyboard-shortcuts` | `p-dialog` + contenido | componer | Cheat sheet = dialog + tabla. |
| `sc-section-card` | `p-panel` / `p-fieldset` (por subsección) | componer | Ya en §4.3 (evolución Section→Subsection→Slot apoyada en panel/fieldset). |
| `sc-bulk-action-bar` | `p-toolbar` (solo armazón) | bespoke (shell opcional) | Layout/UX específico (overlay, no-CLS, bulk-i18n); `p-toolbar` solo daría el marco. |
| `sc-color-dot-picker` | — (`p-colorpicker` es spectrum, no categórico) | **bespoke** | Selección categórica de 8 colores; no hay primitivo que encaje. |
| `sc-empty-state` | — | **bespoke** | Patrón de layout simple. |
| `sc-form-section-nav` | — (`p-tabs` no hace scroll-spy + dots de error) | **bespoke** | Comportamiento custom. |
| `sc-page-header` | — | **bespoke** | Patrón de layout. |
| `sc-icon` | `@smartcontact/icons` (de ellos) | reconciliar | Ver §3.3 (migrar a su paquete; PrimeNG usa PrimeIcons, no aplica). |
| `sc-sticky-form-header` | — | bespoke (retenido) | Rollback DD#65, no en uso activo. |

**Resultado:** de las 12 piezas "puras", **2 son reutilización fuerte que nadie había visto** (`p-inplace`, `p-fileupload`), **3 se componen sobre primitivos** (`p-dialog`/`p-panel`), y solo **~5 son bespoke legítimos** (sin primitivo que encaje). Recorta el código propio a mantener y cumple *"no acumular, reutilizar de PrimeNG"*. **A confirmar pieza a pieza al portar** — no forzar un primitivo que no encaje (eso es peor que el bespoke).

---

## 11. Comparativa y aportes — resumen para presentación

> Capa ejecutiva (para slides). El detalle vive en §3–§10; aquí la versión digerible: dónde gana cada uno, qué aportamos a su pipeline y los hallazgos clave.

### 11.1 Dónde ganamos nosotros (SCDS)
- **Cobertura:** 32 piezas vs 22.
- **Rigor (lo más diferencial):** guardarraíles **automáticos** anti-drift en pre-commit (`tokens:parity`, `tokens:gen`, `tokens:guard`, `type-parity`, `i18n-audit`, `e2e`). Ellos no los tienen.
- **Tokens mejor ejecutados:** nuestro preset apunta a `var(--sc-*)`; el suyo hardcodea hex en `base.ts` (viola su propio "no inventar / no hardcodear").
- **Más moderno:** API nueva de Angular (signals `input()/output()`); ellos `@Input()` clásico (156×).
- **Disciplina de diseño:** Figma 1:1, `DECISIONS`/`customs-catalog`, naming DD-12, escala formalizada.

### 11.2 Dónde ganan ellos (smartcontact-ui)
- **Empaquetado para producción (lo más diferencial):** 3 paquetes publicables (`@smartcontact/styles · icons · components`) + `provideSmartContactUi()` + ng-packagr + tarballs. Nosotros = monorepo consumido por ruta, **no publicable**.
- **Preset modular** (85 ficheros, uno por componente) vs nuestro monolito.
- **Paquete de iconos más maduro** (Material Symbols generados).
- **Pipeline de agente** (token-inspector → component-generator → primeng-wrapper → docs → sync) + skills.
- Algunos **primitivos PrimeNG** que nos faltan (avatar, badge, button, card, drawer, message, panel, skeleton, toast…).

### 11.3 Veredicto
**Nuestro = mejor design system** (completo, riguroso, moderno, design-driven). **Suyo = mejor paquete** (enviable, modular, publicable). La convergencia = **"nuestro contenido + su cáscara"**: su estructura de empaquetado rellena con nuestros tokens/preset/componentes/tooling.

### 11.4 Ya alineados + choques (resumen — detalle en §9)
- **Coinciden:** doctrina de tokens (`--sc-*` contrato · `--p-*` adaptador · no inventar tokens · paleta por preset), regla wrapper-vs-custom, pipeline de agente.
- **Chocan (codificado en sus skills, no solo en el código):** naming kebab+BEM vs DD-12 pegado · escala unitless `/16` vs 14-base px. → converger toca **sus docs de agente**, no solo los ficheros.

### 11.5 Qué EXTRAS aportamos a su docu de agente (`AGENTS.md` / skills)
Lo que nuestro trabajo suma a su pipeline (cubrir más sus necesidades con lo que tenemos):
- **Guardarraíles por máquina:** convertir su *"nunca inventar tokens"* de norma escrita a **norma verificada en pre-commit** (parity / guard / type-parity).
- **Naming DD-12** (pegado) en `AGENTS.md` + skills + ejemplos de referencia.
- **Escala 14-base / px** (sustituye su regla `/16`).
- **`base.ts` → `var(--sc-*)`** (hace que cumplan su propia regla de no-hardcodear).
- **Auditoría de reutilización** (inline-rename → `p-inplace`, photo-upload → `p-fileupload`) = su propia regla wrapper-vs-custom llevada más lejos.

### 11.6 Hallazgos clave del verificador (apto como base · 100 % cobertura · 0 inventado)
- **Escala = choque BLOQUEANTE (Fase 0):** ambos usan prefijo `--sc-*` pero incompatibles (su 8-point `--sc-spacing-100` = 8 vs nuestra 14-base `--sc-scale-1` = 14px). Unificar a la nuestra **antes** de tocar componentes.
- **`sc-checkbox` diverge:** nuestro nativo tri-estado vs su wrapper `p-checkbox`. Decidir base.
- **Dependencia transitiva oculta:** sus wrappers dependen de `sc-component-icon-resolver` (compat de nombres pi→Material) — se arrastra al ganarlos.
- **`sc-datatable` falta en AMBOS** — el hueco prioritario a crear.
- **Iconos:** su paquete es más maduro → migramos el nuestro al suyo.