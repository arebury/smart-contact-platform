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

## 2026-05-19 · S39 — Falsos diagnósticos en cascada: cuando 3 fixes no resuelven nada

**Contexto**: Rafa nota que `aedmigration.netlify.app` no muestra el
trabajo S38. La hipótesis inicial era "el sitio Netlify tiene los
settings UI viejos del rename" — y era cierta. Pero solo era 1/3 del
problema.

**Premisa equivocada 1**: "Arreglar settings UI = arreglado". Apliqué
PATCH al endpoint correcto, los settings cambiaron, disparé build. Falló.

**Premisa equivocada 2**: "Es el package-lock incompatible con npm
remoto". Pin de `NPM_VERSION=10.8.2` aplicado. Build falló en el MISMO
sitio: `@esbuild/linux-x64` not found.

**Premisa equivocada 3**: "Es que `npm install` no recoge optional
deps en Netlify". Añadí `NPM_FLAGS="--include=optional"`. Build falló
otra vez. Idéntico error.

**Descubrimiento**: solo el log raw del build (pegado por Rafa desde
el dashboard UI; la API REST de Netlify NO expone logs raw) reveló la
causa real:

```
10:18:25 AM: Installing npm packages using npm version 10.8.2  ← pin ok
10:18:29 AM: added 7 packages, removed 12 packages              ← REMOVED 12
10:18:34 AM: $ npm install --no-audit --no-fund
10:18:35 AM: up to date in 960ms                                ← NO reinstala
10:18:36 AM: ✖ Building... [@esbuild/linux-x64 not found]
```

Netlify hace install pre-build automático. Al cambiar de npm 10.9.x
(default) a 10.8.2 (pin) **removía 12 packages** incluyendo el binario
nativo de esbuild. Mi `npm install` posterior decía "up to date"
porque el lockfile estaba OK. Y `ng build` quería ese binario.

**Solución**: `npm ci` en el build cmd. Borra `node_modules` y
reinstala todo desde lockfile cada vez. Garantiza presencia de
binarios nativos.

**Lección portable**:
- **Sin el log, todo diagnóstico es adivinanza**. 3 fixes razonables
  fueron a basura por no tenerlo en mano. El segundo screenshot que
  Rafa pegó (4 horas tarde pero con el log fresco) destrabó todo en
  2 minutos.
- **APIs REST de plataformas SaaS a menudo NO exponen logs detallados**.
  Solo el dashboard UI los tiene. Si la API parece no dar info, pedirla
  vía screenshot/copy del navegador es la vía rápida.
- **`npm install` ≠ `npm ci`**. `install` respeta el estado actual de
  `node_modules`; `ci` lo borra y reinstala. En entornos efímeros (CI,
  Netlify) donde la cache puede estar "envenenada" por upgrades, `ci`
  es más predictible.
- **Premisas equivocadas son baratas si vienen de logs**. Las premisas
  caras son las que vienen de inferencia ("seguro que es X porque…").

---

## 2026-05-19 · S39 — CI rojo durante 14 commits sin que nadie lo notase: pre-commit hook ausente

**Contexto**: 11+ runs CI en main consecutivos rojos desde S35 (commit
`be25387`, rename apps/aed → apps/supervisor, 18-may). Rafa nunca los
vio: no tiene flujo de revisar GitHub Actions cada commit.

**Premisa equivocada**: "El rename rompió algo". El primer instinto
fue mirar paths, scripts npm, configs Angular — todo coherente.

**Descubrimiento**: el step `format:check` (prettier) llevaba fallando
con 123 archivos sin formatear. Cada commit a `main` durante S36, S37
y los 11 temáticos S38 aportaba unos pocos archivos sin pasar prettier.
El repo nunca tuvo `.husky/`, así que nada bloqueaba commits con código
sin formatear.

**Por qué pasó desapercibido**:
- Rafa no es dev — no revisa Actions diariamente.
- Todos los commits van directos a `main` (sin PR, sin Required
  Status Checks que bloqueen merge).
