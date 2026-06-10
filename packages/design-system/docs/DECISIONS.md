# SCDS — Architectural Decisions

> Decisiones grandes que afectan al diseño del Smart Contact Design System.
>
> **Source of truth**: este doc para decisiones arquitectónicas. Brand divergences
> en [`customs-catalog.md`](./customs-catalog.md). Backlog operativo en
> [`inconsistencies-backlog.md`](./inconsistencies-backlog.md). Reglas blindaje
> en [`migration-safety.md`](./migration-safety.md).
>
> Formato: 1 entry por decisión. Newest first. Cada entry tiene: contexto,
> opciones consideradas, decisión, razón, consecuencias.

---

## DD-13 · 2026-06-09 (S72) — Tipografía: escala REDONDA desacoplada de `--sc-scale`, convergente con los devs (rem root-16), naming de styles = tokens de código

**Contexto**: la tipografía estaba atada a la escala de espaciado 14-base
(`--sc-font-size-X = var(--sc-scale-Y)` → decimales: h1 31,5 · body 15,75 · sm
12,25). El Kit Pro Figma usaba esos mismos decimales. Al converger con el repo de
los devs (`smartcontact-ui`) había que decidir UN modelo de tipografía.

**Dato que decide** (leyendo su repo: `sc-preset/rem-scale.ts` + `extend.ts`): los
devs renderizan en **rem sobre root 16** (a11y) y sus tamaños reales son
**redondos** — `app.typography` sm/md/lg = **12 / 14 / 16**, line-heights 18/21/24
— **no** los decimales 14-base. `rem-scale.ts` autora en "design-rem" base-14 y
compila a browser-rem ×0,875. → A root 16: **redondo = rem limpio** (16=1rem,
24=1,5rem), **decimal = rem feo** (15,75=0,984rem). Los devs ya van redondo;
nuestros decimales eran LA divergencia. (Memoria: [[reference_devs_rem_scale_architecture]].)

**Decisión**:
1. **Escala redonda** (12/14/16/18/20/24/32 + display 36/48/64 de registro),
   **desacoplada de `--sc-scale`** (la escala sigue para espaciado; la letra tiene
   su propio set redondo). En **rem sobre root 16** (converge + a11y).
2. **Line-heights** (cuerpo generoso ~1,5 → títulos apretando ~1,25, en px par):
   12/18 · 14/20 · 16/24 · 18/24 · 20/28 · 24/36 (h1 aireado, revisable) · 32/40 ·
   48/58 · 64/78.
3. **2 pesos** (Regular + Semibold), no 4.
4. **Cuerpo/control** = tier `app.typography` sm/md/lg (12/14/16) — lo que PrimeNG
   exige; **converge 1:1 con los devs**.
5. **Rampa de contenido semántica** (display-1, h1-h4, body-1/2/3, subtitle-1/2,
   caption, caption-bold) = **canónica nuestra**. Bajo "nosotros definimos, ellos
   construyen", **los devs la ADOPTAN** (no la tienen aún → hueco suyo, no deuda
   nuestra). Se limpian redundancias reales con el tiempo (subtitle-2 = subtitle-3)
   **sin estripar** el modelo.
6. **Naming**: text styles Figma renombrados 1:1 con los tokens de código (`h1`,
   `body-1`, `caption-bold`…) → un dev que inspecciona en Dev Mode ve el mismo
   nombre que `--sc-font-size-h1`. Las **VARIABLES** (lo que cruza al código vía
   Theme Designer) mantienen naming PrimeNG. El naming por-tamaño ("24 Semibold") se
   **DESCARTA**: crearía desajuste Figma↔código en el handoff.

**Razón**: redondo nos acerca a PrimeNG/devs (menos divergencia que cuidar) + da
rem limpio + a11y; el naming espejo elimina el rayado del dev. **Migration-safe**:
solo tocamos NUESTRA capa (variables `app/*` + `sc-preset.ts` + `--sc-font-size-*`),
nunca el core de PrimeNG ni el Kit del equipo. Coherente con el SCDS CLAUDE.md
("la letra vive en `--sc-*` + bridge; NO vincular a la escala de PrimeNG").

**Consecuencias**:
- **POC en el duplicado Figma** (`tUzS4MvWld90bA2qpZz5b6`, "Probar Iconos y tipo")
  HECHO: 12 text styles a redondo + line-heights por regla; variables App ancladas a
  redondo (sm-font 12 · lg-font 16 · sm-line 18 · lg-line 24; md-font 14);
  text-style naming = tokens código (12/12, `subtitle-3`→`body-3`).
- **Pendiente para validar en real**: (a) crear variables de la rampa de **TÍTULOS**
  (hoy los títulos son text style **sin variable** → no cruzan al código vía Theme
  Designer); (b) repetir todo en el **Kit OFICIAL** (el que lee el Theme Designer,
  no el duplicado); (c) reflejar en código `--sc-font-size-*` (redondo, rem) con
  diff visual + e2e; (d) ajustar `tokens:type-parity` (hoy snap base-14) al pasar a
  redondo.
- Display 36/48/64 → **registrados solo en specs** (uso ocasional; fuera de la
  rampa activa de Figma).

**Anexo — filosofía de cableado, "contradicción" letra/espaciado y pipeline** (S72):

- **Cableado de la tipografía de componentes: VARIABLES, no text styles.** Hay dos
  modelos. El *design-tool-native* ata cada texto de componente a un **text style**
  de Figma. PrimeNG (y por tanto SC Prime) ata los textos a **variables** (tokens de
  componente, p.ej. `button.label.font.size`), porque el código aplica el tema vía
  tokens: usar variables mantiene Figma↔código sincronizados. Migrar al modelo de
  styles metería en Figma un concepto que el código no lee → drift. **Seguimos el
  modelo de variables.**
