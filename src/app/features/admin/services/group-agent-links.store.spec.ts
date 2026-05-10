import { TestBed } from '@angular/core/testing';

import { GROUP_AGENT_LINKS_SEED } from './group-agent-links.seed';
import { GroupAgentLinksStore } from './group-agent-links.store';
import { GroupAgentLink } from './group-agent-links.types';

const STORAGE_KEY = 'smartcontact_group_agent_links';
const VERSION_KEY = 'smartcontact_group_agent_links_v';

describe('GroupAgentLinksStore', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    TestBed.configureTestingModule({});
  });

  function buildStore(): GroupAgentLinksStore {
    return TestBed.inject(GroupAgentLinksStore);
  }

  it('boots with the static seed when storage is empty', () => {
    const store = buildStore();
    expect(store.links()).toEqual(GROUP_AGENT_LINKS_SEED);
  });

  it('upsertLink inserts when the (agentId, groupId) pair is new', () => {
    const store = buildStore();
    const before = store.links().length;
    store.upsertLink({ agentId: 999, groupId: 999, channels: ['phone'], active: true });
    expect(store.links().length).toBe(before + 1);
    expect(store.getLink(999, 999)?.channels).toEqual(['phone']);
  });

  it('upsertLink replaces in place when the pair already exists', () => {
    const store = buildStore();
    store.upsertLink({ agentId: 1, groupId: 1, channels: ['phone'], active: true });
    const sizeAfterFirst = store.links().length;
    store.upsertLink({ agentId: 1, groupId: 1, channels: ['phone', 'chat'], active: false });
    expect(store.links().length).toBe(sizeAfterFirst);
    expect(store.getLink(1, 1)).toEqual({
      agentId: 1,
      groupId: 1,
      channels: ['phone', 'chat'],
      active: false,
    });
  });

  it('upsertLinkClamped drops channels not offered by the parent group', () => {
    const store = buildStore();
    store.upsertLinkClamped(
      { agentId: 7, groupId: 1, channels: ['phone', 'chat', 'email'], active: true },
      ['phone'],
    );
    expect(store.getLink(7, 1)?.channels).toEqual(['phone']);
  });

  it('removeLink drops a single pair, leaves others alone', () => {
    const store = buildStore();
    store.upsertLink({ agentId: 1, groupId: 1, channels: ['phone'], active: true });
    store.upsertLink({ agentId: 1, groupId: 3, channels: ['phone'], active: true });
    store.removeLink(1, 1);
    expect(store.getLink(1, 1)).toBeUndefined();
    expect(store.getLink(1, 3)).toBeDefined();
  });

  it("replaceLinksForAgent swaps out only that agent's links", () => {
    const store = buildStore();
    const otherAgentLinks = store.links().filter((l) => l.agentId !== 1);
    store.replaceLinksForAgent(1, [
      { agentId: 1, groupId: 12, channels: ['phone'], active: true },
    ]);
    expect(store.linksForAgent(1).length).toBe(1);
    for (const old of otherAgentLinks) {
      expect(store.getLink(old.agentId, old.groupId)).toEqual(old);
    }
  });

  it('removeAgent strips every link for that agent', () => {
    const store = buildStore();
    expect(store.linksForAgent(1).length).toBeGreaterThan(0);
    store.removeAgent(1);
    expect(store.linksForAgent(1).length).toBe(0);
  });

  it('removeGroup strips every link for that group', () => {
    const store = buildStore();
    expect(store.linksForGroup(1).length).toBeGreaterThan(0);
    store.removeGroup(1);
    expect(store.linksForGroup(1).length).toBe(0);
  });

  it('cascadeGroupChannelRemoval strips dropped channels and reports affected count', () => {
    const store = buildStore();
    // Group 11 (Online Support) has phone+chat+email. Pre-seed three links.
    store.upsertLink({ agentId: 7, groupId: 11, channels: ['phone', 'chat', 'email'], active: true });
    store.upsertLink({ agentId: 8, groupId: 11, channels: ['phone', 'email'], active: true });
    store.upsertLink({ agentId: 9, groupId: 11, channels: ['phone'], active: true });

    const affected = store.cascadeGroupChannelRemoval(11, ['email']);
    expect(affected).toBe(2);
    expect(store.getLink(7, 11)?.channels).toEqual(['phone', 'chat']);
    expect(store.getLink(8, 11)?.channels).toEqual(['phone']);
    expect(store.getLink(9, 11)?.channels).toEqual(['phone']);
  });

  it('persists to localStorage and rehydrates on a fresh instance', () => {
    const store = buildStore();
    store.upsertLink({ agentId: 42, groupId: 42, channels: ['chat'], active: false });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const next = TestBed.inject(GroupAgentLinksStore);
    expect(next.getLink(42, 42)).toEqual({
      agentId: 42,
      groupId: 42,
      channels: ['chat'],
      active: false,
    });
  });

  it('rebuilds from seed on a stale stored version', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ agentId: 99, groupId: 99, channels: [], active: true }]),
    );
    localStorage.setItem(VERSION_KEY, '0');
    const store = buildStore();
    expect(store.getLink(99, 99)).toBeUndefined();
    expect(store.links()).toEqual(GROUP_AGENT_LINKS_SEED);
  });

  it('falls back to seed on corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    localStorage.setItem(VERSION_KEY, '1');
    const store = buildStore();
    expect(store.links()).toEqual(GROUP_AGENT_LINKS_SEED);
  });
});

// Compile-time barrier — catch link shape regressions.
const _typeProbe: GroupAgentLink = {
  agentId: 0,
  groupId: 0,
  channels: ['phone'],
  active: true,
};
void _typeProbe;
