# Fase 2 — Validación `--sc-*` contra Aura

> Audit token-por-token de las 7 capas `--sc-*` contra el snapshot
> oficial de Aura (`src/assets/tokens/design-tokens.json` v4).
> Clasificación por divergencia, no propuestas. Las decisiones se
> toman en Fase 3 / 4.

**Leyenda**:
- ✅ Idéntico a Aura.
- 🟡 Cercano (diferencia mínima, probablemente accidental).
- 🟠 Divergente intencionado (matchea GUIA / DD / brand decision).
- 🔴 Divergente sin justificación documentada.
- ⚪ Sin equivalente Aura (extensión propia AED).

---

## 0. Resumen ejecutivo

| Categoría | ✅ | 🟡 | 🟠 | 🔴 | ⚪ | Total |
|---|---|---|---|---|---|---|
| Color · Brand (blue navy) | 0 | 0 | 11 | 0 | 0 | 11 |
| Color · Accent (soft-blue) | 0 | 0 | 11 | 0 | 0 | 11 |
| Color · Gray (neutrals) | 0 | 12 | 0 | 0 | 1 | 13 |
| Color · Green | 10 | 1 | 0 | 0 | 0 | 11 |
| Color · Yellow (= Aura amber) | 11 | 0 | 0 | 0 | 0 | 11 |
| Color · Red | 11 | 0 | 0 | 0 | 0 | 11 |
| Color · Electric-blue (info) | 0 | 0 | 11 | 0 | 0 | 11 |
| Color · Indigo (= ~Aura purple) | 0 | 0 | 11 | 0 | 0 | 11 |
| Tipografía | 0 | 0 | 17 | 0 | 0 | 17 |
| Spacing | 0 | 0 | 13 | 0 | 0 | 13 |
| Radii | 5 | 0 | 2 | 1 | 1 | 9 |
| Semantic · primary | 0 | 0 | 4 | 0 | 0 | 4 |
| Semantic · text/bg/border/icon | 0 | 4 | ~30 | 2 | 0 | ~36 |
| Semantic · formField | 0 | 0 | 4 | 2 | 0 | 6 |
| Semantic · overlay | 0 | 0 | 1 | 2 | 0 | 3 |
| Effects · focus ring | 1 | 0 | 2 | 0 | 0 | 3 |
| Effects · shadows | 0 | 0 | 0 | 0 | 7 | 7 |
| Component layer (btn/modal/toast) | 0 | 0 | ~45 | 0 | 5 | ~50 |
| Palette layer (label/presence/priority) | 0 | 0 | 8 | 4 | 28 | ~40 |
| Extensions layer | 0 | 0 | 0 | 0 | ~30 | ~30 |

**Lectura macro**: la mayoría de los `--sc-*` que tienen contraparte
en Aura son 🟠 divergencias intencionadas con justificación
documentada (brand navy, padding más generoso, sombras tintadas,
focus cyan en vez de primary). Las pocas 🔴 son detalles menores
y nominales (overlay radii, naming "indigo"/"yellow"). El núcleo
del sistema está sano.

---

## 1. Capa primitiva — Color

### 1.1. Blue scale (brand navy)

Aura `blue` es **sky-blue saturado** (`#3b82f6` at 500). AED `blue`
es un **navy desaturado custom** — escala completamente distinta.
DD#49 documenta la decisión: la primaria de AED es navy, no la
blue de Aura. Coherente con GUIA.

| Step | AED `--sc-color-blue-*` | Aura `blue.*` | Aura `slate.*` (más cercano) | Status |
|---|---|---|---|---|
| 50 | `#edf0f5` | `#eff6ff` | `#f8fafc` | 🟠 |
| 100 | `#d2d9e3` | `#dbeafe` | `#f1f5f9` | 🟠 |
| 200 | `#a6b4c7` | `#bfdbfe` | `#e2e8f0` | 🟠 |
| 300 | `#798eab` | `#93c5fd` | `#cbd5e1` | 🟠 |
| 400 | `#4d6990` | `#60a5fa` | `#94a3b8` | 🟠 |
| 500 | `#344a70` | `#3b82f6` | `#64748b` | 🟠 |
| 600 | `#243452` | `#2563eb` | `#475569` | 🟠 |
| **700** | **`#1b273d`** ← brand | `#1d4ed8` | `#334155` | 🟠 |
| 800 | `#131b2b` | `#1e40af` | `#1e293b` | 🟠 |
| 900 | `#0b1019` | `#1e3a8a` | `#0f172a` | 🟠 |
| 950 | `#05080d` | `#172554` | `#020617` | 🟠 |

**Justificación documentada**: GUIA L34 declara `#1B273D` como
brand primary; DD#49 explica la decisión. ✅ Justificado.

### 1.2. Soft-blue scale (accent / cyan)

AED `soft-blue` es un cyan brand-specific, más lavado y agua-marino
que el `cyan` de Aura.

