# 2026-05-15 — Sacar el repo de iCloud (Desktop → ~/dev/)

> Sesión corta pero con lección gorda sobre infra. Empieza como "mover una
> carpeta" y acaba siendo "por qué iCloud + Git no se llevan bien".

---

## Lo que pasó

Llevábamos arrastrando problemas raros desde hace días en el repo:

- Archivos `.DS_Store` rompiendo cadenas `&&` de comandos shell.
- Archivos fantasma reapareciendo después de borrarlos con `git mv`.
- Permisos `600` raros aplicándose solos.
- Duplicados con sufijo " 2" (típicos de iCloud) apareciendo en repos como
  Memory 3.0 (`ConversationTable 2.tsx`).
- `git mv` y operaciones de disco extremadamente lentas.

Causa raíz: el repo vivía en `~/Desktop/AED/`, y `~/Desktop` está
sincronizado con iCloud Drive por defecto en macOS. iCloud no fue diseñado
para Git: trata cada `.git/objects/...` como un documento del usuario y
mete su sync layer encima.

Decisión: mover los repos a `~/dev/` (carpeta normal, fuera de iCloud).

## El intento ingenuo (que falló)

Primer plan: `rsync` del repo entero al nuevo path. Limpio, conservador,
copia tal cual. **Resultado real**: en 20 minutos solo había copiado **8.5
MB** y **53 archivos**. A ese ritmo eran horas.

Por qué fue tan lento: macOS marca como "dataless" archivos en iCloud que
no se han abierto recientemente — no están en disco, viven en la nube. El
`.git/` tiene miles de archivos pequeños y la mayoría estaban dataless.
`rsync` los pedía uno por uno y cada uno requería una descarga HTTP de
iCloud. El daemon `cloudd` consumía CPU al 100% bajando archivos.

## El Plan B que funcionó

Como AED estaba 100% commiteado y pusheado a GitHub:

1. Matar el rsync.
2. Borrar el destino parcial.
3. `git clone https://github.com/.../smart-contact-platform.git ~/dev/...`
4. Copiar a mano el único archivo no trackeado importante
   (`.claude/settings.local.json`, 25 KB).

**Tiempo total: ~3 minutos.** Cero archivos perdidos. Más limpio incluso
(no arrastró residuos de iCloud).

Para **Memory 3.0**, como tenía 27 archivos no commiteados, sí hubo que
usar rsync — pero solo eran 17 MB en total, no 600 MB, así que pasó.

## Key takeaways para próximos proyectos

1. **Nunca pongas un repo de Git activo en `~/Desktop/`, `~/Documents/` o
   cualquier carpeta sincronizada con iCloud.** Usa `~/dev/` o similar.
2. **Si por lo que sea tienes que migrar uno, intenta `git clone` antes
   que `rsync`.** Más rápido, más limpio, y verifica integridad por diseño.
   `rsync` solo si hay cosas sin commitear (y entonces commitea ANTES si
   puedes).
3. **Síntomas de "estás en iCloud sin darte cuenta"**:
   - Archivos `.DS_Store` apareciendo sin parar.
   - Duplicados con sufijo `" 2"` en nombres.
   - `git status` mostrando cambios fantasma.
   - Comandos de disco lentos de forma inexplicable.
4. **Cómo comprobarlo de un golpe**: si la ruta del repo empieza por
   `~/Desktop/`, `~/Documents/`, `~/Library/Mobile Documents/...` o
   `~/iCloud Drive/`, ya estás en iCloud. Mira en el Finder: si la
   carpeta tiene el icono de nube ☁️, sync activo.
5. **Carpetas para dev** (recomendado): `~/dev/`, `~/code/`, `~/src/`,
   `~/Projects/` — cualquiera de estas, pero asegúrate de NO meterlas en
   iCloud (System Settings → Apple Account → iCloud → iCloud Drive →
   Desktop & Documents = OFF, o si quieres tenerlo ON, mantén tus repos
   fuera).
6. **Si arrancas un proyecto nuevo**: créalo directamente en `~/dev/` o
   donde sea, no en Desktop "por un momento" y luego lo muevo, porque ese
   "luego" siempre se complica.

## Checklist para "antes de empezar un repo nuevo"

```
[ ] Está fuera de ~/Desktop y ~/Documents.
[ ] Está fuera de cualquier ruta con icono ☁️ en Finder.
[ ] Su carpeta padre tiene un .gitignore razonable a mano si vas a
    trabajar con node_modules, dist, etc.
[ ] Si vas a hacer git clone desde una org propia, el remote ya está
    creado en GitHub (no clonar desde un fork accidental).
```

## Coste real de hoy

- Tiempo perdido en el rsync que no avanzaba: ~25 min.
- Tiempo del Plan B (clone + npm install + 2 builds): ~3 min.
- Lección: barata, pero ya no quiero pagarla otra vez.
