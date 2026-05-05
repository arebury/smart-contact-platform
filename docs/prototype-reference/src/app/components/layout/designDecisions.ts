export type DecisionStatus = "reviewed" | "pending";

export type DecisionCategory =
  | "Navegación"
  | "Visualización"
  | "Interacción"
  | "Formularios"
  | "Estructura"
  | "Listas"
  | "Datos"
  | "Auditoría UX"
  | "Patch UX"
  | "Arquitectura"
  | "Limpieza"
  | "UI";

export interface DesignDecision {
  id: number;
  category: DecisionCategory;
  title: string;
  description: string;
  status: DecisionStatus;
  /** If this decision replaced a previous approach, explain what changed and why */
  discovery?: string;
  /** ISO date string (YYYY-MM-DD) when the decision was added — enables chronological sort within categories */
  date?: string;
}

export const LAST_UPDATED = "2026-03-03";

export const designDecisions: DesignDecision[] = [
  {
    id: 1,
    category: "Estructura",
    title: "Sidebar fijo siempre visible",
    description:
      "El sidebar permanece visible en todo momento para que el usuario sepa dónde está y pueda moverse entre secciones sin esfuerzo.",
    status: "reviewed",
  },
  {
    id: 2,
    category: "Estructura",
    title: "Barra superior con breadcrumbs",
    description:
      "Una barra superior muestra la ruta de navegación actual. Da contexto de ubicación sin consumir espacio vertical innecesario.",
    status: "reviewed",
  },
  {
    id: 3,
    category: "Visualización",
    title: "Contador textual bajo el título del listado",
    description:
      "Un texto inline «N grupos · N agentes asignados» resume el panorama general en una línea. Ocupa menos espacio que tarjetas de resumen y encaja mejor con el estilo low-fi.",
    status: "reviewed",
    discovery:
      "Cuatro tarjetas de resumen duplican información ya visible en la tabla y añaden decoración innecesaria.",
  },
  {
    id: 4,
    category: "Visualización",
    title: "Prioridad representada con badges de texto y borde gris",
    description:
      "La prioridad se muestra como badge textual con borde. Más oscuro = más prioridad, usando solo escala de grises.",
    status: "reviewed",
    discovery:
      "Se descartaron barras de altura creciente porque se confundían con indicadores de progreso en un contexto sin color.",
  },
  {
    id: 5,
    category: "Interacción",
    title: "Solo vista de tabla, sin toggle tabla/tarjetas",
    description:
      "La tabla muestra todos los campos relevantes y el panel lateral cubre el detalle extendido. Mantener dos vistas duplicaría esfuerzo sin aportar valor en esta fase.",
    status: "reviewed",
  },
  {
    id: 6,
    category: "Interacción",
    title: "Clic en el nombre navega a la página de edición completa",
    description:
      "Abrir una página de edición con URL propia da espacio suficiente para formularios complejos y permite compartir el enlace. Los breadcrumbs garantizan volver al listado.",
    status: "reviewed",
    discovery:
      "Se descartó un panel lateral deslizante porque el formulario tiene demasiados campos para un espacio estrecho.",
  },
  {
    id: 7,
    category: "Interacción",
    title: "Barra de acciones masivas desde 2+ seleccionados",
    description:
      "Al seleccionar 2+ filas aparece una barra fija inferior con opciones de edición masiva y eliminación. Con una sola fila, las acciones se canalizan por el menú ⋯.",
    status: "reviewed",
    discovery:
      "Con 1+ seleccionados, la barra crea dos caminos redundantes para editar un solo elemento. El umbral de 2+ elimina esa ambigüedad.",
  },
  {
    id: 8,
    category: "Interacción",
    title: "Edición masiva con selectores inline en la barra inferior",
    description:
      "El usuario elige campo y valor directamente en la barra sin abrir ningún panel. Tres clics: seleccionar filas, elegir cambio, aplicar.",
    status: "reviewed",
    discovery:
      "Un drawer lateral con checkboxes por campo bloquea la vista del listado y añade fricción innecesaria.",
  },
  {
    id: 9,
    category: "Formularios",
    title: "Formulario dividido en secciones temáticas",
    description:
      "Los campos se agrupan por tema (Identificación, Estrategia, Agentes, etc.) para facilitar el escaneo y la orientación dentro de formularios largos.",
    status: "reviewed",
  },
  {
    id: 10,
    category: "Formularios",
    title: "Canales como botones toggle en vez de checkboxes",
    description:
      "Teléfono, Chat y Email se activan con botones que cambian visualmente al pulsarlos. Más reconocible y fácil de pulsar que un checkbox pequeño.",
    status: "reviewed",
  },
  {
    id: 11,
    category: "Formularios",
    title: "Selector de agentes: browse+search híbrido",
    description:
      "Al hacer foco sin escribir se muestran los primeros 20 agentes con tags de grupo; al escribir, se filtra en tiempo real. Cubre tanto a admins que conocen nombres como a los que necesitan descubrir agentes disponibles.",
    status: "reviewed",
    discovery:
      "Una lista con checkboxes no escala a 100+ agentes y un search puro requiere conocer nombres de antemano.",
  },
  {
    id: 12,
    category: "Formularios",
    title: "Configuración avanzada oculta por defecto",
    description:
      "Los campos avanzados (tiempos, desborde, voz) se esconden bajo un desplegable. El formulario no abruma a quien solo necesita lo básico.",
    status: "reviewed",
  },
  {
    id: 13,
    category: "Formularios",
    title: "Título y botones de guardar fijos al hacer scroll",
    description:
      "Las acciones principales (Cancelar, Guardar) permanecen siempre visibles en la parte superior del formulario.",
    status: "reviewed",
  },
  {
    id: 14,
    category: "Interacción",
    title: "Diálogo de confirmación antes de eliminar",
    description:
      "Al eliminar se muestra un diálogo con los nombres afectados. El usuario verifica antes de ejecutar la acción destructiva.",
    status: "reviewed",
  },
  {
    id: 15,
    category: "Interacción",
    title: "Toast de feedback tras cada acción",
    description:
      "Tras guardar, eliminar o duplicar aparece un toast con borde lateral verde (éxito) o rojo (error). Da feedback inmediato sin interrumpir el flujo.",
    status: "reviewed",
    discovery:
      "Los toasts en la esquina inferior quedan tapados por la barra de acciones masivas.",
  },
  {
    id: 16,
    category: "Navegación",
    title: "Sección activa marcada en el sidebar",
    description:
      "La sección seleccionada se distingue con borde izquierdo y fondo diferenciado. El usuario identifica al instante dónde se encuentra.",
    status: "reviewed",
  },
  {
    id: 17,
    category: "Visualización",
    title: "Estado vacío con mensaje y acción al buscar sin resultados",
    description:
      "Cuando la búsqueda no encuentra resultados se muestra un icono, un mensaje claro y un botón para limpiar el filtro. Evita que el usuario piense que algo está roto.",
    status: "reviewed",
  },
  {
    id: 18,
    category: "Navegación",
    title: "Menú contextual ⋯ con Editar, Duplicar y Eliminar",
    description:
      "Cada fila tiene un botón ⋯ que despliega acciones. 'Editar' navega a la misma página que clic en el nombre, garantizando consistencia entre ambos caminos.",
    status: "reviewed",
    discovery:
      "Se añadió 'Editar' porque los usuarios no descubrían que el nombre era clicable.",
  },
  {
    id: 19,
    category: "Formularios",
    title: "Tooltips solo al pasar el cursor, no al cargar la página",
    description:
      "Los tooltips se activan únicamente al hacer hover sobre el icono de info. Aparecen cuando el usuario busca ayuda activamente, sin interrumpir el flujo del formulario.",
    status: "reviewed",
    discovery:
      "Los tooltips que se abren automáticamente al cargar la página roban el foco visual del primer campo.",
  },
  {
    id: 20,
    category: "Visualización",
    title: "Canales representados con iconos en la tabla",
    description:
      "Los canales activos se muestran como iconos (teléfono, chat, email) en vez de texto. Más compacto y reconocible de un vistazo.",
    status: "reviewed",
  },
  {
    id: 21,
    category: "Navegación",
    title: "Breadcrumbs clicables excepto la página actual",
    description:
      "Los niveles anteriores son enlaces activos que permiten volver atrás. El último nivel (página actual) permanece como texto plano.",
    status: "reviewed",
  },
  {
    id: 22,
    category: "Formularios",
    title: "Error de nombre vacío solo al intentar guardar",
    description:
      "El campo Nombre muestra error solo al pulsar Guardar con valor vacío. No se muestra error al cargar la página para no generar alarma prematura.",
    status: "reviewed",
  },
  {
    id: 23,
    category: "Interacción",
    title: "Diálogo '¿Descartar cambios?' al intentar salir del formulario",
    description:
      "Si el formulario fue modificado, al pulsar Cancelar, breadcrumbs o navegador atrás aparece un diálogo de confirmación. El botón Descartar no es rojo porque descartar un borrador no es destructivo.",
    status: "reviewed",
  },
  {
    id: 24,
    category: "Interacción",
    title: "Aviso del navegador al cerrar pestaña con cambios sin guardar",
    description:
      "Si hay cambios sin guardar y el usuario cierra la pestaña o recarga, el navegador muestra su diálogo nativo de confirmación. Complementa la protección interna de navegación dentro de la app.",
    status: "reviewed",
  },
  {
    id: 25,
    category: "Interacción",
    title: "Rojo solo para acciones destructivas",
    description:
      "El rojo se reserva exclusivamente para eliminar. Los diálogos de descarte usan gris oscuro para el botón primario, evitando alarma innecesaria.",
    status: "reviewed",
  },
  {
    id: 26,
    category: "Estructura",
    title: "Página completa en vez de modal para crear/editar",
    description:
      "Un formulario con ~25 campos necesita espacio propio, URL compartible y breadcrumbs de navegación. Un modal de ese tamaño pierde la ligereza que lo justifica.",
    status: "reviewed",
    discovery:
      "Se descartó el modal porque no existe ningún otro en la plataforma y crearlo aquí habría sido un patrón huérfano.",
  },
  {
    id: 27,
    category: "Formularios",
    title: "Toggle individual activo/inactivo por agente asignado",
    description:
      "El toggle controla si el agente está activo dentro del grupo; el botón × lo quita del grupo. Son dos dimensiones independientes con controles visualmente diferenciados.",
    status: "reviewed",
  },
  {
    id: 28,
    category: "Formularios",
    title: "5 estrategias principales + 2 avanzadas en sección aparte",
    description:
      "Las 5 estrategias estándar van en un selector simple. Las 2 estrategias especiales (Agente exclusivo, Niveles) requieren configuración adicional y viven en Configuración avanzada.",
    status: "reviewed",
    discovery:
      "Se excluyó Ring All del MVP por costes adicionales y se documentó con nota informativa bajo el selector.",
  },
  {
    id: 29,
    category: "Formularios",
    title: "Script de chat colapsable, visible solo si el canal Chat está activo",
    description:
      "Cuando el canal Chat está activo, aparece un bloque con el snippet de integración y botón de copiar. Se oculta si Chat no está activo para evitar ruido.",
    status: "reviewed",
  },
  {
    id: 30,
    category: "Interacción",
    title: "Botón Descartar en gris, no en rojo",
    description:
      "Descartar un borrador no elimina datos persistidos — no es destructivo. El rojo se reserva para eliminar registros.",
    status: "reviewed",
  },
  {
    id: 31,
    category: "Navegación",
    title: "Breadcrumbs en azul para indicar que son clicables",
    description:
      "El azul es el color universal de enlace. En un contexto donde todo es gris, los breadcrumbs grises no se percibían como clicables.",
    status: "reviewed",
    discovery:
      "Los breadcrumbs grises con underline se confundían con texto decorativo del estilo low-fi.",
  },
  {
    id: 32,
    category: "Formularios",
    title: "Search-to-add puro para asignar agentes (sustituida por #37)",
    description:
      "Primera iteración del selector de agentes: dropdown filtrado por búsqueda. Funciona para quien conoce los nombres, pero no permite descubrir agentes disponibles.",
    status: "reviewed",
    discovery:
      "El search puro sin browse no permite descubrir agentes disponibles — requiere conocer nombres de antemano.",
  },
  {
    id: 33,
    category: "Interacción",
    title: "Duplicar crea fila editable arriba de la tabla",
    description:
      "Al duplicar un grupo, la nueva fila aparece arriba con nombre en modo edición inline. Evita abrir el formulario completo solo para renombrar la copia.",
    status: "reviewed",
  },
  {
    id: 34,
    category: "Formularios",
    title: "Tres posibles resultados al guardar: éxito, error de red, conflicto de nombre",
    description:
      "El éxito muestra toast verde y navega al listado. El error de red muestra toast rojo con Reintentar. El conflicto de nombre marca el campo en rojo. El formulario nunca pierde datos del usuario ante un error.",
    status: "reviewed",
  },
  {
    id: 35,
    category: "Interacción",
    title: "Botón Guardar bloqueado mientras se guarda",
    description:
      "Al pulsar Guardar, el botón muestra 'Guardando...' y se deshabilita para evitar doble envío. Los campos permanecen editables — solo el botón se bloquea.",
    status: "reviewed",
  },
  {
    id: 36,
    category: "Interacción",
    title: "Barra masiva desde 2+ seleccionados (sustituida por #52)",
    description:
      "La barra oscura solo aparece con 2+ seleccionados. La fila inline de 1 seleccionado era redundante con el menú ⋯.",
    status: "reviewed",
  },
  {
    id: 37,
    category: "Formularios",
    title: "Browse+search híbrido con tags de grupo en selector de agentes",
    description:
      "Al hacer foco se muestran 20 agentes en orden alfabético con pills de grupo. Al escribir, se filtra en tiempo real. Los agentes ya asignados aparecen atenuados.",
    status: "reviewed",
    discovery:
      "Los tags de grupo resuelven '¿dónde más trabaja este agente?' sin salir del formulario.",
  },
  {
    id: 38,
    category: "Interacción",
    title: "Botón × de quitar agente visible solo al pasar el cursor",
    description:
      "El botón × solo aparece al hacer hover sobre la fila del agente asignado. El toggle activo/inactivo permanece siempre visible porque es información de estado, no una acción oculta.",
    status: "reviewed",
    discovery:
      "Con × y toggle siempre visibles, ambos controles quedan demasiado juntos y generan riesgo de clic accidental.",
  },
  {
    id: 39,
    category: "Interacción",
    title: "Separador visual entre toggle e × en fila de agente",
    description:
      "Una línea vertical sutil separa el toggle (reversible) del botón × (destructivo). Crea dos zonas de acción diferenciadas: cambiar estado vs. eliminar asignación.",
    status: "reviewed",
  },
  {
    id: 40,
    category: "Visualización",
    title: "Tabs Todos/Activos/Inactivos sobre la lista de agentes asignados",
    description:
      "Tres tabs filtran la lista de agentes asignados sin perder contexto. Ocupan menos espacio que un dropdown y comunican las opciones de un vistazo.",
    status: "reviewed",
  },
  {
    id: 41,
    category: "Formularios",
    title: "Buscador dentro de los agentes ya asignados",
    description:
      "Un campo 'Buscar en asignados...' filtra la lista de agentes ya asignados en tiempo real. Permite localizar un agente específico sin recorrer toda la lista.",
    status: "reviewed",
    discovery:
      "Se descartó un PickList (dos paneles con flechas) porque no soporta los tags de grupo, los toggles ni el × de cada fila.",
  },
  {
    id: 42,
    category: "Interacción",
    title: "Selección múltiple con barra de acciones en lista de asignados",
    description:
      "Checkboxes al hacer hover permiten seleccionar varios agentes asignados. Aparece una mini barra con Activar, Desactivar y Quitar del grupo. Con 15+ agentes, operar uno a uno se vuelve tedioso.",
    status: "reviewed",
  },
  {
    id: 43,
    category: "Estructura",
    title: "PickList descartado a favor del browse+search extendido",
    description:
      "El PickList (dos paneles con flechas de transferencia) no escala a 100+ agentes, no soporta metadatos ricos ni el toggle activo/inactivo. Las plataformas modernas de contact center usan search-to-add.",
    status: "reviewed",
  },
  {
    id: 44,
    category: "Formularios",
    title: "Botón Guardar deshabilitado hasta que haya cambios",
    description:
      "Guardar permanece atenuado hasta que el usuario modifique algún campo. Comunica que no hay cambios pendientes y evita guardados innecesarios.",
    status: "reviewed",
  },
  {
    id: 45,
    category: "Estructura",
    title: "Secciones del formulario en cards con cabecera gris",
    description:
      "Cada sección se enmarca en una card con título. El fondo del área de scroll es gris claro para que las cards destaquen. Patrón estándar en SaaS B2B (Stripe, HubSpot).",
    status: "reviewed",
    discovery:
      "Los subtítulos de cada card parafrasean los campos visibles justo debajo y añaden ~120px de scroll innecesario.",
  },
  {
    id: 46,
    category: "Estructura",
    title: "Sidebar compacto de 220px",
    description:
      "220px basta para los labels de navegación más largos sin truncar. Cada pixel extra que consume el sidebar se le resta al área de contenido.",
    status: "reviewed",
  },
  {
    id: 47,
    category: "Estructura",
    title: "Icono User genérico en vez de avatar con iniciales",
    description:
      "Los avatares con iniciales sobre fondo de color son un antipatrón que transmite baja calidad. Un icono neutro es preferible cuando no hay foto real.",
    status: "reviewed",
  },
  {
    id: 48,
    category: "Formularios",
    title: "Auditoría: 7 elementos redundantes en el formulario",
    description:
      "Subtítulos que repiten los labels, helpers que duplican tooltips, notas internas de producto y links repetidos. Cada elemento se evaluó con la pregunta '¿aporta algo que no esté ya visible?'.",
    status: "reviewed",
  },
  {
    id: 49,
    category: "Estructura",
    title: "Módulo de Agentes con 18 patrones idénticos al de Grupos",
    description:
      "Agentes replica los mismos patrones de Grupos: contador, menú ⋯, barra masiva, breadcrumbs, cards, botones fijos, config avanzada, tooltips, dirty state, toasts, browse+search, duplicación inline, etc. Consistencia total entre módulos.",
    status: "reviewed",
  },
  {
    id: 50,
    category: "Formularios",
    title: "Expirar contraseña solo accesible desde la vista de edición",
    description:
      "Acción infrecuente y potencialmente disruptiva que fuerza al agente a cambiar contraseña. El contexto de edición (ya estás viendo sus datos) reduce el riesgo de error.",
    status: "reviewed",
  },
  {
    id: 51,
    category: "Estructura",
    title: "Componentes duplicados centralizados en carpeta compartida",
    description:
      "Los componentes compartidos entre Agentes y Grupos viven en /shared/. Cuando el mismo componente existe en dos sitios, con el tiempo divergen sin que nadie se dé cuenta.",
    status: "reviewed",
  },
  {
    id: 52,
    category: "Listas",
    title: "Barra de acciones masivas solo desde 2+, sin barra para selección individual",
    description:
      "Las acciones individuales se canalizan por el menú ⋯ y clic derecho. El checkbox de 1 fila es una pre-selección para operaciones masivas, no un disparador de acciones individuales.",
    status: "reviewed",
    discovery:
      "La barra de 1 seleccionado es redundante con el menú ⋯ y causa desplazamiento visual de la tabla.",
  },
  {
    id: 53,
    category: "Formularios",
    title: "Expirar contraseña en sección Seguridad, no en el header",
    description:
      "Acción infrecuente que rompe la consistencia del header (Cancelar → Guardar). En el cuerpo del formulario con texto descriptivo da más contexto y reduce el riesgo de clic accidental.",
    status: "reviewed",
  },
  {
    id: 54,
    category: "Formularios",
    title: "Identificación de agente: foto a la izquierda, campos en grid compacto",
    description:
      "Avatar clicable a la izquierda, Nombre a la derecha, contacto en 2 columnas, extensión y tipo en la misma fila. Reduce el scroll ~40% agrupando campos relacionados.",
    status: "reviewed",
  },
  {
    id: 55,
    category: "Formularios",
    title: "4 tipos de agente: Normal, Cuscare, Cuscare Carrier, Admin Cuscare",
    description:
      "La taxonomía real del producto requiere diferenciar el rol dentro del ecosistema Cuscare para condicionar permisos y funcionalidades futuras.",
    status: "reviewed",
    discovery:
      "Distinguir solo softphone vs navegador es insuficiente para la taxonomía real del producto.",
  },
  {
    id: 56,
    category: "Formularios",
    title: "Permisos de llamadas con master toggles y tipos de destino compartidos (sustituida por #57)",
    description:
      "Llamadas y Transferencias comparten los mismos tipos de destino (Fijos, Móviles, Internacionales, Especial). Compartirlos evita duplicar 4 checkboxes idénticos bajo cada master toggle.",
    status: "reviewed",
    discovery:
      "Los toggles separados ocultan columnas enteras al desactivarse, causando un salto visual y perdiendo la referencia de qué permisos existen.",
  },
  {
    id: 57,
    category: "Formularios",
    title: "Permisos de llamadas como tabla-matriz con checkboxes master en cabecera",
    description:
      "Una tabla con filas de destino y columnas Llamadas/Transferencias. Al desactivar un master, la columna se atenúa pero permanece visible — el usuario ve la estructura completa sin saltos de layout.",
    status: "reviewed",
    discovery:
      "Los toggles separados ocultan columnas enteras al desactivarse, causando un salto visual y perdiendo la referencia de qué permisos existen.",
  },
  {
    id: 58,
    category: "Formularios",
    title: "Seguridad dentro de Configuración avanzada, no como card independiente",
    description:
      "'Expirar contraseña' es infrecuente y solo aplica en edición. Moverla al colapsable avanzado la mantiene accesible pero fuera del camino del flujo principal.",
    status: "reviewed",
  },
  {
    id: 59,
    category: "Formularios",
    title: "Toggles compactos en las cabeceras de la tabla-matriz de permisos",
    description:
      "Los toggles de Llamadas y Transferencias usan tamaño reducido (~18px) para caber en la celda de cabecera sin romper la alineación de la tabla.",
    status: "reviewed",
  },
  {
    id: 60,
    category: "Listas",
    title: "Nombres de grupo en azul como enlaces",
    description:
      "El azul es el color universal de enlace. En un contexto low-fi donde todo es gris, los nombres grises no se percibían como clicables.",
    status: "reviewed",
    discovery:
      "Los nombres grises con underline al hover se confundían con texto decorativo.",
  },
  {
    id: 61,
    category: "Formularios",
    title: "Chats simultáneos: dropdown de 1 a 11, visible solo si Chat está activo",
    description:
      "El rango está acotado por limitaciones del producto (1-11 sesiones). Un dropdown elimina la validación y los valores inválidos. Un badge en el botón Chat muestra el valor actual.",
    status: "reviewed",
  },
  {
    id: 62,
    category: "Listas",
    title: "Columna Presencia clicable con dropdown inline; sin columna Estado",
    description:
      "Una sola columna Presencia con dropdown inline. La presencia es la dimensión relevante para supervisores en tiempo real; el estado activo/inactivo es administrativo y pertenece al formulario.",
    discovery:
      "Dos columnas separadas (Estado + Presencia) duplican dimensiones: el estado activo/inactivo no aporta valor operativo en la tabla.",
    status: "reviewed",
  },
  {
    id: 63,
    category: "Formularios",
    title: "Zona peligrosa con borde rojo al final del formulario de agente",
    description:
      "La acción 'Eliminar agente' se presenta en una card con borde rojo, patrón reconocido en SaaS (GitHub, Vercel, Stripe). El borde rojo actúa como señal de advertencia visual antes de que el usuario lea el texto.",
    status: "reviewed",
  },
  {
    id: 64,
    category: "Interacción",
    title: "Eliminación con confirmación copy-paste del nombre",
    description:
      "El usuario debe copiar y pegar el nombre de la entidad para confirmar la eliminación. Añade fricción intencional a la acción más destructiva de la app.",
    status: "reviewed",
  },
  {
    id: 65,
    category: "Estructura",
    title: "Botón Crear alineado al título, buscador en la barra de acciones",
    description:
      "La acción principal está siempre visible junto al heading (patrón GitHub/Linear). El buscador y Exportar quedan en la barra de acciones, próximos a la tabla que filtran.",
    status: "reviewed",
    discovery:
      "Un subheader con contadores duplica información ya visible en la tabla.",
  },
  {
    id: 66,
    category: "Estructura",
    title: "Layout de dos columnas para formularios de creación/edición",
    description:
      "Columna izquierda fija (340px, sticky) con identidad y canales. Columna derecha flexible con el resto de secciones. La columna sticky mantiene visible la información de contexto mientras se configura el resto.",
    status: "reviewed",
    discovery:
      "Con una sola columna, los campos de identidad desaparecen al scrollear para configurar permisos o grupos.",
  },
  {
    id: 67,
    category: "Estructura",
    title: "Colapso a una columna en pantallas menores de 1024px",
    description:
      "Por debajo de 1024px la columna derecha tendría menos de 400px útiles y los controles se apretarían. El punto de corte restaura el layout de una columna que ya estaba validado.",
    status: "reviewed",
  },
  {
    id: 68,
    category: "Formularios",
    title: "Canales fusionados dentro de Identificación con botones horizontales",
    description:
      "La card Canales se elimina como card independiente y se integra en Identificación con un separador. Los 3 botones en horizontal caben en 340px y ocupan una sola fila en vez de tres.",
    status: "reviewed",
  },
  {
    id: 69,
    category: "Formularios",
    title: "Tipo de extensión y Extensión en la misma fila",
    description:
      "Ambos campos están semánticamente relacionados (el tipo condiciona la extensión). Compartir fila refuerza esa relación y ahorra ~60px de alto.",
    status: "reviewed",
  },
  {
    id: 70,
    category: "Formularios",
    title: "Foto de agente solo en modo edición",
    description:
      "Al crear un agente rara vez se tiene la foto lista. Eliminarla de la creación reduce la altura de la columna izquierda y acelera el flujo más frecuente.",
    status: "reviewed",
    discovery:
      "Restringir la foto a edición obliga a un paso extra innecesario (crear → volver → editar).",
  },
  {
    id: 71,
    category: "Formularios",
    title: "Teléfono y Email en la misma fila",
    description:
      "Ambos son datos de contacto opcionales y cortos. Compartir fila ahorra ~74px de alto y sigue el mismo patrón de campos pareados que Tipo/Extensión (DD#69).",
    status: "reviewed",
  },
  {
    id: 72,
    category: "Formularios",
    title: "Campos condicionales de canal movidos a Configuración avanzada",
    description:
      "Chats simultáneos y Script de chat son configuración de segundo nivel que se ajusta con menos frecuencia que la activación del canal. Moverlos a Config avanzada reduce la altura de la columna izquierda.",
    status: "reviewed",
  },
  {
    id: 73,
    category: "Visualización",
    title: "Iconos Lucide en las cabeceras de cada sección del formulario",
    description:
      "Un icono sutil (15px, gris claro) a la izquierda del título de cada sección facilita el escaneo rápido en formularios con 5+ secciones. Patrón común en settings de SaaS.",
    status: "reviewed",
  },
  {
    id: 74,
    category: "Formularios",
    title: "Capacidad máxima y Apertura de ficha en Configuración avanzada",
    description:
      "Capacidad máxima rara vez se cambia tras la configuración inicial, y Apertura de ficha es una integración que muchos grupos no usan. Ambas son candidatas naturales para el colapsable avanzado.",
    status: "reviewed",
  },
  {
    id: 75,
    category: "Visualización",
    title: "Iconos de canal por agente en la lista de asignados y el dropdown",
    description:
      "El supervisor ve de un vistazo si un agente puede atender los canales del grupo sin abrir su ficha. Los iconos en gris claro son sutiles y no compiten con el nombre.",
    status: "reviewed",
  },
  {
    id: 76,
    category: "Formularios",
    title: "Botones de canal horizontales en Grupos (mismo patrón que Agentes)",
    description:
      "Los 3 botones pasan de vertical a horizontal, idéntico al patrón de Agentes (DD#68). Reducen la altura de la card en ~70px manteniendo consistencia entre módulos.",
    status: "reviewed",
  },
  {
    id: 77,
    category: "Visualización",
    title: "Warning sutil cuando un agente no tiene todos los canales del grupo",
    description:
      "Un icono ámbar junto a los iconos de canal indica que el agente no cubre todos los canales activos del grupo. El tooltip detalla cuáles faltan. Es informativo, no bloqueante — el supervisor puede tener motivos legítimos para la asignación parcial.",
    status: "reviewed",
  },
  {
    id: 78,
    category: "Formularios",
    title: "Canales fusionados dentro de Identificación en Grupos (consistencia con Agentes)",
    description:
      "Replica el mismo patrón de Agentes (DD#68). Reduce las cards de la columna izquierda de 2 a 1.",
    status: "reviewed",
  },
  {
    id: 79,
    category: "Interacción",
    title: "Clic derecho abre el mismo menú contextual que el botón ⋯",
    description:
      "El clic derecho es un atajo para power users esperado en interfaces de tabla B2B (Figma, Linear, Notion). No sustituye al botón ⋯ — lo complementa como camino alternativo.",
    status: "reviewed",
  },
  {
    id: 80,
    category: "Interacción",
    title: "Clic derecho con multi-selección: 'Duplicar' y 'Eliminar' (sustituida por #226)",
    description:
      "Cuando hay 2+ filas seleccionadas, el clic derecho ofrece Duplicar y Eliminar (DD#226). La edición masiva sigue canalizada por la barra inferior.",
    status: "reviewed",
  },
  {
    id: 81,
    category: "Formularios",
    title: "Estado vacío en Estrategia cuando no hay canal telefónico activo",
    description:
      "Un indicador con borde discontinuo y texto explicativo informa de que la estrategia solo aplica al canal telefónico. No bloquea — se puede guardar sin teléfono.",
    status: "reviewed",
  },
  {
    id: 82,
    category: "Datos",
    title: "Nombres de agentes alineados entre todos los stores",
    description:
      "La lista de agentes asignados en grupos se deriva del store de agentes en vez de usar una lista independiente. Una única fuente de verdad elimina desincronizaciones de nombres.",
    status: "reviewed",
  },
  {
    id: 83,
    category: "Interacción",
    title: "Submenús en clic derecho masivo para cambiar prioridad/estado (sustituida por #206)",
    description:
      "Submenús laterales permiten cambiar prioridad o estado directamente desde el clic derecho masivo. Acción rápida sin pasar por la barra inferior.",
    status: "reviewed",
    discovery:
      "Los submenús de edición masiva en el clic derecho duplican parcialmente la barra inferior y crean dos caminos confusos para la misma acción.",
  },
  {
    id: 84,
    category: "Formularios",
    title: "Apertura de ficha dentro de Configuración avanzada",
    description:
      "Integración CRM que la mayoría de supervisores no modifica frecuentemente. Vive dentro del colapsable avanzado junto con otras configuraciones infrecuentes.",
    status: "reviewed",
  },
  {
    id: 85,
    category: "Formularios",
    title: "Email obligatorio y en primera posición",
    description:
      "El email es el identificador principal para notificaciones y recuperación de contraseña. Ponerlo primero guía el tab order natural del nombre al email. Al duplicar un agente, el email se limpia para evitar conflictos.",
    status: "reviewed",
  },
  {
    id: 86,
    category: "Formularios",
    title: "Extensión como dropdown de extensiones pre-registradas",
    description:
      "Las extensiones se seleccionan de un pool existente, no se inventan. El dropdown elimina errores de formato y colisiones. Las extensiones ya asignadas a otros agentes se excluyen automáticamente.",
    status: "reviewed",
  },
  {
    id: 87,
    category: "Formularios",
    title: "Grupo por defecto para salientes al final de la sección Grupos",
    description:
      "El grupo por defecto depende directamente de los grupos asignados. Ubicarlo justo después de la lista de grupos crea una relación visual causa-efecto. Se deshabilita cuando no hay grupos asignados.",
    status: "reviewed",
  },
  {
    id: 88,
    category: "Formularios",
    title: "Permisos de llamadas deshabilitados si el canal Teléfono no está activo",
    description:
      "Si un agente no atiende llamadas, configurar permisos de destino carece de sentido. La sección se atenúa visualmente con un mensaje indicando la dependencia.",
    status: "reviewed",
  },
  {
    id: 89,
    category: "Listas",
    title: "Columna Teléfono y Presencia sortable en tabla de agentes",
    description:
      "El teléfono directo es un dato operativo que el supervisor consulta sin abrir cada ficha. La presencia sortable permite ver rápidamente quién está disponible.",
    status: "reviewed",
  },
  {
    id: 90,
    category: "Formularios",
    title: "Foto de agente visible tanto en creación como en edición",
    description:
      "Limitar la foto a edición crea un paso extra innecesario: crear, volver al listado, editar para poner foto. Permitirlo desde la creación es más eficiente.",
    status: "reviewed",
    discovery:
      "Restringir la foto solo a edición obliga a un paso extra innecesario (crear → volver → editar).",
  },
  {
    id: 91,
    category: "Formularios",
    title: "Dropdown de grupos sin encabezado cuando no hay búsqueda activa",
    description:
      "El encabezado 'Todos los grupos disponibles' solo se muestra cuando hay un término de búsqueda activo. Sin búsqueda, es ruido visual innecesario.",
    status: "reviewed",
  },
  {
    id: 92,
    category: "Formularios",
    title: "Sin badge numérico en 'Grupos asignados'",
    description:
      "La información ya es evidente por la lista visible de grupos asignados justo debajo del título. Repetir el conteo es redundante.",
    status: "reviewed",
  },
  {
    id: 93,
    category: "Formularios",
    title: "Grupo por defecto sin separador visual",
    description:
      "Al ser un campo directamente relacionado con los grupos asignados, no necesita separación visual adicional con un divisor.",
    status: "reviewed",
  },
  {
    id: 94,
    category: "Formularios",
    title: "Mensaje de canal Teléfono desactivado en la cabecera de la card",
    description:
      "El aviso 'Activa el canal Teléfono...' se muestra en la cabecera de la card en vez de dentro del contenido. Evita que el contenido se desplace verticalmente cuando el canal no está activo.",
    status: "reviewed",
  },
  {
    id: 95,
    category: "Listas",
    title: "Selector de columnas como icon button a la izquierda del buscador",
    description:
      "Layout de la barra de acciones: [Columnas] [Buscar] [Exportar]. Agrupa las tres herramientas de tabla juntas: configurar vista, buscar contenido, exportar datos.",
    status: "reviewed",
  },
  {
    id: 96,
    category: "Interacción",
    title: "Botón de eliminación siempre en rojo",
    description:
      "El botón de confirmación de eliminación es siempre rojo. Las acciones destructivas usan el mismo color en todos los módulos.",
    status: "reviewed",
    discovery:
      "El botón usa gris oscuro en agentes y rojo en grupos — dos colores distintos para la misma acción destructiva.",
  },
  {
    id: 97,
    category: "Listas",
    title: "Footer de tabla unificado entre módulos",
    description:
      "Ambas tablas comparten el mismo layout de footer: indicador de ordenación a la izquierda, conteo y selector de filas a la derecha.",
    status: "reviewed",
  },
  {
    id: 98,
    category: "Formularios",
    title: "Componente toggle compartido con accesibilidad para lectores de pantalla",
    description:
      "Todos los toggles del proyecto usan un único componente compartido con atributos de accesibilidad. Un cambio de estilo se aplica en todos los sitios a la vez.",
    status: "reviewed",
  },
  {
    id: 99,
    category: "Interacción",
    title: "Diálogos accesibles con foco automático y cierre con Escape",
    description:
      "Los diálogos de confirmación incluyen atributos de accesibilidad para lectores de pantalla. Al abrirse, el foco se mueve al diálogo y Escape lo cierra.",
    status: "reviewed",
  },
  {
    id: 100,
    category: "Interacción",
    title: "Tooltips accesibles con Tab además de hover",
    description:
      "Los tooltips responden al foco del teclado además del hover. Los usuarios que navegan con Tab pueden ver los tooltips sin usar ratón.",
    status: "reviewed",
  },
  {
    id: 101,
    category: "Formularios",
    title: "Ctrl+S / Cmd+S para guardar formularios",
    description:
      "Atajo estándar que los usuarios esperan por familiaridad con herramientas de escritorio. Solo se activa cuando hay cambios pendientes.",
    status: "reviewed",
  },
  {
    id: 102,
    category: "Estructura",
    title: "Ancho del sidebar centralizado en una variable",
    description:
      "El ancho de 220px se define una sola vez. Todos los componentes que dependen de él leen la misma variable. Si se cambia en el futuro, basta con modificarla en un solo sitio.",
    status: "reviewed",
  },
  {
    id: 103,
    category: "Datos",
    title: "Cierre automático de menús al hacer clic fuera (centralizado)",
    description:
      "Un componente reutilizable cierra cualquier menú desplegable al hacer clic fuera o pulsar Escape. Todos los dropdowns del proyecto lo usan.",
    status: "reviewed",
  },
  {
    id: 104,
    category: "Formularios",
    title: "Zona peligrosa con eliminación en formulario de edición de grupo",
    description:
      "El botón 'Eliminar grupo' aparece al final de la columna derecha con confirmación copy-paste. El supervisor puede eliminar sin salir del formulario, mismo patrón que agentes.",
    status: "reviewed",
  },
  {
    id: 105,
    category: "Auditoría UX",
    title: "Toggles de formulario de grupo unificados al componente compartido",
    description:
      "Los toggles de Desbordar llamadas y Desbordar sesión usan el componente compartido ToggleSwitch (DD#98), con accesibilidad completa.",
    discovery:
      "Los toggles implementados como botones sin accesibilidad no anuncian su estado a lectores de pantalla.",
    status: "reviewed",
  },
  {
    id: 106,
    category: "Auditoría UX",
    title: "Dropdown de agentes sin sombras ni esquinas redondeadas",
    description:
      "El dropdown de agentes en grupos sigue el estilo low-fi del proyecto: sin sombras, sin redondeos, solo borde gris.",
    discovery:
      "El dropdown de agentes tiene sombra y esquinas redondeadas, inconsistentes con el estilo low-fi del resto de dropdowns.",
    status: "reviewed",
  },
  {
    id: 107,
    category: "Auditoría UX",
    title: "Icono de auriculares en lugar de avatares con iniciales",
    description:
      "Los agentes asignados en el formulario de grupo se representan con un icono de auriculares. Las reglas del proyecto prohíben avatares con iniciales (DD#47).",
    discovery:
      "Los círculos con iniciales incumplen la regla DD#47 y transmiten baja calidad en un contexto de contact center.",
    status: "reviewed",
  },
  {
    id: 108,
    category: "Auditoría UX",
    title: "Botón Cancelar con borde en ambos formularios",
    description:
      "Cancelar tiene borde gris en ambos módulos. Un botón sin borde junto a uno con fondo crea jerarquía visual ambigua.",
    discovery:
      "Cancelar no tiene borde en grupos pero sí en agentes — misma acción, aspecto diferente.",
    status: "reviewed",
  },
  {
    id: 109,
    category: "Auditoría UX",
    title: "Título de formulario unificado: mismo tamaño, solo el nombre en edición",
    description:
      "El título del formulario usa el mismo tamaño en todos los módulos: solo el nombre de la entidad en edición, o 'Crear...' en creación.",
    discovery:
      "El título usa tamaños diferentes entre formularios y formato inconsistente entre módulos.",
    status: "reviewed",
  },
  {
    id: 110,
    category: "Auditoría UX",
    title: "Búsqueda por extensión, teléfono, email y más campos",
    description:
      "La búsqueda filtra por nombre, extensión, código, teléfono y email. Un supervisor que recuerda la extensión 1004 pero no el nombre puede localizarlo directamente.",
    discovery:
      "La búsqueda que solo filtra por nombre obliga a recorrer la tabla visualmente para encontrar un agente por extensión o teléfono.",
    status: "reviewed",
  },
  {
    id: 111,
    category: "Auditoría UX",
    title: "Checkboxes de tabla con etiquetas para lectores de pantalla",
    description:
      "Los checkboxes de selección incluyen etiquetas descriptivas ('Seleccionar todos', 'Seleccionar {nombre}') para que los lectores de pantalla den contexto.",
    discovery:
      "Los checkboxes sin etiqueta se anuncian como 'checkbox' genérico, sin indicar qué fila afectan.",
    status: "reviewed",
  },
  {
    id: 112,
    category: "Auditoría UX",
    title: "Botón de eliminación en rojo en formulario de edición de agente",
    description:
      "El diálogo de eliminación dentro del formulario de edición usa rojo, consistente con DD#96.",
    discovery:
      "El diálogo de eliminación en el formulario de edición usa gris en vez de rojo, inconsistente con el resto de la plataforma.",
    status: "reviewed",
  },
  {
    id: 113,
    category: "Auditoría UX",
    title: "Selector de columnas sin badge numérico",
    description:
      "El botón del selector de columnas indica la configuración no-default solo con el cambio de estilo del borde. El supervisor ajusta las columnas intencionalmente y no necesita un conteo permanente.",
    discovery:
      "Un badge numérico en el botón de columnas es redundante: el cambio de borde ya comunica que la configuración difiere del default.",
    status: "reviewed",
  },
  {
    id: 114,
    category: "Listas",
    title: "Sin paginación — se muestran todos los resultados",
    description:
      "Con paginación, buscar solo filtra la página visible. Sin paginación la búsqueda es exhaustiva. El volumen típico de un contact center B2B (50-200 agentes) no requiere paginación.",
    status: "reviewed",
  },
  {
    id: 115,
    category: "Listas",
    title: "Columna ID con código numérico de 4-5 dígitos",
    description:
      "Código numérico independiente del ID interno. Oculto por defecto en el selector de columnas, visible para supervisores que necesitan referenciarlo.",
    status: "reviewed",
  },
  {
    id: 116,
    category: "Listas",
    title: "Columna Grabación con icono indicador",
    description:
      "Un icono indica si el agente tiene grabación activa. Oculto por defecto, sortable. Sin texto — solo el icono como indicador visual rápido.",
    status: "reviewed",
  },
  {
    id: 117,
    category: "Listas",
    title: "Exportar genera CSV con todas las columnas del dataset filtrado",
    description:
      "El CSV incluye todas las columnas de datos (no solo las visibles) del dataset filtrado/ordenado actual. Formato UTF-8 compatible con Excel.",
    status: "reviewed",
  },
  {
    id: 118,
    category: "Formularios",
    title: "Sección Plantillas con tabla seleccionable en formulario de agente",
    description:
      "Tabla con checkboxes para asignar plantillas de mensajes pre-configurados. Incluye buscador, columnas de tipo/título/vista previa, y contador de asignadas.",
    status: "reviewed",
  },
  {
    id: 119,
    category: "Formularios",
    title: "Selector de horario en Configuración avanzada",
    description:
      "Dropdown con horarios pre-definidos (general, ampliado, fin de semana, turnos). Nota indicando que el módulo de Agendas está en construcción.",
    status: "reviewed",
  },
  {
    id: 120,
    category: "Formularios",
    title: "Toggle 'Actualizar extensión en login' en Configuración avanzada",
    description:
      "Cuando está activo, al iniciar sesión el agente, la extensión configurada se aplica como número de llamada saliente. Texto descriptivo que prioriza claridad sobre la acción.",
    status: "reviewed",
  },
  {
    id: 121,
    category: "Estructura",
    title: "Icono de VUI Designer: nodos conectados",
    description:
      "El icono de nodos conectados (Workflow) representa mejor el concepto de 'flujos' conversacionales que un micrófono genérico.",
    discovery:
      "El icono de micrófono se confunde con grabación de audio y no representa el concepto de flujos.",
    status: "reviewed",
  },
  {
    id: 122,
    category: "Formularios",
    title: "Nombre del agente editable inline en el título de la página",
    description:
      "En edición, el nombre del agente es el título h1 clicable con icono de lápiz. Clic abre un input inline; Enter confirma, Escape revierte. Evita duplicar el nombre en el título y en el formulario.",
    status: "reviewed",
    discovery:
      "Se descartaron campo readonly con botón Edit y nombre en la cabecera de la card por ser menos naturales que editar directamente el título.",
  },
  {
    id: 123,
    category: "Formularios",
    title: "Nombre del grupo editable inline en el título (mismo patrón que agente)",
    description:
      "Replica el mismo patrón de DD#122 en grupos. El breadcrumb refleja el nombre actual en tiempo real.",
    status: "reviewed",
  },
  {
    id: 124,
    category: "Auditoría UX",
    title: "47 componentes pre-generados sin usar",
    description:
      "El proyecto incluye 47 componentes de librería que nunca se usan porque la app construye todo a medida. Son peso muerto que complica la navegación del código.",
    status: "reviewed",
  },
  {
    id: 125,
    category: "Auditoría UX",
    title: "~25 paquetes de dependencias no utilizados",
    description:
      "Paquetes referenciados solo por los componentes de librería eliminables. No afectan al producto final pero inflan el proyecto y crean falsa impresión de complejidad.",
    status: "reviewed",
  },
  {
    id: 126,
    category: "Auditoría UX",
    title: "Lista de agentes duplicada en datos de grupos",
    description:
      "La fuente de verdad de agentes es el almacén de agentes (DD#82). Listas duplicadas crean riesgo de desincronización.",
    discovery:
      "Una lista independiente de 15 agentes duplica la fuente de verdad del almacén de agentes.",
    status: "reviewed",
  },
  {
    id: 127,
    category: "Auditoría UX",
    title: "Códigos numéricos secuenciales al duplicar",
    description:
      "Al duplicar, el código generado toma el código más alto existente + 1. Evita saltos impredecibles en la numeración.",
    discovery:
      "El código generado al duplicar produce saltos impredecibles en la numeración.",
    status: "reviewed",
  },
  {
    id: 128,
    category: "Auditoría UX",
    title: "Extensión faltante añadida al pool de extensiones",
    description:
      "Todas las extensiones asignadas a agentes existen en el pool de extensiones disponibles.",
    discovery:
      "Un agente tiene asignada la extensión 113 pero esta no existe en el pool de extensiones disponibles.",
    status: "reviewed",
  },
  {
    id: 129,
    category: "Auditoría UX",
    title: "Imports de iconos al inicio del archivo",
    description:
      "Todos los imports de iconos se agrupan al inicio del archivo con el resto de dependencias.",
    discovery:
      "Algunos iconos se importaban a mitad del archivo, rompiendo la convención de agrupar imports al inicio.",
    status: "reviewed",
  },
  {
    id: 130,
    category: "Auditoría UX",
    title: "Versionado de datos local unificado entre agentes y grupos",
    description:
      "Agentes y grupos usan el mismo formato para controlar la versión de datos locales.",
    discovery:
      "Formatos diferentes de versionado entre agentes y grupos causan posibles fallos de actualización.",
    status: "reviewed",
  },
  {
    id: 131,
    category: "Auditoría UX",
    title: "Sin variables CSS sin usar",
    description:
      "Solo se conservan las variables CSS activas del proyecto.",
    discovery:
      "Decenas de variables CSS para modo oscuro, gráficas y componentes inexistentes inflaban la hoja de estilos sin aportar nada.",
    status: "reviewed",
  },
  {
    id: 132,
    category: "Auditoría UX",
    title: "Contraste suficiente en grises sobre fondo blanco",
    description:
      "Iconos de canal, etiquetas de columnas, textos de ayuda y placeholders usan tonos de gris con contraste suficiente para jornadas de 8h.",
    discovery:
      "Los grises demasiado claros (gray-300) en iconos, etiquetas y placeholders resultan ilegibles en jornadas largas.",
    status: "reviewed",
  },
  {
    id: 133,
    category: "Auditoría UX",
    title: "Cabeceras ordenables con estado accesible",
    description:
      "Las cabeceras ordenables indican si están ordenadas ascendente, descendente o sin ordenar mediante atributos accesibles (DD#167).",
    discovery:
      "Las cabeceras ordenables no comunican su estado de ordenación a lectores de pantalla.",
    status: "reviewed",
  },
  {
    id: 134,
    category: "Auditoría UX",
    title: "Menús contextuales ajustados al borde de la pantalla",
    description:
      "Los menús contextuales detectan automáticamente el espacio disponible y se reposicionan para no desbordarse del viewport.",
    discovery:
      "Los menús posicionados en el cursor sin verificar espacio se desbordan en filas cercanas al borde inferior.",
    status: "reviewed",
  },
  {
    id: 135,
    category: "Auditoría UX",
    title: "Navegación por teclado en todos los dropdowns",
    description:
      "Todos los dropdowns soportan navegación con flechas, confirmación con Enter, cierre con Escape e Inicio/Fin, mediante un componente reutilizable (DD#196).",
    discovery:
      "Los dropdowns sin navegación por teclado obligan a usar el ratón para cada interacción.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 136,
    category: "Auditoría UX",
    title: "Foco restaurado al cerrar diálogos",
    description:
      "Al cerrar un diálogo de confirmación, el foco vuelve al botón que lo abrió.",
    discovery:
      "Al cerrar un diálogo, el foco se pierde en la página y el usuario debe reorientarse manualmente.",
    status: "reviewed",
  },
  {
    id: 137,
    category: "Auditoría UX",
    title: "Icono de edición de nombre siempre visible",
    description:
      "El lápiz que indica que el título es editable tiene opacidad base reducida, visible sin necesidad de hover. Apto para tablets.",
    discovery:
      "Un icono visible solo en hover es invisible en tablets, donde no existe el concepto de hover.",
    status: "reviewed",
  },
  {
    id: 138,
    category: "Auditoría UX",
    title: "Selector de audio limitado a WAV/MP3 con tamaño máximo de 5MB",
    description:
      "Los selectores de audio validan formato (WAV/MP3) y tamaño (máx 5MB), con toast de error si no cumple.",
    discovery:
      "Los selectores de audio que aceptan cualquier formato y tamaño permiten subir archivos inutilizables.",
    status: "reviewed",
  },
  {
    id: 139,
    category: "Auditoría UX",
    title: "Estado vacío de dataset vacío verificado en ambos listados",
    description:
      "Ambos listados muestran estado vacío con icono, texto orientativo y botón 'Crear primero...' tanto para dataset vacío como para búsqueda sin resultados.",
    status: "reviewed",
  },
  {
    id: 140,
    category: "Auditoría UX",
    title: "Acciones masivas con undo desde clic derecho",
    description:
      "Las acciones masivas desde el clic derecho incluyen toast de 8 segundos con botón 'Deshacer'.",
    discovery:
      "Las acciones masivas desde clic derecho se aplican sin posibilidad de deshacer.",
    status: "reviewed",
  },
  {
    id: 141,
    category: "Auditoría UX",
    title: "Spacing diferenciado entre cards estándar y secciones avanzadas",
    description:
      "Config avanzada y Zona peligrosa usan espaciado mayor que las cards estándar. La diferencia crea separación jerárquica intencional para secciones de segundo nivel.",
    status: "reviewed",
  },
  {
    id: 142,
    category: "Auditoría UX",
    title: "Plantillas como sección colapsable con resumen inline",
    description:
      "La sección Plantillas se muestra colapsada con un resumen ('N asignadas' o 'Sin plantillas'). Reduce la carga visual del formulario ocultando configuración secundaria (DD#12).",
    status: "reviewed",
  },
  {
    id: 143,
    category: "Auditoría UX",
    title: "Anuncios y audio: lista inline en vez de grid de 3 columnas",
    description:
      "La sección de audio usa 3 filas inline con label fijo y selector de archivo. Reduce la altura ~40% respecto a un grid de 3 columnas.",
    discovery:
      "Un grid de 3 columnas de audio desperdicia espacio horizontal y ocupa más altura que una lista inline.",
    status: "reviewed",
  },
  {
    id: 144,
    category: "Auditoría UX",
    title: "Panel de decisiones de diseño visible en todos los entornos",
    description:
      "El botón 'Decisiones de diseño' se muestra en todos los entornos para facilitar la revisión con stakeholders. Se puede ocultar en producción fácilmente cuando se desee.",
    status: "reviewed",
  },
  {
    id: 145,
    category: "Auditoría UX",
    title: "Ruta raíz apunta a Grupos en vez de Dashboard",
    description:
      "Decisión consciente: Grupos es el módulo más maduro. Se revisará cuando Dashboard tenga contenido operativo real.",
    status: "reviewed",
  },
  {
    id: 146,
    category: "Auditoría UX",
    title: "Función de copiar al portapapeles centralizada",
    description:
      "Una única función de copiar (con fallback para navegadores antiguos) sirve a todos los diálogos de confirmación.",
    discovery:
      "La misma función de copiar está duplicada en dos diálogos, creando riesgo de divergencia.",
    status: "reviewed",
  },
  {
    id: 147,
    category: "Auditoría UX",
    title: "Validación de tipos en actualización masiva de grupos",
    description:
      "La actualización masiva de grupos valida compatibilidad de campo y valor antes de aplicar, igual que agentes.",
    discovery:
      "La actualización masiva de grupos acepta cualquier campo y valor sin verificar compatibilidad.",
    status: "reviewed",
  },
  {
    id: 148,
    category: "Auditoría UX",
    title: "Dropdown de presencia con detección automática de espacio",
    description:
      "El dropdown de presencia se abre hacia arriba automáticamente cuando no hay espacio suficiente debajo.",
    discovery:
      "El dropdown que se abre siempre hacia abajo queda oculto en las últimas filas de la tabla.",
    status: "reviewed",
  },
  {
    id: 149,
    category: "Auditoría UX",
    title: "Sin estados de carga — deuda aceptada",
    description:
      "Los listados renderizan datos locales directamente. Se preparará infraestructura de esqueletos de carga al migrar a API.",
    status: "reviewed",
  },
  {
    id: 150,
    category: "Auditoría UX",
    title: "Tabla de plantillas sin preview expandible — deuda aceptada",
    description:
      "La columna Vista previa trunca el contenido sin forma de ver el texto completo. Pendiente de iteración avanzada del módulo de Plantillas.",
    status: "reviewed",
  },
  {
    id: 151,
    category: "Auditoría UX",
    title: "Transición suave en menús y tooltips",
    description:
      "Todos los elementos flotantes aparecen y desaparecen con transición de opacidad de 100ms.",
    discovery:
      "Los elementos flotantes que aparecen y desaparecen instantáneamente crean un efecto de parpadeo.",
    status: "reviewed",
  },
  {
    id: 152,
    category: "Auditoría UX",
    title: "Puntos de presencia con estilo unificado",
    description:
      "Los puntos de color del badge de presencia usan la clase estándar del proyecto, no estilos inline.",
    discovery:
      "Los puntos de presencia con estilos escritos directamente en el elemento divergen del estándar del proyecto.",
    status: "reviewed",
  },
  {
    id: 153,
    category: "Auditoría UX",
    title: "Escala tipográfica: 14px unificado",
    description:
      "La escala tipográfica usa 14px como tamaño base, con negritas como diferenciador jerárquico. Se reducen los tamaños de 8 a 7.",
    discovery:
      "La diferencia entre 14px y 15px es imperceptible (7%) y añade un tamaño innecesario a la escala.",
    status: "reviewed",
  },
  {
    id: 154,
    category: "Auditoría UX",
    title: "Toda la celda del checkbox es clicable",
    description:
      "Toda la celda de la columna de checkboxes responde al clic, superando el mínimo recomendado de 44×44px (DD#196).",
    discovery:
      "Los checkboxes de 16×16px están muy por debajo del mínimo recomendado de 44×44px para interacción táctil.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 155,
    category: "Auditoría UX",
    title: "Botón ⋯ de 32×32px",
    description:
      "El botón de tres puntos tiene un área clicable de 32×32px, suficiente para pantallas táctiles.",
    discovery:
      "Un área clicable de ~28×28px es insuficiente para uso cómodo en pantallas táctiles.",
    status: "reviewed",
  },
  {
    id: 156,
    category: "Auditoría UX",
    title: "Botones de barra masiva más compactos que el resto — decisión consciente",
    description:
      "Los botones de la barra inferior son más pequeños que los del header. El fondo oscuro de la barra delimita la zona de acción y el contraste visual compensa el tamaño menor.",
    status: "reviewed",
  },
  {
    id: 157,
    category: "Auditoría UX",
    title: "Botón Exportar con borde visible",
    description:
      "Exportar tiene borde gris, igual que el resto de controles de la barra de acciones.",
    discovery:
      "Un botón sin borde parece un label decorativo y no invita al clic.",
    status: "reviewed",
  },
  {
    id: 158,
    category: "Auditoría UX",
    title: "Control segmentado en lugar de radios nativos",
    description:
      "Apertura de ficha usa botones segmentados personalizados, consistentes con el estilo low-fi del proyecto.",
    discovery:
      "Los radios nativos del navegador tienen estilos propios que rompen el estilo low-fi del proyecto.",
    status: "reviewed",
  },
  {
    id: 159,
    category: "Auditoría UX",
    title: "Toasts con acciones visibles durante 8 segundos",
    description:
      "Los toasts que incluyen botones de acción (como 'Editar agente →' o 'Deshacer') permanecen visibles 8 segundos.",
    discovery:
      "4 segundos es insuficiente para que el usuario lea el toast y decida si pulsa la acción.",
    status: "reviewed",
  },
  {
    id: 160,
    category: "Auditoría UX",
    title: "Validación de formato de email",
    description:
      "El formulario valida que el email tenga formato válido además de no estar vacío.",
    discovery:
      "El campo email (obligatorio) no se valida como email válido, permitiendo guardar valores inútiles.",
    status: "reviewed",
  },
  {
    id: 161,
    category: "Auditoría UX",
    title: "Undo para todas las operaciones masivas",
    description:
      "Todas las acciones masivas usan patrón optimista: se aplica el cambio y se muestra toast con 'Deshacer' durante 8 segundos. Si el usuario pulsa, se revierte al estado anterior.",
    discovery:
      "Las acciones masivas sin undo son irreversibles — el usuario no tiene forma de corregir un error.",
    status: "reviewed",
  },
  {
    id: 162,
    category: "Auditoría UX",
    title: "Cabecera 'Grupos' sin prefijo 'N'",
    description:
      "El prefijo 'N' (número de) es jerga técnica que puede confundirse con un nombre propio. La celda ya muestra un número, así que la cabecera solo necesita el nombre.",
    discovery:
      "El prefijo 'N' en la cabecera es redundante cuando la celda ya muestra un número.",
    status: "reviewed",
  },
  {
    id: 163,
    category: "Auditoría UX",
    title: "Badge de presencia con ancho flexible",
    description:
      "El badge de presencia usa ancho mínimo flexible que se adapta al texto del estado.",
    discovery:
      "Un ancho fijo de 120px desperdicia espacio para estados cortos como 'Baño' y limita estados más largos.",
    status: "reviewed",
  },
  {
    id: 164,
    category: "Auditoría UX",
    title: "Barra de acciones masivas adaptable a pantallas estrechas",
    description:
      "En pantallas estrechas, los controles de la barra saltan automáticamente a una segunda línea.",
    discovery:
      "En pantallas menores de 900px los controles de la barra se comprimen hasta ser inutilizables.",
    status: "reviewed",
  },
  {
    id: 165,
    category: "Auditoría UX",
    title: "Breadcrumbs clicables en listados",
    description:
      "'Administración' en los breadcrumbs de listados navega a la sección admin, consistente con DD#21.",
    discovery:
      "Los breadcrumbs de los listados no eran clicables, a diferencia de los formularios.",
    status: "reviewed",
  },
  {
    id: 166,
    category: "Auditoría UX",
    title: "Extensiones ocupadas visibles con nombre del agente asignado",
    description:
      "Las extensiones ya asignadas aparecen atenuadas en el dropdown con '(Asignada a Nombre)'. El usuario sabe por qué no están disponibles.",
    discovery:
      "Las extensiones ya asignadas que se ocultan sin explicación dejan al usuario sin saber por qué no aparecen.",
    status: "reviewed",
  },
  {
    id: 167,
    category: "Auditoría UX",
    title: "Cabeceras de tabla con atributos de orden para lectores de pantalla",
    description:
      "Las cabeceras ordenables incluyen atributos que indican si están ordenadas ascendente, descendente o sin ordenar. Los lectores de pantalla anuncian esta información.",
    status: "reviewed",
  },
  {
    id: 168,
    category: "Auditoría UX",
    title: "Warning HTTPS en Apertura de ficha como texto inline — correcto",
    description:
      "Al seleccionar 'Abrir ficha embebida' aparece un texto informativo sobre HTTPS. Estilo coherente con DD#48 (warnings simplificados a texto inline). No requiere cambio.",
    status: "reviewed",
  },
  {
    id: 169,
    category: "Auditoría UX",
    title: "Aviso al editar la misma entidad en dos pestañas del navegador",
    description:
      "Si la misma página de edición se abre en dos pestañas, se detecta automáticamente y se muestra un banner de advertencia.",
    discovery:
      "Editar la misma entidad en dos pestañas simultáneas causa que la segunda sobrescriba los cambios de la primera sin aviso.",
    status: "reviewed",
  },
  {
    id: 170,
    category: "Auditoría UX",
    title: "Leyenda de iconos de tipo de agente al pie de la tabla",
    description:
      "Los iconos de tipo (Normal, Cuscare, Carrier, Admin) no son autoexplicativos. Una leyenda discreta al pie de la tabla permite al usuario nuevo interpretarlos sin hovear cada uno.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 171,
    category: "Patch UX",
    title: "Correcciones UX — fase 1",
    description:
      "Primer lote: mejor contraste, menús ajustados al viewport, portapapeles con API moderna, botones ampliados a 32px, dropdown de presencia con dropup, exportar con borde, toasts de 8s, controles segmentados, breadcrumbs clicables, lápiz de edición siempre visible, y limpieza de variables CSS.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 172,
    category: "Patch UX",
    title: "Correcciones UX — fase 2",
    description:
      "Segundo lote: undo en operaciones masivas, validación de email, selector de audio con límites, extensiones ocupadas visibles, aviso de edición en dos pestañas, barra masiva responsive, y leyenda de iconos.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 173,
    category: "Estructura",
    title: "Módulo de Labels con modelo propio y ruta independiente",
    description:
      "Cada label tiene nombre, color (paleta de 8) y descripción opcional. Datos en almacenamiento local con sincronización automática. Accesible desde Repositorios > Labels.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 174,
    category: "Listas",
    title: "Creación y edición de labels con panel flotante",
    description:
      "El botón 'Nueva label' abre un panel flotante para nombre, color y descripción. La edición desde cada fila usa el mismo panel.",
    status: "reviewed",
    discovery:
      "Una fila de formulario inline dentro de la tabla causa un salto visual molesto al aparecer y desaparecer.",
    date: "2026-02-25",
  },
  {
    id: 175,
    category: "Listas",
    title: "Labels junto al nombre del agente como puntos de color con tooltip",
    description:
      "Pequeños círculos del color de cada label asignada (máximo 5, '+N' si hay más). Al pasar el cursor aparece un tooltip con los nombres. Diseño minimalista que no satura la tabla.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 176,
    category: "Formularios",
    title: "Selector de labels en formulario de agente con creación rápida",
    description:
      "Buscador de labels con opción de crear una nueva directamente si no existe. Las labels asignadas se muestran como chips con botón × para desasignar.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 177,
    category: "Listas",
    title: "Filtro por labels en listado de agentes (lógica OR)",
    description:
      "Dropdown de labels con checkboxes en la barra de acciones. Al seleccionar labels se muestran agentes que tengan al menos una de ellas. Badge numérico indica cuántas labels están activas.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 178,
    category: "Visualización",
    title: "Icono de Cuscare Carrier: edificio en vez de camión",
    description:
      "'Carrier' en telecomunicaciones se refiere a operadoras (Orange, Telefónica), no a transporte. El icono de edificio representa mejor el concepto.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 179,
    category: "Visualización",
    title: "Icono de tipificación: Tags (plural)",
    description:
      "La tabla y el sidebar usan Tags (plural) de forma consistente.",
    discovery:
      "La tabla usa Tag (singular) y el sidebar Tags (plural) — inconsistencia de nomenclatura.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 180,
    category: "Visualización",
    title: "Checkboxes personalizados: borde solo sin marcar, relleno oscuro al marcar",
    description:
      "Los checkboxes usan diseño propio low-fi: solo borde gris cuando no están marcados, fondo oscuro con check blanco cuando lo están. Apariencia consistente entre plataformas.",
    discovery:
      "Los checkboxes nativos del navegador tienen fondo gris y apariencia inconsistente entre plataformas.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 182,
    category: "Interacción",
    title: "Botones de acción primaria sin icono de check",
    description:
      "Crear, Guardar y similares usan solo texto. El icono check se reserva para indicar estados (selección activa, confirmación inline), no para decorar botones.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 184,
    category: "Navegación",
    title: "Contador de agentes en Labels es un enlace al listado filtrado",
    description:
      "El número de agentes de cada label lleva al listado de agentes filtrado por esa label. La URL incluye el filtro y se sincroniza con el dropdown.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 185,
    category: "Listas",
    title: "Sin contadores redundantes en la barra de acciones",
    description:
      "La barra de acciones no incluye contadores. El pie de tabla ya muestra esa información — repetirla añade ruido.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 186,
    category: "Auditoría UX",
    title: "Auditoría de consistencia visual entre los 3 módulos",
    description:
      "Verificación completa de que Agentes, Grupos y Labels comparten los mismos patrones: iconos, buscador, barra de acciones, checkboxes, colores de tabla, tooltips, estados vacíos, breadcrumbs, menús y formularios.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 187,
    category: "Interacción",
    title: "Asignación masiva de labels desde la barra de acciones masivas",
    description:
      "Botón 'Labels' en la barra abre dropdown con checkboxes. Check indica que todos los seleccionados la tienen, guión indica que solo algunos. Clic asigna o quita a todos, con undo.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 188,
    category: "Formularios",
    title: "Filtro por labels en el selector de agentes de formulario de grupo",
    description:
      "Chips de labels encima del dropdown filtran agentes que tengan esa label (lógica OR). Puntos de color junto a cada nombre en el dropdown. Reseteable con ×.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 189,
    category: "Interacción",
    title: "Submenú Labels en el menú contextual de agente individual",
    description:
      "Submenú con checkboxes de labels en el menú ⋯ y clic derecho. Permite asignar/quitar labels con un clic sin entrar al formulario. Toast con undo.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 190,
    category: "Interacción",
    title: "Solo un divider en el menú contextual: antes de Eliminar",
    description:
      "Editar y Duplicar van juntos (acciones no destructivas). El divider solo aparece antes de Eliminar para separar visualmente la acción destructiva.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 191,
    category: "Listas",
    title: "Labels fusionadas en la columna Nombre de agentes",
    description:
      "Los puntos de color se muestran inline junto al nombre del agente en vez de en columna independiente. Reduce densidad horizontal sin perder información.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 192,
    category: "Formularios",
    title: "Filtro por labels en lista de agentes asignados del formulario de grupo",
    description:
      "Chips de labels debajo del buscador filtran los agentes ya asignados (lógica OR). Complementa el filtro del dropdown de búsqueda (DD#188). Botón 'Limpiar' para resetear.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 193,
    category: "Estructura",
    title: "Campo fecha en decisiones de diseño para ordenación cronológica",
    description:
      "Cada decisión puede incluir la fecha en que se tomó. El visor ordena dentro de cada categoría por fecha descendente (más recientes primero).",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 194,
    category: "Auditoría UX",
    title: "Leyenda de iconos de tipo implementada (DD#170)",
    description:
      "La leyenda discreta al pie de la tabla de agentes cubre los 4 tipos (Normal, Cuscare, Carrier, Admin). Implementada como parte de DD#172.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 195,
    category: "Patch UX",
    title: "Checkboxes de labels visibles + botón 'Filtros'",
    description:
      "Los checkboxes en dropdowns de labels tienen borde visible sin marcar. El botón se llama 'Filtros' para escalar a futuras dimensiones de filtrado.",
    discovery:
      "Los checkboxes sin borde visible en estado no-marcado son invisibles sobre fondo blanco.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 196,
    category: "Interacción",
    title: "Navegación por teclado en todos los dropdowns + celdas de checkbox clicables",
    description:
      "Componente reutilizable de navegación (flechas, Enter, Escape, Inicio/Fin) aplicado a todos los dropdowns. Toda la celda del checkbox en las tablas es clicable.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 197,
    category: "Interacción",
    title: "Filtro de labels anidado dentro del dropdown de columnas (sustituida por #208)",
    description:
      "El filtro de labels vive dentro del selector de columnas para mantener la consistencia del action bar con 3 controles. Badge numérico indica filtros activos.",
    status: "reviewed",
    date: "2026-02-25",
    discovery:
      "Mezclar configuración de columnas con filtrado de datos en el mismo dropdown es confuso: son dos intenciones distintas.",
  },
  {
    id: 198,
    category: "Auditoría UX",
    title: "Auditoría UX/UI completa de los 4 flujos del prototipo",
    description:
      "Revisión integral de Agentes, Grupos, Labels y edición masiva cubriendo: estructura, interacciones, jerarquía visual, accesibilidad y consistencia de componentes.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 199,
    category: "Interacción",
    title: "Diálogo de previsualización de impacto para operaciones masivas",
    description:
      "Modal que muestra el resumen de la operación, la lista de elementos afectados con opción de quitar individualmente, y contador 'N de M'. Patrón más natural que inline banner o side panel para acciones masivas.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 200,
    category: "Estructura",
    title: "Tooltip compartido que reemplaza todas las implementaciones individuales",
    description:
      "Un único componente de tooltip reutilizable con posición arriba/abajo, ancho configurable, contenido rico y flecha indicadora. Reemplaza todas las implementaciones individuales.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 201,
    category: "Interacción",
    title: "Iconos de canal con tooltip y accesibilidad para lectores de pantalla",
    description:
      "Cada icono de canal (Teléfono, Chat, Email) incluye tooltip compartido y atributos de accesibilidad para que los lectores de pantalla los anuncien correctamente.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 202,
    category: "Navegación",
    title: "Rutas de Grupos unificadas bajo /admin/grupos/*",
    description:
      "Las rutas de Grupos se unificaron al mismo patrón que Agentes (/admin/agentes/*). Sidebar, breadcrumbs y navegación interna actualizados.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 203,
    category: "Estructura",
    title: "Todos los tooltips del proyecto usan el componente compartido",
    description:
      "Un único componente de tooltip sirve a todas las instancias del proyecto. Unifica estilo visual y centraliza el comportamiento en un solo sitio.",
    discovery:
      "7 implementaciones individuales de tooltip con estilos y comportamientos divergentes.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 204,
    category: "Patch UX",
    title: "Fix: mapa de iconos de canal declarado en orden incorrecto",
    description:
      "El mapa de iconos de canal se declara antes del componente que lo consume. La definición debe preceder al uso.",
    discovery:
      "El mapa de iconos definido después del componente que lo usa causa un error de referencia.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 205,
    category: "Patch UX",
    title: "Hover states y spacing unificados en botones de acción de tabla",
    description:
      "El botón ⋯ usa el mismo patrón de hover y spacing en todos los módulos.",
    discovery:
      "El botón ⋯ tiene estilos de hover diferentes entre Agentes y Grupos — misma acción, aspecto diferente.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 206,
    category: "Interacción",
    title: "Menú contextual masivo sin submenús (sustituida por #226)",
    description:
      "El menú contextual masivo no tiene submenús. La edición masiva vive en la barra inferior; duplicar funciones en dos sitios crea confusión.",
    discovery:
      "Los submenús de edición (cambiar estado/prioridad) duplican la funcionalidad de la barra inferior con menos opciones.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 207,
    category: "Interacción",
    title: "Tooltip de selector de columnas: componente compartido",
    description:
      "El tooltip del selector de columnas usa el componente compartido. Se oculta automáticamente cuando el dropdown está abierto.",
    discovery:
      "El último tooltip individual del proyecto tiene comportamiento propio divergente del resto.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 208,
    category: "Interacción",
    title: "Filtro de labels extraído a componente independiente",
    description:
      "El filtro de labels tiene un botón propio en la barra de acciones, separado del dropdown de columnas. Mezclar configuración de columnas con filtrado de datos es confuso.",
    status: "reviewed",
    date: "2026-02-25",
    discovery:
      "El filtro anidado dentro del selector de columnas mezcla dos intenciones distintas (configurar vista vs. filtrar datos).",
  },
  {
    id: 209,
    category: "Interacción",
    title: "Labels no necesitan operaciones masivas",
    description:
      "Las labels son configuración puntual que se crea y edita una vez. Bulk edit/delete duplicaría flujos sin aportar valor real para un módulo que no requiere gestión masiva.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 210,
    category: "Patch UX",
    title: "Limpieza post-extracción: referencias e imports corregidos",
    description:
      "Corrección de referencias internas erróneas y eliminación de imports sin usar. Verificación de que el menú contextual simplificado funciona correctamente.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 211,
    category: "Interacción",
    title: "Puntos de labels clicables: popover inline para consultar y editar labels",
    description:
      "Clic en los puntos de color abre un popover con checkboxes de todas las labels, permitiendo consultarlas y editarlas sin salir del listado. Para agentes sin labels, se usa el submenú del clic derecho.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 212,
    category: "Visualización",
    title: "Datos mock: 6 agentes con grabación activa",
    description:
      "Se activó grabación en 6 agentes del mockup para que la columna Grabación muestre datos variados.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 213,
    category: "Interacción",
    title: "Sin filter chips debajo de la barra de acciones",
    description:
      "El dropdown de filtro ya señaliza los filtros activos con badge numérico, y el estado vacío explica qué filtros están activos. Añadir chips duplicaría la señalización y consumiría espacio vertical.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 214,
    category: "Interacción",
    title: "Filtro de labels: lógica OR, sin opción AND",
    description:
      "OR muestra agentes que tengan alguna de las labels seleccionadas. Es más intuitivo para el caso típico ('muéstrame agentes de Orange España O de Orange Colombia'). AND reduciría resultados de forma confusa para la mayoría de supervisores.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 215,
    category: "Interacción",
    title: "Filtro de labels en agentes asignados: dropdown desde icono Tag sin layout shift",
    description:
      "Un botón Tag junto al buscador abre un dropdown posicionado en absoluto para filtrar por label. Evita el salto de layout que causan los chips inline al aparecer/desaparecer debajo del buscador.",
    status: "reviewed",
    date: "2026-02-25",
    discovery:
      "Los chips inline de filtro causan layout shift al aparecer/desaparecer, desplazando la lista de agentes hacia abajo.",
  },
  {
    id: 216,
    category: "Visualización",
    title: "DD#180/181/183 consolidadas: checkboxes personalizados",
    description:
      "Tres decisiones que describían el mismo aspecto (fondo transparente en checkboxes, diseño propio, estilo minimalista) se consolidan en DD#180.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 217,
    category: "Interacción",
    title: "Paneles de filtro por label: navegación por teclado con flechas y Escape",
    description:
      "Los paneles de filtro por label soportan flechas arriba/abajo para mover el foco entre opciones y Escape para cerrar. Los botones ya responden a Enter/Space de forma nativa.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 218,
    category: "Interacción",
    title: "Filtro de labels en dropdown de agentes disponibles: botón Tag sin layout shift",
    description:
      "Un botón Tag junto al input de búsqueda de agentes disponibles abre el dropdown de filtro por label, con el mismo patrón de DD#215.",
    discovery:
      "Los chips inline dentro del dropdown de búsqueda causan layout shift al aparecer/desaparecer.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 219,
    category: "Arquitectura",
    title: "LabelFilterButton: componente reutilizable para filtro de labels compacto",
    description:
      "Componente compartido en /shared/LabelFilterButton.tsx con patrón Tag-icon + dropdown. Usa useClickOutside y useKeyboardNav (DD#135, DD#217). Acepta props iconSize, zIndex y forceClose para adaptarse a distintos contextos.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 220,
    category: "Interacción",
    title: "Auto-cierre del panel de labels al cerrar el dropdown de agentes disponibles",
    description:
      "El LabelFilterButton del dropdown de agentes recibe forceClose={!agentDropdownOpen}. Cuando el dropdown de resultados se cierra, el panel de labels se cierra automáticamente sin dejar elementos huérfanos.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 221,
    category: "Arquitectura",
    title: "LabelFilterButton y LabelFilterDropdown unificados con variant prop",
    description:
      "LabelFilterButton con prop variant='action-bar'|'compact' unifica las dos variantes: action-bar (icono Filter, checkbox+LabelChip, tooltip) y compact (icono Tag, dot+check, badge circular). Comparten lógica (state, useClickOutside, useKeyboardNav) con renderizado diferenciado. LabelFilterDropdown se mantiene como alias backward-compatible.",
    discovery:
      "Dos componentes separados (LabelFilterDropdown y LabelFilterButton) compartían el 80% de la lógica y divergían en detalles de estilo.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 222,
    category: "Arquitectura",
    title: "LabelFilterButton: prop placement explícita para alineación del dropdown",
    description:
      "Prop placement='left'|'right' en el componente unificado. Por defecto se deriva del variant (left para action-bar, right para compact), pero puede sobreescribirse explícitamente. Elimina la dependencia implícita entre variant y alineación.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 223,
    category: "UI",
    title: "LabelFilterButton compact: max-h + scroll para listas largas de labels",
    description:
      "El panel del variant compact tiene max-h-[280px] con overflow-y-auto, consistente con el action-bar (max-h-[340px]). Previene que listas largas de labels desborden el viewport en contextos compactos.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 224,
    category: "UI",
    title: "LabelFilterButton compact: header sticky + icono X en lugar de texto 'Limpiar'",
    description:
      "El header 'Filtrar por label' del variant compact es sticky (top-0, bg-white, z-10) para mantenerse visible al hacer scroll. Un icono X sutil (10px, gray-300 → gray-500 hover) en lugar de texto 'Limpiar' ocupa mínimo espacio horizontal, con title y aria-label 'Quitar filtros'. Consistente con el estilo low-fi compacto.",
    status: "reviewed",
    date: "2026-02-25",
  },
  {
    id: 225,
    category: "UI",
    title: "Eliminación sistemática de layout shift en toda la plataforma",
    description:
      "Auditoría de 6 fuentes de CLS: (1) LabelFilterButton action-bar: botón siempre w-[34px] con badge absoluto circular; (2) LabelsPage bulk bar: fixed bottom-0 consistente con Agentes/Grupos; (3) LabelFormPanel error: espacio reservado con min-h-[18px]; (4) Agentes/Grupos/Labels: pb-20 dinámico cuando bulk bar visible; (5) SortableHeader: icono inactivo normalizado a size={12}; (6) Columna 'Agentes' eliminada de la tabla de Labels.",
    status: "reviewed",
    date: "2026-02-26",
  },
  {
    id: 226,
    category: "Interacción",
    title: "BulkContextMenu: 'Duplicar' y 'Eliminar'",
    description:
      "El menú contextual de clic derecho en multi-selección ofrece 'Duplicar N seleccionados' (icono CopyPlus) y 'Eliminar N seleccionados'. Ambos pasan por ImpactPreviewDialog para confirmar. Sin submenús (DD#206-207) y sin opción de editar individual.",
    status: "reviewed",
    date: "2026-02-26",
  },
  {
    id: 227,
    category: "UI",
    title: "DeleteDialog bulk: chips sin conteo, con X en hover para quitar elementos",
    description:
      "En ambos diálogos de eliminación bulk (Grupos y Agentes), los chips no muestran conteo entre paréntesis. Cada chip tiene un botón X invisible que aparece en hover (opacity-0 → group-hover/chip:opacity-100, transition-opacity) para quitar ítems de la lista sin layout shift (min-h-[28px] reservado). El título y botón de confirmar se actualizan dinámicamente al quitar chips. Si se quitan todos, el diálogo se cierra. onConfirm recibe remainingIds para que solo se eliminen los ítems visibles.",
    status: "reviewed",
    date: "2026-02-26",
  },
  {
    id: 228,
    category: "UI",
    title: "Transición suave en pb-20 del bulk bar",
    description:
      "Las tres páginas de listado (Agentes, Grupos, Labels) aplican transition-[padding] duration-200 al contenedor principal. El padding-bottom extra (pb-20) que reserva espacio para el bulk bar se anima en 200ms, evitando un salto visual al seleccionar/deseleccionar filas.",
    status: "reviewed",
    date: "2026-02-26",
  },
  {
    id: 229,
    category: "UI",
    title: "ImpactPreviewDialog: botones sin conteo redundante",
    description:
      "El botón de confirmar muestra solo la acción ('Aplicar', 'Duplicar') sin repetir el conteo que ya aparece en el título. El footer tampoco muestra 'N de M entidades'. El título comunica toda la información: operación + conteo + tipo.",
    status: "reviewed",
    date: "2026-02-26",
    discovery:
      "El conteo aparece en tres sitios simultáneamente (título, badge y botón), creando redundancia innecesaria.",
  },
  {
    id: 230,
    category: "Auditoría UX",
    title: "Auditoría de consistencia cross-module: 7 inconsistencias corregidas",
    description:
      "Revisión sistemática de Agentes, Grupos y Labels para alinear patrones divergentes. Correcciones: (1) Botón 'Eliminar' en diálogos de borrado sin conteo, consistente con ImpactPreviewDialog. (2) Barra bulk unificada: mismo padding (px-5), mismo X button (white/40), mismo placeholder ('Seleccionar campo'), mismo selector siempre visible con disabled, sin icono en botón Aplicar (DD#182). (3) Botón Duplicar en la barra bulk de Agentes. (4) Duplicado bulk en Agentes pasa por ImpactPreviewDialog como en Grupos. (5) Footer de tabla (conteo + 'Quitar ordenación') en Agentes. (6) Panel compact del LabelFilterButton: border-gray-300. (7) Botón compact del LabelFilterButton: tokens de color alineados con la variante action-bar.",
    status: "reviewed",
    date: "2026-02-26",
    discovery:
      "7 inconsistencias entre módulos: botones con/sin conteo, padding y estilos divergentes en la barra bulk, Duplicar ausente en Agentes, flujo de duplicado sin confirmación, footer vacío, borde incorrecto en dropdown compact, tokens de color desalineados.",
  },
  {
    id: 231,
    category: "Listas",
    title: "Cabecera 'Agentes' sin prefijo 'N'",
    description:
      "El prefijo 'N' es jerga técnica innecesaria cuando la celda ya muestra un número. Consistente con DD#162.",
    status: "reviewed",
    date: "2026-02-26",
    discovery:
      "La cabecera 'N Agentes' repite el mismo problema que DD#162 identificó en 'N Grupos': el prefijo 'N' es redundante cuando la celda ya muestra un número.",
  },
  {
    id: 232,
    category: "Interacción",
    title: "Botón Eliminar en bulk bar: estilo unificado entre módulos",
    description:
      "Ambas barras bulk usan el mismo estilo para el botón Eliminar: border-red-400/30, text-red-300, hover:bg-red-500/10, con icono Trash2.",
    status: "reviewed",
    date: "2026-02-26",
    discovery:
      "Grupos usa border-red-400/40 text-red-300 y Agentes usa border-red-400 text-red-400 — dos tonos de rojo diferentes para la misma acción.",
  },
  {
    id: 233,
    category: "Listas",
    title: "Filtro de labels con ml-auto a la derecha del action bar + icono Tag",
    description:
      "El filtro de labels se separa del trío izquierdo (Columnas, Búsqueda, Exportar) empujándolo a la derecha con ml-auto. Usa icono Tag en vez de Filter y variante action-bar con placement='right'. El dropdown se alinea a la derecha. El action bar queda visualmente dividido: izquierda = controles de infraestructura de tabla, derecha = filtrado semántico por labels. LabelFilterButton también gana variante 'header' (reservada para uso futuro).",
    discovery:
      "El botón de filtro de labels con icono Filter rompe la simetría visual del trío del action bar (Columnas, Búsqueda, Exportar). Cambiarlo a icono Tag evidencia aún más que es un control de naturaleza diferente a los otros tres. Colocarlo en el header de columna Nombre (opción B) resulta invisible — el usuario no lo encuentra.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 234,
    category: "Interacción",
    title: "forceClose en LabelFilterButton detecta flanco ascendente, no estado estático",
    description:
      "El prop forceClose del LabelFilterButton ahora solo cierra el panel cuando transiciona de false→true (flanco ascendente), en vez de bloquear la apertura mientras sea true. Se usa un ref para rastrear el valor anterior. Corrige el bug donde el filtro de labels en CreateGroupPage (buscar agente por nombre) se cerraba inmediatamente al abrirlo porque forceClose={!agentDropdownOpen} era permanentemente true cuando el dropdown de agentes estaba cerrado.",
    discovery:
      "El filtro de labels junto al buscador de agentes en Grupos desaparece al hacer clic. forceClose={!agentDropdownOpen} es true de forma permanente cuando el dropdown está cerrado, y el useEffect lo cierra en cada render.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 235,
    category: "Estructura",
    title: "max-w-[1400px] en las tres páginas de lista para resoluciones amplias",
    description:
      "Los contenedores internos de GroupsListPage, AgentsListPage y LabelsPage limitan su ancho a 1400px. En pantallas anchas las tablas dejan de estirarse al 100% del viewport. Las páginas de detalle ya tenían max-w-[1100px]. El fondo blanco sigue ocupando todo el ancho; solo el contenido (título, action bar, tabla) queda acotado.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 236,
    category: "Estructura",
    title: "mx-auto centra el contenido en pantallas anchas (4K)",
    description:
      "Se añade mx-auto junto a max-w-[1400px] en las tres listas. En CSS, margin: 0 auto reparte el espacio sobrante del contenedor equitativamente entre izquierda y derecha, centrando el bloque cuando el viewport es más ancho que el max-width.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 237,
    category: "Interacción",
    title: "Escape en buscadores: primero limpia texto, luego pierde foco",
    description:
      "Los inputs de búsqueda en las tres páginas de lista (Grupos, Agentes, Labels) ahora responden a Escape: si hay texto escrito lo limpia; si ya está vacío, hace blur() para salir del input. Patrón estándar de atajos de teclado para búsqueda incremental.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 238,
    category: "Interacción",
    title: "Undos estandarizados: 8000ms en todos, undo en cambios de presencia",
    description:
      "Todos los toasts con Deshacer usan duration: 8000ms (antes los label toggles individuales usaban 5000ms). El cambio de presencia de agentes ahora muestra toast con Deshacer que restaura el estado anterior. Inventario completo de undos: bulk edit campos (Grupos/Agentes), label toggle individual (context menu y popover inline), bulk label assign, y ahora presencia. Las operaciones destructivas (eliminar) siguen sin undo por diseño explícito.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 239,
    category: "Estructura",
    title: "Panel de decisiones arranca en vista cronológica por defecto",
    description:
      "El DesignDecisionsPanel cambia su estado inicial de groupByCategory=true a false. Al abrir el panel se ven las decisiones más recientes primero (DD#238, 237, 236…), como un changelog. La vista agrupada por categoría sigue disponible con el botón toggle para auditar consistencia por área temática. Criterio: cronológico para trabajar, categorizado para auditar.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 240,
    category: "Estructura",
    title: "Permisos de agente: sección única con llamadas anidadas",
    description:
      "Las dos SectionCards 'Permisos del agente' y 'Permisos de llamadas' se fusionan en una sola 'Permisos'. Los toggles generales (gestión de dispositivos, activación por grupo) van arriba, seguidos de un bloque 'Llamadas' con border-top que contiene la matriz destinos y grabación. El bloque de llamadas mantiene su lógica condicional (opacity-40 + pointer-events-none si canal teléfono inactivo).",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 241,
    category: "UI",
    title: "Permisos: wording corto + tooltips descriptivos",
    description:
      "Los labels de los toggles de permisos pasan de frases largas ('Permitir agente gestionarse dispositivos') a etiquetas cortas ('Gestión de dispositivos', 'Activación por grupo'). El detalle se mueve a los tooltips, que explican el efecto concreto. Reduce carga cognitiva sin perder información.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 242,
    category: "Estructura",
    title: "Dispositivos externos migra a Configuración avanzada",
    description:
      "El toggle 'Dispositivos externos' (antes 'Permitir agente utilizar dispositivos externos') se mueve de la sección Permisos a Configuración avanzada. Es una opción de hardware poco frecuente que no pertenece al flujo principal de permisos. Se mantiene su tooltip explicativo.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 243,
    category: "Estructura",
    title: "Estrategia Chat en grupos",
    description:
      "La SectionCard 'Estrategia' de grupos ahora muestra dos selects condicionales: 'Estrategia — Teléfono' (si channels.phone) y 'Estrategia — Chat' (si channels.chat) con opciones Round robin / Menos ocupado / Aleatorio. Si ningún canal con estrategia está activo, se muestra un placeholder dashed. Ambos selects conviven en un space-y-5 sin layout shift. Se añade chatStrategy al modelo Group y a groupsData (4 grupos con chat ya tienen valor).",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 244,
    category: "UI",
    title: "min-h-[28px] en todos los toggles de permisos para evitar layout shift",
    description:
      "Cada fila toggle dentro de la sección Permisos (y los nuevos en Configuración avanzada) usa min-h-[28px] para reservar espacio vertical y evitar saltos al activar/desactivar. Consistente con DD#227 que ya aplicaba esta técnica en chips.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 245,
    category: "Estructura",
    title: "Labels y Plantillas migran a Configuración avanzada del agente",
    description:
      "La SectionCard 'Labels' y el collapsible 'Plantillas' dejan de ser secciones independientes en la columna derecha del detalle de agente y pasan a vivir como subsecciones dentro de Configuración avanzada, separadas por border-t. Labels muestra un header con icono Tag + título uppercase; Plantillas con icono FileStack + contador de asignadas. Reduce el scroll de la columna derecha y agrupa funcionalidad secundaria bajo un solo acordeón.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 246,
    category: "Estructura",
    title: "Duplicación masiva oculta — código preservado para reactivación",
    description:
      "El botón 'Duplicar' en la barra bulk y la opción 'Duplicar N seleccionados' en el BulkContextMenu se ocultan en ambos módulos (Agentes y Grupos). El duplicado individual desde el menú contextual (clic derecho o ⋯) sigue activo. El código de la lógica bulk duplicate (ImpactPreviewDialog con operation 'duplicate', handleDuplicate, confirmDuplicate) permanece intacto en los stores y componentes para poder reactivarlo pasando onDuplicate al BulkContextMenu.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 247,
    category: "Estructura",
    title: "Diálogos de eliminación consolidados en DeleteEntityDialog",
    description:
      "DeleteAgentDialog y DeleteDialog (grupos) eran ~95% idénticos. Se unifican en un solo componente compartido DeleteEntityDialog parametrizado por entitySingular, entityPlural, singleDetailMessage y bulkFooterMessage. Se elimina duplicación de ~200 líneas. Los archivos originales se conservan como referencia pero ya no se importan.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 248,
    category: "Accesibilidad",
    title: "Roles ARIA en menús contextuales y diálogos destructivos",
    description:
      "ContextMenu y BulkContextMenu ahora usan role='menu' y role='menuitem'. DiscardDialog, ImpactPreviewDialog y DeleteEntityDialog usan role='alertdialog' (antes 'dialog'). El user menu del TopBar añade role='menu'/role='menuitem' y onKeyDown para Escape.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 249,
    category: "UI",
    title: "Breadcrumbs sin color de acento — text-gray-500 en vez de text-blue-600",
    description:
      "Los breadcrumbs clickables en TopBar usaban text-blue-600, violando el criterio de diseño 'sin colores de acento, todo en grises'. Corregido a text-gray-500 con hover:text-gray-700 hover:underline, coherente con el sistema visual low-fi.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 250,
    category: "UI",
    title: "Sidebar: border-l-2 siempre presente con border-transparent para evitar CLS",
    description:
      "El indicador de ítem activo en el sidebar usaba border-l-2 solo en estado activo, causando un desplazamiento horizontal de 2px al navegar. Ahora todos los ítems tienen border-l-2 con border-transparent por defecto, y el ítem activo lo pinta con border-white. Cero layout shift.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 251,
    category: "UI",
    title: "SortableHeader: color inactivo unificado a text-gray-400",
    description:
      "Las cabeceras de columna sortable inactivas usaban text-gray-500, mientras que las cabeceras no sortables usaban text-gray-400. Unificado a text-gray-400 para consistencia visual en tablas.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 252,
    category: "Limpieza",
    title: "Código muerto eliminado: templatesOpen, channelIcons, Copy imports",
    description:
      "Se eliminaron: (1) estado templatesOpen/setTemplatesOpen en CreateAgentPage, obsoleto tras mover Plantillas a Configuración avanzada; (2) export channelIcons en TableComponents, nunca importado; (3) import Copy de lucide-react en AgentsListPage y GroupsListPage tras ocultar el botón Duplicar en la bulk bar.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 253,
    category: "Estructura",
    title: "Diálogo de borrado en CreateAgentPage unificado con DeleteEntityDialog",
    description:
      "La página de edición de agente tenía un diálogo de borrado inline simplificado (sin confirmación copy-paste, icono Trash2 en vez de AlertTriangle, sin role='dialog' ni Escape). Se reemplaza por DeleteEntityDialog que aporta consistencia: misma confirmación copy-paste, mismo icono AlertTriangle, misma accesibilidad.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 254,
    category: "Limpieza",
    title: "Archivos muertos eliminados: DeleteAgentDialog.tsx y DeleteDialog.tsx",
    description:
      "Tras la migración completa a DeleteEntityDialog compartido (DD#247-253), los archivos originales DeleteAgentDialog.tsx (en agents/) y DeleteDialog.tsx (en groups/) quedaron sin ningún import. Eliminados como código muerto confirmado.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 255,
    category: "Auditoría UX",
    title: "AgentGroupTags en CreateGroupPage usa bg-gray-100/text-gray-500 en vez de bg-blue-50/text-blue-600",
    description:
      "Los chips que muestran los otros grupos a los que pertenece un agente (en el dropdown de asignación) usaban colores azules, violando el criterio low-fi de 'sin colores de acento'. Corregido a grises neutros coherentes con el sistema.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 256,
    category: "Auditoría UX",
    title: "Enlaces de nombre en tablas de Grupos y Agentes corregidos de text-blue-600 a text-gray-700",
    description:
      "Los nombres clickables en las tablas principales de GroupsListPage y AgentsListPage usaban text-blue-600 con hover:text-blue-800. Corregido a text-gray-700 con hover:text-gray-900 hover:underline, manteniendo la afordancia de clic sin romper la paleta low-fi.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 257,
    category: "Auditoría UX",
    title: "Fila de duplicación inline sin colores de acento azul",
    description:
      "Las filas de duplicación inline en GroupsListPage y AgentsListPage usaban bg-blue-50 (fondo), border-blue-300/500 (input) y text-blue-500 (hint). Corregido a bg-gray-50, border-gray-400/600 y text-gray-400 respectivamente.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 258,
    category: "Auditoría UX",
    title: "Botones 'Ver todos / Mostrar menos' en agentes asignados de grupo cambiados a text-gray-500",
    description:
      "Los botones de expansión/colapso de la lista de agentes asignados en CreateGroupPage usaban text-blue-600. Corregido a text-gray-500 para coherencia con el sistema de diseño low-fi sin acentos.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 259,
    category: "Estructura",
    title: "Recursos asignados (Labels + Plantillas) en Configuración avanzada de Grupos",
    description:
      "Se añaden secciones de Labels y Plantillas dentro de la Configuración avanzada de CreateGroupPage, replicando el patrón de CreateAgentPage (DD#245). Labels: buscador con quick-create inline, chips removibles, dropdown con keyboard nav. Plantillas: tabla con checkbox múltiple, búsqueda, iconos por tipo (chat/email). Ambas secciones separadas por border-t con headers uppercase + icono (Tag, FileStack).",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 260,
    category: "Datos",
    title: "Modelo Group extendido con labels?: number[] y templates?: number[]",
    description:
      "Se añaden campos opcionales labels y templates a la interfaz Group en groupsData.ts. Los IDs referencian las mismas entidades que en agentes (labels del labelsStore, templates de availableTemplates). Se incluyen datos demo en 3 de los 5 grupos iniciales. Version del store bumpeada a 4 para forzar re-seed.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 261,
    category: "Arquitectura",
    title: "Discovery note: posible extracción de createEntityStore factory",
    description:
      "Los tres stores (useGroupsStore, useAgentsStore, useLabelsStore) comparten un patrón idéntico de pub/sub + localStorage con versionado, snapshot caching, BroadcastChannel y useCallback. Se observa oportunidad de extracción a un factory genérico createEntityStore<T> que parametrice key, version y defaultData. Riesgo bajo — los stores funcionan correctamente, la extracción es una mejora de mantenibilidad, no un fix.",
    status: "pending" as const,
    date: "2026-02-26",
  },
  {
    id: 262,
    category: "Visualización",
    title: "Discovery note: variación menor en tamaños de empty states entre contextos",
    description:
      "Los empty states de las tres listas (Grupos, Agentes, Labels) presentan variaciones menores en el padding vertical (py-24, py-20) y tamaño de icono (32, 28). Funcionalmente correcto, pero la estandarización mejoraría la coherencia visual. Hallazgo de bajo riesgo sin impacto funcional.",
    status: "pending" as const,
    date: "2026-02-26",
  },
  {
    id: 263,
    category: "Formularios",
    title: "Descuelgue condicional por canal activo con opacity (sin layout shift)",
    description:
      "En CreateAgentPage, los selectores de descuelgue (Llamada y Chat) se muestran/ocultan condicionalmente según los canales activos del agente. Se usa opacity-0 + pointer-events-none + transition-opacity duration-150 para evitar layout shift, manteniendo siempre el grid-cols-2 reservado.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 264,
    category: "Formularios",
    title: "Chats simultáneos condicional con opacity (sin layout shift)",
    description:
      "El campo 'Chats simultáneos' se muestra/oculta con opacity según el canal chat activo, usando min-h-[52px] para reservar el espacio y evitar layout shift. Comparte fila con 'Orden aleatorio' en grid-cols-2.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 265,
    category: "Estructura",
    title: "Headers iconizados en Configuración avanzada de Agentes (>3 campos)",
    description:
      "Los campos sueltos de Configuración avanzada se agrupan bajo 4 headers iconizados: Comportamiento (SlidersHorizontal), Integración (Plug), Regional (Globe) y Sesión (LogIn). Cada header usa el mismo patrón visual que Labels/Plantillas: border-t + icono 13px text-gray-400 + uppercase 12px tracking-wider. Seguridad (edit-only) se integra como sub-sección de Sesión con border-t border-gray-100.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 266,
    category: "Formularios",
    title: "Horizontalización de campos en Configuración avanzada de Agentes",
    description:
      "Para compactar la altura de las SectionCards: Idioma + Horario se colocan en grid-cols-2 (ambos selects), y Chats simultáneos + Orden aleatorio también en grid-cols-2 (select estrecho + toggle). Se mantiene armonía visual al agrupar campos de similar estructura.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 267,
    category: "Estructura",
    title: "Regla global: prohibición absoluta de layout shift",
    description:
      "Decisión de proyecto permanente: nunca se debe introducir layout shift en ningún módulo. Los campos condicionales deben usar opacity + pointer-events-none + min-h reservados, nunca montaje/desmontaje condicional que altere el flujo del layout.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 268,
    category: "Estructura",
    title: "Progressive disclosure: Labels y Plantillas en acordeón dentro de Configuración avanzada",
    description:
      "Las secciones de Labels y Plantillas dentro de Configuración avanzada de Agentes (y Grupos) pasan a ser acordeones colapsados por defecto. El header clickable muestra chevron + icono + título uppercase + badge de conteo cuando está cerrado. Reduce la sobrecarga cognitiva en formularios largos manteniendo acceso directo al contenido bajo demanda.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 269,
    category: "Estructura",
    title: "Plantillas: sistema de tabs Chat/Email en vez de columna Tipo",
    description:
      "En la sección de Plantillas (tanto en asignación dentro de Agentes como en el repositorio) se elimina la columna 'Tipo' y se reemplaza por un sistema de tabs (Chat/Email) con contadores. Los checkboxes de fila pasan a ser visibles solo en hover (y cuando están activos), reduciendo ruido visual. La fila entera es clickable para toggle. El tab activo filtra las plantillas mostradas.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 270,
    category: "Estructura",
    title: "Módulo repositorio de Plantillas — TemplatesPage",
    description:
      "Nuevo módulo completo en /admin/plantillas con el mismo sistema de tabs Chat/Email. Patrón idéntico a LabelsPage: TopBar con breadcrumbs, búsqueda con Escape, tabla con checkboxes en hover, menú ⋯ por fila, context menu con clic derecho, bulk bar fija, diálogo de confirmación de borrado con role=alertdialog y Escape. Formulario inline (dropdown) con título, selector de canal, textarea de contenido y variables disponibles. Store localStorage con versioning.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 271,
    category: "Datos",
    title: "Fuente única de verdad: useTemplatesStore reemplaza availableTemplates estático",
    description:
      "Los formularios de Agentes y Grupos ahora consumen plantillas desde useTemplatesStore en lugar del array estático availableTemplates de agentsData.ts (eliminado). Así las plantillas creadas/editadas/borradas en el repositorio se reflejan inmediatamente en los formularios de asignación. El campo preview pasa a llamarse body para coherencia con el modelo Template del store.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 272,
    category: "Naming",
    title: "Renombrado: Presencia → Estado; antiguo Estado → Activación",
    description:
      "En contact center, 'Estado' es el término estándar para la disponibilidad operativa del agente (Disponible, Comida, Baño, etc.). La columna antes llamada 'Presencia' pasa a llamarse 'Estado' en tabla, CSV, selector de columnas y edición masiva. El antiguo 'Estado' (Activo/Inactivo) pasa a llamarse 'Activación' en la edición masiva y en el CSV para evitar colisión. Internamente los keys (presence, presenceStatus, status) no cambian para evitar migraciones de localStorage.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 273,
    category: "Interacción",
    title: "Edición masiva de Estado (presencia) en agentes",
    description:
      "Se añade 'Estado' como campo disponible en la barra de edición masiva de agentes. Las opciones son: Disponible, No disponible, Baño, Comida, Formación. El store mapea los labels en español a los valores internos de PresenceStatus. El impact preview muestra qué agentes serán afectados antes de confirmar.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 274,
    category: "Datos",
    title: "Exportación XLSX formateada en vez de CSV plano",
    description:
      "El export de agentes pasa de CSV a XLSX (SheetJS). Headers en negrita con fondo gris claro, anchos de columna auto-calculados. Se elimina la columna Estado (presencia live, dato inútil una vez descargado). Se separan Servicios activos e inactivos en dos columnas. Se añaden Labels e Idiomas. El archivo se nombra agentes_YYYY-MM-DD.xlsx.",
    status: "reviewed" as const,
    date: "2026-02-26",
  },
  {
    id: 275,
    category: "Patch UX",
    title: "Patch G/I — ID primera columna, Grabación visible, bulk edit ampliado",
    description:
      "Sesión de usabilidad con Postventa (Tere, Vivi, Gema, Juanjo). ID pasa a primera columna visible por defecto en Agentes y Grupos (font-mono, text-gray-400, centrado). Grabación visible por defecto en Agentes. Se añaden Grabación (Activada/Desactivada) y Grupo saliente por defecto (dinámico, solo grupos compartidos por todos los agentes seleccionados) a bulk edit. Las claves de localStorage se versionan (v4/v3) para forzar reset de columnas.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 276,
    category: "Patch UX",
    title: "Patch H — Extensión como combobox filtrable",
    description:
      "El select nativo de extensión en CreateAgentPage se reemplaza por un combobox con input numérico. Solo muestra extensiones libres (las ocupadas se ocultan). On focus muestra las primeras 20, on type filtra por prefijo. Header con conteo, footer con 'Mostrando N de M'. Validación en blur: si no coincide con extensión libre, limpia el valor.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 277,
    category: "Patch UX",
    title: "Patch J — Tooltip y label de audio GDPR corregidos",
    description:
      "El label 'Audio saliente' se renombra a 'Audio GDPR' y el tooltip pasa de 'Audio que escucha el agente al iniciar una llamada saliente' a 'Audio legal (GDPR) que el agente puede reproducir al cliente durante la conversación'. Elimina la ambigüedad con la locución previa (VUI Designer).",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 278,
    category: "Datos",
    title: "Exportación XLSX extendida a Grupos y Labels",
    description:
      "El mismo patrón de export XLSX (SheetJS) aplicado a Agentes (DD#274) se extiende a Grupos y Labels. Headers en negrita con fondo gris, anchos auto-calculados. Grupos exporta: ID, Nombre, Teléfono, Nº Agentes, Prioridad, Estrategia, Canales, Tipificación, Agentes asignados. Labels exporta: Nombre, Color, Descripción, Agentes asignados (conteo). Ambos generan archivos XLSX con fecha en el nombre.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 279,
    category: "Formularios",
    title: "Grabación reubicada a sección Identificación",
    description:
      "El toggle de Grabación se mueve de la sección 'Permisos' a la sección 'Identificación' en CreateAgentPage (después de Canales, con separador border-t). La grabación es un atributo operativo del agente, no un permiso. La reubicación le da más protagonismo y reduce el riesgo de que pase desapercibida.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 280,
    category: "Patch UX",
    title: "Audio GDPR renombrado a Audio informativo",
    description:
      "El label 'Audio GDPR' se renombra a 'Audio informativo' en CreateGroupPage. 'GDPR' es jerga legal que no todos los supervisores reconocen. 'Audio informativo' es descriptivo y neutro. El tooltip ahora incluye ejemplos de uso: aviso de grabación (GDPR), condiciones legales, información contractual.",
    status: "reviewed" as const,
    discovery:
      "Evolución de DD#277 (Patch J). El nombre pasó por tres iteraciones: 'Audio saliente' → 'Audio GDPR' → 'Audio informativo'. Cada cambio resolvió una ambigüedad del anterior.",
    date: "2026-03-02",
  },
  {
    id: 281,
    category: "Patch UX",
    title: "Estrategias de chat renombradas — UX writing en español",
    description:
      "Las 3 estrategias de chat pasan de nombres técnicos a descriptivos: 'Round robin' → 'Rotativa (por turnos)', 'Menos ocupado' → 'Menos chats activos', 'Aleatorio' → 'Aleatoria' (concordancia femenina con 'estrategia'). Se actualiza tooltip, default, opciones, datos semilla y se bumpa versión del store.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 282,
    category: "Patch UX",
    title: "Patch K — Estrategias especiales unificadas en dropdown principal",
    description:
      "Las estrategias 'Agente exclusivo' y 'Niveles', antes enterradas en Configuración avanzada como radio buttons separados, se mueven al dropdown principal de Estrategia — Teléfono usando <optgroup> (Estándar / Avanzadas). Se elimina la sección 'Estrategias especiales' del acordeón avanzado, el state specialStrategy y el warning amarillo VUI. La UI condicional aparece inline debajo del dropdown: callout azul informativo para Exclusivo, panel de niveles completo (transfer list de dos paneles + subestrategia) para Niveles.",
    status: "reviewed" as const,
    discovery:
      "Sesión de usabilidad: los usuarios buscaban 'Niveles' en el dropdown de estrategia y no lo encontraban. La separación en Config avanzada creaba un segundo path para el mismo concepto. La unificación elimina esa fricción sin añadir complejidad visual — solo se muestra UI extra cuando la estrategia seleccionada lo requiere.",
    date: "2026-03-02",
  },
  {
    id: 283,
    category: "Formularios",
    title: "Niveles — configuración con transfer list de dos paneles",
    description:
      "Cuando strategy = 'Niveles', aparece un layout de dos paneles (40%/50% + flechas centrales) debajo del dropdown. Panel izquierdo: agentes sin nivel asignado (del pool de agentes asignados al grupo). Panel derecho: niveles colapsables con agentes indentados, botón [+ Nivel] (máx 5), botón [—] por nivel (mín 1). Flechas centrales: ≫/›/‹/≪ para mover agentes. Debajo: dropdown de Subestrategia (Balanceada, Menos llamadas atendidas, Más tiempo inactivo). Warning inline si quedan agentes sin nivel.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 284,
    category: "Patch UX",
    title: "Ring All añadida como tercera estrategia avanzada",
    description:
      "Ring All se añade como opción en el optgroup 'Avanzadas' del dropdown de estrategia. Al seleccionarla muestra: (1) selector 'Nº agentes simultáneos' (2-10, default 2) y (2) warning ámbar permanente sobre costes adicionales por llamadas simultáneas. El warning usa el patrón visual existente (bg-amber-50, AlertTriangle) pero con propósito financiero, no técnico.",
    status: "reviewed" as const,
    discovery:
      "El spec original excluía Ring All con una anotación informativa. Se revierte la decisión: el warning de coste cumple la misma función protectora sin bloquear a clientes que necesitan la funcionalidad.",
    date: "2026-03-02",
  },
  {
    id: 285,
    category: "Interacción",
    title: "Colisión de estrategias resuelta — un solo punto de entrada",
    description:
      "La colisión entre el dropdown principal de estrategia y la sección 'Estrategias especiales' en Config avanzada queda resuelta: un solo dropdown con <optgroup> es el único punto de entrada. Se eliminan: radio buttons (Ninguna/Exclusivo/Niveles), state specialStrategy, warning amarillo VUI genérico. Se reutilizan componentes existentes sin introducir patrones nuevos: callout azul (HTTPS pattern), transfer list (agent selector pattern), ghost button (repositorios pattern).",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 286,
    category: "UI",
    title: "Tooltips más anchos y equilibrados",
    description:
      "El ancho por defecto del Tooltip sube de 224px a 300px. El padding pasa de px-2.5/py-1.5 a px-3/py-2, el line-height a 1.55 y la flecha a 5px. Se añade reposicionamiento edge-aware: si el tooltip se sale del viewport, se desplaza horizontalmente manteniendo la flecha apuntando al trigger. TooltipIcon (formularios) hereda el ancho 300px. IconTooltip (botones) sube de 180 a 200px. Los popovers de agentes en listas suben de 224 a 280px. Resultado: tooltips de texto largo se leen horizontalmente en vez de crecer en vertical.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 287,
    category: "Interacción",
    title: "Drag & drop entre niveles + validación al guardar",
    description:
      "Los agentes en la configuración de Niveles son arrastrables (react-dnd HTML5 backend). Se puede arrastrar un agente desde 'Sin nivel' a cualquier nivel, entre niveles, o de vuelta al panel izquierdo. El nivel de destino muestra feedback visual (bg-blue-50/50 + línea azul). Los niveles vacíos muestran 'Sin agentes — arrastra aquí'. Al guardar, si quedan agentes sin nivel asignado, se auto-asignan al último nivel con toast.info informativo (no bloqueante). Cursor cambia a grab/grabbing para comunicar la interacción.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 288,
    category: "Listas",
    title: "Columna Servicios en tabla de Grupos",
    description:
      "Se añade la columna 'Servicios' a la tabla de grupos, mostrando el número de servicios VUI asociados con un tooltip popover que lista los nombres y un footer 'Configurado desde el VUI'. Los grupos sin servicios muestran '—'. La columna es sortable por cantidad y buscable por nombre de servicio. Se incluye en la exportación XLSX y en el selector de columnas (clave 'services', visible por defecto). Los servicios son de solo lectura — se configuran exclusivamente desde el VUI (IVR). Store version bump a v8 para re-seed con datos demo de servicios.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 289,
    category: "Formularios",
    title: "Agendas asignables a agentes — multi-select con accordion",
    description:
      "Se añade el campo 'schedules: number[]' al modelo de Agent, permitiendo asignar múltiples agendas a cada agente. En el formulario de creación/edición, se reemplaza el antiguo select simple de 'Horario' (sección Regional) por un accordion 'Agendas' dentro de Configuración avanzada, entre Labels y Plantillas. Usa un listado de checkboxes con reveal-on-hover (patrón consistente con Plantillas), chips removibles debajo, y enlace a Repositorios > Agendas. La sección Regional conserva solo el selector de idioma. En la tabla de listado se añade la columna 'Agendas' (defaultVisible: false, sortable por cantidad, buscable por nombre de agenda) con tooltip popover que lista las agendas asignadas. Se incluye en la exportación XLSX. Store version bump a v10 con datos demo de agendas en 8 agentes.",
    status: "reviewed" as const,
    date: "2026-03-02",
  },
  {
    id: 290,
    category: "Listas",
    title: "Filtro rápido por agenda en listado de agentes",
    description:
      "Se añade un ScheduleFilterButton junto al LabelFilterButton en la barra de acciones de AgentsListPage. Icono Calendar, 34×34px, badge con conteo de filtros activos, tooltip contextual, dropdown con checkboxes por agenda + 'Quitar filtros'. Lógica OR (como labels): un agente pasa si tiene al menos una de las agendas seleccionadas. Se combina con búsqueda y filtro de labels. El empty state y el botón 'Quitar filtros' se actualizan para contemplar ambos tipos de filtro. URL params sincronizados: ?label=1,2&schedule=3,4.",
    status: "reviewed" as const,
    discovery:
      "El listado de agentes permitía filtrar por labels pero no por agendas, obligando a buscar por texto. Un botón dedicado sigue el mismo patrón visual (icono + badge + dropdown checkboxes) y permite filtrado cruzado labels × agendas.",
    date: "2026-03-03",
  },
  {
    id: 291,
    category: "Formularios",
    title: "Multi-select de agendas en formulario de grupos (Recursos asignados)",
    description:
      "El placeholder <select> de Agendas en la sección 'Recursos asignados' de CreateGroupPage se reemplaza por un multi-select completo: listado de checkboxes con reveal-on-hover, chips removibles, buscador condicional (aparece si hay más de 4 agendas). Patrón idéntico al accordion de agendas en CreateAgentPage. Se añade 'schedules?: number[]' al modelo Group, datos demo en 6 grupos, y el campo se persiste en el store (version bump v9).",
    status: "reviewed" as const,
    discovery:
      "La sección Recursos asignados tenía un placeholder sin funcionalidad. Se reutiliza el patrón ya probado del formulario de agentes (DD#289) para mantener consistencia cross-module.",
    date: "2026-03-03",
  },
  {
    id: 292,
    category: "Formularios",
    title: "Buscador dentro del accordion de agendas (agentes y grupos)",
    description:
      "Cuando availableSchedules.length > 4, aparece un input de búsqueda (Search icon, 12px, placeholder 'Buscar agenda...') encima de la lista de checkboxes. Filtra por nombre con coincidencia parcial case-insensitive. Si no hay resultados muestra 'Sin resultados' centrado. El buscador usa el mismo patrón visual que templateSearch en CreateGroupPage. Se aplica tanto en CreateAgentPage (accordion Agendas) como en CreateGroupPage (sección Recursos asignados).",
    status: "reviewed" as const,
    discovery:
      "Con 6 agendas la lista es manejable, pero el modelo soporta n agendas desde Repositorios. El umbral de 4 evita overhead visual para listas cortas y prepara la UI para crecimiento futuro.",
    date: "2026-03-03",
  },
  {
    id: 293,
    category: "Interacción",
    title: "Global Ctrl+Z undo stack con integración Sonner",
    description:
      "Módulo singleton undoStack.ts mantiene una pila de hasta 20 acciones deshacibles con auto-expiración a 9s. Cada toast con botón 'Deshacer' también registra su callback y toastId en la pila via pushUndo(). El listener global en AppLayout captura Ctrl+Z (o Cmd+Z en Mac), ejecuta popUndo(), descarta el toast asociado con toast.dismiss(toastId) y muestra un toast neutro 'Cambio revertido'. Se ignora si el foco está en INPUT, TEXTAREA o contentEditable para no interferir con undo nativo del navegador. Cuando el usuario hace clic manual en 'Deshacer' dentro del toast, se llama removeUndo(toastId) para limpiar la pila y evitar doble-undo.",
    status: "reviewed" as const,
    discovery:
      "Sin este sistema, Ctrl+Z no hacía nada fuera de inputs. Los supervisores usan atajos de teclado constantemente — tener undo global es crítico para confianza en operaciones destructivas.",
    date: "2026-03-03",
  },
  {
    id: 294,
    category: "Listas",
    title: "Duplicar como borrador: isDraft + indicador visual amber sin layout shift",
    description:
      "Al duplicar un agente o grupo, la copia se crea con isDraft: true y status 'inactive' (agentes). En la tabla, las filas borrador muestran border-l-2 border-l-amber-400 + bg-amber-50/40 y un badge 'BORRADOR' junto al nombre (10px, uppercase, border amber-300). Todas las filas llevan border-l-2 border-l-transparent para reservar el espacio y evitar layout shift (DD#267). El toast post-duplicado dice 'Borrador creado (inactivo)' con acción 'Deshacer' que elimina la copia vía deleteAgent/deleteGroup y se registra en el undo stack. Al abrir el formulario de edición de un borrador, aparece un banner amber bajo el TopBar explicando el estado. Al guardar (save), isDraft se limpia a undefined, oficializando la entidad. El trigger de oficialización es guardar desde edición — no existe botón 'Activar' separado.",
    status: "reviewed" as const,
    discovery:
      "El patrón borrador evita que duplicados accidentales entren en producción sin revisión. El amber es la única excepción cromática al sistema grey-only, justificada porque señala un estado transitorio que requiere acción del usuario.",
    date: "2026-03-03",
  },
  {
    id: 295,
    category: "Listas",
    title: "Borradores siempre arriba + icono-only badge + oficialización activa status",
    description:
      "Los borradores (isDraft: true) flotan siempre a la primera posición de la tabla, independientemente del ordenamiento activo, porque requieren atención inmediata del supervisor. El badge textual 'BORRADOR' se reemplaza por un icono FilePen amber de 13px con tooltip 'Borrador — pendiente de revisión', más compacto y consistente con otros iconos indicadores (ej. tipificación). El banner del formulario de edición usa el mismo icono y un copy profesional: 'Esta entidad es un borrador generado por duplicación. Al guardar se activará automáticamente y pasará a estar operativa.' Al guardar un borrador, además de limpiar isDraft se establece status: 'active' (en agentes) y el toast confirma con 'activado correctamente' en vez de 'guardado'.",
    status: "reviewed" as const,
    discovery:
      "Los supervisores necesitan ver inmediatamente qué entidades requieren revisión sin tener que buscar en la tabla. El icono-only reduce ruido visual y el cambio automático de status evita que borradores oficializados queden accidentalmente inactivos.",
    date: "2026-03-03",
  },
  {
    id: 296,
    category: "Limpieza",
    title: "Auditoría completa: exportXlsx compartido, bugs corregidos, memos optimizados",
    description:
      "Auditoría de código con las siguientes optimizaciones: (1) Se crea /shared/exportXlsx.ts que encapsula el patrón repetido de worksheet + auto-fit + styled header + writeFile + toast, reemplazando ~40 líneas duplicadas en AgentsListPage, GroupsListPage y LabelsPage. (2) Bug fix: ToggleSwitch variante 'sm' usaba translate-x-4 (igual que md) en vez de translate-x-[16px] — el knob no recorría toda la pista. (3) Bug fix: DeleteEntityDialog tenía un ternario redundante `entitySingular === 'agente' ? 'el' : 'el'` que siempre retornaba 'el'. (4) Se elimina la dependencia innecesaria `allLabels` del useMemo de `labelCounts` en BulkLabelDropdown — solo se iteran agentes seleccionados, no labels. (5) Se fusiona el sort de drafts-first con el sort principal en una sola pasada en AgentsListPage y GroupsListPage, evitando un spread+sort extra por cada render. (6) Se memorizan `selectedAgents` y `selectedGroups` con useMemo en vez de filter en cada render. (7) commonGroupNames ahora reutiliza el selectedAgents memoizado eliminando la variable local duplicada y reduciendo la cadena de dependencias. (8) Se eliminan contenedores vacíos del bulk bar ('Right: Delete' con div vacío).",
    status: "reviewed" as const,
    discovery:
      "La auditoría identificó ~160 líneas de lógica XLSX duplicada, dos bugs visuales (toggle, ternario), tres oportunidades de memo y un sort doble innecesario. Todas las correcciones son backward-compatible y no alteran el comportamiento visible.",
    date: "2026-03-03",
  },
  {
    id: 297,
    category: "Arquitectura" as const,
    title: "Modulo Usuarios + Store factory + migracion 5 stores + shared index hub + README",
    description:
      "Cambio arquitectonico: (1) createLocalStore<T> factory encapsula pub/sub + localStorage + versionado. (2) Los 5 stores (agents, groups, labels, templates, users) migrados a la factory, eliminando ~200 lineas duplicadas. (3) Modulo Usuarios completo. (4) TemplatesPage usa DeleteEntityDialog compartido. (5) /shared/index.ts como catalogo central con 9 categorias. (6) README.md para onboarding de LLMs.",
    status: "reviewed" as const,
    discovery:
      "Los 5 stores duplicaban ~50 lineas identicas cada uno. La factory las reduce a ~5 por store. El index.ts actua como hub de componentes reutilizables. El README documenta reglas, patrones y convenciones.",
    date: "2026-03-03",
  },
  {
    id: 298,
    category: "Arquitectura" as const,
    title: "BulkActionBar shared — barra negra de seleccion multiple extraida como componente reutilizable",
    description:
      "Se extrae la barra negra fija inferior (count + clear + acciones custom) que estaba repetida en AgentsListPage, GroupsListPage, UsersListPage y LabelsPage. El componente BulkActionBar recibe count, entitySingular/Plural, selectedSuffix (genero), onClear, y children para las acciones especificas de cada modulo.",
    status: "reviewed" as const,
    discovery:
      "Las 4 list pages duplicaban ~20-30 lineas identicas para el contenedor de la barra. Con children se preserva la flexibilidad: agentes tiene bulk edit + labels, grupos tiene bulk edit, y usuarios/labels solo tienen delete.",
    date: "2026-03-03",
  },
  {
    id: 299,
    category: "Arquitectura" as const,
    title: "StickyFormHeader shared — cabecera sticky con nombre editable inline extraida como componente reutilizable",
    description:
      "Se extrae la cabecera sticky de los 3 formularios Create/Edit (agentes, grupos, usuarios) como StickyFormHeader. Internaliza el estado de edicion inline del nombre (editing, draft, inputRef) y expone startEditing() via useImperativeHandle/forwardRef para que el handler de validacion pueda activar la edicion programaticamente. Acepta onDelete opcional (usuarios lo usa en el header, agentes/grupos en danger zone).",
    status: "reviewed" as const,
    discovery:
      "Los 3 formularios duplicaban ~80 lineas identicas para el header. La unica diferencia entre ellos era el callback de onNameChange (touch vs setFormTouched+setNameError). Con onNameChange como prop, cada consumidor puede ejecutar su logica especifica.",
    date: "2026-03-03",
  },
  {
    id: 300,
    category: "Interacción" as const,
    title: "Exportar siempre en la action bar, no en el header — consistencia cross-modulo",
    description:
      "Se mueve el boton Exportar de UsersListPage del header (al lado del CTA principal) a la action bar (al lado del buscador), alineandolo con el patron de Agentes, Grupos y Labels. Razon: (1) Exportar es accion secundaria/utilitaria que opera sobre los datos filtrados. (2) Agruparla con buscador y filtros es mas intuitivo. (3) Header queda limpio: titulo + CTA unico. (4) Escala mejor si se anaden mas utilitarios.",
    status: "reviewed" as const,
    discovery:
      "Usuarios tenia Exportar junto al CTA en el header. La action bar es el lugar correcto porque Exportar es contextual a los datos visibles (filtrados/buscados), no una accion de navegacion/creacion.",
    date: "2026-03-03",
  },
  {
    id: 301,
    category: "Interacción" as const,
    title: "Duplicacion inline en UsersListPage — consistencia con Agents/Groups",
    description:
      "Se reemplaza el handleDuplicate de Usuarios (que navegaba directamente al formulario de edicion) por el patron inline ya estabilizado en Agentes y Grupos: al duplicar, aparece una fila en la tabla con input editable para renombrar la copia, botones Cancelar/Confirmar, y toast con Deshacer + pushUndo. El borrador se crea sin navegar, manteniendo al usuario en la lista.",
    status: "reviewed" as const,
    discovery:
      "Agentes y Grupos ya tenian duplicacion inline con fila editable en la tabla. Usuarios navegaba directamente al formulario, lo cual rompia el flujo mental del usuario que quiere duplicar multiples entidades.",
    date: "2026-03-03",
  },
  {
    id: 302,
    category: "Navegación" as const,
    title: "Repositorios como hub page — sidebar limpio, descubrimiento por categorias",
    description:
      "Repositorios pasa de ser un item colapsable con sub-items en el sidebar a un link simple que abre una hub page (/admin/repositorios). El hub muestra los 10+ sub-modulos organizados en 4 categorias visuales (Comunicacion, Clasificacion, Automatizacion, IA) como cards con descripcion, icono y estado (activo/proximamente). El sidebar marca 'Repositorios' como activo cuando el usuario navega a cualquier sub-ruta (labels, plantillas, etc.) mediante normalizacion de path.",
    status: "reviewed" as const,
    discovery:
      "Los sub-grupos colapsables dentro del sidebar seguian ocupando demasiado espacio y creaban un arbol dificil de escanear. El hub page ofrece mejor descubrimiento (el usuario ve todo de un vistazo), descripciones contextuales, y el sidebar queda con solo 4 items bajo Administracion.",
    date: "2026-03-03",
  },
  {
    id: 303,
    category: "Interacción" as const,
    title: "Delete en danger zone (bottom), no en StickyFormHeader — consistencia cross-modulo",
    description:
      "Se mueve el boton Eliminar de CreateUserPage del StickyFormHeader (icono de papelera arriba) a una 'Zona peligrosa' al fondo del formulario, consistente con Agentes y Grupos. Razon: (1) Separacion fisica de acciones constructivas (guardar) y destructivas (eliminar) reduce mis-clicks. (2) La danger zone permite texto de advertencia contextual. (3) Convencion estandar (GitHub, AWS, Stripe). (4) El header queda reservado para acciones constructivas.",
    status: "reviewed" as const,
    discovery:
      "Usuarios tenia onDelete en el StickyFormHeader (icono de papelera junto a Cancelar/Guardar). Agentes y Grupos usaban danger zone al fondo. La prop onDelete de StickyFormHeader se mantiene como opcion para casos futuros, pero la convencion es usar danger zone.",
    date: "2026-03-03",
  },
];