| Step | AED `--sc-color-soft-blue-*` | Aura `cyan.*` | Status |
|---|---|---|---|
| 50 | `#effbfc` | `#ecfeff` | 🟠 |
| 100 | `#d2f4f8` | `#cffafe` | 🟠 |
| 200 | `#a6e9f2` | `#a5f3fc` | 🟠 |
| 300 | `#7edfeb` | `#67e8f9` | 🟠 |
| 400 | `#6bd9e9` | `#22d3ee` | 🟠 |
| **500** | **`#5ad3e6`** ← accent | `#06b6d4` | 🟠 |
| 600 | `#48b8c9` | `#0891b2` | 🟠 |
| 700 | `#328a99` | `#0e7490` | 🟠 |
| 800 | `#246b78` | `#155e75` | 🟠 |
| 900 | `#1a4d57` | `#164e63` | 🟠 |
| 950 | `#0d262b` | `#083344` | 🟠 |

**Justificación**: `--sc-border-focus = soft-blue-500` (focus ring
cyan), `--sc-icon-link` y `--sc-text-link` también soft-blue. Es
el segundo color de marca. Coherente. ✅ Justificado.

### 1.3. Gray scale (neutrals)

> **🎯 S34 update — DEUDA YA CERRADA**: la tabla original (12 pasos 🟡
> "cercano accidental" vs Aura slate) fue resuelta en una fase posterior
> (probable Fase 4 cleanup S30): `01-primitive.css` líneas 48-59 hoy
> matcheaN 1:1 con Aura slate, con comment explícito `Mirrors Aura
> 'slate' 1:1 (Tailwind slate). Previously the ramp was...`. Este
> doc Fase 2 quedó histórico sin reflejar la alineación.
>
> Verificación S34 (snapshot post-alineación):

| Step | AED `--sc-color-gray-*` actual | Aura `slate.*` | Status |
|---|---|---|---|
| 0 | `#ffffff` | (no step 0) | ⚪ AED-only (white) |
| 50 | `#f8fafc` | `#f8fafc` | ✅ |
| 100 | `#f1f5f9` | `#f1f5f9` | ✅ |
| 200 | `#e2e8f0` | `#e2e8f0` | ✅ |
| 300 | `#cbd5e1` | `#cbd5e1` | ✅ |
| 400 | `#94a3b8` | `#94a3b8` | ✅ |
| 500 | `#64748b` | `#64748b` | ✅ |
| 600 | `#475569` | `#475569` | ✅ |
| 700 | `#334155` | `#334155` | ✅ |
| 800 | `#1e293b` | `#1e293b` | ✅ |
| 900 | `#0f172a` | `#0f172a` | ✅ |
| 950 | `#020617` | `#020617` | ✅ |

**Resultado**: 12/12 ✅ alineados con Aura slate. Cero divergence. La
nomenclatura `--sc-color-gray-*` se conserva por compat con consumers,
pero los valores son slate canonical. Sin deuda residual.

### 1.4. Green scale (success)

| Step | AED `--sc-color-green-*` | Aura `green.*` | Status |
|---|---|---|---|
| 50 | `#f0fdf4` | `#f0fdf4` | ✅ |
| 100 | `#dcfce7` | `#dcfce7` | ✅ |
| 200 | `#bbf7d0` | `#bbf7d0` | ✅ |
| 300 | `#86efac` | `#86efac` | ✅ |
| 400 | `#4ade80` | `#4ade80` | ✅ |
| 500 | `#22c55e` | `#22c55e` | ✅ |
| 600 | `#16a34a` | `#16a34a` | ✅ |
| 700 | `#15803d` | `#15803d` | ✅ |
| 800 | `#166534` | `#166534` | ✅ |
| 900 | `#14532d` | `#14532d` | ✅ |
| **950** | **`#0a2916`** | `#052e16` | 🟡 |

Sólo el paso 950 difiere (`#0a2916` vs `#052e16`). Probable drift
accidental. **Decisión pendiente** Fase 3 / 4.

### 1.5. Yellow scale (warning) — values match Aura `amber`, NOT `yellow`

⚠️ **Naming discrepancy importante**:

AED `--sc-color-yellow-*` = Aura `amber.*` (exact match, byte-for-byte).
Aura tiene su propia `yellow` scale con valores distintos.

| Step | AED `--sc-color-yellow-*` | Aura `amber.*` | Aura `yellow.*` | Status (vs amber) |
|---|---|---|---|---|
| 50 | `#fffbeb` | `#fffbeb` | `#fefce8` | ✅ |
| 100 | `#fef3c7` | `#fef3c7` | `#fef9c3` | ✅ |
| 200 | `#fde68a` | `#fde68a` | `#fef08a` | ✅ |
| 300 | `#fcd34d` | `#fcd34d` | `#fde047` | ✅ |
| 400 | `#fbbf24` | `#fbbf24` | `#facc15` | ✅ |
| 500 | `#f59e0b` | `#f59e0b` | `#eab308` | ✅ |
| 600 | `#d97706` | `#d97706` | `#ca8a04` | ✅ |
| 700 | `#b45309` | `#b45309` | `#a16207` | ✅ |
| 800 | `#92400e` | `#92400e` | `#854d0e` | ✅ |
| 900 | `#78350f` | `#78350f` | `#713f12` | ✅ |
| 950 | `#451a03` | `#451a03` | `#422006` | ✅ |

