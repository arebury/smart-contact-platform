import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  Box,
  ChevronRight,
  Clock,
  FileStack,
  LucideAngularModule,
  MessageSquare,
  Phone,
  Sparkles,
  Tag,
  Tags,
  Variable,
} from 'lucide-angular';
import type { LucideIconData } from '../components/repo-types';

interface HubItem {
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly icon: LucideIconData;
  readonly path: string;
  readonly ready: boolean;
}

interface HubCategory {
  readonly titleKey: string;
  readonly items: readonly HubItem[];
}

/**
 * Repositories hub — grid of cards grouped by category, mirrors the React
 * prototype's RepositoriosHubPage. Cards marked `ready: false` render in
 * disabled "próximamente" state; today every card is ready.
 */
@Component({
  selector: 'aed-repositorios-hub-page',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './repositorios-hub-page.component.html',
  styleUrl: './repositorios-hub-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositoriosHubPageComponent {
  private readonly router = inject(Router);

  protected readonly chevronIcon = ChevronRight;

  protected readonly categories: readonly HubCategory[] = [
    {
      titleKey: 'repositories.hub.categories.communication',
      items: [
        {
          labelKey: 'repositories.agendas.title',
          descriptionKey: 'repositories.hub.descriptions.agendas',
          icon: Phone,
          path: '/admin/agendas',
          ready: true,
        },
        {
          labelKey: 'repositories.horarios.title',
          descriptionKey: 'repositories.hub.descriptions.horarios',
          icon: Clock,
          path: '/admin/horarios',
          ready: true,
        },
        {
          labelKey: 'templates.page_title',
          descriptionKey: 'repositories.hub.descriptions.plantillas',
          icon: FileStack,
          path: '/admin/plantillas',
          ready: true,
        },
        {
          labelKey: 'repositories.tipificaciones.title',
          descriptionKey: 'repositories.hub.descriptions.tipificaciones',
          icon: Tags,
          path: '/admin/tipificaciones',
          ready: true,
        },
      ],
    },
    {
      titleKey: 'repositories.hub.categories.classification',
      items: [
        {
          labelKey: 'labels.page_title',
          descriptionKey: 'repositories.hub.descriptions.labels',
          icon: Tag,
          path: '/admin/labels',
          ready: true,
        },
        {
          labelKey: 'repositories.variables.title',
          descriptionKey: 'repositories.hub.descriptions.variables',
          icon: Variable,
          path: '/admin/variables',
          ready: true,
        },
      ],
    },
    {
      titleKey: 'repositories.hub.categories.conversational_designer',
      items: [
        {
          labelKey: 'repositories.entidades.title',
          descriptionKey: 'repositories.hub.descriptions.entidades',
          icon: Box,
          path: '/admin/entidades',
          ready: true,
        },
        {
          labelKey: 'repositories.intenciones.title',
          descriptionKey: 'repositories.hub.descriptions.intenciones',
          icon: MessageSquare,
          path: '/admin/intenciones',
          ready: true,
        },
      ],
    },
    {
      titleKey: 'repositories.hub.categories.ai',
      items: [
        {
          labelKey: 'repositories.reglas_ia.title',
          descriptionKey: 'repositories.hub.descriptions.reglas_ia',
          icon: Sparkles,
          path: '/admin/reglas-ia',
          ready: true,
        },
        {
          labelKey: 'repositories.entidades_ia.title',
          descriptionKey: 'repositories.hub.descriptions.entidades_ia',
          icon: Box,
          path: '/admin/entidades-ia',
          ready: true,
        },
        {
          labelKey: 'repositories.clasificacion_ia.title',
          descriptionKey: 'repositories.hub.descriptions.clasificacion_ia',
          icon: Tags,
          path: '/admin/clasificacion-ia',
          ready: true,
        },
      ],
    },
  ];

  protected onItemClick(item: HubItem): void {
    if (!item.ready) return;
    void this.router.navigateByUrl(item.path);
  }
}
