# Migration Safety — Smart Contact Design System

> **Filosofía**: SCDS minimiza la customización sobre PrimeNG. Styling sí (PrimeNG está diseñado para eso), reinventar HTML/lógica NO. Objetivo: mantenimiento sostenible para devs futuros + zero-surprise en upgrades.

Este documento captura las reglas, riesgos y pro tips para que **upgrades de PrimeNG, re-sync con el Figma kit Prime o cambios internos** NO rompan el camino recorrido (24 componentes, 7 capas de tokens, customs-catalog).

---

## TL;DR — 3 reglas blindaje

1. **`--sc-*` es la única source of truth de tokens** — viven en código (`tokens/layers/*.css`). Los componentes consumen `--sc-*`, nunca `--p-*` directo. **Hecho cumplir por máquina (S62-ext-3): `npm run tokens:guard`** (pre-commit) falla el commit si un componente usa `var(--p-*)` fuera de `sc-preset.ts`, o una primitiva de escala `--sc-scale-*` en vez del alias `--sc-spacing-*`. Así el radio de explosión de un upgrade de PrimeNG queda en un único archivo (el preset).
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

## Tipografía migration-safe (S67)

**3 puntos clave (resumen ejecutivo):**

1. Tus tipos viven en `--sc-font-*` (tus capas) + el bridge `sc-preset.ts`, **no dentro de PrimeNG**.
2. El único riesgo es que un update RENOMBRE un slot `--p-*-font-size` del bridge → desajuste visual, no crash, **detectable** por el comprobador de tipo y arreglable en una línea.
3. **NO vincular `--sc-font-*` a la escala de PrimeNG** — invertiría la arquitectura.

> Detalle del tooling (`tokens:type-parity` read-only, escala base-14, olas 1+2, guard
> Dura 4) → [`tokens/README.md`](../tokens/README.md). La decisión arquitectónica formal →
> DD-11 en [`DECISIONS.md`](DECISIONS.md). Esta sección cubre solo el **racional de blindaje**.

**El miedo:** "si meto mis tipos, ¿un update de PrimeNG los rompe?". No los borra, y un
desajuste sería **detectable y de arreglo en un sitio**. Por qué:

- **Tus tipos viven en TUS ficheros**, no dentro de PrimeNG: los definen `--sc-font-*`
  (capas de tokens) y el bridge `sc-preset.ts` los empuja a `--p-*`. Un update de PrimeNG
  reemplaza SUS ficheros; los tuyos persisten y se re-aplican encima. El update no puede
  deshacer lo que está en una capa que él no toca. Es la **misma superficie** que color y
  espaciado, que ya sobreviven a los updates. (Prueba viva: el preset fija `fontSize` de
  button/formField a `--sc-font-size-*` desde S57/S62 — en producción, sin roturas.)
- **El único riesgo real** = que un update RENOMBRE un slot `--p-*-font-size` que el bridge
  rellena → ese componente cae al default de PrimeNG (un **desajuste visual**, no un crash).
  Acotado a los slots del bridge, **detectable** por el comprobador de tipo y **arreglable**
  en una línea del preset.
- **NO vincular `--sc-font-*` a la escala de PrimeNG (`--p-*`)**: invertiría la arquitectura
  (PrimeNG pasaría a ser la fuente → su update cambiaría nuestra letra). La fuente es `--sc-*`;
  el bridge obliga a PrimeNG a obedecer. En Figma igual: los Text Styles se enlazan a la
  colección de Variables **propia** (Smart Contact Prime), no a la del proveedor — aunque los
  valores coincidan, la colección es nuestra y no se mueve sola.

**Regla operativa:** la tipografía se cambia **solo por tokens `--sc-font-size-*`** (el
"interruptor central"), nunca con literales `font-size` a mano en componentes. El cinturón quedó
cerrado en S67: las **olas 1+2 tokenizaron 367 literales `font-size` → `--sc-font-size-*`** (snap a
la escala base-14), subiendo la cobertura del **48% al 99%** y al **100% accionable**; el guard
**Dura 4** (en `tokens:guard`) bloquea cualquier `font-size` literal nuevo (**0 excepciones** — el
hero de 88px pasó a `--sc-font-size-900`), y `tokens:type-parity` (read-only) cruza nuestros valores
vs lo que PrimeNG espera y canta el drift en el commit. Eso convierte un "se rompió en silencio" en
"aviso inmediato + fix de una línea". Es el requisito previo para adoptar un set tipográfico nuevo
(p. ej. unificar a un único set de estilos) sin dejar huérfanos. Los detalles del tooling viven en
[`tokens/README.md`](../tokens/README.md).

**Los `line-height` NO se tocaron** (diferidos, riesgo de layout) — quedan en backlog para el
redesign de la próxima sesión. Ver [`inconsistencies-backlog.md`](inconsistencies-backlog.md).

