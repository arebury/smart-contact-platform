# Auditoría UX — AED Supervisor (post-Phase 3)

> Revisión del producto migrado desde la perspectiva de **flujo de usuario**
> y **consistencia de implementación**. El criterio: el supervisor debería
> reconocer los mismos patrones estructurales y de interacción a lo largo
> de toda la plataforma. Cualquier cosa que le obligue a relearn = bug.
>
> Sin scores ni ratings. Solo hallazgos accionables, agrupados por flujo.
>
> Fecha: 2026-05-05 · Revisor: implementación migrada hasta Phase 3.7
> incluida.

---

## 1 — Patrones de listado (Labels, Templates, Users, Groups, Agents, Repositorios)

### Falta de selectores de columnas en listas con muchos campos

- **Location:** `agents-list-page.component.html`, `groups-list-page.component.html`
- **Issue:** La tabla de Agents tiene 9 columnas (código, nombre, extensión, canales, tipo, presencia, estado, grupos, acciones) y la de Groups 8. Otras listas (Labels, Templates) tienen 3-4. El usuario que está acostumbrado a Labels llega a Agents y se encuentra una pared de columnas que **no puede personalizar**. El prototipo React tenía un `ColumnSelector` con persistencia en localStorage; lo defería el roadmap pero ya causa rozamiento visible.
- **Action:** Implementar el `ColumnSelectorComponent` shared antes que cualquier otra mejora. Mismo dropdown en todas las listas con ≥5 columnas. Persistir la preferencia por feature (`smartcontact_<feature>_columns`).
- **Priority:** Critical

### Inconsistencia en si la búsqueda muestra contador de resultados

- **Location:** todas las páginas de listado
- **Issue:** Labels muestra `{count} labels` en el footer cuando hay resultados. Templates muestra `{count} plantillas`. Pero Users, Groups y Agents **no tienen footer count**. Repositorios tampoco. El usuario que entiende el patrón en Labels se sorprende cuando filtra Agents y no sabe cuántos resultados tiene tras una búsqueda.
- **Action:** Añadir el mismo footer "{count} {entidad}" a Users, Groups, Agents y Repos genéricos. O eliminarlo de Labels/Templates por consistencia. Recomiendo mantenerlo y propagarlo.
- **Priority:** Minor

### Orden inconsistente de los botones del header

- **Location:** headers de las páginas de listado
- **Issue:** Labels tiene `[Search] ... [Export]` y la creación va a la derecha en su propio anchor. Templates tiene `[Search]` solo (no hay export). Users / Groups / Agents tienen `[Export] [Crear]` a la derecha y `[Search]` debajo. No hay regla.
- **Action:** Estandarizar a:
  - Header derecha: `[Export ghost] [Crear primary]` siempre.
  - Action bar debajo: `[Search]` ocupando ~320px.
  - Labels usa el patrón híbrido (panel inline para crear) — válido pero el botón "Crear" debe vivir en el mismo sitio que en las demás.
- **Priority:** Critical

### Borradores duplicados aparecen arriba en algunas listas, abajo en otras

- **Location:** `users-list-page`, `groups-list-page`, `agents-list-page`
- **Issue:** En las 3 listas implementé "drafts pin to top" cuando se duplica un registro. Bien. Pero el badge "BORRADOR" está hardcodeado al token `users.draft_badge` desde Groups y Agents — funciona pero rompe la convención de namespaces por feature. Si mañana cambias el copy en Users, cambia en todos.
- **Action:** Mover `draft_badge` a `common.draft_badge` en `es.json` y referenciar desde las 3 features.
- **Priority:** Minor

---

## 2 — Forms (User, Group, Agent)

### El header sticky no muestra el mismo "tipo" de breadcrumb en create vs edit

