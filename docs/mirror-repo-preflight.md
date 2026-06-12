<!-- Plan de ejecución de la sesión de construcción del repo espejo del Design System. Decisiones S76 (2026-06-12) + alcance + mandatos. Consume convergence-manifesto.md (catálogo/arquitectura, vigente) + convergence-checklist-devs.md (acuerdos). Estado: PREP — a revisar entero antes de ejecutar. -->

# Pre-flight — Repo espejo del Design System

> **Qué es este doc:** el guion de preparación de la sesión grande que construye el
> repositorio nuevo del Design System. Reúne las decisiones cerradas, el alcance exacto
> de esa sesión, lo que queda mapeado para después, y los mandatos de ejecución.
>
> **Fuentes que consume (no se duplican aquí):**
> - [`convergence-manifesto.md`](./convergence-manifesto.md) — catálogo unión, solapes, huecos, estructura de empaquetado, plan de port por fases. **Vigente** (revalidado S76).
> - [`convergence-checklist-devs.md`](./convergence-checklist-devs.md) — puntos a alinear con el equipo de desarrollo.
> - Este doc — decisiones S76, alcance de la sesión, mandatos de ejecución.

---

## 0. Objetivo

Un repositorio nuevo que es el **Design System empaquetado y publicable**, alojado en
nuestro GitHub, donde **lo que se diseña en Figma se refleja directamente en el código**
y cada valor es **trazable a la fuente y verificable por máquina**.

- **Es** la referencia completa y autosuficiente del DS: tokens + preset + componentes +
  tooling de verificación + documentación, en la estructura de empaquetado de los devs.
- **No es** un monorepo de aplicaciones. Las apps (supervisor, doc-site) **consumen** los
  paquetes; no viven dentro.

---

## 1. Decisiones cerradas (S76)

| Tema | Decisión | Racional |
|---|---|---|
| **Escala** | `rem` centralizado (diseño en 14-base → conversión a rem en un punto). | Coherente con DD-13 (tipografía ya en rem). Mejor para zoom/accesibilidad. El equipo de desarrollo ya tiene una implementación de referencia (`rem-scale.ts`). |
| **Tooling de tokens** | Un **único generador DTCG-aware** que funde su `convert-tokens.js` (import) + nuestro `tokens:gen` (ley de escala). | El Theme Designer exporta DTCG; el generador debe leerlo nativo. Un solo punto de transformación Figma→CSS. |
| **Repositorio** | Nuevo, en **GitHub** (nuestro), con la **estructura y el naming de paquetes** del equipo de desarrollo (`@smartcontact/styles · icons · components`). Su GitLab no se toca (sin acceso de escritura). | El repo es primordialmente de diseño y nuestro. Hablar el mismo idioma de empaquetado facilita que sea referencia consultable. |
| **Alcance del repo** | **Solo el DS** (3 paquetes + demo). | Las apps consumen los paquetes versionados; no se mudan. |
| **Alcance de la sesión grande** | **Fundaciones completas (Mitad A)**, con el **port de componentes (Mitad B) mapeado al detalle** para sesiones siguientes. | El port exige verificación visual por pantalla → es incremental por naturaleza. Concentrar la sesión grande en las fundaciones rinde más. |
| **Documentación** | La nuestra + la suya adaptada a nuestras convenciones. Registro **colaborativo y profesional**. | El repo será consultable por el equipo de desarrollo. La gobernanza vive en los guardarraíles, no en el lenguaje. |
| **Verificación** | Guardarraíles automáticos como **gate de CI**. | Cada valor trazable a Figma, comprobado por máquina. Es el estándar de calidad del repo. |
| **Consumo** | El repo lleva dentro el **`sc-demo` = doc-site con la cara del suyo** (un deploy). El **supervisor** consume los paquetes (el otro deploy). El `ds-docs` actual cede su rol al `sc-demo`. | Dos deploys como hoy, pero el supervisor "bebe" del DS empaquetado y el doc-site habla el mismo idioma visual. |

