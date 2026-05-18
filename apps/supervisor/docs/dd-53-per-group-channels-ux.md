# DD#53 — Per-agent-per-group channel permissions (UX spec)

**Branch:** `feat/per-group-agent-channels`
**Status:** design draft, pre-implementation
**Reference:** Voice user manual, Figura 15 (page 20) — `aed_mu_mb.pdf`
**Audience:** non-dev administrator managing dozens of groups + hundreds of agents

---

## 1. Why we are not copying Figura 15 literally

Voice's table works for Voice's users (call-center IT operators trained on the legacy tool). For our administrator, a verbatim port underperforms in five concrete ways:

1. **One row per "node" with a single channel column hides the model.** Voice shows `Nodos | Teléfono | On/Off` because every node has exactly one channel by configuration upstream. Our groups can have 1–3 channels (phone / chat / email), so a single "channel" column makes a row's meaning depend on context the user has to remember. Three explicit columns scan instantly; one ambiguous column does not.
2. **Adding rows via a separate "+" button + dropdown is two clicks per agent.** With hundreds of agents, batch attach is the dominant flow. We need a *picker that supports multi-select with search* (chip-style), not a one-by-one row builder.
3. **No bulk channel toggle.** Figura 15 has a column header checkbox that toggles "phone" for *every visible row*. That works in Voice but is heavy for our user — they want "fill phone for the 12 agents I just added", not "for everyone in this group". Selection-aware bulk is what they expect (we already have `aed-bulk-action-bar`).
4. **The On/Off toggle and channel checkboxes overlap semantically.** "All channels off but agent is On" is a valid Voice state but reads as broken to a non-technical user. We collapse this: the toggle becomes a clear *Pause* affordance, and zero-channel rows surface a soft warning.
5. **No empty/edge-case treatment.** If the group has only `phone`, Voice still shows three columns (the others are read-only crossed out). We hide the columns the group does not own — the table widens or narrows with the group's channels and the user never sees a column they cannot use.

What we *do* keep from Voice: the symmetry (same table from both forms), the per-row checkbox grid (mental model is identical to permissions matrices the user already knows), and the on/off toggle as the "active in this assignment" lever.

---

## 2. Proposed UX

