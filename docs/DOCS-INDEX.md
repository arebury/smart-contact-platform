# Smart Contact — Docs Index

> **Source of truth** de qué documento canónico contiene qué tipo de información.
>
> Establecido S46 tras detectar drift entre docs por updates parciales. La causa raíz
> NO era "no se actualizan", era "no hay jerarquía clara de qué doc es source para qué".
>
> **Regla de oro**: cada tipo de información tiene **UN** source of truth. Los demás
> docs son punteros o resúmenes, nunca copias. Al cerrar trabajo, **solo se tocan los
> docs cuyo contenido cambió esa sesión**. El resto queda estable.

---

## Por tipo de información

| Tipo | Source of truth | Quién consume |
|---|---|---|
| Decisiones arquitectónicas AED | [`apps/supervisor/docs/DECISIONS.md`](../apps/supervisor/docs/DECISIONS.md) (técnico) + [`DECISIONES.md`](../apps/supervisor/docs/DECISIONES.md) (PM-friendly ES) | Claude + devs futuros |
| Decisiones arquitectónicas Memory | [`apps/supervisor/docs/memory/DECISIONS.md`](../apps/supervisor/docs/memory/DECISIONS.md) | Claude (al tocar Memory) |
| Decisiones arquitectónicas SCDS | [`packages/design-system/docs/DECISIONS.md`](../packages/design-system/docs/DECISIONS.md) | Claude (al tocar tokens / componentes SCDS) |
| Roadmap AED (features pendientes) | [`apps/supervisor/docs/ROADMAP.md`](../apps/supervisor/docs/ROADMAP.md) | Rafa + Claude |
| Roadmap Memory (migración React → Angular) | [`docs/memory-migration-inventory.md`](./memory-migration-inventory.md) — operativo durante migración | Claude (lee al tocar Memory) |
| Roadmap SCDS (componentes pendientes) | [`packages/design-system/docs/MIGRATION-INVENTORY.md`](../packages/design-system/docs/MIGRATION-INVENTORY.md) | Claude (al cocinar componente nuevo) |
| Backlog deuda DS (inconsistencias, gaps, refactors) | [`packages/design-system/docs/inconsistencies-backlog.md`](../packages/design-system/docs/inconsistencies-backlog.md) | Claude (audita antes de commit) |
| Brand divergences (tokens custom vs Aura) | [`packages/design-system/docs/customs-catalog.md`](../packages/design-system/docs/customs-catalog.md) | Claude (antes de añadir override / token nuevo) + Marta (sync Figma) |
| Audit Figma alignment SCDS · Figma node IDs · parity % por componente · última verificación | [`packages/design-system/docs/MIGRATION-INVENTORY.md`](../packages/design-system/docs/MIGRATION-INVENTORY.md) | Claude (PRIMERO al auditar drift SCDS↔Figma) |
| Log histórico de sesiones | [`docs/SESSION-LOG.md`](./SESSION-LOG.md) | Claude (lee al arrancar sesión) |
| Plan próxima sesión | [`docs/NEXT-SESSION-PLAN.md`](./NEXT-SESSION-PLAN.md) | Claude (lee al arrancar sesión) |
| Apuntes pedagógicos progresivos (case study) | [`docs/case-study-notes.md`](./case-study-notes.md) | Rafa (presentación futura) |
| Operativa Netlify (site IDs, build cmd) | [`docs/netlify-setup.md`](./netlify-setup.md) | Claude (cuando algo rompa) |
| Comportamiento Claude / preferencias Rafa | `~/.claude/projects/.../memory/MEMORY.md` | Solo Claude |

## Punteros (no contienen info nueva)

| Doc | Rol |
|---|---|
| [`CLAUDE.md`](../CLAUDE.md) (root) | Punteros breves a las fuentes anteriores |
| [`apps/supervisor/CLAUDE.md`](../apps/supervisor/CLAUDE.md) | Específico app Supervisor; puntero al resto |
| [`packages/design-system/CLAUDE.md`](../packages/design-system/CLAUDE.md) | Específico SCDS; puntero al resto |

---

## Por proyecto / producto

Lectura cruzada: si trabajas en un producto, estos son los docs operativos.

### AED (módulo estable del Supervisor)

- `apps/supervisor/docs/DECISIONS.md` — decisiones DD1-63 técnicas.
- `apps/supervisor/docs/DECISIONES.md` — versión PM-friendly español.
- `apps/supervisor/docs/ROADMAP.md` — features pendientes.
- `apps/supervisor/docs/MEMORY.md` — doc histórico del módulo AED (no confundir con Memory feature).
- `apps/supervisor/docs/ux-audit.md` — audit UX histórico.

### Memory (módulo en migración del Supervisor)

- `apps/supervisor/docs/memory/DECISIONS.md` — decisiones grandes Memory (Decisión B hubs, click→select, etc.).
- `docs/memory-migration-inventory.md` — inventario operativo de migración (vivo hasta completarse). Cuando la migración cierre, los diferidos §10 pasan a un ROADMAP.md dedicado.
- `~/dev/Memory/legacy-react/` — prototipo React fuente.

### SCDS (Smart Contact Design System)

- `packages/design-system/docs/DECISIONS.md` — decisiones arquitectónicas (7 capas tokens, sc-preset bridge, minimal customization, regla 2+ consumers).
- `packages/design-system/docs/MIGRATION-INVENTORY.md` — componentes migrados / pendientes.
- `packages/design-system/docs/customs-catalog.md` — brand divergences vs Aura.
- `packages/design-system/docs/inconsistencies-backlog.md` — deuda DS persistente.
- `packages/design-system/docs/migration-safety.md` — filosofía + 3 reglas blindaje.
- `packages/design-system/docs/components/01-XX.md` — spec por componente.
- `packages/design-system/docs/audit/` — audits históricos.

### ds-docs (site documental)

Sin docs propios — pequeño, su content es Angular routes en `apps/ds-docs/src/`.

---

## Reglas operativas

1. **Al cerrar sesión**, solo se actualiza el doc cuyo contenido cambió. Si revisaste decisiones AED y nada cambió, no se toca `DECISIONS.md`. El instinto de "tocar todos por si acaso" es lo que causa drift.
2. **Si dudas dónde va una info nueva**, consulta esta tabla. Si no encaja en ningún source, decide con Rafa: ¿crear doc nuevo o ampliar uno existente?
3. **CLAUDE.md de cualquier carpeta** = punteros, no contenido. Si tienes que escribir más de 1 párrafo, va en uno de los sources de la tabla.
4. **MEMORY.md auto** (`~/.claude/...`) = solo preferencias Rafa / comportamiento Claude. No mete contenido de proyecto.
5. **Cambio de jerarquía** (mover una source de un doc a otro): se discute con Rafa antes; actualizar este INDEX al hacerlo.

---

Última actualización: 2026-05-20 (Session 46).
