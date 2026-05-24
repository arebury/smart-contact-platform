import { Injectable, signal, type Type } from '@angular/core';

/**
 * Slot compartido de la barra superior (experiment S59).
 *
 * Permite que una página (lazy) inyecte un componente propio en la TopBar
 * sin que el shell tenga que importarlo — se renderiza con `NgComponentOutlet`,
 * así el componente vive en el bundle lazy de su feature (cero coste de bundle
 * en el shell). Patrón pensado para chrome contextual: hoy el selector de
 * datos demo de Memory; mañana cualquier acción global de una pantalla.
 *
 * Contrato: la página registra en `ngOnInit` y limpia en `ngOnDestroy`.
 */
@Injectable({ providedIn: 'root' })
export class TopBarSlotService {
  /** Componente a renderizar en el slot de la TopBar, o `null` si vacío. */
  readonly component = signal<Type<unknown> | null>(null);

  set(component: Type<unknown>): void {
    this.component.set(component);
  }

  clear(): void {
    this.component.set(null);
  }
}
