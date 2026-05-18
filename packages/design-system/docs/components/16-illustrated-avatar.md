# 16 · Illustrated Avatar (`<sc-illustrated-avatar>`)

> **Type**: Pure SC · **AED uses**: 7 · **Figma parity**: Sin Figma equivalente

> Avatar circular que renderiza una ilustración SVG hasheada determinísticamente del nombre de la entidad. Mismo nombre → mismo avatar siempre (en todas las páginas, recargas, dark mode). Si se pasa `[photo]`, la foto subida prevalece.
>
> Categoría ⚪ **Pure SC** — pattern custom, NO existe en Smart Contact Prime ni en PrimeOne. Inspiración: avatares hash-based de GitHub / Linear, pero con SVG ilustrados curados por Marta (no identicons).

## TL;DR

```html
<!-- Persona (default pool: 24 retratos ilustrados) -->
<sc-illustrated-avatar [name]="agent().name" [size]="44" />

<!-- Grupo / entidad no-persona (pool abstract: 3 patrones) -->
<sc-illustrated-avatar [name]="group().name" pool="abstract" [size]="44" />

<!-- Con foto subida (la foto gana sobre la ilustración) -->
<sc-illustrated-avatar [name]="user().name" [photo]="user().photo" [size]="64" />
```

## Cuándo usarlo

- Avatares de **personas**: agentes, usuarios, supervisor topbar.
- Avatares de **entidades no-personales**: grupos, queues, servicios — usar `pool="abstract"`.
- Preview en form headers o list cells donde el nombre es conocido pero la foto aún no.

## Cuándo NO usarlo

- Logos / íconos de marca → componente diferente.
- Avatar 100% custom subido por el usuario sin fallback → usar `<sc-photo-upload>` directamente.

## Pools disponibles

| Pool | Count | Files | Cuándo |
|---|---|---|---|
| `illustrated` (default) | 24 | `avatar-01.svg`…`avatar-24.svg` | Personas (agentes, users) |
| `abstract` | 3 | `abstract-01.svg`…`abstract-03.svg` | Grupos, entidades funcionales — asignar "cara" a "Ventas Nacional" lee mal |

Live bajo `apps/aed/src/assets/avatars/<pool>/`.

## API

```typescript
interface ScIllustratedAvatarProps {
  name: string;                           // requerido — fuente del hash
  photo?: string | null | undefined;      // opcional — si set, la foto gana
  size?: number;                          // default 40 — px del círculo
  pool?: 'illustrated' | 'abstract';      // default 'illustrated'
}
```

## Hashing

```typescript
function hashName(name: string, modulo: number): number {
  let hash = 5381;
  const trimmed = name.trim();
  for (let i = 0; i < trimmed.length; i++) {
    hash = ((hash << 5) + hash + trimmed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}
```

DJB2 hash bien distribuido. Garantiza que "Marta" siempre cae en el mismo avatar, sin necesidad de almacenar el índice en el modelo. Idempotente entre reloads.

## Tokens consumidos

| Token | Uso |
|-------|-----|
| `--sc-bg-secondary-subtle` | placeholder mientras carga SVG |
| `--sc-shadow-card` | sombra circular sutil |
| Border-radius | 50% (full circle) |
| Hover transform | scale(1.05) — efecto "image fills more" |
| Transition | 150ms ease-out |

## Decisiones de diseño SC

- **Hash determinístico (no random)**: la consistencia visual entre páginas y reloads es crítica para reconocer entidades de un vistazo. Random rompería la asociación nombre↔avatar.
- **Dos pools, no uno**: agentes son personas (rostros), grupos NO son personas (asignar cara a "Cobros" rompe la metáfora). El pool abstract tiene patrones geométricos no antropomorfizados.
- **`[photo]` gana sobre ilustración**: si el usuario subió foto via `<sc-photo-upload>`, esa wins. La ilustración es siempre fallback.
- **`undefined` aceptado en `[photo]`**: las entidades tienen `Agent.photo?: string`. Aceptar undefined evita `?? null` glue en cada consumer.
- **Hover zoom CSS-only**: el efecto "imagen llena más el círculo en hover" se hace via transform scale del SVG dentro del clip-path circular. Sin segunda imagen, sin JS.

## Uso en AED

**7 instancias**:
- Sticky form headers (agent / user / group): leading slot del header con `size=44`.
- List cells: column "Nombre" con avatar a la izquierda del texto.
- Detail views: avatar grande (64-80px) junto al name.

## Página demo

Pendiente — gallery `/components/illustrated-avatar` con grid de los 24 ilustrados + 3 abstract, comparación con/sin photo, tamaños sm/md/lg, hover zoom demo.

## Figma reference

**No aplica** — los SVG vienen del set propio de Marta (`apps/aed/src/assets/avatars/`). Si en algún momento se publican en Figma como library, anotar URL aquí.
