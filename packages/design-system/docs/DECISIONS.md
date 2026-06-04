# SCDS — Architectural Decisions

> Decisiones grandes que afectan al diseño del Smart Contact Design System.
>
> **Source of truth**: este doc para decisiones arquitectónicas. Brand divergences
> en [`customs-catalog.md`](./customs-catalog.md). Backlog operativo en
> [`inconsistencies-backlog.md`](./inconsistencies-backlog.md). Reglas blindaje
> en [`migration-safety.md`](./migration-safety.md).
>
> Formato: 1 entry por decisión. Newest first. Cada entry tiene: contexto,
> opciones consideradas, decisión, razón, consecuencias.

---

## DD-12 · 2026-06-04 (S70) — Naming de convergencia: el catálogo unión sigue DD-8 (Kit Pro 1:1, pegado); los devs realinean a él

**Contexto**: el equipo de dev tiene su propio repo de DS (`smartcontact-ui`,
GitLab) gemelo del nuestro, que **diverge en el naming**: ellos hyphenan los
multi-palabra (`sc-input-text`, `sc-toggle-switch`, `sc-radio-button`,
`sc-progress-bar`, `sc-progress-spinner`) mientras nosotros seguimos DD-8
(pegado 1:1 Kit Pro/PrimeNG: `sc-inputtext`, `sc-toggleswitch`). Al montar el
proyecto convergido (unión de ambos catálogos) hay que cerrar UN naming para
que los dos equipos "hablen igual".

**Dato que decide** (verificado S70): PrimeNG 21 acepta los DOS selectores
(`p-toggleswitch` **y** `p-toggle-switch` son ambos oficiales; idem multiselect/
inputnumber/inputgroup/radiobutton/progressbar) → la fidelidad a PrimeNG **no
desempata**. Pero los componentes del **Kit Pro/Figma se nombran pegado en
minúsculas** (`❖ inputtext`, `❖ toggleswitch`, `❖ multiselect` — ver
[`code-connect-mapping.md`](code-connect-mapping.md)). Como los devs construyen
**leyendo el Figma**, el pegado hace Figma→código 1:1 sin traducción; el kebab
mete una traducción permanente (= el ping-pong a evitar).

**Opciones consideradas**: (a) kebab uniforme en todo (máxima uniformidad de
string, = repo actual de los devs) — pero rompe el espejo con el Figma y obliga
a traducir en cada handoff de diseño. (b) **mantener DD-8** (pegado para lo del
Kit Pro; kebab para custom) en el proyecto convergido y que los devs realineen.

**Decisión**: **(b)** — el proyecto convergido adopta **DD-8 sin cambios**:
`sc-` + nombre Kit Pro/Figma literal (pegado) para todo lo que existe en el Kit
Pro; **custom (sin equivalente Kit Pro) → kebab** descriptivo (`sc-section-card`,
`sc-empty-state`, `sc-bulk-transcription-modal`). Es la **misma meta-regla que
los tokens** (espejar el Kit Pro; lo nuestro propio, custom). Bajo "nosotros
definimos, ellos construyen", **los devs realinean sus 5** divergentes:
`input-text→inputtext`, `toggle-switch→toggleswitch`, `radio-button→radiobutton`,
`progress-bar→progressbar`, `progress-spinner→progressspinner`.

**Razón**: el Figma/Kit Pro es la fuente común que ambos equipos leen; espejarla
elimina la traducción diseño→código para siempre. Migration-safe porque el
wrapper encapsula PrimeNG (un rename interno de selector/`--p-*` es 1 línea
dentro del wrapper, invisible a la API pública `sc-`). Una sola regla a nivel de
**sistema** (la misma de tokens), aunque a nivel de string convivan pegado +
kebab — la mezcla es señal de procedencia (¿está en el Kit Pro?), no ruido.

**Consecuencias**:
- Nosotros **no renombramos nada** (ya estamos en DD-8). Los devs realinean 5.
- El naming es **entrada base del MANIFIESTO de convergencia** (S70).
- Memoria `project_devs_smartcontact_ui_repo`: naming **confirmado** (ya no
  "por confirmar al cerrar el manifiesto").
- Nota para notificar al equipo redactada en el chat de S70.

---

## DD-11 · 2026-06-02 (S67) — Tipografía migration-safe: los `font-size` viven en `--sc-*`, blindados por guard + comprobador

