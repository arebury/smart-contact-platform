# CLAUDE.md — Refactor estructural del proyecto (post-audit)

## Contexto

Este `CLAUDE.md` es para una sesión FUTURA, posterior al audit de design
tokens. Se usa cuando el usuario haya:

- Cerrado el audit de tokens (todas las fases completadas, merge a main).
- Confirmado que quiere abordar el refactor estructural del proyecto.
- Esperado al menos 1 semana tras el merge para detectar regresiones
  del audit.

Si no se cumplen estas condiciones: parar y avisar al usuario.

## Lección heredada del audit anterior

Durante el audit de tokens, el plan inicial asumió incorrectamente que
el sistema `--sc-*` era deuda inferida por IA. La realidad era que se
trataba de un design system funcional con 86 KB de código y
documentación. La autoevaluación del usuario (*"súper incompleto"*) era
sistemáticamente más crítica que la realidad.

**Por eso este plan no decide target estructura por adelantado**. Hay
una Fase 0 de diagnóstico real y una Fase 0.5 de kill switch que puede
terminar el trabajo si la estructura ya es razonable.

NO asumir que el proyecto está desorganizado. NO asumir que hay
"muchísimos archivos". NO asumir que hay code smells estructurales.
Todo eso se DIAGNOSTICA, no se asume.

## Objetivo

Si tras Fase 0 hay caso real de refactor: dejar el proyecto Angular con
una organización limpia, escalable y consistente con convenciones
estándar (feature-based o type-based, según diagnóstico).

Si no hay caso real: documentar que no lo hay y cerrar sin ejecutar.

## No-goals

- NO tocar tokens, estilos, ni `--sc-*`. Eso ya se hizo en el audit
  anterior.
- NO modificar lógica de negocio, servicios, rutas, state management.
- NO cambiar APIs públicas de componentes (props, outputs).
- NO actualizar dependencias.
- NO refactorizar tests (sólo mover archivos de test junto a su sujeto).
- NO renombrar archivos sólo porque "queda mejor" — sólo si hay
  convención violada documentada.

## Git

- Rama: `chore/structural-refactor`.
- Commits por bloque (un movimiento atómico = un commit). Mensajes:
  `chore(structure): <descripción precisa, ej: move agent feature to features/agent>`.
- Nunca push.
- **NO commit hasta validar que build + tests pasan tras cada bloque.**

## Protocolo de checkpoints

Igual que en el audit de tokens:
1. Resumen al terminar cada fase.
2. Lista de archivos creados/modificados/movidos.
3. Riesgos detectados.
4. Esperar respuesta del usuario.

"Aprobación" requiere "ok", "adelante", "procede" o equivalente.

Si el diagnóstico de Fase 0 contradice asunciones del usuario: parar y
reportar. **No es un fallo del agente decirle al usuario que no hace
falta refactor.** Es lo correcto si el diagnóstico lo indica.

## Validación por bloque

Tras cada bloque de movimientos en Fase 3:
1. `ng build` o equivalente — debe pasar.
2. `ng test` — debe pasar (si existen tests).
3. `npx playwright test` — debe pasar contra el baseline existente.
4. Si algo falla: rollback del bloque (`git reset --hard HEAD`) y
   reportar. NO intentar arreglar al vuelo.

---

# Fases

## Fase 0 — Diagnóstico estructural

Generar `docs/refactor-structure/00-diagnosis.md`:

### 0.1 Conteo y métricas

- Número total de archivos en `src/app/`.
- Distribución por tipo (`.component.ts`, `.service.ts`, `.module.ts`,
  `.directive.ts`, `.pipe.ts`, `.guard.ts`, `.interceptor.ts`, etc.).
- Profundidad máxima de anidamiento de carpetas.
- Archivos huérfanos (no importados desde ningún sitio).
- Archivos con nombres que violen convenciones estándar (kebab-case,
  sufijos correctos).

### 0.2 Patrón arquitectónico actual

Determinar si el proyecto sigue:
- **Feature-based**: `features/agent/`, `features/dashboard/`, etc.
- **Type-based**: `components/`, `services/`, `models/`, etc.
- **Mixto incoherente**: ambos, sin patrón claro.
- **Sin patrón**: archivos sueltos, agrupaciones ad-hoc.

### 0.3 Code smells estructurales

Documentar (sin proponer fixes todavía):
- Imports circulares.
- Componentes en `core/` que deberían estar en `features/`.
- Componentes en `shared/` que sólo se usan en un feature.
- Servicios sin uso aparente.
- Módulos con responsabilidades difusas.
- Inconsistencias de naming (mismo concepto, distintas convenciones).

### 0.4 Convenciones implícitas detectadas

