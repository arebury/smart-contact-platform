# SCDS — Customs Catalog

> Catálogo único de **brand divergences** entre SCDS y la referencia Figma
> `Smart Contact Prime` (file `khNq9dJKNi13pNllrqm6dx` = PrimeOne UI Kit duplicado para SC).
> Cada entry documenta UN punto donde SC se aparta del Figma de forma **intencionada** —
> con razón y mapping concreto en código.
>
> No es un changelog (eso vive en SESSION-LOG). No es un audit (eso vive en cada spec doc).
> Es la lista de "decisiones de marca" SC que un consumer (Memory en el futuro, contributor
> nuevo, designer comparando con Figma) necesita conocer en un solo sitio.

---

## Categorías de divergencias

1. **Brand colors** — semánticas reasignadas a paleta SC (más oscuro / más vibrante / familia distinta).
2. **Component extensions** — slots / variants / behaviors que SC añade y Figma no modela.
3. **Component overloads** — slots Figma reusados con semántica SC distinta.
4. **Sizes / density** — SC añade variantes que Figma no contempla (sm/lg en algunos componentes).
5. **Gaps conocidos** — piezas del Kit Figma que aún no tienen wrapper SCDS (decisión consciente).

---

## Checklist anti-divergencia

Antes de añadir cualquier prop / slot / CSS override a un componente SCDS, responder estas 4 preguntas en orden:

1. **¿PrimeNG ya lo expone?** Si sí → exponerlo con el mismo nombre de input, mismo evento, mismos templates (`pTemplate` content projection). NO inventar API custom.
2. **¿Hay un token PrimeNG que lo cubra?** Si sí → consumirlo via `sc-preset.ts`, NO inventar variable nueva.
3. **¿La divergencia es brand-required?** Si sí → entry obligatoria en este catálogo con razón concreta + mapping en código. Si no → no añadir.
4. **¿Smart Contact Prime al portarlo solo tendría que hacer "import + linkar CSS"?** Si no → revisar.

Sobre Figma SC: pedir el link del componente ANTES de tocar nada. Replicar 1:1 los componentProperties (variants), auto-layout, paddings (incluso decimales), tokens (boundVariables).

---

## 1. Brand colors

### 1.1 Primary navy (todo el sistema)

| Componente | Figma | SC | Mapping en código |
|------------|-------|-----|-------------------|
| Button `severity=primary` | `#3b82f6` (azure-500) | `#344a70` (navy-500) | `sc-preset.semantic.primary.color = --sc-bg-primary` (líneas 147-158) |
| Tabs `active` | azure | navy | `components.tabs` inherits `primary.color` |
| Select / Datepicker / Input / MultiSelect `focus border` | azure | navy | `formField.focusBorderColor = --sc-bg-primary` |
| Checkbox `checked` (bg + border) | azure | navy | `sc-checkbox.scss` checked state `--sc-bg-primary` |
| Modal `header icon` | slate-700 | (puede ser inicia primary tinted) | — |

**Razón**: brand identity SC = navy oscuro, distinto del Aura primary default. Marca corporate consistent en CTAs principales.

**Trade-off**: el focus ring se queda igual = `--sc-color-electric-blue-500` (vibrante azure) para que el contraste de accesibilidad no sufra el navy oscuro.

---

### 1.2 Info → electric-blue (vibrante)

| Componente | Figma | SC | Mapping |
|------------|-------|-----|---------|
| Button `severity=info` | sky-500 (`#0ea5e9`) | electric-blue-500 (`#1464fe`) | `sc-preset.primitive.sky → electric-blue` (líneas 108-120) |
| Toast `severity=info` icon-bg | (mapeado a primitive sky) | electric-blue | `--sc-toast-info-icon-bg = --sc-color-electric-blue-500` |
| Message / Notification info chrome | sky | electric-blue | (idem, via primitive.sky override) |

**Razón**: el sky default de Aura es demasiado suave para el AED info treatment. Electric-blue da el peso visual que la marca SC necesita para notificaciones sistémicas (Toast info, Message info, Banner info).

---

### 1.3 Warn → amber (no orange)

| Componente | Figma | SC | Mapping |
|------------|-------|-----|---------|
| Button `severity=warn` | orange-500 (`#f97316`) | amber-500 (`#f59e0b`) | `sc-preset.primitive.orange → amber` (líneas 132-144) |
| Toast `severity=warn` | (mapeado a primitive orange) | amber | `--sc-toast-warn-* = --sc-color-amber-*` |
| Message / Notification warn chrome | orange | amber | (idem) |