**Veredicto**: ✅ valores idénticos a Aura `amber`. 🔴 naming
("yellow" cuando es amber) sin justificación. La GUIA usa "amber"
informalmente (L43-45 `--sc-label-amber-*`) pero el primitive
layer dice "yellow". **Fricción potencial**: cuando Marta exporte
Figma con `amber/*`, no matcheará el nombre del primitive.

**Decisión pendiente**: ¿renombrar `--sc-color-yellow-*` →
`--sc-color-amber-*` para alinear semántica con Aura, o mantener
el alias?

### 1.6. Red scale (danger)

| Step | AED `--sc-color-red-*` | Aura `red.*` | Status |
|---|---|---|---|
| 50-950 (11 pasos) | match exacto | match exacto | ✅ |

✅ Idéntico a Aura. Sin discrepancias.

### 1.7. Electric-blue scale (info)

AED `electric-blue` es un blue saturado custom (`#1464fe` at 500)
que NO existe en Aura como tal. Lo más cercano serían `blue` (`#3b82f6`
at 500) o `indigo`. La decisión documentada en `aed-preset.ts:82-94`:
PrimeNG `--p-blue-*` se redirige a electric-blue para que "info"
no se confunda con brand navy.

| Step | AED `--sc-color-electric-blue-*` | Aura `blue.*` (más cercano) | Status |
|---|---|---|---|
| 50 | `#eef4ff` | `#eff6ff` | 🟠 |
| 100 | `#d5e6ff` | `#dbeafe` | 🟠 |
| 200 | `#abceff` | `#bfdbfe` | 🟠 |
| 300 | `#7db3ff` | `#93c5fd` | 🟠 |
| 400 | `#4a8fff` | `#60a5fa` | 🟠 |
| **500** | **`#1464fe`** | `#3b82f6` | 🟠 |
| 600 | `#0d4fd4` | `#2563eb` | 🟠 |
| 700 | `#0a3ba0` | `#1d4ed8` | 🟠 |
| 800 | `#07296e` | `#1e40af` | 🟠 |
| 900 | `#041840` | `#1e3a8a` | 🟠 |
| 950 | `#020c21` | `#172554` | 🟠 |

**Justificación**: comentario explícito en preset L78-94. ✅
Justificado.

### 1.8. Indigo scale — values match Aura `purple` (not `indigo`)

AED `--sc-color-indigo-*` tiene valores que matchean Aura `purple`,
no Aura `indigo`.

| Step | AED `--sc-color-indigo-*` | Aura `indigo.*` | Aura `purple.*` | Status (vs purple) |
|---|---|---|---|---|
| 50 | `#f5f0ff` | `#eef2ff` | `#faf5ff` | 🟠 |
| 100 | `#ece0ff` | `#e0e7ff` | `#f3e8ff` | 🟠 |
| 200 | `#d9bbff` | `#c7d2fe` | `#e9d5ff` | 🟠 |
| 300 | `#c48fff` | `#a5b4fc` | `#d8b4fe` | 🟠 |
| 400 | `#a44cf5` | `#818cf8` | `#c084fc` | 🟠 |
| 500 | `#8a1fe6` | `#6366f1` | `#a855f7` | 🟠 |
| 600 | `#6e18b8` | `#4f46e5` | `#9333ea` | 🟠 |
| 700 | `#52138a` | `#4338ca` | `#7e22ce` | 🟠 |
| 800 | `#390d60` | `#3730a3` | `#6b21a8` | 🟠 |
| 900 | `#210738` | `#312e81` | `#581c87` | 🟠 |
| 950 | `#11031d` | `#1e1b4b` | `#3b0764` | 🟠 |

**Veredicto valores**: 🟠 más saturados que Aura purple (más violet),
no matchean ningún Aura prefab exacto. AED tiene su propio purple-violet
ramp.

**Veredicto naming**: 🔴 mismo problema que yellow/amber — el nombre
"indigo" no corresponde al hue. La GUIA L29 referencia el label
purple, no indigo. Inconsistencia interna.

**Decisión pendiente**: ¿renombrar `--sc-color-indigo-*` →
`--sc-color-violet-*` o `--sc-color-purple-*`, o documentar el
alias?

---

## 2. Capa primitiva — Tipografía

