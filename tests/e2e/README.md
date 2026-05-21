# Playwright cross-app smoke

> Red de seguridad mínima para validar que un cambio no rompe las 3 surfaces
> del monorepo (AED + Memory + ds-docs) silenciosamente.

## Cuándo se ejecuta automáticamente (protocolo Claude)

Claude debe correr `npm run e2e` **por inercia**, sin que Rafa lo pida,
después de cualquiera de estos cambios:

1. **Cualquier toque en `packages/design-system/`**:
   - Componentes SCDS (selector, template, styles, props, behavior).
   - Tokens (layers/\*.css, sc-preset.ts, customs-catalog).
   - Stylesheets globales (`_sc-overlay-sizes.scss`, `_sc-toast.scss`).
   - Barrel exports.

2. **Cambios en `apps/supervisor/src/app/core/`**:
   - Servicios shared (`ThemeService`, `LanguageService`, etc.).
   - Directives shared (`scClickOutside`, `scSortable`).
   - Layout shell (`top-bar`, `sidebar`, `app-shell`).
   - `app.config.ts` (providers, ngx-translate, PrimeNG).
   - i18n files (`assets/i18n/*.json`) — añadir/eliminar keys.

3. **Renames masivos cross-app** (estilo Bloques D/E/F del S47):
   - Folder rename de componente SCDS.
   - Selector rename `<sc-X>` → `<sc-Y>`.
   - Class name TS rename de componente público.

4. **Tras audit/refactor que toca muchos archivos** (>20):
   - Sweep de tokens hardcoded.
   - Sweep de prefijo legacy.
   - Cualquier limpieza con regex masivo.

## Cuándo NO se ejecuta (skip por defecto)

- Cambios scoped a UN feature concreto (`features/memory/components/X/`
  o `features/admin/agents/`). El feature dueño se valida visualmente con
  Playwright dedicado si lo merece, pero el cross-app smoke no aplica.
- Cambios solo en docs/markdown.
- Cambios en spec files unitarios (`.component.spec.ts`).
- Edits triviales (typo, comment, formato).

## Comandos

```bash
npm run e2e          # ejecuta todos los smoke tests (CI mode)
npm run e2e:headed   # con browser visible (debug local)
npm run e2e:ui       # UI mode interactivo de Playwright
npm run e2e:report   # abre el último reporte HTML
```

Los webServers (`supervisor` en :4200 + `ds-docs` en :4201) se arrancan
automáticamente con `--no-hmr` (requerido en Angular 21 de este repo).
`reuseExistingServer: !CI` permite que en local los servers ya levantados
se reutilicen — más rápido en dev.

## Tests existentes (22 tests en 4 archivos)

| Archivo | Cubre | Tests |
|---|---|---|
| `smoke-aed.spec.ts` | AED list-pages + config sistema | 5 |
| `smoke-memory.spec.ts` | 4 páginas Memory + shell compartido | 4 |
| `smoke-ds-docs.spec.ts` | ds-docs home + 4 galleries post-rename | 5 |
| `visual-regression.spec.ts` | 4 screens canonical × 2 themes baseline pixel-diff | 8 |

## Visual regression (S55 E)

`visual-regression.spec.ts` arma un baseline pixel-diff de 4 pantallas
canonical en light + dark. Detecta drift visual silencioso (token tuning,
refactor SCSS, sweep tokens) sin que nadie tenga que mirar a ojo.

**Operativa**:
```bash
npm run e2e -- visual-regression.spec.ts                      # check vs baseline
npm run e2e -- visual-regression.spec.ts --update-snapshots   # regenerar baseline
```

**Decisión al fallar un test**:
- ¿El cambio era intencional? → `--update-snapshots` + commit baseline nueva.
- ¿Es regresión? → fix antes de seguir.

**Screens cubiertos**:
- `aed-agentes-list` — list-page chrome (table + page-header + toolbar)
- `aed-agentes-edit` — form-page chrome (sticky-form-header + section-cards)
- `ds-docs-inputtext` — gallery (wrapper sizes/variants)
- `memory-categorias` — Memory shell + list chrome

**Detalle técnico**:
- Theme aplicado POST-bootstrap (`page.evaluate` tras `goto`) — ds-docs limpia
  clases inyectadas pre-bootstrap, evitamos esa race.
- Animations + transitions off via `addStyleTag` para evitar flicker.
- Tolerancia `maxDiffPixelRatio: 0.02` (2%) para acomodar antialias.

## Protocolo cuando algún test falla

1. **NO** mergear el cambio hasta tener verde.
2. Revisar diff y entender qué tocó qué.
3. Si la regresión es legítima (intended visual change), actualizar el
   assertion del test, no el código.
4. Si la regresión es bug, fix antes de seguir.
5. Si el test es flaky, etiquetar `test.fixme()` con motivo y commit
   separado del fix de funcionalidad.

## Mantenimiento

- Cuando añadas una **página nueva** (admin section, Memory subpage, ds-docs
  gallery), añadir su smoke aquí. **Pareja**: un test smoke por cada
  page-component.
- Cuando renombres una ruta o selector, actualizar los locators del test
  correspondiente en el mismo commit.
- Tests caen "fuera" del scope de los lint-staged hooks — no se ejecutan en
  cada commit. Son red post-cambio, no pre-commit gate (todavía).
