# Fase 0 — Diagnóstico de Design Tokens

> Diagnóstico factual. **No propone soluciones.** Pendiente de
> aprobación humana antes de Fase 1. Existen discrepancias materiales
> entre las asunciones de `CLAUDE.md` y el estado real del repositorio
> que requieren conversación humana antes de avanzar — ver §9.

---

## 1. Hallazgo principal

El proyecto **ya tiene un sistema de tokens propio, deliberadamente
diseñado y documentado** bajo `src/app/core/tokens/`. NO son tokens
inferidos por IA. La documentación explícita (`README.md` 7 KB,
`GUIA.md` 36 KB) lo describe como _"single source of truth for every
visual decision in the application"_.

El sistema es una cascada de 7 capas de CSS (`--sc-*`) que mirror la
estructura de PrimeNG (primitive → semantic → component → preset)
más dos capas AED-específicas (palette + extensions). El total son
~43 KB de CSS de tokens.

`aed-preset.ts` **no es** un volcado de tokens inferidos: es un
bridge que reenvía cada `--p-*` que PrimeNG genera a un `--sc-*` del
sistema propio. Es decir, `aed-preset.ts` es el _conector_, no la
fuente.

`06-primeng-bridge.css` (untracked en git) es el **predecesor** del
preset — la versión flat-CSS del mismo bridge. Está fuera del
orchestrator (`index.css` salta de 05 a 07) y por tanto **no se
carga**: es dead code que sigue en disco.

## 2. Árbol relevante

```
src/
├── app/
│   ├── app.config.ts            ← providePrimeNG({ preset: AedPreset, ...cssLayer })
│   ├── app.component.scss       ← chrome del toast + 3 ::ng-deep (reset .p-toast)
│   ├── core/
│   │   └── tokens/
│   │       ├── index.css        ← orchestrator (importa 01→05, 07)
│   │       ├── aed-preset.ts    ← bridge JS PrimeNG → --sc-*
│   │       ├── README.md        ← doc técnica (7 KB)
│   │       ├── GUIA.md          ← doc para diseño en español (36 KB)
│   │       └── layers/
│   │           ├── 01-primitive.css     5918 B  ← color scales, type, spacing, radius
│   │           ├── 02-semantic.css      9922 B  ← text/bg/border/icon roles + typography roles
│   │           ├── 03-palette.css       3069 B  ← label hues, presence, priority
│   │           ├── 04-component.css     7068 B  ← btn, modal, toast specs
│   │           ├── 05-extensions.css    3457 B  ← shadows, z, motion, layout dims
│   │           ├── 06-primeng-bridge.css 7025 B ← DEAD (untracked, NO importado)
│   │           └── 07-dark.css          6714 B  ← .aed-dark overrides
│   ├── shared/components/
│   │   ├── modal/                  ← 1 archivo, ::ng-deep + !important + .p-* (reset p-dialog)
│   │   ├── confirm-host/           ← 1 archivo, ::ng-deep (proyección modal foot)
│   │   ├── sticky-form-header/     ← 1 archivo, ::ng-deep (resize photo-upload)
│   │   └── impact-preview-dialog/  ← 1 archivo, ::ng-deep + .p-* (padding p-dialog)
│   └── features/admin/agents/pages/
│       └── agent-form-page.component.scss ← 2 !important locales
├── styles/
│   ├── main.scss            4989 B  ← entrypoint global + a11y + button micro-interactions
│   ├── _tokens.scss          423 B  ← bridge SCSS @import al index.css (no declara tokens)
│   ├── _reset.scss          1105 B  ← reset + prefers-reduced-motion (4 !important legítimos)
│   ├── _buttons.scss        5629 B  ← .btn variants (3 !important en :disabled)
│   ├── _forms.scss          9936 B  ← .field/.grid/.pill/.perm-matrix/.checkbox-grid (1 !important)
│   └── _table-elements.scss 9373 B  ← .sc-label/.sc-channel-row/.sc-table-zebra
└── assets/tokens/
    └── design-tokens.json   409 KB  ← REFERENCIA (export PrimeUI Figma Plugin)
```

## 3. Tabla de archivos de estilos