**Contexto**: la tipografía era el último frente sin blindar. La app tenía 367
`font-size` literales repartidos en SCSS de componentes y features (cobertura
tokenizada 48%). Cada literal es un punto donde un update de PrimeNG o un
re-export del Kit puede introducir drift sin que nadie lo cace. Faltaba cerrar
el cinturón que color (DD-3) y spacing/escala (DD-10) ya tenían.

**Opciones consideradas**:
- A. **Dejar los literales + que `tokens:parity` solo avise**. Reactivo: el drift
  se detecta tarde (en el commit que lo cruza por casualidad) y los literales
  nuevos siguen entrando.
- B. **Tokenizar masivo + guard proactivo + comprobador read-only dedicado**.
  Cierra la puerta por construcción: ningún `font-size` literal nuevo entra, y
  los slots de tipo se cruzan contra el export.

**Decisión**: **B**.
- **Tokenización (olas 1+2)**: 367 `font-size` literales → `--sc-font-size-*`,
  snapeados a la escala base-14 (misma ley `v/14` de DD-10). Cobertura
  48% → 99% → 100% del accionable. El hero de bulk-transcription (88px) → token
  `--sc-font-size-900`.
- **Guard "Dura 4"** en `token-guard.mjs`: bloquea cualquier `font-size` literal
  nuevo en pre-commit, **0 excepciones**.
- **`npm run tokens:type-parity`**: comprobador SOLO-LECTURA (hermano de
  `tokens:parity`, NO crea tokens) que cruza los slots de tipo contra el export
  del Kit.
- Los tipos viven en **nuestros** tokens `--sc-font-size-*` (capa primitive) +
  bridge `sc-preset.ts` → `--p-*` — **nunca dentro de PrimeNG**.
- Las **`line-height`** NO se tocaron (diferidas, riesgo de layout) — ver deuda
  en `inconsistencies-backlog.md`.

**Razón**: misma arquitectura unidireccional que color (DD-3) y escala (DD-10).
Como los tipos viven en `--sc-*` y el preset reenvía a `--p-*`, **un update de
PrimeNG no los borra** — el bridge sigue apuntando a nuestros valores. El único
riesgo residual es que PrimeNG renombre un slot `--p-*-font-size`, y eso lo caza
`tokens:type-parity` (queda detectable, no silencioso). Por eso **NO se vincula
`--sc-font-*` a la escala tipográfica de PrimeNG**: invertiría la arquitectura
(haría que nuestra identidad dependa de la suya).

**Consecuencias**:
- El cinturón migration-safe queda cerrado: badge/button/form-field ya estaban
  cubiertos desde S57/S62; ahora todo `font-size` accionable es token.
- `migration-safety.md` (racional de blindaje) y `tokens/README.md` (tooling:
  `tokens:type-parity`, escala base-14, guard Dura 4) **apuntan a esta DD**, no
  la duplican.
- Deuda diferida (line-heights Fase 4, tamaños display, contraste índice dark)
  trackeada en `inconsistencies-backlog.md`.

---

## DD-10 · 2026-05-27 (S62-ext) — Escala formalizada (ley `v/14`) + comprobador/generador de tokens, NO un generador que escriba las capas

**Contexto**: Rafa pidió "el arreglo definitivo anti-drift" para los tokens del Kit
Pro. La opción intuitiva era un **generador** que escribiera las capas `--sc-*` desde
el export. Pero la arquitectura (README, DD-1/DD-2) dice lo contrario: las 7 capas son
la fuente de verdad de la app; el export es contra lo que **comprobamos**.

**Opciones consideradas**: (a) generador que reescribe `01-primitive.css` desde el
export → invierte la arquitectura + riesgo de machacar lo curado (comentarios,
negativos, los 3 pasos custom). (b) comprobador robusto + formalizar la ley + un
generador SOLO-LECTURA que deriva el canónico y verifica.

**Decisión**: (b).
- La **escala** es una rampa única base-14: `--sc-scale-{m}` = `m × 14px`. El nombre
  se deriva del VALOR (`v/14`), nunca del string de la clave del export (es lossy:
  `scale125`=175=×12.5 vs `scale1125`=15.75=×1.125). Definición formal en
  `tokens/README.md §"The scale — formal definition"`. Radius = escala fija aparte
  (NO 14-base).
