# 2026-05-14 — De app Angular a monorepo Smart Contact

> Sesión de ~3h. Una sola rama, una sola PR, mil pequeños tropiezos.
> Notas crudas — sin filtrar para "presentación". Lo que pasó, lo que
> aprendí, lo que casi me come.

---

## Lo que existía antes

Una app Angular 21 + PrimeNG con 24 componentes custom y un sistema de
tokens `--sc-*` en 7 capas. Repo `arebury/aed`. Limpio, documentado, 6
PRs de audit cerrados. El typical "single-app repo".

Pero la cabeza ya iba a otro sitio: Smart Contact (SC) no es UNA app, es
una plataforma. Memory 3.0 vive en otro repo (React/Vite/Tailwind). Y va
a haber más apps. Y todas tienen que compartir tokens. Y el design
system necesita su propio sitio de docs.

Solución: monorepo. AED es UNA app dentro. ds-docs es OTRA. El design
system es un package compartido.

## La decisión incómoda: pnpm vs npm

El plan que escribí la sesión anterior decía **pnpm workspaces**. Razón:
Memory 3.0 ya usa pnpm. Quería coherencia.

Realidad al arrancar: `which pnpm` → `command not found`. Y la memoria
del proyecto tenía un nota explícita: **Node 25 / disk / npm-ci issues
ya nos jodieron una vez**. Instalar pnpm + reconfigurar Netlify era un
hueco grande para un cambio que no añade valor inmediato.

Cambié a **npm workspaces**. Mismo concepto, ya instalado, ya funciona
en Netlify. Lo documenté como desviación del plan.

**Aprendizaje:** un plan no es un contrato. Es un mapa. Si el terreno
cambia, redibuja. Pero documenta por qué redibujaste — el siguiente
puede pensar que olvidaste.

## El git mv dance (donde casi la lío)

Mover ~600 archivos de `src/` a `apps/aed/src/` con `git mv` preservando
historia. Plan en mi cabeza: secuencia simple de comandos encadenados
con `&&`.

```bash
git mv src/app/core apps/aed/src/app/core && \
git mv src/styles apps/aed/src/styles-tmp && \
mv apps/aed/src/styles-tmp/* apps/aed/src/styles/ && \
rmdir apps/aed/src/styles-tmp && \
...
```

¿Por qué los `-tmp`? Porque ya había hecho `mkdir -p apps/aed/src/styles/`
durante el scaffold, así que `git mv src/styles apps/aed/src/styles`
fallaba: el destino ya existía. La solución de andar por casa:
git-mover a un nombre temporal, luego mover el contenido al nombre real.

**Lo que rompió la cadena:** `rmdir apps/aed/src/assets-tmp` falló
porque dentro había un `.DS_Store` (gracias macOS). Como uso `&&`,
todo lo posterior NO se ejecutó. Resultado: `apps/aed/src/environments/`
y `packages/design-system/tokens/` quedaron VACÍOS, mientras sus
`-tmp` aún tenían los archivos.

Tuve que diagnosticar con `git status --short`, ver que no había
renames pendientes para esos dos, y arreglar uno por uno:
- `rmdir <empty-dest> && git mv <-tmp> <real-name>`
- Para assets-tmp: `rm .DS_Store` primero, luego rmdir.

**Aprendizaje:** los .DS_Store de macOS son saboteadores silenciosos.
Y `&&` es traicionero cuando una operación intermedia puede fallar de
forma no-fatal. Para scripts de migración, mejor `set -e` + manejar
errores explícitamente, o `||true` donde tolero fallo.

## El nested components/components

Al hacer `git mv src/app/shared/components packages/design-system/components`,
git interpretó el destino como "metelo DENTRO" en vez de "renómbralo
así". Porque `packages/design-system/components/` ya existía (lo
scaffoldeé con mkdir). Resultado:

```
packages/design-system/
└── components/
    └── components/    ← double nest, mierda
        ├── modal/
        ├── toast/
        └── ...
```

