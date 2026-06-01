# Next session plan — Smart Contact Platform

> 🧭 Lectura mínima al arrancar: este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md).
> Historia detallada en [`SESSION-LOG.md`](./SESSION-LOG.md) (no la repetimos aquí).

---

## Estado al cerrar (Session 66, 2026-06-01) — layout responsive común config AED (Figma + código)

Establecido y aplicado UN modelo de layout a las 3 pantallas de config AED (General/Agentes/Grupos),
en Figma (5 frames) y en código. Detalle en SESSION-LOG S66 + DD#66. 1 commit a `main`, verde.

**Hecho:** panel (rail + contenido) = unidad con tope `max-width 1200` + centrado; padding 22,75/28
(tokens `scale/1-625` + `scale/2`), gap 28, rail 235, card que llena, sidebar fijo. Figma: alineadas
`19:962`/`1:12496`/`1:12676`/`14:923` + sustituido el sidebar 64→240 en Grupos + radius del panel gris
6→12 (concéntrico). Código: `settings-shell` a bloque (fix del `margin:auto` en flex-item), `page__inner`
sin tope. Medido 1440/1868/2560; `tokens:guard`/`lint` verdes.

**Pendiente / próximo:**
- **Tags de estado → chips** (General "Estados de agentes"): Rafa explora en Figma ("opción 1" = chips
  con ×). Chips para estados editables, tag para los fijos. Decidir + implementar.
- **Card anidada en código:** Figma tiene panel gris exterior (12) + secciones blancas (8); el código solo
  tiene las secciones (8, coincide). Portar el envoltorio gris si se adopta.
- **Nav "pure-sc"** (277/291) vs General (235): panel visible ~235 igual; unificar componente si se quiere 1:1 estricto.
- `32:1046` quedó a 2161 (pruebas) → resetear a 1440 si se quiere.

---

## Estado al cerrar (Session 65, 2026-06-01) — config AED 3 pantallas 1:1 (código) + iftaLabel DS + tabla datatable (Figma)

Sesión larga, dos hilos (Figma tabla + código config AED). Muy interactiva, Rafa corrigiendo 1:1
contra el Figma Supervisor. ~8 commits a `main` (`5365a66`→`3e6e2b6`), todo verde (build/lint/i18n/
e2e 28-28). Detalle en SESSION-LOG S65. (S64 fue 100% Figma — ver SESSION-LOG, no llegó a este doc.)

**Hecho:**
1. **Tabla Agentes / datatable** (Figma): `fila-agente` compuesto con primitivos del Kit + bind a
   variables (light+dark OK). Docs `customs-catalog §2.8` + `extender-kit-pro-guia-diseno.md`.
2. **Config AED — 3 pantallas 1:1** (General/Agentes/Grupos): flush + **save arriba** (TopBar slot) +
   breadcrumb "Administración › X › Editar X" + **color gray/50 bg + cards blanco + rail panel** +
   `sc-checkbox` + **dirty inteligente**. Grupos: 4 multi-select + 3 inputtext + Apertura single.
3. **DS: variante `[iftaLabel]`** (label dentro) en `sc-select` + `sc-inputtext` + `sc-multiselect`
   (opt-in). Registros en `code-connect-mapping.md` con node IDs + tokens. customs-catalog §2.9.

**Pendiente / próximo (config AED):**
- **Opciones reales de Grupos**: Estrategia/Prioridad/Voz/Tipo de cola/Capacidad/Tiempos siguen con
  valores **INVENTADOS** (placeholders). Cuando Rafa pase los reales, cambiarlos.
- **`iftaLabel` para `sc-inputnumber`**: pendiente si algún diseño lo pide.
- **Más pantallas config/AED 1:1**: si Rafa pasa más Figmas (Supervisor `Hjyy41…`), mismo patrón.
- Estados de agentes: el kebab (⋮) hoy elimina directo; si se quiere menú Editar/Eliminar, ampliar.

**Contexto para no perder (cómo está montado):**
- **Save arriba** = `TopBarSlotService.setActions(tpl)` desde cada página (viewChild `#topbarActions`
  + `afterNextRender` + `clearActions()` en `ngOnDestroy`). Patrón copiado de `agent-form-page`.
- **Color config (NO invertir)**: shell `:host` bg = `--sc-bg-secondary-subtle` (gray/50); cards =
  `--sc-bg-surface` (blanco); rail = panel gray/50 (blende, item activo chip navy + label bold).
- **iftaLabel**: `[iftaLabel]="true"` + `[label]` en el componente → label dentro (padding-top 21).
  Default `false`; los campos con label-encima del resto de la app NO cambian.
- **Dirty**: `pristine` signal + `dirty = computed(JSON.stringify(form)!==stringify(pristine))`; save
  fija `pristine = form`; cancel hace `form ← pristine`.
- Páginas: `apps/supervisor/src/app/features/config/aed/aed-{servicio,agentes,grupos}-page.*` + shell/
  sidebar en `config/layout/`. Datos = signals **mock** (sin backend). Ruta servicio = `/config/aed/servicio` rótulo "General".

---

## Estado al cerrar (Session 63, 2026-05-27) — densidad form 14px + badge Figma + página Escala ds-docs

Sesión muy interactiva (Rafa cazaba a ojo, se resolvía con dato). ~8 commits a `main`, todo verde.
Detalle en SESSION-LOG S63.

**Hecho:**
1. **Densidad form 14px** — raíz: PrimeNG hardcodea `font-size:1rem`; arreglado en los 7 wrappers
   con `--sc-font-size-200`. Guardarraíl `tokens:guard` Dura 3 (no form fields crudos). Footers de
   los 3 diálogos compartidos → small + gap 10.5. Padding form 31.5→28. Select extensión arreglado.
   customs-catalog §4.3/§4.4.
2. **Página ds-docs Foundations → Escala & Espaciado** (nueva): combobox `sc-select` filtro
   (dogfooding), lidera con `scale` → spacing en card, incluye negativos. Sin rem (confundía).
3. **Badge Figma** ("Solo fallidas"): diagnosticado + resuelto. Receta in-button = **FILL altura +
   padding-x `scale-0-375` (5.25) + radius pill** → botón 27.5, redondo, adapta. Demo en página "Flujos".

**Pendiente / decisiones tomadas:**
- **Badge NO se bakea** en el componente (decisión Rafa). Receta documentada arriba si se retoma.
- **Limpiar nodos de prueba** en Figma página "Flujos" (badges sueltos + botones de prueba) — Rafa
  no decidió aún si quitar o conservar como referencia. Trigger: cuando lo diga.
- Memorias nuevas: `reference_primeng_formfield_fontsize_hardcoded`, `reference_snowui_forms_inspiration`,
  `feedback_verify_tooling_before_creating`.

---

## Estado al cerrar (Session 62-ext-3, 2026-05-27) — pipeline completo (color+radios+preset) + consistencia flujos

Rafa: "extiende el pipeline a CADA componente y propaga al resto de flujos". Sparring clave:
el puente solo cubría la escala → poco trustworthy. Y "el arquitecto de DS eres tú" (caza el
drift con tooling, no con mi ojo). 1 commit a `main`, e2e 28/28. Detalle en SESSION-LOG S62-ext-3.

**Hecho (Bloque A — puente Figma→código ahora total + color vigilado):**
1. ✅ **§6 COLOR en `tokens:parity`** — el punto ciego que faltaba. Resuelve `--sc-*`→hex
   (light+dark) y cruza rampa primary + surface↔gray + content contra el export. Cazó 6 drifts
   (corregidos). Divergencias de marca allow-listadas. **Ahora la herramienta caza color, no mi ojo.**
2. ✅ **Radios generados** + `token-gen-scale.mjs`→**`token-gen.mjs`** (escala+radios). `tokens:scale`→`tokens:gen`.
3. ✅ **Preset por referencia** — `sc-preset.ts` usa `var(--sc-scale/radius/font-size-*)`, no px. La
   cascada llega a los componentes; re-export propaga sin teclear. Parity §4 = 37/37.
4. ✅ `tokens:import` reescribe escala+radios; docs (README/DECISIONS/customs) + pre-commit al día.

**Hecho (Bloque B — consistencia flujos, patrón editar-agente):**
- ✅ Botones topbar grupos/usuarios → `size="small"` (como agentes).
- ✅ Cards main-content **flat**: `sc-section-card` + `group-assignment-table` → gray-50 + radius-xl + sin
  sombra (panel embebido como el nav-trail). Validado a ojo + computado + e2e.

### 🎯 BATERÍA S63 — 1/2/3 hechos + consistencia UI; 4 espera Figma (S62-ext-3)
Prioridades: **paridad ABSOLUTA · consistencia al máximo · reducir deuda · customizar sin romper PrimeNG.**

**Extra consistencia UI hecho esta sesión (sin Figma — de componente):** acciones de form/modal
de Memory/config → `size="small"` (16 botones, CTAs de lista default). Chips de canal alineadas en
columna (gatbl+actbl, grid nombre-fijo + ellipsis). e2e 28/28 verde (cerrado el snow-clone de 4200).

1. ✅ **Guardarraíl anti-breakage** — `scripts/token-guard.mjs` (`npm run tokens:guard`, pre-commit):
   bloqueo duro `var(--p-*)` fuera de `sc-preset.ts` + `--sc-scale-*` en componentes (usar `--sc-spacing-*`).
   Migrados los 4 `--p-focus-ring-color` → `--sc-border-focus`. migration-safety.md regla #1 "por máquina".
2. ✅ **Paridad COLOR absoluta** — `tokens:parity §6` de 23→**43 colores enforce** (light+dark). Rampa de
   texto alineada al Kit (text-primary gray-800→700, secondary 600→500). Sin tokens nuevos (Rafa: no mintar
   aliases que no estén ya en preset/JSON) → borde de input gray-200 vs Kit gray-300 allow-listado (imperceptible).
3. ✅ **Auditoría 81 componentes (métricas)** — `npm run tokens:audit` (`scripts/component-audit.mjs`,
   solo-lectura): resuelve refs `{…}` de Aura + rem×14 + aplana camelCase→dot, cruza contra el export.
   **Resultado validado con datos: 655 coinciden, 0 drift accionable** (SC Prime = PrimeNG limpio en
   sizing → heredar Aura es correcto; el miedo a 81 gaps era infundado). Única divergencia conocida:
   accordion focus offset (no usado, allow-list). **PENDIENTE (parte color)**: el audit cubre MÉTRICAS;
   los 346 `componentColorScheme` no se cruzaron porque requieren resolver Aura+preset juntos (los colores
   los fijamos vía semantic, no per-componente) — la marca color ya la cubre parity §6 (43 enforce), pero
   un audit color per-componente (resolver el preset) queda como follow-up fino si se quiere 100%.
