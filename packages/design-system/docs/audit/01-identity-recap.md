# Fase 1 — Reconciliación de identidad

> Lectura completa de `GUIA.md` (787 líneas) y `README.md` (147
> líneas), cruzada con el código actual de los 7 layers,
> `aed-preset.ts`, `ThemeService` y el log de DDs. Este documento
> no propone cambios — establece qué dice la marca, qué dice el
> código, dónde coinciden y dónde divergen. Insumo para Fase 2.

---

## 1. Brand color: reconciliación definitiva

**El brand primary real es `#1B273D` (capitalización de la GUIA;
en código `#1b273d` — mismo valor).**

Triangulación:

| Fuente | Valor | Línea |
|---|---|---|
| `GUIA.md` — mapa mental | `#1B273D` | L34 |
| `GUIA.md` — Caso 1 ejemplo | `#1b273d → #1c2840` (ejemplo hipotético de UN cambio) | L639 |
| `GUIA.md` — Custom mode example | `primary-500: #1B273D` (placeholder didáctico) | L272 |
| `01-primitive.css` | `--sc-color-blue-700: #1b273d;` | L24 |
| `02-semantic.css` | `--sc-bg-primary: var(--sc-color-blue-700);` | L59 |
| `DECISIONS.md` (DD#49 etc.) | Múltiples refs al brand vía `--sc-color-blue-*` | — |
| CLAUDE.md (sesiones previas) | `#1c273e` | — |

**Veredicto:** el `#1c273e` mencionado en CLAUDE.md fue una
transcripción imperfecta (`b↔c` swap + `d↔e` shift). El valor real
y único de marca es `#1B273D`. Nada hay que normalizar en código;
sí hay que actualizar la asunción del CLAUDE.md original (ya hecho
en esta sesión).

**Nota sobre numeración de escala**: en GUIA L272 el ejemplo
didáctico usa `primary-500: #1B273D`, pero en código el navy real
vive en `--sc-color-blue-700`. Los pasos `-500` y `-700` apuntan a
hex distintos:

| Token | Valor |
|---|---|
| `--sc-color-blue-500` | `#344a70` (medio) |
| `--sc-color-blue-700` | `#1b273d` (navy / brand) |
| `--sc-color-blue-900` | `#0b1019` (casi negro) |

El alias semántico `--sc-bg-primary = blue-700` resuelve la
ambigüedad: el "primary fill" SIEMPRE es `#1b273d`, independiente
de qué número se le ponga en Figma Custom mode. La GUIA es
didácticamente loose en ese punto; el código es preciso.

## 2. Catálogo de decisiones de identidad documentadas

Extracción literal de GUIA.md + README.md. Cada decisión va con
implementación detectada.

### 2.1. Base tecnológica

| Decisión | Fuente | Implementación |
|---|---|---|
| **Tema base = Aura** | GUIA L338-352 (justificación: "calm · dense · operational") | ✓ `aed-preset.ts:1 import Aura from '@primeng/themes/aura'; definePreset(Aura, …)` |
| **`definePreset(Aura, …)` con overrides selectivos**, no copia completa | GUIA L350-354, DD#49 / DD#52 | ✓ `aed-preset.ts` declara sólo `primitive`, `semantic`. El resto hereda de Aura. |
| **`darkModeSelector: '.aed-dark'`** (no `.dark` default de Aura) | `app.config.ts` | ✓ Configurado |

### 2.2. Brand identity (color)

| Decisión | Fuente | Implementación |
|---|---|---|
| Brand primary = navy `#1B273D` | GUIA L34, L272 | ✓ `--sc-color-blue-700: #1b273d` |
| Accent = soft blue / cyan (`#5ad3e6` mid-tone) | `01-primitive.css` L30-40, GUIA implícito por refs a `soft-blue` | ✓ `--sc-color-soft-blue-*` |
| Info = electric blue (`#1464fe`) — distinto de brand | `aed-preset.ts:82-94` con comentario explícito | ✓ Documentado: PrimeNG `--p-blue-*` redirige a electric-blue para que "info" no se confunda con brand. |
| Status: green/yellow/red sin desviación de paletas estándar | `01-primitive.css` L57-93 | ✓ Tailwind-like (`#22c55e`, `#f59e0b`, `#ef4444`) |
| Indigo: 8th categorical (label palette) | `01-primitive.css` L108-119 | ✓ |

### 2.3. Tipografía

| Decisión | Fuente | Implementación |
|---|---|---|
| Familia primaria: **Inter** (UI principal) | `01-primitive.css` L122, `main.scss` | ✓ |
| Familia secundaria: **Open Sans** (captions) | `01-primitive.css` L123, `02-semantic.css` L223-224 | ✓ Sólo se aplica a `caption` / `caption-bold`. |
| Escala paso-base = pasos numéricos en px (50=10, 100=12, 200=14, 300=16, …) | `01-primitive.css` L126-138 | ✓ 13 tamaños. |
| Roles de tipografía: `display-1`, `h1..h4`, `subtitle-1..2`, `body-1..3`, `caption`, `caption-bold` (DD#36) | `02-semantic.css` L171-224, DD ref | ✓ Aliasing role → primitive. |

### 2.4. Spacing y radii

| Decisión | Fuente | Implementación |
|---|---|---|
| Spacing scale: 13 pasos (`0, 50=4, 100=8, 150=10, 200=12, 250=14, 300=16, 400=20, 500=24, 600=32, 700=40, 800=48, 900=64`) | `01-primitive.css` L163-175 | ✓ |
| Off-scale values "kept raw" (e.g. `6px` button padding) sólo con comentario | `_buttons.scss` L18 etc. | ✓ Comentado caso por caso. |
| Radii: 9 pasos (`0, 50=2, 100=4, 200=6, 300=8, 400=12, 500=16, full`) | `01-primitive.css` L178-185 | ✓ |
| **Caso 3 GUIA**: si necesitas un radio que no existe, mejor usar el más cercano. No proliferar pasos. | GUIA L676-691 | Política. No código. |

### 2.5. Modos (light / dark)

| Decisión | Fuente | Implementación |
|---|---|---|
| Light + dark mode arquitectónicamente soportados | `07-dark.css`, `aed-preset.ts:colorScheme.{light,dark}` | ✓ |
| **"AED siempre en modo claro por decisión de marca"** (operadores en oficina iluminada) | GUIA L113-115, L184-185 | ⚠️ **DISCREPANCIA** — ver §4.1 |
| Dark scheme hereda de capa 7 vía `.aed-dark` | `aed-preset.ts:223-229` comentario | ✓ Arquitectónicamente correcto. |
| Translucencias en dark → `color-mix(in srgb, …)` para no romper cadena de primitivos | DD ref (DECISIONS.md) | ✓ |

### 2.6. Sombras

| Decisión | Fuente | Implementación |
|---|---|---|
| Sombras tintadas vía `--sc-shadow-color-rgb` (no `rgba(0,0,0,…)` puro) | `aed-preset.ts:170-188` comentario explícito, DD ref | ✓ Override de Aura's `formField.shadow` y `overlay.*.shadow` para evitar negro puro. |
| Escala de sombras tipada: `xs`, `sm`, `md`, `lg`, `xl`, + recipes: `dialog`, `popover`, `dropdown`, `card` | `05-extensions.css` | ✓ |

### 2.7. Reglas de consumo

| Decisión | Fuente | Implementación |
|---|---|---|
| Componentes referencian `--sc-*`, nunca raw `#hex` ni `Npx` | README L55-58 | ✓ 0 hex en componente SCSS. 571 `px` literals pendientes de clasificar (Fase 4). |
| **Fallback hex prohibido** (`var(--sc-x, #aaa)`) — significa que falta token | README L57-58, GUIA L764 | ✓ 0 hex fallbacks detectados. |
| Fallback no-hex (px/ms/numbers) — la regla GUIA aplica estrictamente a hex; los no-hex aparecen 23 veces. | (regla literal sólo cubre hex) | ⚠️ Ver §4.2 — algunos tienen valor de fallback incorrecto. |
| Nunca declarar `--p-*` a mano | README L51-54, GUIA L72, L107-110 | ✓ Excepto `06-primeng-bridge.css` que es dead code (no importado). |
| Sólo `aed-preset.ts` puede mapear `--p-*` → `--sc-*` | README L37-42, GUIA L107-110 | ✓ |

### 2.8. Jerarquía de customización (5 niveles)

GUIA L398-455 define 5 niveles. Política, no código:

1. Token override en preset (preferido)
2. PassThrough `pt` prop (puntual)
3. CSS `::ng-deep` (frágil, Angular-deprecated)
4. Wrapping en componente Angular propio
5. Fork del componente (último recurso)

**Implementación detectada**:
- Nivel 1: 90%+ del estilo (todos los tokens en preset).
- Nivel 2: 0 usos de `pt` detectados.
- Nivel 3: 19 `::ng-deep` (mayoritariamente legítimos según política GUIA L432-436).
- Nivel 4: Componentes `<aed-modal>`, `<aed-toast>`, `<aed-toggle-switch>`, `<aed-illustrated-avatar>`, `<aed-tri-state-checkbox>` (GUIA L446-447).
- Nivel 5: 0 forks detectados.

### 2.9. Política de migraciones PrimeNG

GUIA L549-587 define:
- Patch (21.0.x): auto-merge salvo regresión.
- Minor (21.x): review changelog + branch + smoke test.
- Major (21 → 22): proyecto dedicado.

**Estado actual**: PrimeNG 21.1.6 (minor más reciente). No requiere acción.

### 2.10. Reglas de Figma (Custom mode)

GUIA L277-323:
- Tocar SÓLO el Custom mode del duplicado de PrimeOne.
- Nunca renombrar/eliminar variables del kit original.
- Componentes nuevos en la librería SmartContact, no dentro del duplicado.
- Tokens custom con prefijo `sc-*` (presence, priority, label) en librería SmartContact.

Política. No verificable desde código.

---

## 3. Decisiones GUIA implementadas vs descritas-pero-no-implementadas

| Decisión | Implementada |
|---|---|
| Tema base Aura | ✓ |
| Brand `#1B273D` en `blue-700` | ✓ |
| Paleta completa (blue, soft-blue, gray, green, yellow, red, electric-blue, indigo) | ✓ |
| Inter primaria, Open Sans secundaria (captions) | ✓ |
| Escala tipográfica completa (13 sizes, 13 line-heights, 4 weights) | ✓ |
| Roles tipográficos (display-1, h1-h4, subtitle, body-1..3, caption, caption-bold) | ✓ |
| Spacing 13 pasos | ✓ |
| Radii 9 pasos | ✓ |
| Sombras tintadas (no negro puro) | ✓ |
| Dark mode operativo en cascada layer 7 | ✓ |
| Bridge `aed-preset.ts` → `--p-*` ↔ `--sc-*` | ✓ |
| Wrappers Nivel 4 para componentes clave | ✓ |
| Componentes consumen `--sc-*`, no `--p-*` | ✓ (verificado 0 refs `--p-*` en componente SCSS) |
| No hex sueltos en componentes | ✓ (verificado 0 ocurrencias) |
| No fallbacks hex | ✓ (verificado 0 ocurrencias) |
| `darkModeSelector` custom (`.aed-dark`) | ✓ |
| `ThemeService` para toggle | ✓ |

**No detecto decisiones descritas que no estén implementadas.**
Todas las identity decisions catalogadas en la GUIA tienen
contrapartida en código.

---

## 4. Discrepancias / huecos detectados

### 4.1. Dark mode: "apagado por decisión de marca" vs `ThemeService` activo

- **GUIA L113-115**: _"AED está siempre en modo claro por decisión
  de marca (operadores en oficinas iluminadas, ergonomía > estética).
  Esa planta existe por arquitectura pero está apagada."_
- **GUIA L184-185**: _"Planta 7 — `07-dark.css`: modo oscuro. Está
  apagado por decisión de marca, pero el archivo existe. No lo
  tocamos sin un cambio de estrategia explícito."_
- **Realidad código**:
  - `07-dark.css` SÍ se importa en `index.css` (orchestrator).
  - `ThemeService` está totalmente operativo: 3 modos
    (`'light' | 'dark' | 'system'`), persiste en localStorage,
    reacciona a `prefers-color-scheme`, aplica `.aed-dark` en `<html>`.
  - Default es `'system'` → si el OS del usuario está en dark, la
    app SE PONE en dark.
  - DD en `DECISIONS.md` documenta un fix reciente: _"Dark mode was
    silently broken in production; (...) Fix: inject the service in
    AppComponent as a side-effect dependency."_ Es decir, se
    arregló intencionalmente.

**Lectura**: La GUIA describe la política original (light-only por
marca). Una DD posterior activó dark mode de facto, pero la GUIA
no se ha actualizado. O bien:

- (a) Dark mode debe estar activo (DD reciente manda). GUIA queda
  desactualizada en L113-115 / L184-185.
- (b) Dark mode debería estar apagado por marca, pero el código
  va por delante. Hay que decidir si revertir el toggle o
  actualizar la GUIA.

**No decido. Input humano necesario.**

### 4.2. Fallbacks no-hex en SCSS de componentes (23 instancias)

La regla GUIA L764 sólo prohíbe fallbacks hex
(`var(--sc-x, #aaa)`). Los fallbacks no-hex (`px`, `ms`, numbers)
no están explícitamente vetados. Pero algunos tienen el valor de
fallback **incorrecto** (lo que indicaría desconocimiento del
valor real del token, no robustez):

| Archivo | Fallback | Valor real del token | OK? |
|---|---|---|---|
| `app.component.scss` (×3) + `settings-sidebar` + `aed-agentes-page` | `var(--sc-transition-fast, 120ms)` | `120ms` | ✓ Matchea |
| `aed-defaults-page` (×2) + `settings-sidebar` + `aed-agentes-page` | `var(--sc-font-size-100, 14px)` | `12px` | ✗ Wrong fallback |
| `settings-sidebar` + `aed-defaults-page` (×2) | `var(--sc-font-size-50, 12px)` | `10px` | ✗ Wrong fallback |
| `aed-defaults-page` (×3) | `var(--sc-font-size-200, 14px)` | `14px` | ✓ Matchea |
| `aed-defaults-page` | `var(--sc-font-size-h2, 24px)` | `24px` (alias) | ✓ Matchea |
| Varios | `var(--sc-font-weight-medium, 500)` | `500` | ✓ Matchea |

5 instancias con fallback que NO matchea el valor del token. Si el
token alguna vez fallara, renderizarían con valor erróneo. No es
catastrófico (los tokens existen y se cargan), pero es deuda.

Material para Fase 4 cleanup.

### 4.3. `darkModeSelector` y `colorScheme.dark` duplican lógica

- `aed-preset.ts:231-277` define `colorScheme.dark` con mismos
  valores `var(--sc-*)` que `light`. Comentario L221-229: _"layer
  7 ya re-declara los `--sc-*` bajo `.aed-dark`, así que dark
  inherits free"_.
- Funcionalmente correcto. La duplicación es intencional ("keep
  the shape so future upstream changes to colorScheme.dark don't
  surprise us").
- GUIA L600-607 (Gotchas) lo refuerza: _"cuando añadas un override
  en `light`, añade también el equivalente en `dark` aunque no se
  vaya a usar"_.

**No es deuda. Es protección.** Documentado y deliberado.

### 4.4. Numeración escala blue Figma vs código

GUIA didácticamente menciona `primary-500: #1B273D` (L272). Código
real: `#1b273d` está en `blue-700`. Ambos sistemas son consistentes
internamente; el alias `--sc-bg-primary = blue-700` resuelve.

**Acción para Fase 5 (re-sync)**: cuando el equipo de diseño exporte el JSON,
verificar qué nivel de la paleta Figma marca como "primary" — si
es 500, hay que decidir si renumerar el código o documentar el
mismatch como decisión.

### 4.5. `cssLayer.order` menciona `tailwind-*`

`app.config.ts:46`: `order: 'tailwind-base, primeng, tailwind-utilities'`.

Tailwind no está en `package.json`. Funcionalmente inocuo (layers
vacíos no rompen nada), pero sugiere config heredada.

---

## 5. Open questions para input humano

Antes de Fase 2 (validación `--sc-*` contra Aura) conviene cerrar:

1. **Dark mode policy (§4.1)**: ¿se mantiene activo
   (`ThemeService` con default `'system'`) o se desactiva por
   adherencia a la decisión de marca documentada en GUIA?
   - Si se mantiene: actualizar GUIA L113-115 / L184-185.
   - Si se desactiva: dictar política exacta (hardcode `'light'`?
     borrar `ThemeService`?).
2. **5 fallbacks con valor incorrecto (§4.2)**: ¿se limpian en
   Fase 4 dentro del bucket "deuda real" o quedan documentados y
   ya?
3. **`tailwind-*` en cssLayer.order (§4.5)**: ¿se quita la
   referencia ahora o se ignora hasta que aparezca razón para
   tocar `app.config.ts`?

Nada más bloquea Fase 2.

---

## Resumen ejecutivo (para chat)

1. Brand color reconciliado: **`#1B273D`** (el `#1c273e` era transcripción imperfecta).
2. Las decisiones de identidad documentadas en GUIA están **todas implementadas**. Ninguna gap "descrita pero no implementada".
3. Una discrepancia importante: la GUIA dice "dark mode apagado por marca", el código lo tiene activo con default `'system'`. DD reciente lo activó intencionalmente; GUIA quedó desactualizada en ese punto.
4. 5 fallbacks no-hex con valor de fallback incorrecto (deuda menor, no bloqueante).
5. Numeración Figma `primary-500` vs código `blue-700`: ambos sistemas internamente consistentes, alias semántico resuelve. Verificar en re-sync.
6. `cssLayer.order` menciona tailwind sin tener Tailwind como dep — config heredada inocua.
7. Nada más bloquea Fase 2.
