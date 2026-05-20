# Migration Safety — Smart Contact Design System

> **Filosofía**: SCDS minimiza la customización sobre PrimeNG. Styling sí (PrimeNG está diseñado para eso), reinventar HTML/lógica NO. Objetivo: mantenimiento sostenible para devs futuros + zero-surprise en upgrades.

Este documento captura las reglas, riesgos y pro tips para que **upgrades de PrimeNG, re-sync con el Figma kit Prime o cambios internos** NO rompan el camino recorrido (24 componentes, 7 capas de tokens, customs-catalog).

---

## TL;DR — 3 reglas blindaje

1. **`--sc-*` es la única source of truth de tokens** — viven en código (`tokens/layers/*.css`). Los componentes consumen `--sc-*`, nunca `--p-*` directo.
2. **Wrappers SCDS encapsulan PrimeNG** — AED usa `<sc-inputtext>`, nunca `<p-inputtext>` directo. Single point of adaptation cuando PrimeNG cambie.
3. **`customs-catalog.md` registra TODA divergence** — cualquier override de PrimeOne debe tener entry. Sin entry, no es divergencia permitida — es deuda invisible.

---

## Arquitectura de aislamiento

```
┌─────────────────────────────────────────────────────────────┐
│  AED / ds-docs / (futuro Memory)                            │
│                                                             │
│  consume → <sc-*> components                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  packages/design-system/components/<x>/                     │
│                                                             │
│  - Wrappers Extended sobre <p-*> (input, select, modal...)  │
│  - Pure-SC para patterns app-only                           │
│  - Consume --sc-* tokens                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  packages/design-system/tokens/                             │
│                                                             │
│  - layers/01-primitive..07-dark.css → define --sc-*         │
│  - sc-preset.ts → bridge --p-* ← --sc-* (PrimeNG)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PrimeNG 21 (Aura preset base)                              │
│                                                             │
│  Espera tokens --p-* — los recibe del bridge sc-preset.ts   │
└─────────────────────────────────────────────────────────────┘
```

Cualquier cambio upstream PrimeNG SOLO afecta la última capa. El bridge contiene el blast radius. Los consumers no se enteran.

---

## ¿Qué se puede tocar?

### ✅ Seguro (no rompe nada)

- **Valores de `--sc-*`** en `tokens/layers/01-primitive.css` … `07-dark.css`. Cualquier color, spacing, radius, shadow puede ajustarse. La cascada `--p-*` ← `--sc-*` propaga automáticamente.
- **Overrides en `sc-preset.ts`** documentados (Custom collection en código). Añadir un nuevo `--p-X` con valor `--sc-X` o un valor literal.
- **Componentes SCDS internos** (SCSS, templates, props). Mientras la API pública (`@Input` / `@Output`) se mantenga estable.
- **Crear nuevos componentes SC** (pure-sc o extended) siguiendo el patrón del DS.
- **Entries en `customs-catalog.md`** documentando divergencias nuevas.
- **Docs en `packages/design-system/docs/`** — son source of truth de intención.

### ⚠️ Cuidadoso (puede romper, requiere audit visual)

- **Refactor de `sc-preset.ts`** (renombrar `--p-*`, cambiar mapping). Hacer Playwright snapshot diff antes/después.
- **Migración PrimeNG version** (21 → 22). El bridge protege la mayoría, pero:
  - Verificar que los `--p-*` que mapeamos siguen existiendo en la version nueva.
  - Verificar APIs de `<p-*>` que envolvemos (props, events, slots).
  - Playwright snapshot diff de pantallas representativas.
- **Cambiar API pública de un componente SCDS** (renombrar `@Input`, cambiar tipo de `@Output`). Hacer en major version bump con deprecation cycle.
- **Mover archivos** dentro del DS. Verificar TS paths (`@shared/components/...`).

### 🔴 Peligroso (NO hacer sin causa muy justificada)

- **Modificar variables del Figma SC base** (heredadas del PrimeOne UI Kit Pro original). El file es nuestro fork, no autosync, pero tocar variables base destruye trazabilidad si en futuro queremos comparar con upstream. Política heredada de la GUIA (§L277-323) y `audit/01-identity-recap.md §2.10`.
- **Consumer (AED) accediendo `--p-*` directo** en vez de `--sc-*`. Rompe el aislamiento. Si lo necesitas, primero exponer el token vía `--sc-*` y consumir.
- **Componentes AED usando `<p-X>` directo** en vez de `<sc-X>`. Si `<sc-X>` no existe aún, crearlo antes (Extended wrapper).
- **CSS overrides sobre `<p-X>` desde AED** (estilando PrimeNG directamente fuera de SCDS). Esos selectores se rompen en cualquier upgrade.

