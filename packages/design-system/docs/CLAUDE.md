# CLAUDE.md — Auditoría de Design Tokens (SmartContact prototype)

## Contexto

Proyecto Angular + PrimeNG 21 (prototipo, sin usuarios). El proyecto YA
tiene un design system propio funcional: SmartContact DS (sistema `--sc-*`).

Arquitectura real:
```
componentes → var(--sc-*) → aed-preset.ts → var(--p-*) → Aura/PrimeNG
```

`--sc-*` es la fuente de verdad de identidad SmartContact.
`aed-preset.ts` es el bridge que reenvía cada `--p-*` a su `--sc-*`
correspondiente, manteniendo PrimeNG sincronizado con la identidad SC.

Esta arquitectura es deliberada y correcta. NO se desmonta.

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
7. Establecer protocolo de re-sync para cuando Marta re-exporte el JSON.

## Identidad visual SmartContact

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

## Protocolo de checkpoints

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

## Git

- Rama: `chore/design-tokens-audit` (ya creada).
- No hacer commits hasta que se indique explícitamente.
- Mensaje cuando se pidan: `chore(tokens): <descripción>`.
- Nunca push.

## Validación visual (Playwright)

- Antes de Fase 4: baseline de screenshots (light + dark) de pantallas
  principales. Pedir al usuario la lista si no es deducible.
- Tras cada paso de Fase 4: re-screenshot y diff. Reportar diferencias
  perceptibles.

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

# Fases (replanteadas)

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

Sólo tras aprobación de Fases 1, 2, 3.

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
