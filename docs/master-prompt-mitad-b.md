<!-- Orden de misión para la Mitad B (port de componentes) al repo espejo. La Mitad A (fundaciones) está cerrada y verificada. El plan accionable por pieza vive en el repo nuevo: smartcontact-ui/docs/component-port-plan.md. Este doc gobierna UN lote; la Mitad B es multi-sesión por diseño. S77. -->

# Prompt maestro — Mitad B: port de componentes (un lote por sesión)

> **Cómo se usa:** la Mitad A (fundaciones del repo espejo `smartcontact-ui`) está cerrada y auditada. Este documento gobierna **el port de componentes**, que es **incremental y multi-sesión**: los 54 componentes con verificación visual NO caben en una pasada. Cada sesión ejecuta **un lote** y deja el resto en el log para el siguiente.

---

## Arranque rápido (operador)

1. **Proyecto principal:** `~/dev/smartcontact-ui` (el repo construido en Mitad A).
2. **Añadir** dos carpetas (un `/add-dir` por mensaje, o por UI):
   - `~/dev/smart-contact-platform` → fuente de nuestros **custom** + los **wrappers de diseño**.
   - `~/dev/smartcontact-ui-main` → el molde, fuente de los **wrappers de desarrollo**.
3. **Primer mensaje:**
   > Lee `docs/component-port-plan.md` (de la carpeta `smartcontact-ui`) y `docs/master-prompt-mitad-b.md` (de `smart-contact-platform`). Ejecuta el PRIMER LOTE (Parte 3) de principio a fin sin pararte a preguntar, commiteando por pieza. Entrégame el repo + el `DECISIONS-LOG-B.md` al final.

---

## Parte 1 — La misión

Portar componentes al repo unificado, **pieza a pieza, con verificación visual**. Las fundaciones están cerradas (escala 14-base/rem, tokens, preset modular, `provideSmartContactUi`, guardarraíles). Este lote = un subconjunto acotado; **no** se intenta portar los 54.

---

## Parte 2 — Contexto obligatorio (entender, no adivinar)

Leer antes de tocar nada. Si algo no encaja con la realidad del código, ir a la fuente y verificar.

1. **`smartcontact-ui/docs/component-port-plan.md`** — el plan accionable: **método §1** (innegociable por pieza), catálogo §2, solapes §3, **decisiones por-componente §4**, deuda de aislamiento §5, `sc-datatable` §6, orden §7. **LA FUENTE.**
2. `smartcontact-ui/docs/DECISIONS.md` (DD-1..13) + `customs-catalog.md` + `migration-safety.md` + `AGENTS.md` — doctrina, naming DD-12, pipeline.
3. `smartcontact-ui/DECISIONS-LOG.md` — qué se decidió en Mitad A (no re-litigar).
4. **Fuentes de los componentes:** `smartcontact-ui-main` (wrappers de desarrollo a adoptar; su `sc-demo` es la **referencia de render**) + `smart-contact-platform` (nuestros custom + wrappers de diseño).

---

## Parte 3 — El PRIMER LOTE (acotado)

Por **cada** pieza, el método §1 del port-plan: **port → barrido de escala 8-point→`--sc-scale-*` → página en `sc-demo` → diff visual no-CLS → `e2e` → guardarraíles en verde → commit + entrada en el log.**

**A. GATE — decidir el `sc-component-icon-resolver` (§4.2).** Es dependencia transitiva de casi todos los wrappers de desarrollo → se decide **antes** de adoptarlos en masa: portarlo tal cual (compat pi→Material) o sustituirlo por nuestro mapeo. Racional en el log.