4. ⏳ **Propagar flat/gris** (Rafa: Memory + config) — **BLOQUEADO: necesita el Figma** de esas pantallas.
   Matiz descubierto: Memory usa MODALES (no flujos full-page) y config son pantallas de AJUSTES → el
   patrón editar-agente (índice+ficha+flush) NO mapea 1:1. Lo que SÍ aplica: aplanar paneles/cards de
   CONTENIDO a gray-50/flat. **OJO: los modales/overlays MANTIENEN sombra** (flotan, es correcto — no tocar).
   Intel del escaneo read-only (candidatos a aplanar, NO modales): `memory/components/conversation-table`,
   `memory/pages/rules`, `memory/pages/rule-builder`, `memory/components/multi-recording-player`,
   `config/sections/numeracion-especial`, `config/aed/aed-defaults-page`, `config/pages/sistema-page`.
   (~20 superficies `--sc-bg-surface` blancas en Memory/config = candidatas, a filtrar con el Figma.)
   El cambio global de `sc-section-card`→flat YA beneficia cualquier pantalla que lo use. Pedir a Rafa los links.

Objetivo permanente: **reducir deuda de diseño + consistencia**. Ver [[project_parity_consistency_north_star]].

---

## Estado al cerrar (Session 62-ext-2, 2026-05-27) — anti-drift tokens "para siempre" + índice 1:1 + thumbnails

Sesión larga, "adelante a todo con criterio". Mucho sparring de Rafa sobre **método**
(grabado en memoria): **datos > supuestos**, **inspección directa del Figma > captura a
ojo**, **docs sostenibles** (no logs centrales que se pudren). 1 commit a `main`.

**Hecho (detalle en SESSION-LOG S62-ext-2 + DD-10):**
1. ✅ **Comprobador ampliado** (`tokens:parity`): sizing **valor↔valor** (33 checks) en
   vez de regex con literal → ya no pasa drift silencioso. §5 nueva: code-only + vecino
   (regla redondeo).
2. ✅ **Generador/ley de escala** (`tokens:scale`): deriva canónico del export por `v/14`,
   verifica ley de nombres, `--emit`. **Decisión (DD-10): comprobador, NO generador que
   reescriba las capas** (invertía la arquitectura). Es el "para siempre" pedido.
3. ✅ **Escala formalizada** (README) + nota divergencia/flag 17.5-35 (customs §4).
4. 🟡 **SnowUI / flush**: índice de editar-agente fijado 1:1 (panel, era regresión por
   `[flush]`). `section-card flush` reconciliado (reservado). **Propagar a grupos/usuarios
   sigue Figma-gated** (no a ciegas).

**Extra de la sesión:** thumbnails ds-docs (`component-screenshots/` estaba vacío → 404)
regenerados **34/34** con `npm run ds-docs:screenshots` + arreglado bug `NG0201` en la
gallery delete-entity-dialog. Borrado `NEXT-SESSION-PROMPT.md` (obsoleto S36).

**Hechos también esta sesión (commits 2º–6º):**
- ✅ **#1 índice fiel a Figma** — modelo de color CORREGIDO: página blanca + paneles
  gris-50 (índice/ficha). Decisión Rafa: dejarlo sutil/fiel (no subir contraste).
- ✅ **#2 `tokens:parity`** ampliado a overlays + iconSize → **37/37**. Cubre TODO lo que
  el preset fija; el resto hereda Aura.
- ✅ **#3 pipeline import** `npm run tokens:import` (= `tokens:scale -- --write`): reescribe
  el bloque `--sc-scale-*` (marcadores `@sc-gen:scale`) desde el export. Puente Figma→
  código; la cascada propaga. SCOPED a la escala, idempotente. DD-10 addendum.
- ✅ **#4 frescura docs**: `NEXT-SESSION-PROMPT.md` borrado; DOCS-INDEX completo sin
  huérfanos; `prototype-reference` conservado (única copia portable).
- ✅ **Estandarización** grupos/usuarios al patrón editar-agente (flush en los 3 forms);
  `compact` muerto retirado. **Thumbnails ds-docs** 34/34 (captura mejorada) + bug NG0201.

### 🎯 PRÓXIMO (S63) — candidatos, Rafa dirige
- **Pipeline import — ¿extender a radius?** Hoy `tokens:import` cubre la escala (el mirror
  con derivación). Radius es set fijo de 6 (parity §2 lo cruza); generarlo es opcional.
- **Propagar SnowUI a más secciones/pantallas** — solo a referencia validada (no a ciegas).
- **Frescura docs (resto):** `apps/supervisor/docs/MEMORY.md`, audits — solo si Rafa quiere
  más poda. (prototype-reference ya resuelto: se conserva.)
- Objetivo permanente recordado: **reducir deuda de diseño + consistencia**.

## Estado al cerrar (Session 62-ext, 2026-05-27) — SnowUI 1:1 editar-agente + sizing preset

Sesión larguísima con dos hilos extra sobre la triple auditoría:

**1. editar-agente 1:1 con el Figma SnowUI** (nodo `12277-4185`). Tras un primer pase
"estructural" que canté como 1:1 sin serlo, Rafa lo revisó elemento a elemento y se
corrigió de verdad (medidas reales del nodo): buscador a la cabecera derecha (216×28),
panel blanco sobre página gris, chips estilo togglebutton, papelera 35×31, fila 48,
header 20/28, breadcrumb `›`, **button-small 27,5px exacto**. Commit `6885758`.

**2. Arreglo sistémico del preset (raíz del problema)**: `button.root.sm/lg` +
`formField.sm/lg` no estaban fijados → TODO lo "sm/lg" caía a defaults rem de Aura.
Añadidos 1:1 del export `tokensprime.json`. **PrimeNG SÍ lo soporta** (va bajo
`button.root.sm`); el gap era nuestro preset. Afecta a toda la app (baselines
regenerados).

**3 learnings grabados en memoria** (`feedback_figma_1to1_element_by_element`): (a) 1:1
= elemento a elemento con medidas reales, nunca a ojo; (b) no cantar "1:1" sin
verificar; (c) **no afirmar que PrimeNG/preset "no soporta X" ni que "falta Y" sin
contrastar contra la fuente** (me equivoqué 3× hoy: button.sm, negativos, "no se puede").

### 🎯 PRÓXIMO (lo "para siempre" anti-drift — Rafa lo pidió)

**✅ HECHO (commit `9d57eb6`, S62-ext):** pasos 1 y 2 ya cerrados.
- `tokensprime.json` guardado en `packages/design-system/tokens/` (fuente de verdad
  de métricas). Se extrajo verbatim del chat, no se reconstruyó a mano.
- `scripts/token-parity.mjs` (`npm run tokens:parity`) corre en pre-commit y reporta
  scale/radius/sizing + **mapa valor→token** (`5.25px → --sc-scale-0-375`). Verde:
  32 scales ↔ 35 `--sc-scale-*` (negativos incl.), radios OK, 6 checks sizing OK.
  Doc en `tokens/README.md` §"Figma parity". Memoria: `reference_token_parity_tool`.
- ⚠️ Rafa confirmó: `tokens:parity` **no es un token nuevo**, es un comprobador de
  solo lectura. Cero tokens creados al introducirlo.

**Pendiente real:**
1. **Auditar el resto de tokens de componente** del export (~600): hoy el script
   solo cubre scale/radius + button/formField sizing. Ampliar los `checks[]` a más
   componentes (inputs, overlays, etc.) según se vayan tocando.
2. **Pipeline import Kit Pro → tokens** (el arreglo estructural definitivo): generar
   las capas `--sc-*` DESDE el export → drift imposible por construcción. (El parity
   script es el detector; esto sería el generador.)
3. Formalizar la escala (Rafa lo dejó para "otra sesión").
4. Propagar el lenguaje SnowUI al resto de secciones del agente + group/user edit
   (con su Figma), y reconciliar customs §2.7 (la variante flush de section-card quedó
   sin uso al pasar la tabla a panel propio).

## Estado al cerrar (Session 62, 2026-05-26) — triple auditoría: COMPLETADA

Rafa delegó ("ejecuta plan sin preguntarme" + luego "consentimiento total" para
#62-67). Ejecutada la triple auditoría S60 entera. **6 commits a `main`** (detalle
en SESSION-LOG S62).

**Hecho y validado** (build/lint/i18n 1491×4/e2e 28-28/Playwright):
1. **Lucide-angular eliminado del repo** — `<sc-icon>` único proveedor (input `spin`,
   GitHub→SVG inline). #59/#60/#61.
2. **xlsx a carga diferida** — initial gzip **348→268 KB (−23%)**. La palanca del
   bundle era xlsx + PrimeNG, NO Lucide.
3. **Consistencia UX AED** — `more_vert` + bug i18n entidad en delete dialogs.
4. **Empty states unificados** a `<sc-empty-state>` (labels/templates/categories/
   rules + entities a11y). #64.
5. **Conversaciones**: estado "sin resultados" + andamiaje bulk-bar muerto fuera;
   bulk-bar inline se mantiene (diseño deliberado). #65.
6. **Toasts legibles**: constante `TOAST_LIFE` (success/info 4s·warn 5s·error 6s),
   45 toasts. #63.
7. **CSS muerto**: 41 selectores `lucide-icon`→`sc-icon`. #62.

**Aparcado conscientemente (sparring, con trigger anotado)**:
- **#66 god-components** (agent-form 981 líneas…): partir sin trigger funcional
  contradice la DD del repo → se parte al añadir feature, no proactivamente.
- **#67 self-host font Material**: tarea de pre-producción (subset woff2). Trigger:
  "vamos a producción".

> Bundle: el exceso restante de budget (581 KB) es PrimeNG — no atacable sin
> trade-offs estructurales. Sin más deuda abierta de la triple auditoría.

### Próximo arranque (S63) — sin tarea forzada

La triple auditoría queda cerrada. Candidatos cuando Rafa dirija:
- Dirección estratégica vigente: **SCDS completo a Figma con flujos conectados**
  (ver más abajo, memoria `project_figma_flujos_objetivo_final`).