- Los hooks pre-commit nunca se configuraron en el monorepo.

**Solución**: `npm run format` → 123 archivos auto-formateados (commit
`2689c15`, 3185 +, 2070 −). + `husky` + `lint-staged` configurados
(commit `ea3772b`) para que cada commit futuro pase prettier sobre
los archivos staged.

**Lección portable**:
- **CI sin notificación = CI invisible**. Si el dev no mira Actions a
  diario (porque está concentrado en construir features), los rojos
  se acumulan. Para flujos solo-`main` sin PR, hay que invertir:
  - Hook local pre-commit con `lint-staged`.
  - Notificaciones GitHub Actions a Slack/email/etc.
- **El criterio "todo a main, sin ceremony PR" funciona SOLO si los
  hooks locales suplen el rol de los Required Status Checks**. En este
  proyecto teníamos lo primero sin lo segundo → 11 rojos silenciosos.
- **Format-on-commit es invisible para el desarrollador y elimina una
  clase entera de errores CI**. lint-staged + prettier en 5 minutos
  cierran una grieta de meses.

---

## 2026-05-18 · S37 — Budget bumpeado vs investigación profunda: momentum manda en sesión larga

**Contexto**: en iter 3 de ConversationsView Memory, al introducir el primer uso real de `<sc-multi-select>` y `<sc-datepicker>` en el monorepo, el initial bundle saltó de 1.42 MB a 1.62 MB (+200 KB). El error budget del Angular era 1.5 MB → build rojo.

**Premisa equivocada (tentación)**: parar la iteración, abrir `source-map-explorer`, mapear qué módulos PrimeNG se promovieron al initial chunk, intentar dynamic `import()` para forzar code-splitting, etc. Trabajo de bundle optimization puro de 1-2h.

**Descubrimiento**: cuando llevas 3 iteraciones consecutivas sobre el mismo feature y la sesión ya tiene varios milestones tangibles, parar para optimizar bundle es **romper el momentum** a cambio de ganancia marginal. La causa probable es estructural (PrimeNG modules sin `sideEffects: false`) — no se va a resolver con 15 min de tuning. Y el budget de 1.5 MB era aspiracional pre-Memory; si el shell ahora aloja AED + Memory, crecer es esperable.

