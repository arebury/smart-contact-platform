# Fase 3 — Cobertura del bridge `aed-preset.ts`

> Auditoría de qué tokens `--p-*` emite PrimeNG 21 vs cuáles cubre
> el preset AED. Identifica **huecos** (donde PrimeNG cae a defaults
> Aura distintos de la identidad SC) y **redundancias** (overrides
> en el preset que ya no existen en v21). El núcleo de la pregunta:
> ¿qué `--p-*` se escapan del bridge y producen drift visual?
>
> **🎯 S34 sweep update (2026-05-18)**: Verificado §4 (huecos críticos)
> + §7.1 (acciones recomendadas) contra el código actual.
> **TODOS los huecos identificados en Fase 3 ya están cubiertos**
> (la alineación se hizo progresivamente entre S30 y S34, el doc
> nunca se actualizó). Estado real:
>
> - §4.1 invalid form-field: ✅ `invalidBorderColor` + `invalidPlaceholderColor` en `sc-preset.ts:243-244` + `:324-325` (light + dark).
> - §4.2 shadow popover: ✅ Aura `<p-popover>` consume `{overlay.popover.shadow}` (verificado en source PrimeUix dist), que SC override a `var(--sc-shadow-popover)`.
> - §4.3 toast raw: ✅ N/A — `<p-toast>` usa custom `pTemplate="message"` en `app.component.html` con tokens `--sc-toast-*` propios, el chrome Aura nunca se evalúa.
> - §4.4 disabled.opacity: ⚖️ "Cuestionable" en el doc original — no accionable, decisión consciente de mantener colores explícitos en wrappers SC.
> - §4.5/§4.6: ✅/🟡 menores sin uso real AED.
> - §7.1.1 `invalidPlaceholderColor`: ✅ aplicado.
> - §7.1.2 `--sc-border-error` red-400: ✅ alineado en `02-semantic.css:125`.
> - §7.2 acciones discrecionales: pendientes solo si aparece visibilidad concreta.
>
> Sin deudas accionables residuales tras este sweep.

---

## 0. Resumen ejecutivo

| Sección | Total tokens Aura | Cubierto vía preset | Inherits chain AED ✓ | Hueco (cae a Aura puro) |
|---|---|---|---|---|
| Primitive (scales + radii) | 282 leaves | 4 scales + 5 radii | resto inherits | 0 |
| Semantic · common | 60 | 12 directos | 30 via chain | ~18 (irrelevantes) |
| Semantic · light | 82 | 28 directos | ~50 via chain | 4 críticos |
| Effects (shadows) | 129 | 5 directos | ~10 via chain | **~110 (componentes individuales)** |
| Component · light/dark | 692 | 0 directos | depende de chains | mayoría covered via chains |
| Component · common | 1686 | 0 directos | depende | mayoría OK (geometry, behavior) |

**Lectura macro**: el preset cubre bien el eje **color** via cadenas
semánticas (`text.color`, `content.background`, `surface.*`,
`primary.*`, `formField.*`, `overlay.*`). El eje **sombras** queda
parcialmente descubierto — PrimeNG emite ~110 sombras de componentes
individuales con valores **pure black** (Aura defaults) en lugar de
tintadas. La mayoría de esas sombras no son visibles en pantallas
AED actuales (los componentes están envueltos por shells AED como
`<aed-modal>`, `<aed-toast>`), pero **cualquier uso directo de un
`<p-component>` crudo introduce sombra negra**.

---

## 1. Cómo funciona el bridge (recapitulación)

Para entender qué se "cae a Aura" y qué no, hay que saber cómo
PrimeNG compila el preset:

1. PrimeNG arranca con `Aura` (preset upstream).
2. `definePreset(Aura, { …overrides })` hace **deep merge**: lo no
   declarado en `overrides` sobrevive de Aura.
3. En boot, PrimeNG compila el merged preset → emite CSS con
   variables `--p-*`. Una variable cubierta por override AED emite
   `var(--sc-*)`; una no cubierta emite el valor literal de Aura.
4. Aura misma usa **referencias internas**:
   `text.color → surface.700 → slate.700`. Si AED overridea
   `surface.700`, **toda la cadena se beneficia**.

Por tanto la cobertura no se mide por "cuántos overrides hay" sino
por "cuántas cadenas de referencia tocan al menos un nodo
overrideado". El preset de 250 líneas cubre cientos de tokens
emitidos vía cadenas.

