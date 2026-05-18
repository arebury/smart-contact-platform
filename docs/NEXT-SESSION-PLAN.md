# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión** (importante para contexto completo):
>
> 1. Lee ESTE archivo completo.
> 2. Lee la entry **Session 34** entera en [`SESSION-LOG.md`](./SESSION-LOG.md) —
>    `.btn` global eliminado (38 botones migrados a `<p-button>`, `_buttons.scss`
>    borrado, tokens `--sc-btn-*` removidos) + 2 refactors Figma 1:1 (confirm-host
>    → `<p-confirmdialog>`, group-popover → `<p-popover>`) + regla pragmática
>    refactor SCDS consolidada en backlog.
> 3. Lee también la entry Session 33 para contexto previo (sc-input-group +
>    bundle perf -200 KB).
> 4. Lee [`packages/design-system/docs/migration-safety.md`](../packages/design-system/docs/migration-safety.md)
>    — **filosofía SCDS** + reglas blindaje + matriz qué tocar/qué no + pro tips
>    devs futuros. **Documento clave** post-S32, captura la política Rafa.
> 5. Lee [`packages/design-system/docs/inconsistencies-backlog.md`](../packages/design-system/docs/inconsistencies-backlog.md)
>    — **fuente única de deuda/gaps** del DS. Antes de proponer nada, mirar
>    aquí qué hay pendiente.
> 6. Lee [`.impeccable.md`](../.impeccable.md) — design context + regla CRITICAL:
>    polish requests NUNCA tocan componentes ni tokens.
> 7. Memoria personal en `~/.claude/projects/-Users-rafareses-dev-smart-contact-platform/memory/MEMORY.md`
>    — feedback acumulado. Atención particular a las **4 memorias nuevas S32**:
>    - `feedback_migration_safety.md` — 3 reglas blindaje migración.
>    - `feedback_minimal_customization.md` — política customización mínima sobre PrimeNG.
>    - `feedback_track_inconsistencies.md` — toda inconsistencia detectada → backlog.
>    - `feedback_figma_link_workflow.md` — links Figma SC → anotar inmediatamente en docs.
> 8. Si vas a tocar Figma vía MCP: file key `khNq9dJKNi13pNllrqm6dx`. Los links que Rafa pasa son ROOT canvas, no nodes puntuales — extraer toda la info del mismo JSON.
> 9. Checklist anti-divergencia formalizado en [`customs-catalog.md §0`](../packages/design-system/docs/customs-catalog.md) — 4 preguntas obligatorias antes de tocar componentes.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 34, 2026-05-18)

**Hitos clave de Session 34** (5 commits a main):

- ✅ **Dual-system `.btn` vs `<p-button>` eliminado**. 38 botones AED + 3 SCDS internals (`sticky-form-header`, `bulk-edit-menu`) migrados a `<p-button>`. `_buttons.scss` borrado (177 líneas). Tokens `--sc-btn-*` removidos en `04-component.css` + `07-dark.css` (~70 tokens). Override `components.button.root` añadido en `sc-preset.ts` (paddingX 10.5 / paddingY 7 / borderRadius 6 / gap 7 — Figma 1:1 con Kit Pro verificado via MCP node `10:124`).
- ✅ **Min-width estable** 144px en `.page-header__actions p-button > .p-button` (main.scss unscoped — `::ng-deep` no alcanza el inner DOM PrimeNG). Cierra shift visible entre list-pages (134-153px medido S34 → 144 floor).
- ✅ **Refactors Figma 1:1 P1**: `sc-confirm-host` → `<p-confirmdialog>` (API Promise pública intacta, internamente wrappea `ConfirmationService`) + `sc-group-popover` → `<p-popover>` (chrome via `overlay.popover` tokens). Ambos reclasificados ⚪ Pure SC → 🟢 Extended en MIGRATION-INVENTORY.
- ✅ **Audit Figma kit recap (node 829:36548)** cross-ref vs MIGRATION-INVENTORY → 3 candidatos P2 evaluados: **2 declined** (inline-rename-cell ≠ Inplace, illustrated-avatar ≠ Avatar — conceptos distintos pese a nombre) + **1 deferred** (section-card → Panel: Panel vive en library externa, no auditable desde Figma SC MCP). **Regla pragmática consolidada en backlog**: refactor SCDS → PrimeNG solo si (1) mismo concepto, (2) reduce código sin forzar UX, (3) tokens auditados.
- ✅ **Backlog items cerrados**: #11 (dual-system), #17 (build error ds-docs verificado verde — item obsoleto), input-number Figma TODO (hereda de sc-input).
- ✅ **Bug pre-existente arreglado de paso**: HTML comment dentro de `<input>` opening tag en `search.component.html` bloqueaba build (Angular template parser).
- ✅ **Memoria nueva** `feedback_case_study_notes.md`: anotar momentos pedagógicos del proyecto progresivamente para presentación case study.

