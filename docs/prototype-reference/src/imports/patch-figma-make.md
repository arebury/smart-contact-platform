# Patch Figma Make — Post-Usabilidad 26 Feb
## SmartContact Supervisor · Administración > Agentes + Grupos
### Correcciones validadas en sesión de usabilidad con equipo Postventa

**Contexto:** Sesión de pruebas con Tere, Vivi, Gema y Juanjo (Postventa). Todos los cambios están validados con feedback directo de las personas que configuran clientes diariamente.

**Instrucción:** Aplicar cada patch como modificación quirúrgica. NO reescribir páginas completas. Cada cambio incluye QUÉ existe ahora y QUÉ debe cambiar.

---

## Diagnóstico: Desviaciones detectadas vs. necesidades reales

### Tabla de Agentes (AgentsListPage)
| # | Problema | Lo que necesitan | Estado actual |
|---|----------|-----------------|---------------|
| 1 | ID oculto por defecto | ID siempre visible, PRIMERA columna | ❌ `defaultVisible: false`, renderiza después de Nombre |
| 2 | Grabación oculta por defecto | Columna visible sin tener que activarla | ❌ `defaultVisible: false` |
| 3 | Grabación no está en bulk edit | Cambiar grabación a 10 agentes a la vez | ❌ Solo Estado, Tipo, Canales en `bulkFieldOptions` |
| 4 | "Grupo saliente por defecto" no está en bulk edit | Cambiar grupo saliente masivamente | ❌ No existe en `bulkFieldOptions` |
| 5 | Extensión es un `<select>` con ocupadas visibles | Input escribible que filtra solo extensiones libres | ❌ `<select>` nativo, ocupadas con `disabled` |

### Tabla de Grupos (GroupsListPage)
| # | Problema | Lo que necesitan | Estado actual |
|---|----------|-----------------|---------------|
| 6 | ID oculto por defecto | ID siempre visible, PRIMERA columna | ❌ `defaultVisible: false`, renderiza después de Nombre |

### Formulario Crear/Editar Grupo (CreateGroupPage)
| # | Problema | Lo que necesitan | Estado actual |
|---|----------|-----------------|---------------|
| 7 | Tooltip "Audio saliente" es ambiguo | Texto claro que es audio GDPR del agente | ❌ "Audio que escucha el agente al iniciar una llamada saliente" |

---

## PATCH G · Tabla de Agentes — columnas y bulk edit

```
Update the Agents list table (AgentsListPage) with these targeted modifications.
All changes are validated by real users who configure client deployments daily.

── CHANGE 1: ID column visible by default, FIRST position ──

WHAT EXISTS NOW:
- ID column defined as: { key: "id", label: "ID", defaultVisible: false }
- When manually enabled, ID renders AFTER the Nombre column
- Users have to discover the column selector and enable it

WHAT TO CHANGE:
- Set ID to defaultVisible: true
- Move ID column to render BEFORE Nombre in the table
- Column order left to right: [Checkbox] → [ID] → [Nombre] → [Extensión] → ...
- ID cell style: text-[13px], font-mono, text-gray-400, centered, narrow (~60px)
  This is the exact same visual style currently used for ID in the Groups table.

WHY: Post-sales team confirmed ID is essential for daily support tasks.
Verbatim quote: "El ID en la primera columna. A la izquierda. Y siempre."

CONSISTENCY NOTE: Apply the same change to the Groups table (GroupsListPage).
Both tables must show ID as FIRST column, visible by default.
The ID column in Groups already uses font-mono text-gray-400 — Agents must match.

── CHANGE 2: Recording column visible by default ──

WHAT EXISTS NOW:
- Recording column defined as: { key: "recording", label: "Grabación", defaultVisible: false }
- When enabled, shows a dot icon (CircleDot) when recording=true, dash when false
- Hidden by default — users don't know it exists without checking column selector

WHAT TO CHANGE:
- Set Recording to defaultVisible: true
- Keep the existing render (CircleDot icon for true, — for false)
- No change to column position — it stays where it is in the render order

WHY: Post-sales team was emphatic. Currently they have to open each agent individually
just to check recording status. Quote: "Es súper importante para nosotras."

── CHANGE 3: Recording added to bulk edit fields ──

WHAT EXISTS NOW:
- bulkFieldOptions contains: Estado, Tipo de agente, Canales
- No way to bulk-change recording for multiple agents

WHAT TO CHANGE:
- Add { key: "recording", label: "Grabación" } to bulkFieldOptions
- bulkValueOptions for recording: ["Activada", "Desactivada"]
- In handleBulkApplyConfirmed: map "Activada" → permissions.recording = true,
  "Desactivada" → permissions.recording = false
- Impact preview (DD#199) applies: show agent name + (N grupos) as it does for other fields

CONSISTENCY NOTE: The bulk edit bar uses the same "Cambiar [campo ▾] a [valor ▾] Aplicar"
pattern from Groups. Recording is a binary toggle — same interaction as Estado.
No new UI patterns needed.

WHY: Quote from session when asked what's the #1 field for bulk edit:
"De primera grabación. A todos los que elijan. Eso es importantísimo."

── CHANGE 4: Default outbound group added to bulk edit fields ──

WHAT EXISTS NOW:
- defaultOutboundGroup exists in the agent data model
- It appears in CSV export (column "Grupo saliente")
- It's editable in the individual agent form (Grupos section)
- NOT available in bulk edit

WHAT TO CHANGE:
- Add { key: "defaultOutboundGroup", label: "Grupo saliente por defecto" } to bulkFieldOptions
- bulkValueOptions: DYNAMIC — populate with names of all available groups from groupsData
  Example values: ["ACD Demo C2CB", "Campaigns", "Online Support", "Reclamaciones", ...]
- In handleBulkApplyConfirmed: set agent.defaultOutboundGroup to selected group name
- Impact preview: show agent name + current outbound group (if any) for context

IMPORTANT CONSTRAINT: Only groups that ALL selected agents belong to should appear
as options. If 3 agents are selected and they don't share any common group,
show a disabled state with message: "Los agentes seleccionados no comparten grupos en común."
This prevents assigning an outbound group the agent isn't part of.

WHY: Second most-requested bulk field after recording.
Quote: "El hacer por defecto chicas, ¿qué os parece? Ese yo creo que sería esencial."

── NO OTHER CHANGES to AgentsListPage ──
Keep: sidebar, top bar, pagination, context menu, labels, presence dropdown,
single-select action row, delete dialog, toast notifications, column selector,
search, export, empty state. All validated and working.
```