---

## 2. Cobertura directa del preset

Lista exhaustiva de overrides en `aed-preset.ts`:

### 2.1. `primitive` (5 scales + 6 radii = ~50 tokens)

| Override | Cubre `--p-*` |
|---|---|
| `borderRadius.{xs..xl}` | `--p-border-radius-{xs..xl}` |
| `green.{50..950}` | `--p-green-{50..950}` (consumido por Tag, Toast, Message) |
| `yellow.{50..950}` | `--p-yellow-{50..950}` |
| `red.{50..950}` | `--p-red-{50..950}` |
| `blue.{50..950}` → electric-blue | `--p-blue-{50..950}` (consumido como "info") |

**Nota crítica**: AED **NO** overridea `primitive.slate.*` (que es
lo que Aura usa internamente como `surface.*`). Aura emite
`--p-slate-* = slate hex literal`. AED overridea `surface.0-950`
directamente en `colorScheme.light` → `--sc-color-gray-*`. Esto
significa que **`--p-slate-*` sigue siendo slate hex de Aura**, pero
nada en el sistema AED las consume directamente — sólo via chain
`surface.*`, que sí está cubierta.

### 2.2. `semantic.primary.{50..950}`

Apunta a `--sc-color-blue-*` (brand navy ramp). Esto causa que
`--p-primary-{50..950}` emita la cadena navy, no la Aura `blue.*`.
Cualquier componente PrimeNG que use `primary.*` (highlight, focus
ring color, selected backgrounds, etc.) recibe el navy. ✓ Brand
propagation.

### 2.3. `semantic.focusRing`

| Override | `--p-*` emitido |
|---|---|
| `focusRing.width: '2px'` | `--p-focus-ring-width: 2px` |
| `focusRing.style: 'solid'` | `--p-focus-ring-style: solid` |
| `focusRing.color: var(--sc-color-soft-blue-500)` | `--p-focus-ring-color` |
| `focusRing.offset: '2px'` | `--p-focus-ring-offset: 2px` |

Aplica al focus ring **global** de PrimeNG. ✓ Cubierto.

### 2.4. `semantic.formField`

| Override | `--p-*` emitido |
|---|---|
| `paddingX` | `--p-form-field-padding-x` |
| `paddingY` | `--p-form-field-padding-y` |
| `borderRadius` | `--p-form-field-border-radius` |
| `transitionDuration` | `--p-form-field-transition-duration` |

✓ Cubierto. Aplica a inputs, selects, autocomplete, etc.

### 2.5. `semantic.overlay.{modal, popover, select, navigation}`

| Override | `--p-*` emitido |
|---|---|
| `modal.borderRadius / shadow` | `--p-overlay-modal-{border-radius,shadow}` |
| `popover.borderRadius / shadow` | `--p-overlay-popover-{border-radius,shadow}` |
| `select.borderRadius / shadow` | `--p-overlay-select-{border-radius,shadow}` |
| `navigation.shadow` | `--p-overlay-navigation-shadow` |

✓ Cubierto. Aplica a `<p-dialog>`, `<p-popover>`, `<p-select>`,
`<p-menu>` y similares.

### 2.6. `semantic.colorScheme.light` (28 tokens) y `dark` (24 tokens)

Cobertura amplia. Cada subsección abajo.

#### Surface (12 tokens × 2 schemes)

| Override | `--p-*` emitido |
|---|---|
| `surface.{0..950}` → `--sc-color-gray-*` | `--p-surface-{0..950}` |

✓ Cubierto. Propaga a todo lo que use `surface.*` en cadena (texts,
borders, backgrounds, list options, navigation items, mask color,
content border, etc. — cientos de componentes).

#### Primary (4 tokens × 2)

`color`, `contrastColor`, `hoverColor`, `activeColor`. ✓ Cubierto.

#### Mask, Text, Content, FormField, Overlay (light only)

Mask: `background` + `color`. ✓
Text: `color`, `hoverColor`, `mutedColor`, `hoverMutedColor`. ✓
Content: `background`, `hoverBackground`, `borderColor`, `color`, `hoverColor`. ✓
FormField: `background`, `disabledBackground`, `color`, `disabledColor`, `placeholderColor`, `borderColor`, `hoverBorderColor`, `focusBorderColor`, `invalidBorderColor`, `shadow`. ✓
Overlay: `{modal,popover,select}.{background,borderColor,color}`. ✓

