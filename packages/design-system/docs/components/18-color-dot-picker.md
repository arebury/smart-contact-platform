# 18 · Color Dot Picker (`<sc-color-dot-picker>`)

> **Type**: Pure SC · **AED uses**: 1 · **Figma parity**: Sin Figma equivalente

> Fila inline de "puntos de color" seleccionables. Single-choice radio-style. Usado en el form de etiquetas para que el supervisor elija qué color tendrá una Label nueva (`<sc-label-chip>` lo renderiza después). Two-way bindable.
>
> Categoría ⚪ **Pure SC** — pattern custom basado en el `ColorPicker` del prototipo React. NO confundir con `<p-colorpicker>` (color picker libre tipo RGB wheel) — este es un picker discreto de N opciones predefinidas.

## TL;DR

```html
<sc-color-dot-picker
  [options]="colorOptions()"
  [(value)]="form().color"
/>
```

`colorOptions()` es un signal con la paleta de colores Label disponibles (`{ value: 'red', label: 'Rojo', color: '#ef4444' }`...).

## Cuándo usarlo

- Seleccionar un color de **paleta finita y curada** (4-12 opciones).
- Form de creación/edición de Label (único caso real hoy).
- Cualquier setting visual donde el usuario elige un color de una lista predefinida (futuro: theme picker, etiquetas de calendario, etc.).

## Cuándo NO usarlo

- Color libre RGB / HEX → `<p-colorpicker>` raw.
- Más de ~12 opciones → mejor un select / grid.
- Estado read-only (mostrar el color elegido) → `<sc-label-chip>` o un dot estático.

## Anatomía

```
┌─────────────────────────────────┐
│  ●  ●  ●  ●  ●  ●  ●  ●         │   ← row of color dots
│        ↑                        │
│      selected (ring + check)    │
└─────────────────────────────────┘
```

Cada dot es un `<button type="button">` con background del color. Al seleccionar, aparece un ring de focus + check mark (CSS pseudo-element).

## API

```typescript
interface ColorDotOption {
  value: string;       // stable id stored in the data model (e.g. 'red')
  label: string;       // tooltip + a11y label (e.g. 'Rojo')
  color: string;       // CSS color or var() painted as the dot
}

interface ScColorDotPickerProps {
  options: readonly ColorDotOption[];   // requerido — paleta
  value: model<string>;                 // two-way con `[(value)]`
}
```

## Tokens consumidos

| Token | Uso |
|-------|-----|
| Dot size | 20×20 px |
| Border-radius | 50% (circle) |
| `--sc-shadow-card` | leve sombra en hover |
| `--p-focus-ring-color` | ring de selección |
| Check icon | inline SVG blanco sobre el dot seleccionado |
| Transition | 150ms ease-out |

## Decisiones de diseño SC

- **Modelo `{value, label, color}` flexible**: el `color` admite hex, rgb(), o `var(--sc-label-X-dot)`. Permite consumer pasar tokens directamente sin acoplar al picker.
- **Single-choice (no multi)**: una etiqueta tiene UN color. Multi-choice rompe la semántica.
- **`[(value)]` two-way**: el form de label usa `<sc-color-dot-picker [(value)]="color">` con signal. Two-way evita boilerplate de adapter `onColorChange`.
- **Tooltip = label**: hover muestra "Rojo", "Azul"... derivado del `label` de la option. A11y también lo usa.
- **`select()` simple**: el método interno solo hace `this.value.set(option.value)` — sin lógica adicional. Mantener el componente atómico.

## A11y

- Cada dot es un `<button type="button">` real con `aria-label="<color label>"` y `aria-pressed="<selected>"`.
- Teclado: **Tab** entre dots, **Space/Enter** selecciona.
- Focus ring visible (no se confía solo en el background color para indicar selección — accesible para daltonismo).

## Uso en AED

**1 instancia**:
- `label-form-panel` en el CRUD de etiquetas — el supervisor elige color al crear/editar una Label.

## Página demo

Pendiente — gallery `/components/color-dot-picker` con:
- Paleta completa (Label colors).
- Custom palette (ejemplo con colores hex arbitrarios).
- Estado disabled (no soportado hoy — gap para añadir si aparece caso).
- Wrap en contenedor estrecho.

## Figma reference

**No aplica** — pattern app-specific. Smart Contact Prime kit no tiene picker de colores discreto. Si Marta lo modela, anotar URL y promocionar a 🟢 Extended.