Last commit en main: pendiente (commit final de cierre tras este NEXT-SESSION-PLAN entry).

### Estado factual del catálogo al cerrar S34

- **34 spec docs** (sin cambios estructurales vs S33; entries 14 confirm-host + 18 group-popover ahora marcadas 🟢 Extended).
- **34 galleries ds-docs** (cobertura 100%). Build production ds-docs **verde**.
- **Bundle AED prod**: 1.41 → 1.40 MB initial. agent-form-page.scss 13.59 → 12.96 kB. Visual verificado en 12 pantallas (light + dark) via Playwright.
- **Tokens removidos**: `--sc-btn-*` series completa (light + dark).
- **`_buttons.scss`** eliminado. Botones AED ahora 100% `<p-button>`.
- **inconsistencies-backlog**: 30 entries · 4 resueltas adicionales en S34 (#11, #17, P1 refactors, input-number TODO). Total resueltas: 14/30.

---

## Estado al cerrar (Session 33, 2026-05-18)

**Hitos clave de Session 33** (9 commits a main):

- ✅ **sc-input-group cocinado** + caso real tag-input aed-servicio migrado. SCDS llega a 34 componentes (era 33).
- ✅ **Tracker home redesign**: chips Tipo (custom vs PrimeNG) vs Estado (paridad Figma–código) — conceptos separados. Agrupación por 7 categorías funcionales en lugar de lista plana. Counterpropuesta exitosa a la idea inicial de "mega-página única pure-sc".
- ✅ **Cobertura galleries 100%** (34/34 componentes con página individual en ds-docs).
- ✅ **Frontmatter inline** en 34 spec docs (Type · AED uses · Figma parity).
- ✅ **Type decoupling**: `LabelColor` + `GroupRef` movidos a SCDS. AED re-importa via `@shared/components`. SCDS queda self-contained.
- ✅ **Bug introducido y corregido en la misma sesión**: galleries S33 usaban colores inexistentes (`violet`/`rose`/`cyan`). Reducido a los 8 reales (gray/red/orange/amber/green/teal/blue/purple).
- 🎯 **Perf win**: `"sideEffects": false` en `packages/design-system/package.json` → AED initial bundle 1.61 MB → 1.41 MB (-200 KB, bajo budget 1.5 MB). Diagnóstico via source-map-explorer.
- ✅ **Audits Figma cerrados como falsos positivos** (#12 `sc-modal`, #13 `sc-select` Filled/Invalid): la auditoría ya existía desde S30/S31, solo las descripciones del backlog estaban desactualizadas.
- ✅ **Lint sweep**: 71 errores (regla mal configurada post-monorepo) → 0. Prefix array `["sc", "aed"]` en el eslint config.
- ✅ **Memoria nueva** `critical-sparring-partner`: 5-step protocol para planes/opiniones complejas.

Last commit en main: `609e1e6` (chore lint).

### Estado factual del catálogo al cerrar S33

- **34 spec docs en `packages/design-system/docs/components/`** (entry 34 nueva: input-group).
- **34 galleries ds-docs** (cobertura 100%, antes 17). 5 son documentales para shell-only components (command-palette, keyboard-shortcuts, confirm-host) — el mock del servicio no aporta valor.
- **Tracker home agrupado por 7 categorías**: Formularios y entrada, Acciones, Layout, Navegación, Overlays, Tablas, Estados vacíos.
- **Bundle AED prod**: 1.41 MB initial (-200 KB vs S32). Gzip ~330 KB transfer real.
- **Customs catalog**: 13 entries (sin cambios estructurales).
- **inconsistencies-backlog**: 30 entries · 8 resueltas en S33 (incluyendo 2 falsos positivos).

---

## Estado al cerrar (Session 32, 2026-05-15)

**Hitos clave de Session 32**:

- ✅ **Fase 1 AED migraciones cerrada al 100%**: 5 forms residuales (template, label, user, group, repo) migrados a SCDS. Sin nativos restantes en formularios.
- ✅ **Auditoría nivel-2 pure-sc**: 21 componentes, 0 P0/P1 reales, 12 P2 caso a caso → todos DECLINE. Catálogo en estado muy sano (8/21 clean directamente, 13 ya documentados con comments inline).
- ✅ **19 nuevos spec docs** (15-33): cobertura 100% de pure-sc (era 2/21, ahora 21/21). Catálogo total: 33 docs.
- ✅ **`migration-safety.md`** (NUEVO): doc estructural con filosofía SCDS + 3 reglas blindaje + matriz qué tocar/qué no + 6 pro tips devs futuros. **Lectura obligatoria** para próximos contributors.
- ✅ **`inconsistencies-backlog.md`** (NUEVO): punto único tracking de deuda/gaps con severidad + fase + status. 17 entries iniciales (S30+S31+S32 histórico).
- ✅ **4 refactors consistencia** (memoria `minimal-customization`):
  - `bulk-edit-menu`: `<select>` × 2 → `<sc-select>` con pTemplate.
  - `toggle-switch`: pure-sc CSS → wrapper de `<p-toggleswitch>`. 21 consumers AED intactos.
  - `inline-rename-cell` + `label-chip`: declined con justificación documentada (rompería visual / no encaja con p-tag/p-chip).
- ✅ **4 memorias estructurales nuevas** capturando feedback Rafa: migration safety, minimal customization, track inconsistencies, figma link workflow.
- ✅ **Audit Figma SC vs PrimeOne base**: confirmado NO se han modificado variables Figma base. Política `audit/01-identity-recap.md §2.10` consistente. Riesgo migración Prime upstream: BAJO.

Last commit en main: `1c52d58` (docs scds spec docs + refactors S32).

### Estado factual del catálogo al cerrar

- **33 spec docs en `packages/design-system/docs/components/`** (era 14 al inicio S32):
  - 11 Extended (wrappers PrimeNG): input, input-number, select, multi-select, datepicker, modal, checkbox, search, **toggle-switch (nuevo Extended S32)**, label-chip*, **dialog/tooltip**.
  - 4 Custom-preset: button, toast, tabs.
  - 1 Full-PrimeNG: tooltip.
  - 17+ Pure-SC: section-card, empty-state, photo-upload, illustrated-avatar, page-header, form-section-nav, form-danger-zone, sticky-form-header, bulk-action-bar, bulk-edit-menu, impact-preview-dialog, delete-entity-dialog, column-selector, inline-rename-cell, group-popover, command-palette, keyboard-shortcuts, confirm-host, color-dot-picker.
- **AED usage por componente** (recount oficial post-S32):
  - sc-toggle-switch 21 · sc-input 21 · sc-select 16 · sc-section-card 12 ·
    sc-search 8 · sc-page-header 8 · sc-delete-entity-dialog 8 · sc-input-number 7 ·
    sc-illustrated-avatar 7 · sc-tri-state-checkbox 6 · sc-bulk-action-bar 6 ·
    sc-sticky-form-header 3 · sc-label-chip 3 · sc-inline-rename-cell 3 ·
    sc-form-section-nav 3 · sc-form-danger-zone 3 · sc-empty-state 3 ·
    sc-column-selector 3 · sc-photo-upload 2 · sc-modal 2 · sc-impact-preview-dialog 2 ·
    sc-bulk-edit-menu 2 · sc-keyboard-shortcuts 1 · sc-group-popover 1 ·
    sc-confirm-host 1 · sc-command-palette 1 · sc-color-dot-picker 1 ·
    **sc-multi-select 0 · sc-datepicker 0** (esperan primer caso real AED).
- **Backlog inconsistencies**: 17 entries — 2 ✅ resueltas S32 (bulk-edit-menu, toggle-switch refactors), 2 ⏸️ rechazadas con justificación (inline-rename-cell, label-chip), 4 gaps componente conocidos (`sc-input-group`, `sc-select-button`, `sc-tag`, `sc-toggle-button`), resto deuda histórica.
- **Customs catalog**: 13 entries (sin nuevas en S32 — los refactors son **alineación**, no divergence). §5.6 `sc-toggle-button` gap nuevo + §5.7 reseña refactors S32.
- **Figma SC**: NO se modificaron variables base. Canvas `❖ Search` (node 11861:55210) compuesto S31 sigue intacto.

---

## Fase 1 — ✅ CERRADA

Migraciones inputs/selects nativos AED → SCDS: 100% completa.
Inputs y selects que NO migran (justificados, NO en backlog):
- `inline-rename-cell` mantiene `<input>` nativo (decision visual S32).
- `bulk-edit-menu` ahora usa `<sc-select>` internamente (refactor S32).

---

## Fase 2 — Componentes nuevos por trigger real

Los **4 gaps documentados en customs-catalog §5** + **inconsistencies-backlog #5-#8**:

1. **`sc-input-group`** (Figma node 6738:22644) — wrapper de `<p-inputgroup>` para addon left/right. **Trigger**: primer caso real input+icono o input+botón en AED. Hay 1 caso pendiente (`tag-input` aed-servicio estados).
2. **`sc-select-button`** (Figma node 6738:46433) — wrapper de `<p-selectbutton>` para chips toggle segmented. **Trigger**: primer filtro segmented real en AED. Sin caso hoy.
3. **`sc-tag`** (Figma node 6738:55116) — wrapper de `<p-tag>` para etiquetas severity-fill no removibles. **Trigger**: primer caso de tag visual (severity/estado lleno color). NO confundir con `sc-label-chip` que cubre el `❖ Chip` (categorical color custom).
4. **`sc-toggle-button`** (Figma node 6738:46435) — wrapper de `<p-togglebutton>` para button con estado pressed/unpressed. **Trigger**: primer caso real en AED. Sin caso hoy.

Nuevos componentes hipotéticos (NO empezar sin caso real):
- Autocomplete, TimePicker, DateRange, Pagination, SegmentedControl.

---

## Fase 3 — Auditorías adicionales pendientes (del backlog)

Ver `packages/design-system/docs/inconsistencies-backlog.md` para listing completo. Items remaining tras S33:

### A — Item #14-#15 — Refinement Figma SC Search (Marta dependent)

- Right Icon en variant "With value + clear icon": defaultea a search; cambiar a X cuando se importe icon al Kit.
- Variants formales del Main Component (Size sm/md/lg × Filled × Disabled) como component set propio.

### B — Mapeo Memory components + usage count (Camino B, Fase 4)

Replicar el patrón `aedUses: N` para `memoryUses: N` cuando Memory consuma SCDS.

### C — Item #11 — `_buttons.scss` migrate a SCDS

Mover `apps/aed/src/styles/_buttons.scss` a `packages/design-system/styles/_buttons.scss` siguiendo el patrón de `_sc-toast.scss`. **Condición de trigger**: aparece segundo consumer (ds-docs hoy no usa `.btn`).

> Ítems resueltos / cerrados S33: #5 (sc-input-group), #10 (bundle perf -200 KB), #12/#13 (audits Figma — falsos positivos), #16 (galleries 14/14), #26 (frontmatter), #29 (type decoupling), #30 (bug colores galleries S33).

---

## Fase 4 — Memory consume tokens SCDS ("Camino B")

Los **4 gates ya están ✅ cumplidos** desde S31. Plan concreto (sin cambios):

1. Decidir mecanismo: **Camino C (script de copia)** para empezar.
2. Setup en Memory: `src/styles/sc-tokens/` con las 7 capas copiadas + importar `01-primitive.css` + `02-semantic.css`.
3. Borrar de Memory cualquier `--*` que duplique un `--sc-*`.
4. Verificar build verde + pantallas no rompen.
5. (Opcional) Mapping Tailwind → `--sc-*` en `tailwind.config.ts` de Memory.
6. Documentar en SCDS `docs/consumers.md` que Memory es consumer.

Tiempo: 2-4h. Requiere acceso al repo Memory (no está en monorepo).

---

## Reglas operativas (actualizadas Session 33)

**🆕 Nueva regla S33** (memoria `critical-sparring-partner`):

20. **Crítica constructiva por defecto en planes/decisiones complejas**. 5-step protocol: assumptions, counterpoints, reasoning, alternatives, correction. NO agree por defecto. Para tareas mecánicas (rename, mover archivo, escribir componente con API clara): aplicar criterio y ejecutar sin ceremonia.

---

## Reglas operativas (actualizadas Session 32)

1. **Polish requests NUNCA tocan componentes ni tokens** (CRITICAL `.impeccable.md`).

2. **🆕 Customizar lo MÍNIMO sobre PrimeNG** (memoria `minimal-customization`). Antes de crear pure-sc nuevo, 3 preguntas: ¿PrimeNG ya lo tiene? → wrapper. ¿pTemplate cubre el render? → usar slot. ¿PrimeNG NO lo tiene? → pure-sc + entry catalog.

3. **🆕 Migration safety SIEMPRE** (memoria `migration-safety`). 3 reglas: `--sc-*` único source + wrappers encapsulan + customs-catalog registra TODA divergence. Doc completa en `packages/design-system/docs/migration-safety.md`.

4. **🆕 Inconsistencias detectadas → backlog persistente** (memoria `track-inconsistencies`). Toda finding sin acción inmediata → entry en `inconsistencies-backlog.md` con severidad + fase. No postergar sin trazabilidad.

5. **🆕 Links Figma SC → anotar inmediatamente** (memoria `figma-link-workflow`). Rafa pasa links puntuales; Claude tiene acceso al file entero via MCP. Anotar en spec doc + MIGRATION-INVENTORY el mismo turno.

6. **PEDIR link Figma SC ANTES de tocar/crear/refinar componente** (memoria `figma-link-before-component`). Si Rafa no tiene a mano, esperar.

7. **Los links Figma de Rafa son root canvas, no nodes puntuales** (memoria `figma-links-full-pages`). Extraer todo del mismo JSON.

8. **Aplicar checklist anti-divergencia** (customs-catalog §0). 4 preguntas obligatorias antes de añadir prop / slot / CSS override.

9. **Figma specs exhaustivos**: extraer auto-layout, paddings (incluso decimales), tokens (boundVariables), variants (componentProperties). Memoria `figma-specs-thorough`.

10. **Verificación obligatoria post-claim**: cuando un agente reporte "hecho", pedir 1 verificación reproducible (curl, screenshot, hash, AOT verde).

11. **🆕 Audit reportes requieren sanity check** (lección S32). Trust agents para research, verify la severidad antes de aplicar. Especialmente: estilo TypeScript (`: void` explicit), `::ng-deep` documentados, JSDoc faltantes (puede que ya tenga inline comments).

12. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

13. **Componentes y refactors menores**: directo a `main`. Cambios estructurales gordos: rama + PR.

14. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con tradeoffs.

15. **Nunca clavar repo en `~/Desktop/`, `~/Documents/` ni rutas iCloud ☁️**. Usar `~/dev/`.

16. **Spec doc nuevo cada vez que cocines un componente**. Patrón establecido: TL;DR / Cuándo / API / Tokens por variant / Divergencias / Migración AED / Página demo / Figma reference. 33 ejemplos en `docs/components/01-33`.

17. **Brand divergence nueva** → entry en `customs-catalog.md` + mention en el spec doc del componente afectado. Catalog es la fuente única.

18. **ds-docs vehicle** = polish ok. **packages/design-system/components/** + tokens + sc-preset.ts = sacred. Ver `.impeccable.md` para detalle.

19. **Bug pattern conocido — SCSS selector dead en wrappers PrimeNG**: cuando un wrapper SCDS aplica una clase (ej. `sc-X__control`) al `<p-X>` root, PrimeNG añade su propia clase (`p-X`) al MISMO elemento. NO usar selectores descendant `.sc-X__control .p-X` — usar `.sc-X__control` directo. Y NO usar `display: block` en estos wrappers — rompe el `inline-flex` interno de PrimeNG.

---

## Sugerencias arranque próxima sesión

**Pendiente en backlog post-S34** (todo P3, todo espera trigger externo o decisión Marta):

| # | Item | Severidad | Trigger |
|---|---|---|---|
| 6 | `<sc-select-button>` gap | P3 | Primer filtro segmented real |
| 7 | `<sc-tag>` gap | P3 | Primer caso severity-fill |
| 8 | `<sc-toggle-button>` gap | P3 | Primer caso button pressed state |
| 14 | Refinement Figma Search (icon X clear) | P3 | Marta decision |
| 15 | Variants formales Figma Search | P3 | Marta decision |
| 27 | Branch deploys Netlify production-only | P3 | Equipo crezca |
| 28 | Memory CI workflow (post-activation) | P3 | Memory active + threshold |
| — | `sc-section-card` → `<p-panel>` | P2 deferred S34 | Audit `❖ Panel` SC (Marta) |

**Por orden de ROI próxima sesión** (todas opcionales — esperan algo externo):

1. **Memory Camino B activation** (Fase 4): si Rafa tiene acceso al repo Memory, ejecutar `scripts/copy-scds-tokens.sh <path>`. 1-2h validación. Es lo más cercano a "siguiente fase del proyecto" — y ahora particularmente atractivo, porque Memory consumirá DS sin `.btn` legacy (post-S34) y se beneficia automáticamente del refactor Figma 1:1 (button + confirm-host + group-popover).

2. **Refinement Figma Search (#14, #15)** si Marta decide: cambiar el right icon a `X clear` cuando se importe + cocinar variants formales del Main Component. Marta dependent.

3. **`sc-section-card` → `<p-panel>`** SI Marta audita `❖ Panel` en SC primero. 24 consumers AED → refactor mediano-grande, no ejecutar sin tokens auditados.

**Sin urgencia**:
- Gaps componentes (#6, #7, #8): esperar trigger real (memoria `minimal-customization`).
- Netlify PR previews / Memory CI: thresholds externos.
- Refactors a Figma 1:1 P2 declined (inline-rename-cell, illustrated-avatar): conceptos distintos, NO retomar (decisión documentada en backlog).

**NO atacar sin requerimiento explícito**:
- Crear componentes pure-sc "por si acaso" — memoria `minimal-customization`.
- Tocar Figma SC sin que Marta lo pida.
- Refactors estructurales (memoria `reference_structural_refactor_plan` — plan dormido por diseño).

## Reglas operativas (actualizadas Session 34)

**🆕 Nueva regla S34** (memoria `case-study-notes` + regla pragmática refactor):

21. **Anotar momentos pedagógicos progresivamente** (memoria `case-study-notes`): cuando surja algo interesante (refactor con historia, sparring que cambió decisión, gotcha técnica, premisa equivocada) anotarlo para presentación case study. Filtrar señal vs morralla, no urgente, archivo dedicado (no en backlog).

22. **Regla pragmática refactor SCDS → wrapper PrimeNG** (consolidada en `inconsistencies-backlog.md` cierre S34): solo refactor si los 3 criterios se cumplen — (a) mismo concepto, (b) reduce código sin forzar UX changes en consumers, (c) tokens Figma auditados. Conceptos distintos con nombre parecido (Inplace ≠ inline-rename-cell, Avatar ≠ illustrated-avatar) NO se refactorizan. Patterns in-house sin equivalente Figma (empty-state, danger-zone, sticky-form-header, command-palette, page-header) NO se refactorizan.

23. **Verificación visual obligatoria post-migración mecánica** (lección S34): el grep no es la realidad. Tras cualquier rename/eliminate masivo, validar con Playwright al menos 5-7 pantallas (light + dark) para detectar deuda escondida (e.g. componentes SCDS internals que el grep `apps/aed/src` no toca).

24. **`<p-confirmdialog>` es el patrón canonical para confirmation dialogs SC** (S34): NO crear nuevos sc-modal manuales para confirmaciones — usar `ConfirmHostService.request(req): Promise<boolean>` que internamente wrappea PrimeNG `ConfirmationService`. Para dialogs no-confirmation (delete-entity, impact-preview), seguir usando `<sc-modal>` directamente.

25. **`<p-popover>` para overlays anchored a un trigger** (S34): si necesitas un panel float anchor-positioned, usar `<p-popover>` directamente o vía wrapper SC (como `sc-group-popover`). Beneficio: tokens `overlay.popover` 1:1 Figma + posicionamiento PrimeNG + render en `<body>` (escapa clips).
