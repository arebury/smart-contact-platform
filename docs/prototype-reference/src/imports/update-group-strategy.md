Update the "Estrategia" section in the Create/Edit Group form (CreateGroupPage)
with the following TARGETED modifications. Do NOT rewrite the full page.

── CONTEXT: what exists now ──

The "Estrategia" section currently shows:
- "Estrategia — Teléfono" dropdown with 5 options:
  Balanceada, Lineal, Aleatoria, Menos llamadas atendidas, Menos reciente
- "Estrategia — Chat" dropdown (only when Chat channel active)

SEPARATELY, buried in the "Configuración avanzada" collapsible accordion at the
bottom of the form, there is a "Estrategias especiales" subsection with 3 radio buttons:
  (•) Ninguna
  ( ) Agente exclusivo
  ( ) Niveles
When Exclusivo or Niveles is selected, a yellow warning says:
  "Esta estrategia requiere configuración adicional en el diseñador VUI."

This separation is WRONG. Users expect to find all strategies in the same place.
During usability testing, users looked for Niveles in the strategy dropdown and
didn't find it. The advanced config creates a hidden second path for the same concept.

── CHANGE 1: Merge all strategies into the main dropdown ──

Replace the "Estrategia — Teléfono" dropdown options with:

STANDARD STRATEGIES (top group):
  Balanceada
  Lineal
  Aleatoria
  Menos llamadas atendidas
  Menos reciente (más inactivo)
─────────────────────────── ← visual separator line inside the dropdown
ESTRATEGIAS AVANZADAS (label, non-selectable, gray text, 11px):
  Agente exclusivo
  Niveles

The separator + label inside the dropdown groups the options without adding
a second UI control. Same dropdown, same interaction, clear hierarchy.
This is the standard <optgroup> pattern — PrimeNG supports it natively.

Update tooltip text for the field to:
  "Define cómo se distribuyen las interacciones entre los agentes del grupo.
   Las estrategias avanzadas (Exclusivo, Niveles) requieren configuración adicional."

── CHANGE 2: Remove "Estrategias especiales" from advanced config ──

DELETE the entire "Estrategias especiales" subsection from the Configuración avanzada
accordion. This means removing:
  - The "Estrategias especiales" label
  - The 3 radio buttons (Ninguna, Agente exclusivo, Niveles)
  - The yellow VUI warning callout
  - The col-span-2 border-t divider that wraps it

The specialStrategy state variable is no longer needed.
The strategy dropdown now handles everything.

── CHANGE 3: "Agente exclusivo" selected → inline info callout ──

When "Agente exclusivo" is selected in the strategy dropdown, show an informational
callout IMMEDIATELY below the dropdown (inside the Estrategia section, not in advanced):

  ℹ️ "Agente exclusivo asigna todas las interacciones al mismo agente mientras
      esté disponible. Requiere configuración del árbol IVR en VUI Designer."

Style: bg-blue-50, border border-blue-200, text-[12px] text-blue-700, same pattern
as the HTTPS warning in the "Apertura de ficha" section (already exists in the form).
Use info icon (ℹ️), NOT warning triangle — it's informational, not an error.

No additional configuration UI needed for Agente exclusivo. Just the callout.

── CHANGE 4: "Niveles" selected → levels configuration area ──

When "Niveles" is selected in the strategy dropdown, show the FULL levels
configuration area below the dropdown, still inside the Estrategia SectionCard.

IMPORTANT: The agents that appear here are ONLY agents already assigned to this group
(from the "Agentes" section above). This is a sub-organization of assigned agents
into priority tiers, not a new assignment mechanism.

LAYOUT — Two-panel transfer list:

┌─────────────────────┐          ┌──────────────────────────────┐
│ Agentes sin nivel (3)│          │ Niveles                      │
│ ┌─────────────────┐ │          │ ┌──────────────────────────┐ │
│ │🔍 Buscar...     │ │          │ │🔍 Buscar...             │ │
│ └─────────────────┘ │          │ └──────────────────────────┘ │
│                     │          │                              │
│ Ángel personal  📞🖥│   >>     │ ▾ Nivel 1 (5)           [—] │
│ Agente demo    📞🖥 │   >      │   Miguel Palacios   📞🖥✉  │
│ Inés Recio    📞🖥 │   <      │   Agente José       📞🖥   │
│                     │   <<     │   Mario Perez        📞🖥   │
│                     │          │   Rafael             📞🖥✉  │
│                     │          │   Jose Barcala       📞🖥   │
│                     │          │                              │
│                     │          │              [+ Nivel] [— ] │
└─────────────────────┘          └──────────────────────────────┘

Subestrategia                    ℹ️
[ Balanceada                  ▾]

