# Prompt de retomada — Próxima sesión (S35)

> **Para Rafa:** copia el texto del bloque siguiente y pégalo cuando abras
> Claude. Eso re-activa todo el contexto S34 + mapa estratégico Memory
> + tono correcto.

---

## ✂️ Prompt para pegar en Claude:

```
Lee docs/NEXT-SESSION-PLAN.md, después la entry "Session 34" entera de
docs/SESSION-LOG.md, después docs/case-study-notes.md, y arranca con
Eje 3 del mapa estratégico: Memory migración al monorepo como feature
module Supervisor app.

Tono y memorias activas (verifica MEMORY.md):
- Critical sparring partner activo — cuestiona premisas, no agrees por
  defecto, ofrece counterpoints. Para tareas mecánicas ejecuta sin
  ceremonia.
- Español llano, sin jerga, frases cortas. Sin subheaders rellenos.
- Rafa Y Marta editan Figma SC — no adjudicar tareas Figma solo a Marta.
- Memory comparte shell con AED (mismo Supervisor app, sidebar único).
  Migración Memory = feature module dentro del shell común. Probable
  rename apps/aed/ → apps/supervisor/.
- No deudas escondidas: verificación visual obligatoria post-migración
  mecánica (lección S34 — el grep no es la realidad).
- Regla pragmática refactor SCDS: (1) mismo concepto (2) reduce código
  sin forzar UX changes (3) tokens Figma auditados.
- Case-study-notes progresivo cuando aparezca momento pedagógico.
- Comunicación pedagógica con el "para qué" para perfil no-dev.

Plan de sesión Memory migration (4-8h dedicado):

FASE 0 (15 min, cero riesgo): backup completo del prototipo React.
  - cd ~/dev/Memory
  - git tag v0-prototype-react-pre-scds && git push origin v0-prototype-react-pre-scds
  - git branch prototype-react-archive && git push origin prototype-react-archive
  - Configurar Netlify para que memoryplus3.netlify.app deploye la
    branch prototype-react-archive (mantener URL pública viva).

FASE 1 (30 min): reorganizar repo Memory.
  - Mover código React actual a legacy-react/ dentro del propio repo.
  - Commit "chore: archivar prototipo v0 en legacy-react/ pre-SCDS".

FASE 2 (30 min decisión): integración al monorepo.
  Tres opciones a evaluar conmigo (yo doy pros/cons, decisión Rafa):
  a) Mover Memory entero al smart-contact-platform monorepo como
     apps/aed/src/app/features/memory/ (feature module del shell AED).
     Probable rename apps/aed/ → apps/supervisor/.
  b) apps/memory/ standalone dentro del monorepo, shell compartido vía
     package interno.
  c) Memory repo independiente consumiendo SCDS vía workspace/npm.
  Mi recomendación tentativa: (a) por simplicidad y sidebar compartido,
  pero hablamos en sesión.

FASE 3 (30 min): scan inicial features React.
  - Inventario top-level (NO detalle exhaustivo) de pantallas/módulos
    del prototipo Memory.
  - Mapear equivalencias en el sidebar AED actual.
  - Anotar features que no tienen equivalencia → posibles wrappers SCDS
    nuevos (data-table, stepper, etc.).

FASE 4 (1-2h): setup Angular greenfield.
  - Si fase 2 = opción (a): rename apps/aed/ → apps/supervisor/ + crear
    features/memory/ con shell layout existente reusado.
  - Si fase 2 = opción (b): ng generate apps/memory/ con config idéntica
    a apps/aed (PrimeNG + ScPreset + Lucide + lazy routes).
  - Conectar a SCDS (import wrappers desde @shared/components).
  - Configurar Netlify nueva URL TBD.

FASE 5: migración funcionalidad-por-funcionalidad (iterativa,
posiblemente varias sesiones). Cada feature migrada:
  - Compara visual con legacy-react/ durante dev.
  - Consume SCDS (wrappers AED reutilizables + tokens --sc-*).
  - Si encuentras feature que necesita componente nuevo (data-table,
    stepper, etc.) → cocinar wrapper SCDS siguiendo workflow estándar.

Decisiones que faltan al arrancar:
- ¿URL definitiva nueva para Angular Memory? Sugerencia: smart-contact.netlify.app
  o memoryplus.netlify.app, dejando memoryplus3 para legacy.
- ¿Memory tiene URL distinta de AED o son paths distintos del mismo
  domain? Si mismo shell, mismo domain hace sentido.

Acceso al repo Memory:
- Local: ~/dev/Memory/
- Remote: https://github.com/arebury/Memory
- Live: https://memoryplus3.netlify.app/

NO empieces a tocar Memory sin que confirme. Primero Fase 0+1 (backup
reversible), luego me preguntas antes de Fase 2 (decisión arquitectónica).
```

---

## Notas adicionales para próxima sesión

**Estado al cierre S34:**

- 7 commits a main S34: `130087a`, `d8a8346`, `735047b`, `6b9cab2`, `89d21ea`, `609bd46`, `ffae8b3`, `153b12c`.
- DS sin deudas de diseño accionables internamente.
- Mapa estratégico cerrado (7 ejes), Eje 3 (Memory) es el siguiente.
- `case-study-notes.md` arrancado con 8 momentos S34.

**Lo que Rafa pidió específicamente para retomada:**

- Mapa estratégico tiene que arrancarse genial.
- Memory frictionless migración.
- Funcionalidades del prototipo preservadas (legacy-react/ + tag).
- Conectado al DS (consumir SCDS).
- Sidebar compartido con AED.
- URL Netlify legacy + nueva oficial.

**No prioridades para próxima sesión (no atacar sin trigger):**

- Items 1, 2, 6 esperan a sesión Figma con Rafa+Marta.
- Items 5, 7 trigger-dependent.
- Item 2b (Code Connect) cuando Rafa dé luz verde explícita.

**Tono recordatorio**: Rafa es no-dev. Plain Spanish. Explicar el "para
qué" no solo el "qué". Sparring crítico activo. Sin morralla.
