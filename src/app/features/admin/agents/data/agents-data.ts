/**
 * Minimal Agent shape consumed by the Labels feature for cascading deletes
 * and the per-label agent counter. The full Agent model — channels, presence,
 * groups, etc. — lands when the Agents feature itself is migrated.
 */
export interface Agent {
  readonly id: number;
  readonly name?: string;
  readonly labels?: readonly number[];
}

/** No agents are seeded yet — the Agents feature owns this list. */
export const AGENTS_SEED: readonly Agent[] = [];