---

## Qué hemos hecho hasta hoy (historial preventivo)

### Sesión 30 — Cocinado tokens

- Auditoría 7 capas `--sc-*` validadas 1:1 contra PrimeOne 4.0. ✅
- Bootstrap `sc-preset.ts` con bridge completo.
- 13 divergencias registradas en `customs-catalog.md`.

### Sesión 31 — Migraciones AED a SCDS

- 24 commits, ~25 inputs/selects nativos AED migrados a `<sc-inputtext>` / `<sc-select>` / `<sc-inputnumber>`.
- Componente `<sc-search>` nuevo (Extended sobre `p-iconfield` + `pInputText` + clear button).
- Auditoría profunda pure-sc: 0 issues nivel-1.
- Figma SC `❖ Search` canvas compuesto (Light + Dark + Components frames) — composición aditiva, **NO se modificaron variables Figma base**.

### Sesión 32 (esta) — Cierre Fase 1 + Spec docs

- 5 forms residuales AED migrados (template, label, user, group, repo) → Fase 1 100% cerrada.
- Auditoría nivel-2 pure-sc: 8/21 clean, 0 P0/P1 reales tras sanity check.
- 16 nuevos spec docs creados (uno por pure-sc top-usage).
- 4 refactors de consistencia: bulk-edit-menu + inline-rename-cell + toggle-switch + label-chip — para reducir custom innecesario y alinear con PrimeNG.

---

## Pro tips para devs futuros

### 1. Antes de crear un componente nuevo

**Pregunta en este orden**:

1. ¿PrimeNG ya lo tiene? → wrapper Extended SCDS (e.g. `<sc-inputtext>` → `<p-inputtext>`).
2. ¿PrimeNG tiene similar con `pTemplate` slots? → usar el slot, no reescribir el componente.
3. ¿PrimeNG tiene la lógica pero quiero customizar el render? → headless mode si existe (componentes con `[unstyled]`).
4. ¿PrimeNG NO lo tiene? → pure-sc, pero documentar en `customs-catalog.md` por qué (idealmente con referencia a patrón industry: GitHub danger zone, Linear command palette, etc.).

### 2. Aprovecha `pTemplate`

PrimeNG expone slots de templating en casi todos sus componentes. Antes de reescribir un item / option / cell, busca el `pTemplate="item"` (o equivalente). Nuestros wrappers Extended (`<sc-select>`, `<sc-multiselect>`, `<sc-datepicker>`) ya pasan estos templates a través.

```html
<sc-select [options]="agentTypes" [(value)]="selected">
  <ng-template pTemplate="item" let-t>
    {{ typeLabels[t] | translate }}
  </ng-template>
</sc-select>
```

### 3. Aprovecha el `pt` (passthrough) prop

PrimeNG 18+ tiene props passthrough para inyectar attributes/classes en subnodes de un componente sin tocar el código nuestro. Útil para hacks específicos sin custom CSS:

```html
<p-select [pt]="{ root: { class: 'mi-clase' }, dropdown: { 'data-testid': 'x' } }" />
```

### 4. NO uses `::ng-deep` salvo casos canónicos

Aceptable cuando:
- Resetea chrome de PrimeNG (`.p-dialog`, `.p-toast`) para mostrar shell AED.
- `prefers-reduced-motion` a11y.
- `:disabled` en botones nativos.

NO aceptable cuando:
- Estilando un componente custom propio (esos deben tener API).
- Sobrescribiendo tokens (debe ir vía bridge `sc-preset.ts`).

### 5. Checklist anti-divergencia (4 preguntas)

Antes de añadir un prop, slot o CSS override a un componente SCDS, responde:

1. **¿PrimeNG ya lo expone?** → usar la API nativa.
2. **¿Un token PrimeNG lo cubre?** → ajustar via `sc-preset.ts`, no via CSS.
3. **¿Es brand-required?** → entry en `customs-catalog.md`, override en preset.
4. **¿Es handoff Prime 1:1?** → importar el CSS de Prime y linkar.

Si las 4 son "no", probablemente NO necesitas la divergence.

Detalle completo en [`customs-catalog.md §0`](customs-catalog.md).

### 6. CVA wrappers con signals: `untracked()` SIN side-effects

Cuando un wrapper CVA escribe a un signal dentro de `writeValue()`, envolver con `untracked()` aísla la escritura del contexto reactivo. Patrón establecido S32:

```typescript
writeValue(v: string | null | undefined): void {
  untracked(() => this.value.set(v ?? ''));
}
```

**Regla crítica** (Perplexity audit S32): el bloque `untracked` debe escribir SOLO el signal de valor del CVA (`this.value.set(...)`). NO meter side-effects:

