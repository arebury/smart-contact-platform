# AED — SmartContact Supervisor

> El panel del supervisor de SmartContact. Angular 21 + PrimeNG 21, todo el
> look pintado con tokens `--sc-*`. Migrado de un prototipo React + Vite
> que sigue ahí, congelado, en
> [`docs/prototype-reference/`](./docs/prototype-reference/) por si quieres
> consultarlo.

<p>
  <img alt="Angular"     src="https://img.shields.io/badge/Angular-21.2-DD0031?logo=angular&logoColor=white">
  <img alt="PrimeNG"     src="https://img.shields.io/badge/PrimeNG-21-1976D2">
  <img alt="TypeScript"  src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white">
  <img alt="Signals"     src="https://img.shields.io/badge/state-signals-1b273d">
  <img alt="i18n"        src="https://img.shields.io/badge/i18n-ngx--translate-5ad3e6">
  <img alt="Playwright"  src="https://img.shields.io/badge/visual%20regression-Playwright-2EAD33?logo=playwright&logoColor=white">
  <img alt="Node"        src="https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white">
  <img alt="License"     src="https://img.shields.io/badge/license-private-lightgrey">
</p>

---

## Qué hay aquí

Una app Angular para que un supervisor gestione **usuarios, grupos,
agentes, plantillas, etiquetas y los nueve repositorios del sistema**
(agendas, horarios, tipificaciones, variables, entidades, intenciones,
reglas IA, entidades IA, clasificación IA), más la configuración global
del distribuidor automático (AED) y la regeneración masiva de credenciales.

Todo conectado al sistema de tokens de SmartContact — ningún color,
espaciado, tipografía o radio está hardcodeado en código de componente.

---

## Empezar en 30 segundos

```bash
git clone https://github.com/arebury/aed.git
cd aed
npm install
npm start
```

Abre **http://localhost:4200**. Ya está.

> **Nota Node.** El proyecto pide Node ≥ 20.19 (Angular 21 lo exige en sus
> engines). Si vas con Node 25 verás `SemVer is not a constructor` al
> arrancar Angular CLI — instala 20 con `nvm install 20 && nvm use 20`.
> CI y Netlify ya van con 20.

---

## Para qué sirve cada comando

| Comando | Qué hace |
| --- | --- |
| `npm start` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Build de producción → `dist/aed/browser/`. Lo que despliega Netlify. |
| `npm test` | Karma + Jasmine en modo watch para desarrollar tests. |
| `npm run test:ci` | Misma suite, headless, con cobertura. La que corre en CI. |
| `npm run lint` | ESLint + reglas Angular + accesibilidad en plantillas. |
| `npm run format` | Prettier escribe el repo entero. |
| `npm run format:check` | Prettier valida sin escribir (lo que corre en CI). |
| `npx tsx e2e/snapshot.ts <set>` | Playwright captura el repertorio de pantallas (dashboard, lists, forms…) y guarda PNGs en `e2e/screenshots/<set>/`. Útil para A/B antes y después de un refactor visual. |

---

## Dónde está cada cosa

```
src/app/
├── core/           ← Singletons: layout shell, servicios globales, tokens, iconos
├── shared/         ← UI reutilizable que cruza features
└── features/
    ├── admin/      ← Usuarios · Grupos · Agentes · Plantillas · Labels · Repositorios
    ├── config/     ← AED (numeración especial) · Seguridad (regen contraseñas)
    └── supervision/← Dashboard, Servicios, Conversaciones (placeholders por ahora)
```

Cada feature sigue **siempre la misma forma**, así que sabes dónde
poner todo sin pensar:

```
features/<scope>/<feature>/
├── <feature>.routes.ts      ← rutas que conecta el padre
├── data/                    ← types + seed data
├── state/                   ← stores (signals) y servicios de dominio
├── components/              ← UI privada de la feature
└── pages/                   ← componentes routeados
```

¿Por qué? Porque cuando un compañero te pregunte _"¿dónde meto X?"_, la
respuesta es siempre la misma. La regla y el resto de convenciones viven
en [`memory.md`](./docs/memory.md).

---

## El sistema de tokens (lo importante)

