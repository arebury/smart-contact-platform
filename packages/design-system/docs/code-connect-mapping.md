# Code Connect mapping · Angular ↔ Figma SC Kit Pro

> **Estado**: DORMIDO (decisión S48). Bootstrap inicial documental (S41). Code
> Connect oficial **NO publicado** a Figma. Tabla viva interna — añadir entry
> cuando se valide un componente nuevo SCDS contra un Figma component del Kit.
>
> **Trigger reapertura**: cuando el equipo de producción adopte SCDS y exista
> el wrapper `<sc-*>` en su codebase con naming validado. Ver §"Estado
> dormido + setup futuro" al final.
>
> **Origen**: durante S41 rendericé `/admin/agentes/crear` en Figma
> con instances reales del Kit Pro (file key `khNq9dJKNi13pNllrqm6dx`).
> Capturé el mapping operativo aquí para que la próxima pantalla sea
> rápida y para que cuando bootstrap Code Connect oficial llegue, ya
> tengamos la documentación.
>
> **No es Figma Code Connect "oficial"** todavía (eso requiere CLI
> `figma connect publish` + JSON manifests). Esto es el doc previo:
> los pares Angular↔Figma con sus IDs estables.

---

## Convenciones

- **Angular component**: selector + clase TS.
- **Figma component**: nombre + nodeId + componentKey del Kit Pro.
- **Variant default**: la combinación de variant props que mejor
  representa el "neutral idle" del componente (sin estado especial).
- **Property mapping**: cómo se traducen inputs Angular a Figma props.

---

## Componentes mapeados

### Button — `<p-button>` ↔ `❖ button`

| Campo | Valor |
|---|---|
| Angular | `<p-button>` (PrimeNG `ButtonModule`, override `components.button.root` en `sc-preset.ts`) |
| Figma name | `button` |
| Figma nodeId | `10:125` |
| Figma componentKey | `8cb1e3e81a554af334579cd1f65de236cf20dd55` |
| Variant default | `Severity=Primary, State=Idle, Disabled=False, Icon Only=False, Outlined=False, Text=False` |

**Property mapping**:

| `<p-button>` input | Figma prop | Notas |
|---|---|---|
| `[label]` | `Text#4293:477` (TEXT) | Texto del botón |
| `severity="secondary"` | `Severity=Secondary` (VARIANT) | También `Primary/Success/Info/Warn/Help/Danger/Contrast/Plain` |
| `[outlined]="true"` | `🔲 Outlined=True` (VARIANT) | Para botón secundario con borde + bg transparent |
| `[text]="true"` | `🔤 Text=True` (VARIANT) | Botón solo texto sin bg |
| `[disabled]="true"` | `Disabled=True` (VARIANT) | Estado deshabilitado |
| `[icon]="..."` | `Show Left Icon#1644:0 = true` + `Left Icon#1644:2774` (INSTANCE_SWAP) | Iconos via instance swap |
| sin icon | `Show Left Icon = false` + `Show Right Icon = false` | Texto puro |

**Usos canónicos en SC**:
- Save / Cancelar en `<sc-sticky-form-header>` (Primary fill + Secondary outlined).
- Acciones primarias en `<sc-page-header>`.
- 38 botones AED migrados a `<p-button>` en S34.

---

### Input text — `<sc-inputtext>` ↔ `❖ inputtext`

| Campo | Valor |
|---|---|
| Angular | `<sc-inputtext>` (wrapper SCDS de `<p-inputtext>`, CVA-bound) |
| Figma name | `inputtext` |
| Figma nodeId | `23:835` |
| Figma componentKey | `245effb4f5a577b32eb06587f12759052ef7892f` |
| Variant default | `⚙️ State=Default, ❌ Invalid=False, 🚫 Disabled=False, 🟦 Filled=False, 🤏 Size=Normal, 🏷️ Float Label=False` |

**Property mapping**:

| `<sc-inputtext>` input | Figma prop | Notas |
|---|---|---|
| `[label]` (sc spec) | `🏷️ Show Label = true` + `↳ Label#5662:83` (TEXT) | Label arriba del input |
| `[placeholder]` | **text node interno "Placeholder"** (direct edit) | `↳ Float Label#4275:152` NO está conectado al placeholder real cuando `🏷️ Float Label=False`. Hay que editar el text node `Placeholder` directamente (walk children, characters set) |
| `[helperText]` (sc spec) | `ℹ️ Show Helper = true` + `↳ Helper Text#1729:4039` (TEXT) | Helper text inferior |
| `[error]` | `❌ Invalid=True` (VARIANT) | Estado de error con borde rojo |
| `[disabled]` | `🚫 Disabled=True` (VARIANT) | Estado deshabilitado |
| Icon left | `⬅️ Show Left Icon = true` + `↳ Left Icon#1729:0` (INSTANCE_SWAP) | |
| Icon right | `➡️ Show Right Icon = true` + `↳ Right Icon#1729:577` (INSTANCE_SWAP) | |
| Size | `🤏 Size=Small|Normal|Large` (VARIANT) | sc-inputtext default a Normal |

**Gotcha S41**: el property `↳ Float Label#4275:152` SOLO controla el
texto cuando `🏷️ Float Label=True`. Si el componente está en modo
"label arriba" (patrón SC), el placeholder real es un text node
interno llamado `"Placeholder"` y se edita directamente con
`node.characters = "..."`. No funciona via `set_instance_properties`
con esta prop específica.

---

### Select — `<sc-select>` ↔ `❖ select`

| Campo | Valor |
|---|---|
| Angular | `<sc-select>` (wrapper SCDS de `<p-select>`, CVA-bound) |
| Figma name | `select` |
| Figma nodeId | `156:5882` |
| Figma componentKey | `5a49f296f7a4f359aede21c494eca506fc213ff0` |
| Variant default | `State=Idle, Float Label=False` |

**Property mapping**:

| `<sc-select>` input | Figma prop | Notas |
|---|---|---|
| `[placeholder]` | text node interno `"Placeholder"` | Idéntico patrón a inputtext: walk children y edita characters |
| `[disabled]` | (no hay variant directo, usa State) | Verificar |
| Estado open (dropdown abierto) | `State=Open` (VARIANT) | Para mockups con dropdown desplegado |
| Estado selected (con valor) | `State=Selected` (VARIANT) | |

---

### Toggle switch — `<sc-toggleswitch>` ↔ `❖ toggleswitch`

| Campo | Valor |
|---|---|
| Angular | `<sc-toggleswitch>` (wrapper SCDS de `<p-toggleswitch>` desde S32) |
| Figma name | `toggleswitch` |
| Figma nodeId | `260:11899` |
| Figma componentKey | `a4ff7cdbd9e804f9bd97bdd5a1e51936235e0c19` |
| Variant default | _Verificar al primer uso real_ (S41 no instancié esto) |

**Pendiente**: cuando se instancie por primera vez, completar la
tabla de property mapping siguiendo el patrón.

---

### Avatar (placeholder de `<sc-photo-upload>`) — `❖ avatar`

| Campo | Valor |
|---|---|
| Angular | `<sc-photo-upload>` (custom-preset SC, no es wrapper directo) |
| Figma name | `avatar` |
| Figma nodeId | `327:13384` |
| Figma componentKey | `9eed0991ab5dc4d77090f4275b2367a8238db05f` |
| Variant default | _Verificar al primer uso real_ |

**Nota**: el match Angular↔Figma aquí es parcial. `<sc-photo-upload>`
es un widget custom SC con drop-zone + crop + delete affordances que
el `❖ avatar` Figma no cubre. Usar el avatar Figma para representar
el "estado idle / con foto" en mockups; el resto del comportamiento
requiere notación libre.

---

### Section card (placeholder de `<sc-section-card>`) — `❖ panel`