- `npm run tokens:parity` ampliado: sizing **valor↔valor** (37 checks: button/formField/
  tabs/tooltip/overlays) en vez de regex con literal hardcodeado (que dejaba pasar
  drift), + §5 informativa de tokens code-only con vecino más cercano (regla redondeo,
  memoria `feedback_snap_divergence_to_existing_token`), + **§6 COLOR de marca**
  (S62-ext-3): resuelve `--sc-*` a hex por la cadena `var()` y cruza la rampa primary
  (color/hover/active/contrast, light+dark) + surface↔gray + content contra el export.
  Cierra el punto ciego que dejó pasar el drift de `primary-hover` (lo cazó el ojo, no
  la herramienta) — divergencias de marca conscientes (info/warn/focus/dark-navy) van
  allow-listadas, no fallan.
- `npm run tokens:gen` (antes `tokens:scale`): deriva el set canónico `--sc-scale-*`
  **y `--sc-radius-*`** del export y verifica la ley de NOMBRES (que paridad no valida);
  `--emit` imprime los bloques. **NO reescribe** el CSS (eso es `--write`/`tokens:import`).
- Ambos corren en pre-commit.

**Razón**: el drift se vuelve imposible por construcción vía el CHECK (no vía un
generador que pelea con la arquitectura y arriesga lo curado). Datos > supuestos.

**Consecuencias**: re-exportar el Kit y sobrescribir `tokensprime.json` → `parity` +
`scale` cazan cualquier desalineación (valor o nombre) antes del commit. Flag abierto:
`17.5`/`35` figuran como Kit pero el export actual no los trae → reconciliar al
próximo re-export (`customs-catalog §4`).

**Addendum S62-ext-3 — pipeline import completo (`tokens:import` = `tokens:gen -- --write`)**:
el writer SCOPED ahora cubre **escala + radios** (dos zonas marcadas: `@sc-gen:scale … :end`
y `@sc-gen:radius … :end` en `01-primitive.css`; mirror mecánico del export). Sigue sin
ser el writer-libre que descartamos (que pisaba toda la capa); todo lo demás (colores,
navy, aliases, extras documentados) queda intacto.

**La cascada ahora llega a los componentes sin px a mano.** Antes `sc-preset.ts` fijaba
las métricas de componente con literales (`paddingX: '10.5px'`) — solo *comprobados* por
parity §4, no *generados*. Trust gap que Rafa señaló: "¿el puente solo cubre la escala?".
Fix: cada métrica del preset (button/formField/tabs/tooltip) es ahora una **referencia a
token generado** — `var(--sc-scale-0-75)`, `var(--sc-font-size-300)`, `var(--sc-radius-200)`
— porque todas caen exactas en la escala 14-base / radios / font-size del export. No hace
falta un generador de "métricas de componente" aparte: el preset apunta a los primitivos
generados y la cascada propaga. (Fiel a Figma, donde el componente también está vinculado
a la variable, no a un número.) Si un re-export reasigna un paso, parity §4 (valor↔valor)
lo caza loud.

Flujo completo: diseño cambia métrica/color en Figma → `tokensprime.json` → `tokens:import`
reescribe escala+radios → cascada (`--sc-spacing/font-size/line-height` aliases +
componentes + **preset por referencia**) propaga sola. Color de marca = decisión a mano
(no auto-import) pero **vigilada por parity §6**. Verificado idempotente. El CHECK
(`tokens:gen` + `tokens:parity`, pre-commit) es la garantía; el writer es la comodidad.

## DD-9 · 2026-05-25 (S60) — Icon set del SCDS = Material Symbols vía `<sc-icon>` (migración desde Lucide)

**Contexto**: la app usaba `lucide-angular` (`<lucide-icon [img]>`) como icon
set en ~140 ficheros. Rafa decidió migrar a **Material Symbols** (Google). El
no-goal "sin Material" del `apps/ds-docs/CLAUDE.md` se refiere a Angular Material
(componentes), NO a la font de iconos Material Symbols — aclarado y confirmado.

