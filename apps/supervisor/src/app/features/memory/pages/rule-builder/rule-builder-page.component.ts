import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ArrowLeft,
  Database,
  ExternalLink,
  LucideAngularModule,
  Mic,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { InputComponent } from '@shared/components/input/input.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';

import {
  AGENT_OPTIONS,
  GROUP_OPTIONS,
  SERVICE_OPTIONS,
} from '../../data/conversation-filter-options';
import type { Direction, Rule, RuleType } from '../../data/rule.types';
import { RulesStore } from '../../state/rules.store';

/**
 * Constructor de reglas Memory · iter 9c-1.
 *
 * Réplica de `Memory/docs/specs/rule-constructor-update.md` para tipo
 * Recording (resto de tipos en iter 9c-2).
 *
 * Bloques verticales apilados:
 *   1. Metadatos (nombre + descripción + active toggle).
 *   2. Alcance (3 dimensiones AND, OR dentro): Servicios + Grupos +
 *      Agentes. Microcopy "Desde repositorio de X" + enlace "Ver
 *      repositorio" + chips con contador para grupos/agentes.
 *   3. Grabación: Dirección + Filtrar por horario.
 *
 * Rutas:
 *   - `/conversaciones/reglas/nueva?type=recording` — nueva regla vacía.
 *   - `/conversaciones/reglas/:id` — edit.
 *
 * Bloque Transcripción + Análisis IA + tipos
 * Classification/Transcription quedan para iter 9c-2.
 */
@Component({
  selector: 'sc-memory-rule-builder-page',
  imports: [
    ButtonModule,
    FormsModule,
    InputComponent,
    LucideAngularModule,
    MultiSelectComponent,
    SelectModule,
    ToggleSwitchModule,
    TranslateModule,
  ],
  templateUrl: './rule-builder-page.component.html',
  styleUrl: './rule-builder-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleBuilderPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rulesStore = inject(RulesStore);
  private readonly messages = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly serviceOptions = SERVICE_OPTIONS;
  protected readonly groupOptions = GROUP_OPTIONS;
  protected readonly agentOptions = AGENT_OPTIONS;

  protected readonly backIcon = ArrowLeft;
  protected readonly externalIcon = ExternalLink;
  protected readonly micIcon = Mic;
  protected readonly databaseIcon = Database;

  protected readonly directionOptions = [
    { value: 'all' as Direction, labelKey: 'memory.rules.builder.direction.all' },
    { value: 'inbound' as Direction, labelKey: 'memory.rules.builder.direction.inbound' },
    { value: 'outbound' as Direction, labelKey: 'memory.rules.builder.direction.outbound' },
  ];

  protected readonly ruleId = signal<number | null>(null);
  protected readonly ruleType = signal<RuleType>('recording');
  protected readonly isEditMode = computed(() => this.ruleId() !== null);

  // Form state
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly active = signal(true);
  protected readonly servicios = signal<readonly string[]>([]);
  protected readonly grupos = signal<readonly string[]>([]);
  protected readonly agentes = signal<readonly string[]>([]);
  protected readonly direction = signal<Direction>('all');
  protected readonly filterBySchedule = signal(false);
  protected readonly scheduleFrom = signal('09:00');
  protected readonly scheduleTo = signal('18:00');

  protected readonly nameInvalid = computed(() => this.name().trim().length < 3);
  protected readonly canSave = computed(() => !this.nameInvalid());

  /**
   * Resumen del alcance en prosa — spec line 94. Recalcula en tiempo real.
   */
  protected readonly scopeSummary = computed(() => {
    const services = this.servicios();
    const groups = this.grupos();
    const agents = this.agentes();
    const parts: string[] = [];
    parts.push(this.formatDimension(services, 'servicio', 'servicios'));
    parts.push(this.formatDimension(groups, 'grupo', 'grupos'));
    parts.push(this.formatDimension(agents, 'agente', 'agentes'));
    return `Esta regla aplica a conversaciones ${parts.join(' Y ')}.`;
  });

  constructor() {
    effect(() => {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        const id = Number(idParam);
        const rule = this.rulesStore.getRule(id);
        if (rule) {
          this.loadFromRule(rule);
          this.ruleId.set(id);
          return;
        }
        // Id no encontrado → volver al listado
        this.router.navigate(['/conversaciones/reglas']);
        return;
      }
      const typeParam = this.route.snapshot.queryParamMap.get('type') as RuleType | null;
      if (typeParam === 'recording' || typeParam === 'transcription' || typeParam === 'classification') {
        this.ruleType.set(typeParam);
      }
    });
  }

  private loadFromRule(rule: Rule): void {
    this.ruleType.set(rule.type);
    this.name.set(rule.name);
    this.description.set(rule.description ?? '');
    this.active.set(rule.active);
    this.servicios.set(rule.servicios);
    this.grupos.set(rule.grupos);
    this.agentes.set(rule.agentes);
    this.direction.set(rule.direction ?? 'all');
    this.filterBySchedule.set(rule.schedule?.enabled ?? false);
    this.scheduleFrom.set(rule.schedule?.from ?? '09:00');
    this.scheduleTo.set(rule.schedule?.to ?? '18:00');
  }

  private formatDimension(values: readonly string[], singular: string, plural: string): string {
    if (values.length === 0) return `de cualquier ${singular}`;
    if (values.length === 1) return `del ${singular} ${values[0]}`;
    return `de ${values.length} ${plural} (${values.slice(0, 2).join(', ')}${values.length > 2 ? '…' : ''})`;
  }

  protected onSave(): void {
    if (!this.canSave()) return;
    const base: Omit<Rule, 'id' | 'lastModified' | 'priority'> = {
      type: this.ruleType(),
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      servicios: this.servicios(),
      grupos: this.grupos(),
      agentes: this.agentes(),
      recording: this.ruleType() === 'recording',
      transcripcion: this.ruleType() === 'transcription',
      clasificacion: this.ruleType() === 'classification',
      active: this.active(),
      direction: this.direction(),
      schedule: {
        enabled: this.filterBySchedule(),
        from: this.scheduleFrom(),
        to: this.scheduleTo(),
      },
    };

    if (this.isEditMode()) {
      this.rulesStore.updateRule(this.ruleId()!, base);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('memory.rules.builder.updated_toast'),
        life: 2200,
      });
    } else {
      this.rulesStore.addRule(base);
      this.messages.add({
        severity: 'success',
        summary: this.translate.instant('memory.rules.builder.created_toast'),
        life: 2200,
      });
    }
    this.router.navigate(['/conversaciones/reglas']);
  }

  protected onCancel(): void {
    this.router.navigate(['/conversaciones/reglas']);
  }

  protected setName(v: string): void {
    this.name.set(v);
  }

  protected setDescription(v: string): void {
    this.description.set(v);
  }

  protected setServicios(v: unknown[] | readonly string[]): void {
    this.servicios.set((v ?? []) as readonly string[]);
  }

  protected setGrupos(v: unknown[] | readonly string[]): void {
    this.grupos.set((v ?? []) as readonly string[]);
  }

  protected setAgentes(v: unknown[] | readonly string[]): void {
    this.agentes.set((v ?? []) as readonly string[]);
  }
}