- **Hallazgo (auditoría del Kit, S72)** — para la reunión de convergencia: de
  **~4.420 textos de componente revisados (7 páginas), 0 usan text style**; ~58%
  atados a variable, **~42% con el tamaño a pelo** (hardcoded → no se actualizan al
  cambiar la variable). El Kit está **parcialmente cableado**; completar el cableado
  a variables es trabajo del equipo en el Kit oficial.
- **La "contradicción" letra-redonda / espaciado-decimal (no lo es):** la tipografía
  se desacopla a redondo, pero el **espaciado se queda en `--sc-scale`** (decimales).
  Son sistemas distintos: el espaciado es geometría estructural (consistente en toda
  la app, imperceptible); la letra es legibilidad (redondo + rem importan). Cada uno
  con su escala; el espaciado **no se toca**.
- **El icono "de texto" hereda el tier tipográfico, NO la escala** (refinamiento S72,
  validado contra el preset). Un icono embebido con la letra (botón, chip, input, menú,
  breadcrumb) se compara ópticamente con el texto en la misma línea → debe atarse al
  `font-size` del componente (idealmente `1em`), **no** a `--sc-icon-size-*` (que es alias
  de `--sc-scale`, decimal). Así rima por construcción (Δ0) a cualquier tamaño. Dato: el
  cruce letra-redonda ↔ icono-escala hoy es ≤0,25px en controles (sm 12↔12,25 · md 14↔14 ·
  lg 16↔15,75) — imperceptible — pero sube a 0,5–1px en display y, sin atar, permite un
  icono default 14 junto a texto 12 (Δ2px, **sí** se ve). El icono de **geometría/UI**
  (empty-state, avatar, ilustración) SÍ se queda en `--sc-icon-size-*`/escala. Mismo
  principio que el punto anterior: dos sistemas (legibilidad vs geometría); el icono se
  asigna **por rol**, no por defecto a la escala. Bonus: `<sc-icon>` ya alimenta `opsz`
  con el size → atarlo al tier afina también el trazo del glifo al tamaño del texto.
  **Implicación Figma:** los main components que hoy atan el icono a la escala habría que
  re-atarlos al tier tipográfico (parte de "validar en real"; depende del naming de
  variables — due-diligence abierta).
- **Pipeline a código:** Figma (variables `app/*` + estilos) → **Theme Designer** →
  PR a GitHub → `--sc-font-size-*`. Es lo que hace que tocar la variable una vez en
  Figma llegue al código sin copiar valores a mano.
- **Anclaje vs literal — la letra ancla a primitivos propios en la colección _Custom_**
  (S72, criterio "a prueba de balas", no "lo probado"). La escala redonda vive como
  primitivos (`font-size/12..32`, `line-height/18..40`) en la colección **Custom** (la
  de tokens de proyecto), **no** en la base `Primitive` (la que deriva de PrimeNG/Aura);
  ambas son colecciones del mismo file/Kit. Importa porque un re-export del Kit
  **regenera** la base (Primitive/Semantic/Component) pero **respeta** App y Custom (las
  nuestras). La colección **App** ancla a ellos
  (`app/lg/font/size → font-size/16`…). **Razón:** una sola fuente por valor (cambiar
  un tamaño = 1 edición; las futuras variables de títulos anclan al mismo set) → escala
  trazable y futuro-proof, vs literales que dispersan el valor y son deuda a futuro.
  **Safe:** PrimeNG es *reference-native* (`{...}`, ej. `{form.field.font.size}`), así
  que la cadena de alias es su idioma; todo en Custom, no toca el core. **Due-diligence
  pendiente:** confirmar que el Theme Designer exporta el set de Custom + las
  referencias (plan B trivial si no: resolver a valor). Los devs usan literales en su
  `app.typography`, pero eso es detalle de su código; nuestra fuente de verdad (Figma)
  se queda con la jerarquía correcta.

**Validación contra PrimeNG — cómo modela la tipografía y qué instala el dev (S72b):**
investigación multi-fuente (doc oficial PrimeNG/PrimeUIX + código `@primeuix/themes` +
export del Kit + un tema generado por el Theme Designer) + verificación empírica.

- **PrimeNG NO modela la tipografía como sistema.** No hay grupo `typography` en sus 3
  tiers (primitive/semantic/component). Postura oficial literal: *"There is no design for
  fonts as UI components inherit their font settings from the application."* Y la doc
  "Scale": *"Use the root font-size to adjust the size of the components globally."* Hay
  **un único dial: el `font-size` del `<html>`** (su web usa 14px); el resto es `rem`
  colgando de ahí. Confirmado por grep cero de `typography` en `@primeuix/themes` y por el
  issue PrimeNG #3273 (un usuario peleando justo con esto). Excepción acotada: la capa
  semántica de INPUTS `form.field.sm/lg.font.size`. Fuera de inputs cada componente
  hardcodea `font-size: 1rem` y NO es token (issue PrimeUIX #192 pide tokenizarlos — sigue
  abierto). → **No hay capa de tipografía de CONTENIDO** (heading/title/body): se hereda
  del root.
