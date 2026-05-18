# Case Study Notes — Smart Contact Platform

> Apuntes pedagógicos del proyecto. Momentos de aprendizaje real
> (refactors con historia, premisas equivocadas, sparring que cambió
> decisiones, gotchas técnicas) capturados mientras están frescos.
>
> **Criterio**: solo momentos con lección portable. Filtra señal,
> evita morralla. Si lo único interesante de un commit es "renombré
> X", no va aquí.
>
> **Formato**: 1 entry por momento. Newest first.
> - Contexto: qué estaba pasando.
> - Premisa equivocada: lo que asumimos al empezar (si aplica).
> - Descubrimiento: lo que reveló la investigación.
> - Lección portable: la frase que vale para otros proyectos.

---

## 2026-05-18 · S34 — Cross-ref sistemático Figma kit ↔ SCDS reveló qué refactors NO hacer

**Contexto**: el Figma SC PrimeUI Kit Pro tiene ~80 componentes (Button, Input, Select, ConfirmDialog, Popover, Inplace, Avatar, Panel, etc.). El SCDS tiene 34. La tentación natural es: "para cada componente Figma, hagamos wrapper SCDS — así todo el DS es 1:1 con Figma".

**Premisa equivocada**: nombre parecido = mismo concepto.

**Descubrimiento**: tras cross-ref sistemático y sparring de 3 candidatos P2:
- `<p-inplace>` (toggle display↔edit) ≠ `sc-inline-rename-cell` (always-edit, parent controla). Mismo nombre genérico, **patrones opuestos**.
- `<p-avatar>` (32-64px foto/icon/texto) ≠ `sc-illustrated-avatar` (SVG illustration grande custom). **Conceptos distintos**.
- `<p-panel>` (header collapsible + body) ≈ `sc-section-card` SÍ es match conceptual, pero el Panel del Kit vive en library externa PrimeOne, **no auditable** desde Figma SC vía MCP.

**Lección portable**: "está en Figma" no implica "refactorízalo". Tres criterios mínimos: (1) mismo concepto, no solo nombre/categoría, (2) reduce código sin forzar UX changes en consumers, (3) tokens Figma auditados que el refactor empieza a consumir. Si fallan, NO refactor — patterns in-house sin equivalente o conceptos distintos se quedan donde están.

---

## 2026-05-18 · S34 — "P1 claros" no eran tan claros tras inspeccionar la realidad

**Contexto**: tras cross-ref Figma kit, marqué `sc-confirm-host → <p-confirmdialog>` como "P1 claro — match obvio, refactorizar". Empecé el refactor con seguridad.

**Premisa equivocada**: "el componente Figma cubre el mismo concepto, refactor mejora paridad".

**Descubrimiento**: `sc-confirm-host` ya está renderizado a través de `sc-modal`, que **a su vez está auditado 1:1 con el mismo Figma node `❖ ConfirmDialog`** (6738:50207) que `<p-confirmdialog>` usaría. La paridad Figma **ya existe**, solo difiere el plumbing interno. Pero **sí había deuda escondida**: los botones del `<sc-confirm-host>` usaban `.btn` hardcoded, que tras eliminar `_buttons.scss` quedaron unstyled.

**Lección portable**: antes de un refactor estructural, lee el código actual entero. Lo que parece "duplicación con el canonical" puede estar consumiendo el canonical por una ruta no obvia. Y la deuda real puede no estar donde la categorización del backlog la pinta — está en otro sitio cercano. Apliqué refactor de todas formas (resultó beneficioso por otras razones: menos plumbing, mejor migration safety), pero la justificación correcta no era la inicial.

---

## 2026-05-18 · S34 — ViewEncapsulation y PrimeNG: cuándo `::ng-deep` no llega

**Contexto**: necesitaba aplicar `min-width: 144px` al botón "Nuevo X" del page-header para evitar shift entre páginas. Mi primer intento fue scoped en `page-header.component.scss` con `:host ::ng-deep p-button > .p-button { min-width: 144px }`. **No aplicó**.

**Premisa equivocada**: `::ng-deep` perfora cualquier encapsulation Angular.

