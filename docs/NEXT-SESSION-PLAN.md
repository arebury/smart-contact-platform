# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión**: lee este archivo + el último entry de
> [`SESSION-LOG.md`](./SESSION-LOG.md) y arranca por la Fase activa sin
> re-explicación.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 29, 2026-05-15)

- ✅ Foundation monorepo cerrada (Session 27, PR #47).
- ✅ Componente Input cocinado + page ds-docs + spec doc + migración POC en AED user-form (Session 28).
- ✅ Float-label demo añadido a la página y al spec doc del Input.
- ✅ Tracker localStorage reescrito en idioma del usuario (`whatItDoes` + `whereToSee`).
- ✅ **Repo migrado fuera de iCloud** a `~/dev/smart-contact-platform/`. Carpeta vieja borrada. Memory 3.0 también migrada.
- ✅ **Netlify ds-smartcontact desbloqueado** (`ANGULAR_PROJECT=aed` default en toml + override `ds-docs` en UI). Verificado vía curl: title = "Smart Contact Design System", bundle `main-I4GZGIIL.js` distinto del de aedmigration, código de hoy presente en el bundle.
- ⏳ Nivel 1 reconciliación paleta `--sc-color-gray-*` → Aura slate (Fase 1, antes Fase 2).

Last commit en main: `07bf868` (docs close session 29).

---

## Fase 1 — Nivel 1: reconciliación paleta `--sc-color-gray-*` → Aura slate

**Por qué**: el audit Phase 2 dejó marcado que la paleta gray de SC tiene 12
pasos sistemáticamente más claros que Aura slate (la referencia que usa
Figma). Esto causa que los inputs (y todo lo demás que usa borders/text/
backgrounds gray) divergiera ~10% del diseño Figma — no es bug local de
sc-input, es paleta.

**Antes**: snapshot Playwright de pantallas clave AED (top-bar, sidebar,
agent-form, label-page) en light + dark.

**Cambio**: en `packages/design-system/tokens/layers/01-primitive.css`,
sustituir los 12 valores de `--sc-color-gray-*` por los de Aura slate
(`#f8fafc`, `#f1f5f9`, `#e2e8f0`, `#cbd5e1`, `#94a3b8`, `#64748b`,
`#475569`, `#334155`, `#1e293b`, `#0f172a`, `#020617`).

**Después**: re-snapshot. Diff. Aprobar visualmente cada cambio. Si algo se
rompe (contraste, AA), revertir + documentar como decisión consciente en
`customs-catalog.md`.

**Tiempo estimado**: 1-2h con Playwright + decisiones por pantalla.

---

## Fase 2 — Próximos componentes del catálogo

Tras Fase 1 (o en paralelo si la paleta requiere bloque visual largo),
retomar el ciclo component-by-component según
`packages/design-system/docs/MIGRATION-INVENTORY.md`. Próximos targets en
orden:

1. **Input number** (`<sc-input-number>`) — AED tiene 7 candidatos. Patrón similar a sc-input.
2. **Dropdown / select** (`<sc-select>`) — AED tiene `<select>` nativos pendientes de migrar.
3. **Datepicker** (`<sc-datepicker>` o `<p-datepicker>` Custom-preset).
4. **Tabs** (`<p-tabs>` Custom-preset).
5. **Tooltip** (`[pTooltip]` Full PrimeNG passthrough).

Por cada uno: Figma URL → componente + page ds-docs + spec doc + (parcial o
no) migración AED.

---

## Fase 3 (futura, NO activar todavía) — Memory 3.0 consume tokens de SCDS ("Camino B")

**Contexto**: Memory 3.0 vive en `~/dev/memory/`, su propio repo, stack
React 18 + Vite + Radix UI + Tailwind. Smart Contact Platform es Angular
21 + PrimeNG. **No se pueden compartir componentes entre frameworks**,
pero sí se pueden compartir tokens CSS y specs.

El objetivo de esta fase es: Memory deja de tener su propia copia de
valores de marca (colores, spacing, radius, type) y consume directamente
los `--sc-*` que viven en SCDS. Cuando aquí cambiamos un token, Memory
ve el cambio al hacer pull.

**Cuándo activar (gates explícitos)**:

- [ ] Paleta gray reconciliada (Fase 1 cerrada).
- [ ] Layer 2 (semantic) estable, sin renames pendientes.
- [ ] Al menos 5–7 componentes "cocinados" con spec doc en
  `packages/design-system/docs/components/`.
- [ ] `customs-catalog.md` creado con las primeras divergencias
  documentadas.

Hasta que esos 4 puntos estén marcados, NO arrancar esta fase — el
token layer todavía se mueve.

**Plan concreto cuando se active**:

1. **Decidir mecanismo de distribución** (escoger uno):
   - **A. Git submodule** del repo SC apuntando solo a
     `packages/design-system/tokens/`. Memory hace `git submodule update`
     para pullear cambios. Más control de versión, más plumbing.
   - **B. npm package publicado** (`@smartcontact/tokens`). Memory hace
     `npm install @smartcontact/tokens@latest`. Más cómodo, requiere
     publishing pipeline (probablemente GitHub Actions release on tag).
   - **C. Script de copia** que ejecutas a mano (o en pre-commit) y
     copia los `.css` de tokens SC → carpeta `src/styles/tokens/` de
     Memory. Simplísimo, menos bonito, no hay versionado.

   Recomendación preliminar: **C para empezar** (1 tarde de trabajo) y
   migrar a A/B si las copias manuales se vuelven dolor.

2. **Setup en Memory**:
   - Crear `src/styles/sc-tokens/` con las 7 capas copiadas (o
     submoduladas).
   - Importar `01-primitive.css` y `02-semantic.css` desde el entry CSS
     de Memory.
   - Borrar de Memory cualquier variable propia que duplique un `--sc-*`
     (probablemente vars de color en `src/styles/`).
   - Verificar que el build sigue verde y que las pantallas no rompen
     (Tailwind config sigue intacto; los `--sc-*` se usan en CSS plano,
     no en clases Tailwind — al menos al principio).

3. **Mapping Tailwind → SCDS tokens** (opcional, second pass):
   - Si quieres que las clases Tailwind (`bg-slate-100`, `text-gray-700`)
     de Memory también consuman `--sc-*`, extender el `tailwind.config.ts`
     de Memory con un theme override que apunte los colores a los
     `--sc-color-*` correspondientes.
   - Esto convierte Memory en "consumer puro" de SCDS sin tener que
     reescribir cada utility class.

4. **Actualizar Memory's `README.md`** explicando que los tokens vienen
   de SCDS y cómo pullear updates.

5. **Documentar en SCDS** que Memory es consumidor:
   - Entry en `packages/design-system/docs/consumers.md` (TBD) listando
     qué apps consumen los tokens y por qué vía.
   - Esto fuerza a que cualquier cambio breaking de token notifique a
     todos los consumidores.

**Lo que NO incluye esta fase**:

- NO mover Memory al monorepo. Sigue en su repo propio. Lo único que
  comparte con SCDS son los tokens.
- NO reimplementar componentes Angular en React. Memory mantiene sus
  Radix-based components; lo único que cambia es de dónde sacan los
  valores de color/spacing.
- NO publicar componentes Angular como package npm para que Memory los
  consuma. Imposible cross-framework.

**Tiempo estimado**: 2-4h (Camino C). 6-8h si va por submodule/npm con
release pipeline.

---

## Reglas operativas (no cambian)

1. **Verificación obligatoria post-claim**: cuando un agente (Claude /
   Perplexity / etc.) reporte "hecho", pedir 1 verificación reproducible
   (curl, screenshot, hash). Sin verificación, no se considera hecho.
   (Lección hard-learned en session 28.)

2. **Decisiones documentadas**: cualquier brand divergence anotada en
   `customs-catalog.md` (TBD, se crea cuando lleguemos a 5+ divergencias).
   Cualquier choice arquitectónica en `DECISIONS.md` correspondiente
   (apps/aed/ o packages/design-system/).

3. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

4. **Componentes y refactors menores**: directo a `main`. Cambios
   estructurales gordos: rama + PR.

5. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con
   tradeoffs.

6. **Nunca clavar un repo en `~/Desktop/`, `~/Documents/` o cualquier ruta
   con icono ☁️**. Usar `~/dev/`. Ver
   [`.notes/journal/2026-05-15-icloud-migration.md`](../.notes/journal/2026-05-15-icloud-migration.md)
   para el porqué.
