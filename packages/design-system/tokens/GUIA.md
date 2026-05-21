# Guía del sistema de tokens (para diseño)

> Hola 👋. Esta guía es para ti si vienes de **Figma** y quieres
> entender cómo lo que dibujas en el design system de Smart Contact
> aterriza en el producto, qué partes puedes tocar tranquilamente, y
> dónde es mejor preguntar antes de mover algo.
>
> No hace falta saber programación. Todo se explica con palabras
> normales y ejemplos muy concretos. Si después de leer algo te
> quedas con dudas, pregunta — la guía está viva.
>
> El [`README.md`](./README.md) técnico que vive en esta misma
> carpeta cuenta lo mismo pero en lenguaje de desarrollo. Si te
> sientes cómoda con la parte técnica, úsalo de referencia. Si no,
> esta guía te basta.

---

## El mapa mental: dos mundos, un puente

El design system de Smart Contact tiene **dos representaciones**
del mismo color (o radio, o espaciado, o lo que sea):

- **En Figma** — donde tú decides. La variable se llama, por
  ejemplo, "Brand / Primary".
- **En código** — donde el producto la consume. La misma
  variable se llama `--sc-bg-primary`.

```
       MUNDO DE DISEÑO                      MUNDO DEL CÓDIGO
       (Figma)                              (CSS variables)
       ────────────                         ─────────────────
       "Brand / Primary"                    --sc-bg-primary
       valor: #1B273D                       valor: #1B273D
           │                                       │
           │                                       │
           │     ─── son el MISMO valor ───        │
           │     con dos representaciones          │
           │                                       │
           └─── tú decides el valor ───────────────┘
                aquí (en Figma)
```

Cuando alguien actualiza el valor en Figma, ese mismo valor
también se cambia en código en **un único sitio**
(`layers/01-primitive.css`). A partir de ahí, todo el producto
hereda solo.

### ¿Y PrimeNG dónde entra?

PrimeNG es la **librería de componentes** que usamos para tablas,
modales, dropdowns, toasts, etc. Trae sus propias variables
(`--p-*`) que por defecto apuntan a un tema genérico (Aura).

Para que PrimeNG hable AED en vez de Aura, tenemos un archivo
**puente** (`aed-preset.ts`) que redirige cada `--p-*` al
`--sc-*` correspondiente. Así:

```
   FIGMA  ──→  --sc-bg-primary  ──→  --p-primary-color
   (tú)         (código AED)         (PrimeNG consume)
                     ↑                       ↑
                     │                       │
                  decisión               se entera por
                  de diseño              el puente
                                         (aed-preset.ts)
```

**La regla de oro:** si quieres cambiar algo del producto, se
cambia en Figma + en el `--sc-*` correspondiente. PrimeNG hereda
por el puente, sin tocar el componente. Tú nunca declaras un
`--p-*` a mano.

---

## Las plantas del sistema (la cascada)

Piensa en los tokens como un edificio. Cuanto más abajo, más
"crudo" es el valor. Cuanto más arriba, más cerca está de un
componente concreto.

El sistema tiene **7 plantas en total** (las verás numeradas
así en el `README.md` técnico y en los nombres de los archivos
en `layers/`):

```
   PLANTA 7: dark mode        overrides oscuros del producto
   ─────────────────────       (DESACTIVADA — AED es light-only)
   PLANTA 6: bridge PrimeNG   conecta --p-* (PrimeNG) con --sc-*
   ─────────────────────       (cocina interna, vive en aed-preset.ts)
   PLANTA 5: extensiones      z-index, motion, sombras del producto
   ─────────────────────       (cosas que PrimeNG no contempla)
   PLANTA 4: componentes      "el botón primario por dentro"
   ─────────────────────       (specs concretas de un componente)
   PLANTA 3: paleta dominio   estados de agente, prioridad de grupo
   ─────────────────────       (cosas únicas de AED — labels, etc.)
   PLANTA 2: semántica        "fondo de superficie", "borde de error"
   ─────────────────────       (el rol que cumple un color)
   PLANTA 1: primitivos       el azul-500 crudo, los 12px, el radio-200
   ─────────────────────       (los valores absolutos)
```

**Para ti como diseñadora, las 5 plantas que importan son la 1
hasta la 5.** Las plantas 6 y 7 existen pero no las tocas
nunca:

- **Planta 6 (bridge PrimeNG)** — un "traductor" que vive en el
  archivo `aed-preset.ts`. Su único trabajo es decir "el color
  primario de PrimeNG ES el `--sc-bg-primary` de AED". Es código
  TypeScript, no CSS. El dev team lo gestiona; tú no escribes ahí.
- **Planta 7 (dark mode)** — un archivo (`07-dark.css`) que
  redefine los colores cuando alguien activa modo oscuro. AED
  está **siempre en modo claro** por decisión de marca
  (operadores en oficinas iluminadas, ergonomía > estética). Esa
  planta existe por arquitectura pero está apagada.