Aura no expone primitives tipográficos en `aura/primitive`. La
escala tipográfica AED es 100% una **extensión custom** alineada
con sistema-13-pasos AED. Por tanto **17 tokens 🟠 sin equivalente
directo** pero documentados en GUIA (font-size scale + line-height
scale + 4 weights + 2 families).

| Token | AED | Aura | Status |
|---|---|---|---|
| `--sc-font-family-primary` | `Inter, …` | (no primitive) | 🟠 ⚪ |
| `--sc-font-family-secondary` | `Open Sans, …` | (no primitive) | 🟠 ⚪ |
| `--sc-font-size-50..900` (13 sizes) | 10..64 px | (no primitive) | 🟠 ⚪ |
| `--sc-line-height-50..900` (13 LHs) | 15..96 px | (no primitive) | 🟠 ⚪ |
| `--sc-font-weight-regular/medium/semibold/bold` | 400/500/600/700 | (no primitive) | 🟠 ⚪ |

Sin acción posible — Aura no es referencia para tipografía. GUIA
es la fuente de verdad.

---

## 3. Capa primitiva — Spacing

**Mismatch fundamental de sistema**: Aura usa una escala de
unidades de 14px (base = 1 rem @ 14px). AED usa escala px-direct
estilo Tailwind. Los AED steps NO mapean uno-a-uno a Aura.

| AED `--sc-spacing-*` | px | Aura `scale.*` más cercano | px |
|---|---|---|---|
| 50 | 4 | scale.0-25 | 3.5 |
| 100 | 8 | scale.0-5 | 7 |
| 150 | 10 | scale.0-75 | 10.5 |
| 200 | 12 | scale.0-875 | 12.25 |
| 250 | 14 | scale.1 | 14 |
| 300 | 16 | scale.1-143 | 16 |
| 400 | 20 | scale.1-5 | 21 |
| 500 | 24 | scale.1-75 | 24.5 |
| 600 | 32 | scale.2-25 | 31.5 |
| 700 | 40 | scale.2-75 | 38.5 |
| 800 | 48 | (no exact) | — |
| 900 | 64 | scale.4-5 | 63 |

**Veredicto**: 🟠 los 13 — toda la escala AED es divergente
intencional (decisión arquitectónica) pero los valores son
todos "cercanos por casualidad" a steps de Aura. Visualmente no
genera tensión porque la diferencia es de fracciones de px.

**Sin acción**. Documentado implícitamente en `01-primitive.css`
L162-175. Confirmar en GUIA si quieres explicitarlo.

---

## 4. Capa primitiva — Radii

AED tiene 7 + `full`. Aura tiene 5 (sin `none`, sin `full`).

| AED `--sc-radius-*` | px | Aura `border.radius.*` | px | Status |
|---|---|---|---|---|
| 0 | 0 | none | 0 | ✅ |
| 50 | 2 | xs | 2 | ✅ |
| 100 | 4 | sm | 4 | ✅ |
| 200 | 6 | md | 6 | ✅ |
| 300 | 8 | lg | 8 | ✅ |
| 400 | 12 | xl | 12 | ✅ |
| 500 | 16 | (no equivalent) | — | 🟠 ⚪ Extensión |
| full | 9999px | (no equivalent) | — | 🟠 ⚪ Extensión |

**6 de 8 son ✅ idénticos** a Aura. Los 2 extras son extensiones
deliberadas (`500: 16px` para superficies grandes / hero radii,
`full: 9999px` para pills).

---

## 5. Capa semántica — Primary

| AED | Valor | Aura equivalente | Valor | Status |
|---|---|---|---|---|
| `--sc-bg-primary` | `blue-700` (`#1b273d`) | `primary.color = blue.500` | `#3b82f6` | 🟠 |
| `--sc-bg-primary-hover` | `blue-800` (`#131b2b`) | `primary.hover.color = blue.600` | `#2563eb` | 🟠 |
| `--sc-bg-primary-active` | `blue-900` (`#0b1019`) | `primary.active.color = blue.700` | `#1d4ed8` | 🟠 |
| `--sc-text-on-primary` | `gray-0` (white) | `primary.contrast.color = #ffffff` | `#ffffff` | ✅ |

Mismo patrón (color con dos hovers más oscuros), valores
intencionalmente más oscuros porque AED arranca en navy-700, no
en blue-500. ✅ Justificado en GUIA + DD#49.

---

## 6. Capa semántica — Surface (gray)

AED `surface` (no se llama así pero conceptualmente equivale a
`--sc-bg-default/surface/elevated`) usa la escala custom gray (§1.3).
Aura `surface` usa slate.

Implicación: cualquier diff de §1.3 (gray 🟡) se propaga a estos
semánticos.