**Razón**: amber AED es coherente con el warn semantic establecido en Message + Toast desde antes del audit. Orange Aura quedaría demasiado naranja-saturado para el resto del UI SC. Mantenemos amber.

**Nota**: `--sc-color-orange-*` sigue existiendo como primitive — es la paleta del label palette (`--sc-label-orange-*`). NO se toca; los labels siguen usando orange real. La override solo afecta el slot `primitive.orange` que PrimeNG button consume para warn.

---

## 2. Component extensions (SCDS añade lo que Figma no modela)

### 2.1 Toast action button (undo pattern)

- **Figma**: el toast tiene icon + summary + detail + close. NO hay slot para botón de acción.
- **SC**: añadimos un slot opcional via `data.undoEntryId` en `MessageService.add()`. Si presente, el template renderiza un botón "Deshacer" entre el body y el close X.
- **Visual**: botón outlined neutral por defecto (`sc-toast__action`), o solid primary con `data-action="solid"` o `.sc-toast__action--solid` para acciones high-stakes.
- **Implementación**: AED `app.component.html` template del `<p-toast>` + estilos en `packages/design-system/styles/_sc-toast.scss` (`&__action`, `&__action--solid`).
- **Para qué**: undo pattern post-acción destructiva ("Agente eliminado · Deshacer"). Critical UX SC.

**Decisión consciente: botón texto, NO countdown circular** (S47 evaluado y descartado). Patrón countdown circular (Notion / Linear / Twitter) genera urgencia visual innecesaria en herramientas enterprise + falla en accesibilidad (28×28px < 44×44 WCAG 2.1 AA touch target, screen-reader solo oye aria-label sin tiempo) + falacia común "urgencia visual = menos errores" (en realidad induce click-en-pánico). La urgencia debe ser **proporcional al riesgo**: acciones de bajo riesgo (toast undo) usan texto sin presión visual; acciones destructivas reales (eliminar agente, re-transcribir, restaurar fábrica) usan modal con confirmación type-CONFIRMAR — NO toast.

Para el caso futuro de backend real: el grace period del undo vive **server-side** (soft commit con timestamp + reversal en N segundos), no en la UI. La urgencia visual NO afecta data integrity — eso lo cubren `CrossTabLockService` + optimistic locking (ETags, version numbers) cuando exista DB.

### 2.2 Toast icon-square chrome

- **Figma**: el icono va "pelado" (svg sin background).
- **SC**: el icono va dentro de un cuadrado coloreado (severity-icon-bg). Glyph blanco sobre fill colored.
- **Implementación**: `.sc-toast__icon` block en el partial — `width/height` = `--sc-toast-icon-size`, `background` per severity via descendant selectors.
- **Para qué**: peso visual + glyph invertido (white-on-color) lee más limpio que glyph severity-color sobre background semi-transparente.

### 2.3 Checkbox indeterminate state ('some')

- **Figma**: el checkbox modela Selected=True/False (binary). NO hay variant para indeterminate.
- **SC**: añadimos un tercer state `'some'` para el patrón "select all" del header de tabla con selección parcial.
- **Visual**: mismo bg/border que `'all'` (checked, navy primary) + barra horizontal blanca en lugar del ✓.
- **Implementación**: `checkbox.scss` `.tri-checkbox__input:indeterminate + .tri-checkbox__box` rules. Width de la barra escala con size (8 / 10 / 12 raw px).
- **Para qué**: bulk-select de tablas (header row marca todo / nada / mixto según children).

### 2.4 Modal body slot stacking

- **Figma**: el body es un free slot sin layout opinionado.
- **SC**: el body es `display: flex; flex-direction: column; gap: var(--sc-spacing-300)` por defecto. Los hijos directos quedan apilados con gap 16px automático.
- **Implementación**: `sc-modal.scss` `.sc-modal__body` block.
- **Para qué**: el caso 95% de uso del modal en AED es forms verticales (2-5 inputs). Sin gap por defecto, cada consumer reinventaba un wrapper. Ahora `<sc-inputtext>`, `<sc-select>` etc. proyectados directamente quedan separados.

### 2.5 Modal `[bodyless]` mode

