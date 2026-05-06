import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ILLUSTRATED_COUNT = 24;

/**
 * Circular avatar that renders one of 24 illustrated portraits hashed
 * deterministically from the entity name (so the same person always
 * gets the same avatar across pages and reloads). When `photo` is set
 * the photo wins; the illustration is the fallback for photo-less
 * entities, replacing the older initials-on-color treatment from
 * `EntityAvatarComponent` for cases where personality matters more
 * than density (cards, detail pages, hover targets).
 *
 * The hover zoom replicates the Figma source pair without needing
 * two SVGs: the SVG is wrapped in a clipped circle and scaled with
 * a CSS transform — the SVG's own circular clip-path scales with it
 * and the outer wrapper re-clips to the original bound, producing
 * the same "image fills more of the circle on hover" effect.
 */
@Component({
  selector: 'aed-illustrated-avatar',
  standalone: true,
  templateUrl: './illustrated-avatar.component.html',
  styleUrl: './illustrated-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IllustratedAvatarComponent {
  readonly name = input.required<string>();
  /** When set, overrides the illustration with the user's uploaded photo.
   *  Accepts `undefined` so it can be wired directly to optional fields
   *  on entity types (e.g. `Agent.photo?: string`) without `?? null`
   *  glue at every call site. */
  readonly photo = input<string | null | undefined>(null);
  /** Pixel size of the rendered circle. Defaults to 40px. */
  readonly size = input<number>(40);

  protected readonly illustrationSrc = computed(() => {
    const idx = hashName(this.name(), ILLUSTRATED_COUNT);
    return `/assets/avatars/illustrated/avatar-${String(idx).padStart(2, '0')}.svg`;
  });

  protected readonly photoSrc = computed(() => this.photo() ?? null);

  protected readonly sizePx = computed(() => `${this.size()}px`);
}

/** Stable, well-distributed hash → bucket in [0, modulo). */
function hashName(name: string, modulo: number): number {
  let hash = 5381;
  const trimmed = name.trim();
  for (let i = 0; i < trimmed.length; i++) {
    hash = ((hash << 5) + hash + trimmed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}
