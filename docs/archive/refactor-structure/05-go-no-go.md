# Fase 0.5 — Kill switch decision: refactor estructural

> Decisión formal go / no-go basada en el diagnóstico de
> [`00-diagnosis.md`](./00-diagnosis.md), aplicando los criterios
> declarados en `CLAUDE.md`.

---

## Criterios para GO (≥3 de los siguientes)

| Criterio | Umbral | Realidad | Cumple? |
|---|---|---|---|
| Patrón arquitectónico incoherente | mezcla feature/type sin lógica | feature-based estricto y consistente | **NO** |
| Inconsistencias de naming significativas | > 5 | 0 detectadas | **NO** |
| Imports circulares | > 3 | 0 | **NO** |
| Archivos huérfanos | > 10 | 0 (los 30 "candidatos" son lazy-loaded) | **NO** |
| Profundidad de anidamiento en alguna rama | > 5 niveles | máximo 5, estándar | **NO** |
| Componentes sistemáticamente mal ubicados | varios casos | 0 detectados | **NO** |

**Criterios GO cumplidos: 0 de 6.**

## Criterios para NO-GO (≥1 de los siguientes)

| Criterio | Realidad | Cumple? |
|---|---|---|
| Patrón coherente (feature-based o type-based) | feature-based ✓ | **SÍ** |
| Convenciones de naming > 90% consistentes | 100% | **SÍ** |
| 0 imports circulares | 0 ✓ | **SÍ** |
| < 5 archivos huérfanos | 0 ✓ | **SÍ** |
| Code smells resolubles con micro-correcciones | N/A — no hay smells | **SÍ** |

**Criterios NO-GO cumplidos: 5 de 5.**

---

## Recomendación: **NO-GO**

No hay caso para un refactor estructural. El proyecto está organizado
según convenciones estándar de Angular standalone-first, con feature
folders consistentes, naming uniforme, sin imports circulares, sin
archivos huérfanos, y sin code smells observables. Cualquier
"refactor" intervendría en código sano y produciría más riesgo que
valor.

### Lo que el track 2 (code cleanup) también encontró

Cero hallazgos accionables en producción:

- 0 unused imports
- 0 TODO / FIXME / HACK
- 0 `any` en código no-test
- 0 console.log residual
- 0 `.DS_Store` tracked en git
- 1 `console.error` en bootstrap (legítimo)

No hay nada que "limpiar".

---

## Lo único que merece atención (separadamente)

**Cobertura de tests baja**: 23% componentes con spec, 17% servicios.
Esto **no es un problema estructural** ni de limpieza — es una
decisión de inversión en QA. Si quieres subir cobertura, es trabajo
separado:

- Listar los componentes/servicios sin spec.
- Priorizar por criticidad (form pages > list pages > display
  components, según riesgo de regresión).
- Decidir cobertura objetivo (50%? 70%? 90%?).
- Plan en sesión dedicada.

No lo recomiendo automáticamente — la velocidad de iteración en
este prototipo puede preferir ir rápido sin lastre de tests
mientras la API no se haya estabilizado. Decisión tuya.

---

## Patrón meta

Tu autopercepción inicial ("veo muchas cosas sueltas") **no se
sostiene con los datos**. Es el mismo patrón documentado en la
memoria del proyecto: subestimar el orden real de tu propio
trabajo.

Esta es la tercera vez en sesiones recientes:
1. **Audit de tokens (DD#63)** — pensaste que `aed-preset.ts` era
   "deuda inferida"; era un bridge deliberado de 250 líneas.
2. **GUIA.md "no tengo identidad documentada"** — tenías 36 KB de
   documentación en español.
3. **Ahora "muchas cosas sueltas"** — 265 archivos, 0 desorden.

No es una crítica. Es un patrón a internalizar: tu instinto
sistemáticamente infravalora lo que ya tienes hecho. La próxima
vez que sientas "esto está hecho un lío", recuerda que ya ha
salido falso tres veces seguidas. Pide un diagnóstico antes de
asumir que hay que rehacer algo.

---

## Acción

1. Cerrar este branch sin commits adicionales más allá de los dos
   docs (`00-diagnosis.md` + este).
2. Borrar branch `chore/structural-refactor` después (no hay nada
   que mergear, no hay PR).
3. Si en el futuro detectas problemas concretos (un componente
   específico mal ubicado, un servicio sin usar), abrir issue
   puntual y resolverlo en una sesión micro. NO un refactor
   estructural masivo.
4. Plan stashed en `docs/refactor-structure/CLAUDE.md` queda
   disponible si en el futuro la realidad cambia (proyecto crece
   y aparecen smells reales). Hoy no aplica.
