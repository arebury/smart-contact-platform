<!-- Orden de misión para la sesión grande de construcción del repo espejo del Design System. Se usa para arrancar esa sesión (modelo más potente). Decisiones y alcance viven en mirror-repo-preflight.md; este doc es el guion ejecutable. S76. -->

# Prompt maestro — Construcción del repo espejo del Design System

> **Cómo se usa:** este documento es el guion de la sesión grande que construye el
> repositorio nuevo del Design System. Se arranca una sesión con el modelo más potente,
> con acceso a las fuentes listadas abajo, y se le entrega este prompt. El ejecutor lee el
> contexto, construye de principio a fin, y entrega el repo + un log de decisiones para una
> revisión única.

---

## Arranque rápido (operador)

1. **Proyecto principal de la sesión** = la carpeta del repo nuevo `~/dev/smartcontact-ui` (ya creada, vacía).
2. **Añadir** las dos fuentes como carpetas (no worktree): en el chat, `/add-dir ~/dev/smart-contact-platform` y `/add-dir ~/Downloads/smartcontact-ui-main`.
3. **Primer mensaje al ejecutor:** «Lee y ejecuta `docs/mirror-repo-master-prompt.md` de la carpeta `smart-contact-platform`. Sigue su Parte 2 antes de tocar nada.»

`git init` y el remoto de GitHub los hace el ejecutor como primer paso (Parte 3.A), salvo que prefieras dejarlos hechos antes.

---

## Parte 0 — Precondiciones de arranque (las provee el operador, no son decisiones de diseño)

Antes de disparar, asegurar:

1. **Acceso a las tres fuentes** desde la sesión:
   - **Contenido** (de aquí sale lo nuestro): este repo `smart-contact-platform` — `packages/design-system/` (7 capas de tokens, preset, componentes) + `scripts/` (`token-parity.mjs`, `token-gen.mjs`, guard) + `docs/`.
   - **Molde** (de aquí sale la estructura de empaquetado): `~/Downloads/smartcontact-ui-main` (`smartcontact-ui`).
   - **Valores** (la fuente de verdad de métricas): el export DTCG del Kit oficial, preservado en **`docs/kit-export-dtcg-s76.json`** (14-base, valores redondos). En la sesión grande se re-genera al conectar el Theme Designer al repo nuevo; esta copia es la referencia de arranque. **Versionarlo en el repo nuevo.**
2. **Repo destino**: nuevo, en nuestro GitHub. Nombre recomendado `smartcontact-ui` (espejando el de ellos), con credenciales de push listas.
3. **Modelo**: el más potente. Ejecución de una pasada.

---

## Parte 1 — La misión

Construir la **Mitad A** del repo espejo: el Design System empaquetado, publicable y
**autosuficiente**, donde lo que viene de Figma se refleja tal cual y cada valor es
trazable y verificable por máquina. Estructura de empaquetado del molde + todo nuestro
contenido y tooling. **No se porta ningún componente** en esta sesión (eso es Mitad B,
mapeada para después).

---

## Parte 2 — Contexto obligatorio (entender a fondo ANTES de tocar nada)

Leer, en este orden, y no escribir una línea hasta haberlo entendido. **No adivinar: si
algo no encaja, ir a la fuente real (código, export) y verificar.**

1. **`docs/mirror-repo-preflight.md`** — LA FUENTE de decisiones, alcance y mandatos. Si algo de este prompt y el pre-flight discrepan, manda el pre-flight.
2. **`docs/convergence-manifesto.md`** — catálogo unión, solapes, huecos, estructura de empaquetado (§6), plan de fases (§7). Vigente, revalidado S76.
3. **`docs/convergence-checklist-devs.md`** — qué es adopción del lado del equipo de desarrollo (no bloquea esta sesión).
4. **Molde** `~/Downloads/smartcontact-ui-main`: la estructura de 4 projects, el preset modular (`projects/ui-smartcontact/src/lib/theme/sc-preset/`), `rem-scale.ts`, `convert-tokens.js` + `tokens.json`, las skills (`.agents/skills/`), `AGENTS.md`/`PROMPTS.md`, `provideSmartContactUi`.
5. **Nuestro DS** `packages/design-system/`: las 7 capas, `sc-preset.ts`, el tooling de `scripts/`.
6. **El export** `docs/kit-export-dtcg-s76.json` (copia preservada del export del Kit, S76): DTCG, referencias estilo Figma con slash (`{color/gray/800}`), 14-base, redondo.