- Pendientes funcionales dormidos: Help popover toolbar `/conversaciones` (#23),
  spec session equipo diseño (dossier S56), items Memory §10 (esperan backend).

## Estado al cerrar (Session 61, 2026-05-26) — iconos Figma (desvío, 0 código)

Sesión 100% Figma, **sin cambios de repo**. Rafa peleaba con tamaños de icono en
el Kit Pro; se diagnosticó y arregló de raíz (detalle en SESSION-LOG S61 +
memoria `project_figma_iconset_icon_scale_fix`):
- Librería `Smart-Contact-Icons`: **10.610 iconos `MIN/MIN` → `SCALE`** + Rafa
  publicó → escalan en toda la app. Material es "a sangre" (se ve ~1.6× mayor que
  PrimeIcons a igual px) → al migrar, ponerlo a ~60-65% del px viejo.
- **IconSet** explorado y **descartado** (andamiaje de diseño; el código ya lo
  cubre con `<sc-icon>`). El "patrón B" es raro (el kit usa variantes Size en el
  master, ej. Select). Único caso InputNumber → arreglado en local.

> ✅ La **triple auditoría** que quedó en cola aquí se **completó en S62** (ver
> bloque de arriba). Solo #66/#67 aparcados conscientemente con trigger.

## Estado al cerrar (Session 60, 2026-05-25) — todo-arriba + la ficha + iconos Material → MERGED

Sesión maratón. Todo el experimento consolidado y **mergeado a `main`** (PR #49):

- **Modelo "todo arriba"** (listas + forms) + **la ficha** (resumen identidad
  solo-lectura en el panel de los 3 forms) cerrando la regresión de contexto.
  Índice **por modo**: crear=identidad-primero, editar=identidad-abajo (la ficha
  da el contexto). Eliminar discreto al pie. Rollback en Supervisor **DD#65**
  ("revierte el modelo todo-arriba" + receta).
- **Iconos Lucide → Material Symbols** vía wrapper SCDS `<sc-icon>` (~140
  ficheros, 4 áreas en paralelo + sistema NAV_ICONS). Contratos SCDS `[icon]`
  → string. Excepciones en Lucide: **GitHub** (marca, sin glifo Material) +
  **Loader2** (spinner animado). Font Material Symbols en index.html de
  supervisor + ds-docs. Fix circular **NG0919** (import relativo del IconComponent
  en componentes SCDS).
- **Salud**: build supervisor + ds-docs · lint · i18n (1488×4) · **9/9 smoke** ·
  runtime 0 errores · ~50 `<sc-icon>`/pantalla. Validado en :4300 (el :4200
  estaba ocupado por un clon de SnowUI en `~/Downloads` — gotcha de entorno).

### 🎯 PRÓXIMO: triple auditoría (pedido Rafa S60)

Tras la consolidación, atacar con plan grande (sin escatimar):
1. **Auditoría de consistencia UX** — flujos AED + Memory, patrones repetidos,
   inconsistencias de interacción/copy/jerarquía tras todo-arriba + Material.
2. **Auditoría de optimización de código** — bundle (hoy >1.6MB, sobre budget),
   god-components (conversation-player-modal 476 líneas), dead code, lazy loading,
   `lucide-angular` (¿quitable del bundle? quedan 8 keepers Loader2/GitHub).
3. **Auditoría del design system** — `<sc-icon>` a customs-catalog, escalas de
   iconos Material, los 2 Trash2 residuales en Lucide (entity-form, rule-builder),
   tokens pendientes, deuda `inconsistencies-backlog`.

Output por auditoría: findings con severidad + plan de acción ejecutable.

---

## Estado al cerrar (Session 58, 2026-05-21)

Sesión maratón con 7 bloques cerrados en main + 4 en branch experiment.
Hito operativo: instalación skills Leonxlnx/taste-skill + branch experimentación
aislada. Memoria nueva `feedback_skills_usage_s58` documenta usage.

**Main producción (2 commits)**:
- `acddb29` — bloques B (audit cross-language), C (audit legacy buscar oro),
  D (modal Kit Pro audit), F (DTCG export sc-tokens.json), G (lightbox
  thumbnails ds-docs home).
- `a3f51ee` — Urbanist 500+600 para títulos display ds-docs (scoped, no AED).

**Branch experiment/beyondui-patterns (5 commits)**:
- `094d2ba` taste-skill install
- `c257631` empty trigger Netlify
- `f64ab1e` Urbanist global + chips badges
- `583faac` Urbanist scoped ds-docs + chips badges
- `213ec45` SaaS dashboard moderno /conversaciones (reintento post-Vogue)

**Operativa nueva**:
- Netlify upgrade a paid €9/mo (free tier agotado S57). Branch deploys
  activos en ambos sites — `experiment-*--<site>.netlify.app`.
- MCP Figma autenticado (`plugin:figma:figma` + `figma` console-mcp). Acceso
  a Kit Pro Variables + componentes via REST API.
- Skills `Leonxlnx/taste-skill` paquete instalado en branch (12 skills en
  `.agents/skills/`).

**Estado salud**: tsc/lint/build/husky/i18n verde. Playwright 28/28 verde.
Backlog updates: #55 (audit cross-language) + #56 (`<sc-confirmpopup>` gap
reservado). Memory inventory #23 (Help popover toolbar).

---

## 🎯 Bloques S59+ (priorizados — main es PRIORIDAD)

> Rafa S58 ratificó: experimentación visual es SECUNDARIA. El proyecto main
> tiene la prioridad. Branch experiment se ataca SOLO cuando hay tiempo libre
> tras cerrar lo de main.

### Main · Pendientes funcionales

**Help popover toolbar `/conversaciones`** (entry inventory #23, P2):
- Patrón legacy React con 4 enlaces documentación (Calculator/Palette tier-1 +
  BookOpen/ExternalLink tier-2). Trigger: UX research valida discoverability
  docs O onboarding stakeholders nuevos.
- Implementación estimada: 1h (`<p-popover>` + 4 botones + URLs actualizadas
  post-monorepo).

**Spec session equipo diseño** (dossier S56 preparado, intacto):
- 6 items dormidos (#14 sc-search clear X, #15 variants formales, #37 form
  variants, #33 escala `.page__inner` max-width, #49-ext shadows, #50-ext
  durations). Cuando Rafa convoque, copy-paste dossier desde chat S56.

**Próximo audit token sweep**:
- Cuando equipo diseño exporte nueva versión `design-tokens.json` del Kit Pro,
  reabrir audit cruzado vs SCDS. Flujo S54+S58 establecido.

**Backlog deuda SCDS sin trigger reciente**:
- #6 `<sc-data-table>` / #7 `<sc-select-button>` / #8 `<sc-tag>` — sin consumer
  real, DD-4 estricto, NO atacar proactivamente.
- #56 `<sc-confirmpopup>` (S58) — reservado, sin trigger.
- §10 Memory items #5/#6/#7/#9 (dispatch real backend) — esperar pipeline IA
  real.

### Branch experiment · solo si hay tiempo

**Re-evaluar /conversaciones SaaS dashboard moderno**:
- Preview live en `experiment-beyondui-patterns--aedmigration.netlify.app/
  conversaciones` (commit `213ec45`).
- Si Rafa lo ve y le gusta dirección: posibles next steps cuando se retome:
  - Conversation table redesign con status dots prominentes
  - Bulk modal layout más editorial (sin caer en Vogue)
  - Player modal redesign
- Memoria `feedback_skills_usage_s58`: regla "validar con `ui-ux-pro-max`
  ANTES de codear" + "rediseños grandes en branch, no main".

**Si experimento no cuaja**: branch experiment se mantiene en GitHub como
referencia visual, pero NO se mergea. Drop merge button hasta que la
dirección sea clara.

### Dirección estratégica vigente

**Llevar SCDS completo a Figma con flujos conectados** (memoria
`project_figma_flujos_objetivo_final`):
- Tokens 1:1 ✅ post-S57 (refactor estructural primitive).
- Componentes paridad documentada (MIGRATION-INVENTORY).
- Flujos AED + Memory prototypados en Figma (acción equipo diseño).
- Code Connect oficial (memoria `feedback_code_connect_dormant`) dormido —
  trigger pending.

---

## Cómo arrancar S59

1. Leer este doc + entry S58 en [`SESSION-LOG.md`](./SESSION-LOG.md).
2. **Foco main**, no experiment (Rafa S58 ratificó).
3. Si Rafa pide trabajo en branch experiment → primero `ui-ux-pro-max
   --design-system` query para validar dirección visual ANTES de codear
   (memoria `feedback_skills_usage_s58`).
4. Si Rafa pasa screenshots referencia visual → usar como ground truth, NO
   derivar de descripción solo.
5. Playwright cross-app por inercia tras sweeps grandes (memoria
   `feedback_playwright_cross_app_inertia`).

---

## Estado al cerrar (Session 57, 2026-05-21)

Sesión grande con refactor estructural primitive layer SCDS → Kit Pro
1:1. Critical sparring del user 2 veces guió la dirección (matrix
"hablar el mismo idioma"). 5 commits a `main`.

- **SCDS bypass Memory** (`a75469d`) — backlog #53 cerrado. 11 hits
  `<p-toggleswitch>` + `<p-select>` directos → wrappers SCDS. Wrappers
  extendidos aditivamente con `[inputId]` y `[appendTo]` opcionales.
- **Tokenización font-size/line-height exact-match** (`dc9b5b2`) —
  backlog #54 + customs §5.8. 16 hits wrappers SCDS tokenizados.
  z-index local stacking documentado como legítimo.
- **Convergencia spacing scale Kit Pro 1:1** (`cf7d7fc`) — ~1127 hits
  en 127 archivos. Naming SCDS `--sc-spacing-50/100/.../900` →
  `--sc-spacing-0-25/0-5/.../5` + 10 tokens missing añadidos.
- **Refactor estructural primitive** (`af324f8`) — UNA escala
  `--sc-scale-*` (34 valores Kit Pro) sirve a font-size/padding/
  icon-size. `--sc-radius-*` escala dedicada Kit Pro 1:1. Semantic
  aliases preservan API pública.
- **ds-docs v2.0** (`ce53cf7`) — banner v2.0 en home + página
  `/whats-new-v2` editorial release notes. Skill `design-taste-frontend`
  usado para diseño página.

**Diálogo crítico BeyondUI** (sin código): user pasó 3 screenshots
(Companies CRM + Clinical Notes list + Add New Note wizard). 3 patterns
identificados atacables sin comprar kit. UX bug del wizard (back
duplicado) registrado para audit S58.

**Estado salud**: tsc / lint / build supervisor / build ds-docs /
husky / i18n: verde. Playwright cross-app **28/28 verde**.

---

## 🎯 Bloques S58 (batería grande — priorizar al arrancar)

> Rafa avisó: S58 será sesión con batería grande. Mezcla 5 frentes:
> branch experimentación + audit catalog cross-language + audit legacy
> flujos para encontrar "oro" perdido + bloque modal + objetivo final
> llevarlo todo a Figma con flujos conectados.

### Bloque A · Branch experimentación BeyondUI + Netlify previews

**Objetivo**: aislar experimentos BeyondUI sin tocar main + URL preview
compartible.

**Plan operacional**:
1. Crear branch `experiment/beyondui-patterns` desde main reciente.
2. Push branch placeholder a origin.
3. Rafa activa branch deploys en Netlify dashboard UI (manual):
   - Cada site (`aedmigration` + `ds-smartcontact`) →
     Settings → Build & deploy → Continuous deployment → Branches
   - Cambiar "Deploy only production" → "Let me add individual branches"
   - Añadir `experiment/beyondui-patterns` (o glob `experiment/*`)
4. URLs preview automáticas tras push:
   - `https://experiment-beyondui-patterns--aedmigration.netlify.app`
   - `https://experiment-beyondui-patterns--ds-smartcontact.netlify.app`

**Posible skill**: Rafa mencionó https://www.tasteskill.dev/ →
`npx skills add Leonxlnx/taste-skill` para experimentación visual.
Evaluar si aporta vs `design-taste-frontend` ya disponible.

### Bloque B · Audit customs-catalog cross-language (más desalineaciones tipo spacing→scale)

**Objetivo**: el refactor S57 cerró spacing/scale + radius naming Kit Pro
1:1. Hay que verificar que NO quedan más desalineaciones de naming/
estructura entre SCDS y Kit Pro Variables.

**Verificar**:
- `aura/semantic.form.field.*` vs SCDS `formField.*` (sc-preset)
- `aura/semantic.overlay.*` vs SCDS overlay tokens
- `aura/semantic.text.*` vs SCDS text tokens
- `aura/semantic.surface.*` vs SCDS surface tokens
- `aura/semantic.focus.ring.*` vs SCDS focus tokens
- `aura/semantic.disabled.opacity` vs SCDS disabled

Si hay divergencias estructurales: documentar en customs-catalog +
proponer convergencia o decisión consciente brand.

### Bloque C · Audit legacy flujos AED + Memory ("buscar oro")

**Objetivo**: Rafa cree que hay funcionalidades en los prototipos
originales (legacy React Memory + posiblemente AED viejo) que se
quedaron sin portar y "podrían ser oro" — features útiles olvidadas
en la migración.

**Plan**:
1. Inventariar flujos AED actuales vs React legacy original (si existe).
2. Inventariar Memory prototipo React vs Memory Angular actual.
3. Por cada flujo: comparar features prototipo vs implementación →
   gaps documentados → priorización.
4. Output: lista findings con severidad + propuesta acción.

Memoria `feedback_memory_docs_complete_set` aplica: leer TODOS los
docs Memory (no solo `/docs/`) — README, guidelines, audit/,
memory-archive/, .impeccable.md.

### Bloque D · Modal — Rafa explayará al arrancar S58

**Objetivo**: Rafa pidió **AVISO al arrancar S58**: tiene preocupación
sobre el modal SCDS. Quiere explayarse al detalle entonces.

**Acción obligatoria al arrancar S58**: en algún bloque mientras se
trabaja, Claude DEBE preguntar a Rafa "cuéntame lo del modal" para
que se explaye.

Contexto técnico actual: `<sc-dialog>` SCDS wrapper de `<p-dialog>`
PrimeNG (rename S47). Tokens `--sc-dialog-*` audited S30. 6+ consumers
AED + Memory.

### Bloque E · Llevar todo a Figma (objetivo final)

**Objetivo**: el objetivo final del trabajo S57 + S58 es **llevar SCDS
completo a Figma con flujos definidos**. Conectar:
- Tokens SCDS ↔ Figma SC Kit Pro Variables (1:1 post-S57)
- Componentes SCDS ↔ Figma `❖` components (paridad documentada)
- Flujos AED + Memory ↔ Figma frames + prototyping

Trigger Code Connect (memoria `feedback_code_connect_dormant`): si
prod adopta SCDS + wrappers existen en codebase prod + dev prod
consume DS desde Figma → activar setup.

Para S58 esto es **dirección estratégica**, no bloque ejecutable
directo. Cada bloque A-D suma a este objetivo.

### Bloque F · JSON export sc-tokens.json DTCG (S57 pending)

**Objetivo**: script export 7 capas CSS → JSON formato Design Tokens
Community Group (DTCG). Pending del S57 cierre.

**Plan**:
1. Crear `scripts/export-sc-tokens.mjs` que parsea
   `packages/design-system/tokens/layers/*.css`.
2. Resolver aliases (`var(--sc-scale-X)` → valor real).
3. Output `apps/ds-docs/src/assets/sc-tokens.json` formato DTCG.
4. Activar botón download en home + whats-new-v2.

Trigger consumer: el JSON es para devs (no Figma) — terceras apps,
Memory active futuro, case study showcase.

---

## Estado al cerrar (Session 56, 2026-05-21)

Sesión doble bloque tras critical-sparring de menu S56+ (la mayoría
"esperar trigger"). User eligió A+B cascada: dossier diseño preparation
+ visual regression expansion. 1 commit a `main` + dossier en chat.

- **A** Dossier spec session equipo de diseño entregado en chat (no md
  por memoria `feedback_no_audit_docs`). 6 items vivos: #14 sc-search
  clear icon X · #15 sc-search variants formales sm/md/lg · #37 5
  wrappers form variants · #33 `.page__inner` escala max-width canonical
  · #49-ext apetito shadows · #50-ext apetito duration Figma Variables.
  Por item: contexto + casos reales + 3 opciones + recomendación.
  Coste sesión equipo: ~4-5h Figma + 1h decisión. Listo para copy-paste
  cuando Rafa convoque.
- **B** Visual regression 8→14 baselines (commit `0ebb7ca`). 3 screens
  nuevos × 2 themes: memory-conversaciones (stitched-card), config-
  sistema (settings cards), ds-docs-home (tracker thumbnails). agent-
  form-page NO añadido (verificado: aed-agentes-edit ya cubre
  Identificación default).

**Estado salud**: tsc/lint/build/husky/i18n verde · Playwright cross-app
**28/28 verde** (14 smoke + 14 visual regression).

---

## 🎯 Bloques S57+ (priorizados)

### Convocar spec session equipo de diseño (acción Rafa)

Dossier S56 listo en chat. Cuando Rafa convoque sesión con el equipo, 6
items dormidos cierran de una vez:
- #14, #15, #37 (Figma variants/icons en Kit Pro)
- #33 (`.page__inner` escala canonical max-width — desbloquea promoción
  partial SCDS)
- #49-ext, #50-ext (apetitos shadows/duration cuando aparezca 2º consumer
  o Figma evolucione)

