# NEXT SESSION PLAN — Smart Contact Platform

> **Para Claude en la próxima sesión**: lee este archivo + el último entry de
> [`SESSION-LOG.md`](./SESSION-LOG.md) y arranca por Fase 1 sin re-explicación.
>
> **Para Rafa**: cuando abras Claude di literalmente: *"lee
> `docs/NEXT-SESSION-PLAN.md` y arranca"*. Toma desde aquí.

---

## Estado al cerrar (Session 28, 2026-05-14, ~22:30)

- ✅ Foundation monorepo cerrada (Session 27, PR #47).
- ✅ Componente Input cocinado + page ds-docs + spec doc + migración POC en AED user-form.
- ✅ Tracker localStorage en home de ds-docs (checklist personal de los 30 componentes).
- ✅ MIGRATION-INVENTORY.md con columnas Type + Figma parity.
- ✅ Dark mode tweaks (input bg embebido + focus ring electric-blue).
- 🔴 **BLOCKER**: ds-smartcontact deploy falla — el plugin `@netlify/angular-runtime` no respeta el build:ds-docs (ver Fase 1).
- ⏳ Repo aún en `~/Desktop/AED/` (iCloud sync). Move pendiente (Fase 2).
- ⏳ Nivel 1 reconciliación paleta `--sc-color-gray-*` → Aura slate (Fase 3).

Last commit en main: `0f9e174` (fix netlify.toml).

---

## Fase 1 — Desbloquear deploy ds-smartcontact (PRIORIDAD MÁXIMA)

**Síntoma**: deploy de ds-smartcontact pasa por "Building" sin errores, pero al final el plugin falla con:

```
Plugin "@netlify/angular-runtime" failed
Error: Publish directory is configured incorrectly.
       Please set it to "dist/aed/browser".
```

**Causa raíz**: el plugin lee el `angular.json` raíz, ve 2 proyectos (aed + ds-docs), elige `aed` como default, y compara la publish dir UI (`dist/ds-docs/browser`) contra `dist/aed/browser` (lo que esperaría para aed). No le importa que el build command real sea `npm run build:ds-docs`.

**Caminos a probar en orden** (de menos a más invasivo):

### 1.1 Env var per-site en Netlify UI

Investigar si `@netlify/angular-runtime` respeta una env var que indique el proyecto target. Posibles nombres: `ANGULAR_PROJECT`, `NETLIFY_ANGULAR_PROJECT`, `ANGULAR_PROJECT_NAME`, `NX_PROJECT`. Revisar la doc/source del plugin (https://github.com/netlify/angular-runtime).

Si existe: en Netlify UI de ds-smartcontact → Site configuration → Environment variables → añadir `<NAME>=ds-docs`. Trigger deploy → verificar.

### 1.2 Plugin config en netlify.toml (sin per-app)

Probar añadir al `netlify.toml` raíz:

```toml
[[plugins]]
  package = "@netlify/angular-runtime"
  [plugins.inputs]
    targetProject = "aed"  # default para todos los sites
```

Y para ds-smartcontact en UI override este input. NO sé si es posible per-site override; comprobar.

### 1.3 Per-site netlify.toml resucitado (con cuidado)

Si 1.1 y 1.2 no funcionan, traer de vuelta `apps/ds-docs/netlify.toml` con:

```toml
[build]
  publish = "../../dist/ds-docs/browser"

[[plugins]]
  package = "@netlify/angular-runtime"
  [plugins.inputs]
    targetProject = "ds-docs"
```

Y configurar Netlify UI de ds-smartcontact con **Base directory = `apps/ds-docs`**, dejando build command + publish dir VACÍOS para que lea del toml. La lección anterior (deadlock) fue por TENER UI override + toml a la vez. Aquí UI vacía + toml lleno funciona.

### 1.4 Workaround: forzar output path en build command

Cambiar Build command de ds-smartcontact UI a:

```
npm install --no-audit --no-fund && npm run build:ds-docs -- --output-path=dist/aed/browser
```

Y Publish directory = `dist/aed/browser`. El plugin queda contento. Hacky pero funciona. Anotar como deuda.

### 1.5 Disable plugin completamente

Si nada funciona, env var en Netlify UI de ds-smartcontact:

```
NETLIFY_NEXT_PLUGIN_SKIP = true   # si aplica al Angular
NETLIFY_BUILD_PLUGIN_DISABLED = @netlify/angular-runtime
```

(Nombres exactos por verificar.)

**Validación post-fix** (mismo patrón que session 28):

```bash
curl -s https://ds-smartcontact.netlify.app/ | grep -oE 'main-[A-Z0-9]+\.js' | head -1
# debe ser DISTINTO de main-TMYW66FI.js

curl -s https://ds-smartcontact.netlify.app/ | grep -oE 'Mi seguimiento|tracking__title'
# debe devolver al menos 1 línea
```

Si los dos pasan, ds-docs está sirviendo lo correcto.

---

## Fase 2 — Move del repo fuera de iCloud Desktop

**Por qué**: `~/Desktop/AED/` está sincronizado con iCloud Drive (configuración default de macOS). Esto causó hoy:
- `.DS_Store` rompiendo cadenas `&&` en scripts shell
- Archivos fantasma reapareciendo en raíz tras `git mv`
- Permisos `600` raros en archivos
- Posiblemente lentitud de `git mv` y `rsync`

**Destino acordado**: `~/dev/smart-contact-platform/` (carpeta `~/dev/` ya creada en session 28).

**Pasos**:

1. Verificar git limpio + todo pusheado: `git status` + `git log --oneline -3`.
2. `rsync -a --exclude='node_modules' --exclude='.angular' --exclude='dist' --exclude='out-tsc' --exclude='.DS_Store' --exclude='e2e/screenshots' /Users/rafareses/Desktop/AED/ /Users/rafareses/dev/smart-contact-platform/`
3. cd `~/dev/smart-contact-platform/` + `git status` (debe estar limpio igual).
4. `npm install --no-audit --no-fund` (~50s).
5. `npx ng build aed --configuration=development` para verificar build OK.
6. `npx ng build ds-docs --configuration=development` para verificar segundo build OK.
7. **SOLO si los 2 builds pasan**: `rm -rf ~/Desktop/AED`.
8. Reabrir Cursor en `~/dev/smart-contact-platform/`.

**Riesgo conocido**: rsync de `.git/` (27 MB) iba lento en disco actual (~3 min para 8 MB). Si tarda mucho, dejar correr en background con notificación.

---

## Fase 3 — Nivel 1: reconciliación paleta `--sc-color-gray-*` → Aura slate

**Por qué**: el audit Phase 2 dejó marcado que la paleta gray de SC tiene 12 pasos sistemáticamente más claros que Aura slate (la que usa Figma como referencia). Esto causa que los inputs (y todo lo demás que usa borders/text/backgrounds gray) divergiera ~10% del diseño Figma — no es bug local de sc-input, es paleta.

**Antes**: snapshot Playwright de pantallas clave AED (top-bar, sidebar, agent-form, label-page) en light + dark.

**Cambio**: en `packages/design-system/tokens/layers/01-primitive.css`, sustituir los 12 valores de `--sc-color-gray-*` por los de Aura slate (`#f8fafc`, `#f1f5f9`, `#e2e8f0`, `#cbd5e1`, `#94a3b8`, `#64748b`, `#475569`, `#334155`, `#1e293b`, `#0f172a`, `#020617`).

**Después**: re-snapshot. Diff. Aprobar visualmente cada cambio. Si algo se rompe (contraste, AA), revertir + documentar como decisión consciente en `customs-catalog.md`.

**Tiempo estimado**: 1-2h con Playwright + decisiones por pantalla.

---

## Fase 4 — Próximos componentes del catálogo

Cuando Fase 1 esté desbloqueada, retomar el ciclo component-by-component según
`packages/design-system/docs/MIGRATION-INVENTORY.md`. Próximos targets en orden:

1. **Input number** (`<sc-input-number>`) — AED tiene 7 candidatos. Patrón similar a sc-input.
2. **Dropdown / select** (`<sc-select>`) — AED tiene `<select>` nativos pendientes de migrar.
3. **Datepicker** (`<sc-datepicker>` o `<p-datepicker>` Custom-preset).
4. **Tabs** (`<p-tabs>` Custom-preset).
5. **Tooltip** (`[pTooltip]` Full PrimeNG passthrough).

Por cada uno: Figma URL → componente + page ds-docs + spec doc + (parcial o no) migración AED.

---

## Reglas operativas (no cambian)

1. **Verificación obligatoria post-claim**: cuando un agente (Claude / Perplexity / etc.) reporte "hecho", pedir 1 verificación reproducible (curl, screenshot, hash). Sin verificación, no se considera hecho. (Lección hard-learned en session 28.)

2. **Decisiones documentadas**: cualquier brand divergence anotada en `customs-catalog.md` (TBD, se crea cuando lleguemos a 5+ divergencias). Cualquier choice arquitectónica en `DECISIONS.md` correspondiente (apps/aed/ o packages/design-system/).

3. **CLAUDE.md de cada proyecto se mantiene <10 KB**. Detalle al `docs/`.

4. **Componentes y refactors menores**: directo a `main`. Cambios estructurales gordos: rama + PR.

5. **Cuando dudes, pregunta**. Rafa no es dev — opciones claras con tradeoffs.