LEFT PANEL — "Agentes sin nivel":
- Header: "Agentes sin nivel (N)" where N = count of unassigned-to-level agents
  Style: same header bar as the "Agentes asignados" area (bg-gray-50, border-b, 12px font-600)
- Search input below header: "Buscar..." — same compact search pattern as the
  assigned agents search (the one with the small magnifying glass, 12px text)
- Agent rows: [ Agent name ] [ channel icons right-aligned ]
  Channel icons: same AgentChannelIcons component already used in the agent selector
  Row height, padding, font — identical to assigned agents rows
- Scrollable if >8 agents, max-height ~280px
- Border: border border-gray-200 (matches assigned agents area)

CENTER — Transfer arrows:
- Vertical stack of 4 buttons: ≫ (all right), › (selected right), ‹ (selected left), ≪ (all left)
- Style: small square buttons (28x28px), border border-gray-200, bg-white,
  hover:bg-gray-50, text-gray-400, hover:text-gray-600
- Vertically centered between the two panels
- Icons: use ChevronsRight, ChevronRight, ChevronLeft, ChevronsLeft from lucide-react
  (already imported in the project)

RIGHT PANEL — "Niveles":
- Header: "Niveles" — same header bar style as left panel
- Search input: same as left panel
- LEVEL SUBHEADERS: Each level is a collapsible group inside this panel.
  Header row: "▾ Nivel 1 (5)" with a small [—] button on the far right to remove level
  - "▾" = collapse/expand chevron (ChevronDown, rotates to ChevronRight when collapsed)
  - "(5)" = agent count in this level
  - [—] button: only visible on hover of the level header row. Minus icon, text-gray-400,
    hover:text-red-500. Tooltip: "Eliminar nivel"
  - Header row style: bg-gray-100/60, px-3 py-2, text-[12px] font-600 text-gray-600,
    border-b border-gray-100
- Agent rows inside each level: same style as left panel
  Agents are indented slightly (pl-2 or similar) to show they belong to the level
- ADD/REMOVE LEVEL buttons at bottom-right of the panel:
  [+ Nivel] — small button, text-[12px], text-blue-600, hover:text-blue-700,
  icon Plus (lucide), ghost/text style. Adds "Nivel N+1" at the bottom
  This replaces the green/red circle buttons from Voice with a cleaner pattern
  matching SmartContact's button language.
- When there's only 1 level, the [—] remove button on its header is DISABLED (gray-300)
  You can't have 0 levels when Niveles strategy is active.
- Max 5 levels. When at 5, the [+ Nivel] button is disabled with tooltip: "Máximo 5 niveles"

Panel widths: Left ~40%, Right ~50%, arrows ~10% (centered gap)
Both panels same height, min-height 200px

SUBESTRATEGIA DROPDOWN (below the two panels):
- Label: "Subestrategia" with ℹ️ tooltip
- Tooltip text: "Define cómo se distribuyen las interacciones entre agentes
  dentro de cada nivel. Se aplica a todos los niveles por igual."
- Dropdown options:
  Balanceada
  Menos llamadas atendidas
  Más tiempo inactivo
- Default: Balanceada
- Standard select dropdown, same style as all other selects in the form
- Only visible when strategy = "Niveles"

── SHOW IN DESIGN: TWO STATES ──

STATE A — Strategy = "Balanceada" (default):
Just the dropdown, no extra UI. Same as current behavior.

STATE B — Strategy = "Niveles" (expanded):
The full configuration area visible: two panels + arrows + subestrategia.
Show with example data:
- Left panel: 3 agents without level
- Right panel: Nivel 1 with 5 agents, empty "Nivel 2" just created
- Subestrategia: "Balanceada" selected

── VALIDATION BEHAVIOR (annotation, not UI) ──
Add a small design annotation below the component:
"⚠ Validación al guardar: si quedan agentes sin nivel asignado, mostrar
warning inline (no bloqueante): «Hay 3 agentes sin nivel asignado. Se
añadirán automáticamente al último nivel.»"

── WHAT TO KEEP UNCHANGED ──
- Chat strategy dropdown (independent, stays as is)
- The SectionCard wrapper ("Estrategia" title + icon)
- All other sections of the form
- The "Agentes" section above (agent assignment is independent of level organization)

── CONSISTENCY NOTES ──
- Agent rows in both panels reuse the EXACT same visual pattern as the
  assigned agents list that already exists in the Agentes section of this form:
  name + channel icons, same font size, same spacing
- Search inputs reuse the compact search pattern from assigned agents area
- Panel borders and headers match the assigned agents area (border-gray-200, bg-gray-50)
- The [+ Nivel] button follows the same ghost/text button pattern used elsewhere
  (like "Gestionar en Repositorios →" links)
- NO new visual patterns introduced — everything is composed from existing elements

DIMENSIONS: Same as current form width (~780px content area).
The two-panel layout fits within this width. Do not exceed it.