| Ruta | Tipo | Tamaño | Rol |
|---|---|---|---|
| `src/styles/main.scss` | SCSS | 5 KB | Entrypoint global. Carga `reset/buttons/forms/table-elements`, importa `core/tokens/index.css` y `primeicons.css`. Define `.btn` micro-interactions, `:focus-visible` outline global, `.cross-tab-warning`, `.page__search-kbd`, `table.table { table-layout: fixed; }`. |
| `src/styles/_tokens.scss` | SCSS | 423 B | Sólo `@import '../app/core/tokens/index.css';`. Bridge SCSS para que partials puedan consumir tokens. No declara nada. |
| `src/styles/_reset.scss` | SCSS | 1 KB | Normalize/reset. Incluye `prefers-reduced-motion` con 4× `!important` (legítimo, patrón a11y estándar). |
| `src/styles/_buttons.scss` | SCSS | 6 KB | Sistema `.btn` canonical (primary/secondary/danger + subtle/icon/sm). 3× `!important` en `:disabled` para defeat `:hover`/`:active`. Todo consume `--sc-btn-*`. |
| `src/styles/_forms.scss` | SCSS | 10 KB | Primitivos compartidos: `.field`, `.grid`, `.checkbox-grid`, `.pill`, `.perm-matrix`. 1× `!important` en `text-align` de columna header. Todo consume `--sc-*`. |
| `src/styles/_table-elements.scss` | SCSS | 9 KB | `.sc-label[data-tone]`, `.sc-channel-row`, `.sc-type-tag`, `.sc-action-divider`, `.sc-icon-btn`, `.sc-table-zebra`. Todo consume `--sc-*`. |
| `src/app/core/tokens/index.css` | CSS | 1.6 KB | Orchestrator. Imports `01-primitive` → `05-extensions` y `07-dark`. **Salta `06-primeng-bridge.css`** (intencional — sustituido por `aed-preset.ts`). |
| `src/app/core/tokens/aed-preset.ts` | TS | 10.7 KB | `definePreset(Aura, …)`. Reenvía `primitive` (borderRadius + green/yellow/red/blue scales), `semantic` (primary, focusRing, formField, overlay, colorScheme.light/dark) — todos los valores son `var(--sc-*)`. |
| `src/app/core/tokens/layers/01-primitive.css` | CSS | 6 KB | Color scales (`--sc-color-{blue,soft-blue,gray,green,yellow,red,electric-blue,indigo}-{50..950}`), type primitives (Inter + Open Sans, 13 sizes, 13 line-heights, 4 weights), 13 spacing steps, 9 radii. |
| `src/app/core/tokens/layers/02-semantic.css` | CSS | 10 KB | Roles: text/bg/border/icon × {default, subtle, primary, secondary, accent, success, warning, danger, info, indigo} × {hover, active, subtle}. Type roles `--sc-{font-size,line-height,font-weight,font-family}-{display-1, h1..h4, subtitle-1..2, body-1..3, caption, caption-bold}`. |
| `src/app/core/tokens/layers/03-palette.css` | CSS | 3 KB | Label palette (8 hues × {bg,text,border,dot}), agent presence, group priority. |
| `src/app/core/tokens/layers/04-component.css` | CSS | 7 KB | Specs `--sc-btn-*`, `--sc-modal-*`, `--sc-toast-*` (Figma node refs). |
| `src/app/core/tokens/layers/05-extensions.css` | CSS | 3 KB | Layout dims (sidebar 64/240, topbar 56, bulk-bar 56), shadow scale tinted (`--sc-shadow-{xs..dialog,popover,dropdown}`), z-index, motion (`--sc-transition-{fast,base}`, easings). |
| `src/app/core/tokens/layers/06-primeng-bridge.css` | CSS | 7 KB | **Dead code.** Untracked en git, no importado por `index.css`. Sustituido por `aed-preset.ts`. |
| `src/app/core/tokens/layers/07-dark.css` | CSS | 7 KB | `.aed-dark` overrides para layers 02/03/04. Dark mode IMPLEMENTADO. |

## 4. Auditoría de `aed-preset.ts` (280 líneas)

Cada bloque revisado contra el contrato implícito de CLAUDE.md
(_"tokens inferidos por IA, deuda completa"_):