| AED | Resuelve a | Aura | Resuelve a | Status |
|---|---|---|---|---|
| `--sc-bg-default` | `gray-50` `#f7f8fa` | `surface.50 = slate.50` | `#f8fafc` | 🟡 |
| `--sc-bg-surface` | `gray-0` `#ffffff` | `surface.0 = #ffffff` | `#ffffff` | ✅ |
| `--sc-bg-elevated` | = `--sc-bg-surface` | — | — | 🟠 |
| `--sc-bg-subtle` | `blue-50` `#edf0f5` | `primary.50 = blue.50` | `#eff6ff` | 🟠 |
| `--sc-bg-disabled` | `gray-200` `#dadfe6` | `form.field.disabled.bg = surface.200 = slate.200` | `#e2e8f0` | 🟡 |

---

## 7. Capa semántica — Text / Border / Icon

Aura emite estos en su `semantic/light` apuntando a `surface.*`
(slate steps). AED apunta a `gray.*` (custom gray). El patrón
estructural es idéntico — sólo el target de la cadena difiere.

Muestra representativa (las ~30 entradas siguen el mismo patrón):

| AED | Resuelve a | Aura equivalente | Status |
|---|---|---|---|
| `--sc-text-primary` | `gray-800` | `text.color = surface.700` | 🟡 (gray-800 ≠ slate-700) |
| `--sc-text-secondary` | `gray-600` | `text.muted.color = surface.500` | 🟡 |
| `--sc-text-subtle` | `gray-400` | (no equivalent) | 🟠 ⚪ |
| `--sc-text-disabled` | `gray-300` | `form.field.disabled.color = surface.500` | 🟡 |
| `--sc-text-inverse` | `gray-0` | (varies by context) | 🟠 |
| `--sc-border-default` | `gray-200` | `form.field.border.color = surface.300` | 🟡 |
| `--sc-border-strong` | `gray-400` | `form.field.hover.border.color = surface.400` | 🟡 |
| `--sc-border-error` | `red-500` | `form.field.invalid.border.color = red.400` | 🔴 |
| `--sc-border-focus` | `soft-blue-500` cyan | `focus.ring.color = primary.color` (navy) | 🟠 ✓ doc |
| `--sc-icon-primary` | `gray-800` | (no direct equivalent — Aura uses surface chain) | 🟠 |

**Observaciones**:
- `--sc-border-error` apunta a `red-500`, Aura usa `red.400`. AED's
  borde de error es más saturado. **🔴 Sin justificación documentada.**
- `--sc-border-focus = soft-blue` (cyan) vs Aura `focus.ring.color =
  primary` (navy en el caso AED). Decisión consciente: focus cyan
  pop sobre superficies con primary navy. **🟠 Justificado en preset
  L113-118.**
- Aura `text.muted.color = surface.500` (slate-500 = `#64748b`).
  AED `text-secondary = gray-600` (`#6f7784`). 🟡 cercano pero un
  paso "más oscuro" en la AED ramp.

---

## 8. Capa semántica — Form field

| AED | Valor / token | Aura | Valor | Status |
|---|---|---|---|---|
| `--p-form-field-padding-x` (vía preset) | `--sc-spacing-300` = 16px | `form.field.padding.x = scale.0-75` | 10.5px | 🟠 |
| `--p-form-field-padding-y` (vía preset) | `--sc-spacing-200` = 12px | `form.field.padding.y = scale.0-5` | 7px | 🟠 |
| `--p-form-field-border-radius` (vía preset) | `--sc-radius-200` = 6px | `form.field.border.radius = md` = 6px | ✅ |
| `--p-form-field-transition-duration` | `--sc-transition-base` = 200ms | (no equivalent) | 🟠 ⚪ |
| `--p-form-field-focus-ring.width` | 2px (preset L114) | `form.field.focus.ring.width = 0` | 🔴 |
| `--p-form-field-focus-ring.style` | solid | (no equivalent) | 🟠 |

**Observaciones**:
- AED's form field es **~50% más alto** que Aura's default (12+12 vs
  7+7 = AED 24px de padding-y vs Aura 14px). 🟠 brand decision —
  formularios menos comprimidos. Sin DD explícito pero coherente con
  GUIA "calm · dense · operational".
- Aura **desactiva** focus ring en form fields (`width: 0`). AED lo
  fuerza a 2px. 🔴 Sin DD — pero claramente una decisión a11y deliberada
  (el ring nativo del browser no es suficiente sin algo extra). Acción:
  documentar.

---

## 9. Capa semántica — Overlay (modal / popover / select)

| AED | Valor | Aura | Valor | Status |
|---|---|---|---|---|
| `--p-overlay-modal-border-radius` (preset L132-135) | `--sc-radius-400` = 12px | `overlay.modal.border.radius = xl` = 12px | ✅ (corrige initial assumption) |
| `--p-overlay-popover-border-radius` (preset L136-139) | `--sc-radius-300` = 8px | `overlay.popover.border.radius = md` = 6px | 🔴 |
| `--p-overlay-select-border-radius` (preset L140-143) | `--sc-radius-200` = 6px | `overlay.select.border.radius = md` = 6px | ✅ |
| `--p-overlay-modal-padding` (sin override AED) | hereda Aura | `overlay.modal.padding = scale.1-25` = 17.5px | hereda |
| `--p-overlay-popover-padding` (sin override AED) | hereda Aura | `overlay.popover.padding = scale.0-75` = 10.5px | hereda |