### 2.1 Group form → "Agentes asignados" section

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ AGENTES ASIGNADOS                                                            │
│ Define qué canales atiende cada agente en este grupo y si está activo.       │
│                                                                              │
│ [ Buscar o añadir agente…           ▾ ]   12 asignados · 3 sin canales       │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ ☐  Agente             │ ☐ Teléfono │ ☐ Chat │ ☐ Email │  Activo         │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │ ☐  ◉ Miguel Rodríguez │     ☑      │   ☑    │   ☐     │  ●━○  ⋮         │ │
│  │ ☐  ◉ Ana López        │     ☑      │   ☐    │   ☐     │  ●━○  ⋮         │ │
│  │ ☐  ◉ Carlos Pérez     │     ☐      │   ☐    │   ☐  ⚠  │  ○━●  ⋮         │ │
│  │ ☐  ◉ Lucía Martín     │     ☑      │   ☑    │   ☑     │  ●━○  ⋮         │ │
│  │ …                                                                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ╔══════════════════════════════════════════════════════════════════════╗   │
│  ║ 3 seleccionados · [Activar Teléfono] [Quitar Chat] [Pausar] [Quitar] ║   │ ← bulk bar (overlay, no CLS)
│  ╚══════════════════════════════════════════════════════════════════════╝   │
└──────────────────────────────────────────────────────────────────────────────┘
```

Key reads:
- The picker at the top is a **combobox with search + multi-select chips**. Typing "mig" filters the roster; pressing Enter (or clicking the chip) appends a row with the group's default channels pre-checked. Pasting a comma-separated list adds many at once.
- **Column headers are tri-state checkboxes.** Click "Teléfono" header → toggles phone for *all visible* rows (respects the search filter). Indeterminate state when some-but-not-all rows have it.
- **Row-level checkbox** (leftmost column) drives selection for the bulk bar. The bulk bar appears **as an overlay** (pinned to bottom of the section) and disappears on deselect — we already have `aed-bulk-action-bar`.
- **Active toggle** (`aed-toggle-switch`) is the on/off lever. When off, the row dims to 60% opacity and its channel cells become read-only (state preserved). This is the "pause without losing config" pattern.
- **Zero-channels warning** (⚠ glyph) when an active row has no channels checked. Soft, not blocking; saving is allowed but a confirm dialog asks "este agente no atiende ningún canal en este grupo, ¿correcto?".
- **Row menu `⋮`** holds: *Quitar del grupo*, *Activar todos los canales*, *Solo Teléfono / Solo Chat / Solo Email*.
- **Counter line** (`12 asignados · 3 sin canales`) is the at-a-glance health check.
- Columns hidden if group does not own that channel (e.g., phone-only group → only Teléfono column shown).

Empty state: when `assignedAgents.length === 0`, the table is replaced by an `aed-empty-state` with the picker as the primary CTA.

### 2.2 Agent form → "Grupos asignados" section

Symmetric, reading from the agent's POV:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ GRUPOS ASIGNADOS                                                             │
│ En qué grupos trabaja Miguel y qué canales atiende en cada uno.              │
│                                                                              │
│ [ Buscar o añadir grupo…            ▾ ]   5 grupos                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Grupo                  │ Canales del grupo │ Sus canales aquí │ Activo  │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │ Soporte L1             │ ☎ 💬 ✉            │ [☑ ☎] [☑ 💬] [☐ ✉]│  ●━○    │ │
│  │ Ventas                 │ ☎                 │ [☑ ☎]             │  ●━○    │ │
│  │ Backoffice             │ 💬 ✉              │ [☐ 💬] [☐ ✉]   ⚠  │  ○━●    │ │
│  │ Soporte L2             │ ☎ 💬              │ [☑ ☎] [☑ 💬]      │  ●━○    │ │
│  │ Cobros                 │ ☎                 │ [☑ ☎]             │  ●━○    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

Differences from the group-side table:
- **No fixed channel columns.** Each group has its own channel set, so showing "Teléfono / Chat / Email" as fixed columns would mostly be empty cells. Instead the row shows a **chip-cluster** of *just the channels that group offers*, each chip being a checkbox button (toggle on/off).
- **Read-only "Canales del grupo" column** confirms what the group offers — answers "why is Email missing here?" without leaving the form.
- Bulk operations less critical here (one agent rarely belongs to 50 groups), but selection + delete still work.

### 2.3 Cross-form coherence (most important)

The same `(agentId, groupId)` link drives both views. Editing in one immediately reflects in the other on next open — no caching gotchas, no duplicate sources of truth.

---

## 3. Data model

### Replaces

```ts
// REMOVE from agents-data.ts
interface Agent {
  // ...
  channels: AgentChannel[];   // ← global channel capability list, gone
  groups: AgentGroupRef[];    // ← simple {id,name} ref, gone
}

// REMOVE from groups-data.ts
interface Group {
  // ...
  assignedAgents: string[];   // ← name strings, gone
}
```

### New shape

```ts
// shared/data/group-agent-link.ts (new file, single source of truth)
export type Channel = 'phone' | 'chat' | 'email';

/**
 * The link between an agent and a group. Created when the agent is
 * assigned. Holds the per-pair channel permissions and active flag.
 *
 * Invariants enforced by store mutators:
 *   - link.channels ⊆ group.channels  (cannot enable a channel the group doesn't own)
 *   - one link per (agentId, groupId) pair
 */
