ADDENDUM to PATCH K — Add Ring All as a third advanced strategy.
Apply ON TOP of the changes in Patch K. Same section, same dropdown.

── CHANGE 5: Ring All added to strategy dropdown ──

The strategy dropdown (after Patch K) has this structure:

STANDARD STRATEGIES:
  Balanceada
  Lineal
  Aleatoria
  Menos llamadas atendidas
  Menos reciente (más inactivo)
─────────────────────────── ← separator
ESTRATEGIAS AVANZADAS:
  Agente exclusivo
  Niveles
  Ring All               ← NEW — add as last option in advanced group

── CHANGE 6: "Ring All" selected → config + cost warning ──

When "Ring All" is selected in the strategy dropdown, show TWO elements
immediately below the dropdown (inside the Estrategia SectionCard),
stacked vertically with 12px gap between them:

ELEMENT 1 — Configuration field:

Nº agentes simultáneos                              ℹ️
[ 2                                               ▾]

- Label: "Nº agentes simultáneos" with ℹ️ tooltip
- Tooltip text: "Número de agentes que sonarán a la vez cuando entre una
  interacción. El primero en descolgar atiende la llamada."
- Standard <select> dropdown, same style as all other selects in the form
- Options: 2, 3, 4, 5, 6, 7, 8, 9, 10
- Default: 2
- Width: ~120px (small — it's just a number). Align left under the strategy dropdown.
  Use the same grid alignment as other secondary fields in the form.
- Only visible when strategy = "Ring All"

ELEMENT 2 — Cost warning callout:

⚠️ "Ring All puede generar costes adicionales al multiplicar el número
    de llamadas salientes simultáneas."

- Style: bg-amber-50, border border-amber-200, text-[12px] text-amber-700
- Icon: AlertTriangle from lucide (amber-500), same icon already used in
  the form for the VUI Designer warning
- This is a WARNING (amber), not info (blue) — because it has financial impact.
  Different from the Agente exclusivo callout which is informational (blue).
- Full width of the section content area
- Always visible when Ring All is selected. Does NOT dismiss.

── SHOW IN DESIGN: ADD A THIRD STATE ──

In addition to the two states from Patch K (Balanceada default, Niveles expanded),
show:

STATE C — Strategy = "Ring All":
- Strategy dropdown showing "Ring All" selected
- Below: "Nº agentes simultáneos" field with "2" selected
- Below: amber cost warning callout
- No other extra UI — Ring All is simpler than Niveles

── VISUAL HIERARCHY of conditional content by strategy ──

For reference, here is the complete map of what appears below the strategy
dropdown depending on selection. Only ONE of these states is active at a time:

| Strategy selected | What shows below dropdown |
|-------------------|--------------------------|
| Balanceada | Nothing |
| Lineal | Nothing |
| Aleatoria | Nothing |
| Menos llamadas atendidas | Nothing |
| Menos reciente | Nothing |
| Agente exclusivo | Blue info callout (ℹ️ IVR config needed) |
| Niveles | Two-panel level config + subestrategia dropdown |
| Ring All | Nº agentes simultáneos dropdown + amber cost warning |

── CONSISTENCY NOTES ──
- The amber callout reuses the EXACT same visual pattern as the HTTPS warning
  in "Apertura de ficha" section — same bg-amber-50, border-amber-200, icon size.
  The only difference: Apertura de ficha uses ⚠️ for HTTPS, Ring All uses ⚠️ for cost.
  Same component, different text.
- The small number dropdown (Nº agentes simultáneos) is visually equivalent to the
  "Frecuencia" field next to "Anuncio periódico" in the Anuncios y audio section —
  a compact numeric select alongside a label. Same pattern, same scale.
- NO new visual patterns introduced.

── WHAT DOES NOT CHANGE ──
- Chat strategy dropdown (Ring All only applies to phone channel)
- Everything else from Patch K remains as specified