---

## Re-sync con un Kit/preset nuevo de PrimeNG (Figma + código)

Cuando PrimeNG publica un Kit (Figma) y/o un preset nuevos, **NO se re-duplica el Kit entero**: eso
repetiría el trabajo y **rompería Code Connect** (file nuevo = node IDs nuevos = mapeos caídos). Se
evoluciona el **file canónico "Smart-Contact Prime" en sitio**, trayendo del Kit nuevo **solo lo que
cambió**.

**Por capas:**
- **Preset (código):** el **Migration Assistant** del Theme Designer (`Check for Updates`) **añade los
  tokens que falten y NO pisa los valores existentes** → nuestros `--sc-*` se quedan. Tras el merge,
  `tokens:parity` + `type-parity` verifican que nada se desvió en silencio.
- **Figma (variables + text styles):** son **nuestros, LOCALES** en nuestro file (duplicado con
  colección de marca propia). Un Kit nuevo **no los toca**. Lo anclado a NUESTRAS variables (los text
  styles → su colección de tipo propia) sobrevive. Lo que apunta a slots `--p-*` lo vigila `parity`.
- **Code Connect:** apunta a **nuestro file** (la fuente del equipo), no al Kit crudo de PrimeNG.
  Mientras evolucionemos el **mismo** file (node IDs estables), las conexiones aguantan. Un file nuevo
  obligaría a re-mapear.

**Por qué un update NO toca el tipo de contenido (las DOS capas de tipo):**
- **Capa de control** (texto de botón/input): `--app-font-size` (= `scale.1` = 14) + tokens de
  componente como `--button-label-font-weight` (= 500). Es lo que PrimeNG define y nuestro preset
  redirige a `--sc-*`.
- **Capa de contenido** (H/body/display = text styles de Figma): **nuestra**, PrimeNG no la define
  (no renderiza `<h1>`).
- Prueba con un botón real:
  ```css
  font-size: var(--app-font-size, 14px);             /* control: 14 (scale.1) */
  font-weight: var(--button-label-font-weight, 500);  /* componente: 500 (Medium) */
  ```
  → cambiar el ramp de **contenido** NO mueve este botón. Por eso editar los text styles de contenido
  es **seguro para los controles**: viven en carriles distintos.

**Caveat honesto (Figma):** Figma aún no permite override limpio de las variables de una librería base
al actualizarla (se pueden resetear). Por eso la marca vive **local** en nuestro file (la poseemos → no
se resetea); el coste es que un Kit nuevo se **reconcilia a mano** (clasificación humana: adoptar /
ignorar / divergencia consciente), protegida por `parity`. Camino ideal futuro: **Extended Collections**
de Figma (overrides de marca como modos sobre la base, para que las updates fluyan limpias).

**Checklist al recibir Kit/preset nuevo:**
1. Migration Assistant → `Check for Updates` (añade tokens nuevos, no pisa).
2. Reflejar lo adoptado en `--sc-*`; correr `tokens:parity` + `type-parity` (verde = sin drift silencioso).
3. Traer al file canónico **solo** los componentes/tokens nuevos (no re-duplicar).
4. Editar text styles / variables de marca **solo en nuestro file**, cuando lo decidamos (origen Figma = Modelo B).
5. `npm run e2e` + diff visual Playwright tras el merge.
6. Lo que NO overrideamos y cambie en el Aura nuevo → **decisión humana**, no auto-merge.

> El tipo de **contenido** debe vivir en su **colección de variables propia** (`font/size/*`,
> `font/line-height/*`), no en `scale/*` (spacing): los tamaños editoriales (18/24/48…) no caen en la
> rejilla 14-base, y desacoplar el tipo del spacing encoge la superficie que un update de PrimeNG puede
> tocar. El **font de control** (12.25/14/15.75) sí son valores de escala → ahí el componente sigue
> aliaseando `scale`.

---

## ¿Qué se puede tocar?

### ✅ Seguro (no rompe nada)

- **Valores de `--sc-*`** en `tokens/layers/01-primitive.css` … `07-dark.css`. Cualquier color, spacing, radius, shadow puede ajustarse. La cascada `--p-*` ← `--sc-*` propaga automáticamente.
- **Overrides en `sc-preset.ts`** documentados (Custom collection en código). Añadir un nuevo `--p-X` con valor `--sc-X` o un valor literal.
- **Componentes SCDS internos** (SCSS, templates, props). Mientras la API pública (`@Input` / `@Output`) se mantenga estable.
- **Crear nuevos componentes SC** (pure-sc o extended) siguiendo el patrón del DS. Ejemplo S67:
  el divider se registró en [`code-connect-mapping.md`](code-connect-mapping.md) (Kit node
  `302:11810`); hoy se usa como `<hr class="divider">`, con trigger a `<sc-divider>` solo si se
  necesita texto/dashed/vertical.
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