Decisiones esperadas del equipo desbloquean ~5h adicionales de trabajo
SCDS post-sesión (implementación + customs-catalog updates).

### Expandir visual regression baseline (próxima ola)

14 baselines hoy cubren AED list/form + Memory × 2 chromes + Settings +
ds-docs home/gallery. Candidatos próxima expansión:
- `rule-builder-page` (Memory complex form chrome — multi-section).
- `agent-form-page` con sección Grupos activa (form chrome alt-section).
- AED `repos` list (única página con max-width 960 bucket distinto).

Trigger: tras sweep estructural >10 archivos SCDS o cambio mayor tokens.

### Backlog #6 / #7 / #8 (sc-data-table / sc-select-button / sc-tag)

Sin consumer real. DD-4 estricto. NO atacar proactivamente.

### Próximo audit token sweep

Cuando el equipo pase versión actualizada de `tokensprime.json`, reabrir
audit cruzado vs SCDS (flujo S54 establecido).

---

## Estado al cerrar (Session 55, 2026-05-21)

Marathon A+B+C+D+E+F (6 bloques cascada) tras "adelante A B C D E F en
bloques masivos sin problema". 5 commits a `main` + 1 audit no-op (F).
Critical-sparring aplicado al arrancar (matrix ROI vs riesgo) + push-back
en D (mutó a promoción partials DD-4 que entregó valor real).

- **E** Visual regression baseline Playwright `toHaveScreenshot()`:
  4 screens × 2 themes = 8 baselines deterministas. Red de seguridad
  pixel-diff para detectar drift visual silencioso.
- **C** Backlog #49 shadow + #50 duration ✅ cerrados sin token nuevo
  (DD-7 + memoria migration_safety). Sweep drift 5 hits + convención
  documentada en customs-catalog §5.8.
- **A** 10 thumbnails tracker contextuales nuevos: form-page nav click
  para activar @switch sección Identificación, URLs config corregidas,
  trigger pre-waitFor para overlays, tabs → ds-docs gallery.
- **B** Audit atajos teclado vs React legacy: hipótesis "perdidos en
  migración" FALSA. Angular cubre TODOS + añade 5 globales. DD#64 nuevo
  con coverage matrix completa.
- **F** Audit obsoletos comments/TODO: codebase exceptionally clean,
  zero cleanup necesario.
- **D** `.table-card` promovido a SCDS partial — backlog #32 ✅ cerrado
  (7 consumers cruzaron trigger ≥5). `.page__inner` NO promovido (drift
  max-width 5 buckets intencional descubierto, requiere spec session).

**Estado salud**: tsc/lint/build/husky/i18n verde · Playwright cross-app
22/22 verde (14 smoke + 8 visual regression).

---

## 🎯 Bloques S56+ (priorizados)

### Expandir visual regression baseline (cuando ROI exista)

Hoy 4 screens × 2 themes = 8 baselines cubren list-page chrome canonical.
Candidatos S56+:
- `agent-form-page` con sección Identificación activa (form chrome canonical).
- `memory/conversaciones` con tabla cargada (Memory list chrome con stitched-card).
- `config/sistema` (settings cards) — para detectar drift en cards.
- ds-docs `home` (tracker thumbnails contextual) — para detectar drift en home.

Trigger: tras sweep estructural >10 archivos SCDS o cambio mayor de tokens.

### Backlog #33 `.page__inner` consolidación

