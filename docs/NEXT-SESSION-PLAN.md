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
- **Tipografía:** ✅ **DECIDIDA — DD-13** (SCDS DECISIONS). Escala **redonda** (12/14/16/18/20/24/32), desacoplada de `--sc-scale`, **rem root-16**, line-heights por regla, 2 pesos. Text styles Figma renombrados = tokens de código (`h1`, `body-1`… 12/12). **POC hecho en el duplicado** (`tUzS4…`). **Falta VALIDAR en real** (ver orden ↓).

### 🎯 Próxima sesión — ORDEN
1. ~~Test del botón / px-vs-rem~~ ✅ **HECHO (S72)** — root 16, rem, choque disuelto (DD-13).
2. **Tipografía → VALIDAR EN REAL (DD-13 ya decidido).** Migration-safe confirmado (solo tocamos `--sc-*`/`app/*`/preset, nunca PrimeNG ni el Kit del equipo). Pasos: **(a)** crear variables de la rampa de **títulos** en Figma + atar text styles (hoy títulos = style sin variable → no cruzan al código); **(b)** repetir TODO en el **Kit oficial** (el que lee el Theme Designer); **(c)** Theme Designer → PR a GitHub → verificar valores; **(d)** reflejar en código `--sc-font-size-*` (redondo, rem) + ajustar `tokens:type-parity` + diff visual + e2e.
3. **Bridge Theme Designer:** pasar UN componente escala-neutral (divider/tag, NO botón) por el puente → export==aplicado. Arreglar bug 600px.
4. **Cerrar px vs rem** para el convergido (rem gana en a11y).
5. **Nits config** (card C con gris perceptible · "Notifications"→"Notificaciones" · icono Agentes · breadcrumb) + adoptar guía doc1 (tabla dividers, px lógicos).
6. **Ejecutar convergencia** (Fase 0 = unificar escala, con devs) — el grande, **después de 1–3**.

**Decisiones ABIERTAS:** px-vs-rem · tipografía (re-autorar en Kit Pro o divergencia consciente) · ejecución card-C.

**⚠️ Bias a vigilar (Rafa lo pidió):** NO atacar los hilos "uno a uno" como iguales — hay orden por dependencia; el cuello de botella es **PROBAR** (1–3), no montar andamiaje (tracker/mintar tokens) antes. **Profundidad > amplitud.**

---

> **Cierres y planes de sesiones anteriores (S29–S69):** viven en [`SESSION-LOG.md`](./SESSION-LOG.md) (newest-first). Este doc mantiene únicamente el estado vigente + el orden inmediato; al cerrar cada sesión su estado pasa al log y aquí queda solo la cabecera nueva. Las "reglas operativas críticas" que vivían al final de este doc tienen su hogar canónico en [`CLAUDE.md`](../CLAUDE.md) (root + sub-CLAUDE) y en las DECISIONS de cada producto.