- **Figma**: el body siempre existe.
- **SC**: prop `[bodyless]="true"` colapsa el modal a header + footer pegados (sin body band visual). Para confirm dialogs donde la descripción cabe en subtitle.
- **Implementación**: `<sc-dialog>` template + scss `.sc-modal--bodyless` rules.
- **Para qué**: confirm dialogs (delete, discard, leave page) son el 60% de los usos de modal en AED.

---

## 3. Component overloads (slots reusados con semántica SC)

### 3.1 Toast `severity='secondary'` → violet (no slate)

- **Figma**: `Severity=Secondary` muestra slate-100 bg / slate-600 text — un "neutral notice" gris.
- **SC**: overload — `severity='secondary'` en `MessageService.add()` mapea a **violeta** (no slate).
- **Por qué**: AED usa `severity='secondary'` para "neutral notices" tipo `Borrador creado`, `Renombrado`. El slate de Figma queda demasiado apagado para esa categoría; violet da presencia sin sentirse celebratorio (como green success) ni urgente (como info azul).
- **Implementación**: tokens `--sc-toast-violet-*` (separados de `--sc-toast-secondary-*` que también existen pero unused en AED). El selector `&[data-severity='secondary']` en el partial apunta a violet.
- **Si el equipo de diseño** quiere un slate real para algún caso, se puede añadir un mapping nuevo `severity='contrast'` → slate sin afectar el violet.

---

## 4. Sizes / density (SC añade variantes off-Figma)

### 4.1 Input / Select / MultiSelect / Datepicker / Checkbox — sizes `sm` / `lg`

- **Figma**: Input + Select + MultiSelect tienen Sizes Small / Normal / Large explícitas (con decimales raw 12.25 / 14 / 15.75 font, 8.75/5.25 / 10.5/7 / 12.25/8.75 padding).
- **Datepicker / Checkbox**: Figma SOLO modela densidad Normal — no hay variants Small / Large.
- **SC añade** `sm` y `lg` por consistency family con el resto. Mismo escalado proporcional. Si el equipo de diseño en algún momento define densidades específicas para datepicker o checkbox, ajustar.
- **Implementación**:
  - Input: `sc-inputtext.scss` `--sm/--lg` con valores Figma exactos.
  - Select / MultiSelect: idem en `.p-select-label / .p-multiselect-label`.
  - Datepicker: `sc-datepicker.scss` (extiende formField via [size]).
  - Checkbox: `checkbox.scss` `&--sm / &--lg` con 14/21 px box.

### 4.2 Sub-pixel padding (raw decimals)

- **Figma**: muchos paddings caen en 0.5/0.25 px (10.5, 7, 8.75, 5.25, 12.25, 14, 15.75, 17.5).
- **SC**: `--sc-spacing-*` scale es entera (4, 8, 12, 16, 24, 32…). NO añadimos tokens decimales para evitar inflar la API.
- **Solución**: los valores raw px se escriben directamente en el SCSS (sin token) cuando el Figma así lo manda. Comentados con "raw decimal (off-scale)". Aplica a sc-inputtext sizes, sc-select sizes, sc-multiselect sizes, sc-checkbox sizes, formField.paddingX/Y, dialog padding 17.5, tabs padding 14/15.75, tooltip padding 10.5/7.

---

## 5. Gaps conocidos

Componentes del Kit Figma SC que **NO** tienen wrapper SCDS todavía. Decisión consciente: añadir solo cuando aparezca primer caso real de uso en AED.

### 5.1 `sc-inputgroup` — ✅ Resuelto Session 33 (Figma `❖ InputGroup` node 6738:22644)

- **Figma SC**: 8 variants `Left × Right × SecondLeft × SecondRight` para addons laterales del input (icon, button, prefix/suffix con border merge).
- **PrimeNG**: `<p-inputgroup>` + `<p-inputgroup-addon>` cubren esto.
- **Resolución S33**: wrapper Extended cocinado en `packages/design-system/components/input-group/`. API minimal (`size`, `fluid`). Tokens fluyen via `formField.*` sin overrides propios. Spec doc `34-inputgroup.md` + gallery `/components/input-group` (5 escenarios) + tag-input aed-servicio migrado.
- **Decisión arquitectónica**: NO se re-empaqueta `<p-inputgroup-addon>` como `<sc-inputgroup-addon>` — los addons son 100% PrimeNG sin overrides, un wrapper SC añadiría boilerplate sin valor (memoria `minimal-customization`). El consumer importa `InputGroupAddonModule` directo. Patrón consistente con `<sc-dialog>` que permite `<p-button>` por dentro.
- **NO confundir con search**: `<sc-search>` usa `<p-iconfield>` (icon overlay decorativo dentro del input, sin border merge). `<sc-inputgroup>` usa `<p-inputgroup>` (addons con border merge). Semánticas distintas.