**Modal radius**: AED usa `radius-400 = 12px`, Aura `xl = 12px` →
✅ idéntico.

**Popover radius**: AED usa `radius-300 = 8px`, Aura `md = 6px` →
🔴 sin justificación documentada. Podría ser deliberado (popovers
más redondeados que campos) o drift.

**Modal/popover padding**: AED no overridea — hereda valores Aura
(17.5px / 10.5px). Pero el componente `<aed-modal>` propio usa
`--sc-modal-padding-x = spacing-500 = 24px` (más generoso que Aura).
Implicación: las pantallas que usan `<aed-modal>` no caen al
padding heredado, pero cualquier `<p-dialog>` "crudo" (sin shell
AED) sí.

---

## 10. Effects — Focus ring

| AED | Valor | Aura | Status |
|---|---|---|---|
| `focusRing.width` (preset L114) | `2px` | `focus.ring.width = 1` | 🟠 |
| `focusRing.style` (preset L115) | `solid` | (default solid) | ✅ |
| `focusRing.color` (preset L116) | `--sc-color-soft-blue-500` cyan | `focus.ring.color = {primary.color}` | 🟠 |
| `focusRing.offset` (preset L117) | `2px` | `focus.ring.offset = 2` | ✅ |

**Justificación**: cyan focus sobre navy primary lee mejor que
navy-sobre-navy. Width 2px vs Aura 1px es decisión a11y (mejor
visibilidad). Documentado en preset.

---

## 11. Effects — Shadows

Aura define **70+ shadows component-by-component** (autocomplete,
button.raised, card, dialog, drawer, etc.) usando color **pure
black** (`#0000001a` etc.). AED define una **scale unificada**
(`xs`, `sm`, `card`, `dropdown`, `popover`, `dialog`, `focus-ring`)
con color **tinted** (`rgb(15 23 42 / N)`).

| AED token | Valor | Aura equivalente | Status |
|---|---|---|---|
| `--sc-shadow-xs` | tinted slate / 4% | `form.field.shadow` pure black 5% | 🟠 ⚪ |
| `--sc-shadow-sm` | composite tinted | (varios; no exact) | 🟠 ⚪ |
| `--sc-shadow-card` | composite tinted 4%+6% | `card.shadow` composite black | 🟠 ⚪ |
| `--sc-shadow-dropdown` | composite tinted 8%+6% | `menu.shadow` composite black | 🟠 ⚪ |
| `--sc-shadow-popover` | composite tinted 10%+8% | `popover.shadow` composite black | 🟠 ⚪ |
| `--sc-shadow-dialog` | composite tinted 12%+10% | `dialog.shadow` composite black | 🟠 ⚪ |
| `--sc-shadow-focus-ring` | cyan 35% glow | (no equivalent) | 🟠 ⚪ |

**Justificación**: Comentario en `aed-preset.ts:170-188` documenta
explícitamente que Aura's negro puro "leaks pure-black (untinted)
shadows into PrimeNG dropdowns and menus", motivo del override. ✅
Justificado. La AED-only `--sc-shadow-color-rgb` permite ripple a
todo el sistema.

---

## 12. Capa componente — Button

50 tokens `--sc-btn-*`. Todos apuntan a primitives ya auditados (1.1
para azules, 1.3 para grises, 1.6 para reds). El audit del color ya
clasificó cada uno.

Geometría (no-color):
| AED | Valor | Comentario |
|---|---|---|
| `--sc-btn-padding-x` | `--sc-spacing-300` = 16px | 🟠 más generoso que Aura form-field-padding |
| `--sc-btn-padding-y` | `--sc-spacing-200` = 12px | 🟠 idem |
| `--sc-btn-gap` | `--sc-spacing-100` = 8px | 🟠 ⚪ (no Aura equivalent) |
| `--sc-btn-radius` | `--sc-radius-200` = 6px | ✅ matchea Aura md |

---

## 13. Capa componente — Modal

11 tokens. Color-tokens cubiertos en §1. Geometría:

| AED | Valor | Comentario |
|---|---|---|
| `--sc-modal-radius` | `--sc-radius-300` = 8px | 🟠 — pero el preset overridea `overlay.modal.border-radius` a `radius-400 = 12px` (matchea Aura xl). Esto implica que `<aed-modal>` usa 8px, mientras que `<p-dialog>` crudo usa 12px. **Inconsistencia interna.** |
| `--sc-modal-padding-x/y` | spacing-500 / spacing-400 (24 / 20) | 🟠 más generoso que Aura overlay.modal.padding (17.5) |
| `--sc-modal-shadow` | composite tinted slate / 16% | 🟠 (ver §11) |

