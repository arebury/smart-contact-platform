# Extender el Kit Pro sin romper nada — guía de diseño

> Conclusiones del ejercicio de la **Tabla de Agentes** (AED), explicadas en plano y
> desde diseño: por qué no basta con coger el datatable que ya existe, qué tocamos y
> qué **NO**, variables custom, modo oscuro, y cosas a tener en cuenta.
>
> Esta es la versión **diseño / ELI5**. La versión técnica con node IDs vive en
> [`customs-catalog.md` §2.8](./customs-catalog.md).

---

## En una frase

El Kit Pro son **piezas de LEGO que no tocamos**. Nosotros **juntamos** sus piezas en
piezas nuestras, en **nuestra zona** (la página `Flujos`). Si solo juntamos —sin editar
sus piezas y sin crear variables nuevas— una actualización del Kit Pro **no nos rompe nada**.

---

## 1. ¿Por qué no podemos coger el datatable existente y ya?

Porque el `datatable` del Kit Pro es un **bloque casi cerrado**:

- Solo te deja **encender/apagar** cabecera y pie. No tiene un "modo Agentes".
- Su **celda** solo sabe mostrar una lista corta de contenidos: **texto, checkbox, tag,
  estrella (rating), imagen, chevron, radio**. Y nada más.
- Lo que la Tabla Agentes necesita —**avatar + nombre** y una **fila de iconos de canal**—
  **no está en esa lista**.
- Lo confirmamos mirando los **9 ejemplos** que trae el Kit Pro (Basic, Sort, Selection,
  Row Expansion…): **ninguno** tiene avatar+nombre. No es que no lo encontráramos:
  **no existe** en el Kit.

**Conclusión:** el datatable nos sirve de **base** (cabecera, filas, celdas, tags,
checkbox…), pero el **contenido de un par de columnas hay que componerlo nosotros**.

---

## 2. ¿Y eso es un problema? No — así funciona PrimeNG de verdad

En el código real, una celda admite **cualquier cosa**. "Avatar + nombre" es solo
**una foto + un texto puestos juntos**; no es un componente especial, ni en código ni en
diseño. Así que **no inventamos nada raro**: juntamos piezas que ya existen.

---

## 3. Qué TOCAMOS y qué NO — la regla de oro

**NO tocamos** ❌
- Las páginas del Kit Pro (las que empiezan por `❖`).
- Sus componentes (datatable, avatar, tag, button…).
- Sus variables / tokens.

**SÍ hacemos** ✅
- En **nuestra página** (`Flujos`): juntamos piezas del Kit Pro en **piezas nuestras** y
  las metemos dentro de las **celdas reales** del datatable.

**Resultado:** el Kit Pro queda **intacto**. El día que llegue una versión nueva, nuestras
tablas no se rompen, porque solo **usamos** sus piezas, no las cambiamos.

---

## 4. Las piezas que creamos (y por qué tan pocas)

| Pieza nuestra | Qué es | Hecha de |
|---|---|---|
| `agente-nombre` | avatar + nombre | avatar + texto del Kit Pro |
| `agente-canales` | iconos phone/chat/mail | iconos del Kit Pro |
| `fila-agente` | la fila entera (la pieza **reusable**) | 7 celdas reales + las 2 de arriba + botón kebab |

El resto de columnas son piezas del Kit Pro **tal cual**, solo cambiando texto/color:
- **Checkbox** → tipo de celda "Checkbox".
- **Tipo / Estado** → tipo de celda "Tag" (cambiando el texto y el color).
- **Acciones (⋮)** → el botón del Kit Pro en modo "solo icono".

**Importante:** **no** convertimos la tabla entera en un componente. Los datos cambian
(cada agente es distinto), así que la pieza reusable es **la FILA**, no la tabla. La tabla
= muchas filas.

---

## 5. ¿Tokens / variables custom? **NO**

- **Cero** variables/tokens nuevos.
- La colección de variables **"Custom" sigue VACÍA** — y así debe seguir: la norma es no
  abrirla hasta tener ≥5 motivos reales acumulados.
- Reusamos las variables del **propio datatable** (su color de texto, su fondo…).

Si alguna vez **crees** que hace falta una variable nueva → **párate y consúltalo**. Casi
siempre la respuesta es "ya hay una que sirve".

---

## 6. El truco del modo oscuro (esto pilla a todos)

El **dark** en Figma cambia poniendo las colecciones de color en **modo Dark**.

- Las piezas del Kit Pro cambian **solas** porque su color está **vinculado a una variable**.
- Si tú pones un color **fijo** (negro/blanco "a mano"), en dark **no cambia** → el texto
  se queda negro sobre fondo negro = **invisible**.

**REGLA:** todo lo que pongas tú —textos, fondos, iconos— hay que **vincularlo a una
variable** del Kit Pro. **Nunca** dejar un color plano. (Nos pasó: el nombre y los iconos
se volvían invisibles en dark hasta que los vinculamos.)

---

## 7. Checklist antes de montar una tabla (o cualquier composición)

1. ¿Lo que necesito **ya existe** como tipo de celda del Kit Pro? → úsalo, solo cambia
   texto/color.
2. ¿No existe? → **júntalo** con piezas del Kit Pro, en una pieza nuestra en `Flujos`.
3. ¿Pieza nueva? → que **solo contenga instancias** del Kit Pro (no copies ni rompas sus
   piezas).
4. ¿Color? → **vincular a variable**, nunca fijo (o el dark te deja fuera).
5. ¿Token/variable nuevo? → casi seguro **NO**. Si crees que sí, párate y consúltalo.
6. ¿Anchos de columna? → ajústalos en el **componente fila** (se propaga a todas las filas
   a la vez).
7. **Nunca** entrar a editar las páginas `❖`.

---

## 8. Por qué todo esto importa — una línea

Para que el día que el Kit Pro se actualice (nueva versión de PrimeNG), nuestras tablas
**no se rompan** — porque solo hemos **usado** sus piezas, no las hemos modificado, y no
hemos ensuciado las variables.

---

*Ejercicio: Tabla de Agentes (AED), montada en la página `Flujos`. Detalle técnico +
node IDs + variables exactas en [`customs-catalog.md` §2.8](./customs-catalog.md).*