---

## 2. Estado verificado del repo de desarrollo (refresh S76)

Snapshot de `smartcontact-ui` (Angular 21.2, PrimeNG ^21.1.8, `@primeuix/themes` ^2.0.3,
ng-packagr ^21.2.3, TS 5.9.3). El manifiesto (S70) sigue vigente; el delta está **todo en
la capa de tokens/preset**.

**Sin cambios (manifiesto vigente):**
- **Catálogo de componentes idéntico**: 21 wrappers `sc-*` + 1 custom (`bulk-transcription-modal`), ninguno nuevo, ninguna API cambiada. Siguen en `@Input()/@Output()` clásico (sin signals).
- **Doctrina de tokens idéntica**: `--sc-*` contrato · `--p-*` adaptador · no inventar tokens · paleta por preset.
- **Estructura de 4 projects intacta** (`design-tokens`, `ui-smartcontact`, `ui-smartcontact-icons`, `sc-demo`).
- Los **5 wrappers con guión** siguen sin realinear a pegado (DD-12).
- **`base.ts` sigue con color hardcodeado** (p. ej. `primitive.blue.500: "#344a70ff"`) → la reescritura a `var(--sc-*)` sigue siendo trabajo nuestro.
- **`provideSmartContactUi`** con default `darkModeSelector: 'none'` → cambiar a `.sc-dark` al adoptarlo.
- **`export:*` lockeados a PowerShell** → portar a Node.
- **Sin `sc-datatable`** (hueco prioritario, falta en ambos).

**Nuevo desde S70 (a aprovechar):**
- **`rem-scale.ts`**: conversión central design-rem 14 → browser-rem 16 (ratio 0.875), aplicada a todo el preset vía `normalizeDesignRem`. **Implementación de referencia de la decisión "rem" → adoptar.**
- **`check-theme-scale.mjs`** (`audit:theme-scale`): auditor que exige cero `px` en el preset, prohíbe `css:` por-componente y hackear `html{font-size}`. **Guardarraíl de escala → adoptar.**
- **Skill `sync-theme`**: flujo Theme Designer → `theme/sc-preset/*`, preservando el puente de escala. Encaja con nuestro tooling pre-commit.
- **Formato de origen confirmado**: su `tokens.json` es **DTCG con referencias estilo Figma con slash** (`{color/gray/800}`); su `convert-tokens.js` (935 líneas, con ~20 ramas muertas a no portar) las resuelve a `var(--sc-*)`. La conversión a rem ocurre **en dos capas** (preset `normalizeDesignRem` + tokens `aliases.css` con `/16*1rem`).
- **Drift en su doc**: `AGENTS.md` y `token-inspector` referencian `sc-palette.ts`, que **no existe** → corregir al adaptar sus docs.

**Punto de escala a reconciliar (Fase 0):** su Figma de origen es **8-point** (spacing 0/4/8/12/16…); nuestro Kit es **14-base**. La fuente de verdad del repo espejo es **nuestro export 14-base**; sus wrappers que consumen `--sc-spacing-*` se barren a `--sc-scale-*`.

---

## 3. Arquitectura objetivo

**Molde de empaquetado del equipo de desarrollo + nuestro contenido y tooling.**

- **3 paquetes ng-packagr publicables + demo:**
  - `@smartcontact/styles` ← nuestras 7 capas 14-base→rem + reset/globals.
  - `@smartcontact/icons` ← su paquete (Material Symbols, más maduro) + nuestro `sc-icon` migrado a él.
  - `@smartcontact/components` ← wrappers `sc-*` (los suyos + los nuestros) + **preset modular** + `provideSmartContactUi`.
  - `sc-demo` (privado) ← doc-site con su cara, poblado con nuestro contenido.