Lo aplané con otra danza de `git mv components → components-old &&
mkdir components && git mv components-old/components/* components/`.
Y otra vez .gitkeep saboteando el rmdir final.

**Aprendizaje:** cuando vas a `git mv` un directorio entero, NO crees
el destino con mkdir antes. Git lo crea él solo, y si ya existe, se
porta como `mv -t` (anidando).

## El rename aed→sc con perl (la regex que casi me obliga a hacer trampas)

Plan: renombrar `aed-*` (brand prefix) → `sc-*` en selectores, clases
CSS, custom properties, etc. **PERO** mantener `aed` cuando es nombre
de feature (carpeta `features/config/aed/` y todos los archivos y
clases dentro).

Problema concreto: el selector `aed-aed-agentes-page`. El primer `aed-`
es brand (cambiar). El segundo `aed-` es feature name (mantener).
Lookbehind no se puede en sed BSD, así que perl con patrones
explícitos:

```perl
s/<aed-/<sc-/g;        # HTML open tags
s/<\/aed-/<\/sc-/g;    # HTML close tags
s/'aed-/'sc-/g;        # TS string single-quoted
s/"aed-/"sc-/g;        # TS string double-quoted
s/\.aed-/.sc-/g;       # CSS class selectors
s/--aed-/--sc-/g;      # CSS custom properties
```

Cada patrón solo dispara cuando hay un contexto "estoy empezando una
referencia". Funciona perfectamente para `aed-aed-agentes-page` (la
primera `aed-` es precedida por `<` o `'`, la segunda no).

Pero luego me di cuenta de que algunos casos quedaban sin tocar:
backtick template strings (`aed-modal-${id}-title`), comentarios docs,
selectores CSS sueltos al inicio de línea (`    aed-tri-state-checkbox`).
Hice una segunda pasada más agresiva (`\baed-` → `sc-`) excluyendo
SÓLO los archivos dentro de `features/config/aed/` para no destrozar
las referencias de feature-name.

**Y aquí casi rompo el build sin darme cuenta:** la pasada agresiva
también convirtió `import('./aed/aed-servicio-page.component')` →
`import('./aed/sc-servicio-page.component')`. El primer `aed/` (folder)
quedó intacto (no tenía hyphen). Pero el segundo `aed-servicio-page`
(file name dentro de feature folder) SÍ cambió. Y la file en disco
seguía llamándose `aed-servicio-page.component.ts`. Import roto.

Lo cazé al hacer `npx ng build aed` y ver el error de "Cannot find
module './aed/sc-servicio-page.component'". Three lines de Edit y
arreglado.

**Aprendizaje:** los bulk renames con regex son una herramienta cargada.
Hazlos en pasadas pequeñas con grep de verificación después de cada
una. Y SIEMPRE corre un build antes de creerte que terminaste.

## El tail -50 que se comía el output

Lancé el build con `npx ng build aed 2>&1 | tail -50`. Esperaba ver
el output al final. Esperé 4 minutos. El archivo de output: 0 bytes.

`pgrep` confirmaba que `ng build` estaba corriendo. Pero ningún byte
se escribía.

¿Por qué? Porque `tail -50` agrupa: espera a que el proceso anterior
TERMINE para mostrar las últimas 50 líneas. Si la build tarda 2
minutos, no ves NADA hasta el segundo 121.

Pero también algo más raro: stdout estaba bloqueado en buffer
intermedio. ng build no flushea hasta que termina cuando lo pipea a
algo. Lo redirigí a `/tmp/build-aed.log` directamente sin pipe, y el
log empezó a llenarse en tiempo real.

**Aprendizaje:** cuando algo "no muestra output", la pregunta no es
"está roto?", es "dónde está siendo retenido el output?". Pipes,
buffers, terminales no-tty, todo afecta. Si necesitas ver en tiempo
real, escribe a archivo y haz `tail -f` en otra ventana.

## El @core/tokens que ya no existe