```typescript
// ❌ MAL — side-effects silenciados:
writeValue(v: string): void {
  untracked(() => {
    this.value.set(v);
    this.dirty.set(false);   // <-- el effect que observa dirty NO se entera
    this.lastSync.set(Date.now());
  });
}

// ✅ BIEN — solo el signal CVA:
writeValue(v: string): void {
  untracked(() => this.value.set(v));
  // Side-effects (si los hubiera) van FUERA, sin untracked:
  this.dirty.set(false);
}
```

Verificado S32: los 6 wrappers actuales (input, select, multi-select, datepicker, input-number, search) cumplen esta regla. Para wrappers futuros, mantener la disciplina.

### 7. Refactor de wrappers PrimeNG: audit CSS overrides en consumers

Cuando se refactoriza un wrapper SCDS cambiando su DOM interno (ej. `<input type="checkbox">` → `<p-toggleswitch>`), los consumers podrían tener CSS overrides apuntando al DOM antiguo que se rompen silenciosamente (AOT NO los detecta — solo valida tipos TS).

**Checklist post-refactor**:

1. `grep -rn ".sc-X__internal\|.toggle-switch input\|patrón viejo" apps/supervisor/src --include="*.scss"` — buscar selectors apuntando al DOM antiguo del wrapper.
2. Verificar AOT verde (cubre TS strict pero NO CSS).
3. Si hay screenshots Playwright: comparar antes/después.
4. Si NO hay tests visuales: revisar consumers manualmente en dev server.

Verificado S32 para toggle-switch (refactor CSS-checkbox → p-toggleswitch wrapper): cero overrides huérfanos en AED, los 21 consumers safe.

### 8. Componentes pure-sc justificados vs sospechosos

**Justificados (no tocar)**:
- App patterns sin PrimeNG eq: `command-palette`, `keyboard-shortcuts`, `page-header`, `sticky-form-header`, `section-card`, `form-section-nav`, `form-danger-zone`, `empty-state`, `bulk-action-bar`.
- Custom assets: `illustrated-avatar`, `photo-upload`, `color-dot-picker`.
- Composiciones sobre sc-modal: `delete-entity-dialog`, `impact-preview-dialog`, `confirm-host`.

**Refactored en S32 (consistencia)**:
- `bulk-edit-menu` ahora usa `<sc-select>` interno (era `<select>` nativo).
- `inline-rename-cell` ahora usa `<sc-inputtext>` interno (era `<input>` nativo).
- `toggle-switch` ahora envuelve `<p-toggleswitch>` (era CSS sobre checkbox nativo).
- `label-chip` ahora envuelve `<p-tag>` con brand tokens (era CSS puro).

Documentado en `customs-catalog.md §5` para futura referencia.

---

## Qué riesgos siguen vivos

### Bajo riesgo

- **Drift Figma ↔ código**: si Marta cambia un valor en Figma SC sin pasar por customs-catalog → no rompe runtime, pero el design system se desincroniza. Mitigación: auditorías periódicas (S30, S31 hechas).
- **PrimeNG patches sin breaking changes** (21.x → 21.y): el bridge protege.

### Medio riesgo

- **PrimeNG major upgrade** (21 → 22): requiere audit de:
  - `--p-*` tokens existentes vs new.
  - API changes en componentes que envolvemos.
  - Playwright snapshot diff.
- **PrimeOne Figma kit upgrade** (v4 → v5): merge manual, decisión por entry en catalog.

### Alto riesgo (NO debería pasar si seguimos las reglas)

- **Consumer accediendo `--p-*` directo** o `<p-X>` directo desde AED: aislamiento roto. Lint rule futura podría prevenir.
- **Customs sin entry en catalog**: deuda invisible que rompe en audit. Code review + lint pueden ayudar.

---

## Referencias cruzadas

- [`customs-catalog.md`](customs-catalog.md) — registro completo de divergencias documentadas + checklist anti-divergencia.
- [`audit/00-diagnosis.md`](audit/00-diagnosis.md) — diagnóstico inicial de tokens.
- [`audit/01-identity-recap.md`](audit/01-identity-recap.md) — política de variables Figma SC (§2.10).
- [`audit/02-sc-vs-aura-audit.md`](audit/02-sc-vs-aura-audit.md) — validation `--sc-*` 1:1 con Aura.
- [`audit/03-bridge-coverage.md`](audit/03-bridge-coverage.md) — cobertura `sc-preset.ts`.
- [`MIGRATION-INVENTORY.md`](MIGRATION-INVENTORY.md) — inventario actualizado de componentes + status.
- [`tokens/GUIA.md`](../tokens/GUIA.md) — guía de identidad SC en español (para diseño).
