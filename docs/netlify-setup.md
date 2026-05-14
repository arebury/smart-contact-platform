# Netlify — setup multi-site

> Cómo configurar los 2 sites Netlify que sirven desde este monorepo.
> Pensado para que Rafa o cualquiera del equipo lo siga sin acordarse
> de qué decisión se tomó cuándo.

---

## El esquema

Un solo repo (`arebury/smart-contact-platform`) → 2 sites Netlify:

| Site | Qué sirve | URL | Build command | Publish dir |
|------|-----------|-----|---------------|-------------|
| `aedmigration` | App AED (Supervisor) | aedmigration.netlify.app | `npm install --no-audit --no-fund && npm run build:aed` | `dist/aed/browser` |
| `ds-smartcontact` | Sitio docs SCDS | ds-smartcontact.netlify.app | `npm install --no-audit --no-fund && npm run build:ds-docs` | `dist/ds-docs/browser` |

**El `netlify.toml` en la raíz del repo configura el default = AED.** Por eso el site `aedmigration` funciona out-of-the-box. El site `ds-smartcontact` necesita override en su Netlify UI porque su build NO es el default.

---

## Setup del 2do site (`ds-smartcontact`) paso a paso

### 1. Crear el site

Si aún no existe:
1. https://app.netlify.com → **Add new site → Import an existing project**.
2. Conecta con GitHub → selecciona `arebury/smart-contact-platform`.
3. Branch to deploy: `main` (después de mergear la foundation PR).
4. Acepta los defaults del wizard sin tocar nada — vamos a sobrescribir después.

### 2. Override de build settings

Una vez creado el site, ve a:

**Site settings → Build & deploy → Continuous deployment → Build settings → Edit settings**

Rellena los 3 campos así (los anteriores estarán con valores tipo "vite build" o vacíos):

```
Base directory:      (déjalo VACÍO — no metas nada)
Build command:       npm install --no-audit --no-fund && npm run build:ds-docs
Publish directory:   dist/ds-docs/browser
```

Guarda.

> ⚠️ El campo **Base directory** debe quedar VACÍO. Si pones `apps/ds-docs/`,
> Netlify intentará correr el build desde ahí, y `npm install` fallará porque
> el `package-lock.json` y los `node_modules` viven en la raíz del monorepo
> (npm workspaces). Tiene que correr desde la raíz.

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
1. Crea site en Netlify, conecta repo, deja defaults.
2. Override en UI:
   ```
   Base directory:    (VACÍO)
   Build command:     npm install --no-audit --no-fund && npm run build:memory
   Publish directory: dist/memory/browser
   ```
3. Añade el script `build:memory` al `package.json` raíz.
4. Trigger deploy.

Esta guía se actualiza cuando eso pase.
