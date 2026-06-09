# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (S70–S71, 2026-06-08) — convergencia con los devs + validación + tipografía

> Sesiones de **estrategia + arquitectura** (poco código, mucho criterio). **Todo lo decidido está commiteado** — el contexto NO se pierde, vive en los docs de abajo.

**Hecho y commiteado:**
- **Naming cerrado** → DD-12 (pegado = Kit Pro/Figma; custom kebab) — `packages/design-system/docs/DECISIONS.md`.
- **Manifiesto de convergencia** (base del port) → [`docs/convergence-manifesto.md`](./convergence-manifesto.md) §1–12: catálogo unión 44 piezas (Rosetta), 4 solapes resueltos, huecos, empaquetado objetivo, plan por fases, §9 contraste con su `AGENTS.md`, §10 reutilización, §11 comparativa (PPT), §12 hallazgos en curso. Verificado adversarialmente vs código.
- **Checklist reunión devs** → [`docs/convergence-checklist-devs.md`](./convergence-checklist-devs.md) (6 decisiones + 3 alineados).
- **Protocolo re-sync Figma+preset** → `migration-safety.md` (no re-duplicar · Migration Assistant · Code Connect a nuestro file · capas control vs contenido).
- **3 mapas dev "layout Make + info SCDS"** en Figma (General `215:2476`, Agentes `225:2476`, Grupos `227:2476`).

**Estado de hilos clave:**
- **Escala / px-vs-rem:** ✅ **RESUELTO (S72).** Leído `rem-scale.ts` de los devs → **root 16**, design-14 ×0,875; su 14-base ≡ nuestro px a **mismos píxeles** → choque del botón **disuelto**. Dirección: **rem** (a11y + converge). Detalle en [[reference_devs_rem_scale_architecture]].
- **Theme Designer (PrimeTek):** comprado + conectado al **Kit OFICIAL** (no al duplicado). Custom OK; "Component" vacío (esperable); **bug `font.weight=600px`**.
- **Tipografía:** ✅ **DECIDIDA — DD-13** (SCDS DECISIONS). Escala **redonda** (12/14/16/18/20/24/32), desacoplada de `--sc-scale`, **rem root-16**, line-heights por regla, 2 pesos. **Validado contra PrimeNG (S72b)**: PrimeNG NO modela tipografía (dial único = root font-size del `<html>`); el dev instala la letra en **rem** (Theme Designer convierte px→rem ÷16; redondo → rem limpio, probado con un tema generado); naming = **barra** `typography/font/size/14` (no guion). Rampa de contenido (h1/body) = divergencia consciente (hueco PrimeNG #192). Hoy el código está en **px** → deuda px→rem (backlog #88). POC en el duplicado (`tUzS4…`). **Falta VALIDAR en real** (ver orden ↓).

### 🎯 Próxima sesión — ORDEN
1. ~~Test del botón / px-vs-rem~~ ✅ **HECHO (S72)** — root 16, rem, choque disuelto (DD-13).
2. **Tipografía → VALIDAR EN REAL (DD-13 ya decidido).** Migration-safe confirmado (solo tocamos `--sc-*`/`app/*`/preset, nunca PrimeNG ni el Kit del equipo). Pasos: **(a)** naming variables typography: capa **App** expuesta con barra (`app/font/size`→`--app-font-size`), primitivo de escala **PLANO** (`typography/font-size/X` + `typography/line-height/X`) — hecho en el duplicado S72b; **(b)** crear variables de la rampa de **títulos**/contenido + atar text styles (hoy títulos = style sin variable → no cruzan al código); **(c)** repetir en el **Kit oficial** (el que lee el Theme Designer); **(d)** Theme Designer → PR a GitHub → verificar valores; **(e)** reflejar en código `--sc-font-size-*` en **rem** (no px — backlog #88) + redondo + ajustar `tokens:type-parity` + diff visual + e2e.
3. **Bridge Theme Designer:** pasar UN componente escala-neutral (divider/tag, NO botón) por el puente → export==aplicado. Arreglar bug 600px.
4. **Cerrar px vs rem** para el convergido (rem gana en a11y).
5. **Nits config** (card C con gris perceptible · "Notifications"→"Notificaciones" · icono Agentes · breadcrumb) + adoptar guía doc1 (tabla dividers, px lógicos).
6. **Ejecutar convergencia** (Fase 0 = unificar escala, con devs) — el grande, **después de 1–3**.

### 🧱 Gate de fiabilidad para arrancar el PORT (proyecto gordo)

Antes del port grande, la BASE debe estar validada **end-to-end**. Lo que falta:

1. **Tipografía cerrada end-to-end** (punto 2 arriba): rampa de **contenido** (h1/body) en Figma como variables + reflejar en código en **rem + redondo** + diff/e2e. Naming ya cerrado (App barra, primitivo plano; S72b).
2. **🚦 Pipeline Theme Designer validado con UN piloto (GATE crítico):** un componente escala-neutral (divider/tag) que haga el viaje completo **Figma → Theme Designer → GitHub → código** y renderice correcto (rem, naming, anclajes Custom sobreviven, cadena App→Custom cruza). Arreglar bug `font.weight=600px`. **Sin esto, el port construye sobre arena.**
3. **Acuerdos con los devs (reunión)** — dependencia externa: naming, capa de aliases `--sc-*`, pipeline (Theme Designer + `tokens.json` son **complementarios**, no excluyentes), quién construye qué. Checklist listo (`convergence-checklist-devs.md`).
4. **Estructura del proyecto convergido definida** (esqueleto design-tokens / components / icons / demo, como el repo de los devs).
5. **Pipeline documentado** end-to-end (para que el port sea repetible).

El **gate es #2**: hasta que un token no haga el viaje completo y renderice bien, no arrancar el port.

**Decisiones ABIERTAS:** ~~px-vs-rem~~ ✅ **rem (S72)** · tipografía de **contenido** (h1/body) por crear como variables en Figma · ejecución card-C.

**⚠️ Bias a vigilar (Rafa lo pidió):** NO atacar los hilos "uno a uno" como iguales — hay orden por dependencia; el cuello de botella es **PROBAR** (1–3), no montar andamiaje (tracker/mintar tokens) antes. **Profundidad > amplitud.**

---

> **Cierres y planes de sesiones anteriores (S29–S69):** viven en [`SESSION-LOG.md`](./SESSION-LOG.md) (newest-first). Este doc mantiene únicamente el estado vigente + el orden inmediato; al cerrar cada sesión su estado pasa al log y aquí queda solo la cabecera nueva. Las "reglas operativas críticas" que vivían al final de este doc tienen su hogar canónico en [`CLAUDE.md`](../CLAUDE.md) (root + sub-CLAUDE) y en las DECISIONS de cada producto.