### ¿Cuándo está cada cosa en cada planta?

**Planta 1 — primitivos**
Son los valores absolutos sin contexto. Como decir "azul 500" sin
explicar para qué.

Ejemplos: `--sc-color-blue-500`, `--sc-spacing-1-125`,
`--sc-radius-200`.

**Planta 2 — semántica**
Aquí los primitivos cobran sentido: "el azul 500 ES el color de
marca". Esta planta dice qué papel juega cada valor.

Ejemplos: `--sc-bg-primary` (= azul 500, pero con nombre que
significa algo), `--sc-text-secondary`, `--sc-border-default`.

**Planta 3 — paleta de dominio**
Cosas únicas de Smart Contact que PrimeNG no entiende: estados de
un agente (disponible, baño, comida...), prioridad de un grupo,
colores de etiquetas.

Ejemplos: `--sc-presence-available`, `--sc-priority-medium`.

**Planta 4 — componentes**
La receta concreta de un componente: "el botón primario lleva ESTE
fondo, ESTE borde y ESTA altura".

Ejemplos: `--sc-btn-primary-bg`, `--sc-modal-radius`,
`--sc-toast-padding-x`.

**Planta 5 — extensiones**
Cosas que PrimeNG no modela porque van más allá de los componentes
sueltos: la capa de z-index, la velocidad de las animaciones, las
sombras del producto.

Ejemplos: `--sc-z-modal`, `--sc-transition-fast`,
`--sc-shadow-card`.

---

## ¿Qué puedo tocar y qué no?

### ✅ Puedes tocar tranquilamente (en Figma + avisas)
- **Valores semánticos** que ya existen: si decides que el
  `--sc-text-secondary` debe ser un gris distinto, eso se cambia
  en un solo sitio (planta 2) y se propaga a todo.
- **Estilos de un componente concreto** definidos en planta 4
  (botón, modal, toast): el padding, el radio, la altura. Cambian
  en un sitio y afectan a ese componente en toda la app.
- **Paleta de dominio** (planta 3): los colores de presencia de
  agente, la prioridad de un grupo. Son nuestros, podemos jugar.

### ⚠️ Toca con cuidado (mejor coordinarlo)
- **Primitivos** (planta 1): si cambias el `--sc-color-blue-500`,
  cambia TODO lo que use azul 500 en cualquier capa por encima.
  Es como mover la viga maestra del edificio. Hazlo cuando
  toca un rediseño grande, no para un retoque puntual.
- **Tipografía y escalas**: cambiar la fuente o reescalar los
  tamaños afecta a TODO el producto. No te frenes si toca, pero
  avísanos para validar en pantallas.

### 🚫 Mejor no toques (déjalo al dev team)
- **Planta 6 — `aed-preset.ts`**: el "bridge" entre PrimeNG y AED.
  NUNCA se declaran variables `--p-*` a mano; este archivo ya
  enlaza cada una con un `--sc-*`. Si necesitas que un componente
  de PrimeNG se vea distinto, lo correcto es cambiar el `--sc-*`
  al que ya está apuntando, no inventar variables nuevas.
- **Planta 7 — `07-dark.css`**: modo oscuro. Está apagado por
  decisión de marca, pero el archivo existe. No lo tocamos sin un
  cambio de estrategia explícito.
- **El orden de las plantas** (la cascada): si añades un valor en
  la planta equivocada, se pueden producir bucles infinitos o que
  el modo oscuro no funcione si algún día se activara.
- **Archivos en `src/app/core/tokens/layers/`** directamente sin
  hablarlo: si necesitas un valor nuevo, hablamos para decidir en
  qué planta vive.

---

## El UI Kit de PrimeOne en Figma — cómo conviven

Esto es lo que probablemente más confunde, porque hay **tres
librerías de Figma trabajando a la vez**:

```
   ┌─────────────────────────┐
   │  1. PrimeOne UI Kit     │   ← descargada de PrimeNG, intocable
   │     (original oficial)  │      (es la fuente upstream)
   └─────────────────────────┘
                │
                │  duplicada en el equipo
                ▼
   ┌─────────────────────────┐
   │  2. PrimeOne — Duplicado│   ← copia compartida, casi intocable
   │     del equipo Smart    │      (sólo se toca su modo "custom")
   │     Contact             │
   └─────────────────────────┘
                │
                │  consumida + extendida
                ▼
   ┌─────────────────────────┐
   │  3. Smart Contact       │   ← tu librería propia: aquí vives
   │     Design System       │      (componentes nuevos, marca,
   │                         │       overrides finos)
   └─────────────────────────┘
```

### ¿Por qué no se toca el original/duplicado de PrimeOne?

Porque PrimeNG publica **versiones nuevas** cada cierto tiempo
(añaden componentes, renombran tokens, ajustan estructuras). Cada
vez que el equipo actualiza la versión del kit, lo que tú
modificaste en el original se pierde o entra en conflicto.