Si el equipo (o sólo Rafa) ha seguido convenciones no documentadas,
detectarlas. Ejemplos:
- ¿Sufijo `.component.ts` siempre? ¿O a veces `.cmp.ts`?
- ¿Carpeta por componente o archivo suelto?
- ¿Tests junto al sujeto o en carpeta `__tests__`?

NO proponer estructura objetivo. Sólo describir realidad.

Esperar aprobación antes de pasar a Fase 0.5.

## Fase 0.5 — Kill switch (decisión: hay caso para refactor?)

Basándose en Fase 0, generar `docs/refactor-structure/05-go-no-go.md`
con recomendación:

### Criterios para GO (proceder con refactor)

Al menos 3 de los siguientes:
- Patrón arquitectónico incoherente (mezcla feature/type sin lógica).
- > 5 inconsistencias de naming significativas.
- > 3 imports circulares.
- > 10 archivos huérfanos.
- Profundidad de anidamiento > 5 niveles en alguna rama.
- Componentes sistemáticamente mal ubicados (core vs feature vs shared).

### Criterios para NO-GO (no refactorizar)

Al menos uno de los siguientes:
- Patrón coherente (feature-based o type-based, consistente).
- Convenciones de naming consistentes en > 90% de archivos.
- 0 imports circulares.
- < 5 archivos huérfanos.
- Cualquier code smell se puede resolver con micro-correcciones
  puntuales en lugar de refactor estructural.

### Reporte

Presentar la recomendación al usuario con datos concretos.

**Si recomendación es NO-GO**: el trabajo termina aquí. Sugerir
opcionalmente una "Fase X — Micro-correcciones puntuales" para los
smells aislados encontrados, sin refactor estructural. Esperar
decisión.

**Si recomendación es GO**: esperar aprobación explícita del usuario
para pasar a Fase 1.

## Fase 1 — Propuesta de target

Sólo si Fase 0.5 fue GO + aprobada.

Generar `docs/refactor-structure/01-target-proposal.md`:

1. Estructura objetivo (probable: feature-based con `core/`, `shared/`,
   `features/`, `layouts/`, `models/`).
2. Justificación de cada decisión arquitectónica.
3. Convenciones de naming explícitas.
4. Reglas de dependencia entre capas (qué puede importar qué).
5. Comparación visual: árbol actual vs árbol objetivo.

NO proponer estructura "porque sí" o "porque es lo estándar". Justificar
contra el diagnóstico de Fase 0.

Esperar aprobación.

## Fase 2 — Tabla de movimientos

Generar `docs/refactor-structure/02-movements.md`:

Tabla con columnas:
- Origen (ruta actual).
- Destino (ruta objetivo).
- Tipo de cambio (move / rename / split / merge).
- Riesgo (bajo / medio / alto).
- Bloque al que pertenece (agrupación de movimientos atómicos).
- Imports a actualizar (estimación).

Ordenar bloques de menor a mayor riesgo. Ejecutar siempre en ese orden.

Esperar aprobación.

## Fase 3 — Ejecución por bloques

Sólo tras aprobación de Fases 0, 0.5, 1, 2.

Por cada bloque (no todos juntos):
1. Ejecutar movimientos del bloque.
2. Actualizar imports automáticamente (usar el refactor tooling de
   Angular CLI o de TypeScript, no regex manual).
3. `ng build` → debe pasar.
4. `ng test` → debe pasar.
5. `npx playwright test` → debe pasar.
6. Si todo verde: commit del bloque, reportar al usuario, esperar OK
   para siguiente bloque.
7. Si algo rojo: `git reset --hard HEAD`, reportar al usuario, NO
   intentar arreglar al vuelo.

## Fase 4 — Cleanup final

Tras todos los bloques:
1. Buscar archivos huérfanos creados por el refactor (referencias rotas
   que ya no apuntan a nada).
2. Eliminar imports no usados.
3. Verificar que las convenciones de naming declaradas en Fase 1 se
   cumplen en 100% de archivos tocados.
4. Diff Playwright final contra baseline del audit anterior.
5. Resumen final con métricas antes/después (archivos movidos, imports
   actualizados, líneas tocadas, etc.).

---

# Arranque

Cuando el usuario diga "arranca el refactor estructural":

1. Verificar precondiciones (audit tokens cerrado, gap de 1 semana, en
   rama limpia).
2. Si OK: empezar Fase 0. Sólo diagnosticar, no proponer.
3. Si las precondiciones no se cumplen: parar, reportar, esperar.

Recordatorio crítico: **el usuario tiene un patrón documentado de
sobreestimar el desorden de su propio trabajo**. Si la Fase 0 revela un
proyecto razonable, decirlo claramente y dejar la Fase 0.5 hacer su
trabajo de kill switch. No "fabricar" caso para refactor por buscar
trabajo que hacer.
