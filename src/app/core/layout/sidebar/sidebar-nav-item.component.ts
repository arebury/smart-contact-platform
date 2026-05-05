import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

import { NAV_ICONS } from '../../icons/nav-icons';
import type { NavItem } from './nav-data';

/**
 * One row of the sidebar tree. Renders itself, then recursively renders any
 * children when expanded. Indentation, font size and active highlight all key
 * off the `depth` prop so a single component supports the prototype's 4+ level
 * nesting (DD#302).
 */
@Component({
  selector: 'aed-sidebar-nav-item',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './sidebar-nav-item.component.html',
  styleUrl: './sidebar-nav-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavItemComponent {
  @Input({ required: true }) item!: NavItem;
  @Input() depth = 0;
  @Input({ required: true }) currentPath!: string;

  @Output() readonly navigate = new EventEmitter<string>();

  protected readonly expanded = signal(false);

  ngOnInit(): void {
    if (this.item.defaultExpanded) {
      this.expanded.set(true);
    }
  }

  protected readonly hasChildren = computed(
    () => !!this.item.children && this.item.children.length > 0,
  );

  protected readonly isActive = computed(
    () => !!this.item.path && this.item.path === this.currentPath,
  );

  protected readonly isChildActive = computed(() => {
    if (!this.item.children) return false;
    return this.containsActive(this.item.children, this.currentPath);
  });

  protected resolveIcon(name: keyof typeof NAV_ICONS) {
    return NAV_ICONS[name];
  }

  protected onClick(): void {
    if (this.hasChildren()) {
      this.expanded.update((v) => !v);
      return;
    }
    if (this.item.path) {
      this.navigate.emit(this.item.path);
    }
  }

  private containsActive(items: readonly NavItem[], current: string): boolean {
    return items.some((child) => {
      if (child.path === current) return true;
      if (child.children) return this.containsActive(child.children, current);
      return false;
    });
  }
}