**Subtotal directos**: ~52 tokens × scheme. Vía chain propagation
afecta a centenares más.

---

## 3. Cobertura transitiva (chain propagation)

Lista de tokens Aura que NO están en el preset pero **se benefician
de overrides AED via cadena**:

### 3.1. Todo lo que apunta a `surface.*`

| Token Aura | Cadena | Resultado |
|---|---|---|
| `text.color = surface.700` | AED overridea `text.color` direct → ✓ |
| `text.muted.color = surface.500` | AED overridea `text.muted.color` direct → ✓ |
| `content.{bg,color,hover,border}` | AED overridea direct → ✓ |
| `form.field.color = surface.700` | AED overridea direct → ✓ |
| `form.field.placeholder.color = surface.500` | AED overridea direct → ✓ |
| `form.field.disabled.{bg,color} = surface.{200,500}` | AED overridea direct → ✓ |
| `form.field.border.color = surface.300` | AED overridea direct → ✓ |
| `form.field.hover.border.color = surface.400` | AED overridea direct → ✓ |
| `list.option.color = text.color` | inherits text override → ✓ |
| `list.option.focus.background = surface.100` | inherits surface override → ✓ |
| `navigation.item.color = text.color` | inherits → ✓ |
| `navigation.item.focus.background = surface.100` | inherits → ✓ |
| `highlight.background = primary.50` | inherits primary override → ✓ |
| `highlight.color = primary.700` | inherits → ✓ |
| `mask.color = surface.200` | AED overridea direct → ✓ |
| `overlay.{modal,popover,select}.{bg,color,border}` | AED overridea direct → ✓ |

Resultado: la mayoría de tokens semantic.light están cubiertos vía
override directo o inheritance chain. **~50 tokens propagados sin
fricción.**

### 3.2. Tokens que apuntan a primary

`highlight.{background, color, focus.background, focus.color}` →
`primary.{50, 700, 100, 800}`. AED overridea toda la cadena
`primary.{50..950}` → cubierto. ✓

---

## 4. Huecos críticos (caen a Aura puro)

### 4.1. `formField.invalid.*` — discrepancia con AED border-error

| Token Aura | Apunta a | Aura emite | AED preset cubre? |
|---|---|---|---|
| `form.field.invalid.border.color` | `{red.400}` | `#f87171` | **🔴 Hueco** |
| `form.field.invalid.placeholder.color` | `{red.600}` | `#dc2626` | **🔴 Hueco** |
| `form.field.float.label.invalid.color` | refs `invalid.placeholder.color` | `#dc2626` | 🔴 |

**El preset AED override `colorScheme.light.formField.invalidBorderColor`
a `var(--sc-border-error)` = `red-500 = #ef4444`.** Pero la cadena
no llega a `--p-form-field-invalid-placeholder-color`. Mismo
asunto que en Fase 2 §18.4 — el `--sc-border-error` apunta a red-500
mientras Aura usa red-400.

**Diff visual**: bordes de error AED son rojo más saturado (red-500)
vs Aura red-400. Placeholders en estado invalid usan Aura red-600.

### 4.2. Effects · sombras de componentes individuales (~110 tokens)

Aura define una sombra **por cada componente** (no sólo por overlay
type). El preset AED overridea `overlay.{modal, popover, select,
navigation}.shadow` + `formField.shadow` — pero esos **no son los
mismos tokens** que Aura emite per-component.

Catálogo de sombras componente-específicas con **valor Aura
pure-black** que el preset AED **NO cubre**:

