# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión** (importante para contexto completo):
>
> 1. Lee ESTE archivo completo.
> 2. Lee la entry **Session 31** entera en [`SESSION-LOG.md`](./SESSION-LOG.md) —
>    18 commits cubriendo migraciones AED (13 inputs/selects), ds-docs tracker
>    re-encuadrado (audiencia diseño + glosario + filter chips + AED usage count),
>    auditoría Figma SC + cleanup de los 7 Extended (3 bugs CSS silenciosos
>    análogos arreglados, props huérfanas eliminadas, customs-catalog formalizado).
> 3. Lee también la entry Session 30 para contexto previo (cocinados, polish, etc.).
> 4. Lee [`.impeccable.md`](../.impeccable.md) — design context + regla CRITICAL:
>    polish requests NUNCA tocan componentes ni tokens.
> 5. Memoria personal en `~/.claude/projects/-Users-rafareses-dev-smart-contact-platform/memory/MEMORY.md`
>    — feedback acumulado. Atención particular a:
>    - `feedback_figma_link_before_component.md` — PEDIR el link Figma SC ANTES de tocar/crear/refinar componente.
>    - `feedback_figma_links_full_pages.md` — los links que Rafa pasa son root canvas (todos los variants en 1 JSON).
>    - `feedback_figma_specs_thorough.md` — extraer specs exhaustivas (no solo screenshot).
>    - `feedback_ds_docs_validados_audience.md` — el tracker es para diseño, no devs.
> 6. Si vas a tocar Figma vía MCP: file key `khNq9dJKNi13pNllrqm6dx`. Los links que Rafa pasa son ROOT canvas, no nodes puntuales — extraer toda la info del mismo JSON.
> 7. Checklist anti-divergencia formalizado en [`packages/design-system/docs/customs-catalog.md`](../packages/design-system/docs/customs-catalog.md) — usar las 4 preguntas antes de tocar cualquier componente.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 31, 2026-05-15)

**Hitos clave de Session 31 (24 commits totales)**:

- ✅ **agent-form-page 100% sin selects nativos**: 8 selects migrados a `<sc-select>`
  (max-chats, pickup call/chat, type, presence, ext, label, language). Patrones
  cubiertos: primitives (number[]), array literal con `| translate` pipe, content
  projection `pTemplate` (B refinada), action-add con signal externo + reset.
- ✅ **agent-form-page 4 inputs text/email/url migrados a `<sc-input>`**: email,
  phone, pin, iframe-url. Componente sc-input enriquecido con prop `inputmode`
  (hint al teclado virtual mobile).
- ✅ **aed-servicio + group-form**: 3 `<sc-input-number>` + 1 `<sc-input-number>` con
  refactor del modelo (string → number). Mejora estructural del componente:
  `--sc-input-number-suffix-pad` calculado del length del suffix.
- ✅ **aed-grupos 100% migrado**: 2 `<sc-select>` (prioridad, estrategia) + 2 bugs del
  componente arreglados (primitives + display block).
- ✅ **aed-servicio + aed-agentes**: 3 inputs text/url adicionales migrados a
  `<sc-input>` (callblending-url, iframe-url, iframe-titulo).
- ✅ **NUEVO componente `sc-search`** (Extended): composición p-iconfield +
  p-inputicon + pInputText + clear button auto + opcional kbd hint (⌘K/). 8
  consumers AED migrados (6 list-pages toolbars + 2 picker-search agent-form).
  Cleanup de ~200 líneas dead CSS distribuido en 6 SCSS local-by-page +
  main.scss + agent-form. Spec doc 14-search.md + gallery `/components/search`.
- ✅ **Figma SC `❖ Search` (node 11861:55210)** compuesto via `claude_ai_Figma__use_figma`:
  Page Header + Examples frame con Mode Light + Mode Dark cards (5 variants cada
  uno) + Components frame con Main Component "search" preset del InputText.
  Aprendizaje: sc-search en Figma es **preset del InputText**, no component set
  propio — el InputText del Kit ya expone los slots necesarios.