| Sección del preset | Qué hace | Veredicto |
|---|---|---|
| Comentario top (líneas 4-23) | Documenta explícitamente que es _"the v21-native equivalent of the old `06-primeng-bridge.css` layer"_ y que los valores son `var(--sc-*)` para que la fuente única siga siendo el cascade. | Coherente con README. No deuda. |
| `primitive.borderRadius` (32-38) | 5 keys → `var(--sc-radius-{50,100,200,300,500})`. | Forwarder. |
| `primitive.{green,yellow,red,blue}` (39-94) | Cada escala 50-950 → `var(--sc-color-{name}-{step})`. Nota explícita: PrimeNG `--p-blue-*` se redirige a `electric-blue` (info), no a brand blue. | Forwarder. Decisión documentada (electric-blue como info). |
| `semantic.primary` (97-109) | Escala numérica 50-950 → `var(--sc-color-blue-*)`. | Forwarder. |
| `semantic.focusRing` (113-118) | `color: var(--sc-color-soft-blue-500)`, 2px solid, offset 2px. | Forwarder + valores literales (px). |
| `semantic.formField` (119-124) | `paddingX/Y`, `borderRadius`, `transitionDuration` → `--sc-*`. | Forwarder. |
| `semantic.overlay.{modal,popover,select,navigation}` (131-147) | `borderRadius` + `shadow` → `--sc-radius-*` / `--sc-shadow-*`. Comentario justifica por qué (Aura usa `rgba(0,0,0,0.1)` que rompe tinte). | Forwarder con razón explícita. |
| `semantic.colorScheme.light` (149-219) | `surface` (12 steps), `primary`, `mask`, `formField`, `text`, `content`, `overlay` → todos `var(--sc-*)`. | Forwarder. |
| `semantic.colorScheme.dark` (231-277) | Mismas keys que light, **mismos `var(--sc-*)`**. Comentario explica: layer 7 (`07-dark.css`) ya re-declara los `--sc-*` bajo `.aed-dark`, así que dark inherits "free". | Forwarder. Decisión arquitectónica documentada. |

**Conclusión**: el preset es funcionalmente un forwarder de ~250
líneas. No declara valores brand. Si lo movemos a `_legacy/` (como
propone CLAUDE.md), perdemos el bridge entre `--p-*` y `--sc-*` —
y PrimeNG vuelve a los defaults de Aura, no a los `--sc-*`.

## 5. Patrones "prohibidos" según CLAUDE.md — análisis por instancia

### 5.1. `::ng-deep` (19 ocurrencias, 5 archivos)

| Archivo | Instancias | Patrón | Veredicto |
|---|---|---|---|
| `app.component.scss` | 3 | `::ng-deep .p-toast .{message,message-content,*}` — reset chrome PrimeNG toast para que solo se vea `.aed-toast`. | Load-bearing. Sin esto, PrimeNG paint extra padding/background detrás. |
| `dialog/dialog.component.scss` | 3 | `::ng-deep .aed-modal-host`, `::ng-deep .aed-modal-host .p-dialog-content`, `::ng-deep .aed-modal__foot .btn` — reset host de p-dialog + ancho mínimo en botones proyectados. | Load-bearing. Comentario explica por qué `:host` no funciona con content projection. |
| `confirm-host/...scss` | 1 | `::ng-deep .aed-modal__foot > .confirm-host__actions` — alinea acciones proyectadas. | Load-bearing (proyección). |
| `sticky-form-header/...scss` | ~8 | `::ng-deep .photo-upload*` y `::ng-deep aed-illustrated-avatar *` — fuerza tamaño 44×44 sobre componentes proyectados. | Load-bearing pero invasivo: el photo-upload no expone API para tamaño. |
| `impact-preview-dialog/...scss` | ~4 | `::ng-deep .aed-impact-dialog` + `.p-dialog-{header,content,footer}` — padding propio en dialog. | Load-bearing. |

### 5.2. `!important` (19 ocurrencias, 5 archivos)

