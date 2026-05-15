# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión** (importante para contexto completo):
>
> 1. Lee ESTE archivo completo.
> 2. Lee la entry **Session 32** entera en [`SESSION-LOG.md`](./SESSION-LOG.md) —
>    sprint con cierre Fase 1 + 19 spec docs + migration-safety doc + backlog
>    persistente + 4 refactors consistencia + 4 memorias estructurales nuevas.
> 3. Lee también la entry Session 31 para contexto previo.
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

Ver `packages/design-system/docs/inconsistencies-backlog.md` para listing completo. Items prioritarios:

### A — Item #9 — Deuda `::ng-deep` sticky-form-header

8 `::ng-deep` sobre `<sc-photo-upload>` proyectado en slot. Debería usar el prop `[size]` existente en photo-upload. Documentado en `audit/00-diagnosis.md` Fase 4. Estimación: 30 min.

### B — Item #12-#13 — Auditorías Figma SC pendientes

- `sc-modal` 1:1 contra Figma `❖ Dialog` del Kit (no fetched en S31).
- `sc-select` Filled/Invalid: SCSS apunta a nodos `6195:7785` / `6195:7816` no auditados.

### C — Item #14-#15 — Refinement Figma SC Search (Marta dependent)

- Right Icon en variant "With value + clear icon": defaultea a search; cambiar a X cuando se importe icon al Kit.
- Variants formales del Main Component (Size sm/md/lg × Filled × Disabled) como component set propio.

### D — Item #17 — Build error ds-docs (P1)

`NG8008: GalleryFooterComponent required input 'slug' must be specified`. Pre-existente en main. Bloquea build production de ds-docs.

### E — Mapeo Memory components + usage count (Camino B, Fase 4)

Replicar el patrón `aedUses: N` para `memoryUses: N` cuando Memory consuma SCDS.

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

Por orden de ROI:

1. **Item #17 backlog (NG8008 ds-docs build)**: P1, bloquea build production. Fix → 15-30 min.
2. **Item #9 backlog (sticky-form-header `::ng-deep`)**: deuda real desde S30. Refactor a usar `[size]` prop → 30-45 min.
3. **Items #12-#13 (auditorías Figma sc-modal + sc-select Filled/Invalid)**: cuando Rafa tenga ganas de pasada de Figma. 1-2h.
4. **Galleries ds-docs faltantes**: los 19 nuevos spec docs (15-33) tienen "Página demo: pendiente". Crear las galleries en `apps/ds-docs/src/app/pages/` para que la audiencia diseño tenga vista interactiva. Variable según componente.
5. **Memory Camino B activation** (Fase 4): si Rafa decide arrancar consumer #2 del DS, ~2-4h.

**Recomendación**: arrancar con #1 (fix ds-docs build) + #2 (sticky-form-header) en bloque corto. Ambos cierran deuda histórica P1/P2 con ROI claro.