- **Preset modular** (un módulo por componente) con **cada slot apuntando a `var(--sc-*)`**; `base.ts` reescrito (sin color hardcodeado). Conversión a rem por el mecanismo central adoptado.
- **`provideSmartContactUi()`** como frontera única de setup, con `darkModeSelector` por defecto a `.sc-dark`.
- **Tooling de verificación fundido**: el generador único DTCG-aware + `parity` + `guard` + `type-parity` + el auditor de escala, conectados como gate.

---

## 4. Alcance de la sesión grande — Mitad A (lo que construye)

Corresponde a **Fase 0 + Fase 1** del manifiesto, más la capa de documentación y el tooling.

1. **Esqueleto del repo**: estructura de 3 paquetes ng-packagr + `sc-demo`, `package.json`/`angular.json`/tsconfig, `export:*` portados a Node.
2. **Escala (Fase 0)**: portar nuestras capas 14-base; adoptar el mecanismo rem central; barrer los consumos `--sc-spacing-*` → `--sc-scale-*`; fundir los dos generadores en uno DTCG-aware alimentado por nuestro export del Kit.
3. **Preset**: estructura modular por-componente con slots a `var(--sc-*)`; `base.ts` reescrito sin color hardcodeado; overrides nuestros portados.
4. **Setup**: `provideSmartContactUi()` con `darkModeSelector: '.sc-dark'`.
5. **Tooling de verificación** conectado como gate de CI (incluido el auditor de escala adoptado).
6. **Documentación**: la nuestra (DECISIONS, customs-catalog, migration-safety, guía de tokens) + su `AGENTS.md`/`PROMPTS.md`/skills **adaptadas** a las convenciones unificadas (naming pegado, escala unificada, tooling de parity), corrigiendo el drift `sc-palette.ts`.
7. **El prompt maestro** y este pre-flight quedan dentro del repo como guion de continuación.

> **Fuera del alcance, por diseño:** ningún componente se porta en esta sesión (eso es Mitad B, requiere verificación visual por pantalla).

---

## 5. Mitad B — mapeada para las sesiones siguientes (modelo potente, no el más caro)

No entra en la sesión grande; queda inventariada aquí con puntero al detalle:

- **Port de los 54 componentes** (32 nuestros + 22 suyos): manifiesto §3 + §7 Fases 2–3. Cada uno con diff visual Playwright (no-layout-shift) + `npm run e2e`.
- **Los 4 solapes** (tag/chip, avatar, section-card, dynamic-dialog): manifiesto §4 + §7 Fase 4.
- **Decisiones por-componente** (base del `sc-checkbox`, destino del icon-resolver, API de `sc-dialog`, rename de `sc-confirm-host`, API anidada de `sc-section-card`): manifiesto §8. Se cierran al portar cada pieza.
- **`sc-datatable`**: crearlo (hueco prioritario en ambos): manifiesto §5.c.
- **Migración de Memory** y migración de las apps a paquetes versionados: manifiesto §7 Fase 5.

---

## 6. Autosuficiencia verificada (gobernanza)

Para el repo nuevo, **nada técnico depende del equipo de desarrollo**. Se construye
completo y se verifica solo. Lo que requiere su intervención es **adopción en su lado**,
no construcción en el nuestro.

| Punto | Lado | Cómo se resuelve sin coordinación |
|---|---|---|
| Realineo de los 5 wrappers a naming pegado | Suyo | Nuestro repo ya está en pegado y es self-consistent; el realineo del suyo es independiente. |
| Adoptar escala unificada + actualizar su pipeline de agente | Suyo | Entregamos las skills correctas en nuestro repo; el nuestro genera desde Figma con verificación. |
| Base del `sc-checkbox` (tri-estado) | Decisión técnica | La tomamos con racional documentado al portar la pieza; no es un bloqueo. |
| `sc-datatable` (falta en ambos) | Construcción | Lo construimos nosotros (somos el catálogo completo). |
| Iconos: migrar `sc-icon` a su paquete + destino del resolver | Adopción nuestra | Replicamos lo suyo en nuestro repo; no depende de su acción. |