**🔴 Bandera**: `--sc-modal-radius = 8px` (componente AED) vs
`--p-overlay-modal-border-radius = 12px` (override AED a Aura).
Probablemente accidental (8px en `<aed-modal>` y 12px en `<p-dialog>`
crudos). **Material para Fase 4 cleanup**.

---

## 14. Capa componente — Toast

22 tokens. Color cubierto en §1. Geometría:

| AED | Valor | Comentario |
|---|---|---|
| `--sc-toast-radius` | `--sc-radius-400` = 12px | ✅ matchea Aura xl |
| `--sc-toast-width` | `400px` | ⚪ AED-only (Aura no exposes toast width) |
| `--sc-toast-icon-size` | `24px` | 🟠 ⚪ |

---

## 15. Capa palette (Layer 3) — Sin equivalente Aura

Toda la capa 3 (`--sc-label-*`, `--sc-presence-*`, `--sc-priority-*`)
es **AED-only**. Aura no modela "label colors" ni "agent presence"
ni "group priority".

Sub-detalle: el comentario de la capa explica que 4 de 8 hues de
label (orange, amber, teal, purple) **no están en `01-primitive.css`**
y por tanto se declaran como **hex directos** en este layer:

```
--sc-label-orange-bg: #fff7ed;
--sc-label-orange-text: #c2410c;
--sc-label-orange-border: #fed7aa;
--sc-label-orange-dot: #f97316;
...
```

Total: 16 hex literales en 03-palette.css.

| Hue | Aura equivalente | Coincide? |
|---|---|---|
| orange (`#f97316` at "500") | Aura `orange.500` `#f97316` | ✅ Idéntico |
| amber (`#f59e0b` at "500") | Aura `amber.500` `#f59e0b` | ✅ Idéntico (también == AED `yellow.500`) |
| teal (`#14b8a6` at "500") | Aura `teal.500` `#14b8a6` | ✅ Idéntico |
| purple (`#a855f7` at "500") | Aura `purple.500` `#a855f7` | ✅ Idéntico |

**🔴 Material para Fase 3/4**: los 4 hues están copiados manualmente
en hex de Aura, pero NO se promovieron a primitives en `01-primitive.css`.
Si Aura cambia el valor de orange.500 en el futuro, no se actualizan
solos. Patrón consistente con la promoción de los otros (green, red,
yellow=amber, etc.) que SÍ están en primitives. Sería trivial promoverlos.

Presence + priority (`--sc-presence-available: #1a8a4a` etc.) son
custom brand colors sin equivalente Aura. ✅ Justificado.

---

## 16. Capa extensions (Layer 5) — Sin equivalente Aura

Aura no modela layout dimensions (sidebar, topbar), z-index scale,
ni motion tokens. Toda la capa es ⚪ AED-only:

- `--sc-sidebar-width-{collapsed,expanded}` (64 / 240)
- `--sc-topbar-height: 56px`
- `--sc-bulk-action-bar-height: 56px`
- `--sc-z-{base..toast}` (12 z-index levels)
- `--sc-transition-{fast,base,slow}` (120 / 200 / 300 ms)
- `--sc-easing-{default,emphasized}`
- `--sc-shadow-color-rgb` + scale (cubierto §11)

**Sin acción**. ✅ Apropiado.

---

## 17. Capa dark (Layer 7) — Overrides para `.aed-dark`

Aura tiene su propio `semantic/dark` en el JSON, AED el suyo en
`07-dark.css`. Spot-check:

| AED `.aed-dark` | Resuelve a | Aura `semantic/dark` equivalente | Status |
|---|---|---|---|
| `--sc-bg-default` | `gray-950` `#0b0f14` | (Aura `surface.950 = slate.950 = #020617`) | 🟡 |
| `--sc-bg-surface` | `gray-900` `#181d26` | (Aura `content.bg = surface.900`) | 🟡 |
| `--sc-bg-primary` | `blue-500` `#344a70` | (Aura `primary.color = primary.400 = blue.400`) | 🟠 |
| `--sc-text-primary` | `gray-50` `#f7f8fa` | (Aura `text.color = surface.0 = white`) | 🟡 |

Comportamiento esperado para dark coherente (todo más claro al
invertir). No detecto problemas estructurales.

---

## 18. Resumen de hallazgos por nivel de acción

### 18.1. ✅ Sin acción

- Green scale (10/11 ✅).
- Yellow values (11/11 ✅ vs Aura amber).
- Red scale (11/11 ✅).
- Radii xs-xl (5/5 ✅).
- Border-radius modal `radius-400 = 12px` (matchea Aura xl).
- `text-on-primary` white.
- Focus ring offset 2px.

### 18.2. 🟡 Diferencias cercanas posiblemente accidentales (Fase 3/4 deciden)