El estado verificado del molde (S76) está en el **§2 del pre-flight** — usarlo para no re-descubrir lo ya sabido (catálogo idéntico, `base.ts` con hex, `rem-scale.ts`/`check-theme-scale.mjs`/`sync-theme` a adoptar, drift `sc-palette.ts`, lock a PowerShell).

---

## Parte 3 — Qué construir (orden por dependencia)

Detalle en pre-flight §4 + manifiesto §6/§7. Resumen ejecutable:

**A. Esqueleto del repo.** Estructura de 3 paquetes ng-packagr (`@smartcontact/styles · icons · components`) + `sc-demo`, copiando el molde. `package.json`/`angular.json`/tsconfig. **Portar `export:*` de PowerShell a Node** (`mkdir -p` portable). Inicializar git en la carpeta del repo nuevo, crear el remoto en GitHub (`gh repo create` si hay sesión de `gh`; si no, dejar el remoto pendiente y anotarlo en el log) y primer commit del esqueleto.

**B. Escala (Fase 0, bloqueante).** Portar nuestras 7 capas 14-base a `@smartcontact/styles`. **Adoptar el mecanismo rem central** del molde (`rem-scale.ts` + el auditor `check-theme-scale.mjs`). Barrer los consumos `--sc-spacing-*`/`--sc-space-*` → `--sc-scale-*`. **Fundir** `convert-tokens.js` (su import DTCG, sin portar sus ~20 ramas muertas) + nuestro `token-gen.mjs` (la ley de escala) en **un generador único DTCG-aware** alimentado por el export del Kit.

**C. Preset.** Estructura modular por-componente del molde, con **cada slot apuntando a `var(--sc-*)`**. **Reescribir `base.ts`** quitando el color hardcodeado (`#344a70ff`…) → `var(--sc-*)`. Portar nuestros overrides a esa estructura.

**D. Setup.** `provideSmartContactUi()` como frontera única, con `darkModeSelector` por defecto a **`.sc-dark`** (el molde trae `'none'`).

**E. Tooling de verificación como gate de CI.** El generador único + `tokens:parity` + `type-parity` + `tokens:guard` (stream tokens/Figma) y el auditor de escala adoptado (stream preset). Más `lint` + `tsc --noEmit` + `e2e` smoke.

**F. Documentación.** La nuestra (DECISIONS, customs-catalog, migration-safety, guía de tokens) + las suyas (`AGENTS.md`, `PROMPTS.md`, skills) **adaptadas** a las convenciones unificadas: naming pegado (DD-12), escala unificada (quitar la regla `/16` donde aplique al naming, no al mecanismo), tooling de parity. **Corregir el drift** `sc-palette.ts` (referencia inexistente). Registro profesional y colaborativo (pre-flight §8).

**G. Continuidad y autocontención.** El repo nuevo debe quedar **autoconsultable sin acceso a ningún otro repo**: llevar a su `docs/` la documentación de referencia — las DECISIONS adaptadas, la guía de tokens, el manifiesto de convergencia y este pre-flight/prompt como rationale — **en el tono colaborativo del pre-flight §8**, adaptando o retirando cualquier framing comparativo interno. Incluir el `DECISIONS-LOG.md` de la sesión. Objetivo: cualquiera que abra el repo lo entiende solo con lo que hay dentro.
> **No** copiar artefactos internos del repo de origen: la memoria de trabajo del agente (`MEMORY.md` y similares), las bitácoras de proceso (`SESSION-LOG`, `NEXT-SESSION-PLAN`, notas de case-study), ni su `CLAUDE.md` — el repo nuevo genera su propio `CLAUDE.md`/`AGENTS.md` adaptado a su estructura. El conocimiento técnico útil de esos artefactos ya vive en la doc de DS que sí viaja (DECISIONS, migration-safety, guía de tokens).

