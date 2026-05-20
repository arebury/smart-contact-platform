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

Última actualización: 2026-05-20 (Session 46).
