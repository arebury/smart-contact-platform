# SCDS Consumers

> Quién consume qué del Smart Contact Design System, cómo lo hace, y qué
> mantenimiento sostenible necesitamos para que no rompa cuando SCDS evolucione.

---

## Consumers actuales

### 1. AED — Contact Center UI (Angular 21 + PrimeNG 21) — `apps/supervisor/`

> **Naming (S67)**: `AED` es el nombre técnico de la feature (`features/config/aed/`,
> selector + clase NO cambian). De cara al usuario el producto se llama **Contact Center**
> (nav, título del índice de config, "grupo de servicio") desde S67-U2. Breadcrumb config:
> `Contact Center › [Sección]`. La moneda `AED` de country-prefixes no se toca.

**Tipo de consumo**: full SCDS — tokens + componentes + preset.

**Cómo consume**:
- **Tokens** vía `packages/design-system/tokens/index.css` (TS path).
- **Componentes** vía `@shared/components` (mapea a `packages/design-system/components/*`).
- **Preset PrimeNG** importa `sc-preset.ts` en `app.config.ts` (`providePrimeNG({ theme: { preset: ScPreset } })`).

**Estado**: 24+ componentes en producción. 100% migrado de inputs/selects nativos a wrappers SCDS (Sesiones 31+32). 33 spec docs auditados.

**Métrica clave**: ningún archivo de AED consume `<p-*>` o `--p-*` directo. **Total aislamiento garantizado** por la arquitectura SCDS (ver [`migration-safety.md`](migration-safety.md)).

**Patrones consumidos en S67** (consumer-facing; specs canónicos en sus docs):
- **Jerarquía de color config** (Bloque A, Figma `1:12270`): lienzo de página blanco en light
  / `gray-950` en dark, bandeja gris (`--sc-bg-default`), cards de sección blancas
  (`--sc-bg-surface`), índice gris alineado, divider `--sc-border-default` (gray-200 `#dadfe6`).
  Patrón reutilizable por otros consumers (p.ej. settings de Memory). Spec: [`customs-catalog.md`](customs-catalog.md).
- **Estados de agente** (Bloque B): 3 tags fijos (Disponible / No disponible / Administrativo granate)
  + chips editables removibles. Sin token nuevo. Spec: [`customs-catalog.md`](customs-catalog.md).
- **Divider**: hoy `<hr class="divider">` (Solid/Horizontal); registrado en
  [`code-connect-mapping.md`](code-connect-mapping.md) (Kit `302:11810`). Trigger `<sc-divider>`
  solo si se necesita texto/vertical/dashed.
- **`sc-multiselect` con options primitivas** (`string[]`): fix S67 que arregló los 4 multiselect
  de Grupos que salían vacíos. Spec/estado: [`MIGRATION-INVENTORY.md`](MIGRATION-INVENTORY.md).
