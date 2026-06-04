<!-- Guion para alinear la convergencia del DS con el equipo de desarrollo. Compañero de convergence-manifesto.md (detalle técnico). S70 (2026-06-04). -->

# Convergencia DS — checklist para alinear con el equipo de desarrollo

> Puntos a cerrar con ellos, uno por uno. Cada punto: **hoy** (situación) · **proponemos** (acción) · **por qué** · **acordar** (la decisión a sacar).
> Filosofía marco: **nosotros definimos** (naming, escala, tokens, Figma), **ellos construyen**. Detalle técnico por componente en [`convergence-manifesto.md`](./convergence-manifesto.md).

---

## A. Decisiones a cerrar

### ☐ 1. Escala unificada — **BLOQUEANTE** (antes de tocar componentes)
- **Hoy:** los dos usamos prefijo `--sc-*` pero **incompatibles**: su 8-point unitless (`--sc-spacing-100` = 8) vs nuestra 14-base en px (`--sc-scale-1` = 14px). Sus skills además convierten con `calc(var()/16*1rem)`.
- **Proponemos:** una sola escala = **14-base en px** (la del Figma / Kit Pro).
- **Por qué:** el Figma es la fuente de verdad; con dos escalas los componentes se desalinean y el drift es invisible.
- **Acordar:** adoptar 14-base · regenerar su paquete de tokens con nuestra escala · barrer sus wrappers `--sc-spacing-*` → `--sc-scale-*` · quitar la regla `/16` de sus skills.

### ☐ 2. Naming pegado para wrappers PrimeNG (DD-12)
- **Hoy:** su `AGENTS.md` manda **kebab + BEM** (`sc-toggle-switch`); nosotros **pegado** (`sc-toggleswitch`).
- **Proponemos:** `sc-` + nombre PrimeNG **pegado** para wrappers; **kebab** para custom.
- **Por qué:** el Figma nombra los componentes pegado y construís leyendo el Figma → 1:1 sin traducir. PrimeNG acepta los dos selectores, así que no se pierde nada.
- **Acordar:** realinear sus **5** (`input-text`, `toggle-switch`, `radio-button`, `progress-bar`, `progress-spinner` → pegado) · actualizar `AGENTS.md` + skills + componentes de referencia (o su Codex seguirá generando kebab).

### ☐ 3. `sc-checkbox` — una sola base
- **Hoy:** el nuestro es `<input>` nativo **tri-estado** (none/some/all); el suyo envuelve `p-checkbox` con `indeterminate`.
- **Proponemos:** una base única que **conserve el tri-estado**.
- **Por qué:** dos checkboxes = deuda + divergencia de accesibilidad.
- **Acordar:** ¿base nativa nuestra o `p-checkbox` suyo? (el nombre no cambia).

### ☐ 4. Iconos — un solo paquete + el resolver
- **Hoy:** su `@smartcontact/icons` es **más maduro** que nuestro `sc-icon`; sus wrappers dependen de un `sc-component-icon-resolver` (compat de nombres `pi→Material`).
- **Proponemos:** migrar nuestro `sc-icon` a su paquete de iconos; decidir el destino del resolver.
- **Por qué:** no duplicar iconos; el resolver es **dependencia transitiva** de casi todos sus wrappers (se arrastra al ganarlos).
- **Acordar:** conservar nuestros ejes FILL/wght/opsz · ¿portar su resolver tal cual o sustituir por nuestro mapeo?

### ☐ 5. `sc-datatable` — crearlo (falta en los DOS)
- **Hoy:** ninguno tiene wrapper de tabla; solo hay estilo por preset.
- **Proponemos:** crear `sc-datatable`, **prioritario**.
- **Por qué:** las pantallas de lista lo necesitan; es el hueco real más grande del catálogo.
- **Acordar:** quién lo construye y cuándo.

### ☐ 6. Reutilizar primitivos PrimeNG en vez de cocinar bespoke
- **Hoy:** tenemos piezas custom que podrían apoyarse en un primitivo PrimeNG que **nadie** envolvió.
- **Proponemos:** `inline-rename` → **`p-inplace`** · `photo-upload` → **`p-fileupload`** · `command-palette` / `keyboard-shortcuts` → `p-dialog`. (Y ganamos su `ScDynamicDialogService` como infra.)
- **Por qué:** menos código propio que mantener — es **su propia regla** wrapper-vs-custom.
- **Acordar:** confirmar la reutilización al portar cada una (sin forzar un primitivo que no encaje).

---

## B. Ya alineados — confirmar y arrancar en positivo

### ☐ 7. Doctrina de tokens (idéntica)
`--sc-*` = contrato público · `--p-*` = capa adaptadora · no inventar tokens · paleta por el preset. Es palabra por palabra lo que ya hacemos.
> Matiz: su `base.ts` hardcodea hex (`#344a70`…), que **viola su propia regla** de "no hardcodear"; nuestro plan lo pasa a `var(--sc-*)` → cumple su norma mejor que hoy.

### ☐ 8. Regla wrapper-vs-custom (idéntica)
Su skill ya dice *"wrapper si el comportamiento existe en PrimeNG; custom solo si es composite/layout/no soportado"*. Es la misma lente de reutilización del punto 6.

### ☐ 9. Su pipeline de agente (la maquinaria de "ellos construyen")
`token-inspector → component-generator → primeng-wrapper → docs-generator → workspace-sync`. El proyecto convergido encaja en él; solo hay que actualizar las convenciones de los puntos 1 y 2 dentro de esas skills.

---

**Cierre de la reunión:** confirmar A.1 y A.2 (los bloqueantes), repartir A.3–A.6, y dar por buenos B.7–B.9. Con eso el manifiesto pasa de spec a plan ejecutable.
