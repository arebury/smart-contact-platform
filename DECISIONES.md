# Decisiones (versión humana)

> Bitácora en castellano de las decisiones de diseño y producto del proyecto.
> Pensada para que cualquiera pueda entender **qué se decidió, por qué, y qué
> se descartó** sin tener que leer código ni jerga técnica.
>
> **¿Buscas la versión técnica?** Está en
> [`DECISIONS.md`](./DECISIONS.md) — mismo orden, mismos números (DD#43,
> DD#42, …), pero con detalles de implementación, tokens y CSS.
>
> **Convención.** Más reciente arriba. Cada entrada empieza con el número
> que la enlaza con la versión técnica. Se actualiza solo al **cerrar
> sesión** (cuando el usuario dice "cerramos", "lo dejamos", etc.) para
> no duplicar trabajo en cada cambio.

---

## DD#43 — La barra de acciones de las listas se queda fija al hacer scroll (2026-05-07)

**Qué.** En las páginas de Agentes, Usuarios y Grupos, la barra que
contiene el buscador, el gestor de columnas y el botón de exportar se
queda pegada arriba cuando bajas. Por debajo de la barra hay un
degradado suave de 12 px que hace que el contenido de la tabla
"desaparezca" gradualmente en lugar de cortarse de golpe.

**Por qué.** En listas largas (200+ filas en el futuro), buscar es un
proceso de varios intentos: escribes, miras, refinas, repites. Tener el
buscador siempre a mano evita el viaje de vuelta arriba. Es la misma
lógica para el gestor de columnas y el exportar — son secundarios pero
útiles a media altura.

**Qué se descartó.**
- *Efecto blur translúcido.* Tipo glassmorphism. Suena bonito pero es
  el cliché de toda app de IA hoy en día y queremos diferenciarnos.
- *Esconder la barra al bajar y mostrarla al subir* (estilo Linear).
  Distrae mientras lees y rompe la promesa de "siempre disponible".
- *Versión más compacta cuando se queda fija* (botones más pequeños).
  Útil cuando hay muchísimos datos, pero hoy sobra. Queda anotado para
  el futuro.

---

## DD#42 — La página "Sistema" mezcla cosas permanentes y de prototipo (2026-05-07)

**Qué.** La página `/config/sistema` hospeda dos bloques distintos:
el selector de tema (Claro / Oscuro / Sistema, que se queda) y el
botón de "Restaurar datos de fábrica" (que desaparecerá cuando haya
backend real).

**Por qué.** Aunque tienen vidas distintas, conceptualmente ambas
son "ajustes de sistema". Separarlas en dos páginas inflaría el menú
sin razón. Manteniéndolas juntas, cuando llegue el día de borrar el
botón de reset, es un cambio local y limpio.

**Qué se descartó.** Crear una página `/config/datos` solo para el
botón. Sobre-arquitectura para una sola cosa.

---

## DD#41 — Sistema de avatares: ilustraciones por hash, sin selector manual (2026-05-07)

**Qué.** Cada agente, usuario y grupo tiene un avatar ilustrado. La
ilustración se elige automáticamente a partir de su nombre: mismo
nombre → mismo dibujo, siempre. Hay dos catálogos:
ilustrados (24 retratos de personas) para agentes/usuarios, y
abstractos (3 patrones) para grupos. Si se sube una foto real, gana
la foto. Al pasar el ratón el avatar hace un pequeño zoom dentro de
su círculo.

**Por qué.**
- Los avatares con iniciales sobre color funcionaban en listas pero
  quedaban planos en formularios. Las ilustraciones tienen más
  carácter sin pretender ser fotos reales.
- Elegir por hash del nombre evita un selector manual: una cosa menos
  que mantener, y la imagen siempre es coherente entre páginas.
- Dos catálogos porque ponerle cara de persona a un grupo como
  "Ventas Nacional" suena raro — y al revés, un patrón abstracto
  para una persona también.

**Qué se descartó.**
- *Selector manual de avatar.* Demasiado paso de formulario para el
  problema real (que era no tener nada).
- *Avatar de grupo como tira de mini-caras de los miembros.* La forma
  no entra bien en una celda — guardado para otro contexto.
- *Cargar dos SVG (uno reposo, otro hover).* Lo mismo se consigue con
  un transform de CSS.

---

## Cómo añadir una entrada

Al cerrar sesión, **antes** de la entrada DD#43 (la más reciente):

1. Copia la decisión técnica que añadiste en `DECISIONS.md` y tradúcela
   a este formato:
   - Encabezado: `## DD#{número} — {qué pasó en una línea} ({fecha})`
   - **Qué.** Lo que se decidió, en lenguaje natural.
   - **Por qué.** El motivo principal (1-2 párrafos cortos).
   - **Qué se descartó.** Las alternativas que se pensaron y por qué
     no se eligieron. Una bullet por alternativa.
2. No copies tokens, nombres de archivos ni código. Si alguien quiere
   eso, va a `DECISIONS.md`.
3. Mantén el tono cercano. Imagina que se lo cuentas a alguien que
   acaba de entrar al equipo.