Todos los colores, espaciados, tipografías y radios pasan por
**`--sc-*`** custom properties organizadas en una cascada de siete capas
(primitive → semantic → palette → component → extensions → primeng-bridge
→ dark) bajo
[`src/app/core/tokens/`](./src/app/core/tokens/). La estructura mira a
PrimeNG como referencia (mismo modelo: primitive / semantic / components
/ overrides). Es **la única fuente de verdad** del look — no hay valores
raw en código de componente. PrimeNG hereda automáticamente porque sus
`--p-*` variables se redirigen a los `--sc-*` en la capa 6 (bridge).

¿Quieres cambiar el color primario de toda la app? Cambias una línea
en `01-primitive.css` o `02-semantic.css`.
¿Añadir un token nuevo? Sigue las reglas en
[`src/app/core/tokens/README.md`](./src/app/core/tokens/README.md).
Para entender la arquitectura entera: [`docs/design-system.md`](./docs/design-system.md).

---

## Navegación rápida

| Si quieres… | Ve a |
| --- | --- |
| Entender por qué tomamos cada decisión grande | [`DECISIONS.md`](./docs/DECISIONS.md) (técnica) · [`DECISIONES.md`](./docs/DECISIONES.md) (versión humana en castellano) |
| Saber qué pasó en cada sesión de trabajo | [`SESSION-LOG.md`](./docs/SESSION-LOG.md) |
| Convenciones de código y arquitectura | [`memory.md`](./docs/memory.md) |
| Roadmap: qué hay hecho y qué queda | [`roadmap.md`](./docs/roadmap.md) |
| Análisis original de la migración | [`docs/phase-0-analysis.md`](./docs/phase-0-analysis.md) |
| Arquitectura del design system | [`docs/design-system.md`](./docs/design-system.md) |
| Añadir o cambiar un design token | [`src/app/core/tokens/README.md`](./src/app/core/tokens/README.md) |
| Consultar el prototipo React original | [`docs/prototype-reference/`](./docs/prototype-reference/) |

---

## Stack en una frase

`Angular 21` + `PrimeNG 21 (Aura)` + `signals` + `@angular/cdk` +
`@ngx-translate/core` + `xlsx` + `lucide-angular` + `ESLint` +
`Prettier` + `Karma/Jasmine` para tests + `Playwright` para visual
regression. El **por qué** de cada elección está en
[`memory.md`](./docs/memory.md#stack).

---

## Despliegue

Listo para Netlify (o cualquier host estático compatible) sin tocar nada:

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist/aed/browser`
- **Node:** `20` (lee de `.nvmrc`)
- **SPA fallback:** ya configurado en `public/_redirects` y `netlify.toml`,
  así que las rutas profundas como `/admin/labels` sobreviven a un F5.

Si conectas el repo a un sitio Netlify nuevo, lee `netlify.toml` y se
configura solo. Los logs de cada build los ves en el panel de Netlify.

---

## Si abres este proyecto en una sesión nueva

1. Lee este README (1 minuto).
2. Echa un ojo a [`SESSION-LOG.md`](./docs/SESSION-LOG.md) para ver qué pasó
   la última vez (la entrada más nueva está arriba).
3. Mira [`roadmap.md`](./docs/roadmap.md) para saber qué hay pendiente.
4. ¿Vas a tomar una decisión que afecta al resto de la app? Documéntala
   en [`DECISIONS.md`](./docs/DECISIONS.md) cuando termines.
5. Cuando vayas a parar, di "**cerramos**" — el asistente hace push,
   actualiza `SESSION-LOG.md` y deja todo listo para la próxima.

---

## Convención de commits

[Conventional Commits](https://www.conventionalcommits.org/) en inglés
imperativo, scope cuando aporta:

```
feat(supervisor): add Labels feature with color picker
fix(tokens): align --p-form-field-padding-x with spacing-300
chore(upgrade): Angular 20 → 21 + PrimeNG 20 → 21
ci: switch npm ci to npm install for transitive chokidar conflict
```

Tipos: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`,
`perf`, `ci`. Scopes habituales: `supervisor`, `tokens`, `shared`,
`core`, `routing`, `ci`, `build`, `a11y`.
