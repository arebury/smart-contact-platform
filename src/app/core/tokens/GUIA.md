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

## El mapa mental: tres mundos, una sola verdad

Imagina tres "idiomas" hablando del mismo color:

```
   FIGMA              SMART CONTACT (--sc-*)          PRIMENG (--p-*)
   ─────              ──────────────────────          ───────────────
   "Brand /             --sc-bg-primary                --p-primary-color
    Primary"               #1B273D                          ↑
        │                      ↑                            │
        │                      │                            │
        └──────  fuente ───────┼────────  consume  ─────────┘
                de verdad      │
                               │
                          aquí vive el
                          valor real
```

- **Figma** es donde tú decides cómo se ven las cosas.
- **`--sc-*`** son las "variables" del producto. Son **la única
  fuente de verdad**: cuando aquí cambias un valor, cambia en todo
  el producto.
- **`--p-*`** son las variables de PrimeNG (la librería de
  componentes que usamos para tablas, modales, dropdowns, etc.).
  No las tocamos directamente: cogen su valor de `--sc-*`.

**La regla de oro:** si quieres cambiar algo del producto, vas a
`--sc-*`. PrimeNG hereda solo.

---

## Las 5 "plantas" del sistema (la cascada)

Piensa en los tokens como un edificio de 5 plantas. Cuanto más
abajo, más "crudo" es el valor. Cuanto más arriba, más cerca está
de un componente concreto.

```
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

### ¿Cuándo está cada cosa en cada planta?

**Planta 1 — primitivos**
Son los valores absolutos sin contexto. Como decir "azul 500" sin
explicar para qué.

Ejemplos: `--sc-color-blue-500`, `--sc-spacing-300`,
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
- **`--p-*` (variables de PrimeNG)**: NUNCA se declaran a mano.
  Las gestiona un archivo de configuración (`aed-preset.ts`) que
  ya enlaza cada `--p-*` con un `--sc-*`. Si necesitas que un
  componente de PrimeNG se vea distinto, lo correcto es cambiar
  el `--sc-*` al que ya está apuntando, no inventar variables.
- **El orden de las plantas** (la cascada): si añades un valor en
  la planta equivocada, se pueden producir bucles infinitos o que
  el modo oscuro no funcione.
- **Archivos en `src/app/core/tokens/layers/`** directamente sin
  hablarlo: si necesitas un valor nuevo, hablamos para decidir en
  qué planta vive.

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
  `.impeccable.md` del proyecto **prohíbe gradientes en texto**
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
