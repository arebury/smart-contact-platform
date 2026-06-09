# CLAUDE.md — Auditoría de Design Tokens — memoria arquitectónica y roadmap (SmartContact prototype)

> **Naturaleza de este doc**: memoria del audit de tokens (qué era, dónde
> empezó, qué se hizo) y roadmap de lo pendiente. NO es un plan futuro abierto:
> las Fases 0-3 ya están completadas e incorporadas a otros docs, y la Fase 4 se
> ejecuta de forma incremental sesión a sesión. Para el estado vivo de cada tema
> ver su **hogar canónico** (ver tabla más abajo y `docs/DOCS-INDEX.md`).
>
> **Canonical home**: el doc donde un tema vive de forma oficial. El resto de
> docs APUNTAN, no duplican (regla DOCS-INDEX). Este doc apunta para todo lo
> S67; no es hogar canónico de ninguna decisión nueva.

## Contexto

Proyecto Angular + PrimeNG 21 (prototipo, sin usuarios). El proyecto YA
tiene un design system propio funcional: SmartContact DS (sistema `--sc-*`).

Arquitectura real:
```
componentes → var(--sc-*) → aed-preset.ts → var(--p-*) → Aura/PrimeNG
```

`--sc-*` es la fuente de verdad de identidad SmartContact.
`aed-preset.ts` (hoy `sc-preset.ts`) es el bridge que reenvía cada `--p-*` a su
`--sc-*` correspondiente, manteniendo PrimeNG sincronizado con la identidad SC.
Spec formal de esta arquitectura: [`DECISIONS.md`](DECISIONS.md) DD-1/DD-2/DD-3.

Esta arquitectura es deliberada y correcta. NO se desmonta.

> Nota: este doc nombra el bridge como `aed-preset.ts` y rutas
> `src/app/core/tokens/` por historia del audit original. En el monorepo
> actual el bridge vive en `packages/design-system/tokens/sc-preset.ts` y los
> layers en `packages/design-system/tokens/layers/`. La arquitectura
> `--sc-*` → preset → `--p-*` no ha cambiado.

## Cambios S67 — resumen y hogar canónico

S67 trabajó config Contact Center + cinturón tipográfico. Cada story vive
documentada en su hogar canónico; aquí solo el índice. NO duplicar el detalle.

