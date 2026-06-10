# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (S74, 2026-06-10) — micro-decisión 2.3 afinada (ABIERTA, a cerrar en local); sesión Remote sin código

> **Todo lo decidido vive en docs canónicos** (no se pierde). Tipografía = **DD-13** (SCDS DECISIONS).
> Convergencia/port = [`convergence-manifesto.md`](./convergence-manifesto.md) + [`convergence-checklist-devs.md`](./convergence-checklist-devs.md).

**Cerrado y vigente:**
- **Naming componentes** → DD-12 (pegado = Kit Pro/Figma; custom kebab).
- **Tipografía** → **DD-13**: escala **redonda** (12/14/16/18/20/24/32 + display 48/64), desacoplada de `--sc-scale`, **rem root-16**, line-heights por regla, **2 pesos** (Reg/Semibold). Validado contra PrimeNG (S72b): PrimeNG **no modela tipografía** (dial único = root font-size del `<html>`); el dev instala la letra en **rem** (Theme Designer convierte px→rem ÷16; redondo → rem limpio). **Naming por capa**: capa **App** con barra (`app/font/size`→`--app-font-size`); **primitivo PLANO** (`typography/font-size/12..48`, nombre=valor). Rampa de contenido (h1/body) = **modelo simple** (text styles atados a primitivos + aliases en código; sin capa de variables — over-engineering).
- **Paso 1 EJECUTADO (S72b)** en el duplicado `tUzS4MvWld90bA2qpZz5b6`: primitivos `typography/font-size/12..48` + `line-height/18..58` (Custom, planos) · capa App atada a ellos · **10 text styles de contenido** (display-1, h1–h4, body-1/2/3, caption, caption-bold) **atados a los primitivos** (font-size + line-height; weight queda en el estilo).
- **Reglas de operación nuevas:** evitar over-engineering ([[avoid-overengineering]]) · verificar antes de afirmar ([[empirical-test-before-philosophizing]]) · px-vs-rem = **rem** (S72).

**S74 (2026-06-10) — micro-decisión 2.3 afinada (ABIERTA, a cerrar en local). Detalle completo: [`SESSION-LOG.md`](./SESSION-LOG.md) S74:**
- **2.3 = naming del primitivo interno de código** `--sc-font-size-*`: mantener **step** (`-300`, **0 rename**) **o** renombrar a **valor** (`-16`, espeja el primitivo Figma, **~695 consumers** + bridge + `type-parity`). **DD-13 se cumple con ambas**; valor solo da **claridad**, **no** pipeline (la tipografía se refleja a mano). Los **devs NO usan** `--sc-font-size-*` (usan `app.typography sm/md/lg` — [verificar su file en local]).
- **Correcciones de framing S74:** "código intocable/public-API" = exagerado (guardarraíl revisable, pre-file-devs) · "devs usan step" = falso · "renombrar Figma a step" = **contradice DD-13** (Figma ya es por-valor).
- **Abiertos a** renombrar step→valor **si** la claridad vale el churn (Rafa, en local). **NO** a ciegas sin leer el file de los devs · **NO** Figma→step · **NO** capa de variables semánticas. El **render** (redondo+rem, 2.4) es **independiente** del naming y va igual.
- **Entorno:** sesión **Remote** (sin `~/.claude` ni file devs local) → **próxima en LOCAL**; no se migra sesión viva, se abre nueva sobre esta rama.

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