**Decisión**: bump pragmático del budget 1.5 → 1.8 MB error, anotar deuda con criterios concretos para resolverla cuando haya tiempo dedicado (entry #31 en inconsistencies-backlog: source-map-explorer + dynamic imports si aplica). Continuar con la iteración funcional. La deuda queda visible y accionable, no escondida.

**Lección portable**: en sesiones largas con momentum, distingue *deuda estructural anotada con criterios* (aceptable) de *deuda silenciosa sin trazabilidad* (no aceptable). Bumpear un budget aspiracional NO es ocultar un problema — es reconocer que el problema necesita su propia sesión y darle entrada formal en el backlog. La mala forma sería bumpear sin anotar; la buena es bumpear + anotar criterios concretos para resolver (qué herramienta usar, qué métrica medir, qué solución probar primero). El backlog se convierte en un IOU honesto, no en olvido.

> El bumpeo de budget es comunicación con devs futuros: "este número subió porque [causa hipotética], se investiga con [herramienta], se resuelve con [aproximación]". Sin esa narrativa, el siguiente que lea el angular.json se va a preguntar por qué el budget es tan generoso.

---

## 2026-05-18 · S37 — 3 icons Lucide vs 6 SVG custom: cuándo perder fidelidad pixel-perfect gana

**Contexto**: el prototipo React de Memory tiene `StatusIcons.tsx` con 6 SVG custom inline para la columna "Estado" de la tabla: `IconPhone`, `IconCallTranscription`, `IconCallTranscriptionAnalysis`, `IconChat`, `IconChatTranscription`, (probable `IconChatTranscriptionAnalysis`). Cada uno **condensa varios ejes en un solo glyph** (phone vs phone+lines vs phone+lines+sparkle).

**Premisa equivocada (tentación inicial)**: replicar 1:1 los 6 SVG custom al Angular para mantener fidelidad pixel-perfect con el prototipo.

**Descubrimiento**: el modelo "1 glyph compuesto por estado" es elegante visualmente pero **rompe la modularidad**. Cada nuevo estado (failed transcription, processing, retry, etc.) requeriría un SVG custom nuevo combinando todos los ejes existentes — explosión combinatoria. Además, los SVG custom no están en el design system Lucide (canonical en el shell AED), introducen un set paralelo que devs futuros tendrán que mantener separado.

**Alternativa elegida**: 3 icons Lucide separados (`Mic`, `FileText`, `Sparkles`, `AlertTriangle`) renderizados en cluster horizontal. Cada eje (recording, transcription, analysis, failed) es un boolean independiente y un icon independiente. Pierde fidelidad visual ("phone+lines+sparkle" condensado vs "phone, mic, fileText, sparkles" expandido), gana:
- Consistencia con AED (Lucide es el set canonical del shell).
- Modularidad (cada eje se evalúa solo, fácil añadir nuevos estados).
- Mantenibilidad (no SVG custom que mantener cuando lucide-angular se actualiza).
- Menos código (4 icons importados vs 6 SVG inline con paths de 1KB cada uno).

**Lección portable**: cuando migras de un sistema custom a uno con design system establecido, la fidelidad 1:1 visual no es siempre la mejor decisión. Pregunta primero: ¿la elegancia visual del custom **se sostiene** cuando añades nuevos estados al modelo? Si la respuesta es "necesitaría N SVGs nuevos", probablemente la composición modular del DS canonical es mejor. Reversible: si en una review Marta dice "el cluster de iconos pierde la lectura inmediata del glyph compuesto", replicas los SVG custom — pero parte de la decisión basada en restricciones de mantenimiento, no de gusto.

> "Pixel-perfect con el prototipo" no es siempre el objetivo correcto cuando el prototipo se hizo sin las constraints del shell de producción.

---

## 2026-05-18 · S35 — Triple backup: defensa en profundidad antes de toda migración irreversible

**Contexto**: para arrancar la migración del prototipo React Memory → Angular, había que tomar el repositorio Memory y reorganizarlo (mover el código React a `legacy-react/`, dejar el repo como archivo histórico). Una vez hecho ese cambio, recuperar el estado anterior es trabajo manual y propenso a olvidos.

**Premisa equivocada (tentación)**: un solo mecanismo de recuperación (típicamente un git tag) es suficiente para "rollback".

**Descubrimiento**: tres mecanismos sirven propósitos complementarios y deberían coexistir antes de cualquier rename masivo / reorg / refactor estructural:

- **Tag** (`v0-prototype-react-pre-scds`): snapshot inmutable en un commit específico. Sirve para "quiero ver exactamente cómo estaba el día del corte" — `git checkout v0-prototype-react-pre-scds`. NO se mueve ni se modifica.
- **Branch** (`prototype-react-archive`): puntero al mismo commit que el tag, pero permite hotfixes históricos (commits adicionales sobre el estado v0) sin contaminar `main`. Sirve si un mes después alguien necesita arreglar un bug en el React legacy sin migrarlo todavía.
- **Carpeta legacy** (`legacy-react/` dentro de `main`): navegable desde el HEAD actual, accesible sin checkout. Sirve para "quiero leer el código del prototipo mientras trabajo en el Angular nuevo, sin cambiar de branch". También sirve para que `pnpm dev` desde dentro de la carpeta arranque el prototipo si hay que demostrarlo.

**Lección portable**: antes de cualquier reorganización destructiva, escribe los 3 (o N) mecanismos de recuperación que vas a dejar y verifica que sirven propósitos distintos. Tag = snapshot inmutable. Branch = base para hotfixes históricos. Carpeta legacy = navegable sin checkout. Si los 3 sirven al mismo propósito, sobran 2. Si cubren propósitos distintos, los 3 son inversión, no overhead.

---

## 2026-05-18 · S35 — Distinguir path estructural vs narrativa histórica al hacer rename masivo

**Contexto**: durante el rename `apps/aed/` → `apps/supervisor/`, 23 archivos del repo contenían referencias `apps/aed/`. La pregunta natural fue: ¿hago un `sed` masivo y replace_all en todos?

**Premisa equivocada**: el rename de un directorio significa que TODAS las menciones del path antiguo en TODO el repo deben actualizarse al path nuevo.

**Descubrimiento**: las referencias caen en 2 categorías muy distintas:

1. **Paths estructurales vivientes**: `consumers.md` línea "AED — `apps/aed/`", spec doc del select "ver `apps/aed/.../agent-form-page`", config `outputPath: dist/aed`. Estos APUNTAN a código vivo HOY. Si el path es incorrecto, el lector navega a un sitio que no existe → confusión. **Actualizar es necesario**.

2. **Narrativas históricas**: `SESSION-LOG.md` entry S34 "migré 38 botones `.btn` en apps/aed/src", `case-study-notes.md` momento "el grep `apps/aed/src` no encontró...", `inconsistencies-backlog.md` entry resolved "`apps/aed/src/styles/_buttons.scss` eliminado en S34". Estos NARRAN un evento que ocurrió cuando el path era `apps/aed/`. Reescribir el path falsifica la historia — el grep que hizo el Claude de S34 fue contra `apps/aed/src`, no contra `apps/supervisor/src` (que no existía aún).

**Lección portable**: rename masivos no son `sed` ciego. Distingue: ¿este path está apuntando a algo vivo, o narrando algo que pasó? Apuntando → update. Narrando → respeta la historia. Patrón replicable: cualquier doc append-only (logs de sesiones, journals, case-study, post-mortems) tiene narrativa histórica; cualquier doc vivo (specs, READMEs, consumers, inventarios) tiene paths estructurales.

---

## 2026-05-18 · S35 — Excepción documentada en rename: cuando el mismo string tiene dos significados

**Contexto**: el repo tiene una carpeta `apps/aed/src/app/features/config/aed/`. La primera `apps/aed/` es el path del directorio que estamos renombrando a `apps/supervisor/`. La última `/aed/` es el nombre de una feature (configuración específica de AED como sub-sección de Config). Conceptualmente son cosas distintas.

**Premisa equivocada (tentación)**: replace_all `aed` → `supervisor` y arreglar lo que rompa.

**Descubrimiento**: la cadena `aed` tiene al menos 3 significados distintos en el repo:

1. **Path del directorio raíz de la app** (`apps/aed/`): SÍ se renombra.
2. **Nombre de feature dentro del shell** (`features/config/aed/`): NO se renombra — `aed` ahí es identificador semántico de la sub-feature ("la config relativa al módulo AED"), no path raíz.
3. **Texto UI / claves i18n** (`"aed": "AED"` en es.json): NO se renombra — es contenido textual que el usuario ve.
4. **Prefix válido en eslint** (`["sc", "aed"]`): NO se renombra — permite mantener componentes prefijados `aed-` para la feature `features/config/aed/`.

**Solución técnica**: replace_all con string específica `apps/aed/` (con prefix + barra final). Eso captura solo el path raíz, deja intactos los 3 usos legítimos del string `aed`.

**Lección portable**: antes de cualquier rename masivo, lista los distintos significados que la cadena a renombrar puede tener en el código. Las excepciones intencionales se documentan SIEMPRE (en CLAUDE.md, en el código mismo con comment, o en commit message), porque sin documentación el siguiente colaborador asume "el rename no llegó a esta parte" y "lo arregla" — y rompe la excepción. La excepción documentada es contrato; la excepción no documentada es bomba de tiempo.

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