El plan dejó el alias TS `@core/*` apuntando a la nueva ubicación de
core/ en apps/aed/. Pero `core/tokens/` se movió a
`packages/design-system/tokens/`. Resultado: `import { AedPreset } from
'@core/tokens/aed-preset'` no resolvía a nada.

Lo arreglé con un nuevo alias `@sc/tokens/*` apuntando a la nueva
ubicación, y actualizando el único import afectado (`app.config.ts`)
a mano. Trivial pero fácil de olvidar.

**Aprendizaje:** cuando mueves archivos, busca SIEMPRE los imports
relativos Y los alias TS antes de declarar éxito. `grep -rn "@core/tokens"`
te lo dice en 1 segundo.

## El path relativo que sobrevivió

En `top-bar.component.ts` había un import:

```ts
import { IllustratedAvatarComponent } from '../../../shared/components/illustrated-avatar/illustrated-avatar.component';
```

Todos los demás imports del proyecto usan el alias `@shared/components`,
pero éste, por alguna razón histórica, era relativo. Como las components/
se movieron a packages/design-system/, esa ruta relativa quedó apuntando
a la nada.

Lo cambié a `@shared/components/illustrated-avatar/illustrated-avatar.component`
y resuelve perfectamente vía el fallback que metí en tsconfig:

```json
"@shared/*": [
  "apps/aed/src/app/shared/*",
  "packages/design-system/*"
]
```

TS prueba la primera ruta, si no existe, prueba la segunda. Magia.

**Aprendizaje:** los alias TS con fallback (array de paths) son una
herramienta infrautilizada. Te permiten mover archivos sin romper
imports — TS encuentra dónde están ahora.

## La estructura final que sí funciona

```
smart-contact-platform/
├── apps/
│   ├── aed/                    ← Supervisor (existente, migrado)
│   │   ├── src/
│   │   ├── docs/               ← AED-specific: DECISIONS, MEMORY, ROADMAP
│   │   ├── package.json        ← @sc/aed, scripts mínimos
│   │   ├── tsconfig.app.json   ← extends ../../tsconfig.json
│   │   ├── CLAUDE.md
│   │   └── README.md
│   └── ds-docs/                ← Sitio de docs SCDS (nuevo, scaffold mínimo)
│       ├── src/
│       │   ├── app/
│       │   │   ├── pages/
│       │   │   │   ├── home/   ← landing
│       │   │   │   └── button/ ← buttons gallery (era /dev/buttons)
│       │   │   ├── app.component.ts
│       │   │   ├── app.config.ts
│       │   │   └── app.routes.ts
│       │   ├── styles/
│       │   ├── index.html
│       │   └── main.ts
│       ├── docs/
│       ├── package.json        ← @sc/ds-docs
│       └── CLAUDE.md
├── packages/
│   └── design-system/          ← SCDS: tokens + componentes
│       ├── components/         ← 24 componentes (eran shared/components/)
│       ├── tokens/             ← 7 capas + sc-preset.ts
│       ├── docs/               ← CLAUDE original (audit) + audit/ + MIGRATION-INVENTORY
│       ├── package.json        ← @sc/design-system (peerDeps)
│       └── CLAUDE.md
├── docs/                       ← Cross-project
│   ├── SESSION-LOG.md
│   ├── NEXT-SESSION-PLAN.md
│   ├── prototype-reference/    ← Memory 3.0 React reference (legado)
│   └── archive/                ← refactor-structure cerrado NO-GO
├── .notes/                     ← Privado (este archivo vive aquí)
│   ├── README.md
│   └── journal/
├── angular.json                ← multi-project (aed + ds-docs)
├── tsconfig.json               ← paths globales con fallback @shared/*
├── package.json                ← workspaces: ["apps/*", "packages/*"]
├── netlify.toml                ← AED site config; ds-docs en UI override
├── CLAUDE.md                   ← raíz monorepo (cross-app orchestration)
└── README.md                   ← platform overview
```