| Archivo | Cuántos | Contexto | Veredicto |
|---|---|---|---|
| `_reset.scss` | 4 | Bloque `@media (prefers-reduced-motion: reduce)` → `animation-duration`, `transition-duration`, etc. | A11y estándar. Legítimo. |
| `_buttons.scss` | 3 | `&:disabled, &[aria-disabled='true']` → fuerza colores disabled sobre hover/active. | Legítimo (patrón conocido para defeat state combinations). |
| `_forms.scss` | 1 | `.perm-matrix__th-col { text-align: center !important; }`. | Bandera. No es obviamente necesario; podría sustituirse por selector más específico. |
| `agent-form-page.component.scss` | 2 | `text-align: center !important;` y `padding: … !important;` locales. | Bandera. Probable cascade fight con `_forms.scss`. |
| `dialog/dialog.component.scss` | ~9 | Bloque `::ng-deep .aed-modal-host { background, border, box-shadow, padding, border-radius : … !important }` × 2 (host + content). | Load-bearing acompañando al `::ng-deep`. PrimeNG aplica esos estilos con alta especificidad. |

### 5.3. Selectores `.p-*` directos (9 ocurrencias, 3 archivos)

Todos dentro de bloques `::ng-deep` para targetear partes internas de
`<p-dialog>` o `<p-toast>`. No hay selectores `.p-*` "sueltos" en
estilos de la app que no tengan ese contexto.

### 5.4. Hardcodes

- **Hex en componente SCSS**: 0 ✓
- **Hex en templates (inline `style=`)**: 0 ✓
- **`px` literals en componente SCSS**: 571. Pendiente caracterizar
  cuántos son legítimos (widths/heights fijos, borders 1px, icon
  sizes) vs cuántos deberían ser `--sc-spacing-*`. Muestreo en
  Fase 2.
- **`px` en SCSS partials globales**: `_buttons.scss` `height: 40px`
  (con comentario), `_buttons.scss --sm height: 32px`, `_buttons.scss
  --icon 32×32`, `_forms.scss padding: 6px var(--sc-spacing-200)`
  (comentario: 6px off-scale), `_forms.scss min-height: 32px`
  (chip row). Todos comentados como decisiones conscientes off-scale.

## 6. Muestreo de tokens en uso

| Token | Estado | Notas |
|---|---|---|
| `var(--sc-color-blue-700)` | ✓ Existe (`#1b273d`, primitive 01) | Brand color real. Difiere 1-bit del `#1c273e` de CLAUDE.md (probablemente la misma decisión redondeada distinto). |
| `var(--sc-bg-primary)` | ✓ Existe (semantic 02 → blue-700) | Alias correcto. |
| `var(--sc-spacing-300)` | ✓ Existe (primitive 01 = 16px) | — |
| `var(--sc-radius-200)` | ✓ Existe (primitive 01 = 6px) | — |
| `var(--sc-shadow-dialog)` | ✓ Existe (extensions 05) | Tinted con `--sc-shadow-color-rgb`. |
| `var(--sc-presence-available)` | ✓ Existe (palette 03) | — |
| `var(--p-primary-500)` consumido en SCSS | ✗ No detectado en grep | Componentes NO consumen `--p-*` directamente. Solo PrimeNG-internal. Coincide con la regla del README (capa 6 sólo para PrimeNG-internal). |
| `var(--p-form-field-*)` consumido en SCSS | ✗ No detectado | Mismo patrón. |

