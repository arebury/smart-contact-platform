# sc-input-group

> **Type**: Extended · **AED uses**: 1 · **Figma parity**: 1:1 con Figma

> Wrapper Extended sobre `<p-inputgroup>`. Agrupa un input con addons left/right
> (texto, icono, botón, checkbox o radio) fundiendo el borde compartido para que
> el conjunto se lea como una pieza única.

## TL;DR

```html
<sc-input-group>
  <p-inputgroup-addon>$</p-inputgroup-addon>
  <input pInputText placeholder="Price" />
  <p-inputgroup-addon>.00</p-inputgroup-addon>
</sc-input-group>
```

- `<sc-input-group>` envuelve `<p-inputgroup>`.
- Los addons usan `<p-inputgroup-addon>` (PrimeNG nativo). El consumer importa
  `InputGroupAddonModule` en sus `imports[]`.
- Tokens fluyen desde `formField.*` via `sc-preset.ts`. No hay overrides propios.

## Cuándo usarlo

- Input numérico con unidad fija como prefijo o sufijo (`$` ... `.00`, `www.` ...
  ...`.com`, hora `:` minutos).
- Input + botón de acción inmediata pegado (caso AED: tag-input "Añadir").
- Input con icono que comunica el tipo del dato esperado y NECESITA compartir
  borde con el input (vs `<sc-search>` que usa icon overlay decorativo dentro
  del input, sin merge de borde).
- Input con checkbox / radio asociado en el mismo cluster.

## Cuándo NO

- Search bar con icono lupa decorativo → usa [`<sc-search>`](14-search.md). Ese
  patrón compone `<p-iconfield>` + `<p-inputicon>` y NO funde el borde — el icono
  va overlay dentro del input.
- Campo de texto con label arriba + helper abajo → usa [`<sc-input>`](02-input.md).
  El input-group está pensado para usar input nativo `<input pInputText>` por
  dentro, sin chrome de field (label/error). Si necesitas label, ponlo en el
  `<header>` exterior de la sección.

## Anatomía

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────┐┌──────────────────────────────────┐┌─────┐      │
│ │  $  ││ Price                            ││ .00 │      │  ← addons absorben
│ └─────┘└──────────────────────────────────┘└─────┘      │     el borde del
└─────────────────────────────────────────────────────────┘     input central
```

PrimeNG se encarga del border-merge: el primer hijo pierde el border-radius
derecho, el último pierde el izquierdo, y los addons toman el color de borde
del input.

## API

| Prop      | Tipo                       | Default | Descripción                                       |
| --------- | -------------------------- | ------- | ------------------------------------------------- |
| `size`    | `'sm' \| 'md' \| 'lg'`     | `'md'`  | Matchea las alturas de `sc-input` para combinar.  |
| `fluid`   | `boolean`                  | `true`  | El grupo ocupa todo el ancho disponible.          |

No tiene Outputs ni ControlValueAccessor — el componente es puramente layout.
La interacción la llevan el `<input pInputText>` y los `<p-button>` proyectados.

## Tokens (heredados de Aura via sc-preset)

| `--p-inputgroup-addon-*`  | Origen                                  |
| ------------------------- | --------------------------------------- |
| `background`              | `--sc-bg-surface` (via formField)       |
| `border-color`            | `--sc-border-default` (via formField)   |
| `color`                   | `--sc-text-subtle` (icon color)         |
| `border-radius`           | `--sc-radius-200` (via formField)       |
| `padding`                 | `0.5rem` (literal Aura)                 |
| `min-width`               | `2.5rem` (literal Aura)                 |

## Decisiones de diseño SC

1. **No re-empaquetamos `<p-inputgroup-addon>` como `<sc-input-group-addon>`.**
   El addon es 100% PrimeNG sin overrides; un wrapper SC añadiría boilerplate
   sin valor (memoria `minimal-customization`). El consumer importa
   `InputGroupAddonModule` directamente.

2. **Dentro de `sc-input-group` se usa `<input pInputText>` nativo**, NO
   `<sc-input>`. Razón: `sc-input` arrastra chrome de campo-en-formulario
   (label, helper, error) que rompería el merge visual del grupo. Para el
   label, ponerlo en el `<header>` exterior de la sub-section.

3. **`size` matchea `sc-input`** (sm/md/lg con padding decimal 8.75/5.25 ·
   10.5/7 · 12.25/8.75) para que un input-group pueda convivir en una fila
   con `sc-input` sueltos sin desnivel.

4. **Botón addon**: usar `<p-button>` (no `<button class="btn">`). El CSS de
   merge en `<p-inputgroup>` apunta a `.p-button` específicamente — un botón
   plano no recibirá el merge correctamente.

## Accesibilidad

- El input proyectado mantiene su propio `aria-label` / `id` — el wrapper
  no inyecta nada.
- Los addons puramente decorativos (icono `$`) deben llevar `aria-hidden="true"`
  o no aportar texto; los addons interactivos (botón) son nativos y exponen
  su propio `aria-label`.
- El focus ring del input atraviesa el borde merged correctamente porque
  PrimeNG anula `outline` y lo replica con `box-shadow` sobre el grupo entero
  cuando hace falta.

## Uso en AED

- **`features/config/aed/aed-servicio-page`**: bloque "Estados de no
  disponibilidad" (Tag-input). Input texto + botón "Añadir" con `pi pi-plus`.
  Migrado en Session 33 desde un `.tag-input` custom con `<button class="btn">`
  + `<input class="field__input">`.

Sin más consumidores hoy. Se espera reutilización en:
- Inputs de URL con prefijo `https://` o `www.` en futuras config-pages.
- Inputs numéricos con unidad (cuando la unidad NO se quiere dentro del input
  como `[suffix]` de `sc-input-number`, sino como addon fuera del campo).

## Página demo

[`/components/input-group`](https://ds.smartcontact.netlify.app/components/input-group)
— 5 escenarios:

1. Addon de texto (`$` ... `.00`, `www.`...).
2. Addon con icono (`pi pi-user`).
3. Addons múltiples (hasta 2 por lado).
4. Addon de botón — caso real AED tag-input.
5. Sizes sm / md / lg.

## Figma reference

**Smart Contact Prime kit** — `❖ InputGroup`:
[node 6738:22644](https://www.figma.com/design/khNq9dJKNi13pNllrqm6dx/Smart-Contact-Prime?node-id=6738-22644).

El canvas incluye 3 frames:

- **Parts** — 18 part variants combinando Position (Left / Right / Multiple) ×
  Type (Text / Icon / Button / Checkbox / Radio / Icon Only Button).
- **Components** — 8 combinaciones boolean del wrapper inputgroup (Left, Right,
  Second Left, Second Right) — hasta 2 addons por lado.
- **Examples** — Light + Dark con 4 patrones: Addons, Multiple, Button,
  Check & Radio.

NO se modificaron variables Figma base. Wrapper SCDS consume tokens existentes
via `formField.*` → `sc-preset.ts` → `--sc-*`.

## Resuelve

- `inconsistencies-backlog.md` #5 — gap `<sc-input-group>` (P2). Trigger real:
  tag-input aed-servicio.
- `customs-catalog.md` §5.6 — gap documentado con node Figma.
