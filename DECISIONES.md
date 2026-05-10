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

## DD#50 — El sistema de design tokens se reorganiza en 7 capas estilo PrimeNG (2026-05-10)

**Qué.** El archivo gigante `sc-tokens.css` (975 líneas) se parte en
siete archivos por capa, copiando el modelo oficial de PrimeNG
(primitivos → semánticos → componentes → overrides) y añadiendo dos
capas que PrimeNG no cubre. Un orquestador (`index.css`) los carga en
orden:

1. **Primitivos** — valores crudos (escalas de color, fuente, spacing, radius).
2. **Semánticos** — alias por propósito (texto, fondo, borde, roles tipográficos).
3. **Paletas de dominio** — colores categóricos (etiquetas, presencia agente, prioridad grupo).
4. **Componentes** — specs por componente (botón, modal, toast).
5. **Extensiones** — solo AED (layout, sombras, z-index, motion).
6. **Bridge a PrimeNG** — los tokens `--p-*` apuntan a los `--sc-*`.
7. **Dark mode** — overrides cuando `.aed-dark` está activa.

**Por qué.** El monolito funcionaba, pero no comunicaba el modelo —
había que recorrerlo para entender la estructura. Alinear con las
convenciones de PrimeNG hace que el proyecto sea legible para
cualquier ingeniero de design systems senior, y blinda el sistema:
cuando PrimeNG saque una versión nueva que espere tokens `--p-*`
diferentes, solo hay que tocar la capa 6.

La capa 6 es la "herencia hacia PrimeNG" — el equivalente CSS de
hacer un `definePreset()` programático, pero escrito como archivo
plano. Se ve igual en el navegador, no necesita compilación, y los
tokens `--sc-*` siguen siendo la fuente de la verdad. Cualquier
componente PrimeNG (Tag, Badge, Toast, Tooltip…) usa la marca AED
sin tener que sobreescribir nada por componente.

De camino, los colores de presencia de agente (verde, naranja, rojo
de los pills "Disponible / Baño / Formación") y los de prioridad de
grupo, que estaban hardcodeados en los formularios, suben a la capa
3 como tokens. Los hardcodes que quedaban DENTRO de los tokens
(padding del botón en `16px`, padding del modal en `24px`, etc.)
también se redirigen a sus equivalentes de la escala — mismo valor
resuelto, salida idéntica.

**Qué se descartó.**

- Usar `definePreset()` programático. PrimeNG lo soporta, pero parte
  la fuente de la verdad: el preset emitiría `--p-*` directamente y
  los `--sc-*` perderían autoridad. El bridge mantiene `--sc-*` como
  canónicos.
- Borrar tonos de color que nadie usa hoy (ej: `--sc-color-indigo-300`).
  Un design system tiene responsabilidad de **vocabulario**, no solo
  de servir las pantallas de hoy. Mantener la escala completa permite
  que la siguiente feature elija el tono correcto sin re-derivarlo.