Drift max-width 5 buckets descubierto S55 (960/1200/1400/1600/832 según
tipo página). Acción equipo de diseño: spec session escala canonical
max-width (e.g., narrow/default/wide/full + form/dashboard). Sin esa
decisión, NO promover.

### Backlog #6 / #7 / #8 (sc-data-table / sc-select-button / sc-tag)

Sin consumer real. DD-4 estricto. NO atacar proactivamente.

### Spec session equipo de diseño (paquete dossier)

Acumulado desde S47-ext: 8 items "Diseño dependent" del backlog. S55
añade 2 más:
- #49 shadows (apetito por `--sc-shadow-sticky-footer-top` + `drag-hover`
  cuando aparezca 2º consumer respectivo).
- #50 durations (apetito por escala duration en Figma Variables).

Coste sesión equipo: ~1h + 30 min preparando dossier. Ruta limpia para
cerrar items dormidos por dependencia diseño.

### Próximo audit token sweep

Cuando equipo de diseño pase versión actualizada de `tokensprime.json`,
reabrir audit cruzado vs SCDS (flujo S54 establecido).

---

## Estado al cerrar (Session 54, 2026-05-21)

Maratón con 6 commits a `main`. Bloques A/B/C/D/E/F cerrados; G postpone
S55 con scope; H este doc.

- **A** Atajos teclado: `/` focus search · ⌘S al panel · ⌘Z re-añadido
  tras audit · util `is-typing-target` extraído.
- **C** Tokens primitive alineados PrimeOne 4.0 vía `tokensprime.json`
  oficial: gray slate · violet Tailwind · 8 tokens icon-size · 2 focus-
  ring · spacing aditiva → decimal multiplicativa base 14 · idem
  font-size + line-height. Naming SCDS conservado, valores cambiados.
- **D** UndoStackService completo YA existía (S46 DD#18) con presence +
  bulk update integrado. Falla mía de audit detectada, revertida.
- **E** Memory §10: #4 modal Download → blob JSON real (no solo toast)
  · #5/#6/#7 verificados ya implementados pre-S54 · #9 estado mixto
  documentado (botón "Ver fallidas" aplazado sin trigger).
- **F** Roadmap entry §10 #22 "Parar procesamiento IA" anotado.
- **G** Thumbnails contextuales tracker — postpone, ver §"Bloques S55+"
  abajo.

**Estado salud**: tsc/lint/build verdes · Playwright cross-app 14/14
verde (corrido 6× en la maratón) · i18n 1488 paths × 4 locales.

---

## 🎯 Bloques S55+ (priorizados)

### G · Thumbnails contextuales tracker (postponed S54)

**Qué es**: hoy los 34 PNG del tracker home ds-docs muestran cada
componente SCDS **aislado sobre fondo neutro** (showcase gallery).
Rafa pidió en S54 que pasen a mostrar el componente **en uso real
dentro de AED o Memory** — evidencia visual que el sistema vive en
producto.

**Por qué se aplaza**: 2-3h serio. Requiere:
1. Mapping manual de los 34 componentes → pantalla representativa
   AED/Memory donde se ve cada uno.
2. Selector CSS específico para cada uno (crop centrado 160×80).
3. Criterio placeholder para componentes sin consumer real (Rafa
   confirmó: opción B "Sin consumer real todavía" — refuerza presión
   sana para promover, delata gaps reales del SCDS).
4. Script Playwright que navegue + crop + genere los 34 PNG con
   `addStyleTag` para ocultar chrome.

**Decisiones tomadas S54**:
- Crop centrado (b), una representativa por componente, placeholder
  para gaps, generar local con Playwright.

**Coste de NO hacerlo**: cero — los thumbnails actuales son útiles
como showcase. Es upgrade, no critical.

### SCDS deuda pendiente (sin trigger reciente)

- §10 #8 eyebrow refactor `sc-dialog` — esperar ≥2 consumers que
  pidan eyebrow en sus dialogs.
- §10 #11 DataExportImport JSON config Memory — esperar caso real
  migración bulk.
- §10 #22 parar procesamiento IA — esperar pipeline backend real con
  AbortController.
- 7 SCDS gaps consumers `inconsistencies-backlog`:
  #2 `inline-rename-cell` segundo consumer, #4 `label-chip` declinado,
  #6 `<sc-data-table>`, #7 `<sc-select-button>`, #8 `<sc-tag>`,
  #32 `.table-card` partial (5º consumer), #33 `.page__inner` partial
  (9º consumer).
- 8 SCDS Figma-dependent `inconsistencies-backlog`:
  #14/#15 `sc-search` variants Figma, #37 form variants sm/md/lg,
  #44/#45 off-scale spacing/radius (probablemente cierran con la
  migración decimal S54 — auditar en S55 si quedan hits residuales),
  #48 icon-size literales Lucide (208 hits — tokens C3 ya disponibles
  pero migración mecánica pendiente), #49 box-shadow custom, #50
  duration tokens.

### Próximo audit token sweep

Cuando el equipo de diseño pase una versión actualizada de
`tokensprime.json` (export Figma Variables del Kit Pro), reabrir
audit cruzado vs SCDS para detectar nuevas divergencias. La S54
estableció el flujo: Rafa pasa el JSON, Claude cruza con `01-primitive.css`,
report en chat, decisiones puntuales.

### BeyondUI

Sin acción inmediata. Rafa argumentó válidamente (settings/dashboard
NO son solo marketing — encajan en monitorización futura Supervisor).
Decisión cierre: NO comprar el kit; cuando llegue pantalla concreta
(monitorización Supervisor, settings rico), Rafa pasa screenshots como
referencia, implementamos con PrimeNG + SCDS sin importar nada del kit.

---

## Estado al cerrar (Session 53.5, 2026-05-21)

Iter de polish post-S53 (commit `a1e6bba`). 5 pedidos del user
ejecutados en un commit:

- Thumbnails 160×80 en cada fila del tracker home ds-docs, linkando
  a la gallery (PNG renombrados slug-based + asset config sin
  duplicar archivos).
- Menú contextual click-derecho en filas Memory con 2 acciones
  dinámicas (Procesar / Analizar) + Marcar como leída solo si la
  fila está en rojo. Espejo del patrón AED labels/agents/groups.
- Toolbar conversations: icono ayuda eliminado, botón Marcar
  leídas solo visible si hay filas fallidas.
- Header `<sc-sticky-form-header>` con más espacio (padding 20px,
  gaps de chunks 20px, gap interior 10px). Propaga a los 7
  consumers SCDS.

**Estado salud**: tsc / lint / build verdes · Playwright cross-app
14/14 verde (40.9s) · i18n 1487 paths × 4 locales · husky pre-commit
con prettier + i18n-audit + lint.

---

## 🎯 Briefing S54 — Preguntas pendientes del user (leer al arrancar)

> Rafa pidió al cerrar S53.5 que la próxima sesión arranque con
> respuestas llanas (no jargon, no soy dev) para 2 grandes bloques:
>
> 1. **Cómo atacar los items dormidos por falta de trigger** — 4
>    grupos con implicaciones y caminos viables.
> 2. **Comprar BeyondUI Figma kit (beyondui.design): ¿ortogonal al
>    enfoque actual o conflicto?**
>
> Toda la sección siguiente está escrita en plano para que la lea
> antes de empezar a tocar código.

---

### Bloque 1 · Items dormidos — cómo atacarlos y qué implica

#### Grupo A · Memory §10 #3-#11 + §11 A · esperan dispatch backend / Figma input

**Qué son**: la lista en [`memory-migration-inventory.md §10`](./memory-migration-inventory.md)
recoge funcionalidades del prototipo React Memory que decidimos
NO implementar todavía durante la migración a Angular. Cada una
tiene un trigger explícito para reabrirla.

Los 9 vivos hoy:
- **#3 `<sc-audio-player>` como wrapper SCDS** — un player de
  audio reutilizable. Pendiente porque (1) no hay segundo
  consumer fuera de Memory (regla del DS: 2+ consumers antes
  de promover) y (2) el equipo de diseño no ha entregado spec
  Figma del player.
- **#4 Modal Download GDPR real** — la modal con checkboxes ya
  está cocinada (S47), pero el botón solo enseña un toast porque
  no hay endpoint real de descarga. Espera backend.
- **#5 Sticky toast persistente "Generando…"** — el toast que
  acompaña al procesamiento masivo, que se queda en pantalla
  hasta que el batch termine y se actualiza in-place. Necesita
  pipeline real de procesamiento (hoy es mock síncrono).
- **#6 Hint "Excluye N en proceso"** en el bulk modal — solo
  tiene sentido cuando hay un dispatch real que mantiene IDs
  en estado "procesando".
- **#7 Hint multi-tramo** — separar contadores por tramo de
  llamada vs por conversación. Necesita dispatcher que distinga
  los dos niveles.
- **#8 Eyebrow "ACCIÓN MASIVA"** en el header del bulk modal —
  pequeña etiqueta encima del título. Pendiente porque tocar
  el `sc-dialog` SCDS por una sola línea cosmética sería sobre-
  ingeniería; espera un segundo consumer que pida lo mismo.
- **#9 Toast de error + chip "Solo fallidas"** — el flujo cuando
  el dispatch real responde con errores parciales. Sin backend
  real no hay errores que tratar.
- **#11 DataExportImport JSON config Memory** — pantalla del
  prototipo para exportar/importar la config Memory completa
  (reglas + categorías + entidades) en JSON. Espera caso real
  de migración bulk entre instancias.
- **§11 A · Filtrado de filas en proceso (decisión doc canonical)** —
  hay 2 docs Memory con interpretaciones distintas. Hoy seguimos
  una; cuando el dispatch sea real, el equipo decide cuál gana.

**Cómo atacar (caminos viables)**:
- **Camino mock (corto, riesgo bajo)**: en vez de esperar backend
  real, simular el pipeline completo con `setTimeout` y un set
  de IDs in-flight, así pintamos toasts persistentes, errores,
  hints multi-tramo, etc. Pros: avanzamos UX completa, el usuario
  ve cómo se siente el sistema en producción. Contras: pega
  espuma sobre un mock — cuando llegue backend real puede no
  comportarse igual y habrá que re-tocar. Estimación: 1-2
  sesiones para mocks #5/#6/#7/#9.
- **Camino "esperar backend" (largo, riesgo nulo)**: dejarlo
  todo dormido hasta que haya endpoint real. Pros: 0 trabajo
  tirado. Contras: la UX queda incompleta visiblemente.