- ✅ **ds-docs tracker** re-encuadrado: audiencia DISEÑO (no devs). "Hecho en Figma"
  ≠ "validado en producción". Glosario llano + AED usage count + 3 grupos de filter
  chips + search con shortcut `/`.
- ✅ **Auditoría Figma SC** de 6 nodes (Input, InputGroup, Select, SelectButton,
  MultiSelect, Datepicker) + Breadcrumb + Chip + Tag. 3 gaps identificados
  (sc-input-group, sc-select-button, sc-tag). 1 prop huérfana eliminada
  (`leftIcon`/`rightIcon` mezclaba 2 componentes Figma).
- ✅ **Cleanup post-audit Extended**: 3 bugs CSS silenciosos análogos arreglados
  (sc-select / sc-multi-select / sc-datepicker — el selector `.sc-X__control .p-X`
  era dead porque ambas clases viven en el mismo elemento). Dead imports eliminados.
- ✅ **Auditoría profunda pure-sc** (22 componentes): cero issues (0 console.*,
  0 NgClass single-use, 0 SCSS selector bug, 0 dead imports). Catálogo en muy
  buen estado.
- ✅ **customs-catalog formalizado**: checklist anti-divergencia (4 preguntas
  obligatorias) + sección 5 con gaps conocidos (sc-input-group, sc-select-button,
  sc-tag) + sc-search documentado (gap → cubierto) + reclasificación
  tri-state-checkbox.

Last commit en main: `6a58810` (docs close Figma Search canvas).

### Estado factual del catálogo al cerrar

- **33 entries en tracker ds-docs** (button + 14 spec docs + 18 pure-sc + reclasificaciones).
  - **21 pure-sc**, **8 extended** (incluye sc-search nuevo), **3 custom-preset**, **1 full-primeng**.
  - Post sc-search migraciones: el conteo AED usage de search subirá a 7 cuando
    snapshot manual se actualice (TODO próxima sesión recount).
- **AED usage por componente** (snapshot pre sc-search migrations):
  - button 38, toggle-switch 21, section-card 12, **select 11**, **input 14**
    (post-S31), page-header 8, delete-entity-dialog 8, **input-number 7**,
    illustrated-avatar 7, **search 7** (post-S31), tri-state-checkbox 6,
    bulk-action-bar 6, label-chip 3, modal 2, ... etc. **Sin uso aún**:
    datepicker, multi-select, tabs, tooltip.
- **14 spec docs** + **11 galleries live** + gallery search nueva pendiente de
  deploy.
- **Figma SC `❖ Search`**: composición completa Light + Dark + Components + Main
  Component. Pendiente refinement minor (Right Icon swap a X clear cuando Marta
  trabaje pantallas reales).
- **Memory**: cero integración. Camino B con 4 gates ✅ cumplidos, esperando activación.
- **Customs catalog**: checklist anti-divergencia + 5 secciones (brand colors,
  extensions, overloads, sizes, gaps). sc-search documentado en §5.5.

---

## Fase 1 (activa) — Migraciones AED restantes (mucho menos pendiente post-S31)

### Inputs/selects nativos restantes (inventario al cierre S31)

- **`<sc-input>` / `<sc-input-number>` / `<sc-select>`** en formularios: la mayoría
  migrados. Pendientes residuales sin tocar todavía:
  - **`group-form-page`** restantes (post-capacityValue): inputs name + phone
    (verificar inventario), select chatStrategy.
  - **`user-form-page`**: 2 inputs (email + nombre) sin migrar — son los del
    "create user", relativamente bajos en uso.
  - **`label-form-panel`** / **`template-form-panel`** / **`repo-form-panel`**:
    inputs internos sin migrar — fuera del scope crítico.
  - **`agent-form-page`**: ya 100% migrado salvo 2 picker-search (ya migrados a
    `<sc-search>` en S31).
- **NO migrables a sc-input directo (gap conocido en customs-catalog)**:
  - `tag-input` en aed-servicio estados — necesita `sc-input-group` con addon
    button (1 caso real, low priority).
  - `confirm__input` + `search__input` en sistema-page regen — chrome custom
    (1 sitio).

**Tiempo estimado**: ~30-60 min para terminar la migración completa de inputs
texto en formularios principales. Sin urgencia.