---

## PATCH H · Formulario Agentes — extensión como combobox

```
Update the extension input in CreateAgentPage with this targeted modification.

── CHANGE 5: Extension input — from <select> to searchable combobox ──

WHAT EXISTS NOW:
- Native <select> dropdown listing ALL registered extensions
- Occupied extensions shown as disabled options with "(Asignada a [nombre])"
- User must scroll through ALL extensions (including occupied) to find a free one
- Cannot type to filter — only scroll and click

Example of current behavior with 20 extensions:
  100 (empty)
  101 (empty)
  102 (Asignada a Miguel Palacios) ← disabled, visible, adds noise
  103 (Asignada a Agente José) ← disabled, visible
  104 (empty)
  ...

Problem at scale: one client (Unir) has 4000+ extensions. This is unusable as a <select>.

WHAT TO CHANGE:
Replace the <select> with a text input + filtered dropdown (combobox pattern).

BEHAVIOR:
1. ON FOCUS (input empty): dropdown opens showing the first 20 FREE extensions
   in ascending order. Occupied extensions are NOT shown at all.
   Header inside dropdown: "Extensiones disponibles (N)"
   Footer: "Mostrando 20 de N · Escribe para filtrar"

2. ON TYPE: filter free extensions that START WITH the typed digits.
   User types "1" → shows 100, 101, 104, 105...
   User types "12" → shows 120, 122, 123, 124, 126, 128, 130...
   Header changes to: "Resultados para «12» (6)"
   If no match: "No hay extensiones disponibles que empiecen por «12»"

3. ON SELECT: clicking an extension fills the input and closes the dropdown.
   The input shows the selected number as editable text (user can clear and re-search).

4. VALIDATION: on blur or save, if the typed number doesn't match any free extension,
   show error: "Esta extensión no existe o ya está asignada."
   Keep the existing red border pattern for error state.

DROPDOWN STYLE:
- Match the Browse + Search dropdown from the agent selector in CreateGroupPage
- border border-gray-200, shadow-md, bg-white, rounded-md, max-height 280px, internal scroll
- Each row: just the extension number (left-aligned, font-mono, text-[13px])
  No extra metadata — it's a simple number picker
- Hover: bg-gray-50

WHAT TO KEEP:
- "Tipo de extensión" dropdown above (Teléfono / WebRTC) stays as <select> — only 2 options
- Changing extension type still resets the extension value
- Required asterisk and error state styling stay the same
- Grid layout (2 columns: tipo + extensión) stays the same

WHY: Post-sales confirmed this is a daily pain point.
"En Unir son 4000 y pico, es inviable" — showing occupied ones is noise.
"Sería útil escribir" — they know the range, just need to type and confirm.

CONSISTENCY NOTE: This combobox is SIMPLER than the Browse + Search for agents/groups.
No avatars, no chips, no "+ Añadir" buttons — just a number list.
Think of it as the same pattern reduced to its minimum expression for a numeric ID field.
```