| Story S67 | Qué cambió (resumen) | Hogar canónico |
|---|---|---|
| Rename cara-usuario | "AED" → **Contact Center** solo en i18n (nav, título índice config, "grupo de servicio") + breadcrumb `Contact Center › [Sección]`. Carpeta/selector `features/config/aed/` y el código NO cambian; la moneda "AED" en country-prefixes tampoco. | [`apps/supervisor/docs/DECISIONS.md`](../../../apps/supervisor/docs/DECISIONS.md) (DD#67) |
| Bloque A — jerarquía de color config | Lienzo página blanco / gray-950 dark; bandeja gris exterior `.page__inner`; cards de sección blancas; índice gris alineado arriba; divider `--sc-border-default` gray-200 (antes border-subtle gray-100). 1:1 Figma `1:12270`. | [`customs-catalog.md`](customs-catalog.md) (jerarquía + divider) |
| Bloque B — estados de agente | 3 tags fijos (Disponible verde, No disponible danger, Administrativo **granate** red-800 bg + red-100 texto) + chips editables removibles con ×. Sin token nuevo, master Kit intacto. | [`customs-catalog.md`](customs-catalog.md) |
| Divider | Registrado Kit `302:11810`, ejes Type/Content/Align/Direction; hoy `<hr class="divider">`, trigger `<sc-divider>` si texto/dashed/vertical. | [`code-connect-mapping.md`](code-connect-mapping.md) |
| sc-multiselect options primitivas | Soporta `string[]` (`hasPrimitiveOptions` + `resolvedOptionLabel/Value`, portado de `sc-select`). Arregla 4 multiselect de Grupos que salían vacíos. | [`MIGRATION-INVENTORY.md`](MIGRATION-INVENTORY.md) |
| P4 — Descartar cambios | "Cancelar" → **"Descartar cambios"** (outline, aparece solo con cambios); las 3 rutas config usan `formDirtyGuard` (canDeactivate, mismo modal "¿Descartar cambios?/Seguir editando" que admin); componentes `DirtyAware`. | [`apps/supervisor/docs/DECISIONS.md`](../../../apps/supervisor/docs/DECISIONS.md) (DD#67) |
| Tipografía — mecanismo (DD-11) | `tokens:type-parity` (read-only); olas 1+2 tokenizaron 367 font-size literales → `--sc-font-size-*` (snap base-14, cobertura 48%→99→100% accionable); guard **Dura 4** bloquea font-size literal nuevo (88px hero → `font-size-900`). | racional/blindaje: [`migration-safety.md`](migration-safety.md) (DD-11 en [`DECISIONS.md`](DECISIONS.md)); tooling: [`tokens/README.md`](../tokens/README.md) |
| Tipografía — escala (DD-13) | Redonda 12/14/16/18/20/24/32 + display 36/48/64 registro, **desacoplada de `--sc-scale`**, rem root-16, line-heights por regla, 2 pesos. Naming de text styles Figma = tokens de código. POC en duplicado; falta validar en real (variables de títulos + Kit oficial + reflejar en código). | decisión: **DD-13** en [`DECISIONS.md`](DECISIONS.md) |
| Deuda #73 | No existe token semántico único `--sc-bg-canvas` (blanco light / gray-950 dark). Workaround en `settings-shell` (`:host` bg-surface light, `:host-context(.sc-dark)` bg-default dark). Diferidos: redesign line-heights, tamaños display, contraste índice dark. | [`inconsistencies-backlog.md`](inconsistencies-backlog.md) |

Racional tipografía (resumen — detalle en migration-safety.md): los tipos viven
en `--sc-*` + bridge `sc-preset.ts`, no dentro de PrimeNG, así que un update de
PrimeNG no los borra. Único riesgo = que se renombre un slot `--p-*`
(detectable por `tokens:type-parity`). **NO vincular `--sc-font-*` a la escala
de PrimeNG** — invertiría la arquitectura.

## Objetivo del audit

NO es migrar a Aura ni reescribir componentes para consumir `--p-*`.

Es:
1. Validar que cada `--sc-*` mapea a un valor de Aura coherente con la
   intención declarada en `GUIA.md`.
2. Reconciliar el brand color (`#1b273d` en código vs `#1c273e`
   mencionado en conversación — decidir cuál es el real).
3. Validar que `aed-preset.ts` cubre todos los `--p-*` que PrimeNG
   espera. Identificar huecos donde PrimeNG cae a defaults sin querer.
4. Matar dead code confirmado (`06-primeng-bridge.css`).
5. Depurar los 3 `!important` cuestionables y los 8 `::ng-deep` de
   `sticky-form-header` (deuda real, no load-bearing).
6. Clasificar los 571 `px` literales en SCSS: dimensiones legítimas
   (icon sizes, fixed heights) vs spacings que deberían ser tokens.
7. Establecer protocolo de re-sync para cuando el equipo de diseño re-exporte el JSON.

## Identidad visual SmartContact

> Hogar canónico de las divergencias de marca (navy primary, electric-blue info,
> amber warn, con mapping 1:1 a código): [`customs-catalog.md`](customs-catalog.md) §1.
> Aquí solo el resumen de asunciones del audit.

Documentada en:
- `src/app/core/tokens/GUIA.md` (36 KB, español, para diseño)
- `src/app/core/tokens/README.md` (7 KB, técnico)

Esta documentación es la fuente de verdad para "qué quiere ser
SmartContact". El audit la respeta como input, no la rehace.

Asunciones validadas con el usuario:
- Brand primary: navy oscuro (`#1b273d` o `#1c273e`, reconciliar en Fase 0).
- Light + dark mode: ambos activos. Dark mode ya implementado en `07-dark.css`.
- Tipografía, spacing, radii, sombras: lo que diga `GUIA.md`. Si la
  guía no lo cubre, default a Aura.

## Fuente de verdad

- `src/app/core/tokens/layers/*.css` — los 7 layers `--sc-*` son la
  fuente de verdad para los componentes.
- `aed-preset.ts` — el bridge `--sc-*` ↔ `--p-*`. Source of truth de la
  alineación con PrimeNG.
- `src/assets/tokens/design-tokens.json` — referencia documental (export
  Figma plugin v4, snapshot de Aura). Se usa para validar `--sc-*`
  contra Aura y para diff en re-syncs.
- `GUIA.md` + `README.md` — fuente de verdad de la intención de diseño.

`Aura` no es el baseline aplicado en `app.config.ts`. Es la referencia
contra la que validamos `--sc-*`. El preset aplicado sigue siendo
`aed-preset.ts`.

## Patrones permitidos (clarificación post-diagnóstico)

`::ng-deep` y `!important` son aceptables cuando:
- Resetean chrome de PrimeNG (`.p-dialog`, `.p-toast`) para mostrar
  sólo el shell AED.
- Implementan `prefers-reduced-motion` (a11y).
- Aplican estados `:disabled` en botones nativos.

NO son aceptables cuando:
- Resuelven falta de API en un componente propio (ej: `sticky-form-header`
  redimensionando `photo-upload`). Marcar como deuda y proponer API.
- Sobrescriben tokens (debería hacerse vía bridge).

## Protocolo de checkpoints (sesiones de audit / Fase 4 real / re-sync)

Aplica cuando se retome trabajo de bloque (line-heights, re-sync del Kit).
Al terminar cada fase:
1. Resumen en chat: máximo 10 bullets.
2. Lista de archivos creados/modificados con ruta exacta.
3. Riesgos detectados.
4. Esperar respuesta del usuario.

"Aprobación" = mensaje con "ok", "adelante", "procede" o equivalente
inequívoco. Ante duda, preguntar.

**Si el diagnóstico contradice asunciones del CLAUDE.md: parar y
reportar antes de seguir.** (Esto ya pasó en Fase 0. Si pasa de nuevo,
mismo protocolo.)

## No-goals

- NO reescribir componentes para consumir `--p-*` en vez de `--sc-*`.
- NO mover `aed-preset.ts` a `_legacy/`. Es load-bearing.
- NO tirar `GUIA.md` ni `README.md`. Son fuentes de verdad.
- NO rehacer dark mode.
- NO refactor estructural del proyecto.
- NO tocar lógica de negocio, servicios, rutas, state management.
- NO tocar tests existentes (si un cambio rompe uno: reportar).

## Git (histórico del audit)

El audit original vivió en la rama `chore/design-tokens-audit` (ya mergeada).
Hoy el repo trabaja en `main` con sesiones de features puntuales (S67-A/B/P4,
tipografía, etc.) y el workflow del CLAUDE root (componentes y refactors menores
directo a `main`; cambios estructurales por rama + PR). Convención de commit
heredada para trabajo de tokens: `chore(tokens): <descripción>`.

## Validación visual (Playwright)

Protocolo para cuando se ejecute la Fase 4 real (line-heights) o un re-sync:

- Antes: baseline de screenshots (light + dark) de pantallas principales.
  Pedir al usuario la lista si no es deducible.
- Tras cada paso: re-screenshot y diff. Reportar diferencias perceptibles.

Para cambios cross-app del día a día, la red de seguridad es `npm run e2e`
(ver CLAUDE root + `tests/e2e/README.md`).

## Entregables

Todo en `docs/audit/`:

- `00-diagnosis.md` — ✅ generado en sesión previa.
- `02-sc-vs-aura-audit.md` — Fase 2: validación `--sc-*` contra Aura.
- `03-bridge-coverage.md` — Fase 3: cobertura de `aed-preset.ts`,
  huecos donde PrimeNG cae a defaults.
- `04-debt-cleanup-plan.md` — Fase 4: plan para dead code, `!important`
  cuestionables, `::ng-deep` de deuda real, clasificación de `px` literales.
- `resync-<fecha>.md` — uno por re-export futuro (Fase 5).

---

# Fases — historial y estado

Las fases ya no son "plan futuro": son el historial del audit con su estado
actual. Las Fases 0-3 se completaron en sesiones previas y su contenido está
incorporado a los docs canónicos; la Fase 4 se ejecuta de forma incremental
(S67: tipografía, divider, multiselect, renames); la Fase 5 es protocolo
documentado, no ejecutado.

| Fase | Estado | Resultado / dónde vive | Próximo paso |
|---|---|---|---|
| 0 — Diagnóstico | ✅ | `docs/audit/00-diagnosis.md` | — |
| 1 — Identidad | ✅ | brand colors en [`customs-catalog.md`](customs-catalog.md) §1 | — |
| 2 — `--sc-*` vs Aura | ✅ | `docs/audit/02-sc-vs-aura-audit.md` | — |
| 3 — Cobertura bridge | ✅ | `docs/audit/03-bridge-coverage.md` | colapso tiers de tamaño (diferido) |
| 4 — Limpieza | 🔄 incremental | S67: tipografía (cinturón Dura 4), divider, multiselect, renames | **line-heights** (diferido, layout-risk) — ver [`inconsistencies-backlog.md`](inconsistencies-backlog.md) |
| 5 — Re-sync protocol | 📝 documentado | `docs/audit/RESYNC.md` (concepto) | ejecutar al próximo re-export del Kit |

El detalle original de cada fase se conserva abajo como referencia del plan que
las generó.

## Fase 0 — Diagnóstico

✅ Completada. Ver `docs/audit/00-diagnosis.md`.

## Fase 1 — Reconciliación de identidad

1. Leer `GUIA.md` y `README.md` completos.
2. Confirmar brand color real: `#1b273d` vs `#1c273e`. Decidir cuál es
   el oficial y normalizar.
3. Listar todas las decisiones de identidad documentadas en la GUIA
   (paleta, spacing, radii, sombras, tipografía).
4. Marcar las que están implementadas vs las que están descritas pero
   no implementadas en `--sc-*`.

Entregable: sección en `00-diagnosis.md` ampliada, o nuevo
`docs/audit/01-identity-recap.md`.

Esperar aprobación.

## Fase 2 — Validación `--sc-*` contra Aura

Para cada `--sc-*` definido en los 7 layers:
1. Identificar su valor actual (hex, número, etc.).
2. Identificar el `--p-*` o token Aura más cercano.
3. Clasificar:
   - ✅ Idéntico a Aura.
   - 🟡 Cercano (diferencia mínima, probablemente accidental).
   - 🟠 Divergente intencionado (matchea GUIA.md, es decisión de marca).
   - 🔴 Divergente sin justificación documentada.
4. Para 🟡 y 🔴: decidir caso por caso si alinear a Aura o documentar
   en GUIA.md como decisión consciente.

Entregable: `docs/audit/02-sc-vs-aura-audit.md` con tabla completa.

Esperar aprobación.

## Fase 3 — Cobertura del bridge `aed-preset.ts`

1. Listar todos los tokens `--p-*` que PrimeNG espera (según el JSON
   oficial y la doc de PrimeNG 21).
2. Para cada uno: ¿lo cubre `aed-preset.ts`? ¿A qué `--sc-*` apunta?
3. Identificar huecos: `--p-*` sin bridge → PrimeNG cae a Aura default,
   posiblemente desincronizado de la identidad SC.
4. Identificar redundancias: `--p-*` en el bridge que ya no existen en
   PrimeNG 21.

Entregable: `docs/audit/03-bridge-coverage.md`.

Esperar aprobación.

## Fase 4 — Limpieza dirigida

🔄 En curso, ejecutada de forma incremental (no como bloque único). Lo de S67
ya hecho: cinturón tipográfico (367 font-size literales → `--sc-font-size-*`,
guard Dura 4), divider registrado en code-connect, fix sc-multiselect, P4
descartar-cambios. **Line-heights NO tocados** en S67 (diferidos por riesgo de
layout — ver [`inconsistencies-backlog.md`](inconsistencies-backlog.md)).

Pasos pequeños, cada uno con diff Playwright:

1. **Eliminar dead code confirmado**: borrar `06-primeng-bridge.css`.
   Diff Playwright (debería ser cero cambio visual).
2. **Reconciliar `--sc-*` divergentes accidentales** (🟡 y 🔴 de Fase 2)
   según decisiones aprobadas. Por grupos pequeños. Diff tras cada grupo.
3. **Cerrar huecos del bridge** (🔴 de Fase 3): añadir `--p-*` faltantes
   en `aed-preset.ts`. Diff.
4. **Depurar deuda real**:
   - 8 `::ng-deep` de `sticky-form-header`: proponer API en
     `photo-upload`, refactorizar. Diff.
   - 3 `!important` cuestionables (`agent-form-page` x2, `_forms.scss`
     text-align): reescribir sin `!important`. Diff.
5. **Clasificar y migrar `px` literales** (571 ocurrencias): identificar
   spacings que deberían ser `--sc-spacing-*`. Por grupos pequeños.
   Diff tras cada grupo.

Tras cada paso: resumen, componentes afectados, diff Playwright,
esperar OK.

## Fase 5 — Re-sync protocol (documentación, no ejecución)

Documentar en `docs/audit/RESYNC.md` el proceso para futuros re-exports:

1. Reemplazar `src/assets/tokens/design-tokens.json` con el nuevo export.
2. Generar diff contra versión anterior.
3. Para cada cambio en el JSON:
   - ¿Afecta a un `--sc-*` actualmente alineado con Aura? → considerar
     actualizar `--sc-*` también, mantener alineación.
   - ¿Afecta a un `--sc-*` divergente intencionado? → ignorar, mantener
     identidad SC.
   - ¿Es un token Aura nuevo que SC no contemplaba? → conversación humana,
     decidir si añadir a `--sc-*` y GUIA.md.
4. Tras decisiones: actualizar `--sc-*` y/o `aed-preset.ts` según
   corresponda. Playwright diff.

NO automatizar la integración. Cada re-sync requiere clasificación humana.