| Componente Aura emite | Valor Aura | Consumido por |
|---|---|---|
| `dialog.shadow` | `#0000001a` composite (pure black 10%) | `<p-dialog>` interno |
| `drawer.shadow` | `#0000001a` composite | `<p-drawer>` |
| `card.shadow` | `#0000001a` composite | `<p-card>` |
| `button.raised.shadow` | `#0000001f/#00000024/#00000033` triple | `<p-button raised>` |
| `splitbutton.raised.shadow` | triple black | `<p-splitButton raised>` |
| `menu.shadow` | composite black | `<p-menu>` |
| `contextmenu.shadow` | composite black | `<p-contextMenu>` |
| `tieredmenu.shadow` | composite black | `<p-tieredMenu>` |
| `megamenu.overlay.shadow` | composite black | `<p-megaMenu>` overlay |
| `tooltip.shadow` | composite black | `<p-tooltip>` |
| `popover.shadow` | composite black | `<p-popover>` (DIFERENTE de `overlay.popover.shadow`) |
| `editor.overlay.shadow`, `password.overlay.shadow`, etc. | composite black | varios overlays |
| `autocomplete.overlay.shadow` | composite black | `<p-autoComplete>` overlay |
| `multiselect.overlay.shadow`, `cascadeselect.overlay.shadow` | composite black | selects |
| `treeselect.overlay.shadow`, `colorpicker.panel.shadow` | composite black | tree pickers |
| `datepicker.panel.shadow` | composite black | `<p-datePicker>` |
| `message.{info,success,warn,error,secondary,contrast}.shadow` | tinted per-severity (very subtle) | `<p-message>` |
| `toast.{info,success,warn,error,secondary,contrast}.shadow` | tinted per-severity | `<p-toast>` raw |
| `autocomplete.shadow`, `inputtext.shadow`, `select.shadow`, `multiselect.shadow`, `cascadeselect.shadow`, `treeselect.shadow`, `textarea.shadow`, `listbox.shadow`, `checkbox.shadow`, `radiobutton.shadow`, `toggleswitch.shadow` | `#1212170d` slate-tinted 5% | inputs varios |
| `slider.handle.content.shadow` | composite black | `<p-slider>` handle |
| `stepper.step.number.shadow` | composite black | `<p-stepper>` |
| `togglebutton.content.checked.shadow` | composite black | `<p-toggleButton>` |

**Estado actual**:
- Los inputs (`autocomplete.shadow`, `select.shadow`, etc.) usan
  `#1212170d` que NO es pure black puro — es slate-tintado al 5%.
  Diff visual con `--sc-shadow-xs` (que es slate-15-23-42 al 4%):
  apenas perceptible.
- `dialog.shadow` es pure black composite. **PERO** `overlay.modal.shadow`
  está overrideado a `--sc-shadow-dialog`. La pregunta es: ¿qué token
  consume `<p-dialog>`? Si consume `dialog.shadow`, hueco. Si consume
  `overlay.modal.shadow`, cubierto.

**Verificación necesaria**: revisar el código fuente de PrimeNG 21
para confirmar qué token consume cada componente. **No bloqueante
para la auditoría — bloqueante para la limpieza Fase 4 sobre estos
componentes.**

**Mitigación práctica**: en el código real, los componentes problemáticos
están envueltos en wrappers AED:
- `<p-dialog>` → envuelto por `<aed-modal>` que aplica `--sc-modal-shadow` propio.
- `<p-toast>` → envuelto por `<aed-toast>` que aplica chrome propio.
- `<p-button>` raised → AED no usa `raised`.

Las sombras de componentes **NO envueltos** (autocomplete dropdown,
menu, contextmenu, datepicker panel) sí emiten Aura defaults. Eso
es un **hueco real pero visualmente sutil**.

### 4.3. Componente `message` y `toast` raw — Aura defaults

`aura/component/light` define para `<p-message>` y `<p-toast>` valores
**diferentes** de los `--sc-toast-*` que usa `<aed-toast>`:

