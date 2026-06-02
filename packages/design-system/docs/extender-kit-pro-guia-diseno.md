# Cómo extender el Kit Pro sin romperlo (guía de diseño)

> Conclusiones del ejercicio de la Tabla de Agentes (AED): por qué no basta con
> reutilizar el datatable existente, qué se modifica y qué no, variables custom,
> modo oscuro y qué tener en cuenta al componer tablas sobre el Kit Pro.
>
> Versión técnica, con node IDs y variables exactas: [`customs-catalog.md` §2.8](./customs-catalog.md).

---

## Idea central

El Kit Pro es un conjunto de piezas que no modificamos. Componemos sus piezas en
piezas propias, dentro de nuestra zona (la página `Flujos`). Mientras solo
compongamos, sin editar sus componentes ni crear variables nuevas, una
actualización del Kit Pro no rompe nada de lo nuestro.

---

## 1. ¿Por qué no se puede reutilizar el datatable sin más?

El `datatable` del Kit Pro es un bloque casi cerrado:

- Solo permite mostrar u ocultar cabecera y pie. No tiene un "modo Agentes".
- Su celda admite una lista corta de contenidos: texto, checkbox, tag, rating,
  imagen, chevron y radio. Nada más.
- Lo que la Tabla de Agentes necesita (avatar + nombre, y una fila de iconos de
  canal) no está en esa lista.
- Lo confirmamos revisando los 9 ejemplos que trae el Kit Pro (Basic, Sort,
  Selection, Row Expansion...): ninguno usa avatar + nombre. No es que no lo
  encontráramos; no existe en el Kit.

**Conclusión:** el datatable sirve de base (cabecera, filas, celdas, tags,
checkbox...), pero el contenido de un par de columnas lo componemos nosotros.

---

## 2. Por qué esto no es un problema

En el código real una celda admite cualquier contenido. "Avatar + nombre" es una
imagen y un texto juntos; no es un componente especial, ni en código ni en
diseño. No introducimos nada ajeno al sistema: componemos piezas que ya existen.

---

## 3. La regla de oro: qué se toca y qué no

**No se toca:**

- Las páginas del Kit Pro (las que empiezan por `❖`).
- Sus componentes (datatable, avatar, tag, button...).
- Sus variables y tokens.

**Sí hacemos:**

- En nuestra página (`Flujos`), componer piezas del Kit Pro en piezas propias y
  colocarlas dentro de las celdas reales del datatable.

Así el Kit Pro queda intacto. Cuando llegue una versión nueva, nuestras tablas no
se rompen, porque solo usamos sus piezas, no las modificamos.

---

## 4. Las piezas propias que creamos

| Pieza propia | Qué es | Compuesta de |
|---|---|---|
| `agente-nombre` | avatar + nombre | avatar + texto del Kit Pro |
| `agente-canales` | iconos phone/chat/mail | iconos del Kit Pro |
| `fila-agente` | la fila completa (la pieza reutilizable) | 7 celdas reales + las dos anteriores + botón kebab |

El resto de columnas son piezas del Kit Pro sin modificar, solo cambiando texto o
color:

- Checkbox: tipo de celda "Checkbox".
- Tipo / Estado: tipo de celda "Tag" (cambiando el texto y el color).
- Acciones (⋮): el botón del Kit Pro en modo "solo icono".

La tabla entera no se convierte en componente. Los datos cambian con cada agente,
así que la pieza reutilizable es la fila, no la tabla. La tabla es un conjunto de
filas.

---

## 5. ¿Variables custom? No

- Cero variables o tokens nuevos.
- La colección de variables "Custom" sigue vacía, y así debe seguir: no se abre
  hasta acumular al menos 5 motivos reales.
- Reutilizamos las variables del propio datatable (su color de texto, su fondo...).

Si en algún momento parece que hace falta una variable nueva, conviene detenerse y
consultarlo. Casi siempre ya existe una que sirve.

---

## 6. Modo oscuro: vincular los colores a variables

El modo oscuro en Figma se aplica poniendo las colecciones de color en modo Dark.

- Las piezas del Kit Pro cambian solas porque su color está vinculado a una
  variable.
- Un color fijo (un negro o un blanco asignado a mano) no cambia en modo oscuro:
  el texto queda negro sobre fondo negro, invisible.

**Regla:** todo lo que añadamos (textos, fondos, iconos) se vincula a una variable
del Kit Pro, nunca a un color fijo. En este ejercicio el nombre y los iconos
quedaban invisibles en oscuro hasta que los vinculamos.

---

## 7. Checklist antes de montar una tabla (o cualquier composición)

1. ¿Lo que necesito ya existe como tipo de celda del Kit Pro? Úsalo y solo cambia
   el texto o el color.
2. ¿No existe? Componlo con piezas del Kit Pro, en una pieza propia dentro de
   `Flujos`.
3. ¿Pieza nueva? Que contenga solo instancias del Kit Pro, sin copiar ni romper
   sus piezas.
4. ¿Color? Vincúlalo a una variable, nunca fijo (si no, el modo oscuro lo deja
   fuera).
5. ¿Variable o token nuevo? Casi seguro que no. Si parece que sí, detente y
   consúltalo.
6. ¿Anchos de columna? Ajústalos en el componente fila; se propagan a todas las
   filas a la vez.
7. No edites nunca las páginas `❖`.

---

## 8. Por qué importa

Cuando el Kit Pro se actualice (nueva versión de PrimeNG), nuestras tablas no se
rompen: solo hemos usado sus piezas, no las hemos modificado, y no hemos tocado
las variables.

---

*Ejercicio: Tabla de Agentes (AED), montada en la página `Flujos`. Detalle
técnico, node IDs y variables exactas en [`customs-catalog.md` §2.8](./customs-catalog.md).*
