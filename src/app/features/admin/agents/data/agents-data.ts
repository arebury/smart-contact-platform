/**
 * Agent shape consumed by features that already need an agent reference
 * (Labels — cascading delete on label removal, Seguridad — bulk password
 * regeneration). The full agent model (channels, presence, recording,
 * groups, schedules…) lands when the Agents feature itself is migrated.
 */
export interface Agent {
  readonly id: number;
  readonly name: string;
  readonly code: string;
  readonly extension: string;
  readonly email?: string;
  readonly status: 'active' | 'inactive';
  readonly labels?: readonly number[];
}

/** No agents seeded yet — the Agents feature owns this list. */
export const AGENTS_SEED: readonly Agent[] = [];
