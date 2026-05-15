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
- 🟡 **Netlify ds-smartcontact**: fix diseñado (`ANGULAR_PROJECT=aed` default en toml + override en UI a `ds-docs`). Falta confirmar deploy verde.
- ⏳ Nivel 1 reconciliación paleta `--sc-color-gray-*` → Aura slate (Fase 2).

Last commit en main: `fe9317e` (journal de migración iCloud).

---

## Fase 1 — Cerrar verificación del deploy ds-smartcontact

**Estado**: el cambio de configuración está pusheado (`netlify.toml` con
`ANGULAR_PROJECT=aed` global) y el plan acordado es:

1. En Netlify UI → site `ds-smartcontact` → Site configuration →
   Environment variables → añadir `ANGULAR_PROJECT = ds-docs` (override
   del default global del toml).
2. Trigger deploy manual del site.
3. Validar:

```bash
curl -s https://ds-smartcontact.netlify.app/ | grep -oE 'main-[A-Z0-9]+\.js' | head -1
# debe ser un hash NUEVO, distinto del último conocido

curl -s https://ds-smartcontact.netlify.app/ | grep -oE 'Mi seguimiento|tracking__title'
# debe devolver al menos 1 línea (la home del ds-docs)
```

Si los dos pasan, Fase 1 queda cerrada. Si vuelve a fallar con el error
"Publish directory is configured incorrectly", revisar nombre exacto de la
env var en la doc del plugin (`@netlify/angular-runtime`) — puede que el
plugin espere `NETLIFY_ANGULAR_PROJECT` u otro alias.

Fallbacks (en orden, si la env var no surte efecto):

- **Per-site netlify.toml resucitado** con `[[plugins]]` block apuntando
  a `targetProject = "ds-docs"`. Truco: dejar Netlify UI VACÍA (sin build
  command ni publish dir) para que solo lea del toml. La lección anterior
  fue UI + toml duplicado → deadlock; aquí UI vacía + toml lleno funciona.
- **Workaround output-path**: `npm run build:ds-docs -- --output-path=dist/aed/browser`
  y publish dir = `dist/aed/browser`. Hacky pero el plugin queda contento.

---

## Fase 2 — Nivel 1: reconciliación paleta `--sc-color-gray-*` → Aura slate

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

## Fase 3 — Próximos componentes del catálogo

Cuando Fase 1 esté cerrada (y opcionalmente Fase 2), retomar el ciclo
component-by-component según
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