1. **Gray scale (12 pasos)**: consistente paralelo a slate pero más
   claro. Probablemente intencional pero sin DD. **Acción
   propuesta**: documentar como decisión en GUIA si así se decide.
2. **Green-950**: `#0a2916` vs Aura `#052e16`. Drift de un paso.
3. **`--sc-border-error` apunta a red-500, Aura usa red-400**.
4. **`--sc-text-secondary` (gray-600) vs Aura `text.muted.color`
   (slate-500)**: un paso "más oscuro" en la AED ramp.

### 18.3. 🟠 Divergencias intencionadas (mantener, documentar si falta)

- Toda la brand identity color (blue navy, soft-blue cyan,
  electric-blue info).
- Spacing scale completa.
- Tipografía completa.
- Form-field padding más generoso.
- Focus ring cyan en vez de primary navy.
- Sombras tintadas vs Aura negro puro.
- `--sc-radius-500 = 16px` y `--sc-radius-full` (extensiones).
- Component layer custom (btn/modal/toast con shells AED).
- Domain palettes (label/presence/priority).
- Extensions layer entera.

### 18.4. 🔴 Divergencias sin documentación — requieren decisión

1. **Naming `--sc-color-yellow-*` → valores son Aura amber.**
   Renombrar a amber para consistencia con Figma, o documentar
   el alias.
2. **Naming `--sc-color-indigo-*` → valores no son indigo
   (son violet/purple custom).** Renombrar a violet o purple, o
   documentar.
3. **`--sc-border-error` = red-500 vs Aura red-400.**
4. **`form-field-focus-ring-width = 2px` vs Aura 0 (deshabilitado).**
   Documentar como decisión a11y consciente.
5. **`overlay.popover.border-radius = 8px` (AED) vs 6px (Aura).**
6. **`--sc-modal-radius = 8px` (`<aed-modal>`) vs preset `overlay.modal.border-radius = 12px` (`<p-dialog>` crudo)**. Inconsistencia interna.
7. **4 hues del label palette (orange, amber, teal, purple) están
   en hex directo en `03-palette.css`, no promovidos a
   primitives.** Trivial de corregir.
8. **Gray scale paralelo a slate sin DD**: pendiente decisión §18.2.1.

### 18.5. ⚪ Extensiones AED sin equivalente Aura (no comparables)

- Toda la capa de tipografía primitive (17 tokens).
- Spacing scale completa (13 tokens) — Aura tiene "scale" pero
  con sistema diferente.
- Radii `500` y `full`.
- `gray-0` (white).
- `text-subtle`, `text-inverse`, `border-strong`, `icon-subtle`,
  etc. (no tienen role-equivalent en Aura).
- Form-field transition-duration.
- Domain palettes completas.
- Extensions layer entera.
- Toast width / icon size.

---

## 19. Decisiones para Fase 3 (preview)

Antes de Fase 3 conviene cerrar las 8 entradas de §18.4 (🔴):

1. ¿Renombrar yellow→amber, indigo→violet? (rompe imports en código
   y en GUIA, requiere migración cuidada).
2. ¿Alinear `--sc-border-error` con Aura red-400 o mantener red-500?
3. ¿Documentar focus-ring-width=2 en GUIA como decisión a11y?
4. ¿Alinear popover-radius a 6px (Aura) o mantener 8px AED?
5. ¿Conciliar `--sc-modal-radius` (8px) con `overlay.modal.border-radius`
   (12px)?
6. ¿Promover orange/amber/teal/purple a primitives?
7. ¿Documentar gray scale paralelo a slate?

Las 4 🟡 de §18.2 (gray drift, green-950, text-secondary step,
border-error) son del mismo bucket — son síntoma de drift menor.

---

## Resumen ejecutivo (para chat)

1. La mayoría de las divergencias (~150+) son 🟠 intencionales y justificadas (brand navy, padding generoso, sombras tintadas, focus cyan, scales custom).
2. Núcleo del sistema sano: green, red, yellow (=amber), radii xs-xl, modal-radius preset son ✅ idénticos a Aura.
3. 8 🔴 cuestionables, todos detalles (no afectan brand identity):
   - 2 naming inconsistencies: `yellow`→amber values, `indigo`→purple values.
   - 1 inconsistencia interna: `--sc-modal-radius` 8px vs `overlay.modal.border-radius` 12px en preset.
   - 1 hueco doc: focus-ring-width=2px sin DD (a11y obvio pero no documentado).
   - 4 micro-drifts: `border-error` color, popover radius, gray scale parallel, green-950.
4. 4 hues del label palette están en hex directo, no promovidos a primitives. Trivial de promover.
5. Toda la capa de tipografía, spacing, motion, z-index, layout dims es ⚪ AED-only sin equivalente Aura — apropiado.
6. Nada bloquea el bridge audit (Fase 3) ni la limpieza (Fase 4).