- **El dev instala la letra en `rem`, no en px.** Verificado en un tema generado por el
  Theme Designer (carpetas `ts`/`js`, un archivo por componente): TODOS los `fontSize` en
  rem (`formField.sm` `0.875rem`, `lg` `1.125rem`, `dialog.title` `1.25rem`, `avatar`
  `2rem`…); los px del tema son solo bordes/radios/sombras. El plugin **convierte los px de
  las variables Figma a rem dividiendo por 16**. Con escala REDONDA → **rem limpios**
  (12→0,75 · 14→0,875 · 16→1 · 18→1,125 · 20→1,25 · 24→1,5 · 32→2); con los decimales
  14-base habrían salido feos (15,75→0,984rem). **Esto valida empíricamente el punto 1 de
  esta DD** (redondo + rem) con los propios ficheros del tema.
  - Nota operativa — el plugin tiene DOS salidas distintas: **"Generar tema"** = el preset
    de PrimeNG cocinado y listo para instalar (`ts`/`js`, letra ya en rem) — lo que el dev
    usa; **"Exportar"** = el JSON crudo de variables (`tokensprime.json`, números px) — la
    lista de ingredientes, no el plato. Para decidir unidades manda el tema generado (rem).
  - **Qué entregar a los devs (convergencia) — verificado comparando archivos:** su
    `sc-preset/base.ts` (+ un `.ts` por componente, ensamblados en `index.ts`) **ES un tema del
    Theme Designer** (idéntico carácter a carácter al tema generado), sobre el que añaden su capa
    custom (`extend.ts` con `app.typography`, `rem-scale.ts`) y una capa de aliases `--sc-*` desde
    `projects/design-tokens/scripts/tokens.json`. Es decir: **tema generado y tokens SÍ se
    combinan** — es justo para lo que se paga el Theme Designer. El pipeline real (de ellos y el de
    convergencia): Figma → Theme Designer → **preset base instalable** (`base` + componentes) +
    `extend` custom + aliases `--sc-*` estables (con unidad/rem) → componentes. Entregable a los
    devs: **ambos** — el tema (su base, vía el Kit compartido) **y** los valores/naming (para los
    aliases) + las DD (el porqué). Aún sin aplicar; plan en `convergence-manifesto.md`.
- **Naming — dos capas, dos reglas (corregido S72b-ext):** lo que el dev CONSUME (la capa
  semántica **App**: `app/font/size` → CSS `--app-font-size`) usa **jerarquía con barra**,
  espejo del dot-path de PrimeNG (`{form.field.font.size}`) — el guion solo aparece como
  kebab-case al emitir el CSS, nunca como separador semántico. El **primitivo de escala**
  (nuestro almacén de tamaños, que NADIE referencia directo) va **PLANO**:
  `typography/font-size/12..48` + `typography/line-height/18..58`. Razón: PrimeNG NO tiene
  primitivo de tipografía — su `font.size` es un token *semántico terminal* (un valor), no
  una escala; no hay patrón PrimeNG que imitar para una LISTA de tamaños, y anidar
  `font/size/<valor>` solo mete un grupo vacío de más (error que cometí y revertí: el
  componente consume `--app-font-size`, no el primitivo, así que su naming es interno). El
  primitivo plano (nombre = valor, convención estándar de escala) se lee mejor. Confirmado
  contra el repo de los devs: su capa de aliases expone `--sc-font-size-*`/`--sc-line-height-*`
  (guion en CSS), alimentada por un `tokens.json` de valores numéricos.
- **Rampa de CONTENIDO (h1–h4, body-1/2/3, subtitle, caption): modelo SIMPLE, sin capa de
  variables propia** (corregido S72b-ext2). Verificado contra SnowUI (text styles literales),
  el export del Kit y los devs: **ninguno** tiene una capa semántica de tipografía de contenido
  (`heading/h1`, `body/body-1`) — solo el tier de control (`app.sm/md/lg`) + font-size por
  componente (`card.title`, `dialog.title`). Crear esa capa de variables en Figma sería
  sobre-ingeniería. Modelo correcto: **text styles** (h1, body…) con su `font-size` /
  `line-height` / `weight` atados **directamente a los primitivos** (`typography/font-size/24`…)
  — el text style ES la capa semántica visual (cambiar h1 de 24→28 = reapuntar el estilo, un
  sitio). Los `--sc-font-size-h1` / `body-1` del código viven en la **capa de aliases** (como los
  devs: `--sc-font-size-*` desde su `tokens.json`), anclados a los primitivos que cruzan de Figma.
  **NO una tercera capa de variables semánticas.**
- **Hoy el código está en `px`** (`--sc-scale-1: 14px`; los `--sc-font-size-*` cuelgan de la
  escala px) **→ divergimos del output nativo de PrimeNG (rem) y rompemos el dial de escala
  global** (un usuario que sube el tamaño base del navegador no ve crecer nuestra letra;
  a11y degradada). La migración **px → rem** es trabajo real pendiente (no romper layouts:
  diff visual + e2e por grupo), no un redondeo simple. Trackeada en
  `inconsistencies-backlog.md` #88.

**Relación con DD-11 (no se contradicen):** DD-11 (S67) es el **mecanismo** —
los `font-size` viven en `--sc-*`, blindados por guard + comprobador; sigue
vigente. DD-13 (S72) es la **escala** que circula por ese mecanismo: cambia el
*target* de "snap a base-14" (decimales) a **redondo + rem**, y **decide** las
deudas que DD-11 dejó abiertas — line-heights `inconsistencies-backlog.md` #74 (ahora
"por regla") y tiers display #75 (36/48/64 de registro). El guard "Dura 4" y
`tokens:type-parity` no cambian; solo se reajusta el comprobador de snap-base-14 a
redondo al reflejar en código (paso (d) de Consecuencias). **Esta DD es el hogar
canónico de la ESCALA tipográfica; DD-11, el del blindaje.**

**Addendum (S73, 2026-06-10) — Piloto del pipeline EJECUTADO + modelo corregido
(verificado contra doc oficial; cierra un ida-y-vuelta de esta sesión).**

El Bloque 1 (gate) se ejecutó de verdad: export del **duplicado** por el Theme
Designer → GitHub (rama `theme-designer-pilot`: `theme-pilot/variables.json`
crudo + `theme-pilot/theme/` cocinado). Hallazgos, todos verificados sobre los
archivos:

1. **PrimeNG NO tiene design tokens de tipografía — es document-level.** Doc
   oficial ([theming/styled](https://primeng.org/theming/styled)): *"font family,
   font size, line-height do not have design tokens since they can be inherited
   from the document… not available in the generated theme and need to be applied
   to your application at the document level."* → **refuerza** el cuerpo de esta
   DD (PrimeNG no modela tipografía). La letra **no viaja por el preset**; se
   aplica a nivel documento. Excepción acotada ya conocida: `formField.sm/lg.font
   .size` (inputs) sí están en el preset, en rem.
2. **"App" es colección NATIVA de PrimeOne 4.0**, no custom. Las 5 oficiales:
   Primitive · Semantic · Component · **App** · Custom ([PrimeOne 4.0](https://www.primefaces.org/blog/primeone-4-0-is-here-native-figma-variables/)).
   "App" = ajustes a nivel-app; su tipografía es document-level → **por diseño NO
   se emite al preset**. (Corrige una hipótesis errónea que solté esta sesión —
   "App = cajón que el plugin no reconoce": falso, el plugin la lee al export
   crudo; simplemente la tipografía no se cocina al preset por ser document-level.)
3. **La conversión px→rem del Theme Designer es context-aware.** Convierte ÷16
   solo para tokens que reconoce como tamaño (estándar/semántico). En **Custom
   pierde el contexto y a todo número le pega `px`** — mismo bicho que el bug
   `bulkTranscriptionModal/title/font/weight: 600 → "600px"`. Por eso nuestros
   `typography/font/size/12` (número en Custom) salieron `"12px"`, no rem.
   **Regla:** lo que necesite trato de rem por el plugin no puede vivir solo como
   número en Custom; lo que es etiqueta (peso, variante, familia) va como **texto**
   para que el plugin lo respete tal cual.
4. **Evidencia del export** (verificada en los ficheros): `Custom` cruza a
   `extend` (typography 12-48 + line 18-58 en **px**, + `bulkTranscriptionModal`
   con refs `{...}`). `App` (6 vars) **no aparece** en el tema cocinado — ni font
   ni `card/background` — consistente con #1/#2. Las refs `{...}` **sobreviven**
   en `variables.json` crudo. `formField` sm/lg en el preset, en rem.
5. **Consecuencia — dónde vive de verdad nuestra tipografía (corrección de
   expectativa):**
   - Los primitivos `typography/*` en Custom = **fuente de diseño en Figma**
     (anclan App + text styles, cuerpo de esta DD). En el preset salen
     **huérfanos en px** → inofensivo, pero **ese no es el canal**.
   - **NO esperar que el Theme Designer lleve la letra a los componentes.** La
     tipografía se aplica a **nivel documento** = nuestra capa `--sc-font-size-*`
     (rem), espejo del `rem-scale.ts` de los devs.
   - **El rem lo ponemos nosotros** a nivel documento (÷16; redondo → rem limpio).
     Que el plugin deje Custom en px **es irrelevante** para la letra.
   - **NO re-apuntar la colección App → primitivos Custom esperando rem** (eso
     rompió el rem en el duplicado: en el original App apunta a `scale/*` nativo).
     Si se toca App, asumir que su tipografía es document-level de todos modos.
6. **Meta (proceso, para no repetir el ida-y-vuelta):** la respuesta (PrimeNG =
   tipografía document-level) **ya estaba en esta DD**. El error fue teorizar sin
   verificar contra (a) la doc oficial del tool y (b) nuestras propias DD.
   **Protocolo ante "¿por qué el pipeline no trae X?": leer la doc del tool +
   grep en DECISIONS ANTES de hipotetizar.** [[empirical-test-before-philosophizing]]

---

## DD-12 · 2026-06-04 (S70) — Naming de convergencia: el catálogo unión sigue DD-8 (Kit Pro 1:1, pegado); los devs realinean a él

**Contexto**: el equipo de dev tiene su propio repo de DS (`smartcontact-ui`,
GitLab) gemelo del nuestro, que **diverge en el naming**: ellos hyphenan los
multi-palabra (`sc-input-text`, `sc-toggle-switch`, `sc-radio-button`,
`sc-progress-bar`, `sc-progress-spinner`) mientras nosotros seguimos DD-8
(pegado 1:1 Kit Pro/PrimeNG: `sc-inputtext`, `sc-toggleswitch`). Al montar el
proyecto convergido (unión de ambos catálogos) hay que cerrar UN naming para
que los dos equipos "hablen igual".

**Dato que decide** (verificado S70): PrimeNG 21 acepta los DOS selectores
(`p-toggleswitch` **y** `p-toggle-switch` son ambos oficiales; idem multiselect/
inputnumber/inputgroup/radiobutton/progressbar) → la fidelidad a PrimeNG **no
desempata**. Pero los componentes del **Kit Pro/Figma se nombran pegado en
minúsculas** (`❖ inputtext`, `❖ toggleswitch`, `❖ multiselect` — ver
[`code-connect-mapping.md`](code-connect-mapping.md)). Como los devs construyen
**leyendo el Figma**, el pegado hace Figma→código 1:1 sin traducción; el kebab
mete una traducción permanente (= el ping-pong a evitar).

**Opciones consideradas**: (a) kebab uniforme en todo (máxima uniformidad de
string, = repo actual de los devs) — pero rompe el espejo con el Figma y obliga
a traducir en cada handoff de diseño. (b) **mantener DD-8** (pegado para lo del
Kit Pro; kebab para custom) en el proyecto convergido y que los devs realineen.

**Decisión**: **(b)** — el proyecto convergido adopta **DD-8 sin cambios**:
`sc-` + nombre Kit Pro/Figma literal (pegado) para todo lo que existe en el Kit
Pro; **custom (sin equivalente Kit Pro) → kebab** descriptivo (`sc-section-card`,
`sc-empty-state`, `sc-bulk-transcription-modal`). Es la **misma meta-regla que
los tokens** (espejar el Kit Pro; lo nuestro propio, custom). Bajo "nosotros
definimos, ellos construyen", **los devs realinean sus 5** divergentes:
`input-text→inputtext`, `toggle-switch→toggleswitch`, `radio-button→radiobutton`,
`progress-bar→progressbar`, `progress-spinner→progressspinner`.

**Razón**: el Figma/Kit Pro es la fuente común que ambos equipos leen; espejarla
elimina la traducción diseño→código para siempre. Migration-safe porque el
wrapper encapsula PrimeNG (un rename interno de selector/`--p-*` es 1 línea
dentro del wrapper, invisible a la API pública `sc-`). Una sola regla a nivel de
**sistema** (la misma de tokens), aunque a nivel de string convivan pegado +
kebab — la mezcla es señal de procedencia (¿está en el Kit Pro?), no ruido.

**Consecuencias**:
- Nosotros **no renombramos nada** (ya estamos en DD-8). Los devs realinean 5.
- El naming es **entrada base del MANIFIESTO de convergencia** (S70).
- Memoria `project_devs_smartcontact_ui_repo`: naming **confirmado** (ya no
  "por confirmar al cerrar el manifiesto").
- Nota para notificar al equipo redactada en el chat de S70.

---

## DD-11 · 2026-06-02 (S67) — Tipografía migration-safe: los `font-size` viven en `--sc-*`, blindados por guard + comprobador

**Contexto**: la tipografía era el último frente sin blindar. La app tenía 367
`font-size` literales repartidos en SCSS de componentes y features (cobertura
tokenizada 48%). Cada literal es un punto donde un update de PrimeNG o un
re-export del Kit puede introducir drift sin que nadie lo cace. Faltaba cerrar
el cinturón que color (DD-3) y spacing/escala (DD-10) ya tenían.

**Opciones consideradas**:
- A. **Dejar los literales + que `tokens:parity` solo avise**. Reactivo: el drift
  se detecta tarde (en el commit que lo cruza por casualidad) y los literales
  nuevos siguen entrando.
- B. **Tokenizar masivo + guard proactivo + comprobador read-only dedicado**.
  Cierra la puerta por construcción: ningún `font-size` literal nuevo entra, y
  los slots de tipo se cruzan contra el export.

**Decisión**: **B**.
- **Tokenización (olas 1+2)**: 367 `font-size` literales → `--sc-font-size-*`,
  snapeados a la escala base-14 (misma ley `v/14` de DD-10). Cobertura
  48% → 99% → 100% del accionable. El hero de bulk-transcription (88px) → token
  `--sc-font-size-900`.
- **Guard "Dura 4"** en `token-guard.mjs`: bloquea cualquier `font-size` literal
  nuevo en pre-commit, **0 excepciones**.
- **`npm run tokens:type-parity`**: comprobador SOLO-LECTURA (hermano de
  `tokens:parity`, NO crea tokens) que cruza los slots de tipo contra el export
  del Kit.
- Los tipos viven en **nuestros** tokens `--sc-font-size-*` (capa primitive) +
  bridge `sc-preset.ts` → `--p-*` — **nunca dentro de PrimeNG**.
- Las **`line-height`** NO se tocaron (diferidas, riesgo de layout) — ver deuda
  en `inconsistencies-backlog.md`. **(Decididas después en DD-13: "por regla".)**

> **Superado en parte por DD-13 (S72):** el *mecanismo* de esta DD (tokens en
> `--sc-*`, guard, `tokens:type-parity`) sigue intacto. Lo que cambia es la
> **escala** que viaja por él: de "snap a base-14" (decimales) a **redonda + rem
> root-16**. La escala tiene su hogar canónico en **DD-13**; esta DD se queda con
> el **blindaje**.

**Razón**: misma arquitectura unidireccional que color (DD-3) y escala (DD-10).
Como los tipos viven en `--sc-*` y el preset reenvía a `--p-*`, **un update de
PrimeNG no los borra** — el bridge sigue apuntando a nuestros valores. El único
riesgo residual es que PrimeNG renombre un slot `--p-*-font-size`, y eso lo caza
`tokens:type-parity` (queda detectable, no silencioso). Por eso **NO se vincula
`--sc-font-*` a la escala tipográfica de PrimeNG**: invertiría la arquitectura
(haría que nuestra identidad dependa de la suya).

**Consecuencias**:
- El cinturón migration-safe queda cerrado: badge/button/form-field ya estaban
  cubiertos desde S57/S62; ahora todo `font-size` accionable es token.
- `migration-safety.md` (racional de blindaje) y `tokens/README.md` (tooling:
  `tokens:type-parity`, escala base-14, guard Dura 4) **apuntan a esta DD**, no
  la duplican.
- Deuda diferida (line-heights Fase 4, tamaños display, contraste índice dark)
  trackeada en `inconsistencies-backlog.md`.

---

## DD-10 · 2026-05-27 (S62-ext) — Escala formalizada (ley `v/14`) + comprobador/generador de tokens, NO un generador que escriba las capas

**Contexto**: Rafa pidió "el arreglo definitivo anti-drift" para los tokens del Kit
Pro. La opción intuitiva era un **generador** que escribiera las capas `--sc-*` desde
el export. Pero la arquitectura (README, DD-1/DD-2) dice lo contrario: las 7 capas son
la fuente de verdad de la app; el export es contra lo que **comprobamos**.

**Opciones consideradas**: (a) generador que reescribe `01-primitive.css` desde el
export → invierte la arquitectura + riesgo de machacar lo curado (comentarios,
negativos, los 3 pasos custom). (b) comprobador robusto + formalizar la ley + un
generador SOLO-LECTURA que deriva el canónico y verifica.

**Decisión**: (b).
- La **escala** es una rampa única base-14: `--sc-scale-{m}` = `m × 14px`. El nombre
  se deriva del VALOR (`v/14`), nunca del string de la clave del export (es lossy:
  `scale125`=175=×12.5 vs `scale1125`=15.75=×1.125). Definición formal en
  `tokens/README.md §"The scale — formal definition"`. Radius = escala fija aparte
  (NO 14-base).
- `npm run tokens:parity` ampliado: sizing **valor↔valor** (37 checks: button/formField/
  tabs/tooltip/overlays) en vez de regex con literal hardcodeado (que dejaba pasar
  drift), + §5 informativa de tokens code-only con vecino más cercano (regla redondeo,
  memoria `feedback_snap_divergence_to_existing_token`), + **§6 COLOR de marca**
  (S62-ext-3): resuelve `--sc-*` a hex por la cadena `var()` y cruza la rampa primary
  (color/hover/active/contrast, light+dark) + surface↔gray + content contra el export.
  Cierra el punto ciego que dejó pasar el drift de `primary-hover` (lo cazó el ojo, no
  la herramienta) — divergencias de marca conscientes (info/warn/focus/dark-navy) van
  allow-listadas, no fallan.
- `npm run tokens:gen` (antes `tokens:scale`): deriva el set canónico `--sc-scale-*`
  **y `--sc-radius-*`** del export y verifica la ley de NOMBRES (que paridad no valida);
  `--emit` imprime los bloques. **NO reescribe** el CSS (eso es `--write`/`tokens:import`).
- Ambos corren en pre-commit.

**Razón**: el drift se vuelve imposible por construcción vía el CHECK (no vía un
generador que pelea con la arquitectura y arriesga lo curado). Datos > supuestos.

**Consecuencias**: re-exportar el Kit y sobrescribir `tokensprime.json` → `parity` +
`scale` cazan cualquier desalineación (valor o nombre) antes del commit. Flag abierto:
`17.5`/`35` figuran como Kit pero el export actual no los trae → reconciliar al
próximo re-export (`customs-catalog §4`).

**Addendum S62-ext-3 — pipeline import completo (`tokens:import` = `tokens:gen -- --write`)**:
el writer SCOPED ahora cubre **escala + radios** (dos zonas marcadas: `@sc-gen:scale … :end`
y `@sc-gen:radius … :end` en `01-primitive.css`; mirror mecánico del export). Sigue sin
ser el writer-libre que descartamos (que pisaba toda la capa); todo lo demás (colores,
navy, aliases, extras documentados) queda intacto.

**La cascada ahora llega a los componentes sin px a mano.** Antes `sc-preset.ts` fijaba
las métricas de componente con literales (`paddingX: '10.5px'`) — solo *comprobados* por
parity §4, no *generados*. Trust gap que Rafa señaló: "¿el puente solo cubre la escala?".
Fix: cada métrica del preset (button/formField/tabs/tooltip) es ahora una **referencia a
token generado** — `var(--sc-scale-0-75)`, `var(--sc-font-size-300)`, `var(--sc-radius-200)`
— porque todas caen exactas en la escala 14-base / radios / font-size del export. No hace
falta un generador de "métricas de componente" aparte: el preset apunta a los primitivos
generados y la cascada propaga. (Fiel a Figma, donde el componente también está vinculado
a la variable, no a un número.) Si un re-export reasigna un paso, parity §4 (valor↔valor)
lo caza loud.

Flujo completo: diseño cambia métrica/color en Figma → `tokensprime.json` → `tokens:import`
reescribe escala+radios → cascada (`--sc-spacing/font-size/line-height` aliases +
componentes + **preset por referencia**) propaga sola. Color de marca = decisión a mano
(no auto-import) pero **vigilada por parity §6**. Verificado idempotente. El CHECK
(`tokens:gen` + `tokens:parity`, pre-commit) es la garantía; el writer es la comodidad.

## DD-9 · 2026-05-25 (S60) — Icon set del SCDS = Material Symbols vía `<sc-icon>` (migración desde Lucide)

**Contexto**: la app usaba `lucide-angular` (`<lucide-icon [img]>`) como icon
set en ~140 ficheros. Rafa decidió migrar a **Material Symbols** (Google). El
no-goal "sin Material" del `apps/ds-docs/CLAUDE.md` se refiere a Angular Material
(componentes), NO a la font de iconos Material Symbols — aclarado y confirmado.

**Decisión**: nuevo wrapper SCDS **`<sc-icon name [size] [fill] [weight]>`**
(`packages/design-system/components/icon/`) que renderiza un glifo Material
Symbols Outlined por ligadura. Es la **única API de icono** del SCDS. La variable
font se carga en `index.html` de supervisor + ds-docs (Google Fonts CSS link).
Los campos de icono pasan de ref Lucide a **string** (nombre Material); los
contratos `[icon]` de los componentes SCDS (`empty-state`, `dialog`,
`section-card`, `page-header`, `form-section-nav`) cambian de tipo Lucide → `string`.

**Opciones consideradas**: (a) Material Symbols variable font + wrapper
[elegida] — cero deps npm, modulable (opsz/wght/FILL/GRAD), 1 API; (b) set SVG
vía `@ng-icons/material` — dep nueva, rechazada; (c) seguir en Lucide — descartado
por decisión de producto.

**Excepciones que SIGUEN en Lucide** (no migrar):
- **Iconos de marca** (GitHub) — Material Symbols no tiene glifos de marca.
- **`Loader2`** (spinner animado) — Material `progress_activity` necesitaría
  animación CSS propia; se mantiene el lucide-icon animado.
- Quedan 8 ficheros con import `lucide-angular` por estas 2 razones.

**Consecuencias**:
- `lucide-angular` permanece como dep (por los keepers) — NO se puede quitar del
  bundle todavía. Reevaluar en la auditoría de optimización.
- **Gotcha NG0919** (circular runtime, el build NO lo caza): un componente SCDS
  que importe `IconComponent` desde el barrel `@shared/components` se importa a sí
  mismo → circular. **Regla**: dentro de `packages/design-system/components/`,
  importar IconComponent por **ruta relativa** (`../icon/icon.component`), nunca
  por el barrel.
- **Pendiente** (auditoría DS): entry de `<sc-icon>` en customs-catalog (DD-7);
  2 botones `Trash2` (entity-form, rule-builder) aún en Lucide vs `delete`
  Material; self-host de la font para producción; tabla de mapping Lucide→Material
  documentada en `docs/NEXT-SESSION-PLAN.md`.

---

## DD-8 · 2026-05-20 (S47) — Naming SCDS wrappers alineado 1:1 con Kit Pro Figma + PrimeNG

**Contexto**: 7 wrappers SCDS tenían naming kebab-multi-word divergente con sus equivalentes en Kit Pro Figma SC y en PrimeNG. Por ejemplo `<sc-input>` cuando Figma tiene `❖ InputText` y PrimeNG tiene `<p-inputtext>`. Lo mismo con `multi-select`/`MultiSelect`, `input-number`/`InputNumber`, `toggle-switch`/`ToggleSwitch`, `modal`/`Dialog`, `tri-state-checkbox`/`Checkbox`, `input-group`/`InputGroup`.

La inconsistencia complicaba (a) audits Figma manuales (matching por concepto en vez de nombre literal), (b) Code Connect mapping futuro (necesita alias mapping en vez de match directo), (c) onboarding de devs nuevos (confusión naming).

**Opciones consideradas**:
- A. **Mantener naming SCDS** (kebab-multi-word, convención Polaris/Carbon). Pro: nada cambia. Contra: divergencia persistente, Code Connect requiere mapping manual, audits siempre por concepto.
- B. **Rename completo 7 wrappers** matching Kit Pro literal. Pro: 1:1 con Figma, Code Connect directo, audits literales. Contra: 6 commits separados, 60+ archivos por rename, tracker drift temporal, riesgo de regresión.

**Decisión**: **B** — rename completo en S47. Aplicado a los 7 wrappers que tienen equivalente PrimeNG/Figma:
- `<sc-input>` → `<sc-inputtext>` (PrimeNG `<p-inputtext>`, Figma `❖ InputText`)
- `<sc-input-number>` → `<sc-inputnumber>` (`<p-inputnumber>`, `❖ InputNumber`)
- `<sc-input-group>` → `<sc-inputgroup>` (`<p-inputgroup>`, `❖ InputGroup`)
- `<sc-multi-select>` → `<sc-multiselect>` (`<p-multiselect>`, `❖ MultiSelect`)
- `<sc-toggle-switch>` → `<sc-toggleswitch>` (`<p-toggleswitch>`, `❖ ToggleSwitch`)
- `<sc-modal>` → `<sc-dialog>` (`<p-dialog>`, `❖ Dialog`) — además class `ModalComponent` → `DialogComponent` y tokens `--sc-modal-*` → `--sc-dialog-*`
- `<sc-tri-state-checkbox>` → `<sc-checkbox>` (`<p-checkbox>`, `❖ Checkbox`) — además class `TriStateCheckboxComponent` → `CheckboxComponent`. El behavior tri-state queda en la API (`TriState` type + `cycle` output), no en el nombre.

**Razón**: alineación literal beneficia long-term mantenimiento (audits, Code Connect, onboarding). El coste mecánico (60+ archivos por rename, mass-replace con Python) es one-shot y se ejecuta con tsc verde como guarda.

**Consecuencias**:
- **Pure-sc components SIN equivalente Figma se mantienen** con su naming descriptivo del dominio: `<sc-search>`, `<sc-bulk-action-bar>`, `<sc-empty-state>`, `<sc-form-danger-zone>`, `<sc-form-section-nav>`, `<sc-confirm-host>`, `<sc-label-chip>`, `<sc-color-dot-picker>`, `<sc-inline-rename-cell>`, `<sc-group-popover>`, `<sc-column-selector>`, `<sc-command-palette>`, `<sc-keyboard-shortcuts>`, `<sc-delete-entity-dialog>`, `<sc-impact-preview-dialog>`, `<sc-page-header>`, `<sc-sticky-form-header>`, `<sc-section-card>`, `<sc-photo-upload>`, `<sc-illustrated-avatar>`, `<sc-bulk-edit-menu>` (Backlog #43).
- **CSS classes intra-componente también renombradas** para coherencia 1:1 selector ↔ classes (`.sc-input__label` → `.sc-inputtext__label`).
- **SESSION-LOG.md NO se toca** — historia inmutable. Solo docs vivos.
- **Class names mantenidas cuando ya eran correctas** (`InputNumberComponent`, `InputGroupComponent`, `MultiSelectComponent`, `ToggleSwitchComponent`). Renombradas las divergentes (`Input→InputText`, `Modal→Dialog`, `TriStateCheckbox→Checkbox`).
- **Type aliases TS sin cambio** (`ScInputSize`, `ScInputType`, etc.) — son etiquetas, no afectan API consumer.

**Regla portable post-S47**: cualquier wrapper SCDS nuevo que tenga equivalente PrimeNG nace con naming `sc-XYZ` matching `<p-XYZ>` literal. NO `sc-x-y-z`.

---

## DD-7 · 2026-05-20 (S46) — Política tokens: toda primitive nueva entra en customs-catalog

**Contexto**: en S46 cociné `--sc-font-family-mono` en `01-primitive.css` sin entry en `customs-catalog.md` ni ping al equipo de diseño. Rafa detectó que esto puede crear drift entre código y Figma SC (si el equipo de diseño no sabe que el token existe, no puede referenciarlo al construir specs).

**Decisión**: **toda primitive nueva añadida al SCDS requiere entry en `customs-catalog.md`** con: razón concreta, valor, consumers actuales, plan para Figma SC Variables collection, decisión pendiente el equipo si aplica.

**Razón**: el customs-catalog es la fuente única que el equipo de diseño consulta al actualizar el Kit Pro de Figma. Si un token vive solo en código, se desalinea silenciosamente.

**Consecuencia**: el checklist anti-divergencia (`customs-catalog §0`) ahora aplica también a primitives nuevas, no solo a overrides de Aura.

---

## DD-6 · 2026-05-15 (S33) — `"sideEffects": false` en SCDS package

**Contexto**: bundle AED initial 1.61 MB. `source-map-explorer` reveló que el bundler estaba importando módulos enteros del package SCDS por imports transitivos.

**Decisión**: `"sideEffects": false` en `packages/design-system/package.json`.

**Razón**: tree-shaking efectivo. Resultado inmediato: bundle 1.61 MB → 1.41 MB (-200 KB, bajo budget 1.5 MB del momento).

**Consecuencia**: cualquier futuro componente con CSS side-effect debe declararse explícitamente en el array `sideEffects` del package.json para no romper esto.

---

## DD-5 · 2026-05-15 (S32) — Política minimal customization sobre PrimeNG

**Contexto**: tendencia a crear componentes pure-sc cuando PrimeNG ya tenía el patrón. Riesgo: maintenance cost se dispara cuando PrimeNG actualiza minor versions.

**Decisión**: **customizar lo MÍNIMO** sobre PrimeNG. Antes de cocinar pure-sc nuevo, 3 preguntas obligatorias:
1. ¿PrimeNG ya lo tiene? → wrapper.
2. ¿`pTemplate` cubre el render? → usar slot.
3. ¿PrimeNG NO lo tiene? → pure-sc + entry catalog.

**Razón**: PrimeOne upgrade dry-run se vuelve trivial si SCDS es mayoritariamente wrappers. Cocinar pure-sc duplicado de algo que ya existe es deuda permanente.

**Consecuencia**: refactors S32 (`sc-toggleswitch`, `sc-bulk-edit-menu`) y declines justificados (`inline-rename-cell`, `label-chip`).

---

## DD-4 · 2026-05-15 (S32) — Regla 2+ consumers antes de promover a SCDS

**Contexto**: tentación de promover patrones a SCDS "por si los necesitamos en el futuro". Resultado: catálogo inflado con componentes sin uso real.

**Decisión**: un componente entra al package SCDS cuando:
- (a) se usa en ≥2 lugares de AED, **O**
- (b) es parte explícita de SCDS por decisión de diseño (equipo de diseño).

**Razón**: minimizar surface area. Patrón usado solo 1 vez = vive donde se usa.

**Consecuencia**: gaps documentados en `customs-catalog §5` (`sc-select-button`, `sc-tag`, `sc-toggle-button`) esperan trigger real, no se cocinan.

---

## DD-3 · 2026-05-14 (S31) — Brand divergence: navy primary + electric-blue info + amber warn

**Contexto**: la base Aura usa azul saturado para primary, sky-blue para info, orange para warn. SC tiene identidad propia: navy oscuro para primary, electric-blue saturado para info, amber para warn (no orange).

**Decisión**: overrides en `sc-preset.ts` mapean `--p-*` a `--sc-color-*` SC. Entries 1.1, 1.2, 1.3 del customs-catalog.

**Razón**: identidad de marca Smart Contact. Verificado contra Figma Kit Pro 1:1.

**Consecuencia**: re-sync con PrimeOne upstream nunca toca estos overrides automáticamente. Si Aura cambia su default, SC sigue navy.

---

## DD-2 · 2026-05-14 (S30) — Bridge `sc-preset.ts` como source of truth `--p-*` ↔ `--sc-*`

**Contexto**: PrimeNG 21 expone tokens `--p-*`. SCDS expone `--sc-*`. Necesitábamos un punto único donde mapear los dos sistemas para que cambiar identidad SC no requiera tocar PrimeNG.

**Decisión**: `packages/design-system/tokens/sc-preset.ts` (export `ScPreset`) es el bridge canonical. Componentes consumen `--sc-*`; el preset reenvía a `--p-*` automáticamente.

**Razón**: arquitectura unidireccional. Componentes nunca consumen `--p-*` directamente. Cambiar identidad → cambiar `--sc-*` → bridge propaga.

**Consecuencia**: `sc-preset.ts` es **load-bearing** — no se puede mover, renombrar ni simplificar. Documentado en `migration-safety.md`.

---

## DD-1 · 2026-05-13 (S29) — Tokens en 7 capas CSS

**Contexto**: tokens dispersos en múltiples archivos sin jerarquía. Difícil saber qué cambiar al modificar identidad.

**Decisión**: tokens organizados en 7 capas CSS (`packages/design-system/tokens/layers/`):
1. `01-primitive.css` — raw values (color scales, font, spacing, radius).
2. `02-semantic.css` — aliases semánticos (`--sc-text-primary`, `--sc-bg-default`).
3. `03-palette.css` — color palette por categoría (labels).
4. `04-component.css` — tokens por componente (`--sc-modal-radius`).
5. `05-extensions.css` — z-index scale, motion, shadows, layout dims.
6. `06-primeng-bridge.css` — (legacy, marcado dead code en S29 audit).
7. `07-dark.css` — overrides dark mode.

**Razón**: cascada estable y auditable. Cada capa tiene una responsabilidad clara.

**Consecuencia**: los componentes consumen tokens de capa 2-4 (semánticos / componente), nunca de capa 1 directamente (excepto raros casos donde primitive ES el semantic).

---

Última actualización: 2026-06-02 (Session 67).
