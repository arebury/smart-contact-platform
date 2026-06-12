# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (S76, 2026-06-12) — fase tipografía CERRADA + PREP de la gran sesión COMPLETA

> La fase tipografía (DD-13) quedó cerrada en S75 (código en producción + Kit oficial cableado). S76 cerró el re-export del Kit y dejó **lista la preparación de la "gran sesión"**: construir el **repo espejo del Design System**. El detalle vivo de esa sesión vive en sus docs canónicos (abajo), no aquí.

**Hecho en S76:**
- **Re-export del Kit** (gate S75 #1): trae los valores de tipografía redondos correctos + componentes por referencia viva a los primitivos. **Hallazgo:** el export es **DTCG** (`aura/*` + refs slash), distinto del shape plano que `token-parity` lee → el allow-list `KNOWN_TYPO_DRIFT` se quita cuando el repo nuevo tenga el generador DTCG-aware. Export preservado en [`kit-export-dtcg-s76.json`](./kit-export-dtcg-s76.json).
- **PREP de la gran sesión completa:** decisiones cerradas + refresh del repo molde + dos artefactos listos + montaje.

---

## 🚀 ARRANCAR AQUÍ — la gran sesión: construir el repo espejo del DS

1. Lee **[`mirror-repo-preflight.md`](./mirror-repo-preflight.md)** — decisiones, alcance (Mitad A vs B), gobernanza, mandatos.
2. Lee **[`mirror-repo-master-prompt.md`](./mirror-repo-master-prompt.md)** — la orden de misión (contexto obligatorio, qué construir, definición de "hecho", arranque).
3. Contexto de fondo: [`convergence-manifesto.md`](./convergence-manifesto.md) (vigente, revalidado S76) + [`convergence-checklist-devs.md`](./convergence-checklist-devs.md).

**Cómo se dispara** (sesión nueva, modelo más potente):
- **Proyecto principal:** `~/dev/smartcontact-ui` (creada; `.claude/settings.local.json` ya concede permisos a las 2 fuentes).
- **Añadir 2 carpetas** (UI "añadir carpeta" o `/add-dir`, **un comando por mensaje**): `~/dev/smart-contact-platform` + `~/Downloads/smartcontact-ui-main`.
- **Línea de arranque:** ver §"Arranque rápido" del master-prompt.

**Decisiones cerradas (resumen — detalle en pre-flight §1):** escala rem central · generador único DTCG-aware · repo GitHub propio, naming `@smartcontact/*` · solo-DS (3 paquetes + demo) · one-shot = Mitad A + Mitad B mapeada · docu adaptada en tono colaborativo · guardarraíles CI · supervisor consume / `sc-demo` = doc-site.

**Pendiente tras la gran sesión (Mitad B, ya mapeada):** port de los 54 componentes + 4 solapes + `sc-datatable` + Memory (manifiesto §3–§5/§7), cada uno con diff visual. Y quitar el allow-list `KNOWN_TYPO_DRIFT` cuando el generador DTCG-aware esté en pie.

⚠️ **Bias a vigilar:** la gran sesión es **Mitad A (fundaciones)**, NO el port de componentes (eso es incremental, con diff visual). El control = **log de decisiones + guardarraíles en verde**.

---

> **Cierres y planes de sesiones anteriores (S29–S75):** viven en [`SESSION-LOG.md`](./SESSION-LOG.md) (newest-first). Este doc mantiene únicamente el estado vigente + el orden inmediato; al cerrar cada sesión su estado pasa al log y aquí queda solo la cabecera nueva. Las "reglas operativas críticas" tienen su hogar canónico en [`CLAUDE.md`](../CLAUDE.md) (root + sub-CLAUDE) y en las DECISIONS de cada producto.