**Recordar**: aplicar el patrón establecido (adapter `onXValueChange(value: unknown)`,
content projection `pTemplate` cuando label requiera i18n derivada, signals
transitorios para action-add).

### Patrones de migración consolidados Session 31

| Caso | Patrón |
|---|---|
| Primitives (`string[]`/`number[]`) | `[options]` directo. El sc-select detecta primitives y omite optionLabel/Value. |
| `[{label, value}]` hardcoded con i18n | Array literal en template con `\| translate` pipe inline (estrategia D). Reactivo a cambio idioma. |
| Colecciones derivadas con i18n lookup | Content projection `<ng-template pTemplate="item" let-X>{{ keys[X] \| translate }}</ng-template>` (B refinada). |
| Action-add (value="" + array externo) | Signal transitorio `signal<T \| null>(null)` que se resetea tras pick. Adapter `onXValueAdd` + computed `addableX()`. |

---

## Fase 2 — Más componentes nuevos cuando aparezca caso real

Los 3 gaps documentados en customs-catalog §5:

1. **`sc-input-group`** (Figma node 6738:22644) — wrapper de `<p-inputgroup>` para
   addons left/right. Cuándo: primer caso real input+icono o input+botón en AED.
2. **`sc-select-button`** (Figma node 6738:46433) — wrapper de `<p-selectbutton>`
   para chips toggle segmented. Cuándo: primer filtro segmented real en AED.
3. **`sc-tag`** (Figma node 6738:55116) — wrapper de `<p-tag>` para etiquetas
   categóricas no removibles. NO confundir con `sc-label-chip` que cubre el Chip
   Figma (6738:55109). Cuándo: primer caso de tag visual (severity/estado lleno
   color).

Nuevos componentes hipotéticos (NO empezar sin caso real):
- Autocomplete, TimePicker, DateRange, Pagination, SegmentedControl.

---

## Fase 3 — Auditoría adicional pendiente

### A — Auditoría profunda pure-sc (22 componentes)

Session 31 hizo pasada superficial (0 dead imports, 0 console.* huérfanos). Falta
auditoría profunda componente por componente:
- Comentarios profesionales WHY donde no son obvios.
- CSS structure (selectores, especificidad).
- A11y (aria-*, focus management).
- TS strict (any injustificados).
- Naming consistency.

**Estimación**: 1 sesión dedicada de 2-3h, componente por componente con OK explícito.

### B — Auditoría adicional Extended

- **sc-select** Filled/Invalid: el SCSS apunta a otros node-ids del Figma
  (`6195:7785` Filled, `6195:7816` Invalid) que NO se auditaron en S31. Verificar
  si esos nodes existen y replicar 1:1 si aplica.
- **sc-modal**: auditoría 1:1 contra Figma `❖ Dialog` del Kit (no fetch en S31).
- **sc-button** SCSS: mover `apps/aed/src/styles/_buttons.scss` →
  `packages/design-system/styles/_buttons.scss` siguiendo patrón `_sc-toast.scss`.
  **Condición**: cuando aparezca segundo consumer (ds-docs hoy no usa `.btn`).

### C — Componentes pure-sc sin spec doc (~12)

bulk-action-bar, bulk-edit-menu, photo-upload, illustrated-avatar, form-danger-zone,
form-section-nav, etc. Spec doc + entry en `MIGRATION-INVENTORY.md`.

### D — Refinement Figma SC `❖ Search` (heredado S31)

- Right Icon en variant "With value + clear icon": defaultea a search; cambiar a X
  clear cuando se importe icon X al Kit (decisión Marta).
- Variants formales del Main Component "search" (Size sm/md/lg × Filled × Disabled)
  como component set propio si Marta quiere — hoy es 1 main component sin variants.

### E — Mapeo Memory components + usage count (cuando se active Camino B)

Réplicar el patrón `aedUses: N` del tracker para `memoryUses: N`. Permite ver
prioridad combinada de cada componente del DS (cuántas veces se usa en AED + Memory).
Útil para conversación con devs de Memory.

---

## Fase 4 — Memory consume tokens SCDS ("Camino B")

