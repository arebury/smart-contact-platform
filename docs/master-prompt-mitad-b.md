<!-- Orden de misión para la Mitad B (port de componentes) al repo espejo. La Mitad A (fundaciones) está cerrada y verificada. El plan accionable por pieza vive en el repo nuevo: smartcontact-ui/docs/component-port-plan.md. Este doc gobierna UN lote; la Mitad B es multi-sesión por diseño. S77. -->

# Prompt maestro — Mitad B: port de componentes (un lote por sesión)

> **Cómo se usa:** la Mitad A (fundaciones del repo espejo `smartcontact-ui`) está cerrada y auditada. Este documento gobierna **el port de componentes**, que es **incremental y multi-sesión**: los 54 componentes con verificación visual NO caben en una pasada. Cada sesión ejecuta **un lote** y deja el resto en el log para el siguiente.

---

## Arranque rápido (operador)

1. **Proyecto principal:** `~/dev/smartcontact-ui` (el repo construido en Mitad A).
2. **Añadir** dos carpetas (un `/add-dir` por mensaje, o por UI):
   - `~/dev/smart-contact-platform` → fuente de nuestros **custom** + los **wrappers de diseño**.
   - `~/dev/smartcontact-ui-main` → el molde, fuente de los **wrappers de desarrollo**.
3. **Primer mensaje:** la línea de arranque que te pasa Rafa **indica el lote concreto** de esta sesión (qué piezas). Apunta a `docs/component-port-plan.md` (de `smartcontact-ui`), a este prompt (de `smart-contact-platform`) y al «diferido» del `DECISIONS-LOG-B.md`, y manda ejecutar ese lote de principio a fin sin pararse a preguntar, commiteando por pieza, actualizando el `DECISIONS-LOG-B.md`.

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

## Parte 3 — El lote de esta sesión (acotado)

La Mitad B es multi-sesión. Esta sesión ejecuta **UN lote**, indicado en el mensaje de arranque. Si no se indica, arranca por lo que el último `DECISIONS-LOG-B.md` dejó en «diferido al siguiente lote».

Por **cada** pieza del lote, el método §1 del port-plan: **port → barrido de escala 8-point→`--sc-scale-*` → página en `sc-demo` → diff visual (Parte 4, según el chrome de la pieza) → `e2e` → guardarraíles en verde → commit + entrada en el log.**

**Acota a lo abarcable:** referencia ~10-16 wrappers finos, **menos si tienen chrome propio** (cada uno pide diff visual contra Figma → más lento). Si el presupuesto/contexto se agota, commitea lo hecho y deja el resto en «diferido» — **no empieces piezas a medias**.

**Orden (port-plan §7):** Fase 2 (primitivos: wrappers de desarrollo → wrappers de diseño → comunes a convergir → `sc-datatable`) → Fase 3 (custom, con la deuda de aislamiento §5) → Fase 4 (solapes §3) → Fase 5 (Memory + apps). Las **decisiones §4** (checkbox, dialog, confirm-host, section-card, icon) se cierran con criterio + racional en el log al tocar su pieza, **no se preguntan**.

**No portar fuera del lote indicado.** Si una pieza depende de algo de un lote posterior, se anota la dependencia y se difiere — no se arrastra el alcance.

---

## Parte 4 — El diff visual (lo NUEVO de la Mitad B)

**El nivel de verificación depende del chrome propio de la pieza.** El molde NO se ejecuta (fuentes solo-lectura, sin `node_modules`): la referencia visual es **el Figma / Kit Pro**, nunca el render del molde.

**A. Wrappers finos** (envuelven un primitivo PrimeNG sin SCSS/layout propio):
- Basta **métricas computadas** (`getComputedStyle`) contra los valores del export del Kit — la misma vara que `tokens:parity`. El wrapper = primitivo PrimeNG + preset ya auditado 1:1 → la fidelidad viene de las fundaciones. (Es lo que validó el lote 1; robusto para estas piezas.)

**B. Piezas con chrome propio** (composición, layout, estados o variantes visuales propias — avatar/avatargroup, los comunes con chrome de campo, **todos los custom de Fase 3**, los **solapes de Fase 4**): **las métricas NO bastan** — cubren medidas, no composición.
- **Comparar el render contra la referencia visual del Kit Pro vía el Figma MCP** (fileKey `khNq9dJKNi13pNllrqm6dx`): `get_metadata` (x/y/w/h por nodo) + `get_screenshot` + fills/tokens del componente y de sus variantes/estados; renderizar la pieza en el `sc-demo` con esas variantes; **comparar pieza por pieza** (medidas + composición + color), no a ojo y no solo `getComputedStyle`. Si algo no cuadra contra el Figma, el port está mal.
- **Si el Figma MCP no está disponible en la sesión:** validar por métricas + dejar la pieza **anotada en el log como "pendiente de diff visual contra Figma"**. No darla por cerrada en silencio.

En ambos casos: `e2e` smoke en verde + baselines de screenshot del `sc-demo` nuevo committeados. **Si hay shift de layout o las métricas/composición no cuadran, el port está mal — nunca el baseline ni el guardarraíl.**

El barrido de escala es la causa más probable de drift de medidas: un wrapper que consumía `--sc-spacing-200` (8-point) repuntado mal cambia medidas. Verificar pixel, no a ojo.

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