**Decisión**: nuevo wrapper SCDS **`<sc-icon name [size] [fill] [weight]>`**
(`packages/design-system/components/icon/`) que renderiza un glifo Material
Symbols Outlined por ligadura. Es la **única API de icono** del SCDS. La variable
font se carga en `index.html` de supervisor + ds-docs (Google Fonts CSS link).
Los campos de icono pasan de ref Lucide a **string** (nombre Material); los
contratos `[icon]` de los componentes SCDS (`empty-state`, `dialog`,
`section-card`, `page-header`, `form-section-nav`) cambian de tipo Lucide → `string`.

**Opciones consideradas**: (a) Material Symbols variable font + wrapper
[elegida] — cero deps npm, modulable (opsz/wght/FILL/GRAD), 1 API; (b) set SVG
vía `@ng-icons/material` — dep nueva, rechazada; (c) seguir en Lucide — descartado
por decisión de producto.

**Excepciones que SIGUEN en Lucide** (no migrar):
- **Iconos de marca** (GitHub) — Material Symbols no tiene glifos de marca.
- **`Loader2`** (spinner animado) — Material `progress_activity` necesitaría
  animación CSS propia; se mantiene el lucide-icon animado.
- Quedan 8 ficheros con import `lucide-angular` por estas 2 razones.

**Consecuencias**:
- `lucide-angular` permanece como dep (por los keepers) — NO se puede quitar del
  bundle todavía. Reevaluar en la auditoría de optimización.
- **Gotcha NG0919** (circular runtime, el build NO lo caza): un componente SCDS
  que importe `IconComponent` desde el barrel `@shared/components` se importa a sí
  mismo → circular. **Regla**: dentro de `packages/design-system/components/`,
  importar IconComponent por **ruta relativa** (`../icon/icon.component`), nunca
  por el barrel.
- **Pendiente** (auditoría DS): entry de `<sc-icon>` en customs-catalog (DD-7);
  2 botones `Trash2` (entity-form, rule-builder) aún en Lucide vs `delete`
  Material; self-host de la font para producción; tabla de mapping Lucide→Material
  documentada en `docs/NEXT-SESSION-PLAN.md`.

---

## DD-8 · 2026-05-20 (S47) — Naming SCDS wrappers alineado 1:1 con Kit Pro Figma + PrimeNG

**Contexto**: 7 wrappers SCDS tenían naming kebab-multi-word divergente con sus equivalentes en Kit Pro Figma SC y en PrimeNG. Por ejemplo `<sc-input>` cuando Figma tiene `❖ InputText` y PrimeNG tiene `<p-inputtext>`. Lo mismo con `multi-select`/`MultiSelect`, `input-number`/`InputNumber`, `toggle-switch`/`ToggleSwitch`, `modal`/`Dialog`, `tri-state-checkbox`/`Checkbox`, `input-group`/`InputGroup`.

La inconsistencia complicaba (a) audits Figma manuales (matching por concepto en vez de nombre literal), (b) Code Connect mapping futuro (necesita alias mapping en vez de match directo), (c) onboarding de devs nuevos (confusión naming).

**Opciones consideradas**:
- A. **Mantener naming SCDS** (kebab-multi-word, convención Polaris/Carbon). Pro: nada cambia. Contra: divergencia persistente, Code Connect requiere mapping manual, audits siempre por concepto.
- B. **Rename completo 7 wrappers** matching Kit Pro literal. Pro: 1:1 con Figma, Code Connect directo, audits literales. Contra: 6 commits separados, 60+ archivos por rename, tracker drift temporal, riesgo de regresión.

**Decisión**: **B** — rename completo en S47. Aplicado a los 7 wrappers que tienen equivalente PrimeNG/Figma:
- `<sc-input>` → `<sc-inputtext>` (PrimeNG `<p-inputtext>`, Figma `❖ InputText`)
- `<sc-input-number>` → `<sc-inputnumber>` (`<p-inputnumber>`, `❖ InputNumber`)
- `<sc-input-group>` → `<sc-inputgroup>` (`<p-inputgroup>`, `❖ InputGroup`)
- `<sc-multi-select>` → `<sc-multiselect>` (`<p-multiselect>`, `❖ MultiSelect`)
- `<sc-toggle-switch>` → `<sc-toggleswitch>` (`<p-toggleswitch>`, `❖ ToggleSwitch`)
- `<sc-modal>` → `<sc-dialog>` (`<p-dialog>`, `❖ Dialog`) — además class `ModalComponent` → `DialogComponent` y tokens `--sc-modal-*` → `--sc-dialog-*`
- `<sc-tri-state-checkbox>` → `<sc-checkbox>` (`<p-checkbox>`, `❖ Checkbox`) — además class `TriStateCheckboxComponent` → `CheckboxComponent`. El behavior tri-state queda en la API (`TriState` type + `cycle` output), no en el nombre.

