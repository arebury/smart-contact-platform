# Extender el Kit Pro sin romper nada — guía de diseño

> Conclusiones del ejercicio de la **Tabla de Agentes** (AED): por qué no basta con
> reutilizar el datatable existente, qué se modifica y qué no, variables custom, modo
> oscuro y puntos a tener en cuenta al componer tablas sobre el Kit Pro.
>
> Versión técnica, con node IDs y variables exactas: [`customs-catalog.md` §2.8](./customs-catalog.md).

---

## Idea central

El Kit Pro es un conjunto de piezas que **no modificamos**. Nosotros **componemos** sus
piezas en piezas propias, en **nuestra zona** (la página `Flujos`). Mientras solo
compongamos —sin editar sus componentes y sin crear variables nuevas— una actualización
del Kit Pro **no nos rompe nada**.

---

## 1. ¿Por qué no podemos reutilizar el datatable existente sin más?

Porque el `datatable` del Kit Pro es un **bloque casi cerrado**:

- Solo permite **mostrar u ocultar** cabecera y pie. No tiene un "modo Agentes".
- Su **celda** solo admite una lista corta de contenidos: **texto, checkbox, tag,
  rating, imagen, chevron, radio**. Nada más.
- Lo que la Tabla Agentes necesita —**avatar + nombre** y una **fila de iconos de canal**—
  **no está en esa lista**.
- Lo confirmamos revisando los **9 ejemplos** que trae el Kit Pro (Basic, Sort, Selection,
  Row Expansion…): **ninguno** usa avatar+nombre. No es que no lo localizáramos:
  **no existe** en el Kit.

**Conclusión:** el datatable sirve de **base** (cabecera, filas, celdas, tags, checkbox…),
pero el **contenido de un par de columnas hay que componerlo nosotros**.

---

## 2. No es un problema — así funciona PrimeNG

En el código real, una celda admite **cualquier contenido**. "Avatar + nombre" es
simplemente **una imagen y un texto juntos**; no es un componente especial, ni en código ni
en diseño. Por tanto no introducimos nada ajeno al sistema: **componemos piezas que ya
existen**.

---

## 3. Qué se modifica y qué no — la regla de oro

**No se toca** ❌
- Las páginas del Kit Pro (las que empiezan por `❖`).
- Sus componentes (datatable, avatar, tag, button…).
- Sus variables / tokens.

**Sí hacemos** ✅
- En **nuestra página** (`Flujos`): componemos piezas del Kit Pro en **piezas propias** y
  las colocamos dentro de las **celdas reales** del datatable.

**Resultado:** el Kit Pro queda **intacto**. Cuando llegue una versión nueva, nuestras
tablas no se rompen, porque solo **usamos** sus piezas, no las modificamos.

---

## 4. Las piezas que creamos (y por qué tan pocas)

| Pieza propia | Qué es | Compuesta de |
|---|---|---|
| `agente-nombre` | avatar + nombre | avatar + texto del Kit Pro |
| `agente-canales` | iconos phone/chat/mail | iconos del Kit Pro |
| `fila-agente` | la fila completa (la pieza **reutilizable**) | 7 celdas reales + las 2 anteriores + botón kebab |

El resto de columnas son piezas del Kit Pro **sin modificar**, solo cambiando texto/color:
- **Checkbox** → tipo de celda "Checkbox".
- **Tipo / Estado** → tipo de celda "Tag" (cambiando el texto y el color).
- **Acciones (⋮)** → el botón del Kit Pro en modo "solo icono".

**Importante:** **no** convertimos la tabla entera en un componente. Los datos cambian
(cada agente es distinto), así que la pieza reutilizable es **la FILA**, no la tabla. La
tabla es un conjunto de filas.

---

## 5. ¿Variables custom? No

- **Cero** variables/tokens nuevos.
- La colección de variables **"Custom" sigue vacía** — y así debe mantenerse: la norma es
  no abrirla hasta acumular ≥5 motivos reales.
- Reutilizamos las variables del **propio datatable** (su color de texto, su fondo…).

Si en algún momento parece que hace falta una variable nueva → **detenerse y consultarlo**.
Casi siempre ya existe una que sirve.

---

## 6. Modo oscuro — vincular siempre los colores a variables

El **modo oscuro** en Figma se aplica poniendo las colecciones de color en **modo Dark**.

- Las piezas del Kit Pro cambian **automáticamente** porque su color está **vinculado a una
  variable**.
- Un color **fijo** (negro/blanco asignado a mano) **no cambia** en modo oscuro → el texto
  queda negro sobre fondo negro = **invisible**.

**Regla:** todo lo que añadamos —textos, fondos, iconos— debe **vincularse a una variable**
del Kit Pro. **Nunca** un color fijo. (En este ejercicio, el nombre y los iconos quedaban
invisibles en modo oscuro hasta que los vinculamos.)

---

## 7. Checklist antes de montar una tabla (o cualquier composición)

1. ¿Lo que necesito **ya existe** como tipo de celda del Kit Pro? → úsalo, solo cambia
   texto/color.
2. ¿No existe? → **compón** con piezas del Kit Pro, en una pieza propia en `Flujos`.
3. ¿Pieza nueva? → que **solo contenga instancias** del Kit Pro (no copiar ni romper sus
   piezas).
4. ¿Color? → **vincular a variable**, nunca fijo (o el modo oscuro lo deja fuera).
5. ¿Variable/token nuevo? → casi seguro **no**. Si parece que sí, detenerse y consultarlo.
6. ¿Anchos de columna? → ajustarlos en el **componente fila** (se propagan a todas las
   filas a la vez).
7. **Nunca** editar las páginas `❖`.

---

## 8. Por qué importa

Para que, cuando el Kit Pro se actualice (nueva versión de PrimeNG), nuestras tablas **no
se rompan** — porque solo hemos **usado** sus piezas, no las hemos modificado, y no hemos
tocado las variables.

---

*Ejercicio: Tabla de Agentes (AED), montada en la página `Flujos`. Detalle técnico,
node IDs y variables exactas en [`customs-catalog.md` §2.8](./customs-catalog.md).*