export interface GroupAgentLink {
  readonly agentId: number;
  readonly groupId: number;
  readonly channels: ReadonlySet<Channel>;  // subset of group.channels
  readonly active: boolean;                 // on/off lever (pause without unassign)
}
```

```ts
// agents-data.ts (updated)
interface Agent {
  readonly id: number;
  readonly name: string;
  // ...everything else stays the same...
  // REMOVED: channels, groups
}
```

```ts
// groups-data.ts (updated)
interface Group {
  readonly id: number;
  readonly name: string;
  readonly channels: readonly Channel[];   // group capability list, stays
  // ...everything else stays the same...
  // REMOVED: assignedAgents
}
```

### Storage location

Links live in a **dedicated store** (`GroupAgentLinksStore`, sibling of `AgentsStore` and `GroupsStore`). Reasons:

1. Putting the array on `Agent` *or* `Group` forces one side to import the other and creates write-fan-out (modify on save in both stores). A third store keeps both sides clean.
2. We already have the cross-feature pattern via `LabelCascadeService` — same playbook applies here. The store exposes:
   - `linksForAgent(agentId): Signal<GroupAgentLink[]>` — drives agent form.
   - `linksForGroup(groupId): Signal<GroupAgentLink[]>` — drives group form.
   - `upsertLink(link)`, `removeLink(agentId, groupId)`, `setLinkChannels(...)`, `setLinkActive(...)`.
   - `cascadeGroupChannelRemoval(groupId, removed)` — when a group drops `chat`, this removes `chat` from every link in O(n) and notifies (toast: "Quitado Chat de N agentes en Soporte L1").
3. Migration of seed data is a one-time flatten: today every `Group.assignedAgents: string[]` × `Group.channels` produces one link with `active=true` and channels=group.channels. We log a one-shot migration in `agents.store` boot.

### Derived signals (replace removed fields)

```ts
// On AgentsStore (computed):
agentChannels = (agentId: number) =>
  links.linksForAgent(agentId)()
       .filter(l => l.active)
       .flatMap(l => [...l.channels])
       .reduce((set, ch) => set.add(ch), new Set<Channel>());

// On GroupsStore (computed):
assignedAgentCount = (groupId: number) =>
  links.linksForGroup(groupId)().length;