**Razón**: alineación literal beneficia long-term mantenimiento (audits, Code Connect, onboarding). El coste mecánico (60+ archivos por rename, mass-replace con Python) es one-shot y se ejecuta con tsc verde como guarda.

**Consecuencias**:
- **Pure-sc components SIN equivalente Figma se mantienen** con su naming descriptivo del dominio: `<sc-search>`, `<sc-bulk-action-bar>`, `<sc-empty-state>`, `<sc-form-danger-zone>`, `<sc-form-section-nav>`, `<sc-confirm-host>`, `<sc-label-chip>`, `<sc-color-dot-picker>`, `<sc-inline-rename-cell>`, `<sc-group-popover>`, `<sc-column-selector>`, `<sc-command-palette>`, `<sc-keyboard-shortcuts>`, `<sc-delete-entity-dialog>`, `<sc-impact-preview-dialog>`, `<sc-page-header>`, `<sc-sticky-form-header>`, `<sc-section-card>`, `<sc-photo-upload>`, `<sc-illustrated-avatar>`, `<sc-bulk-edit-menu>` (Backlog #43).
- **CSS classes intra-componente también renombradas** para coherencia 1:1 selector ↔ classes (`.sc-input__label` → `.sc-inputtext__label`).
- **SESSION-LOG.md NO se toca** — historia inmutable. Solo docs vivos.
- **Class names mantenidas cuando ya eran correctas** (`InputNumberComponent`, `InputGroupComponent`, `MultiSelectComponent`, `ToggleSwitchComponent`). Renombradas las divergentes (`Input→InputText`, `Modal→Dialog`, `TriStateCheckbox→Checkbox`).
- **Type aliases TS sin cambio** (`ScInputSize`, `ScInputType`, etc.) — son etiquetas, no afectan API consumer.

**Regla portable post-S47**: cualquier wrapper SCDS nuevo que tenga equivalente PrimeNG nace con naming `sc-XYZ` matching `<p-XYZ>` literal. NO `sc-x-y-z`.

---

## DD-7 · 2026-05-20 (S46) — Política tokens: toda primitive nueva entra en customs-catalog

**Contexto**: en S46 cociné `--sc-font-family-mono` en `01-primitive.css` sin entry en `customs-catalog.md` ni ping al equipo de diseño. Rafa detectó que esto puede crear drift entre código y Figma SC (si el equipo de diseño no sabe que el token existe, no puede referenciarlo al construir specs).

**Decisión**: **toda primitive nueva añadida al SCDS requiere entry en `customs-catalog.md`** con: razón concreta, valor, consumers actuales, plan para Figma SC Variables collection, decisión pendiente el equipo si aplica.

**Razón**: el customs-catalog es la fuente única que el equipo de diseño consulta al actualizar el Kit Pro de Figma. Si un token vive solo en código, se desalinea silenciosamente.

**Consecuencia**: el checklist anti-divergencia (`customs-catalog §0`) ahora aplica también a primitives nuevas, no solo a overrides de Aura.

---

## DD-6 · 2026-05-15 (S33) — `"sideEffects": false` en SCDS package

**Contexto**: bundle AED initial 1.61 MB. `source-map-explorer` reveló que el bundler estaba importando módulos enteros del package SCDS por imports transitivos.

**Decisión**: `"sideEffects": false` en `packages/design-system/package.json`.

**Razón**: tree-shaking efectivo. Resultado inmediato: bundle 1.61 MB → 1.41 MB (-200 KB, bajo budget 1.5 MB del momento).

**Consecuencia**: cualquier futuro componente con CSS side-effect debe declararse explícitamente en el array `sideEffects` del package.json para no romper esto.

---

## DD-5 · 2026-05-15 (S32) — Política minimal customization sobre PrimeNG

**Contexto**: tendencia a crear componentes pure-sc cuando PrimeNG ya tenía el patrón. Riesgo: maintenance cost se dispara cuando PrimeNG actualiza minor versions.

**Decisión**: **customizar lo MÍNIMO** sobre PrimeNG. Antes de cocinar pure-sc nuevo, 3 preguntas obligatorias:
1. ¿PrimeNG ya lo tiene? → wrapper.
2. ¿`pTemplate` cubre el render? → usar slot.
3. ¿PrimeNG NO lo tiene? → pure-sc + entry catalog.

**Razón**: PrimeOne upgrade dry-run se vuelve trivial si SCDS es mayoritariamente wrappers. Cocinar pure-sc duplicado de algo que ya existe es deuda permanente.

**Consecuencia**: refactors S32 (`sc-toggleswitch`, `sc-bulk-edit-menu`) y declines justificados (`inline-rename-cell`, `label-chip`).

---

## DD-4 · 2026-05-15 (S32) — Regla 2+ consumers antes de promover a SCDS

**Contexto**: tentación de promover patrones a SCDS "por si los necesitamos en el futuro". Resultado: catálogo inflado con componentes sin uso real.

**Decisión**: un componente entra al package SCDS cuando:
- (a) se usa en ≥2 lugares de AED, **O**
- (b) es parte explícita de SCDS por decisión de diseño (equipo de diseño).

**Razón**: minimizar surface area. Patrón usado solo 1 vez = vive donde se usa.

**Consecuencia**: gaps documentados en `customs-catalog §5` (`sc-select-button`, `sc-tag`, `sc-toggle-button`) esperan trigger real, no se cocinan.

---

## DD-3 · 2026-05-14 (S31) — Brand divergence: navy primary + electric-blue info + amber warn

**Contexto**: la base Aura usa azul saturado para primary, sky-blue para info, orange para warn. SC tiene identidad propia: navy oscuro para primary, electric-blue saturado para info, amber para warn (no orange).

**Decisión**: overrides en `sc-preset.ts` mapean `--p-*` a `--sc-color-*` SC. Entries 1.1, 1.2, 1.3 del customs-catalog.

**Razón**: identidad de marca Smart Contact. Verificado contra Figma Kit Pro 1:1.

**Consecuencia**: re-sync con PrimeOne upstream nunca toca estos overrides automáticamente. Si Aura cambia su default, SC sigue navy.

---

## DD-2 · 2026-05-14 (S30) — Bridge `sc-preset.ts` como source of truth `--p-*` ↔ `--sc-*`

**Contexto**: PrimeNG 21 expone tokens `--p-*`. SCDS expone `--sc-*`. Necesitábamos un punto único donde mapear los dos sistemas para que cambiar identidad SC no requiera tocar PrimeNG.

**Decisión**: `packages/design-system/tokens/sc-preset.ts` (export `ScPreset`) es el bridge canonical. Componentes consumen `--sc-*`; el preset reenvía a `--p-*` automáticamente.

**Razón**: arquitectura unidireccional. Componentes nunca consumen `--p-*` directamente. Cambiar identidad → cambiar `--sc-*` → bridge propaga.

**Consecuencia**: `sc-preset.ts` es **load-bearing** — no se puede mover, renombrar ni simplificar. Documentado en `migration-safety.md`.

---

## DD-1 · 2026-05-13 (S29) — Tokens en 7 capas CSS

**Contexto**: tokens dispersos en múltiples archivos sin jerarquía. Difícil saber qué cambiar al modificar identidad.

**Decisión**: tokens organizados en 7 capas CSS (`packages/design-system/tokens/layers/`):
1. `01-primitive.css` — raw values (color scales, font, spacing, radius).
2. `02-semantic.css` — aliases semánticos (`--sc-text-primary`, `--sc-bg-default`).
3. `03-palette.css` — color palette por categoría (labels).
4. `04-component.css` — tokens por componente (`--sc-modal-radius`).
5. `05-extensions.css` — z-index scale, motion, shadows, layout dims.
6. `06-primeng-bridge.css` — (legacy, marcado dead code en S29 audit).
7. `07-dark.css` — overrides dark mode.

**Razón**: cascada estable y auditable. Cada capa tiene una responsabilidad clara.

**Consecuencia**: los componentes consumen tokens de capa 2-4 (semánticos / componente), nunca de capa 1 directamente (excepto raros casos donde primitive ES el semantic).

---

Última actualización: 2026-06-02 (Session 67).
