# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (S72b, 2026-06-09) — tipografía decidida + Paso 1 ejecutado

> **Todo lo decidido vive en docs canónicos** (no se pierde). Tipografía = **DD-13** (SCDS DECISIONS).
> Convergencia/port = [`convergence-manifesto.md`](./convergence-manifesto.md) + [`convergence-checklist-devs.md`](./convergence-checklist-devs.md).

**Cerrado y vigente:**
- **Naming componentes** → DD-12 (pegado = Kit Pro/Figma; custom kebab).
- **Tipografía** → **DD-13**: escala **redonda** (12/14/16/18/20/24/32 + display 48/64), desacoplada de `--sc-scale`, **rem root-16**, line-heights por regla, **2 pesos** (Reg/Semibold). Validado contra PrimeNG (S72b): PrimeNG **no modela tipografía** (dial único = root font-size del `<html>`); el dev instala la letra en **rem** (Theme Designer convierte px→rem ÷16; redondo → rem limpio). **Naming por capa**: capa **App** con barra (`app/font/size`→`--app-font-size`); **primitivo PLANO** (`typography/font-size/12..48`, nombre=valor). Rampa de contenido (h1/body) = **modelo simple** (text styles atados a primitivos + aliases en código; sin capa de variables — over-engineering).
- **Paso 1 EJECUTADO (S72b)** en el duplicado `tUzS4MvWld90bA2qpZz5b6`: primitivos `typography/font-size/12..48` + `line-height/18..58` (Custom, planos) · capa App atada a ellos · **10 text styles de contenido** (display-1, h1–h4, body-1/2/3, caption, caption-bold) **atados a los primitivos** (font-size + line-height; weight queda en el estilo).
- **Reglas de operación nuevas:** evitar over-engineering ([[avoid-overengineering]]) · verificar antes de afirmar ([[empirical-test-before-philosophizing]]) · px-vs-rem = **rem** (S72).

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

### 🚦 BLOQUE 1 — Validar el PIPELINE con un piloto (GATE) — ✅ CRUZADO (S73)
- **Resultado del piloto** (tema generado + JSON del Kit oficial, verificados por Claude):
  - ✅ **Preset estándar PrimeNG**: fiable — rem correcto, referencias Aura intactas (divider cruzó limpio), colores de marca bien horneados.
  - ❌ **Nuestra capa NO baja por el pipeline**: la colección **App no cruza** al tema; lo Custom sale en **px** (sin ÷16), con **sintaxis inválida** (claves con guiones/espacios sin comillas → `extend.ts` no compila) y con los anclajes a Custom **aplanados** a literal. Bug `font.weight=600px` **confirmado** (`extend.ts:28`, solo capa Custom).
  - **Veredicto = método del Bloque 2:** nuestra capa va **a mano** (Claude), usando el **JSON crudo de "Exportar"** como contrato (ahí todo cruza íntegro, incl. `app/font/size → {typography.font-size.14}`).
- **Viaje GitHub directo del plugin:** ✅ probado (S73) — push tokens + theme a `theme-designer-pilot/theme-pilot/` cruza limpio; confirma que el cuello no es el transporte sino el contenido de nuestra capa.
- **Higiene del puente (S73, experimento operado por Claude vía MCP sobre el duplicado):** convertido el diagnóstico en **reglas canónicas** (DD-13 Anexo "higiene del PIPELINE"): (1) naming sin guion/espacio interno → renombrados los primitivos `typography/font/size` + `line/height` y el componente `bulkTranscriptionModal/` en el duplicado; (2) tipo string para no-medidas (weight/variante/familia) — el plugin no las pxea; (3) no duplicar en Custom lo estándar (modal: 4 colores reales vs 16 huérfanos; borrado el `title/font/weight=600` huérfano = adiós `600px`). **Pendiente Rafa:** re-push tokens+theme → Claude verifica `extend.ts` compila + sin `600px`. Luego: replicar naming/tipos en el **Kit oficial** + limpiar los 15 huérfanos restantes (oficialización).

### ✍️ BLOQUE 2 — Tipografía en real (de DD-13 a producción) — ✅ HECHO (S73)
- **2.1 — text styles → primitivos (duplicado):** ✅ HECHO (S72b).
- **2.2 — replicar en el Kit OFICIAL (Rafa):** ✅ HECHO — primitivos `typography/*` + capa App verificados en el export del Kit oficial.
- **2.3 — micro-decisión:** ✅ **opción A** (por-valor: `--sc-font-size-16`; Rafa, S73).
- **2.4 — reflejar en código:** ✅ HECHO (S73, a mano según veredicto del gate): escala redonda **por-valor en rem** (`--sc-font-size-12..48` + `64` registro; `--sc-line-height-18..58/78`), **desacoplada de `--sc-scale`**, semánticos recableados (h1 32/40, body-1 16/24, display-1 48/58…), **96 ficheros** de consumers renombrados, `tokens:type-parity` ajustado, backlog **#88 y #75 cerrados**. Verificado: build ambas apps + e2e **28 pass** + diff visual por pantalla (solo reflow esperado del redondeo; capturas >2% revisadas a ojo: layout intacto).

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