### 5.2 `sc-select-button` — gap (Figma `❖ SelectButton` node 6738:46433)

- **Figma SC**: 24 variants `Select (First/Second/Third/Fourth/Multiple) × OptionAmount (2/3/4) × Multiple (true/false) × Invalid (true/false)`.
- **PrimeNG**: `<p-selectbutton>` (componente distinto a `<p-select>`).
- **Composición**: el `❖ SelectButton` Figma **NO** referencia `❖ Button` — son nodes independientes. Si en algún momento el equipo de diseño vincula los 2 en el Kit, este wrapper hereda automáticamente.
- **Estado**: sin uso en AED hoy. Caso típico: filtros segmented horizontal ("Todos / Activos / Archivados"), choice radio visual.
- **Cuándo crear**: primer filtro segmented real en AED.

### 5.3 `sc-tag` — gap (Figma `❖ Tag` node 6738:55116)

- **Figma SC**: 4 variants `Basic / Severity (Primary/Secondary/Success/Info/Warn/Danger/Contrast) / Pill / Icon`. NO removible, fondo lleno de color (vs `❖ Chip` que es outline + removible).
- **PrimeNG**: `<p-tag>`.
- **Relación con sc-label-chip**: NO confundir. `sc-label-chip` cumple el rol del **Chip** Figma (outline, removible, categórico). `sc-tag` sería un componente nuevo para etiquetar contenido (estado de un ticket, severity de una alerta) — semántica distinta.
- **Cuándo crear**: primer caso de tag visual en AED (severity de algo, estado lleno color).

### 5.5 `sc-search` — componente nuevo (Session 31, Figma `❖ Search` node 11861:55210)

- **Estado**: ✅ creado en Session 31 + spec doc 14-search.md + gallery
  `/components/search` en ds-docs + 7 consumers reales migrados (5 list-pages
  toolbars + 2 picker-search en agent-form). Tipo `extended` en el tracker.
- **Composición**: `<p-iconfield iconPosition="left">` + `<p-inputicon>` +
  `<input pInputText type="search">` + clear button (×) + opcional kbd hint
  (⌘K, /). El componente añade chrome funcional encima del IconField nativo
  PrimeNG (clear automático cuando hay value, focus API pública).
- **Por qué NO se usa `<p-inputgroup>` aquí**: IconField es overlay
  decorativo dentro del input (correcto para search). InputGroup es addon
  con border merge (para botones de acción). Semánticas distintas — no
  intercambiables.
- **Figma**: página `❖ Search` (node 11861:55210) creada por Rafa al cierre
  de Session 31, pendiente de que el equipo compongan los variants (Size
  sm/md/lg × HasHint × Filled × Disabled). El spec doc 14-search.md tiene
  la receta detallada.

### 5.4 Reclasificación: `sc-checkbox` (Session 31)

- **No es gap** (el componente existe), pero estaba mal etiquetado.
- **Auditoría confirmó**: NO importa `primeng/*`, usa `<input type="checkbox">` nativo + CSS custom para los 3 estados. Es **pure-sc**, no extended.
- **Acción**: tracker `apps/ds-docs/src/app/pages/home/home.component.ts` actualizado en commit `3a54db6`. Sin impacto runtime.

### 5.6 `sc-toggle-button` — gap (Figma `❖ ToggleButton` node 6738:46435)

- **Figma SC**: button con estado pressed/unpressed. Diferente de `❖ ToggleSwitch` (que es el switch-style; ese ya está cubierto por `<sc-toggleswitch>`).
- **PrimeNG**: `<p-togglebutton>`.
- **Cuándo crear**: primer caso real en AED — segmented toggle de un single estado (ej. "Mostrar solo activos" si fuese button con press state vs un toggle switch). No hay caso hoy.

### 5.8 `--sc-font-family-mono` — primitive nuevo SC (Session 46)