| Campo | Valor |
|---|---|
| Angular | `<sc-section-card>` (custom-preset SC, 24+ consumers AED) |
| Figma name | `panel` |
| Figma nodeId | `229:10217` |
| Figma componentKey | `ea4945599408e7c3b41a232b03f51c24baa35b59` |
| Variant default | _Verificar al primer uso real_ |
| **Estado actual** | **DECLINE** mapping directo. Ver `inconsistencies-backlog.md §S34` — `❖ Panel` vive en library externa PrimeOne no auditada desde SC file. Riesgo visual silencioso. Re-evaluar cuando el equipo de diseño audite Panel en SC. |

---

## Frames custom (sin equivalente Figma directo)

Estos componentes SC son pure-sc patterns in-house. No tienen
equivalente 1:1 en el Kit Pro. Cuando se necesiten en un mockup
Figma, se reconstruyen con frames + Variables binding (NO con hex
literals — ver `case-study-notes.md` entry S41 "Render Figma desde
código"):

| Angular | Patrón Figma recomendado |
|---|---|
| `<sc-sticky-form-header>` | Frame horizontal con header-leading (back + breadcrumb + name) + header-actions (button instances). Variables: `surface/0` bg, `surface/200` border-bottom |
| `<sc-form-section-nav>` | Frame vertical 220px con nav-items. Active item: `sky/50` bg (hasta que tengamos Variable SC propia para "active selection") |
| `<sc-page-header>` | Pendiente — añadir cuando se renderee primera pantalla con uno |
| `<sc-form-danger-zone>` | Pendiente |
| `<sc-bulk-action-bar>` | Pendiente |
| `<sc-empty-state>` | Pendiente |
| `<sc-illustrated-avatar>` | Pendiente — SVG illustration custom, no es avatar pequeño |

---

## Variables Figma SC (semantic) ya mapeadas

Pares "token Angular ↔ Variable Figma" verificados en S41:

| `--sc-*` Angular | Variable Figma | VariableID |
|---|---|---|
| `--sc-bg-default` | `surface/50` | `9114:24112` |
| `--sc-bg-surface` / `--sc-bg-elevated` | `surface/0` | `9114:24113` |
| `--sc-border-subtle` | `surface/100` | `9114:24111` |
| `--sc-border-default` | `surface/200` | `9114:24109` |
| `--sc-text-subtle` | `surface/400` | `9114:24114` |
| `--sc-text-secondary` | `surface/600` | `9114:24104` |
| `--sc-text-primary` | `content/color` | `9114:24153` |
| (bg-surface alias card) | `content/background` | `9114:24154` |
| (border card alias) | `content/border/color` | `9114:24149` |
| (nav active bg, placeholder) | `sky/50` | `9101:24262` |
| `--sc-primary` (navy override Aura) | `primary/color` (resuelto a navy via sc-preset.ts) | `9112:24068` |

**Pendiente**: 6 divergencias Custom SC documentadas en
`inconsistencies-backlog.md` esperan a tener su Variable propia
cuando se haga el bootstrap Custom collection (eje 4 punto 1 del
mapa estratégico, dormido hasta que el equipo de diseño + Rafa se pongan):

- Navy primary (`#1B273D`)
- Electric blue info (`#48B8C9` aprox, el teal-info del prototipo)
- Amber warn
- Button padding 10.5 / 7
- Tabs padding 14 / 15.75
- Tooltip chrome

---

## Cómo añadir un componente nuevo al mapping

1. Localizar el component en el Kit Pro vía `figma_search_components`.
2. Inspeccionar variant props vía `figma_execute` con
   `componentPropertyDefinitions` del COMPONENT_SET.
3. Instanciar con un variant default + property mapping verificado.
4. Documentar gotchas (placeholder direct edit vs property, etc.).
5. Entry aquí + entry en spec doc del componente Angular.

## Cómo añadir Variable a un nuevo render

1. Pre-fetch ASÍNCRONO con `getVariableByIdAsync`.
2. `figma.variables.setBoundVariableForPaint(fill, "color", variable)`.
3. Asignar el `boundFill` al `node.fills = [boundFill]`.
4. Verificar `node.fills[0].boundVariables.color.id` apunta al
   VariableID esperado.

---

## Estado dormido + setup futuro (decisión S48)

### Por qué Code Connect oficial está dormido

S48 evaluamos publicar Code Connect oficial (`@figma/code-connect` CLI + `*.figma.ts`
con `parser: "html"`, Angular soportado desde oct/2024). **Decisión: posponer**.

Razón principal: **este repo es del equipo de diseño (equipo de diseño + Claude). Los devs
de producción que aplicarán SCDS NO tienen acceso a este repo**. Publicar Code Connect
hoy generaría:

1. **Snippets con referencias rotas**: `<sc-inputtext>` e `import { InputtextComponent }
   from '@sc/design-system/components'` referencian implementación que NO existe en el
   repo de producción.
2. **Imposición unilateral de naming**: estamos dictando "así se debe instanciar" sin
   validar con el equipo prod que su stack acepta este convention. Su naming puede ser
   distinto (`<smart-input>`, `<ds-text-field>`, etc.).
3. **Riesgo de reverso**: si en N meses prod adopta SCDS con naming distinto, hay que
   rehacer los `.figma.ts` y republicar. Trabajo en vacío.

El comparable "worst case sin Code Connect = dev importa PrimeNG directo" (argumento
válido para Shopify/GitHub-style equipos compartiendo codebase) **no aplica aquí** —
los devs prod no tienen PrimeNG ni SCDS, tienen su propio stack.

Mientras tanto, este `code-connect-mapping.md` cubre el rol de source-of-truth interno
del mapping Angular↔Figma para sparring entre el equipo/Claude. Suficiente.

### Trigger de reapertura

Reabrir cuando **TODOS** los siguientes sean verdad:

- [ ] El equipo de producción ha adoptado SCDS (vía npm package publicado, copia de
      componentes, o lo que negociéis).
- [ ] Los wrappers `<sc-*>` existen en el codebase de producción **con el mismo naming**
      que tenemos aquí (validado con un dev prod, no asumido).
- [ ] Hay al menos 1 dev prod consumiendo el DS desde Figma activamente (no en teoría).

Si solo se cumple "queremos que se vea profesional para case-study" sin un consumidor
real → NO reabrir. Es overhead sin ROI.

### Setup futuro (cuando se reabra)

Pasos exactos, validados S48:

```bash
# 1. Instalar dep (NO instalada hoy a propósito — coger versión vigente entonces)
npm install -D @figma/code-connect@latest

# 2. Inicializar config en root
npx figma connect create
# Te pregunta parser → elegir "html"
# Te pregunta token Figma → access token con permisos Code Connect (Dev Mode)
# Genera figma.config.json en root
```

**`figma.config.json` esperado** (parser html, Angular auto-detectado del package.json):

```json
{
  "codeConnect": {
    "parser": "html",
    "include": ["packages/design-system/components/**/*.figma.ts"],
    "exclude": ["node_modules/**"]
  }
}
```

**Ubicación archivos** (decisión S48): co-localizados con el componente Angular.
Ejemplo `packages/design-system/components/inputtext/inputtext.figma.ts`:

```ts
import figma, { html } from '@figma/code-connect/html';
import { InputtextComponent } from './inputtext.component';

figma.connect(
  InputtextComponent,
  'https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/...?node-id=23-835',
  {
    props: {
      label: figma.string('↳ Label#5662:83'),
      placeholder: figma.string('Placeholder'), // text node interno, ver gotcha S41
      error: figma.enum('❌ Invalid', { True: true, False: false }),
      disabled: figma.enum('🚫 Disabled', { True: true, False: false }),
      size: figma.enum('🤏 Size', {
        Small: 'small',
        Normal: 'normal',
        Large: 'large'
      }),
    },
    example: (props) => html`
      <!-- SCDS wrapper (Smart Contact DS). Wraps PrimeNG p-inputtext with -->
      <!-- label/helper/error spec. See packages/design-system/components/inputtext/ -->
      <sc-inputtext
        [label]="${props.label}"
        [placeholder]="${props.placeholder}"
        [error]="${props.error}"
        [disabled]="${props.disabled}"
      />
    `,
  }
);
```

**Publicación** (genera el snippet visible en Dev Mode):

```bash
npx figma connect publish
```

### Wrappers candidatos para bootstrap (7 renombrados S47, naming 1:1 Kit Pro)

Hechos S47, naming wrappers = nombre Figma literal. Listos para bootstrap cuando llegue
el trigger:

1. `<sc-inputtext>` ↔ `❖ inputtext` — nodeId `23:835` (mapping completo arriba)
2. `<sc-inputnumber>` ↔ `❖ inputnumber` — pendiente nodeId, sigue patrón inputtext
3. `<sc-inputgroup>` ↔ `❖ inputgroup` — pendiente nodeId
4. `<sc-multiselect>` ↔ `❖ multiselect` — nodeId `6738:22651` (Kit Pro). Selección
   múltiple con chips. Soporta también el eje `Float Label`/IftaLabel (label dentro).
   Candidato para varios dropdowns de config (a confirmar single vs multi por campo).
5. `<sc-toggleswitch>` ↔ `❖ toggleswitch` — nodeId `260:11899` (arriba)
6. `<sc-dialog>` ↔ `❖ dialog` — pendiente nodeId (tokens `--sc-dialog-*` ya alineados)
7. `<sc-checkbox>` ↔ `❖ checkbox` — nodeId `148:6321` (Kit Pro). Set con eje
   `Size (Small/Normal/Large) · Selected · Hover · Focus · Disabled · Filled`. Tokens:
   checked bg `#1b273d`, borde radio `4`, icon-check `#fff` (sm `10.5`), sm box `14`.
   **En uso en config AED (S65)** vía `[state]`/`(cycle)`/`[filled]`/`[size]`.

Más los pre-existentes:
- `<p-button>` (no wrapper, override en preset) ↔ `❖ button` — nodeId `10:125`
- `<sc-select>` ↔ `❖ select` — nodeId `156:5882`. **Tiene eje `Float Label`** + variante
  con buscador (`filter`). Para el label-dentro-del-campo de los selects de Grupos config →
  usar **IftaLabel** (ver abajo).

**Label-dentro-del-campo (pendiente 1:1, S65)** — registrados para implementar con paridad:

- `❖ FloatLabel` — nodeId `7421:322901`. Label que flota al focus/fill (estilo Material).
- `❖ IftaLabel` — nodeId `7462:106725`. *In-Field Top Aligned*: label fijo arriba-dentro
  del campo. **Es el de los selects de Grupos (Figma `1:12676`)**. Tokens (del var-defs):
  `iftalabel/input/padding/top 21` · `/bottom 7` · `iftalabel/color #8f97a3` ·
  `iftalabel/font/size 10.5` · `/weight 400` · `iftalabel/position/x 10.5` · `iftalabel/top 7`.
  **✅ Hecho (S65)**: variante `[iftaLabel]` en `<sc-select>` (label dentro, valor con
  padding-top 21/bottom 7), **en uso en config Grupos** (1:1 con Figma `1:12676`).
  Pendiente extender a `<sc-inputtext>`/`<sc-inputnumber>` cuando un diseño lo pida.

### Checklist mantenimiento durante dormido

- Si renombramos un wrapper SCDS, **actualizar este doc también** (regla DD-8 ya cubre
  naming portable, pero conviene re-leer este doc al hacer rename).
- Si el equipo de diseño re-publica el Kit Pro con nuevos nodeIds, los IDs documentados arriba pueden
  obsolescer. No crítico mientras esté dormido — se re-verifican al reabrir.
- Si sale `@figma/code-connect@2.x` con breaking changes en parser html, este setup
  puede quedar obsoleto. Re-validar al reabrir.

### Referencias

- Doc oficial parser html (Angular): https://developers.figma.com/docs/code-connect/html/
- Decisión S48 en chat de sesión.
- Memory auto Claude: `feedback_code_connect_dormant.md`.