---

## Parte 4 — Cómo ejecutar (estrategia recomendada)

La calidad la garantiza el método, no la vigilancia del operador:

- **Fan-out de lectura** sobre las fuentes (Parte 2) antes de construir.
- **Construcción por dependencia**: A→B→C secuencial (la escala bloquea el preset, el preset bloquea el setup); D/E/F paralelizables una vez B/C estén sólidos.
- **Verificación adversarial**: tras cada bloque, agentes independientes que intentan refutar — ¿el preset resuelve a `var(--sc-*)`? ¿el generador reproduce los valores del export al pixel? ¿queda algún `px` en el preset? ¿algún hex en `base.ts`?
- **Completeness critic** al final: recorrer pre-flight §4 punto por punto y confirmar que nada quedó a medias.
- **Guardarraíles como gate**: nada se da por bueno hasta que parity + auditor de escala + `tsc` + build de los 3 paquetes estén en verde.
- **Commits incrementales**: commitea tras cada bloque (A→F) con un mensaje claro, y mantén el `DECISIONS-LOG` al día sobre la marcha. Si la sesión se corta por cualquier causa (límite de uso, contexto), el progreso queda guardado y se retoma desde el último commit + el log — no se pierde trabajo. Esto NO contradice "termina entero": commitear no es parar a preguntar.

---

## Parte 5 — Mandatos (del pre-flight §9, innegociables)

1. **Mejora con criterio.** Elegir la mejor arquitectura/código aunque se desvíe del plan, si no contradice una decisión cerrada, es la solución más simple que resuelve el problema real, y no introduce relleno (boilerplate, abstracciones inventadas, comentarios obvios, naming que no existe en la fuente, capas sin trigger).
2. **Termina entero, no consultes — pero entiende, no adivines.** No hay paradas para preguntar. Ante un fleco no previsto: entender a fondo la fuente real, verificar empíricamente, decidir sobre lo verificado, registrar en el log.
3. **Auto-verificación, no vigilancia.**
4. **Un único punto de revisión:** el repo + el log de decisiones.

---

## Parte 6 — Qué NO hacer

- **No portar componentes** (los 54 de §3 del manifiesto): es Mitad B. Si se toca alguno por necesidad de las fundaciones, anotarlo y no expandir.
- **No tocar el repo del equipo de desarrollo** (su GitLab): sin acceso de escritura, fuera de alcance.
- **Las carpetas fuente son de solo lectura** (`smart-contact-platform` y el molde `smartcontact-ui-main`): leer de ellas, nunca escribir. Todo lo que se construye va en el repo nuevo.
- **No romper una decisión cerrada** (pre-flight §1).
- **No inventar tokens** ni valores: todo sale del export del Kit, verificado por parity.
- **Sin relleno ni andamiaje especulativo.**

---

## Parte 7 — Entregable y definición de "hecho"

**Entregable para la revisión única:**
- El repo construido (3 paquetes + demo), con build verde y guardarraíles en verde.
- **`DECISIONS-LOG.md`**: cada decisión tomada y cada desviación del plan, con su **porqué** y su **base verificada** (qué se leyó/comprobó). Las dudas resueltas con criterio van aquí con su razonamiento — no en forma de preguntas.
- Un **README de arranque** con cómo construir, cómo verificar (comandos), y el estado de cada guardarraíl.

**"Hecho" =**
1. `build` de los 3 paquetes en verde.
2. Guardarraíles en verde: generador reproduce el export al pixel · `parity` · auditor de escala (cero `px` en preset) · `base.ts` sin hex · `tsc --noEmit` · `e2e` smoke.
3. `sc-demo` levanta y renderiza.
4. Documentación completa y adaptada (incluida la corrección del drift heredado).
5. `DECISIONS-LOG.md` entregado.