---

## PATCH I · Tabla de Grupos — ID visible por defecto

```
Update the Groups list table (GroupsListPage) with this single change.

── CHANGE 6: ID column visible by default, FIRST position ──

WHAT EXISTS NOW:
- ID column defined as: { key: "id", label: "ID", defaultVisible: false }
- When enabled, renders AFTER Nombre
- Uses font-mono text-gray-400 styling (correct)

WHAT TO CHANGE:
- Set ID to defaultVisible: true
- Move ID to render BEFORE Nombre in the table header and body
- Column order: [Checkbox] → [ID] → [Nombre] → [Teléfono] → [Agentes] → ...

This is the SAME change as Patch G Change 1 for Agents.
Both tables must be consistent: ID is always column 1 after checkbox.

── NO OTHER CHANGES to GroupsListPage ──
```

---

## PATCH J · Formulario Grupos — tooltip corregido

```
Update ONE tooltip in CreateGroupPage.

── CHANGE 7: "Audio en llamada saliente" tooltip clarification ──

WHAT EXISTS NOW:
Tooltip key "outboundAudio" with text:
  "Audio que escucha el agente al iniciar una llamada saliente"

This text is WRONG. The audio is not "what the agent hears" — it's a legal/GDPR
recording that the AGENT CAN PLAY to the CUSTOMER during the conversation.
During the usability session, Tere initially confused this with "locución previa"
(pre-call announcement). Ángel had to clarify it's GDPR audio.

WHAT TO CHANGE:
Replace tooltip text with:
  "Audio legal (GDPR) que el agente puede reproducir al cliente durante la conversación"

Also update the field label from:
  "Audio saliente"
to:
  "Audio GDPR en conversación"

This eliminates the ambiguity between "audio that plays before the call connects"
(which is a VUI Designer concern) and "audio the agent triggers during the call"
(which is what this field actually controls).

── NO OTHER CHANGES to CreateGroupPage ──
```

---

## Resumen de impacto

| Patch | Pantalla | Componentes tocados | Riesgo |
|-------|----------|-------------------|--------|
| G (1-4) | Listado Agentes | Column config, table header order, table body order, bulkFieldOptions, bulkValueOptions, handleBulkApplyConfirmed | Bajo — extensiones de arrays existentes |
| H (5) | Crear/Editar Agente | Solo el bloque de extensión en sección Identificación | Medio — reemplaza <select> por combobox |
| I (6) | Listado Grupos | Column config, table header order, table body order | Bajo — mismo cambio que G.1 |
| J (7) | Crear/Editar Grupo | 1 string de tooltip + 1 label | Mínimo |

## Orden de aplicación recomendado

1. **PATCH I** — Grupos, cambio más simple, valida el patrón de ID-first
2. **PATCH G (1-2)** — Agentes, visibilidad de columnas (sin lógica nueva)
3. **PATCH G (3-4)** — Agentes, bulk edit fields (lógica nueva pero patrón existente)
4. **PATCH H** — Agentes, combobox de extensión (componente nuevo, más complejo)
5. **PATCH J** — Grupos, tooltip (trivial, aplicar en cualquier momento)

## Elementos que NO cambian en este patch

- ❌ Sidebar, top bar, breadcrumbs — validados sin cambios
- ❌ Menú contextual (3 puntos) — validado, tres formas de eliminar funcionan
- ❌ Labels y asignación — validados, submenu contextual funciona
- ❌ Presencia con dropdown inline — validada, dropup funciona
- ❌ Duplicación individual — validada
- ❌ Empty states — validados
- ❌ Toasts — validados
- ❌ Orden de secciones en formulario agente — mantener actual (Identificación → Permisos → Grupos → Avanzada)
- ❌ "Guardar y crear otro" — sigue descartado
- ❌ Config avanzada colapsable — se mantiene, pero se registra como mejora futura mover estrategias Niveles/Exclusiva al dropdown principal

## Gaps registrados (fuera de este patch)

| Gap | Descripción | Prioridad |
|-----|-------------|-----------|
| Servicios asociados a grupo | Columna con servicios donde está configurado cada grupo (dato de Voice). Requiere decisión de modelo de datos | Media |
| Exclusión individual en recursos | Asignar agenda/plantilla a grupo pero excluir agentes específicos | Post-MVP |
| Estrategias Niveles/Exclusiva | Moverlas del acordeón avanzado al dropdown principal de estrategia | Segunda iteración |
| Importación CSV de agentes | ~80% se crean por import. Botón "Importar" junto a "Crear agente" | Post-MVP |
| Activación masiva post-import | Los importados salen inactivos, se activan uno a uno | Post-MVP |