- **Location:** `sticky-form-header.component.html` consumido por User/Group/Agent forms
- **Issue:** En modo `create` muestra el `entityKey` ("Nuevo agente"). En modo `edit` muestra el nombre actual del agente. Bien — pero **no muestra qué entidad estás editando**. Si el usuario ha llegado a la pantalla por una URL pegada o por el back del navegador, no sabe si está en `Agente` o `Usuario` hasta que mira la URL o el sidebar.
- **Action:** En modo edit, el sticky header debe mostrar **dos líneas**: línea pequeña "AGENTE" (uppercase, color subtle) sobre el nombre. Ya tiene `__entity` y `__name-row` separados pero la entity solo aparece en create. Mostrarla siempre.
- **Priority:** Critical

### Validation feedback solo aparece al hacer Save

- **Location:** `user-form-page`, `group-form-page`, `agent-form-page`
- **Issue:** El error "El nombre es obligatorio" no aparece hasta que el usuario pulsa Save. Tampoco se limpia si el usuario empieza a escribir un nombre válido. El usuario tiene que ir y venir entre el formulario y el botón.
- **Action:** Validar inline cuando el campo pierde foco (`blur`) y limpiar el error en cuanto el campo vuelve a ser válido (`input`). Bonus: la regla `canSave()` ya gobierna el botón Save — el error inline lo complementa, no lo reemplaza.
- **Priority:** Critical

### Faltan estados loading y empty consistentes en multiselectos del form

- **Location:** `user-form-page` (sections checkbox grid, services), `agent-form-page` (groups, permissions)
- **Issue:** Los checkbox-grids no tienen estado vacío. Si la lista de servicios o grupos disponibles es 0, sale un grid vacío sin mensaje. Probable que no pase con seed data, pero en producción puede.
- **Action:** Añadir `@if (list().length === 0) { <empty state> }` en cada checkbox-grid. Mensaje genérico tipo "No hay {entidad} disponibles".
- **Priority:** Minor

### Inputs de email y teléfono sin máscara ni hint visual

- **Location:** `user-form-page` (email), `agent-form-page` (email, phone, pin)
- **Issue:** El usuario escribe el PIN pero no sabe que debe ser 3-6 dígitos hasta que pulsa Save y ve el error. El email valida solo al guardar. Phone es libre.
- **Action:**
  - PIN: `inputmode="numeric"` + `pattern="\\d{3,6}"` + hint visual permanente "3-6 dígitos".
  - Email: validación inline en `blur` con mensaje específico.
  - Phone: `inputmode="tel"` (ya está) + considerar máscara internacional `+34 XXX XXX XXX`.
- **Priority:** Minor

### El form de Agents tiene 5 secciones pero sin TOC ni indicador de progreso

- **Location:** `agent-form-page.component.html`
- **Issue:** Identidad / Contacto / Canales / Grupos / Permisos. La página es larga; el usuario hace scroll y se pierde. El sticky header indica acción ("Save / Cancel") pero no contexto ("estás en sección 3 de 5").
- **Action:** Opciones (de menos a más invasivo):
  1. Añadir un mini-TOC sticky en el lado derecho con anchor links a cada sección.
  2. Añadir indicador de progreso de campos rellenos / requeridos.
  3. Convertir las 5 secciones en un Stepper de PrimeNG (decisión grande, requiere replantear flujo).
  Recomiendo la opción 1 — bajo coste, alta claridad.
- **Priority:** Minor

---

## 3 — Diálogos de borrado

### El diálogo "single" pide escribir el nombre; el de "bulk" no

- **Location:** `delete-entity-dialog.component`
- **Issue:** En modo single el usuario tiene que copiar/escribir el nombre exacto para confirmar. En modo bulk solo tiene que pulsar "Eliminar" (con opción de quitar chips). El bulk es más destructivo (varios registros a la vez) pero tiene **menos fricción** que el single. Es contraintuitivo.
- **Action:** En bulk, requerir escribir el conteo: "Escribe ELIMINAR 5 para confirmar". O mantener el patrón actual pero **siempre** pedir confirmación textual cuando count ≥ 3. El single con N=1 ya es bastante destructivo, el bulk con N=10 lo es 10×.
- **Priority:** Critical