**B. Adoptar los wrappers PrimeNG "simples" del catálogo de desarrollo** (ya existen en el molde; el trabajo es adoptar + renombrar DD-12 + barrido de escala + verificar, no construir de cero):
`sc-button` · `sc-badge` · `sc-card` · `sc-chip` · `sc-tag` · `sc-message` · `sc-panel` · `sc-skeleton` · `sc-textarea` · `sc-drawer` · `sc-progressbar` · `sc-progressspinner` · `sc-radiobutton`.
(Renames DD-12: `progress-bar`/`progress-spinner`/`radio-button` → pegado.)

**C. Si queda presupuesto/contexto**, en este orden: `sc-avatar` (con el Badge + AvatarGroup de §3, que son trabajo de construcción, no adopción) y `sc-toast` (arrastra la infra `ScToastService`/`provideScToast`). Si no quedan, se dejan **anotados como el arranque del siguiente lote** en el log — no se empiezan a medias.

**Fuera de este lote** (lotes siguientes, no tocar): los 16 custom (Fase 3), los 9 wrappers de diseño, los 5 comunes a convergir, los 4 solapes (§3), `sc-datatable`, y Memory. Si una pieza del lote depende de algo de esos, se anota la dependencia y se difiere — no se arrastra el alcance.

---

## Parte 4 — El diff visual (lo NUEVO de la Mitad B)

Cada componente se verifica **no-layout-shift** antes de darlo por portado:

1. Renderizar el componente en una página del `sc-demo` (variantes + estados relevantes).
2. **Comparar contra la referencia:** el render del `sc-demo` del molde (`smartcontact-ui-main`) para los wrappers de desarrollo; el Figma / Kit Pro cuando aplique.
3. Playwright: screenshot + comparación de medidas (`getComputedStyle`) y de baseline visual. **Si hay shift de layout o las métricas no cuadran, el port está mal — no el baseline ni el guardarraíl.**
4. `e2e` smoke en verde.

El barrido de escala es la causa más probable de drift visual: un wrapper del molde que consumía `--sc-spacing-200` (8-point) y se repunta mal cambia medidas. Verificar pixel, no a ojo.

---

## Parte 5 — Mandatos (los de Mitad A, vigentes)

1. **Mejora con criterio** — mejor arquitectura/código si no rompe una decisión cerrada, es lo más simple que resuelve el problema real, y cero relleno.
2. **Termina entero, no consultes — pero entiende, no adivines.** Las **decisiones por-componente §4** del port-plan se cierran **con criterio + racional en el log**, NO se preguntan. Ante un fleco no previsto: entender la fuente real, verificar, decidir sobre lo verificado.
3. **Auto-verificación, no vigilancia** — guardarraíles + diff visual como gate.
4. **Commits por pieza** + `DECISIONS-LOG-B.md` al día. Si la sesión se corta, cada pieza ya está commiteada y el log dice dónde retomar.

---

## Parte 6 — Qué NO hacer

- **No relajar un guardarraíl para pasar.** `tokens:parity` + `tokens:guard` + `audit:theme-scale` + el diff visual deben seguir en verde **con su rigor actual**. Si un port los rompe, el port está mal.
- **No salir del lote** (Parte 3). El alcance acotado es lo que hace que termine.
- **Las carpetas fuente son de solo lectura** (`smart-contact-platform`, `smartcontact-ui-main`): leer, nunca escribir. Se construye solo en `smartcontact-ui`.
- **No romper una decisión cerrada** (Mitad A / pre-flight) ni inventar tokens.
- **Sin slop ni andamiaje especulativo.**

---

## Parte 7 — Entregable y "hecho"

- Cada pieza del lote **commiteada** (port + demo + verificación).
- **`DECISIONS-LOG-B.md`**: una entrada por pieza (qué se portó, el barrido de escala, el resultado del diff visual, las decisiones §4 tomadas con su base) + las piezas diferidas al siguiente lote.
- **"Hecho" del lote =** todas las piezas del lote portadas · `npm run verify` en verde · `e2e` + diff visual en verde · `sc-demo` levanta con las páginas nuevas · log entregado · lo no hecho mapeado para el siguiente lote.