**Implicación**: la dirección de consumo es **componentes → `--sc-*` ←
preset → `--p-*` (consumido por PrimeNG-internal)**. Es la dirección
opuesta a la que CLAUDE.md prescribe (_"los componentes consumen
`var(--p-*)` generadas por PrimeNG"_).

## 7. Deuda observable

Deuda **real** (no las falsas alarmas de §5 que resultaron ser
load-bearing):

| Item | Severidad | Notas |
|---|---|---|
| `06-primeng-bridge.css` dead code | Baja | Untracked en git, no importado. Sólo ocupa disco y confunde. |
| 1× `!important` en `_forms.scss` (text-align col header) | Baja | Podría resolverse con `aed-tri-state-checkbox` content selector. |
| 2× `!important` en `agent-form-page` | Baja | Probable cascade fight contra `_forms.scss` global. |
| `::ng-deep` en `sticky-form-header` resizing `photo-upload` (~8 instancias) | Media | El componente proyectado no expone API para tamaño. Refactor genuino del componente, no del sistema de tokens. |
| 571 `px` literals en SCSS de componentes | Pendiente | No clasificado. Necesita Fase 2 para separar legítimos (dimensiones fijas, borders) de hardcodes (spacings/font-sizes que deberían ser tokens). |
| `cssLayer.order` menciona `tailwind-base/utilities` pero Tailwind no está en `package.json` | Media | Orden definido sin destinatario. Funcionalmente inocuo (layers vacíos), pero sugiere config heredada. |

## 8. Estado de Playwright

- `@playwright/test ^1.59.1` instalado.
- **No hay `playwright.config.*`** en raíz.
- `e2e/snapshot.ts` (4 KB) — harness propio. No es Playwright Test
  Runner estándar.
- `e2e/screenshots/` con 38 PNGs (capturas anteriores).
- Implicación para Fase 1.5: hay infra para tomar screenshots, pero
  habría que entender el harness para usarlo como baseline / diff,
  o añadir `playwright.config.ts` para test runner estándar.

## 9. Discrepancias con CLAUDE.md — requieren conversación humana antes de Fase 1

CLAUDE.md describe un escenario que **no coincide con el repo**:

| CLAUDE.md asume | Realidad observada |
|---|---|
| _"Tokens inferidos por IA, materializados en `aed-preset.ts` (...) tratable como deuda completa"_ | El preset es un bridge forwarder de 250 líneas. El sistema real de tokens está en `core/tokens/layers/` (43 KB CSS + 36 KB `GUIA.md` + 7 KB `README.md`). |
| _"El proyecto NO tiene identidad visual documentada formalmente"_ | `GUIA.md` (36 KB en español, para diseño) y `README.md` (7 KB técnico) documentan el sistema explícitamente como "single source of truth". |
| _"Los componentes consumen `var(--p-*)` generadas por PrimeNG. Nunca tokens SCSS propios paralelos"_ | Los componentes consumen `--sc-*` exclusivamente. Cero referencias `--p-*` en SCSS de componentes. Es la dirección opuesta. |
| _"`aed-preset.ts` queda OBSOLETO. Se mueve a `_legacy/` durante la migración y se elimina al cierre"_ | Si se elimina sin sustituto, PrimeNG vuelve a defaults Aura y se desincroniza del `--sc-*` system, rompiendo todos los componentes PrimeNG. |
| _"Sistema SCSS de tokens paralelo al preset" (prohibido)_ | El sistema `--sc-*` está bajo `core/tokens/layers/*.css` (CSS, no SCSS) y NO es paralelo: el preset reenvía a él. |
| Brand color `#1c273e` | Brand color real `#1b273d` (`--sc-color-blue-700`). 1-bit de diferencia en canal B. Probablemente la misma decisión, rounded distinto al exportar/transcribir. |

**Consecuencia**: el plan literal de CLAUDE.md (mover preset a
`_legacy/`, consumir `--p-*` desde componentes, declarar identidad
asumida desde cero) implica **descartar el sistema `--sc-*` completo**
— ~700 referencias en componentes, 7 capas de CSS, dark mode hecho,
36 KB de doc en español para diseño. Es un refactor mucho mayor del
que el documento sugiere.

Existen al menos dos interpretaciones razonables:

- **(a)** El plan asumió un repo distinto y debe re-encuadrarse.
  El audit consistiría en validar / limpiar / re-sincronizar el
  sistema `--sc-*` existente con Aura, no en reemplazarlo.
- **(b)** El plan es consciente y se quiere genuinamente migrar de
  `--sc-*` a consumir `--p-*` directamente desde componentes,
  asumiendo el coste del refactor (~700 cambios + dark mode + doc).

Ambas son opciones legítimas; tienen costes muy distintos y
producen entregables muy distintos. **No puedo decidir esto sin
input humano.** Fase 1 (restructure plan) depende directamente de
esta decisión.

---

## Resumen ejecutivo (para chat)

1. Existe un sistema `--sc-*` de 7 capas, intencional y documentado, NO inferido.
2. `aed-preset.ts` es un bridge a ese sistema, NO la fuente de los tokens.
3. `06-primeng-bridge.css` SÍ es dead code (predecesor del preset, ya no importado).
4. La mayoría de `::ng-deep` / `!important` / `.p-*` son load-bearing (reset chrome PrimeNG), no arbitrarios.
5. Deuda real es modesta: ~3 `!important` cuestionables + 1 archivo dead + 571 `px` por clasificar.
6. CLAUDE.md describe un escenario que no coincide con el repo. **Necesito decisión humana antes de Fase 1.**