La regla de los kits de terceros: **modifica en la zona que ellos
te dejan tocar, y NO toques nada fuera de esa zona.** Para
PrimeOne esa zona se llama "Custom mode" o "Custom page"
(depende de la versión del kit que tengáis).

### ¿Qué hay en el "Custom mode"?

Variables que PrimeOne ha marcado como "override-friendly". Cada
una está pensada para que la sobreescribas con tus valores:

- **Colores**: la escala `primary` (50-950), la escala `surface`
  (50-950), colores de estado (success, warning, danger, info).
- **Tipografía**: font family, tamaños base, line-heights.
- **Radio**: escala completa (xs, sm, md, lg, xl).
- **Spacing**: la escala del kit.
- **Tokens específicos por componente** que el kit expone:
  `formField.paddingX`, `formField.borderRadius`,
  `overlay.modal.borderRadius`, etc.

Todo lo que está dentro del Custom mode **viaja contigo** cuando
el dev team actualiza la versión de PrimeNG — porque el código
también lee del mismo "puente" (el `aed-preset.ts`) que respeta
esos overrides.

### Mapa mental: Figma "Custom mode" ↔ código `aed-preset.ts`

Son **el mismo mecanismo** en dos sitios:

```
  FIGMA                            CÓDIGO
  ─────                            ──────
  PrimeOne UI Kit (original)       PrimeNG Aura (preset upstream)
         ↑                                ↑
         │ overrides en…                  │ overrides en…
         │                                │
  Custom mode (Figma)              aed-preset.ts (código)
         │                                │
         └─── mismas decisiones ──────────┘
              en dos representaciones
```

Cuando defines `primary-500: #1B273D` en el Custom mode de Figma,
el dev team replica `primary.500: 'var(--sc-color-blue-500)'` en
`aed-preset.ts` con el mismo valor. Mismo concepto, dos sitios.

### ¿Qué puedo tocar y qué no? (versión PrimeOne)

| Zona | ¿Tocar? | Notas |
|---|---|---|
| **Custom mode / page** del duplicado | ✅ SÍ | Es exactamente para esto. Cambia colores, fuentes, radios, spacing, tokens de componentes que PrimeOne expone. |
| **Tokens base (no-custom)** del duplicado | 🚫 NO | Lo que toques aquí se pisa o entra en conflicto en la próxima migración de PrimeNG. |
| **Componentes** del UI Kit (anatomía interna del botón, modal, dropdown) | 🚫 NO | Mismo motivo: en cada migración se sobreescriben. Si necesitas un comportamiento distinto, hablamos. |
| **Crear componentes NUEVOS** que PrimeOne no incluye (ej. tu propio `agent-channel-table`) | ✅ SÍ | Pero en TU librería (Smart Contact), no dentro del duplicado de PrimeOne. |
| **Añadir tokens NUEVOS con prefijo propio** (`sc-presence-*`, `sc-priority-*`) | ✅ SÍ | En tu librería. No chocan con los de PrimeOne. |
| **Renombrar / eliminar** variables del kit original | 🚫 NO | Aunque parezca que sobran, son contrato con PrimeNG. |

### Caso concreto: ¿puedo cambiar el padding de un botón?

**Depende de CÓMO lo cambies.** Esta es la trampa que más gente
pisa:

- ✅ **Vía token**: si cambias el valor del token
  `formField.paddingX` (o `button.paddingX`, según versión) en el
  Custom mode, el botón se ajusta. Esto **NO se rompe** en
  migraciones, porque PrimeNG mantiene ese token como contrato.
  El dev team replica el mismo cambio en `aed-preset.ts` y queda
  alineado.
- 🚫 **Manualmente en el componente**: si entras al frame del
  botón y cambias el padding "a mano" desde el panel de
  propiedades de Figma, eso es una modificación local del
  componente. En la próxima actualización del kit, ese padding
  vuelve al valor original y pierdes el cambio.

**Regla**: si el cambio se puede expresar como "cambiar un valor
en Custom mode", hazlo así. Si te pide cambiar la estructura del
componente, ese tipo de customización no la soportan los kits de
terceros — hay que hablarlo.

### ¿Qué pasa si PrimeNG saca una versión nueva?

1. El dev team actualiza la dependencia (`npm update primeng`).
2. Los tokens NUEVOS que PrimeNG añade quedan en sus defaults
   (Aura) hasta que decidamos overrideearlos.
3. Los tokens que YA teníamos overrideados en `aed-preset.ts`
   siguen funcionando — porque el contrato (`primary.500`,
   `formField.paddingX`, etc.) se mantiene.
4. En Figma: igual. Tu Custom mode sigue intacto. Si PrimeNG
   añade tokens nuevos, los verás disponibles para overridear si
   quieres.
5. **Lo único que se rompería** es si tocaste cosas fuera de
   Custom mode (anatomía de componentes, tokens base no-custom).
   De ahí la regla.

