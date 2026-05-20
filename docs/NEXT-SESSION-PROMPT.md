# Prompt de retomada — Próxima sesión (S36)

> **Para Rafa:** copia el texto del bloque siguiente y pégalo cuando abras
> Claude. Eso re-activa todo el contexto S35 + plan Fase 5 Memory migration
> + tono correcto.

---

## ✂️ Prompt para pegar en Claude:

```
Lee docs/NEXT-SESSION-PLAN.md (cierre S35 + plan Fase 5 Memory), después
la entry "Session 35" entera de docs/SESSION-LOG.md, después
docs/memory-migration-inventory.md, y arranca con Fase 5 Memory
migration: empezar por ConversationsView (la vista funcional más grande
del prototipo React Memory).

Tono y memorias activas (verifica MEMORY.md):
- Critical sparring partner activo — cuestiona premisas, no agrees por
  defecto, ofrece counterpoints. Para tareas mecánicas ejecuta sin
  ceremonia.
- Español llano, sin jerga, frases cortas. Sin subheaders rellenos.
- El equipo y Rafa editan Figma SC — no adjudicar tareas Figma solo al equipo de diseño.
- Memory comparte shell con AED (ahora apps/supervisor/). Memory =
  feature module en apps/supervisor/src/app/features/memory/.
- No deudas escondidas: verificación visual obligatoria post-migración
  mecánica con Playwright (el grep no es la realidad).
- Regla pragmática refactor SCDS: (1) mismo concepto (2) reduce código
  sin forzar UX changes (3) tokens Figma auditados.
- Case-study-notes progresivo cuando aparezca momento pedagógico.
- Comunicación pedagógica con el "para qué" para perfil no-dev.
- Customización MÍNIMA sobre PrimeNG: antes de pure-sc, 3 preguntas
  (¿PrimeNG lo tiene? ¿pTemplate cubre? ¿no? → pure-sc + customs-catalog).
- Pedir link Figma SC ANTES de tocar/crear/refinar componente. Si Rafa
  no lo tiene a mano, esperar.

Plan de sesión Fase 5 ConversationsView migration:

PASO 0 (5 min): Verificar estado.
  - cd ~/dev/smart-contact-platform
  - git status (debe estar limpio post-S35).
  - npm install (por si lock cambió).
  - Verificar `~/dev/Memory/legacy-react/` accesible.

PASO 1 (15-30 min): Spike visual del prototipo.
  - cd ~/dev/Memory/legacy-react && pnpm install && pnpm dev
  - http://localhost:5173 → navegar a vista Conversations.
  - Screenshots de pantalla principal (lista + filtros + selección
    múltiple + reproductor modal abierto) para tener referencia visual
    durante implementación Angular.
  - Cerrar dev React cuando termine spike.

PASO 2 (30 min decisión): Diseño Angular antes de codear.
  - Inventario subcomponentes ConversationsView: filtros, tabla,
    reproductor, modales (ver docs/memory-migration-inventory.md §3).
  - Decidir orden: primero esqueleto + tabla mínima, después filtros,
    después selección múltiple, después reproductor. O lo que Rafa prefiera.
  - Para wrappers SCDS necesarios:
    - `<sc-datepicker>`: existe Extended 0 uses, primer uso real.
    - `<sc-multiselect>`: existe Extended 0 uses, primer uso real.
    - `<sc-data-table>` (gap nuevo): PEDIR a Rafa link Figma "Table" del
      Kit Pro antes de cocinar. Si no hay equivalente Figma, decidir si
      es Pure SC custom o esperar.
    - `<sc-audio-player>` (gap nuevo): idem, gran probabilidad de ser
      Pure SC custom porque PrimeNG no tiene audio player nativo.

PASO 3 (resto de sesión): Implementación iterativa.
  - Cada subcomponente: leer React → traducir Angular → consumir SCDS →
    verificar visualmente.
  - Si aparece gap componente real → entry inconsistencies-backlog +
    aplicar regla pragmática refactor SCDS.
  - Commits pequeños por logical chunk (no un solo commit gigante).

Stack target Memory (idéntico AED):
- Angular 21 (standalone, signals, @if/@for)
- PrimeNG 21 vía @primeng/themes/aura + ScPreset
- Lucide icons
- @ngx-translate (i18n keys nuevas en apps/supervisor/src/assets/i18n/es.json)
- Tests Karma/Jasmine
- Playwright para verificación visual

NO arranques migration sin que confirme el orden de PASO 2. Primero
hablamos sobre el approach.

Acceso al repo Memory legacy:
- Local: ~/dev/Memory/legacy-react/
- Remote: https://github.com/arebury/Memory (branch main + prototype-react-archive)
- Tag inmutable: v0-prototype-react-pre-scds
- Live React (mientras no se libere memoryplus3): pnpm dev local.

Última acción manual pendiente Rafa Netlify UI (si no se hizo en S35):
- Site `aedmigration` → Build command `npm install --no-audit --no-fund
  && npm run build:supervisor`, Publish dir `dist/supervisor/browser`.
  Sin esto el próximo deploy Netlify falla.
```

---

## Notas adicionales para próxima sesión

**Estado al cierre S35:**

- 5 commits totales en 2 repos:
  - Memory repo: `2195989`, `ed8bb31`.
  - Monorepo: `be25387`, `d7e764b`, `d02392e` (+ commit final de cierre).
- Fase 0 + 1 + 2 + 2.5 + 3 + 4 del plan Memory migration completadas.
- Memory feature module scaffolded y wireado en `/conversaciones`.
- Rename apps/aed → apps/supervisor ejecutado limpio (236 renames + history).
- Inventario migración disponible en `docs/memory-migration-inventory.md`.

**Lo que Rafa pidió específicamente para retomada:**

- Memory frictionless migración progresiva.
- Funcionalidades del prototipo preservadas (legacy-react/ + tag + branch).
- Conectado al DS (consumir SCDS, primer uso real de Extended 0-use
  wrappers).
- Sidebar unificado con AED (Memory comparte shell Supervisor).
- URL Netlify legacy + nueva (memoryplus3 → alias DNS cuando Memory
  tenga features mínimas).

**No prioridades para próxima sesión (no atacar sin trigger):**

- Items 1, 2, 6 esperan a sesión Figma con el equipo.
- Items 5 (gap `<sc-tag>`, `<sc-select-button>`, `<sc-toggle-button>`),
  7 trigger-dependent.
- Item 2b (Code Connect) cuando Rafa dé luz verde explícita.

**Tono recordatorio**: Rafa es no-dev. Plain Spanish. Explicar el "para
qué" no solo el "qué". Sparring crítico activo. Sin morralla. Para
features Memory grandes (ConversationsView, RulesRepository) considera
trocear en sub-tareas TodoWrite para que Rafa siga el progreso.