**Descubrimiento**: `<p-button>` renderiza su DOM interno **fuera** del view scope del componente que lo contiene — Angular `::ng-deep` no alcanza ese DOM porque está en una zona "ajena". El selector terminaba aplicando a nada.

**Solución**: regla **unscoped** en `apps/aed/src/styles/main.scss` con `.page-header__actions p-button > .p-button { min-width: 144px }`. Funcionó porque el CSS global no está sujeto a encapsulation.

**Lección portable**: cuando aplicas un override CSS sobre un componente de librería externa (PrimeNG, Material, etc.) y el selector parece correcto pero no aplica, **probablemente el DOM está fuera del view scope**. Solución: mover la regla a un archivo CSS global, no scoped por componente. Documenta el "por qué" — es un patrón anti-intuitivo que cualquier dev volverá a chocar.

---

## 2026-05-18 · S34 — Dead code puede tener intención viva

**Contexto**: durante el cleanup post-migración `.btn` → `<p-button>`, encontré en `apps/aed/src/styles/_table-elements.scss` el selector `.page__actions > .btn--primary { min-width: 144px; justify-content: center; }`. La clase `.page__actions` no existía en ningún HTML — selector huérfano. Lo borré como dead code.

**Premisa equivocada**: selector sin uso = dead code = borrar.

**Descubrimiento**: el comment del bloque documentaba un problema real: "Different list pages have different create-button labels — without a min-width the chrome shifts visibly between pages". Verifiqué con Playwright: medí el botón "Nuevo X" en 5 páginas → **134, 142, 149, 153px**. El shift de 19px **sí era real y notorio** al navegar.

**Lección portable**: dead code con comment explicativo merece 30 segundos extra antes de borrar. La pregunta correcta no es "¿esta clase se usa?" sino "¿el problema que esta regla intentaba resolver sigue existiendo?". Si sí, recupéralo apuntando al selector actual. Si no, borra con confianza. La regla terminó re-aplicada al selector correcto post-migración (`.page-header__actions p-button > .p-button`).

---

## 2026-05-18 · S34 — El grep no es la realidad: verificación visual reveló deuda escondida

**Contexto**: tras migrar 38 botones `.btn` a `<p-button>` y borrar `_buttons.scss`, hice `grep -rn 'class="btn"' apps/aed/src` → 0 resultados. Marqué la migración como completa.

**Premisa equivocada**: "grep verde = realidad limpia".

**Descubrimiento**: capturando screenshots con Playwright post-migración detecté un botón "Aplicar" en bulk-edit-menu **sin estilos** (text-only, sin chrome). Investigué: `packages/design-system/components/bulk-edit-menu/bulk-edit-menu.component.html` tenía `class="btn btn--secondary"`. El grep `apps/aed/src` no lo pilló porque el componente vive en `packages/design-system/`. También encontré 2 más en `sticky-form-header`.

**Lección portable**: tras cualquier rename/eliminate masivo, **valida con verificación visual real**, no solo con grep. El grep da falsa confianza cuando la base de código tiene múltiples raíces (monorepo con `apps/` + `packages/`, libraries, code-shared modules). Playwright en 5-7 pantallas clave (light + dark) cierra el hueco en 10 minutos.

---

## 2026-05-18 · S34 — Comments rot — el código miente cuando nadie actualiza el doc inline

**Contexto**: el bloque local `.btn { ... }` redeclarado en `agent-form-page.component.scss` tenía un comment: *"The base `.btn` lives in shared/components/sticky-form-header but isn't a global primitive yet; we re-declare a slim version here"*.

**Premisa equivocada**: el comment refleja el estado actual del código.

**Descubrimiento**: `apps/aed/src/styles/_buttons.scss` **YA existía** como global primitive y su propio comment decía *"Replaces the previous per-page `.btn` definitions (10+ files)"*. El comment del bloque local llevaba **al menos 1 sesión obsoleto**, justificando una duplicación que ya no tenía razón de ser.