---

## Temas, Theme Designer, handoff y migraciones (el nitty gritty)

Esta es la sección "para entender de verdad cómo funciona la
maquinaria". No la necesitas leer de un tirón — usa el índice
para ir al apartado que te toque.

### 1. ¿Qué es un "tema" en PrimeNG?

PrimeNG (la librería de componentes) no impone una apariencia
concreta. En su lugar trae **temas-base** ("presets") entre los
que eliges uno:

- **Aura** — el moderno, minimalista, con tipografía limpia y
  shadows sutiles. **Es el que usamos.**
- **Lara** — el clásico de PrimeNG, más cuadrado, padding más
  generoso. Se siente "enterprise" tradicional.
- **Nora** — ultra minimalista, casi sin sombras, muy plano.
- **Material** — Google Material Design.

**¿Por qué Aura?** Porque es el más cercano al ADN visual del
brand AED (calm · dense · operational) — formas suaves sin ser
infantiles, type ramp limpia, transiciones discretas. Lara o
Material habrían pedido más fight para encajar.

Nuestro `aed-preset.ts` hace `definePreset(Aura, { ... overrides })`:
arranca de Aura y reemplaza solo los valores que queremos pisar.
Lo que no overrideamos, **hereda de Aura** automáticamente.
Cuando Aura saca una versión nueva, recibimos las mejoras
generales sin tocar nada.

### 2. Theme Designer (la herramienta de PrimeNG)

