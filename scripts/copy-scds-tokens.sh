#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# copy-scds-tokens.sh
# ═══════════════════════════════════════════════════════════════════
#
# Camino C de la Fase 4 (Memory consume tokens SCDS) según
# `docs/NEXT-SESSION-PLAN.md`.
#
# Copia las 7 capas de tokens `--sc-*` del SCDS a un repo consumer
# externo (Memory, futuro). Manual sync — no automatización CI.
#
# Uso:
#   ./scripts/copy-scds-tokens.sh <ruta-absoluta-del-consumer>
#
# Ejemplo:
#   ./scripts/copy-scds-tokens.sh /Users/rafareses/dev/memory-app
#
# El consumer espera tokens en `src/styles/sc-tokens/`. El script
# crea la carpeta si no existe, copia los 6 layers + index.css, y
# muestra el snippet de import recomendado.
#
# IMPORTANTE: no copia `sc-preset.ts` — eso es bridge Angular/PrimeNG
# específico de SCDS+AED. Memory (React + Radix) consume los tokens
# CSS directos; no necesita el preset.
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Args ─────────────────────────────────────────────────────────
if [[ $# -ne 1 ]]; then
  echo "❌  Uso: $0 <ruta-absoluta-del-consumer>" >&2
  echo "" >&2
  echo "Ejemplo: $0 /Users/rafareses/dev/memory-app" >&2
  exit 1
fi

CONSUMER_PATH="$1"

if [[ ! -d "$CONSUMER_PATH" ]]; then
  echo "❌  El path '$CONSUMER_PATH' no existe o no es un directorio." >&2
  exit 1
fi

# ── Locate SCDS root (this script lives in monorepo/scripts/) ────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCDS_TOKENS="$MONOREPO_ROOT/packages/design-system/tokens"

if [[ ! -d "$SCDS_TOKENS/layers" ]]; then
  echo "❌  No se encuentra '$SCDS_TOKENS/layers'. ¿Estás en el monorepo correcto?" >&2
  exit 1
fi

# ── Target ──────────────────────────────────────────────────────
TARGET_DIR="$CONSUMER_PATH/src/styles/sc-tokens"
mkdir -p "$TARGET_DIR/layers"

echo "📦  Copiando tokens SCDS → $TARGET_DIR"

# Copiar las 6 capas + index orchestrator
cp -v "$SCDS_TOKENS/layers/"*.css "$TARGET_DIR/layers/"
cp -v "$SCDS_TOKENS/index.css" "$TARGET_DIR/"

# Hash del HEAD para trazabilidad
COMMIT_HASH=$(cd "$MONOREPO_ROOT" && git rev-parse --short HEAD 2>/dev/null || echo "uncommitted")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > "$TARGET_DIR/SYNC.md" <<EOF
# SCDS tokens — sync log

Last sync: $TIMESTAMP
SCDS commit: $COMMIT_HASH
Monorepo path: $MONOREPO_ROOT

## How to refresh

Run from the SCDS monorepo:

\`\`\`bash
./scripts/copy-scds-tokens.sh $CONSUMER_PATH
\`\`\`

This overwrites layers/*.css and index.css. Custom overrides should
live in **a separate file** in this consumer (e.g. \`memory-overrides.css\`),
imported AFTER index.css so they win the cascade.

## What's here

- \`index.css\` — orchestrator. Import this from your entry CSS.
- \`layers/01-primitive.css\` … \`layers/07-dark.css\` — the 6 token layers.
  See [packages/design-system/tokens/README.md](https://github.com/arebury/smart-contact-platform/blob/main/packages/design-system/tokens/README.md) en el monorepo SCDS.

## What's NOT here

- \`sc-preset.ts\` — Angular/PrimeNG bridge. Consumers no-Angular (React, Vue, etc.)
  no lo necesitan; consumen los \`--sc-*\` CSS directos.

## Linking back to SCDS

Cualquier divergencia que necesites debe documentarse en
[customs-catalog.md](https://github.com/arebury/smart-contact-platform/blob/main/packages/design-system/docs/customs-catalog.md).
NO modifiques las capas locales — el próximo sync sobrescribe.
EOF

echo ""
echo "✅  Sync completado en $TARGET_DIR"
echo ""
echo "📋  Próximos pasos en el consumer:"
echo ""
echo "  1. Importar en tu entry CSS (Memory: probablemente src/index.css o similar):"
echo ""
echo "     @import \"./styles/sc-tokens/index.css\";"
echo ""
echo "  2. (Opcional) Mapping Tailwind/UnoCSS → \`--sc-*\` en tu config:"
echo ""
echo "     theme: { extend: { colors: { primary: 'var(--sc-bg-primary)' } } }"
echo ""
echo "  3. Borrar tokens duplicados del consumer (cualquier \`--\` que duplique un \`--sc-*\`)."
echo ""
echo "  4. Verificar build verde + screenshot smoke."
echo ""
echo "  5. Commit en el consumer mencionando SCDS commit $COMMIT_HASH para trazabilidad."
echo ""