- **Camino híbrido (recomendado, respeta filosofía)**: simular
  SOLO los hints sin estado persistido (#6/#7 fáciles, son
  derivados de `processingIds`), dejar dormidos los que
  requieren mecanismo nuevo (#5 sticky toast con update
  in-place, #9 chip permanente "Solo fallidas"). Estimación:
  30-45 min, gana 2 hints útiles del COA Memory sin sobre-
  ingeniería.

**Implicaciones**: cualquier camino mock tiene que documentarse
en el doc canónico (§11 A) para que cuando llegue backend real
la decisión esté tomada. **El equipo de diseño puede no haber
escrito spec Figma del audio player todavía**: confirmar antes
de meternos con #3.

**Filosofía respetada**: regla "no devaluar lo ya hecho" — el
trabajo S46 cerró #1 (re-transcribir desde player), #2 (multi-
recording player). Antes de tocar #3-#11, leer §10 entero por
si algo más cerró por inercia de otros iters.

#### Grupo B · SCDS 7 gaps consumers · DD-4 requiere ≥N consumers

**Qué son**: en [`packages/design-system/docs/inconsistencies-backlog.md`](../packages/design-system/docs/inconsistencies-backlog.md)
hay 7 componentes que están documentados como "falta este
wrapper SCDS" pero no se han cocinado porque solo hay 1 consumer
(o cero). La regla DD-4 dice: 2+ consumers antes de promover
algo al SCDS, si no es trabajo en vacío.

Los 7:
- **#2 `<sc-inline-rename-cell>`** — celda editable inline ya
  existe en AED. Si Memory u otra feature la usa, se promueve.
- **#4 `<sc-label-chip>`** — gap declinado conscientemente
  (S32) porque modelar el chip de color custom dentro de
  PrimeNG complicaría más que mantener el actual. Probable
  que se quede como Pure SC para siempre.
- **#6 `<sc-data-table>`** — wrapper de tabla densa Memory.
  Hoy hay 1 consumer (Memory `/conversaciones`). Cuando AED
  refactorice alguna list-page a la densidad Memory, se
  promueve.
- **#7 `<sc-select-button>`** — chips segmented toggle (estilo
  iOS Settings). Sin caso real todavía.
- **#8 `<sc-tag>`** — etiquetas severity-style (success/warn/
  danger). NO confundir con label-chip. Sin caso real.
- **#32 `.table-card` + `.table` chrome partial SCDS** — el
  border + radius + thead background. Patrón duplicado en 4
  consumers (3 AED + Memory). Trigger: 5º consumer.
- **#33 `.page` + `.page__inner` chrome partial SCDS** — el
  wrapper de página con max-width + padding. Duplicado en 8
  consumers. Trigger: 9º consumer.

**Cómo atacar**:
- **No atacar proactivamente** — DD-4 es regla. Si forzamos
  promoción ahora cocinamos componentes "por si acaso" que
  pueden quedar mal diseñados (sin caso real que los valide).
- **Reaccionar cuando aparezca el consumer**: cuando Memory
  necesite editar inline (no parece próximo) o AED rediseñe
  una list-page con densidad Memory, ahí se evalúa la promoción.
- **#32/#33 son partial SCSS, no componentes** — el coste de
  promoverlos es bajo (1 archivo `.scss` shared). Cuando el
  trigger se cumpla, ataque en 1 sesión.

**Implicaciones**: si Rafa quiere un componente "porque sí lo
veo útil", chequear primero cuántos consumers hay reales. Si
es 0-1, **NO cocinar** — la deuda no es real todavía.

**Filosofía respetada**: DD-4 + memoria `feedback_minimal_customization`
+ regla "trigger real o nada" del package CLAUDE.md.

#### Grupo C · SCDS 8 Figma-dependent · "no inventar tokens"

**Qué son**: 8 items que requieren input del equipo de diseño
en Figma antes de tocar código. Inventar tokens sin spec del
Kit Pro es regla NO violar (memoria `feedback_figma_specs_thorough`).

Los 8:
- **#14 `sc-search` clear icon X** — hoy es ícono de búsqueda
  default. El equipo de diseño debe decidir si en estado "con
  valor" se cambia a X (clear). Pregunta al equipo.
- **#15 `sc-search` variants formales sm/md/lg** — hoy hay 1
  main component en Figma. Falta crear los 3 variants formales.
- **#37 Variants sm/md/lg de 5 wrappers form (multiselect,
  datepicker, inputtext, inputnumber, select)** — el código ya
  los implementa, falta validar que el Figma SC Kit Pro los
  tenga modelados.
- **#44 Off-scale spacing 6px (24 hits)** — valores 6px que
  caen entre `--sc-spacing-50` (4px) y `--sc-spacing-100` (8px).
  Decisión: ¿añadir token `--sc-spacing-75 = 6px`? ¿O consolidar
  a 4/8? Requiere visto bueno del equipo.
- **#45 Off-scale radius 3px (36 hits)** — mismo problema entre
  2px y 4px.
- **#48 Icon size tokens (208 hits literales lucide)** — hoy
  los tamaños de ícono son números literales (13, 14, 16…).
  Tokenizar requiere que el equipo defina escala en Figma.
- **#49 Box-shadow custom 5 hits divergentes** — sombras inline
  custom. Decisión: ¿añadir token `--sc-shadow-card-soft`? ¿O
  forzar a token existente? Espera el equipo.
- **#50 Transition duration tokens (23+5 hits sin escala)** —
  hoy duraciones literales 200ms / 120ms. Tokenizar requiere
  escala definida (instant/fast/base/slow).

**Cómo atacar**:
- **Preparar paquete único de preguntas al equipo de diseño**:
  hacer una sesión de revisión con el equipo donde se les
  presenta los 8 items con screenshots/casos reales del código
  + tres opciones (token nuevo / consolidar / mantener custom).
  Por cada item, el equipo decide.
- **Sin esa sesión, NO atacar** — la regla "no inventar tokens"
  es estricta (memoria `feedback_migration_safety` § blindaje
  upgrades PrimeNG).
- **Coste de la sesión equipo**: ~1h de su tiempo + 30 min mío
  preparando el dossier. Es la única ruta limpia.