PrimeNG vende una herramienta llamada **Theme Designer**
(https://designer.primeng.org). Es un playground visual con
preview en vivo:

- Tú (o el dev team) abre Theme Designer
- Eliges Aura como base
- Modifica tokens en una UI con sliders, color pickers, etc.
- Ves el resultado al instante en componentes reales (botones,
  modales, tablas, dropdowns)
- Al final exporta un JSON o snippet de TypeScript

**Quién lo usa:**
- **Dev team**: principalmente. Es la forma más rápida de
  iterar valores antes de pegarlos en `aed-preset.ts`.
- **Diseño**: útil para validar que un cambio del Custom mode
  de Figma se ve como esperas en componentes reales. Si tu
  diseño en Figma de un modal queda "casi pero no exacto" al
  llegar al producto, Theme Designer permite ver la diferencia
  exacta y aislar qué token está mal mapeado.

**Diferencia con el UI Kit de Figma:**

| | Figma UI Kit | Theme Designer |
|---|---|---|
| **Qué muestra** | Componentes en estado estático para diseñar pantallas | Componentes en vivo, interactivos, con todos los estados |
| **Para qué sirve** | Diseñar el flujo y maquetar pantallas con los componentes correctos | Validar valores de tokens y exportar config |
| **Quién lo usa** | Diseño principalmente | Dev principalmente, diseño puntualmente |
| **Output** | Frames de Figma para handoff | JSON / preset code para pegar en aed-preset.ts |
| **Coste** | Free | Free tier + Pro de pago |

Theme Designer **no es obligatorio**. Puedes editar
`aed-preset.ts` a pelo si sabes qué tokens necesitas. Es un
acelerador para iteración visual rápida.

### 3. Los 5 niveles de customización (de menos a más invasivo)

Cada vez que necesitamos que un componente de PrimeNG se vea
distinto, tenemos 5 herramientas. **Siempre empezamos por el
nivel 1 y solo subimos si el anterior no llega.**

```
   NIVEL 5: Fork del componente              (último recurso)
   ──────────────────────────                ⬆
   NIVEL 4: Wrapping (composición)           ⬆
   ──────────────────────────                ⬆ más invasivo
   NIVEL 3: CSS overrides (::ng-deep)        ⬆
   ──────────────────────────                ⬆
   NIVEL 2: PassThrough (pt prop)            ⬆
   ──────────────────────────                ⬆
   NIVEL 1: Token override (preset)          ⬆  ← empieza aquí
```

**Nivel 1 — Token override en `aed-preset.ts`.**
Es lo que estamos haciendo siempre que se puede. Cambias el valor
de un token (color, padding, radius, shadow) y se aplica a TODOS
los componentes que usen ese token. Sobrevive migraciones de
PrimeNG porque los nombres de tokens son contrato estable.
- *Ejemplo*: queremos los inputs con un borde más sutil →
  `formField.borderColor: 'var(--sc-border-subtle)'`.

**Nivel 2 — PassThrough (`pt` prop) puntual.**
PrimeNG expone una prop `pt` en cada componente para inyectar
clases o estilos en sub-elementos sin tocar el tema global.
Útil cuando UN sitio concreto necesita algo distinto y el resto
queda como está.
- *Ejemplo*: un `<p-dialog>` de bienvenida con un padding mayor
  que el resto: `<p-dialog [pt]="{root: {style: 'padding: 32px'}}">`.
- ⚠️ Si te encuentras usándolo en muchos sitios, es señal de
  que deberías subir al Nivel 1 (crear un token).

**Nivel 3 — CSS overrides con `::ng-deep`.**
Cuando ni el tema ni `pt` te dejan llegar a un detalle (por
ejemplo, una animación interna del componente), puedes usar
`::ng-deep .p-dropdown-panel { ... }` en el SCSS local.
- ⚠️ Frágil: PrimeNG puede renombrar `.p-dropdown-panel` en
  una versión futura y tu CSS deja de funcionar silenciosamente.
- Documentar siempre: "Override por X razón, revisar al subir
  versión PrimeNG".

**Nivel 4 — Wrapping (componente Angular propio).**
Envuelves el componente de PrimeNG en uno tuyo (`<aed-button>`
que internamente renderiza `<p-button>`) y expones SOLO la API
que tú quieres. PrimeNG queda como detalle de implementación
oculto.
- *Ejemplo*: `<aed-status-pill>` que internamente es un
  `<p-tag>` con configuración fija. Si mañana decides cambiar a
  un componente propio puro, los consumidores de `<aed-status-pill>`
  no se enteran.
- Ya lo hacemos para: `<aed-modal>`, `<aed-toggle-switch>`,
  `<aed-illustrated-avatar>`, etc.

**Nivel 5 — Fork del componente.**
Copiar el código fuente del componente de PrimeNG a nuestro
proyecto y modificarlo. **Es el último recurso.** Cualquier
mejora futura de PrimeNG (bug fixes, accesibilidad, performance)
no llega — has roto el vínculo con upstream.
- Solo si no hay otra forma. Y se documenta como DD (decision
  doc) en `DECISIONS.md` con justificación.

### 4. Handoff diseño ↔ dev — el ciclo completo

#### Caso A — Cambio de un valor existente

```
   DISEÑO                                  DEV
   ──────                                  ───
   1. Cambia valor en                      
      Custom mode (Figma)                  
                                           
   2. Mensaje al dev team:                 
      "Cambié primary-700: #1B273D         
       → #1C2840 en Custom mode"           
                                           
   3.                          →           4. Replica el valor en
                                              aed-preset.ts en una
                                              línea (o en el
                                              primitive layer si
                                              es un primitivo)
                                           
                                           5. PR + deploy preview
                                           
   6. Verifica en deploy        ←
      preview que se ve como    
      en Figma                  
                                           
                                           7. Merge si OK
```

#### Caso B — Componente nuevo (no existe en PrimeOne)

```
   DISEÑO                                  DEV
   ──────                                  ───
   1. Crea el componente en                
      TU librería Smart Contact            
      (no en el duplicado de Prime)        
                                           
   2. Define props/variants               
      explícitos en Figma                  
                                           
   3. Documenta: cuándo se usa,            
      qué tokens consume, qué              
      estados tiene                        
                                           
   4.                          →           5. Construye un componente
                                              Angular propio que
                                              consume --sc-* tokens.
                                              Vive en
                                              src/app/shared/components/
                                           
                                           6. Si reusa componentes de
                                              PrimeNG por dentro, los
                                              envuelve (Nivel 4 de
                                              customización)
```

#### Caso C — Bug / inconsistencia visual encontrada

```
   DISEÑO                                  DEV
   ──────                                  ───
   1. Captura de pantalla del              
      bug en el producto                   
                                           
   2. Captura del mismo                    
      componente en Figma                  
      (cómo debería verse)                 
                                           
   3. Inspecciona en Figma:                
      "el padding aquí es 12,              
       pero en el producto está            
       en 16. El token usado es            
       formField.paddingX"                 
                                           
   4.                          →           5. Compara con aed-preset.ts.
                                              Posibilidades:
                                              a) El token no está
                                                 mapeado y cae a Aura
                                                 default → mapearlo
                                              b) El componente usa
                                                 otro token distinto
                                                 → corregir el mapeo
                                              c) Override CSS local
                                                 lo está pisando →
                                                 quitarlo
                                           
                                           6. PR con la corrección
```

### 5. Migraciones de PrimeNG — qué esperar

PrimeNG publica versiones siguiendo SemVer:

- **Patch (21.0.5 → 21.0.6)**: bug fixes, sin cambios visuales
  notables. Aceptamos automáticamente, salvo regresiones.
- **Minor (21.0 → 21.1)**: nuevos componentes, nuevos tokens,
  ajustes menores. Revisamos changelog, testeamos en branch,
  mergeamos si todo bien.
- **Major (21 → 22)**: API breaking changes, tokens renombrados
  o eliminados, posibles cambios visuales grandes. **Es un
  proyecto pequeño en sí mismo** — branch dedicada, review
  visual exhaustivo, posibles ajustes en `aed-preset.ts`.

**Qué se rompe y por qué:**

| Caso | ¿Se rompe? | Por qué |
|---|---|---|
| Aura saca shadows nuevas más sutiles | NO — mejoramos solos | Como overrideamos solo lo que queremos, lo no-overrideado hereda mejoras |
| PrimeNG renombra `formField.paddingX` → `input.paddingX` | SÍ silenciosamente | Nuestro override sigue apuntando al nombre viejo. Componente cae a default Aura para el nuevo nombre. Síntoma: padding "raro" en inputs |
| PrimeNG añade un componente nuevo (`<p-stepper>`) | NO | Nos lo encontramos disponible. Si lo usamos, decidimos qué overridear |
| PrimeNG elimina un componente deprecado | SÍ duro | Tenemos que migrar a la alternativa. Es un cambio mayor — se planifica |
| PrimeNG cambia anatomía interna (`.p-button-icon` → `.p-button-svg`) | SÍ si tenemos overrides CSS | Nuestro `::ng-deep` deja de matchear. Nivel 3 es frágil por esto |
| PrimeNG cambia el shape del preset (e.g. `colorScheme.light.surface` → `colorScheme.light.background`) | SÍ duro | `aed-preset.ts` no compila. Lo arreglamos antes de mergear |

**Nuestro proceso para una migración:**

1. **Lectura del changelog** completo de la versión.
2. **Branch dedicada** (`chore/primeng-22`).
3. `npm update primeng @primeng/themes` en esa branch.
4. **Lista de gaps**: tokens renombrados, componentes deprecados,
   props cambiadas. Resolver uno a uno.
5. **Visual smoke test** en deploy preview: navegar por las
   pantallas principales (agentes, grupos, usuarios, config) y
   buscar diferencias contra `main`.
6. **Si hay cambios visuales no deseados**: añadir overrides en
   `aed-preset.ts` para volver al look anterior, o aceptar los
   cambios si son mejoras.
7. **PR con captura de antes/después** de cualquier diferencia
   visual significativa.
8. **Merge** cuando dev + diseño hayan validado.

### 6. Gotchas — cosas a tener en cuenta siempre

**Tokens silenciosamente renombrados.**
PrimeNG a veces renombra un token sin marcarlo como breaking
porque "el valor sigue existiendo bajo otro nombre". Pero
nuestro override apuntaba al nombre viejo. Síntoma: una zona
del producto vuelve sutilmente a valores de Aura por defecto.
**Solución**: en cada migración, listar nuestros overrides y
verificar que cada uno sigue siendo un nombre válido en la
nueva versión.

**Dark mode aunque esté apagado.**
Nuestro `aed-preset.ts` define overrides para `colorScheme.dark`
aunque AED esté en light-only. Esto es intencional para no
romper si algún día se activa. Pero ojo: si añades un token
nuevo solo al `colorScheme.light`, en el momento que alguien
active dark mode ese token caerá a default Aura → drift.
**Solución**: cuando añadas un override en `light`, añade
también el equivalente en `dark` aunque no se vaya a usar.

**PassThrough no escala.**
`pt` es perfecto para 1-2 sitios. Si lo usas en 10 sitios para
el mismo componente, estás creando un mini-tema paralelo. Subir
al Nivel 1 (token en preset) y consolidar.

**`::ng-deep` está marcado como deprecated en Angular.**
Funciona, lo usamos, pero Angular lo etiqueta como "podría
desaparecer". Por ahora no hay alternativa real para penetrar
en componentes externos. **Solución**: minimizar el uso,
prefiriendo Nivel 4 (wrapping) cuando se pueda.

**Custom mode en Figma no soporta TODOS los tokens de PrimeNG.**
Solo los que el equipo de PrimeNG marcó como customizables en su
kit. Si necesitas overridear un token que NO está en Custom
mode (raro pero pasa), Theme Designer es la herramienta
correcta — y luego se traduce a `aed-preset.ts`.

---

## Casos típicos (formato STAR)

> STAR = **S**ituación · **T**area · **A**cción · **R**esultado.
> Lee solo el caso que te toque ahora mismo.

### Caso 1 — "Cambié un color de marca en Figma. ¿Cómo lo paso?"

- **Situación**: En Figma actualizaste el "Primary / 700" del
  design system de un azul oscuro a otro azul un poco diferente.
- **Tarea**: Que el producto entero refleje el cambio: botones
  primarios, links, focus rings, fondos de selección...
- **Acción**: Pásanos el **nuevo hex** (ej. `#1b273d` → `#1c2840`).
  El dev team lo cambia en **un solo sitio** —
  `layers/01-primitive.css`, en la línea
  `--sc-color-blue-700: #1b273d;`. Nada más.
- **Resultado**: TODO lo que usaba ese azul (botones, links,
  pills, focus, sombras tintadas) se actualiza solo. Incluyendo
  los componentes de PrimeNG, porque heredan vía `--sc-bg-primary`.

✨ **No tienes que tocar 80 sitios.** Toca uno, propaga a todos.

---

### Caso 2 — "Quiero un color de fondo que no existe (ej. un verde-menta)"

- **Situación**: Diseñaste una sección nueva (ej. "Configuración
  avanzada > Bienestar del agente") y le pusiste un fondo verde
  menta que no está en el design system.
- **Tarea**: Saber si vale la pena añadirlo al sistema o si
  encaja con algo que ya tenemos.
- **Acción**:
  1. Mira primero en `layers/01-primitive.css` si tenemos un
     verde parecido (probablemente sí: `--sc-color-green-50`
     hasta `--sc-color-green-950`).
  2. Si encaja con uno de los pasos existentes, úsalo y listo.
  3. Si necesitas una variante nueva, decidimos juntas: ¿es un
     color de marca (planta 1)? ¿O es un color de dominio
     porque representa "bienestar" como concepto (planta 3)?
- **Resultado**: O bien ya existe (90% de los casos) y reusamos,
  o lo añadimos en la planta correcta y queda disponible para el
  futuro.

✨ **Ningún color va dentro del SCSS de un componente directamente.**
Si no está en el sistema, no se usa hasta que lo metamos.

---

### Caso 3 — "Esta pantalla necesita un radio de borde distinto"

- **Situación**: En el design system tenemos 6 pasos de radio:
  `radius-50` (2px) hasta `radius-full` (totalmente redondo).
  Tu diseño necesita un radio de 10px y no existe.
- **Tarea**: Decidir si pides añadir un paso nuevo o ajustas.
- **Acción**: Pregúntate "¿esto es realmente un paso intermedio
  que voy a reusar?". Si la respuesta es NO (es un one-off
  visual), ajusta el diseño al paso más cercano (8px o 12px). Si
  la respuesta es SÍ, añadimos `--sc-radius-250: 10px` en
  primitivos.
- **Resultado**: La escala se mantiene consistente. Si añadimos
  un paso es porque lo van a usar otros componentes en el futuro.

✨ **Más pasos NO es mejor.** Una escala con menos pasos pero
consistente se ve más profesional que una escala llena de "valores
únicos para casos únicos".

---

### Caso 4 — "Un componente de PrimeNG no se ve como mi diseño"

- **Situación**: Pusiste un `<p-dropdown>` o un `<p-dialog>` en
  el diseño y al verlo en el producto las sombras, los bordes o
  los colores no coinciden con el design system.
- **Tarea**: Que PrimeNG hable AED en vez de su tema por defecto
  (Aura).
- **Acción**: NO toques el componente directamente. La cosa
  pasa en `core/tokens/aed-preset.ts`, donde está el "puente"
  entre PrimeNG y nuestros `--sc-*`. Cuéntale al dev team qué
  componente, qué propiedad, y qué debería ser (apuntando al
  `--sc-*` correspondiente del design system).
- **Resultado**: Se añade una línea en el preset, PrimeNG
  empieza a usar ese token, y queda alineado para siempre.

✨ Por ejemplo: si una sombra de input está demasiado oscura, es
porque Aura usa `rgba(0,0,0,0.05)` (negro puro) en vez del gris
tintado del brand. Se arregla mapeando `formField.shadow` a
`--sc-shadow-xs`. Y se aplica a todos los inputs de PrimeNG de
golpe.

---

### Caso 5 — "Encontré un `#aaa` o un `12px` suelto en el código"

- **Situación**: Mirando el código (curioseando) ves algo como
  `background: #f59e0b` o `padding: 14px` en vez de un `var(--sc-...)`.
- **Tarea**: Avisar — eso es **deuda técnica de tokens**.
- **Acción**: Mándanos el archivo + línea por chat o issue. El
  dev team lo cambia: o usamos un token existente, o creamos uno
  si hace falta.
- **Resultado**: Cero valores hex sueltos en el código.
  Garantizamos que cualquier cambio futuro en el design system
  se propaga sin "huecos" donde el cambio no llega.

✨ Esto **ya pasó** y lo limpiamos en el último audit (los 20
sitios que tenían fallbacks hex se eliminaron). La regla queda:
si ves uno nuevo, lo arreglamos al momento.

---

### Caso 6 — "Quiero un degradado para un hero/banner especial"

- **Situación**: Diseñaste un banner promocional o un encabezado
  de feature destacado con un gradiente.
- **Tarea**: Implementarlo respetando el design system.
- **Acción**:
  1. Si el gradiente se hace con DOS o tres colores que ya
     existen en el sistema, perfecto — se construye con
     `linear-gradient(--sc-bg-primary, --sc-bg-primary-hover)`.
  2. Si introduce colores nuevos, lo evaluamos: ¿es algo que se
     va a repetir, o es un one-shot decorativo?
- **Resultado**: Gradiente alineado al brand. Aviso: el
  `impeccable.md` del proyecto **prohíbe gradientes en texto**
  (es un patrón de "AI slop"). En fondos sí, en `background-clip:
  text` no.

---

## Glosario para no perderse

| Palabra técnica | Qué significa en cristiano |
|---|---|
| **Token** | Una variable con nombre que guarda un valor (un color, un tamaño, un espaciado). |
| **`--sc-*`** | El prefijo de NUESTROS tokens (Smart Contact). Todos empiezan así. |
| **`--p-*`** | El prefijo de los tokens de PrimeNG. No los tocamos a mano. |
| **Cascada** | El orden en que las plantas se cargan: primitivos primero, semántica encima, etc. Cada planta puede usar la de abajo. |
| **Alias** | Cuando un token apunta a otro: `--sc-bg-primary` ES `--sc-color-blue-700`. Si cambias el azul, cambian todos los que lo aliasean. |
| **Preset** | El archivo `aed-preset.ts` que enlaza PrimeNG con `--sc-*`. Es el "puente". |
| **Fallback** | Cuando una variable tiene un valor de respaldo por si no existe: `var(--sc-x, #ccc)`. **No queremos fallbacks hex** — significa que falta declarar el token. |
| **Dark mode** | El tema oscuro. Funciona porque el archivo `07-dark.css` re-declara las plantas 2/3/4 con valores oscuros. AED está en light mode por decisión de marca. |

---

## Decisiones técnicas anotadas

> Aclaraciones técnicas surgidas en auditorías para que no se pierdan.
> Si una decisión empieza a parecer arbitraria, mírala aquí.

- **Focus ring de 2px (no 1px).** Aura usa `focus.ring.width: 1` por
  defecto. En AED el preset lo fuerza a `2px` por accesibilidad: con
  un focus ring de 1px sobre un input ya bordeado, el usuario de
  teclado no distingue qué control tiene el foco. La decisión está
  en `aed-preset.ts → semantic.focusRing.width`.

- **Escala de grises alineada a PrimeOne slate (S54).** Los
  `--sc-color-gray-*` antes eran Tailwind slate (rampa más fría y
  contrastada). En S54 se migraron a la slate custom de PrimeOne 4.0
  (Smart Contact Prime UI Kit Pro Figma Variables) — tono más cálido
  y azulado oscuro, alineado 1:1 con lo que el equipo de diseño usa
  en Figma. Si en algún sitio el gris se siente "incorrecto", reportar
  — no asumir que hay drift contra PrimeOne.

- **Escala de tamaños de iconos (S54).** El proyecto usa Lucide
  para iconos. Los tamaños están en dos sitios sincronizados a mano:
  (a) tokens CSS `--sc-icon-size-*` en `01-primitive.css` para SCSS,
  (b) constants TS en `packages/design-system/utils/icon-size.ts`
  (`SC_ICON_SIZE_*`) para templates Angular (Lucide `[size]` espera
  number, no CSS variables — por eso la duplicación consciente). La
  escala viene de PrimeOne 4.0: 7 / 10.5 / 12.25 / 14 / 15.75 / 17.5
  / 21 / 28 px (+ 4 display sizes 32/44/56/64 para hero/avatar).
  Cuando PrimeOne actualice (5.0), tocar ambos archivos y propagar.

- **Spacing + font-size + line-height = escala decimal PrimeOne
  (S54).** Antes: aditiva (4/8/12/16/24/32/...). Ahora: multiplicativa
  base 14 (3.5/7/10.5/14/15.75/21/24.5/28/...). Naming SCDS conservado
  (`--sc-spacing-0-5` sigue siendo el nombre, solo el VALOR cambia
  de 8 a 7px). Razón: alinear 1:1 con el Kit Pro Figma. Si una pantalla
  se ve "más apretada" que antes, es esto y es intencional.

- **Dark mode activo con default `'system'`.** Versiones tempranas
  de esta guía decían que AED era light-only por marca; el código
  ya tiene `ThemeService` totalmente operativo siguiendo
  `prefers-color-scheme`. Los archivos `07-dark.css` y los overrides
  de `colorScheme.dark` en el preset son producción, no
  arquitectura latente. Si Diseño quiere desactivarlo, decisión
  explícita en sesión + DD.

---

## ¿Te perdiste? Pregunta sin miedo

Si después de leer la guía no sabes:

- Dónde añadir un token nuevo → pregunta antes de mover.
- Por qué un cambio en Figma no se ve en el producto → seguro que
  el token no existe todavía o vive en una planta distinta.
- Si algo es "tocable" o no → si dudas, no toques. Mejor 5
  minutos de chat que media tarde de revert.

📌 **Mantra final**: el design system no es solo una guía de
estilo, es un **contrato**. Mientras tú dibujas en Figma con los
mismos nombres que viven en el código (`bg-primary`,
`text-secondary`, `border-focus`), el producto se mantiene
alineado sin esfuerzo. Cuando te alejas del contrato, alguien
acaba pegando un hex en un SCSS y empieza el drift.

Mejor: una conversación. ✨