Los **4 gates ya están ✅ cumplidos** (paleta cerrada, layer 2 estable, 13 specs,
customs catalog completo con checklist). Listo para activar cuando el usuario lo
pida.

**Plan concreto** (sin cambios desde sesiones anteriores):

1. Decidir mecanismo: **Camino C (script de copia)** para empezar — 1 tarde.
2. Setup en Memory: crear `src/styles/sc-tokens/` con las 7 capas copiadas +
   importar `01-primitive.css` + `02-semantic.css` desde el entry CSS.
3. Borrar de Memory cualquier `--*` que duplique un `--sc-*`.
4. Verificar build verde + pantallas no rompen.
5. (Opcional) Mapping Tailwind → `--sc-*` en `tailwind.config.ts` de Memory.
6. Documentar en SCDS `docs/consumers.md` que Memory es consumer.

**Tiempo estimado**: 2-4h.

**Importante**: las brand divergences del catálogo NO se transmiten automáticamente.
Memory hereda los tokens vía CSS variables, pero su capa de componentes (React +
Radix) decide conscientemente cuál usar. Ver final de `customs-catalog.md` para guía.

---

## Reglas operativas (actualizadas Session 31)

1. **Polish requests NUNCA tocan componentes ni tokens** (regla CRITICAL en
   `.impeccable.md`). Solo ds-docs vehicle + app shells. Los componentes son
   interpretaciones 1:1 sacred de los tokens Figma.

2. **🆕 PEDIR link Figma SC ANTES de tocar/crear/refinar un componente** (memoria
   `feedback_figma_link_before_component.md`). Si Rafa no tiene el link a mano,
   esperar a que lo busque. NO inventar diseño que después haya que rehacer.

3. **🆕 Los links Figma de Rafa son root canvas, no nodes puntuales** (memoria
   `feedback_figma_links_full_pages.md`). Extraer todo del mismo JSON (Examples,
   Components, Parts, Variants), no pedir más nodes.

4. **🆕 Aplicar checklist anti-divergencia** antes de añadir cualquier prop / slot
   / CSS override (customs-catalog §0). 4 preguntas: ¿PrimeNG ya lo expone? ¿token
   PrimeNG cubre? ¿brand-required? ¿handoff Prime = import+linkar CSS?

5. **Figma specs exhaustivos**: extraer auto-layout, paddings (incluso decimales),
   tokens (boundVariables), variants (componentProperties), composición
   (componentId). No solo el screenshot. Memoria `feedback_figma_specs_thorough.md`.

6. **Verificación obligatoria post-claim**: cuando un agente reporte "hecho", pedir
   1 verificación reproducible (curl, screenshot, hash).

7. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

8. **Componentes y refactors menores**: directo a `main`. Cambios estructurales
   gordos: rama + PR.

9. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con tradeoffs.

10. **Nunca clavar un repo en `~/Desktop/`, `~/Documents/` o cualquier ruta con
    icono ☁️**. Usar `~/dev/`. Migración confirmada exitosa post-Session 30 (sin más
    problemas de push iCloud).

11. **Spec doc nuevo cada vez que cocines un componente**. Patrón establecido:
    TL;DR / Cuándo / API / Tokens por variant / Divergencias / Migración AED /
    Página demo / Figma reference. 13 ejemplos en `docs/components/01-13`.

12. **Brand divergence nueva** → entry en `customs-catalog.md` + mention en el spec
    doc del componente afectado. Catalog es la fuente única.

13. **ds-docs vehicle** = polish ok. **packages/design-system/components/** + tokens
    + sc-preset.ts = sacred. Ver `.impeccable.md` para detalle.

14. **🆕 Bug pattern conocido — SCSS selector dead en wrappers PrimeNG**: cuando un
    wrapper SCDS aplica una clase (ej. `sc-X__control`) al `<p-X>` root, PrimeNG
    añade su propia clase (`p-X`) al MISMO elemento. NO usar selectores descendant
    como `.sc-X__control .p-X` — usar `.sc-X__control` directo. Y NO usar
    `display: block` en estos wrappers — rompe el `inline-flex` interno de
    PrimeNG. Aplicar a futuros wrappers nuevos.
