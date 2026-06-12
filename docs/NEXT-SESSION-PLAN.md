# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (S75, 2026-06-12) — código 2.4 EJECUTADO y validado (e2e verde); 2.2 (Kit oficial) pendiente de reconectar el bridge

> **Todo lo decidido vive en docs canónicos** (no se pierde). Tipografía = **DD-13 + addendum S75** (SCDS DECISIONS). Detalle de la sesión: [`SESSION-LOG.md`](./SESSION-LOG.md) S75.
> Convergencia/port = [`convergence-manifesto.md`](./convergence-manifesto.md) + [`convergence-checklist-devs.md`](./convergence-checklist-devs.md).

**Cerrado y vigente:**
- **Naming componentes** → DD-12 (pegado = Kit Pro/Figma; custom kebab).
- **Tipografía** → **DD-13 + S75**: escala **redonda** (12·14·16·18·20·24·32·48) + 7 line-heights (18·20·24·28·36·40·58) + 10 text styles, **desacoplada de `--sc-scale`**, **rem root-16**, 2 pesos (Reg/Semibold). **Naming = STEP** en Figma + código + devs (idioma único; el puente es naming-neutral, código+devs ya son step, Kit oficial greenfield → coste cero, 0 renames). **icon-size** al stream de tipo (redondo). **Dos streams** (preset PrimeNG vs nuestra capa de letra). Roles semánticos NO se cortan esta fase ([[avoid-overengineering]]; backlog #89).
- **Código 2.4 EJECUTADO (S75)** en branch `typography/round-rem-s75`: `--sc-font-size-*`/`--sc-line-height-*`/`--sc-icon-size-*` → `calc(N/16*1rem)`. **e2e 28 verde**, type-parity 99%/ola-1, baselines (3 dark) + `sc-tokens.json` regenerados, scripts `type-parity`/`export` ajustados, docs canónicos actualizados. Backlog #88 (px→rem) → ✅ resuelto.
- **Corrección de S74:** los devs **SÍ** usan `--sc-font-size-{step}` (idéntico) → naming a **STEP** en todos lados. Lo de "Figma por-valor / devs no usan / renombrar Figma contradice DD-13" era **erróneo** (el Kit oficial es greenfield, se crea step desde cero).

**Hecho también (S75):**
- **2.2 — primitivos ✅** (Desktop Bridge): 15 `typography/font/size|line/height/{step}` step-named en la colección **Custom** del Kit oficial, redondos, **1:1 con el código** → validación de pipeline cumplida (Figma == código, type-parity verde).
- **PR [#50](https://github.com/arebury/smart-contact-platform/pull/50)** abierto (código + docs + baselines).

**Pendiente inmediato:**
- **Text styles del Kit oficial** → backlog **#90**: pasada de diseño enfocada (la base de Kit Pro difiere del duplicado: subtitles, pesos Bold/Medium, body3) → editar a escala redonda + 2 pesos + bindear a los primitivos, editar-no-borrar.
- **Al cerrar 2.2 (tras los text styles):** re-exportar `tokensprime.json` desde el Kit + **quitar el allow-list `KNOWN_TYPO_DRIFT`** en `token-parity.mjs` (drift consciente preset↔Kit ya no aplicará).

---

## 🗺️ Plan de ataque — de aquí a la GRAN SESIÓN (montar el proyecto espejo)

> Objetivo final ("gran sesión"): **montar el proyecto espejo del repo de los devs** (estructura `design-tokens / components / icons / demo`) **con nuestro clon dentro para probar todo**. No se arranca hasta que la BASE esté validada end-to-end (Bloques 1–2).

### Reglas transversales (aplican a TODOS los bloques)
- **No over-engineering:** no añadir capa/token/componente/doc sin trigger real ([[avoid-overengineering]]). La solución más simple que resuelve el problema de hoy.
- **Verificar, no afirmar:** test empírico en Figma / comparar archivos / leer el código antes de concluir. (En S72b fallé 2× por inferir; se cazó con `diff`.)
- **No-layout-shift:** todo cambio de tipografía en código → **diff visual Playwright por pantalla + `npm run e2e`** antes de dar por bueno.
- **Migration-safe:** tocar **solo nuestra capa** (`--sc-*` / `app/*` / `sc-preset.ts`); nunca el core de PrimeNG ni el Kit del equipo sin coordinación.
- **Push promptly** + e2e por inercia tras cambios cross-surface.

### No-goals (cosas que NO se hacen)
- ❌ **Claude NO opera el Theme Designer** — es app de Rafa, conectada al Kit OFICIAL + su GitHub. Claude prepara el componente y verifica el resultado; el clic es de Rafa.
- ❌ **NO crear capa de variables semánticas de contenido** (`heading/h1`…). Los text styles atados a primitivos YA son la capa semántica. (Verificado: ni SnowUI ni PrimeNG ni los devs la tienen.)
- ❌ **NO reflejar tipografía a código sin diff visual** (cambia alturas → riesgo layout).
- ❌ **NO renombrar consumers en masa** sin cerrar antes la micro-decisión por-valor vs steps (ver Bloque 2.3).
- ❌ **NO arrancar el proyecto espejo** sin el pipeline validado (Bloque 1 = gate).

---

### 🚦 BLOQUE 1 — Validar el PIPELINE con un piloto (GATE, va PRIMERO)
- **Objetivo:** confirmar que el viaje **Figma → Theme Designer → GitHub → código** funciona y rinde correcto, ANTES de meter nada gordo por él. Decide el *método* del Bloque 2 (¿la tipografía baja por pipeline o a mano?).
- **Quién:** Rafa opera el Theme Designer; Claude verifica el resultado en código.
- **Protocolo:** (1) elegir un componente **escala-neutral** (divider o tag — **NO** el botón). (2) Rafa lo pasa por el Theme Designer en el **Kit oficial** → genera PR a GitHub. (3) Verificar: ¿valores en **rem**? ¿naming esperado? ¿sobreviven los anclajes **Custom**? ¿la cadena `App → Custom` cruza? (4) Arreglar el **bug `font.weight=600px`** del Theme Designer.
- **Considerar:** el Theme Designer apunta al **Kit OFICIAL**, no al duplicado. La colección "Component" salía vacía (esperable). "Generar tema" (preset instalable, rem) ≠ "Exportar" (JSON crudo px).
- **Estado:** ✅ **EJECUTADO (S73)** — el pipeline cruza (export del **duplicado** → rama `theme-designer-pilot`: `theme-pilot/variables.json` + `theme-pilot/theme/`). **Hallazgo:** la tipografía es **document-level por diseño** (PrimeNG no la mete en el preset) → **no baja por el pipeline**; baja por nuestra capa `--sc-*` en rem (como el `rem-scale.ts` de los devs). El plugin solo da **rem** a tokens estándar; **Custom sale en px**. Detalle completo: **DD-13 addendum S73**.

### ✍️ BLOQUE 2 — Tipografía en real (de DD-13 a producción)
- **2.1 — text styles → primitivos (duplicado):** ✅ **HECHO (S72b).**
- **2.2 — replicar en el Kit OFICIAL (Rafa):** crear los primitivos `typography/font-size/*` + `line-height/*` (Custom) + capa App + atar los text styles, igual que en el duplicado. Es lo que lee el Theme Designer.
- **2.3 — micro-decisión (afinada S74, a cerrar en local):** naming del **primitivo interno** `--sc-font-size-*`: **mantener step** (`-300`, redefine su valor, **0 rename**) **o renombrar a valor** (`-16`, espeja el primitivo Figma, **renombra ~695 consumers + bridge + `type-parity`**). **Aclarado S74:** DD-13 se cumple con ambas; valor **no** da beneficio de pipeline (tipografía a mano), solo claridad; los **devs no usan** `--sc-font-size-*` (usan `app.typography sm/md/lg` — [verificar su file en local]). Default razonable = **mínimo: mantener step + redondear** salvo que la claridad del espejo Figma valga el churn. Detalle: SESSION-LOG **S74**.
- **2.4 — reflejar en código (Claude):** método **decidido por el piloto (S73) = a mano / capa de documento** — NO por el pipeline (la tipografía no baja por ahí; ver DD-13 addendum S73). Cambiar `--sc-font-size-*` a **redondo + rem** (hoy cuelgan de `--sc-scale`, decimal: h1=31.5, body-1=15.75 → deben ser 32/16) + recablear los semánticos + **ajustar `tokens:type-parity`** (hoy asume font-size colgando de scale) + **diff visual + e2e**. Deuda backlog **#88** (px→rem).
- **Considerar:** el cambio decimal→redondo **cambia el render** (±0,5–1px en alturas) → diff obligatorio. La unidad px→rem a root 16 **no** cambia el render (mismo pixel); el beneficio es escalado/a11y.
- **Estado:** 2.1 hecho · **Bloque 1 (gate) ✅ S73** · 2.2 pendiente (Rafa) · **2.3 afinada/abierta (S74 — a cerrar en local)** · 2.4 método = **capa de documento** (rem nuestro, no pipeline).

### 🏗️ BLOQUE 3 — LA GRAN SESIÓN: montar el proyecto espejo
- **Objetivo:** repo nuevo con la estructura de los devs (`design-tokens / components / icons / demo`) + **todo lo nuestro adaptado** dentro, para probar el conjunto. "Nosotros definimos, ellos construyen" ([[project_devs_smartcontact_ui_repo]]).
- **Protocolo:** (1) esqueleto del repo = estructura devs. (2) portar tokens (`--sc-*` + aliases) y componentes nuestros. (3) demo para validar. Plan por fases en `convergence-manifesto.md`.
- **Depende de:** Bloque 1 (pipeline fiable) + Bloque 2 (tipografía cerrada) + **acuerdos con los devs** (reunión: naming, capa de aliases, pipeline Theme Designer + `tokens.json` complementarios, quién construye qué — `convergence-checklist-devs.md`).
- **Estado:** ⏳ bloqueado por 1 y 2.

---

### 📌 Contexto técnico a recordar (datos concretos verificados S72b)
- **Duplicado `tUzS4…`:** primitivos typography planos en **Custom** · capa **App** (`app/font/size`→`--app-font-size`) atada a Custom · 10 text styles de contenido atados (font-size+line-height).
- **Código hoy:** `--sc-font-size-100..900` cuelgan de `--sc-scale-*` (decimal). Contenido en decimal (`h1`=font-size-650=**31.5**; Figma redondo=32). NO coincide aún con DD-13.
- **`tokens:type-parity`:** resuelve `--sc-font-size-*` asumiendo `var(--sc-scale-{m})` → al desacoplar a rem/redondo hay que **ajustar el comprobador**.
- **Theme Designer:** Kit OFICIAL (no duplicado) · bug `font.weight=600px` · Custom OK, Component vacío.
- **Otros pendientes menores (no bloquean):** nits config (card C gris · "Notifications"→"Notificaciones" · icono Agentes · breadcrumb).

**⚠️ Bias a vigilar (Rafa):** no atacar bloques en paralelo como iguales — hay **orden por dependencia** (1 → 2 → 3). El cuello de botella es **PROBAR el pipeline** (Bloque 1), no montar andamiaje antes. Profundidad > amplitud.

---

> **Cierres y planes de sesiones anteriores (S29–S69):** viven en [`SESSION-LOG.md`](./SESSION-LOG.md) (newest-first). Este doc mantiene únicamente el estado vigente + el orden inmediato; al cerrar cada sesión su estado pasa al log y aquí queda solo la cabecera nueva. Las "reglas operativas críticas" que vivían al final de este doc tienen su hogar canónico en [`CLAUDE.md`](../CLAUDE.md) (root + sub-CLAUDE) y en las DECISIONS de cada producto.
