import { TestBed } from '@angular/core/testing';
import { LabelsStore } from './labels.store';

describe('LabelsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('seeds with the default labels', () => {
    const store = TestBed.inject(LabelsStore);
    expect(store.labels().length).toBeGreaterThan(0);
    expect(store.labels()[0]?.name).toBe('Orange España');
  });

  it('addLabel inserts and assigns a fresh id', () => {
    const store = TestBed.inject(LabelsStore);
    const before = store.labels().length;
    const created = store.addLabel({ name: 'Nueva', color: 'blue' });
    expect(store.labels().length).toBe(before + 1);
    expect(created.id).toBeGreaterThan(0);
    expect(store.getLabel(created.id)?.name).toBe('Nueva');
  });

  it('updateLabel patches by id', () => {
    const store = TestBed.inject(LabelsStore);
    store.updateLabel(1, { name: 'Renamed' });
    expect(store.getLabel(1)?.name).toBe('Renamed');
  });

  it('deleteLabels removes a batch', () => {
    const store = TestBed.inject(LabelsStore);
    store.deleteLabels([1, 2]);
    expect(store.getLabel(1)).toBeUndefined();
    expect(store.getLabel(2)).toBeUndefined();
  });
});