- Migrar todos los componentes a usar `--p-*` en vez de `--sc-*`.
  Eso eliminaría la capa de intención ("fondo primario" en vez de "lo
  que PrimeNG llama --p-primary-color") y acoplaría nuestros
  componentes al naming interno de PrimeNG.

**Cuándo aplica.** Cualquier cambio futuro en colores, tipografía,
spacing, radius, sombras o tokens de componente.

---

## DD#49 — La identidad sale del rail y sube a un header rico; el rail se queda solo con el índice (2026-05-08)

**Qué.** En las tres páginas de editar (agente, grupo, usuario) se
desmonta el "rail persona" de la izquierda. La foto (44px), el nombre
(editable inline en modo editar), las pills (estado / presencia /
prioridad / tipo) y una línea secundaria con email · extensión ·
teléfono pasan al header sticky de arriba (`<aed-sticky-form-header>`).
El rail (`<aside class="ipanel">`) se queda con un único trabajo: el
índice de secciones del formulario. También se quita el botón "Atrás"
del rail; el breadcrumb de página es la única vía para volver.

Además, el formulario de agente cambia el cuerpo a una rejilla de dos
columnas: a la izquierda una card "Identificación" sticky de 360px
que mete dentro foto + nombre (solo crear) + email + teléfono +
descolgado + tipo de extensión + extensión + tipo de agente + canales
en pills + estado activo/inactivo (solo editar) + presencia inicial +
grabación + PIN. A la derecha quedan las cards de Grupos, Permisos,
Idiomas, Etiquetas y Danger zone, y son las que hacen scroll.

**Por qué.** El rail antiguo duplicaba el trabajo del header (mismo
nombre, misma foto, mismas pills) y se comía ~280px que el formulario
prefería usar. Con la información de identidad en un único sitio
arriba — y siempre visible al hacer scroll — el rail puede dedicarse
a lo único que aporta: ayudarte a saltar entre secciones.

El rediseño del cuerpo del agente sigue una referencia React que pasó
el usuario: la card "Identificación" empuja la pregunta natural de
"¿quién es y cómo le llego?" antes que "¿qué puede hacer?", y reduce
el formulario de 7 secciones a 5.

**Qué se descartó.**

- Mantener el rail con identidad **y** un header rico al mismo tiempo
  — duplicaría estado y haría que cada cambio se replicase en dos
  superficies.
- Cargarse el rail entero (sin índice) — el usuario pidió expresamente
  conservar el índice cuando quitamos la "ID Card resumen".
- Aplicar la rejilla de 2 columnas también en grupos y usuarios — solo
  el agente tiene volumen de campos suficiente, y solo había referencia
  React para él. Grupos y usuarios siguen con cuerpo a una columna.

**Cuándo aplica.** En los tres formularios de editar/crear bajo
`/admin/agentes`, `/admin/grupos` y `/admin/usuarios`. El cambio del
cuerpo en dos columnas es solo del agente.

---

## DD#48 — El modal de "descartar cambios" invierte la prioridad: "Continuar editando" pasa a ser el botón principal (2026-05-08)

**Qué.** En el modal que aparece al intentar salir de un formulario
con cambios sin guardar, "Continuar editando" pasa a ser el botón
principal (azul, a la derecha) y "Descartar" se queda como secundario
(rojo suave, a la izquierda). En los demás modales destructivos
(borrar entidad, resetear datos del sistema) el botón rojo de
confirmación sigue siendo el principal — no cambia nada.

**Por qué.** El modal de descartar es el único caso destructivo en el
que la opción destructiva **no es** el resultado deseado: el modal
aparece porque el usuario se fue por error de la página, así que la
acción por defecto debe **proteger su trabajo**. Es la guía de
NN/group, Apple HIG y Material Design. En cambio, cuando el usuario
pulsa "Eliminar agente" o "Resetear datos", está pidiendo expresamente
algo destructivo y el botón principal rojo es lo correcto.

**Qué se descartó.**

- Invertir la prioridad para todos los modales destructivos — habría
  invertido también "Eliminar entidad" y "Resetear datos", donde el
  rojo principal sí es lo que toca.
- Tener dos componentes distintos (uno para descartar, otro para
  borrar) — el armazón del modal, el ESC, la trampa de foco y el
  resolver son idénticos; solo cambia qué botón pinta de rojo.

**Cuándo aplica.** En cualquier intento de cerrar un formulario con
cambios sin guardar, en cualquier sección de la app.

---

## DD#47 — Las listas de admin pasan a una sola fila de chrome, con un contador en vivo (2026-05-08)

**Qué.** Las páginas de lista de **agentes**, **grupos** y
**usuarios** dejan de tener dos filas en la cabecera (la del título
con el botón Crear y, debajo, la barra con búsqueda + columnas +
exportar). Ahora todo va en **una sola fila pegada arriba**:

- A la izquierda: el título y, justo al lado, un contador en vivo
  ("23 grupos") que se actualiza al filtrar.
- A la derecha, en orden: búsqueda, selector de columnas, exportar,
  un separador fino y, al final, el botón principal **Crear**. El
  separador deja claro que las acciones secundarias y la principal
  son grupos distintos.
- El sombreado suave que tenía la barra antigua para que la tabla
  se "deslice" por debajo se queda igual; solo cambia que ahora
  cuelga de la cabecera, no de una segunda fila.

**Por qué.** La doble fila empujaba la tabla hacia abajo sin
aportar información extra. El patrón de Linear / Notion / Stripe
hace que la tabla aparezca antes y agrupa las acciones por
importancia. El contador en vivo soluciona la duda silenciosa de
"¿cuántos quedaron tras filtrar?" que la versión anterior dejaba
sin responder.

**Qué se descartó.**

- **Poner el contador en una línea debajo del título** —
  añadía una fila vertical sin haber quitado la otra. Sale negativo.
- **Llevar la búsqueda solo a un Cmd-K modal** — más rápido para
  power users, peor para los demás. Se mantiene la búsqueda inline
  con el hint del teclado como pista.
- **Aplicarlo también a Etiquetas y Plantillas en el mismo commit.**
  Comparten la cabecera vieja y se beneficiarían, pero esas dos
  páginas tienen extras (filtro por tipo en Plantillas, editor de
  color inline en Etiquetas) que merecen su propia revisión.

**Estado.** Vive en la rama `explore/form-aircall-shell`. Aún no
está en `main`. Etiquetas y Plantillas siguen con la cabecera de dos
filas.

---

## DD#46 — Las tres páginas de configuración de AED (Servicio, Agentes, Grupos) ya están construidas (2026-05-07)

**Qué.** Las tres rutas dentro del hub AED (`/config/aed/servicio`,
`/config/aed/agentes`, `/config/aed/grupos`) ya tienen contenido real,
copiado del Figma. Cada página es un formulario:

- **Servicio** tiene **dos cards**: uno para Estados (estados
  personalizados con chips, visibilidad de estados con puntos de
  color, dos switches de permisos, dos campos de pausa por
  inactividad) y otro para Conversaciones (descuelgue por defecto,
  alerting, Callblending con webhook + 6 eventos seleccionables).
  Cada card guarda independientemente: si tocas Estados, solo se
  habilita el botón Guardar de ese card.
- **Agentes** tiene un solo card con: la tabla de Llamadas
  (4 filas × 2 columnas con cabeceras que también marcan toda la
  columna), 3 switches de dispositivos, 1 de visualización, e iframe
  configurable que solo muestra los inputs si el switch está activo.
- **Grupos** tiene un solo card con: capacidad máxima
  (Fija/Variable + número), tiempos de gestión, codec de voz +
  switches de desbordamiento, prioridad y estrategia de
  enrutamiento, y radios para apertura de ficha.

**Por qué.** El Figma marca la pauta: los formularios largos
necesitan estructura clara (sub-secciones con divisores, títulos en
peso medio sin negrita, botón Guardar al final del card). Para
Servicio: el Figma dibuja dos botones Guardar a propósito — Estados
y Conversaciones son temas conceptualmente distintos, y el usuario
no debería tener que pulsar un único Guardar que afecte a ambos.

Para la tabla de Agentes (destinos × llamada × transferencias),
elegimos `<table>` real en vez de un grid CSS. Razón:
los lectores de pantalla anuncian "Fijos, columna LLAMADA, no
marcado" cuando hay una tabla semántica. Con un grid CSS pierdes
esa relación. Las cabeceras de columna además funcionan como
"marcar todos en esta columna" — un pequeño extra que ahorra clicks.

El botón Descartar solo aparece cuando hay cambios. Mientras estés
solo mirando la página, no hay ruido de menú.

**Qué se descartó.**
- *Un único Guardar global para Servicio.* Más simple en código,
  pero rompe el modelo mental del Figma y crearía sorpresas tipo
  "toqué Conversaciones, ¿por qué se guardó también Estados?".
- *Píldora "Cambios sin guardar" pegada al header de página.* Era
  útil para formularios MUY largos. Hoy ninguna de las tres
  páginas pierde el botón Guardar de vista al hacer scroll, así
  que se queda guardado para futuro.
- *Reactive Forms / FormGroup.* Cada página son campos planos sin
  validaciones complicadas. Signals + handlers `(input)/(change)`
  pesan menos y siguen el patrón del resto del código.

---

## DD#45 — AED se convierte en el hub con sidebar interno; "Numeración especial" se mueve a Sistema (2026-05-07)

**Qué.** La sección AED del menú principal ahora es un "hub" con
sidebar propio (DD#44) y tres páginas hijas: Servicio, Agentes y
Grupos. Cuando entras a AED sin ruta concreta, te lleva
automáticamente a Servicio (la primera).

Lo que antes era la página AED (numeración especial — el selector
de prefijos de países con buscador y chips) se ha extraído como una
sección reutilizable y ahora vive **dentro de Sistema**, junto a
Apariencia, Datos, Políticas de contraseñas y Regeneración masiva.

Los tres items del sidebar interno copian el Figma: Servicio
("Estados y conversaciones"), Agentes ("Parámetros por defecto"),
Grupos ("Parámetros por defecto"), con sus iconos correspondientes.

**Por qué.** El usuario aclaró que la nueva arquitectura del menú
de configuración pone el sidebar interno solo bajo AED, no sobre
todo `/config/*`. Tiene sentido: AED es un producto en sí mismo,
y su configuración se reparte de forma natural entre tres áreas
(servicios, agentes, grupos). En cambio Sistema es una sola página
de preferencias generales del navegador, y no necesita un sidebar
adicional.

Numeración especial encaja mejor en Sistema porque es una
preferencia transversal del cliente (qué prefijos cuentan como
"especiales"), no un parámetro de AED.

**Qué se descartó.**
- *Envolver todas las rutas de `/config/*` en el sidebar.* Fue la
  primera implementación, antes de que el usuario aclarara que el
  sidebar es exclusivo de AED.
- *Dejar AED como una página única (numeración especial) y poner
  Servicio/Agentes/Grupos como hermanas.* No: la nueva IA pone
  esas tres específicamente dentro de AED.
- *Meter el código del selector de países dentro del propio
  componente Sistema.* Habría hinchado Sistema a unas 600 líneas
  y mezclado dos flujos de guardado independientes. Sacarlo como
  componente sección mantiene cada cosa autocontenida.

---

## DD#44 — Layout "settings shell": sidebar fijo de 256px + main, solo bajo AED (2026-05-07)

**Qué.** Una nueva layout (componente `SettingsShellComponent`)
que envuelve las rutas `/config/aed/*` con dos columnas:

- A la izquierda, un sidebar blanco de 256px que se queda pegado
  arriba al hacer scroll. Lleva un encabezado ("Configuración AED" +
  "Ajustes de la plataforma"), una lista de navegación con tres
  items, y un pie con la versión ("SmartContact · v2.4.0").
- A la derecha, el contenido principal con fondo gris claro
  (`#f7f8fa`) que aloja la página activa.

El item activo del sidebar se pinta con icono oscuro y fondo sutil,
y además recibe `aria-current="page"` para que los lectores de
pantalla anuncien "página actual".

**Por qué.** El Figma de referencia (nodes 224:9167, 258:9396,
224:9482) marca exactamente este patrón. El usuario fue claro: "lo
importante que quiero que entiendas es el settings sidebar y el
main container". Para una zona de configuración con varias
páginas, tener una barra siempre visible que diga dónde estás y a
qué otras páginas puedes ir es mejor que ir poniendo migas de pan
arriba.

Solo se aplica bajo AED (DD#45). El resto de páginas de config
(Sistema, Seguridad, etc.) usan layout normal — meterles el
sidebar también sería redundante porque el sidebar principal de la
app ya las lista a todas.

**Qué se descartó.**
- *Sidebar con los items del menú principal de Configuración*
  (Seguridad / Personalización / AED / Integraciones / Sistema).
  Fue la primera versión, hasta que el usuario aclaró que el
  sidebar es exclusivo de AED.
- *Efecto blur translúcido sobre el sidebar.* Misma razón que en
  DD#43: el blur es el cliché de las apps de IA actuales y
  queremos diferenciarnos.
- *Versión móvil colapsable a hamburguesa.* Es una herramienta
  de supervisor — uso desktop dominante. Queda anotado para
  cuando se aborde el responsive completo (breakpoint <768px).

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
