# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión**: lee este archivo + el último entry de
> [`SESSION-LOG.md`](./SESSION-LOG.md) y arranca por la Fase activa sin
> re-explicación.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 30, 2026-05-15)

- ✅ Foundation monorepo cerrada (Session 27, PR #47).
- ✅ Repo migrado fuera de iCloud (Session 29).
- ✅ Netlify ds-smartcontact desbloqueado vía `ANGULAR_PROJECT=ds-docs` (Session 29, verificado).
- ✅ **Fase 1 — paleta `--sc-color-gray-*` → Aura slate** cerrada (Session 30). Audit HTML en
  `apps/ds-docs/public/audits/2026-05-15-palette-slate/diff.html` (también ZIP en
  `~/Downloads/`).
- ✅ **5 componentes nuevos cocinados + 2 retro-auditados** con rigor Figma 1:1 (Session 30):
  - `sc-input-number` (🟢 Extended) — wrapper sobre `<input type="number">` con suffix unidad.
  - `sc-select` (🟢 Extended) — wrapper sobre `<p-select>`, options + filter + showClear.
  - `sc-datepicker` (🟢 Extended) — wrapper sobre `<p-datepicker>`, popup + inline + view modes.
  - `<p-tabs>` (🟣 Custom-preset) — overrides en `components.tabs` para padding raw.
  - `[pTooltip]` (🟦 Full PrimeNG) — overrides en `components.tooltip.root`.
  - `sc-input` retroactivo: nuevo `[filled]` + sizes con decimales raw Figma.
  - `sc-button` retroactivo: spec doc 01-button.md creado.
- ✅ `formField.paddingX/Y` del preset alineado a Figma exacto (10.5/7 raw). Cambio global
  que aprieta 1.5/1px todos los form fields PrimeNG. Verificado visualmente.

Last commit en main: `a03cd20` (tooltip docs).

---

## Fase 1 (activa) — Investigar Netlify ds-smartcontact stale build

**Síntoma**: el deploy live de ds-smartcontact sigue sirviendo `main-I4GZGIIL.js` que es la
build de la **sesión 29 por la mañana** (commit `70b6b53` float-label). Todos los commits
posteriores (035ef08 audit, 04dd6b1 redesign, 2782ecb input-number, 40607be select, 2318c2f
datepicker, 629eb6b input audit + preset change, 1cfed2d button doc, bd3995c select audit,
8b9e080 tabs, a03cd20 tooltip) NO se han deployado.

**Impacto**: el URL público del audit
`https://ds-smartcontact.netlify.app/audits/2026-05-15-palette-slate/diff.html` redirige al
SPA en lugar de servir el HTML. También los componentes cocinados (input-number, select,
datepicker, tabs, tooltip) no son visibles en la versión live de ds-docs.

**Lo que necesitamos del usuario** (vía Netlify dashboard):

1. Site `ds-smartcontact` → Deploys → revisar últimos builds:
   - ¿Hay builds fallando con error?
   - ¿Auto-deploys están ON?
   - ¿Las builds están en "queued" pero no arrancan?
2. Site settings → Build & deploy → Continuous Deployment → comprobar branch (`main`).
3. Si todo OK pero no dispara: trigger manual ("Deploy site" button) para forzar.

**Si tras forzar deploy sigue fallando**: probablemente Netlify ha desactivado el site por
inactividad / quota / config corrupted. Workaround: nuevo site Netlify desde el mismo repo
con build command `npm install --no-audit --no-fund && npm run build:ds-docs` + publish
`dist/ds-docs/browser` + env var `ANGULAR_PROJECT=ds-docs`.

**Validación post-fix**:

```bash
curl -s https://ds-smartcontact.netlify.app/ | grep -oE 'main-[A-Z0-9]+\.js' | head -1
# debe ser un hash NUEVO, distinto de main-I4GZGIIL.js

curl -sI https://ds-smartcontact.netlify.app/audits/2026-05-15-palette-slate/diff.html \
  | grep -i content-type
# debe devolver text/html, NO redirigir al SPA
```

---

## Fase 2 — Polish visual ds-docs con `/ui-ux-pro-max` + `/impeccable`

**Pedido por el usuario** Session 30 al final ("no blocker, solo mejora"): pasar las
páginas de ds-docs por el design intelligence skill para que tengan rollo de "high-end
design system docs" en lugar de "wireframe funcional".

**Cuándo activar**: ahora mismo tenemos 7 componentes con spec doc + gallery
(`button`, `input`, `input-number`, `select`, `datepicker`, `tabs`, `tooltip`) + 24 migrados
sin spec. Esperar a tener 8-10 specs (próximo: añadir docs a Modal / Toast / Empty State /
Section Card antes del polish).

**Plan concreto cuando se active**:

1. **Audit visual de ds-docs en su estado actual** con `/critique` o `/audit` — saber qué
   falla (jerarquía tipográfica, espaciado, colores, density).
2. **Aplicar `/impeccable craft`** sobre la home (catálogo + tracker) — el surface más
   visible.
3. **Aplicar `/ui-ux-pro-max design`** sobre las gallery pages individuales — patrón
   consistente entre las 7+.
4. **Snapshot before/after** vía Playwright para que Rafa apruebe cambios.
5. **Commit como `chore(ds-docs): polish via ui-ux-pro-max + impeccable`** (no toca
   componentes SCDS, solo el surface ds-docs).

**Tiempo estimado**: 2-3h.

---

## Fase 3 — Próximos componentes del catálogo

Tras Fases 1 y 2, retomar el ciclo component-by-component según
`packages/design-system/docs/MIGRATION-INVENTORY.md`. Próximos targets en orden:

1. **MultiSelect** (`<sc-multi-select>`) — wrapper sobre `<p-multiselect>`. Patrón similar a
   `sc-select` pero array values. Pedirle URL Figma al usuario primero.
2. **Toast** (ya existe como `<sc-toast>`, sin spec doc) — audit Figma + spec 08-toast.md.
3. **Modal** (ya existe como `<sc-modal>`, sin spec doc) — audit Figma + spec 09-modal.md.
4. **Empty State** (ya existe `<sc-empty-state>`, sin spec doc) — audit Figma + spec.
5. **Section Card** (`<sc-section-card>`) — audit + spec.
6. **Autocomplete** (`<sc-autocomplete>`) — wrapper sobre `<p-autocomplete>`. Nuevo cook.
7. **Time Picker / Date Range** — extensión de datepicker, tokens ya documentados en su spec.

Por cada uno: leer Figma exhaustivamente (memoria `feedback_figma_specs_thorough.md`), cocinar
o auditar, spec doc, gallery, inventory + tracker.

---

## Fase 4 (futura, NO activar todavía) — Memory 3.0 consume tokens de SCDS ("Camino B")

**Contexto**: Memory 3.0 vive en `~/dev/memory/`, su propio repo, stack React 18 + Vite +
Radix UI + Tailwind. Smart Contact Platform es Angular 21 + PrimeNG. **No se pueden compartir
componentes entre frameworks**, pero sí se pueden compartir tokens CSS y specs.

El objetivo de esta fase es: Memory deja de tener su propia copia de valores de marca
(colores, spacing, radius, type) y consume directamente los `--sc-*` que viven en SCDS. Cuando
aquí cambiamos un token, Memory ve el cambio al hacer pull.

**Cuándo activar (gates explícitos)**:

- [x] Paleta gray reconciliada.
- [ ] Layer 2 (semantic) estable, sin renames pendientes.
- [ ] Al menos 5–7 componentes "cocinados" con spec doc en
  `packages/design-system/docs/components/` (✅ ya hay 7 + 2 retro-audit).
- [ ] `customs-catalog.md` creado con las primeras divergencias documentadas (TBD — las 3
  brand divergences de button ya están listadas en su spec doc; convertir a catálogo).

Hasta que esos 4 puntos estén marcados, NO arrancar esta fase — el token layer todavía se
mueve.

**Plan concreto cuando se active** (resumen):

1. Decidir mecanismo de distribución: **A. Git submodule**, **B. npm package publicado** o
   **C. Script de copia** (recomendado para empezar — 1 tarde).
2. Setup en Memory: importar las 7 capas CSS desde una carpeta nueva.
3. Tailwind mapping (opcional, second pass): que las clases Tailwind de Memory consuman
   `--sc-*`.
4. Actualizar README + docs SCDS (consumers.md).

(Plan completo en SESSION-LOG sesión 29, decisión "Camino B".)

**Lo que NO incluye esta fase**: NO mover Memory al monorepo. NO reimplementar componentes
Angular en React. NO publicar componentes Angular como npm.

---

## Reglas operativas (no cambian)

1. **Verificación obligatoria post-claim**: cuando un agente reporte "hecho", pedir 1
   verificación reproducible (curl, screenshot, hash).

2. **Figma 1:1 cuando hay MCP**: ver `feedback_figma_specs_thorough.md` en memoria. Extraer
   variables de TODAS las variantes (estados, sizes, booleanos) antes de codear. Documentar
   divergencias en el spec doc del componente.

3. **Decisiones documentadas**: brand divergence anotada en `customs-catalog.md` (TBD,
   creará cuando los 7 componentes cocinados rebasen las 5 divergencias).

4. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

5. **Componentes y refactors menores**: directo a `main`. Cambios estructurales gordos:
   rama + PR.

6. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con tradeoffs.

7. **Nunca clavar un repo en `~/Desktop/`, `~/Documents/` o cualquier ruta con icono ☁️**.
   Usar `~/dev/`. Ver `.notes/journal/2026-05-15-icloud-migration.md`.