- **Tipo de divergencia**: token primitivo añadido al catálogo SC; PrimeNG/Aura **NO expone** equivalente (`--p-font-family-*` no incluye monospace).
- **Razón concreta**: time labels del player Memory (single + multi-rec) + gate input "CONFIRMAR" del retranscription modal usan tabular monospace. Hasta S46 cada consumer hardcodeaba `ui-monospace, monospace` como fallback inline — desalineación garantizada.
- **Valor**: system mono stack — `ui-monospace, 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', monospace`. No mapea a font custom; es la heurística cross-OS estándar.
- **Definición en código**: `01-primitive.css:208` (junto a `--sc-font-family-primary` / `--sc-font-family-secondary`).
- **Consumers actuales**: `multi-recording-player.component.scss` (time + label-meta) + `retranscription-confirm-modal.component.scss` (gate label + gate input) + (futuro próximo) `conversation-player-modal.component.scss` single audio bar time labels (tiene `font-variant-numeric: tabular-nums` ya, pendiente alinear).
- **🟡 Pendiente Figma SC**: añadir variable `font-family-mono` a la collection Variables SC con el mismo stack. Sin export → entry "Custom" en Figma SC que designer no podrá referenciar al construir specs. **Acción Diseño**: importar token vía plugin Variables Importer cuando toque resync.
- **✅ Decisión Rafa S46 (Opción A)**: mantener system stack (no adoptar fuente mono custom como JetBrains/IBM Plex/Geist). Razón: cero webfont weight, look nativo cada OS, los usos (time labels, gate input "CONFIRMAR", ID labels) son contextos invisible-a-ojo donde la diferencia entre system mono y custom no aporta valor de marca. Reabrir si surge razón concreta (branding tech-fuerte / consistencia con doc pública).
- **Cuándo borrar**: nunca (es primitive permanente). Si el equipo de diseño decide custom font, solo cambia el valor del primitive — los consumers no se enteran.

### 5.7 Refactors de consistencia Session 32 (pure-sc → Extended)

- **No son divergencias** — al revés, son **alineaciones con PrimeNG** que reducen el custom innecesario. Se documentan aquí como reseña para Memory / futuros contributors:
  - `sc-toggleswitch`: era CSS sobre `<input type="checkbox">`; ahora wrapper de `<p-toggleswitch>`. Misma API pública, 21 consumers AED no se enteraron.
  - `sc-bulk-edit-menu`: internamente usa `<sc-select>` × 2 (era `<select>` HTML nativo).
- **Declines documentados**: `inline-rename-cell` y `label-chip` evaluados en S32 — declinados con justificación (ver `docs/inconsistencies-backlog.md` items #2 y #4). El `<sc-inputtext>` rompería la metáfora "flat cell" de rename-cell; el modelo `LabelColor` de label-chip no encaja con `<p-tag>` ni `<p-chip>`.
- **Política**: post-S32, prioridad clara — **minimizar custom sobre PrimeNG** (memoria `feedback_minimal_customization`). Antes de cualquier nuevo pure-sc, las 4 preguntas del checklist §0 son obligatorias.

---

## Cómo añadir una divergencia nueva a este catálogo

1. Detéctala en un audit (memory `feedback_figma_specs_thorough.md`).
2. Decide con el usuario: ¿se documenta como divergencia intencionada o se alinea a Figma?
3. Si divergencia → añadir entry aquí + en el spec doc del componente afectado (sección "Divergencias documentadas").
4. Si alineación → arreglar el código + bump del Figma parity en `MIGRATION-INVENTORY.md`.

---

## Para Memory cuando consuma SCDS tokens (Camino B, Fase 4)

Las divergencias del catálogo **NO** se transmiten automáticamente a Memory. Memory hereda
los tokens (`--sc-color-*`, `--sc-spacing-*`, etc.) pero su capa de componentes (React +
Radix UI) tiene que decidir conscientemente cuál usar.

Recomendación cuando se active la Fase 4:

- Brand colors (Primary navy / Info electric-blue / Warn amber): Memory consume vía
  `--sc-color-*` → ya queda alineado automáticamente.
- Component extensions (toast undo button, modal stacking, checkbox tri-state): Memory
  implementa equivalentes en React si los necesita. No es responsabilidad de SCDS forzar
  el patrón.
- Component overloads (severity='secondary'→violet): Memory decide en su propia API si
  expone el slot violet o no. Spec doc 10-toast.md tiene la receta.

---

Última actualización: 2026-05-15 (Session 31).