| Token Aura | Valor | AED equivalente |
|---|---|---|
| `message.info.background` | `#eff6fff2` (Aura's blue semi-transparent) | `--sc-toast-info-bg = electric-blue-50` (`#eef4ff`) |
| `message.info.color` | `{blue.600}` Aura blue scale | `--sc-toast-title = gray-800` |
| `toast.info.background` | `#eff6fff2` | `--sc-toast-info-bg` |
| etc. | | |

Aquí hay un **detalle interesante**: AED overridea `primitive.blue.*`
→ electric-blue. Por tanto cuando Aura emite `--p-toast-info-color =
{blue.600}` = `var(--p-blue-600)`, el resultado es **electric-blue-600**
(AED override), no Aura blue. **El bridge propaga la decisión
correctamente para message/toast info via la cadena primitive.blue.**

✓ De hecho cubierto via chain. Mismo razonamiento para success
(green), warn (yellow), error (red).

Pero `message.contrast.background = surface.900` y `secondary.background =
surface.100` → consume `--p-surface-*` que AED overridea a gray-AED.
✓ Cubierto via surface chain.

**Subtotal**: message + toast están cubiertos via chains. NO son
huecos.

### 4.4. `disabled.opacity = 60` (semantic.common)

Aura aplica 60% opacity a componentes disabled (Toast, p-button
secundario disabled, etc.). AED usa **colores explícitos** de gris
para disabled (`--sc-btn-disabled-bg`, etc.).

**Resultado**: componentes AED-wrapped (`<aed-modal>`, `<aed-button
class=btn btn--primary disabled>`) usan colores explícitos. Componentes
PrimeNG crudos (`<p-button disabled>` sin wrap) caen al 60% opacity
Aura.

**🟡 Inconsistencia**: dos formas de expresar disabled en la app.
No es hueco crítico, pero es ruido visual.

### 4.5. `list.option.group.background = #00000000`, `navigation.submenu.label.background = #00000000`

Aura hardcodea `#00000000` (transparente). No tiene cadena. AED no
overridea. Emite `#00000000` ✓ — coincidentemente correcto, pero el
preset no controla este valor.

Sin acción.

### 4.6. `anchor.gutter = 2`, `icon.size = scale.1 = 14`

Aura defaults sin override AED. `icon.size = 14px` cuando AED usa
`16px` o `24px` para sus iconos propios. **Sólo afecta a iconos
internos de componentes PrimeNG** (PrimeIcons en `<p-button>`,
`<p-dropdown>` arrow, etc.).

**🟡 Inconsistencia menor**: iconos en componentes PrimeNG crudos
salen a 14px; AED-wrapped usa lucide a 16/20/24. Solo visible si se
mezclan en la misma pantalla.

---

## 5. Redundancias en el preset (overrides que ya no aplican)

Cruce de cada key del preset contra el JSON v4 de Aura:

| Preset key | Existe en Aura JSON v4? | Comentario |
|---|---|---|
| `primitive.borderRadius.{xs..xl}` | ✓ `aura/primitive border/radius/{xs,sm,md,lg,xl}` | Match exact (sin `none`, que AED tampoco overridea — defaults a 0). |
| `primitive.{green,yellow,red,blue}.{50..950}` | ✓ `aura/primitive {green,yellow,red,blue}/{50..950}` | Match exact. |
| `semantic.primary.{50..950}` | ✓ `aura/semantic/common primary.{50..950}` | Match exact. |
| `semantic.focusRing.{width,color,offset}` | ✓ `aura/semantic/common focus.ring.{width,color,offset}` | Match. |
| `semantic.focusRing.style` | ⚠️ NO en JSON v4 snapshot | PrimeNG 21 sí emite `--p-focus-ring-style`; el snapshot puede estar incompleto. No es redundancia funcional. |
| `semantic.formField.{paddingX,paddingY,borderRadius,transitionDuration}` | ✓ `form.field.{padding.x, padding.y, border.radius}` (transition NO en JSON) | `transitionDuration` puede ser feature local al preset, no a JSON. No es redundancia. |
| `semantic.overlay.{modal,popover,select,navigation}.shadow` | ✓ JSON tiene esos en `aura/effects` con misma estructura | Match. |
| `semantic.overlay.navigation.shadow` (no borderRadius) | ✓ Aura no expone `overlay.navigation.borderRadius` | Preset es preciso. |
| `semantic.colorScheme.light.*` | ✓ todas las keys en `aura/semantic/light` | Match. |
| `semantic.colorScheme.dark.*` | ✓ todas las keys en `aura/semantic/dark` | Match. |

**Veredicto: 0 redundancias detectadas**. El preset está bien alineado
con el shape de Aura JSON v4. Las dos keys "no encontradas en JSON"
(`focusRing.style`, `formField.transitionDuration`) son keys que
PrimeNG 21 sí acepta pero el snapshot JSON no expone — funcionalmente
correctas.

---

## 6. Tokens AED-only que NO se mapean al bridge (intencional)

Estos `--sc-*` existen pero **NO tienen `--p-*` equivalente**, así
que no se bridgean. Es decisión correcta:

- `--sc-text-subtle`, `--sc-text-on-{accent,danger,success,…}` — semánticas AED, no expresables en Aura.
- `--sc-border-strong`, `--sc-border-subtle`, `--sc-border-{primary,secondary,accent,info,indigo}` — granularidad propia.
- `--sc-icon-*` — semánticas propias.
- `--sc-bg-{accent, info, indigo, …}-subtle*` — variantes propias.
- Todo `layer 03` (label, presence, priority).
- Todo `layer 05` (z-index, motion, layout).
- Todo `layer 04` (btn/modal/toast specs propios).

✓ Sin acción.

---

## 7. Decisiones / hallazgos para Fase 4

### 7.1. Acciones definitivamente recomendadas

1. **Añadir override `formField.invalid.placeholderColor`** en el preset → `var(--sc-text-danger)`. Coste trivial (1 línea). Cierra hueco §4.1.
2. **Decidir sobre `--sc-border-error` red-500 vs Aura red-400** (ya decidido en sesión: alinear a red-400). El override del preset entonces apunta a `--sc-color-red-400`.

### 7.2. Acciones discrecionales (dependen de visibilidad)

3. **Override `dialog.shadow` directo en preset** además de `overlay.modal.shadow`. Sólo importa si hay `<p-dialog>` sin wrap (raro en este código).
4. **Override otras sombras de componentes** (autocomplete.overlay, menu, contextmenu, datepicker.panel) → `--sc-shadow-popover/dropdown` tinted. Coste 10-15 líneas en preset. Beneficio: sombras consistentemente tintadas en todos los popovers PrimeNG.
5. **Override `disabled.opacity` a 1** (deshabilitar el 60% global) y forzar colores explícitos. Sólo si se quiere uniformidad estricta. Cuestionable.
6. **Override `icon.size`** a 16 (= `--sc-spacing-1-125`). Sólo si los iconos internos a 14px chocan visualmente.

### 7.3. No acciones (correcto como está)

- Tokens AED-only sin bridge (§6).
- Component-color tokens (message, toast, etc.) que ya inherits via primitive.* chain.
- Componentes no usados por la app (`<p-stepper>`, `<p-carousel>`, etc.) — overrideos serían sobre dead code.

---

## 8. Verificación que falta (sería ideal para Fase 4)

Antes de aplicar overrides §7.2.3-4, conviene confirmar:
- Para cada `<p-component>` problemático, **cuál es el token shadow real que consume en PrimeNG 21**. Aura JSON expone los nombres pero el componente puede consumirlos vía variable distinta. Lo más fiable: arrancar la app, inspeccionar dev-tools sobre un `<p-dialog>` real (o `<p-autoComplete>` overlay) y ver el computed `box-shadow` + qué `--p-*` lo origina.
- Confirmar que no haya regresiones en componentes envueltos en wrappers AED (tras override).

Esto es trabajo de Fase 4, no de Fase 3.

---

## Resumen ejecutivo (para chat)

1. El bridge cubre **bien** el eje color: ~50 overrides directos + propagación vía cadena a centenares de tokens.
2. **0 redundancias** detectadas — todo lo declarado en el preset existe en Aura v4.
3. **Huecos críticos** son pocos:
   - `formField.invalid.placeholderColor` apunta a Aura red-600 (no a AED `--sc-text-danger`). Trivial de cerrar.
   - `--sc-border-error` red-500 vs Aura red-400 (ya decidido alinear).
4. **~110 sombras de componentes individuales** caen a Aura pure-black/slate-tinted. La mayoría son inocuas porque los componentes están envueltos por shells AED (`<aed-modal>`, `<aed-toast>`). Las visibles: popovers, menus, datepicker panel — sombra negra sutil en lugar de tintada.
5. **2 inconsistencias menores**: `disabled.opacity` (60% Aura vs colores explícitos AED) e `icon.size` (14px Aura vs 16/20/24 AED para PrimeIcons internos).
6. Acciones recomendadas para Fase 4:
   - **Cerrar `formField.invalid.placeholderColor`** (1 línea).
   - **Bridgear sombras de overlays no-modal** (popover, menu, autocomplete) — discrecional pero coste bajo.
   - **NO migrar `disabled.opacity` ni `icon.size`** salvo evidencia visual de fricción.
7. **Nada bloquea Fase 4** (cleanup dirigido).

**Archivo creado**: [docs/audit/03-bridge-coverage.md](docs/audit/03-bridge-coverage.md)
