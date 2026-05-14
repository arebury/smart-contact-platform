# Netlify — setup multi-site

> Cómo configurar los 2 sites Netlify que sirven desde este monorepo.
> Pensado para que Rafa o cualquiera del equipo lo siga sin acordarse
> de qué decisión se tomó cuándo.

---

## El esquema

Un solo repo (`arebury/smart-contact-platform`) → 2 sites Netlify:

| Site | Qué sirve | URL | Build command | Publish dir |
|------|-----------|-----|---------------|-------------|
| `aedmigration` | App AED (Supervisor) | aedmigration.netlify.app | lee de `/netlify.toml` (raíz) | `dist/aed/browser` |
| `ds-smartcontact` | Sitio docs SCDS | ds-smartcontact.netlify.app | lee de `apps/ds-docs/netlify.toml` | `dist/ds-docs/browser` (via toml) |

**Cada site tiene su `netlify.toml` versionado** — el de la raíz para AED (default), el de `apps/ds-docs/` para ds-docs. El truco es que ds-smartcontact debe tener **Base directory = `apps/ds-docs`** en su Netlify UI, así Netlify lee el toml de esa carpeta en vez del raíz.

---

## Setup del 2do site (`ds-smartcontact`) paso a paso

### 1. Crear el site

Si aún no existe:
1. https://app.netlify.com → **Add new site → Import an existing project**.
2. Conecta con GitHub → selecciona `arebury/smart-contact-platform`.
3. Branch to deploy: `main` (después de mergear la foundation PR).
4. Acepta los defaults del wizard sin tocar nada — vamos a sobrescribir después.

### 2. Apuntar al netlify.toml de ds-docs

Una vez creado el site, ve a:

**Site settings → Build & deploy → Continuous deployment → Build settings → Edit settings**

Rellena solo este campo, deja los otros 2 VACÍOS:

```
Base directory:      apps/ds-docs
Build command:       (VACÍO — lo lee del netlify.toml de apps/ds-docs)
Publish directory:   (VACÍO — lo lee del netlify.toml de apps/ds-docs)
```

Guarda.

> Por qué este enfoque y no el típico "override todo en UI":
> ya probamos con Build command + Publish dir en UI y los settings no
> se aplicaban consistentemente. Tener el `netlify.toml` viviendo en
> `apps/ds-docs/` es source-of-truth versionada, y se aplica automáticamente
> cuando el site usa esa carpeta como Base directory. Si Netlify ignora
> esos settings, el commit te da la pista.
>
> El `npm install` corre con `cd ../..` para volver a la raíz (donde está
> el lockfile de npm workspaces). Está en el `command` del toml.

### 3. Trigger un deploy nuevo

Mismo lugar → **Deploys** tab → botón **Trigger deploy → Deploy site**.

Espera ~1-2 minutos. Si todo va bien verás:

```
✓ Build script success
✓ Site is live
```

### 4. Verifica

Abre https://ds-smartcontact.netlify.app/ — debes ver:

- Sidebar izquierdo oscuro con "SC · Design System".
- Menú lateral con "Home" y "Components → Button".
- Hero "Una sola fuente de verdad para SC".
- Card con "Button · ready".

Si en cambio ves un sidebar con icons hexagonales y "Sección en construcción"
→ es AED el que se está sirviendo, los settings no se aplicaron. Vuelve al
paso 2 y revisa los 3 campos.

---

## Setup del 1er site (`aedmigration`) — solo si hace falta

Este site ya existe y fue migrado del repo anterior cuando renombraste
`arebury/aed` → `arebury/smart-contact-platform`. **NO tocar nada** salvo
que el deploy esté fallando.

Si fallara, los settings correctos son:

```
Base directory:      (VACÍO)
Build command:       npm install --no-audit --no-fund && npm run build:aed
Publish directory:   dist/aed/browser
```

O directamente déjalo SIN override en la UI — el `netlify.toml` de la raíz
ya tiene esa misma config como default. Lo que está en UI sobrescribe lo
del toml, así que si la UI tiene valores antiguos (de antes del monorepo,
tipo `npm run build` y `dist/aed/browser`), bórralos para que use el toml.

---

## Por qué esta estructura (resumen para futuro-tú)

- **Un solo `netlify.toml` en la raíz** = la verdad para AED. Es el caso
  más común. Site `aedmigration` lo respeta sin override.
- **El 2do site (`ds-smartcontact`) sobrescribe en UI** = la decisión más
  simple. Probé alternativas (toml per-app, envvars, scripts dinámicos)
  y todas requerían más ceremony para un beneficio marginal.
- **`Base directory` vacío** en ambos = npm workspaces necesita correr
  desde la raíz del monorepo. Cambiar el base dir te mete en un infierno
  de paths relativos.

---

## Cuando añadas un 3er site (futuro: Memory)

Mismo patrón:
1. Añade el script `build:memory` al `package.json` raíz.
2. Crea `apps/memory/netlify.toml` (copia de `apps/ds-docs/netlify.toml`, cambia `ds-docs` por `memory`).
3. En Netlify: crea site nuevo, conecta repo, en UI mete:
   ```
   Base directory:    apps/memory
   Build command:     (VACÍO)
   Publish directory: (VACÍO)
   ```
4. Trigger deploy.

Esta guía se actualiza cuando eso pase.