**El estándar:** cada token es trazable al export del Kit y comprobado en CI (`parity` +
auditor de escala + `type-parity`). Cuando un valor se cuestione, la respuesta es el check
verde + el diff 1:1 con Figma, no una discusión. Eso es "exigir cada pixel": con una
verificación que no admite ambigüedad.

---

## 7. Guardarraíles (estándar de calidad del repo)

Gate de CI, dos streams cubiertos:

- **Stream tokens/Figma**: el generador único (DTCG→CSS) + `tokens:parity` (cruza el export del Kit contra `--sc-*` + preset) + `type-parity` + `tokens:guard`.
- **Stream preset/PrimeNG**: el auditor de escala adoptado (cero `px` en el preset, sin `css:` por-componente, sin hackear `html`).
- **Transversal**: `lint`, `tsc --noEmit`, `e2e` (smoke).

Norte operativo: **lo que viene de Figma se ve tal cual, y cada actualización del Figma se
refleja sin pérdida.**

---

## 8. Estándar de la documentación

Registro **profesional y colaborativo**. La documentación describe **qué** hace cada cosa
y **por qué**, con la gobernanza expresada como estándar de calidad ("cada token trazable
a Figma, verificado en CI"). Sin nombres de personas ni de librerías externas. El repo es
una referencia consultable; se redacta como tal.

---

## 9. Mandatos de ejecución (sesión grande, sin interrupciones)

La sesión grande corre de principio a fin y entrega el conjunto para una revisión única.

1. **Mejora con criterio.** Autoridad para elegir la mejor arquitectura/código aunque se
   desvíe de este plan, con tres condiciones: que no contradiga una decisión cerrada (§1);
   que sea **la solución más simple que resuelve el problema real** (nada especulativo); y
   **cero relleno** (boilerplate innecesario, abstracciones inventadas, comentarios que
   repiten el código, documentación que reformula el título, naming que no existe en la
   fuente, capas sin trigger).
2. **Termina entero, no consultes — pero entiende, no adivines.** Las decisiones de
   negocio están cerradas en este doc; los grados de libertad técnicos son del ejecutor.
   No hay paradas para preguntar. Si aparece un **fleco no previsto**, el ejecutor lo
   resuelve con **autonomía y criterio fundado**: primero **entiende a fondo la fuente
   real** (el código de ambos repos, el Figma / Kit Pro, el export de tokens) y verifica
   empíricamente; luego **decide sobre lo verificado, nunca sobre una suposición**.
   Adivinar no es una opción; investigar a fondo y decidir, sí. La decisión y su base se
   registran en el log (punto 4).
3. **Auto-verificación, no vigilancia.** Verificación adversarial entre agentes +
   guardarraíles como gate. La calidad la garantiza la máquina.
4. **Un único punto de revisión.** Cada decisión y cada desviación significativa se
   registra con su porqué en un **log de decisiones** (parte del entregable). La revisión
   final es el repo completo + ese log, de una sentada.

---

## 10. Riesgos y cómo se manejan sin parar

- **Reconciliación de escala (8-point suyo ↔ 14-base nuestro)**: resuelta por decisión (14-base manda) + barrido automatizable. Si aparece un consumo ambiguo, se documenta en el log, no se pregunta.
- **Doble capa de rem (preset + tokens)**: se adopta el mecanismo de referencia; el generador único lo centraliza.
- **Drift heredado de su repo** (`sc-palette.ts` inexistente, ramas muertas en `convert-tokens.js`, lock a PowerShell): se corrige al portar, registrado en el log.
- **Alcance**: cualquier tentación de portar componentes en la sesión grande se rechaza (es Mitad B); se anota en el log como "diferido a port incremental".
