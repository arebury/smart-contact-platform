import { normalizeRoutePath } from './path-utils';

describe('normalizeRoutePath', () => {
  it('returns the path unchanged for plain routes', () => {
    expect(normalizeRoutePath('/admin/usuarios')).toBe('/admin/usuarios');
    expect(normalizeRoutePath('/dashboard')).toBe('/dashboard');
  });

  it('strips trailing /crear', () => {
    expect(normalizeRoutePath('/admin/usuarios/crear')).toBe('/admin/usuarios');
  });

  it('strips trailing /editar/:id', () => {
    expect(normalizeRoutePath('/admin/agentes/editar/42')).toBe('/admin/agentes');
    expect(normalizeRoutePath('/admin/grupos/editar/abc-123')).toBe('/admin/grupos');
  });

  it('collapses repository sub-paths to /admin/repositorios', () => {
    expect(normalizeRoutePath('/admin/agendas')).toBe('/admin/repositorios');
    expect(normalizeRoutePath('/admin/labels')).toBe('/admin/repositorios');
    expect(normalizeRoutePath('/admin/clasificacion-ia')).toBe('/admin/repositorios');
  });

  it('does not collapse paths that merely start with /admin', () => {
    expect(normalizeRoutePath('/admin/usuarios')).toBe('/admin/usuarios');
    expect(normalizeRoutePath('/admin/grupos')).toBe('/admin/grupos');
  });
});
