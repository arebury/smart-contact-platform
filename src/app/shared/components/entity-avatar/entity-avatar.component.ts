import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Small circular avatar with the entity's initials. Background and text
 * colours are picked deterministically from the `--sc-label-*` palette
 * via a simple char-sum hash so the same name always renders with the
 * same colour pair across pages and reloads.
 *
 * Used as a leading affordance in list-page name cells: it gives the
 * row a fixed visual anchor your eye can scan against, and the colour
 * variation keeps a long table from reading as a flat grey wall.
 */
@Component({
  selector: 'aed-entity-avatar',
  standalone: true,
  templateUrl: './entity-avatar.component.html',
  styleUrl: './entity-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityAvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md'>('md');

  protected readonly initials = computed(() => {
    const raw = this.name().trim();
    if (!raw) return '·';
    const parts = raw.split(/\s+/);
    if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.slice(0, Math.min(2, raw.length)).toUpperCase();
  });

  protected readonly paletteIndex = computed(() => {
    const name = this.name();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return hash % PALETTE.length;
  });

  protected readonly bgVar = computed(() => `var(${PALETTE[this.paletteIndex()].bg})`);
  protected readonly fgVar = computed(() => `var(${PALETTE[this.paletteIndex()].fg})`);
}

interface AvatarSwatch {
  readonly bg: string;
  readonly fg: string;
}

/**
 * 8-step palette pulled from the existing `--sc-label-*` tokens. Stays
 * within the brand colour system — no new colours invented for the
 * avatar layer. Order matters: changing it reshuffles which name maps
 * to which colour, so append-only.
 */
const PALETTE: readonly AvatarSwatch[] = [
  { bg: '--sc-label-blue-bg', fg: '--sc-label-blue-text' },
  { bg: '--sc-label-green-bg', fg: '--sc-label-green-text' },
  { bg: '--sc-label-purple-bg', fg: '--sc-label-purple-text' },
  { bg: '--sc-label-amber-bg', fg: '--sc-label-amber-text' },
  { bg: '--sc-label-teal-bg', fg: '--sc-label-teal-text' },
  { bg: '--sc-label-orange-bg', fg: '--sc-label-orange-text' },
  { bg: '--sc-label-red-bg', fg: '--sc-label-red-text' },
  { bg: '--sc-label-gray-bg', fg: '--sc-label-gray-text' },
];