### Sesión 32 — Cierre Fase 1 + Spec docs

- 5 forms residuales AED migrados (template, label, user, group, repo) → Fase 1 100% cerrada.
- Auditoría nivel-2 pure-sc: 8/21 clean, 0 P0/P1 reales tras sanity check.
- 16 nuevos spec docs creados (uno por pure-sc top-usage).
- 4 refactors de consistencia: bulk-edit-menu + inline-rename-cell + toggle-switch + label-chip — para reducir custom innecesario y alinear con PrimeNG.

### Sesión 67 — Cinturón tipográfico + blindaje config

- **Tipografía migration-safe**: olas 1+2 tokenizaron **367 literales `font-size` → `--sc-font-size-*`**
  (snap base-14, cobertura 48%→99→100% accionable). Guard **Dura 4** bloquea `font-size` literal nuevo
  (0 excepciones; hero 88px → `--sc-font-size-900`). `tokens:type-parity` (read-only) canta drift.
  `line-height` NO tocados (diferidos, riesgo layout). Racional de por qué un update de PrimeNG no
  borra los tipos → § "Tipografía migration-safe" arriba; tooling → `tokens/README.md`; decisión →
  DD-11 en `DECISIONS.md`.
- **`<sc-multiselect>` soporta `options` primitivas** (`string[]`) vía `hasPrimitiveOptions` +
  `resolvedOptionLabel`/`Value` (portado de `<sc-select>`) → fix de 4 multiselects de Grupos config
  que salían vacíos. Single point of adaptation respetado (lógica en el wrapper, no en consumers).
- **Divider** registrado en `code-connect-mapping.md` (Kit node `302:11810`). Reuso 1:1 del Kit Pro:
  hoy `<hr class="divider">`, trigger `<sc-divider>` solo si se necesita texto/dashed/vertical.
- **Form dirty guard estandarizado**: las 3 rutas config usan `formDirtyGuard` (`canDeactivate`) con el
  mismo modal "¿Descartar cambios? / Seguir editando" que admin; componentes implementan `DirtyAware`.
- **Rename cara-usuario "AED" → "Contact Center"** (solo i18n: nav, título índice config, "grupo de
  servicio"). Carpeta/selector `features/config/aed/` y código NO cambian (`aed` es nombre de feature,
  naming portable); "AED" moneda en country-prefixes intacto. Sin impacto en aislamiento SCDS.
- **Limpieza de docs**: quitadas referencias a marcas externas (se describe QUÉ hace el override, no
  de dónde vino).
- **Deuda nueva #73 (`--sc-bg-canvas`)** detectada al alinear la jerarquía de color de config (lienzo
  blanco light / gray-950 dark): no hay token semántico único para el lienzo. Tracking en
  `inconsistencies-backlog.md`; jerarquía + estados de color → `customs-catalog.md`.

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

**Arrays primitivos (S67):** para `options: string[]` los wrappers Extended soportan
`hasPrimitiveOptions` (`<sc-multiselect>` portó el patrón de `<sc-select>`): el wrapper resuelve
`optionLabel`/`optionValue` automáticamente — **no fuerces una clave `label` en opciones string**.
Esto arregló los 4 multiselects de Grupos config que salían vacíos. Detalle de la primitiva +
estado del componente en [`MIGRATION-INVENTORY.md`](MIGRATION-INVENTORY.md).

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

- **Drift Figma ↔ código**: si el equipo de diseño cambia un valor en Figma SC sin pasar por customs-catalog → no rompe runtime, pero el design system se desincroniza. Mitigación: auditorías periódicas (S30, S31 hechas).
- **Gap de token semántico de lienzo** (deuda #73, S67): no existe un `--sc-bg-canvas` único para el lienzo de página (blanco light / gray-950 dark). Workaround vía `:host`/`:host-context(.sc-dark)` en `settings-shell` — funciona, pero es deuda hasta promover la variable. Tracking + trigger de cierre en [`inconsistencies-backlog.md`](inconsistencies-backlog.md).
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
- [`MIGRATION-INVENTORY.md`](MIGRATION-INVENTORY.md) — inventario actualizado de componentes + status (incl. `sc-multiselect` options primitivas).
- [`code-connect-mapping.md`](code-connect-mapping.md) — mapeo Angular ↔ Figma (incl. divider, Kit node `302:11810`).
- [`inconsistencies-backlog.md`](inconsistencies-backlog.md) — deuda DS (incl. #73 `--sc-bg-canvas`).
- [`DECISIONS.md`](DECISIONS.md) — DD-11 tipografía migration-safe.
- [`tokens/README.md`](../tokens/README.md) — tooling de tokens (incl. `tokens:type-parity`, guard Dura 4).
- [`tokens/GUIA.md`](../tokens/GUIA.md) — guía de identidad SC en español (para diseño).