```

Anywhere today that reads `agent.channels` becomes `agentChannels(agent.id)`. Anywhere that reads `group.assignedAgents` becomes `linksForGroup(group.id)`. The list/badge/filter UIs need a one-pass update — straightforward.

---

## 4. Components / directives to build

| # | Name | Lives in | Purpose |
|---|------|----------|---------|
| 1 | **`AedAgentChannelTableComponent`** | `groups/components/` | The group-form section (2.1). Inputs: `groupChannels: Channel[]`, `links: GroupAgentLink[]`, `availableAgents: AgentRef[]`. Outputs: `linksChange`, `bulkAction`. Owns the picker + table + tri-state column headers + zero-channel warning. |
| 2 | **`AedGroupChannelChipsComponent`** | `agents/components/` | The agent-form section (2.2). Inputs: `groupChannels: Channel[]`, `linkChannels: ReadonlySet<Channel>`. Output: `channelsChange`. Pure presentational; no store coupling. |
| 3 | **`AedTriStateCheckboxComponent`** | `shared/components/` | The column header checkbox with `none / some / all` states. Drives bulk-toggle for visible rows. Reusable for any matrix-permissions UI later. Built with native `<input type="checkbox">` + `indeterminate` property for a11y. |
| 4 | **`AedAgentPickerComponent`** | `shared/components/` | Combobox with search, multi-select chips, paste-list support. Wraps PrimeNG `MultiSelect` (theme-tokenized) but exposes a typed `(add)` event so we own the assignment side-effect. Reused in agent-form to add groups (mirror direction). |
| 5 | **`GroupAgentLinksStore`** | `shared/state/` | The link store described above. NgRx-signals style, matches `LabelsStore` shape. |

**Deliberately NOT a new component:** the per-row "Activo" toggle is just `aed-toggle-switch` we already have. The bulk action bar is the existing `aed-bulk-action-bar`. The roster row avatar is `aed-illustrated-avatar`. We resist building a `aed-channel-grid-row` wrapper — the row is plain HTML driven by `AedAgentChannelTableComponent`'s template, no need for a third nesting level.

---

## 5. Interaction details for "super intuitive"

These are the small things that separate "fine" from "feels alive":

1. **Tri-state column header.** Click cycles `none → all → none`. If the current state is mixed (some checked), first click clears all (the most expected behavior; "select all" then "clear all" is a 2-click pattern users already know).
2. **Picker keyboard flow.** Type → ↓ to first match → Enter to add → focus stays in picker (ready for the next agent). Esc closes the dropdown. Backspace on empty input removes the last chip — this is the GMail compose pattern, free transfer.
3. **Paste-list support.** Pasting `Miguel Rodríguez, Ana López, Lucía Martín` into the picker resolves all three against the roster and adds chips for matches; unmatched names surface as red chips with a tooltip "no encontrado".
4. **Channel checkbox cells respect Space and Enter.** Native `<input type="checkbox">` with proper `<label>` wrapping — no roving tabindex theatrics needed.
5. **Pause cascade.** Toggling a row's "Activo" off does *not* clear its channels — config is preserved for re-activation. The row visibly dims (60% opacity, `aria-disabled="true"` on the channel cells, but the toggle stays enabled). Reactivating restores the previous channel set as-is.
6. **Save dirty-state batching.** All link mutations are local until form save (consistent with existing forms). Cancel / route-leave guard already exists via `DirtyAware`. We don't write through to the store on every checkbox click — that would conflict with the cancel-changes flow and create surprises if the user tabs away mid-edit.
7. **Bulk bar overlays, never pushes.** Per saved feedback (no-layout-shift). We already do this for users/groups/agents lists; same primitive (`aed-bulk-action-bar`) reused.
8. **Zero-channel soft warning is only shown when `active=true`.** A paused agent with no channels is a fine state ("disabled, will be configured later"). An active agent with no channels is the suspicious one.
9. **Cascade visibility when group channels change.** If the group form has `chat` unchecked from "Canales del grupo", the column disappears from the table immediately, and the form's confirm dialog (on save) names the consequence: "Vas a quitar Chat. Esto desactivará Chat para 8 agentes en este grupo." This is the only place we surface the cascade — in the moment it happens, with a count.
10. **No drag-reorder.** Voice has none, our ordering is alphabetical by name (a sortable column header `aedSortable` is enough). Drag-reorder of permissions rows tends to confuse non-dev users — they read order as priority and we do not want that mental model here.
11. **Search filter affects bulk-toggle scope.** When the picker has "ven" typed (filter active), the column tri-state toggle only applies to *visible* (filtered) rows. Indicate this in the bulk bar text: "Activar Teléfono en 4 agentes filtrados".
12. **`prefers-reduced-motion`.** All row dim/opacity transitions skip when reduced-motion is set — already the project default via the `_motion.scss` mixin.
13. **Dark mode.** Channel checkbox uses our `--sc-checkbox-*` tokens (already defined). Row hover uses `--sc-row-hover-bg`. Disabled-state opacity uses `--sc-disabled-opacity` (0.6). Verified against existing tables — no new tokens needed.

---

## 6. Out of scope for this DD

- Changing how `Agent.permissions` (call/transfer/device matrices) work. Those stay agent-global; only the *channel* part moves to per-group.
- The list pages (`/admin/agentes`, `/admin/grupos`) — they keep showing the derived counts. The "Canales" column on the agents list now reads `agentChannels(id)` instead of the static field.
- Voice's "Asignación" by location/branch/role — not in our scope, our admin runs flat.
- API contract — local stores only, persistence is mock-data refactor for now.

---

## 7. Implementation order (suggested)

1. Build `GroupAgentLinksStore` + types + seed migration. Tests for link CRUD + cascade.
2. Build `AedTriStateCheckboxComponent` + `AedAgentPickerComponent` in isolation (with test fixtures).
3. Build `AedAgentChannelTableComponent`. Wire it into group form. Visual A/B with Playwright (light + dark, empty + populated + zero-channel-warning).
4. Build `AedGroupChannelChipsComponent`. Wire into agent form.
5. Sweep readers: list pages, badges, filters — replace `agent.channels` and `group.assignedAgents` accesses.
6. Cascade dialog on group-form save (channel removal warning).
7. Snapshot tests + regression check (`npm test`, full Playwright pass).
8. Docs: update `docs/design-system.md` (new components), `SESSION-LOG.md`, this file → `docs/dd-54-per-group-channels-ux.md`.