- **`formDirtyGuard` + "Descartar cambios"**: las 3 rutas de config implementan `DirtyAware`
  (`canDeactivate`, mismo modal que admin); botón outline visible solo con cambios.
  Decisión: [`apps/supervisor/docs/DECISIONS.md`](../../../apps/supervisor/docs/DECISIONS.md) (DD#67).

---

### 2. ds-docs (Angular 21) — `apps/ds-docs/`

**Tipo de consumo**: vehicle de documentación viva.

**Cómo consume**: mismos paths que AED — `@shared/components`, `tokens/index.css`. Renderiza cada componente SCDS con variants + code snippets en galleries interactivas.

**Estado**: 12 galleries live (button, input, input-number, select, datepicker, tabs, tooltip, multi-select, checkbox, toast, modal, search). 21 spec docs sin gallery todavía (backlog Fase 7).

**Métrica clave**: ds-docs SIEMPRE muestra el componente real, nunca copy-paste local. Si SCDS cambia, ds-docs lo refleja en el próximo deploy.

---

## Consumer planeado

### 3. Memory (React + Radix UI) — _repo externo, futuro_

**Estado**: Fase 4 del [`NEXT-SESSION-PLAN.md`](../../../docs/NEXT-SESSION-PLAN.md). Los **4 gates** ya están ✅ cumplidos desde S31 (paleta cerrada, layer 2 estable, 13+ specs, customs catalog formalizado). Listo para activación cuando Rafa lo pida.

**Tipo de consumo planeado**: tokens-only inicialmente. NO componentes (Memory tiene su propia capa React + Radix).

**Cómo consumirá** (Camino C: script de copia manual):

1. Desde el monorepo SCDS, ejecutar:
   ```bash
   ./scripts/copy-scds-tokens.sh /path/to/memory-app
   ```
2. El script copia las 6 capas `--sc-*` + `index.css` a `memory-app/src/styles/sc-tokens/`.
3. Memory importa `@import "./styles/sc-tokens/index.css";` desde su entry CSS.
4. (Opcional) Mapping Tailwind/UnoCSS → `--sc-*` en el config de Memory.

**Por qué Camino C (script manual) y no auto-sync**:
- Memory está en repo separado por decisión del root CLAUDE ("NO migrar Memory al monorepo todavía").
- El script crea trazabilidad explícita (cada sync genera un `SYNC.md` con commit hash SCDS).
- Sin overhead CI ni acoplamiento entre repos. Pull-based vs push.

**Lo que NO va a Memory**:
- `sc-preset.ts` — bridge Angular/PrimeNG, irrelevante para React/Radix.
- Componentes Angular — Memory tiene su propia capa de componentes consumiendo `--sc-*` directos.

**Divergencias Memory específicas**: si Memory necesita un token que NO existe en SCDS, NO lo añade local — pide entry en `customs-catalog.md` y se promueve a `--sc-*`. Si Memory necesita override de un `--sc-*` por contexto (ej. spacing más denso), va en un archivo `memory-overrides.css` separado, importado DESPUÉS de `index.css`. Pattern documentado en `SYNC.md` que genera el script.

---

## Reglas para ANY consumer futuro (interno o externo)

1. **Consumir `--sc-*` solamente**, nunca `--p-*` (PrimeNG raw). El `--sc-*` es source of truth y estable; `--p-*` cambia entre versiones PrimeNG.

2. **Para wrappers de componentes**: si el consumer es Angular + PrimeNG, importar componentes SCDS via `@shared/components`. Si es otro stack (React, Vue, Svelte, native), reescribir componentes consumando tokens `--sc-*` directos. NO portar componentes Angular a otros stacks 1:1.

3. **Divergencias**: si el consumer necesita una variante NO cubierta por SCDS, primero proponer en `customs-catalog.md` (entry nueva + razón). Si Rafa OK la divergence, se añade al SCDS y todos los consumers la heredan. NO local hacks.

4. **Sync periódico**: para consumers externos (Camino C), refresh manual al menos cada 3 meses o cuando se detecte drift visual. El `SYNC.md` mantiene el log de fechas.

5. **NO modificar las layers copiadas**: `sc-tokens/layers/*.css` son read-only desde el consumer. El próximo `copy-scds-tokens.sh` sobrescribe. Custom va en archivos separados.

6. **Tipografía vive en `--sc-font-size-*`, no en PrimeNG**. Desde S67 los tipos están tokenizados y blindados a updates del Kit. El detalle (racional de blindaje) está en [`migration-safety.md`](migration-safety.md); el tooling (`tokens:type-parity`, guard) en [`tokens/README.md`](../tokens/README.md). Para consumers internos (AED, ds-docs) el guard pre-commit aplica; un consumer externo (Memory) recibe solo las CSS vars `--sc-font-size-*`, NO el hook — pero hereda el mismo source of truth: sus tipos viven en las variables compartidas, nunca en `--p-*`.

7. **Documentar customizaciones por QUÉ hacen, no por su origen**. Si un consumer documenta un override, describir el efecto ("footer sticky inverso"), no la referencia de la que se copió. Las marcas externas no van en docs internas.

---

## Dependencia futura conocida

- **Token `--sc-bg-canvas` (gap, deuda #73)**: no existe aún un token semántico único
  para el lienzo de página (blanco en light / `gray-950` en dark). AED lo resuelve hoy con
  un workaround en `settings-shell` (`:host` light, `:host-context(.sc-dark)` dark). Cualquier
  consumer futuro que quiera heredar el patrón "lienzo blanco/dark" tropezará con el mismo gap
  hasta que se promueva la variable. Trigger de promoción: ≥2 consumers o variable Custom en Figma.
  Detalle en [`inconsistencies-backlog.md`](inconsistencies-backlog.md) #73.

## Memoria relevante

- `feedback_migration_safety.md` — 3 reglas blindaje SCDS.
- `feedback_minimal_customization.md` — customizar lo mínimo sobre PrimeNG.
- `reference_aed_primeng_layer_compat.md` — 7 capas `--sc-*` mapean 1:1 a Variable Collections PrimeOne 4.0.

## Referencias

- [`migration-safety.md`](migration-safety.md) — filosofía + reglas blindaje (incluye tipografía).
- [`customs-catalog.md`](customs-catalog.md) — divergencias documentadas.
- [`code-connect-mapping.md`](code-connect-mapping.md) — mapeo código ↔ diseño (componentes + divider).
- [`MIGRATION-INVENTORY.md`](MIGRATION-INVENTORY.md) — inventario componentes + Figma verification log + Lifecycle.
- [`inconsistencies-backlog.md`](inconsistencies-backlog.md) — deuda/gaps pendientes.
- [`scripts/copy-scds-tokens.sh`](../../../scripts/copy-scds-tokens.sh) — sync script Camino C.
