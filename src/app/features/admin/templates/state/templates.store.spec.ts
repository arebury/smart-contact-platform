import { TestBed } from '@angular/core/testing';
import { TemplatesStore } from './templates.store';

describe('TemplatesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('seeds with the default templates', () => {
    const store = TestBed.inject(TemplatesStore);
    expect(store.templates().length).toBeGreaterThan(0);
    expect(store.templates()[0]?.title).toBe('Saludo inicial');
  });

  it('addTemplate stamps createdAt and updatedAt', () => {
    const store = TestBed.inject(TemplatesStore);
    const created = store.addTemplate({ title: 'Nueva', type: 'chat', body: 'Body' });
    expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(created.updatedAt).toBe(created.createdAt);
  });

  it('updateTemplate refreshes updatedAt without touching createdAt', () => {
    const store = TestBed.inject(TemplatesStore);
    const before = store.templates()[0]!;
    store.updateTemplate(before.id, { title: 'Renamed' });
    const after = store.getTemplate(before.id)!;
    expect(after.title).toBe('Renamed');
    expect(after.createdAt).toBe(before.createdAt);
    expect(after.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('deleteTemplates removes the batch', () => {
    const store = TestBed.inject(TemplatesStore);
    store.deleteTemplates([1, 2]);
    expect(store.getTemplate(1)).toBeUndefined();
    expect(store.getTemplate(2)).toBeUndefined();
  });
});