### El botón "Cancelar" del bulk dialog cierra al pulsar la X de un chip si solo queda uno

- **Location:** `delete-entity-dialog.component.ts:removeChip()`
- **Issue:** Comportamiento útil (no quedarse con "borrar 0") pero **no avisa**. El usuario que estaba quitando chips uno a uno se ve de pronto fuera del diálogo sin haber cancelado explícitamente.
- **Action:** Mantener el cierre automático cuando se quita el último chip pero añadir un microcopy en el header: "Quita chips para excluirlos de la operación. Si los quitas todos, se cancela.". Mejor aún: deshabilitar la X del último chip restante y mostrar un tooltip explicativo.
- **Priority:** Minor

---

## 4 — Sidebar y navegación

### El sidebar marca "Repositorios" como activo cuando estás en /admin/labels o /admin/plantillas

- **Location:** `sidebar.component.ts` + `path-utils.ts`
- **Issue:** Decisión consciente (DD#302 del proto) pero **conflictúa con la estructura visual**. El sidebar muestra "Repositorios" como link directo bajo "Administración". El usuario hace click → va al hub. Pero si entra a Labels desde un breadcrumb o URL, el sidebar marca "Repositorios" como activo, **no Labels**. Labels no aparece en el sidebar. Hay disonancia entre lo que estás viendo (Labels) y lo que el sidebar dice (Repositorios).
- **Action:** Tres opciones:
  1. Listar las 11 sub-páginas de repositorios como hijos colapsables en el sidebar (navegación más rica, pero el sidebar crece).
  2. Mostrar un mini-breadcrumb permanente en el TopBar que diga "Repositorios > Labels" cuando estás dentro de un repo (ya está, pero el sidebar sigue marcando solo el padre).
  3. Añadir un sub-indicador visual en el sidebar tipo "Repositorios *(Labels)*" cuando estás dentro.
  Recomiendo 1.
- **Priority:** Critical

### El menú de usuario del TopBar no enlaza a "Mi perfil"

- **Location:** `top-bar.component.html`
- **Issue:** Solo hay "Centro de ayuda" y "Cerrar sesión". El nombre del usuario aparece arriba pero no es clicable. Si el supervisor quiere cambiar su email, contraseña o foto, no encuentra cómo.
- **Action:** Añadir un enlace "Mi perfil" que redirige a `/admin/usuarios/editar/<currentUserId>`. Requiere identificar quién es el current user (hardcoded "Mario Supervisor" hoy → quitar el hardcode).
- **Priority:** Critical

### "Decisiones de diseño" en el foot del sidebar no hace nada

- **Location:** `sidebar.component.ts:onOpenDesignDecisions()`
- **Issue:** Botón visible que no abre nada. Esto es peor que no estar — el usuario asume que está roto.
- **Action:** O bien (a) implementar el panel de decisiones (enlace a `DECISIONS.md` rendered, o un diálogo con la lista), o (b) ocultar el botón hasta que el panel exista. Si sigue oculto en producción, envolverlo en `@if (environment.dev)` para que solo aparezca en local.
- **Priority:** Critical

---

## 5 — Microcopy y consistencia de etiquetas

### "Crear" vs "Nuevo X" vs "Añadir"

- **Location:** botones de crear en distintas páginas
- **Issue:** Labels dice "Nueva label". Templates dice "Nueva plantilla". Users dice "Nuevo usuario". Groups "Nuevo grupo". Agents "Nuevo agente". Repos genéricos dicen "Crear" sin entidad. AED dice "Guardar cambios".
- **Action:** Estandarizar a "Nuevo {entidad}" en singular en todas las páginas que crean. El botón "Crear" pelado en Repos genéricos pierde contexto cuando hay múltiples entidades en pantalla.
- **Priority:** Minor

### "Eliminar" en bulk vs single — el verbo cambia

- **Location:** `delete-entity-dialog`
- **Issue:** Single dice "¿Eliminar {entidad}?". Bulk dice "¿Eliminar {count} {entidad-plural}?". El verbo es el mismo, perfecto. PERO el copy del cuerpo cambia entre "Esta acción no se puede deshacer" (single) y "Esta acción no se puede deshacer. Se eliminarán los siguientes:" (bulk). Inconsistencia menor.
- **Action:** Unificar el copy a un patrón con dos slots: warning genérico + lista opcional. La warning de "no se puede deshacer" debe aparecer siempre en el mismo lugar.
- **Priority:** Minor

### "Activo / Inactivo" vs "Activa / Inactiva" según género

- **Location:** Repositorios (Agendas tiene "Activa / Inactiva"), Users (tiene "Activo / Inactivo"), Agents (igual)
- **Issue:** Las traducciones siguen el género del sustantivo. "Una agenda activa" vs "un usuario activo". Correcto gramaticalmente pero inconsistente para el usuario que ve **diferentes estados con el mismo significado** según en qué página esté.
- **Action:** O bien (a) aceptar la corrección gramatical y documentar que es por género, o (b) usar un genérico neutro como "On / Off" o "Habilitado / Deshabilitado" en toda la app. Recomiendo (a) — el español flexionado es más natural; la inconsistencia es real pero el cost-benefit de cambiarlo no compensa.
- **Priority:** Minor

---

## 6 — Estados feedback (loading / empty / error)

### Falta estado loading global en navegaciones lazy-load

- **Location:** todo el router
- **Issue:** Las features se cargan en lazy chunks (~90 kB cada una en bundle). En conexiones lentas el usuario hace click en el sidebar y **no pasa nada visible** durante 1-3 segundos. No hay spinner global ni progress bar.
- **Action:** Añadir un `<p-progressBar mode="indeterminate" />` que escuche `Router.events` (`NavigationStart` / `NavigationEnd`). Renderizar en TopBar o como bar al borde superior de la app.
- **Priority:** Critical

### Empty states inconsistentes entre Labels y Templates

- **Location:** `labels-page.component.html`, `templates-page.component.html`
- **Issue:** Labels muestra empty state cuando `labels.length === 0` (no hay labels en absoluto). Templates muestra empty state cuando `templates.length === 0`. Bien — pero ninguna de las dos muestra empty state cuando hay items pero el filtro / tab no devuelve nada (Templates en tab Email cuando no hay emails, por ejemplo). En esos casos sale un table con la fila "Sin resultados". Inconsistente.
- **Action:** Una sola convención: si la **lista filtrada / scoped al tab** está vacía pero el dataset global tiene items, mostrar inline "Sin resultados" tipo no-results. Si el dataset global está vacío, mostrar el empty state grande. Aplicar igual en ambas.
- **Priority:** Minor

### El form-panel inline de Labels/Templates no tiene estado loading durante el save

- **Location:** `label-form-panel`, `template-form-panel`
- **Issue:** Single click en "Guardar" → la operación es síncrona en localStorage, así que de hecho no hay loading. Pero el usuario no sabe si su click se procesó hasta que ve el panel cerrarse. Si por algún motivo el storage falla, no hay feedback.
- **Action:** Añadir un estado `saving` al form panel (igual que el sticky form header de Users/Groups/Agents). Cualquier error de storage → toast de error visible.
- **Priority:** Minor

### El AED page no muestra qué ha cambiado en la sesión

- **Location:** `aed-page.component.html`
- **Issue:** Cuando el usuario marca/desmarca prefijos, el save bar aparece. Pero no hay lista de "lo que vas a guardar" más allá de los chips arriba. Si seleccionó 50 países a lo largo de la sesión, no recuerda cuáles añadió en esta sesión vs cuáles ya tenía.
- **Action:** Mostrar diff visual en la save bar: "Añadirás N · Quitarás M" o un tooltip con la lista. Bonus: undo button.
- **Priority:** Minor

---

## 7 — Affordances (cosas que parecen interactivas y no lo son, o al revés)

### Las priority pills de Groups parecen clicables pero no lo son

- **Location:** `groups-list-page.component.html`
- **Issue:** Los pills de prioridad (Baja/Media/Alta/Máxima) tienen colores fuertes y bordes. Visualmente sugieren que son filtros. No hacen nada al hacer click.
- **Action:** O hacerlos clicables (filtra la tabla por esa prioridad → patrón quick-filter), o quitar la sugerencia visual. Recomiendo hacerlos filtros — el patrón es estándar en list pages tipo Linear / Notion.
- **Priority:** Minor

### Channel chips en Agents y Groups parecen filtros

- **Location:** `agents-list-page` columna `Canales`, `groups-list-page` columna `Canales`
- **Issue:** Mismo problema. Los chips de phone/chat/email tienen tooltip pero no son interactivos.
- **Action:** Mismo: hacerlos filtros (quick-filter por canal) o quitar el cursor pointer si lo tienen.
- **Priority:** Minor

### El TopBar avatar es el único punto de menú de usuario y no se ve afordance

- **Location:** `top-bar.component.html`
- **Issue:** El avatar (icono de usuario) abre el menú con click. No tiene chevron, no tiene "Mario S." al lado. El usuario tiene que descubrir que es clicable.
- **Action:** Añadir el nombre del usuario al lado del avatar y un chevron-down sutil. Patrón estándar Slack / Notion / GitHub.
- **Priority:** Minor

---

## 8 — Recuperación de errores

### No hay handler para errores de localStorage (cuota llena, modo incógnito strict)

- **Location:** `core/services/local-store.factory.ts`
- **Issue:** El factory tiene `try/catch` que silencia errores de write. Si la cuota se llena (raro pero posible con muchos agentes / labels) o el navegador está en modo super-strict, los cambios del usuario se pierden silenciosamente — el usuario edita un agente, pulsa Save, ve el toast de éxito, refresca y los cambios no están.
- **Action:** Cuando `writeToStorage` falla, emitir un toast de error visible con instrucciones ("No se pudieron guardar los cambios. Limpia la caché del navegador o exporta los datos antes de continuar.").
- **Priority:** Critical

### El form de edit no avisa si la entidad ha sido borrada en otra pestaña

- **Location:** todos los `<entity>-form-page.component.ts`
- **Issue:** El usuario abre Agente #5 en pestaña A y en pestaña B lo borra. Vuelve a A, edita, pulsa Save → el `updateAgent` no encuentra el id y silencia. El usuario ve el toast de éxito sin que se haya guardado nada.
- **Action:** Antes del save, re-leer del store. Si el id ya no existe, mostrar diálogo "Este agente fue eliminado en otra pestaña. ¿Recrearlo o descartar cambios?". Es exactamente el caso que el `cross-tab warning` del prototipo cubría — buen momento para implementarlo.
- **Priority:** Critical

---

## 9 — Resumen ejecutivo accionable

**Top-5 fixes Critical antes del próximo release:**

1. **Loading bar global** durante navegaciones lazy-loaded.
2. **Estado de identidad en sticky form header** (mostrar entity en edit mode).
3. **Validación inline de forms** (`blur` + `input` clear, no solo en Save).
4. **Confirmación textual en bulk delete** cuando count ≥ 3.
5. **Cross-tab warning + error handler de localStorage** (los dos casos donde el usuario pierde datos sin saberlo).

**Top-3 fixes Critical que limpian el sidebar:**

6. **Listar sub-páginas de Repositorios** como hijos colapsables en el sidebar (resuelve la disonancia "estoy en Labels pero el sidebar dice Repositorios").
7. **Quitar el botón "Decisiones de diseño"** o conectarlo a un diálogo real.
8. **Implementar "Mi perfil"** en el menú de usuario del TopBar.

Los Minor se pueden agendar en sprints sucesivos. Recomendación: tirar de
los 5 críticos en una sola PR de "UX consistency pass" antes de meter
ninguna feature nueva.