**Lección portable**: los comments inline que justifican una decisión **caducan** cuando el contexto que los justificaba desaparece. El reader nuevo confía en ellos. Antidoto: en code review, cualquier comment que diga "aún no", "todavía no", "por ahora", "temporary" es candidato a refresh — verifica si el "aún no" sigue siendo cierto.

---

## 2026-05-18 · S34 — Cuestiona la premisa técnica antes de ejecutar el plan

**Contexto**: el plan original de la sesión decía "Refactor SCSS gordo `agent-form-page.component.scss`: 808 líneas excede budget 12 KB. Splittear por secciones del form."

**Premisa equivocada (del plan, no mía)**: split de un archivo SCSS en partials `@use`-ados baja el warning de budget Angular `anyComponentStyle`.

**Descubrimiento**: ese budget en Angular **mide el CSS compilado del componente**, no el `.scss` fuente. Splittear el `.scss` en `_layout.scss`, `_pickers.scss`, etc. organiza el código pero **no quita un byte** del CSS bundleado. El warning seguiría igual.

**Conclusión del sparring**: el plan estaba apuntando al síntoma equivocado. Para reducir bytes reales había que eliminar reglas (deduplicar, borrar dead code), no organizar archivos. El verdadero refactor pivoteó a algo completamente distinto: matar el dual-system `.btn` vs `<p-button>`.

**Lección portable**: cuando un plan llega con "haz X para conseguir Y", valida primero **si X realmente produce Y**. Pregunta básica: ¿qué métrica EXACTA mide el problema? ¿X mueve esa métrica? Si la cadena causal no cuadra, el plan está roto. Mucha "deuda técnica" que parece "obvia de atacar" se sostiene en premisas no verificadas.

---

## 2026-05-18 · S34 — Dual-system: cómo la deuda nace de no tener referencia, y cómo se cierra

**Contexto** (el momento estrella de la sesión): AED tenía 38 botones con clase utility `.btn` global + 1 con `<p-button>` PrimeNG. La doc del DS declaraba `<p-button>` como canonical, pero la realidad era 38 vs 1. La doc mentía.

**Historia**: AED se construyó **antes de tener el Figma SC PrimeUI Kit Pro**. El equipo de devs usó "themed designer" + documentación PrimeNG como referencia. Sin tokens Figma reales, las dimensiones del botón (`.btn` height 40px, padding 12/16) se decidieron por aproximación. Cuando llegó el Kit Pro, la dirección canonical viró a `<p-button>` con tokens Figma auditados (10.5/7 padding, 36px height), pero los 38 usos `.btn` se quedaron porque no había trigger para migrarlos.

**Cierre S34**: 38 botones migrados, `_buttons.scss` borrado, tokens `--sc-btn-*` removidos, override `components.button.root` añadido en `sc-preset.ts` con valores Figma 1:1. Cambio visual aceptado (40 → 36px en toda AED): "matchear Figma > mantener brand decision arbitraria".

**Lección portable**: las deudas duales (dos formas de hacer la misma cosa) nacen casi siempre por la **secuencia temporal**: una primera implementación sin referencia → la referencia llega tarde → la segunda implementación convive con la primera porque "ya hay 38 lugares usando la vieja". El cierre requiere (a) decisión explícita de cuál es canonical, (b) migración mecánica con verificación visual, (c) eliminación completa del sistema viejo (no dejar `_buttons.scss` como "por si acaso"), (d) override en preset para que el canonical respete identidad brand.

> El sistema dual cumple una función histórica (puente entre "lo que teníamos" y "lo que decidimos hacer"). Pero **una vez que la referencia está, mantener ambos paralelos es deuda silenciosa que diverge con el tiempo**. Match el código a la referencia, no la referencia al código.

---

## Convenciones del archivo

- **Newest first** — sesión más reciente arriba.
- **Formato**: contexto / premisa equivocada (si aplica) / descubrimiento / lección portable.
- **Filtrar morralla**: si solo es "renombré X" o "moví Y", no va. Solo momentos con aprendizaje portable a otros proyectos.
- **No urgente**: anotar progresivamente, no batch al final de sesión. Lo fresco gana al exhaustivo.
- **Origen**: feedback Rafa S34 — material para presentación del proyecto como case study.