## El build pasó

```
Application bundle generation complete. [3.709 seconds]   ← AED
Application bundle generation complete. [3.143 seconds]   ← ds-docs
```

Sin warnings. Sin errores. 1110 paquetes npm instalados. Las dos apps
compilan sus chunks lazy con los nombres correctos:

- AED: 34+ lazy chunks (admin pages, config pages, feature components)
- ds-docs: 3 lazy chunks (home, button gallery, browser)

## Lo que NO hice (deliberadamente)

- **No bootstrap del Custom Variables collection en Figma.** Demasiado
  pronto. Aún no hay 5+ componentes con divergencias documentadas.
- **No migración de Memory 3.0.** Vive en otro repo, otro stack, otro
  problema. Fase 3, futura.
- **No split fino de DECISIONS.md por proyecto.** Lo dejé entero en
  apps/aed/ porque la mayoría son AED-features. Cuando lleguen DDs DS-
  specific, se crean en packages/design-system/docs/DECISIONS.md.
- **No actualicé `tokens/README.md`** ni `design-system.md` para reflejar
  el rename `.aed-dark` → `.sc-dark` en docs. Son docs históricos, no
  rompen nada, y prefiero entregar la PR antes de pulir prosa.

## Lo que sí cocinaría diferente si lo hago otra vez

1. **NO scaffoldear los destinos antes de `git mv`**. Deja que git
   cree los dirs. Te ahorras la danza de `-tmp`.
2. **NO usar bulk find/replace en una sola pasada agresiva**. Tres
   pasadas pequeñas con `grep` de verificación entre cada una. Si
   algo se rompe, sabes EXACTAMENTE qué pasada lo rompió.
3. **NO pipear output de un build a tail si quieres ver progreso**.
   Redirige a archivo y abre otra ventana.
4. **SÍ usar `--dry-run` cuando exista**. Per`l-i -pe` no lo tiene,
   pero un primer `perl -pe ... | head -100` te muestra lo que va a
   cambiar antes de tocar disco.

## Cosas que alguien que venga después puede relate

- El plan es una guía, no un contrato. Cambialo cuando el terreno
  cambia. Pero documenta el por qué.
- macOS .DS_Store es un saboteador silencioso de todo proceso shell.
  Aprende a `find . -name .DS_Store -delete` como reflejo.
- Los alias TS con fallback son herramienta de movimiento sin dolor.
- Los bulk renames pueden ser quirurgicos. Perl con patrones específicos
  (`<aed-`, `'aed-`, `.aed-`, `--aed-`) es más seguro que `\baed-`
  global.
- Cuando un comando "no responde", la pregunta no es "está roto?", es
  "dónde está el output siendo retenido?".
- `git mv` preserva historia. Vale la pena el ceremony aunque te haga
  bailar.
- Empieza por lo que ROMPE (build), no por lo que LUCE BIEN (docs).
  Tener el build verde en una rama mientras los docs aún están
  desactualizados es 10x mejor que docs perfectos sobre código roto.

## Stack final

- Angular 21.2 (standalone, signals)
- PrimeNG 21 + Aura preset + sc-preset.ts override
- npm workspaces (NO pnpm — desviación documentada del plan)
- TypeScript 5.9 con baseUrl + paths fallback
- Netlify multi-site (1 site funcionando, 2do site pendiente de
  configurar en Netlify UI)
- Node 20.20.2 (engine: >=20)

## Para extraer si algún día quiero hacer blog/talk

- "El día que renombré 349 referencias con perl y aprendí a respetar
  los patrones quirurgicos"
- "Por qué npm workspaces sobre pnpm cuando ya tienes la cosa
  cableada con npm"
- "El alias TS con fallback: cómo mover archivos sin romper imports"
- "Cosas que macOS hace que rompen tus scripts shell" (.DS_Store
  saga)
- "El día que descubrí por qué `tail -50` me ocultaba 4 minutos de
  build output"

Original aquí. Sin filtrar.