**Implicaciones**: si Rafa fuerza una decisión hoy (ej. "añade
token spacing-75"), corremos riesgo de drift con Figma Variables
cuando el equipo lo importe en su workflow. Es deuda futura
disfrazada de progreso.

**Filosofía respetada**: memoria `feedback_figma_link_before_component`
+ `feedback_figma_specs_thorough` + DD-7 (toda primitive nueva
→ entry customs-catalog).

#### Grupo D · Sin trigger funcional · conversation-player-modal + Code Connect

**Qué son**: dos items defensivos sin urgencia ni trigger.

- **conversation-player-modal split (Eje 3 #1)** — el componente
  tiene 476 líneas y mezcla 4 sub-responsabilidades (audio
  transport, tab body, retrans gate, dispatch wiring). Es un
  "god-component" que conviene partir EN CUANTO alguien tenga
  que añadirle feature nueva. Hoy nadie le toca → no atacar.
- **Code Connect oficial** — sistema de Figma que mapea
  components Figma a componentes de código. Dormido S48 con
  3 condiciones explícitas (en [`code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md)):
  (1) producción adopta SCDS, (2) wrappers `<sc-*>` existen en
  codebase producción, (3) ≥1 dev producción consume DS desde
  Figma. Ninguna cumplida hoy.

**Cómo atacar**:
- **conversation-player-modal**: no atacar a no ser que un
  iter nuevo lo requiera. Si surge feature (ej. transcripción
  parcial editable), aprovechar para refactorizar como parte
  del feature. ~1.5h estimadas si se ataca.
- **Code Connect**: NO setup hasta cumplir las 3 condiciones.
  Si Rafa pregunta "por qué no lo hacemos hoy" → snippets
  serían referencias rotas para devs producción que no tienen
  acceso a este repo. Esfuerzo en vacío.

**Implicaciones**: ambos son tareas "que vendrá su día". La
filosofía "no devaluar lo ya hecho" + "trigger real o nada"
del CLAUDE.md aplica directo aquí.

**Filosofía respetada**: memoria `feedback_devaluation_existing_work`
+ `feedback_code_connect_dormant`.

---

### Bloque 2 · ¿Comprar BeyondUI (beyondui.design)?

**Qué es BeyondUI exactamente** (según su web hoy):
- Archivo **Figma premium** (UI kit) con 9.000+ componentes,
  500+ secciones de landing, 6 templates SaaS completos
  (AI, Healthcare, Fintech, CRM, Project Management, Crypto),
  650+ variables de diseño y modo oscuro.
- **NO incluye código** React/Vue/Angular. Solo Figma + tokens
  CSS sueltos + config Tailwind + reglas para AI editors
  (Cursor / Claude Code).
- **Pricing**: one-time purchase (tiers Standard y Premium).
  Licencia comercial implícita (apunta a freelancers y agencias).

**¿Es ortogonal o conflicto con nuestro enfoque?**

El proyecto Smart Contact tiene:
- Stack Angular 21 + PrimeNG 21 + SCDS propio (--sc-* tokens).
- Figma SC Prime UI Kit Pro como source-of-truth visual.
- Identidad SC ya auditada 1:1 contra PrimeOne 4.0 (Sesiones
  S30-S47).

BeyondUI sería **complementario solo como inspiración**, NO
como reemplazo. Razones:

1. **No ships Angular** — sus componentes Figma no se
   convierten automáticamente a `<sc-button>` etc. Habría que
   re-implementar cada uno como wrapper PrimeNG con el preset
   SC. Drift garantizado si copiamos visualmente.

2. **Tokens distintos** — BeyondUI tiene SUS variables (650+).
   El SCDS tiene LAS SUYAS (auditadas 1:1 con PrimeOne). Si
   el equipo de diseño empieza a usar tokens BeyondUI en
   Figma SC, todo el sistema --sc-* propio queda invalidado.
   Resync con identidad SC actual = horas de trabajo perdidas.

3. **No estamos en Tailwind** — los assets bonus (Tailwind
   config + tokens CSS) no aplican. PrimeNG es nuestro
   sistema. Migrar a Tailwind sería refactor estructural
   mayor (mes+ de trabajo).

**Riesgos concretos si compras**:
- **Drift identidad**: el equipo de diseño, viendo un kit
  más rico, puede ir a tomar componentes de BeyondUI en Figma
  SC sin pasarlos por el filtro PrimeNG. Implementación ruda:
  llegan diseños imposibles de implementar con PrimeNG y hay
  que cocinar Pure SC custom (que es exactamente lo que
  evitamos con la regla "minimal customization sobre PrimeNG").
- **Coste cognitivo**: 9.000 componentes Figma es muchísimo
  más de lo que SC consume (~34 wrappers). El equipo puede
  perderse explorando vs trabajar en lo que toca.
- **Coste de oportunidad**: el dinero/tiempo invertido es
  dinero que NO se invierte en spec sessions con el equipo
  para cerrar los 8 items Figma-dependent (Grupo C arriba).
  Esos sí desbloquean trabajo real.

**Ventajas si compras**:
- **Inspiración**: 6 templates SaaS completos con patrones
  modernos (AI, fintech, etc.). Útil si el equipo busca
  referencias para landing del marketing site Smart Contact
  o pantallas nuevas.
- **Variables/tokens estructura**: aunque no se usen
  directamente, ver cómo BeyondUI organiza sus 650+ variables
  puede dar ideas para optimizar nuestras 7 capas SCDS.

**Precauciones**:
- Si compras, marca CLARO al equipo: "esto es referencia
  visual, NO source-of-truth. Source-of-truth sigue siendo
  Smart Contact Prime UI Kit Pro (PrimeOne 4.0)".
- NO importar tokens BeyondUI a Figma SC. Aislar como Figma
  separado.
- Si surge tentación de "usar este componente BeyondUI tal
  cual" → pasarlo por checklist customs-catalog §0.

**Veredicto sincero** (memoria `feedback_critical_sparring_partner`,
no agree por defecto):

**Mi recomendación**: **NO comprar todavía**. Razones:
1. El proyecto ya tiene un kit Figma propio (Smart Contact
   Prime UI Kit Pro) que el equipo de diseño usa. Comprar
   otro kit duplica fuente sin reducir trabajo significativo.
2. Los 8 items Figma-dependent del Grupo C son MÁS valiosos
   de cerrar que un kit nuevo. Si invertimos las horas que
   gastarías estudiando BeyondUI en una spec session con el
   equipo, desbloqueamos trabajo real (tokens spacing/radius/
   icon-size/shadow/duration).
3. BeyondUI brilla para quien empieza desde cero. SC NO
   empieza desde cero — tiene 47 sesiones de identidad SCDS
   auditada.

**Si aún quieres comprar** (porque quieres inspiración para
el marketing site SC, o para descansar la mente de PrimeOne):
compra el tier Standard, NO el Premium. Y úsalo solo como
biblioteca de referencias visuales, no como kit a importar.
Documenta esta decisión en `docs/DECISIONS.md` para que
quede claro al próximo dev que mire por qué hay 2 kits en
el proyecto.

---

### Bloque 3 · Verificación visual de los cambios S53.5

> Al cerrar S53.5, Rafa reportó que NO veía los cambios en Netlify.
> Tras revisar: ambos sites estaban deployados correctamente
> (ds-smartcontact en `a1e6bba`, aedmigration en `ee771b2`), HTTP
> 200 en assets clave. Causa probable: caché del navegador.
>
> Al arrancar S54: hard refresh en las 4 URLs y verificar uno a uno.

| Cambio | URL | Cómo verlo |
|---|---|---|
| Thumbnails tracker | https://ds-smartcontact.netlify.app/ | Scroll a "Mi seguimiento". Cada fila tiene mini-captura derecha que linkea a la gallery del componente. |
| Espaciado header agente | https://aedmigration.netlify.app/admin/agentes/editar/1 | Header con avatar + AGENTE + nombre + pill verde. Más aire vertical y entre chunks "Sin email" / "Extensión 122" / "WebRTC". |
| Marcar leída condicional | https://aedmigration.netlify.app/conversaciones | El icono toolbar solo aparece cuando hay filas rojas. Cambiar mock sample a "Solo fallidas" desde el switcher arriba a la derecha. |
| Right-click en filas | https://aedmigration.netlify.app/conversaciones | Click derecho sobre cualquier fila. Menú con Procesar/Analizar (según estado) + Marcar como leída (solo si la fila está roja). |

Si tras hard refresh (⌘/Ctrl + Shift + R) algo NO se ve: capturar
pantalla, abrir DevTools → Network → Disable cache, hard refresh
otra vez. La API REST de Netlify no expone logs raw — si hay
sospecha de build roto, mirar el log en la UI del dashboard de
cada site.

---

### Bloque 4 · Atajos de teclado — auditar legacy + documentar

> Pedido del user al cerrar S53.5. El prototipo React Memory
> (y AED por inercia) tenía atajos como Escape para salir de
> modales, cerrar dropdowns, etc. Hay que auditar qué hay
> implementado vs qué espera el legacy, y dejarlo documentado
> en ambos proyectos (AED + Memory).

**Qué hacer en S54**:

1. **Auditar el código legacy**:
   - Memory React: `arebury/Memory/legacy-react/src/app/` —
     buscar `KeyboardEvent`, `Escape`, `onKeyDown`, hotkeys.
   - Listar atajos previstos: Escape (close modal/dropdown),
     ⌘K (command palette ya implementado), `/` (focus search
     ya implementado en tracker home ds-docs), arrow keys
     (radio group multi-rec ya implementado).

2. **Auditar el código Angular actual**:
   - Buscar handlers `(keydown)` / `@HostListener` / `Escape` en
     `apps/supervisor/src/app/features/` y `packages/design-system/`.
   - Cruzar con la lista del legacy: ¿qué está, qué falta?

3. **Documentar resultado**:
   - Entry nueva en [`apps/supervisor/docs/DECISIONS.md`](../apps/supervisor/docs/DECISIONS.md) —
     "Atajos de teclado canonical AED + Memory".
   - Update [`packages/design-system/components/keyboard-shortcuts/`](../packages/design-system/components/keyboard-shortcuts/) —
     el panel "Pulsa ?" ya existe pero quizás incompleto.
   - Si falta un atajo crítico (ej. Escape cierra modales),
     implementarlo en el wrapper SCDS correspondiente
     (`<sc-dialog>` ya debería tener Escape via PrimeNG, verificar).

4. **Filosofía respetada**: este bloque es trabajo de auditoría +
   doc, NO sweep masivo. Solo implementar lo que claramente
   esté roto o ausente. El resto queda registrado como deuda
   en `inconsistencies-backlog.md` con severidad apropiada.

**Estimación**: 1 sesión completa (audit + doc + fixes
puntuales si los hay). Si aparecen muchos gaps, partir en 2
sesiones (audit primero, fixes después).

---

### Cómo arrancar S54

1. Leer este briefing entero (15-20 min) — bloques 1 al 4.
2. **Empezar por bloque 3** (verificación visual S53.5) — es
   rápido, descarta dudas de "está roto" antes de avanzar.
3. Decidir prioridad de bloques 1 / 2 / 4:
   - ¿Atacamos algún grupo dormido del bloque 1?
   - ¿Spec session con el equipo (bloque 1 grupo C)?
   - ¿Decisión BeyondUI (bloque 2)?
   - ¿Audit atajos teclado (bloque 4)?
4. Si BeyondUI: decisión sí/no y, si compra, entry en
   DECISIONS.md para registrar el por qué.

## Estado al cerrar (Session 53, 2026-05-21)

**Sesión autónoma** (Rafa pidió "ejecuta plan que acoja todo, sin
inventar tokens, siguiendo filosofía"). Ejecutado el subset del
inventario S52 cuyo trigger SÍ estaba cumplido; items dormidos por
trigger no cumplido NO atacados (8 esperan equipo de diseño, 7 esperan
≥N consumers, 5 esperan otros triggers, conversation-player-modal sin
trigger, Code Connect dormido).

Cerrados S53:
- TOP-2: stitched-card filtros+toolbar+tabla (gestalt unificada, 3
  reglas SCSS, 0 tokens nuevos, reversible).
- TOP-1: 34 capturas componente + sweep 34 spec docs SCDS.
- #46 border-radius: 1 hit tokenizado (scrollbar→radius-full), 2
  mantenidos como intencional (checkbox glyph).
- #47 i18n Memory: 14 keys × 4 locales (subtitle bulk + gate token
  retrans + modal title bulk + 4× chars_N sistema-page).
- Eje 3 #2 multi-rec verificado-OK sin deuda.
- Eje 4 #1 PrimeNG 21.1.7 vs 21.1.8 vigilado (single fix Drawer, no
  aplica).

**Estado salud**: tsc verde · lint verde · build verde · Playwright
14/14 verde · i18n 1486 paths × 4 locales 0 mismatches.

## Estado al cerrar (Session 52, 2026-05-21)

**Sesión densa**: 4 commits. CI cadena rojo de 11 commits ARREGLADA (lint
errors no detectados por husky → integrado `npm run lint` en pre-commit
como red estructural). Sweep AED i18n cerrado (último consumer: repos
schema refactor). Sweep nombres del equipo (52 archivos, docs + mocks +
memoria). 4 bugs UI del bulk transcription modal resueltos según legacy
React 1:1.

**Estado salud**: CI `#377` ec332d8 ✅ · Netlify aedmigration+ds-smartcontact
ready · 14/14 Playwright · i18n 1472 paths × 4 locales 0 mismatches.

## Próximas tareas (priorizadas)

### ✅ TOP S53 cerrados (referencia)

1. ~~Capturas componente por componente~~ ✅ S53: script Playwright + 34
   PNG en `packages/design-system/docs/components/screenshots/` + sweep
   34 spec docs SCDS con imagen tras el `# h1`. Sidebar ds-docs ocultada
   via `addStyleTag` antes del clip 1440×720.
2. ~~/impeccable rework container filtros+toolbar+tabla~~ ✅ S53:
   stitched-card pattern. 3 reglas SCSS, 0 tokens nuevos, reversible.
   Light + dark verificados.

### 🎯 Memory §10 dormidos (8 items vivos, esperan trigger)

Detalle completo en [`memory-migration-inventory.md §10`](./memory-migration-inventory.md).

| # | Item | Trigger reapertura |
|---|---|---|
| §10 #3 | `<sc-audio-player>` wrapper SCDS | Consumer EXTERNO Memory **O** Figma spec |
| §10 #4 | Modal Download GDPR (real backend) | Producción real |
| §10 #5 | Sticky toast persistente "Generando…" | Pipeline real (no mock) |
| §10 #6 | Hint "Excluye K en proceso" bulk modal | `processingIds` con dispatch real |
| §10 #7 | Hint multi-tramo bulk modal | Dispatcher por tramo (no conversación) |
| §10 #8 | Eyebrow "ACCIÓN MASIVA" header bulk modal | Refactor SCDS si >1 consumer pide eyebrow |
| §10 #9 | Toast error + chip "Solo fallidas" + filtro permanente | Dispatch backend real |
| §10 #11 | `DataExportImport` config Memory JSON | Migración bulk config Memory |
| §11 A | Filtrado filas en proceso (decisión doc canonical) | Dispatch real |

### 🎯 SCDS inconsistencies backlog (22 items abiertos)

Detalle en [`packages/design-system/docs/inconsistencies-backlog.md`](../packages/design-system/docs/inconsistencies-backlog.md).
Resumen por trigger:

**Esperan el equipo de diseño** (Figma input):
- #14 `sc-search` clear icon X vs default search
- #15 `sc-search` variants formales sm/md/lg en Kit Pro
- #37 multiselect/datepicker/inputtext/inputnumber/select variants sm/md/lg en Kit Pro
- #44 off-scale spacing 6px (24 hits) — decisión: token nuevo vs consolidar
- #45 off-scale border-radius 3px (36 hits) — idem
- #48 Icon size tokens (208 hits literal lucide) — esperar iconset Figma
- #49 box-shadow custom 5 hits divergentes
- #50 transition duration tokens (23+5 hits sin escala)

**Esperan ≥N consumers** (DD-4 promoción al SCDS):
- #2 `inline-rename-cell` — segundo consumer
- #4 `label-chip` — gap documentado
- #6 `<sc-data-table>` — gap nuevo
- #7 `<sc-select-button>` — gap
- #8 `<sc-tag>` — gap
- #32 `.table-card` + `.table` chrome partial SCDS — 5º consumer
- #33 `.page` + `.page__inner` chrome partial SCDS — 9º consumer

**Esperan otro trigger**:
- #27 Netlify config staging cuando equipo crezca
- #28 Repo Memory + monorepo CI (Memory active threshold)
- #31 Modular theme PrimeNG — sin trigger Web Vitals
- #42 AED es.json optimization 1152 keys — P3
- ~~#46 3 hits residuales border-radius~~ ✅ cerrado S53
- ~~#47 12 strings sin i18n en Memory~~ ✅ cerrado S53
- #51 i18n duplicates (115 strings) — traductor profesional

### 🎯 Eje 3 — Refactor god-components Memory (defensivo)

Sin trigger funcional. Atacar SOLO cuando alguien tenga que tocar esos
componentes para feature nueva (memoria `feedback_devaluation_existing_work`).

| # | Item | Tamaño |
|---|---|---|
| 1 | `conversation-player-modal.component.ts` (476 líneas) — split sub-components | ~1.5h |
| 2 | `multi-recording-player.component.ts` — review patrones React mal traducidos (S51 ya hizo i18n aria, resto OK) | ~1h |

### 🎯 Eje 4 — PrimeOne upgrade vigilance (defensivo)

| # | Item | Cuándo |
|---|---|---|
| 1 | Vigilar nuevos minors PrimeNG (estamos 21.1.7) | cada 2-3 sesiones |
| 2 | Dry-run próximo major PrimeNG (22.x) | trigger upstream release |

### 🎯 Eje 5 — Code Connect oficial DORMIDO con trigger

Detalle setup en [`packages/design-system/docs/code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md).
**NO atacar** sin 3 condiciones: (1) prod adopta SCDS, (2) wrappers `<sc-*>` existen
en codebase prod con mismo naming, (3) ≥1 dev prod consume DS desde Figma.

## Estado al cerrar S50/S51 (referencia)

S50 (`70e352d`): 6 bloques en cascada — animaciones SC partial, delta-fly,
mockdata 15→33, Download wire, toolbar inline legacy, AED i18n 5/6.

S51 (`0e65b6e` + `bb41f88` + `6d8efc2`): repos schema refactor (último
consumer i18n), multi-rec aria, sweep nombres → "equipo de diseño".

## Estado al cerrar S49 (referencia)

**1 commit a `main`** (8b8f1f4): feat S49 §10 #13 CategoryRuleLinking
bidireccional + fix 5 bugs i18n/UX + red de seguridad i18n (audit + husky).

### Estado al cerrar S47 (referencia)

**31 commits a `main` pusheados** en una sesión maratón. Sweep total de deudas
de diseño + consistencia + features Memory polish. Codebase en estado salud
máximo: 0 anti-patterns, 0 stale refs, 0 unused imports, 14/14 Playwright
cross-app verde, 4 idiomas operativos.

### Bloques completados S47

1. Tracker refresh + audit estructural.
2. Severity explícita 13 `<p-button>`, mock-sample-switcher cleanup, 34 spacings hardcoded → tokens.
3. **7 wrappers SCDS renombrados 1:1 con Kit Pro Figma + PrimeNG**: `inputtext`, `inputnumber`, `inputgroup`, `multiselect`, `toggleswitch`, `dialog`, `checkbox`. Tokens `--sc-modal-*` → `--sc-dialog-*` propagado.
4. **2 directives** alineadas: `scClickOutside` + `scSortable`.
5. 96 hardcoded values → tokens (62 border-radius + 34 spacings).
6. **4 idiomas i18n** (ES + EN + FR + PT) + language switcher en Configuración → Sistema.
7. **Playwright cross-app smoke** + protocolo "por inercia" documentado.
8. **Rediseño flow Duplicar** Agentes/Usuarios/Grupos (sin drafts amarillos en lista).
9. Fila roja sutil para transcripciones fallidas Memory.
10. **localStorage namespace normalization** (`sc-X-Y` kebab) con migration silenciosa segura.
11. **Modal Download GDPR Memory** (§10 #4 cerrado).
12. DD-8 SCDS DECISIONS (naming portable) + customs-catalog §2.1 ampliado (decisión toast textual).

### Estado salud cierre S47

tsc verde · build production verde · Netlify verde · husky+lint-staged activo ·
Playwright cross-app 14/14 verde. Backlog `inconsistencies-backlog.md` con
items #38–#52 todos resueltos o registrados con dependencia humana.

---

## Próximos jugosos (priorizados)

### ⏸️ NO atacar sin trigger explícito

- **Code Connect oficial publish** (Eje 2 arriba) — dormido S48. Trigger = prod adopta SCDS con naming validado + dev prod consume Figma. Detalle setup futuro en `code-connect-mapping.md`.
- **#31 modular theme PrimeNG** — el proyecto NO va a producción real con backend (decisión Rafa S47). Sin trigger Web Vitals real → trabajo en vacío.
- **§10 #3 `<sc-audio-player>` wrapper SCDS** — declinado S46 (DM-7).
- **`<sc-data-table>`, `<sc-select-button>`, `<sc-tag>`, `<sc-toggle-button>`** — gaps documentados sin caso real.
- **#44/#45 off-scale spacing/radius con tokens nuevos** — decisión el equipo (S47 forzado a tokens existentes).
- **#48 Icon size tokens** — esperando que el equipo de diseño cree iconset Figma.
- **#50 Duration tokens** — descartado conscientemente (Figma no exporta variables duration).
- **#51 i18n duplicates (107 restantes)** — esperar traductor profesional para validar contextos.
- **localStorage keys legacy migration** — ya hecha S47 con marker idempotente.

---

## Cómo arrancar S49 (post-S48)

1. Leer este doc + [`DOCS-INDEX.md`](./DOCS-INDEX.md) (5 min).
2. **Si toca Memory** (prioridad TOP post-S48) → leer [`memory-migration-inventory.md`](./memory-migration-inventory.md) §10. Items vivos: #12 Synonyms granulares, #13 CategoryRuleLinking.
3. Si toca SCDS / tokens → leer [`packages/design-system/docs/DECISIONS.md`](../packages/design-system/docs/DECISIONS.md) + [`customs-catalog.md`](../packages/design-system/docs/customs-catalog.md).
4. Si toca AED → leer [`apps/supervisor/docs/DECISIONS.md`](../apps/supervisor/docs/DECISIONS.md).
5. **Code Connect oficial está dormido** — NO atacar sin que se cumpla el trigger documentado arriba + en [`code-connect-mapping.md`](../packages/design-system/docs/code-connect-mapping.md).
6. Historia detallada por sesión: [`SESSION-LOG.md`](./SESSION-LOG.md).

---

## Reglas operativas críticas (1 line each)

1. **Polish requests NUNCA tocan componentes ni tokens** (`.impeccable.md`).
2. **Customizar lo MÍNIMO sobre PrimeNG** (DD-5).
3. **2+ consumers antes de promover componente al SCDS** (DD-4).
4. **Toda primitive nueva → entry en `customs-catalog.md`** (DD-7).
5. **Naming SCDS wrappers nuevos = matching `<p-XYZ>` literal** (DD-8 S47).
6. **Componentes y refactors menores: directo a main**. Cambios estructurales: rama + PR.
7. **Antes de tocar componente UI**: pedir link Figma Kit Pro a Rafa.
8. **PEDIR logs raw antes de adivinar fixes** (Netlify, CI).
9. **Pre-commit hook husky+lint-staged es OBLIGATORIO** en monorepo sin PR.
10. **Verificar versión React prototipo** antes de polish Memory.
11. **Dev server**: `npm run start:supervisor -- --no-hmr` (Angular 21 no enlaza puerto sin `--no-hmr` para Playwright). Playwright usa `domcontentloaded`.
12. **Playwright `npm run e2e` por inercia** tras cambios SCDS/core/i18n/renames/sweeps >20 archivos. Sin que Rafa lo pida. Detalle en [`tests/e2e/README.md`](../tests/e2e/README.md).
13. **localStorage keys** = todas `sc-X-Y` kebab. Si añades una key nueva, sigue ese patrón.

---

## Memorias estructurales relevantes (en `~/.claude/.../memory/`)

`feedback_migration_safety` · `feedback_minimal_customization` · `feedback_track_inconsistencies` · `feedback_figma_link_workflow` · `feedback_figma_link_before_component` · `project_memory_aed_shared_shell` · `feedback_verify_react_version_before_touch` · `feedback_ng0950_transitive_pitfall` · `reference_netlify_auto_deploy_setup` · `feedback_pre_commit_hook_critical` · `feedback_pedir_logs_no_adivinar` · `feedback_iter_closing_summary` · `feedback_critical_sparring_partner` · `feedback_communication_style` · `feedback_playwright_cross_app_inertia` (S47 nueva).
