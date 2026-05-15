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

---

## 1. Brand colors

### 1.1 Primary navy (todo el sistema)

| Componente | Figma | SC | Mapping en código |
|------------|-------|-----|-------------------|
| Button `severity=primary` | `#3b82f6` (azure-500) | `#344a70` (navy-500) | `sc-preset.semantic.primary.color = --sc-bg-primary` (líneas 147-158) |
| Tabs `active` | azure | navy | `components.tabs` inherits `primary.color` |
| Select / Datepicker / Input / MultiSelect `focus border` | azure | navy | `formField.focusBorderColor = --sc-bg-primary` |
| Checkbox `checked` (bg + border) | azure | navy | `sc-tri-state-checkbox.scss` checked state `--sc-bg-primary` |
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

### 2.2 Toast icon-square chrome

- **Figma**: el icono va "pelado" (svg sin background).
- **SC**: el icono va dentro de un cuadrado coloreado (severity-icon-bg). Glyph blanco sobre fill colored.
- **Implementación**: `.sc-toast__icon` block en el partial — `width/height` = `--sc-toast-icon-size`, `background` per severity via descendant selectors.
- **Para qué**: peso visual + glyph invertido (white-on-color) lee más limpio que glyph severity-color sobre background semi-transparente.

### 2.3 Checkbox indeterminate state ('some')

- **Figma**: el checkbox modela Selected=True/False (binary). NO hay variant para indeterminate.
- **SC**: añadimos un tercer state `'some'` para el patrón "select all" del header de tabla con selección parcial.
- **Visual**: mismo bg/border que `'all'` (checked, navy primary) + barra horizontal blanca en lugar del ✓.
- **Implementación**: `tri-state-checkbox.scss` `.tri-checkbox__input:indeterminate + .tri-checkbox__box` rules. Width de la barra escala con size (8 / 10 / 12 raw px).
- **Para qué**: bulk-select de tablas (header row marca todo / nada / mixto según children).

### 2.4 Modal body slot stacking

- **Figma**: el body es un free slot sin layout opinionado.
- **SC**: el body es `display: flex; flex-direction: column; gap: var(--sc-spacing-300)` por defecto. Los hijos directos quedan apilados con gap 16px automático.
- **Implementación**: `sc-modal.scss` `.sc-modal__body` block.
- **Para qué**: el caso 95% de uso del modal en AED es forms verticales (2-5 inputs). Sin gap por defecto, cada consumer reinventaba un wrapper. Ahora `<sc-input>`, `<sc-select>` etc. proyectados directamente quedan separados.

### 2.5 Modal `[bodyless]` mode

- **Figma**: el body siempre existe.
- **SC**: prop `[bodyless]="true"` colapsa el modal a header + footer pegados (sin body band visual). Para confirm dialogs donde la descripción cabe en subtitle.
- **Implementación**: `<sc-modal>` template + scss `.sc-modal--bodyless` rules.
- **Para qué**: confirm dialogs (delete, discard, leave page) son el 60% de los usos de modal en AED.

---

## 3. Component overloads (slots reusados con semántica SC)

### 3.1 Toast `severity='secondary'` → violet (no slate)

- **Figma**: `Severity=Secondary` muestra slate-100 bg / slate-600 text — un "neutral notice" gris.
- **SC**: overload — `severity='secondary'` en `MessageService.add()` mapea a **violeta** (no slate).
- **Por qué**: AED usa `severity='secondary'` para "neutral notices" tipo `Borrador creado`, `Renombrado`. El slate de Figma queda demasiado apagado para esa categoría; violet da presencia sin sentirse celebratorio (como green success) ni urgente (como info azul).
- **Implementación**: tokens `--sc-toast-violet-*` (separados de `--sc-toast-secondary-*` que también existen pero unused en AED). El selector `&[data-severity='secondary']` en el partial apunta a violet.
- **Si Marta** quiere un slate real para algún caso, se puede añadir un mapping nuevo `severity='contrast'` → slate sin afectar el violet.

---

## 4. Sizes / density (SC añade variantes off-Figma)

### 4.1 Input / Select / MultiSelect / Datepicker / Checkbox — sizes `sm` / `lg`

- **Figma**: Input + Select + MultiSelect tienen Sizes Small / Normal / Large explícitas (con decimales raw 12.25 / 14 / 15.75 font, 8.75/5.25 / 10.5/7 / 12.25/8.75 padding).
- **Datepicker / Checkbox**: Figma SOLO modela densidad Normal — no hay variants Small / Large.
- **SC añade** `sm` y `lg` por consistency family con el resto. Mismo escalado proporcional. Si Marta en algún momento define densidades específicas para datepicker o checkbox, ajustar.
- **Implementación**:
  - Input: `sc-input.scss` `--sm/--lg` con valores Figma exactos.
  - Select / MultiSelect: idem en `.p-select-label / .p-multiselect-label`.
  - Datepicker: `sc-datepicker.scss` (extiende formField via [size]).
  - Checkbox: `tri-state-checkbox.scss` `&--sm / &--lg` con 14/21 px box.

### 4.2 Sub-pixel padding (raw decimals)

- **Figma**: muchos paddings caen en 0.5/0.25 px (10.5, 7, 8.75, 5.25, 12.25, 14, 15.75, 17.5).
- **SC**: `--sc-spacing-*` scale es entera (4, 8, 12, 16, 24, 32…). NO añadimos tokens decimales para evitar inflar la API.
- **Solución**: los valores raw px se escriben directamente en el SCSS (sin token) cuando el Figma así lo manda. Comentados con "raw decimal (off-scale)". Aplica a sc-input sizes, sc-select sizes, sc-multi-select sizes, sc-checkbox sizes, formField.paddingX/Y, dialog padding 17.5, tabs padding 14/15.75, tooltip padding 10.5/7.

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

Última actualización: 2026-05-15 (Session 30).
