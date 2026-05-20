import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  readonly slug: string;
  readonly name: string;
  readonly num: string;
}

const COMPONENTS: readonly NavLink[] = [
  { slug: 'button', name: 'Button', num: '01' },
  { slug: 'input', name: 'Input', num: '02' },
  { slug: 'input-number', name: 'Input number', num: '03' },
  { slug: 'select', name: 'Select', num: '04' },
  { slug: 'datepicker', name: 'Datepicker', num: '05' },
  { slug: 'tabs', name: 'Tabs', num: '06' },
  { slug: 'tooltip', name: 'Tooltip', num: '07' },
  { slug: 'multiselect', name: 'MultiSelect', num: '08' },
  { slug: 'checkbox', name: 'Checkbox', num: '09' },
  { slug: 'toast', name: 'Toast', num: '10' },
  { slug: 'dialog', name: 'Dialog', num: '11' },
  { slug: 'section-card', name: 'Section card', num: '13' },
  { slug: 'search', name: 'Search', num: '14' },
  { slug: 'toggleswitch', name: 'Toggle switch', num: '15' },
  { slug: 'illustrated-avatar', name: 'Illustrated avatar', num: '16' },
  { slug: 'empty-state', name: 'Empty state', num: '12' },
  { slug: 'label-chip', name: 'Label chip', num: '17' },
  { slug: 'color-dot-picker', name: 'Color dot picker', num: '18' },
  { slug: 'page-header', name: 'Page header', num: '19' },
  { slug: 'form-section-nav', name: 'Form section nav', num: '20' },
  { slug: 'form-danger-zone', name: 'Form danger zone', num: '21' },
  { slug: 'sticky-form-header', name: 'Sticky form header', num: '22' },
  { slug: 'bulk-action-bar', name: 'Bulk action bar', num: '23' },
  { slug: 'bulk-edit-menu', name: 'Bulk edit menu', num: '24' },
  { slug: 'impact-preview-dialog', name: 'Impact preview dialog', num: '25' },
  { slug: 'delete-entity-dialog', name: 'Delete entity dialog', num: '26' },
  { slug: 'column-selector', name: 'Column selector', num: '27' },
  { slug: 'inline-rename-cell', name: 'Inline rename cell', num: '28' },
  { slug: 'photo-upload', name: 'Photo upload', num: '29' },
  { slug: 'group-popover', name: 'Group popover', num: '30' },
  { slug: 'command-palette', name: 'Command palette', num: '31' },
  { slug: 'keyboard-shortcuts', name: 'Keyboard shortcuts', num: '32' },
  { slug: 'confirm-host', name: 'Confirm host', num: '33' },
  { slug: 'inputgroup', name: 'Input group', num: '34' },
];

const SPEC_DOC_NAMES: Record<string, string> = {
  button: '01-button.md',
  input: '02-input.md',
  'input-number': '03-input-number.md',
  select: '04-select.md',
  datepicker: '05-datepicker.md',
  tabs: '06-tabs.md',
  tooltip: '07-tooltip.md',
  multiselect: '08-multiselect.md',
  checkbox: '09-checkbox.md',
  toast: '10-toast.md',
  modal: '11-modal.md',
  'section-card': '13-section-card.md',
  search: '14-search.md',
  toggleswitch: '15-toggleswitch.md',
  'illustrated-avatar': '16-illustrated-avatar.md',
  'empty-state': '12-empty-state.md',
  'label-chip': '17-label-chip.md',
  'color-dot-picker': '18-color-dot-picker.md',
  'page-header': '19-page-header.md',
  'form-section-nav': '20-form-section-nav.md',
  'form-danger-zone': '21-form-danger-zone.md',
  'sticky-form-header': '22-sticky-form-header.md',
  'bulk-action-bar': '23-bulk-action-bar.md',
  'bulk-edit-menu': '24-bulk-edit-menu.md',
  'impact-preview-dialog': '25-impact-preview-dialog.md',
  'delete-entity-dialog': '26-delete-entity-dialog.md',
  'column-selector': '27-column-selector.md',
  'inline-rename-cell': '28-inline-rename-cell.md',
  'photo-upload': '29-photo-upload.md',
  'group-popover': '30-group-popover.md',
  'command-palette': '31-command-palette.md',
  'keyboard-shortcuts': '32-keyboard-shortcuts.md',
  'confirm-host': '33-confirm-host.md',
  inputgroup: '34-inputgroup.md',
};

/**
 * Footer al final de cada gallery: prev / next entre componentes del
 * catálogo + link al spec doc en GitHub. Editorial Stripe Press feel.
 */
@Component({
  selector: 'sc-ds-docs-gallery-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="gfoot">
      <nav class="gfoot__nav" aria-label="Navegación entre componentes">
        @if (prev(); as p) {
          <a [routerLink]="'/components/' + p.slug" class="gfoot__link gfoot__link--prev">
            <span class="gfoot__dir">← Prev</span>
            <span class="gfoot__num">{{ p.num }}</span>
            <span class="gfoot__name">{{ p.name }}</span>
          </a>
        } @else {
          <span class="gfoot__placeholder"></span>
        }
        @if (next(); as n) {
          <a [routerLink]="'/components/' + n.slug" class="gfoot__link gfoot__link--next">
            <span class="gfoot__dir">Next →</span>
            <span class="gfoot__num">{{ n.num }}</span>
            <span class="gfoot__name">{{ n.name }}</span>
          </a>
        } @else {
          <span class="gfoot__placeholder"></span>
        }
      </nav>

      <div class="gfoot__meta">
        @if (specDoc(); as sd) {
          <a
            class="gfoot__edit"
            [href]="
              'https://github.com/arebury/smart-contact-platform/blob/main/packages/design-system/docs/components/' +
              sd
            "
            target="_blank"
            rel="noopener"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.25"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17L17 7M17 7H8M17 7v9" />
            </svg>
            Edit spec doc
            <code class="gfoot__edit-name">{{ sd }}</code>
          </a>
        }
        <span class="gfoot__mark">SCDS · {{ slug() }}</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .gfoot {
        margin-top: 64px;
        padding-top: 32px;
        border-top: 1px solid var(--sc-border-default);
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .gfoot__nav {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .gfoot__placeholder {
        display: block;
      }
      .gfoot__link {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 14px 18px;
        border: 1px solid var(--sc-border-default);
        border-radius: 6px;
        text-decoration: none;
        color: var(--sc-text-primary);
        transition:
          border-color 140ms ease,
          transform 140ms cubic-bezier(0.22, 1, 0.36, 1),
          background 140ms ease;
        &:hover {
          border-color: var(--dsd-accent);
          background: var(--sc-bg-elevated);
          transform: translateY(-1px);
        }
      }
      .gfoot__link--next {
        align-items: flex-end;
        text-align: right;
      }
      .gfoot__dir {
        font-family: var(--dsd-font-mono);
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--sc-text-subtle);
      }
      .gfoot__num {
        font-family: var(--dsd-font-mono);
        font-size: 10px;
        color: var(--dsd-accent);
        font-weight: 500;
      }
      .gfoot__name {
        font-family: var(--dsd-font-display);
        font-size: 16px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .gfoot__meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding-top: 4px;
        font-family: var(--dsd-font-mono);
        font-size: 11px;
        color: var(--sc-text-subtle);
      }
      .gfoot__edit {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--sc-text-secondary);
        text-decoration: none;
        transition: color 120ms ease;
        svg {
          opacity: 0.7;
          transition:
            opacity 120ms ease,
            transform 120ms ease;
        }
        &:hover {
          color: var(--sc-text-primary);
        }
        &:hover svg {
          opacity: 1;
          transform: translate(1px, -1px);
        }
      }
      .gfoot__edit-name {
        font-family: var(--dsd-font-mono);
        font-size: 11px;
        background: var(--sc-bg-elevated);
        border: 1px solid var(--sc-border-default);
        padding: 1px 6px;
        border-radius: 3px;
        color: var(--sc-text-primary);
      }
      .gfoot__mark {
        letter-spacing: 0.1em;
        color: var(--sc-color-gray-400);
      }
      @media (max-width: 720px) {
        .gfoot__nav {
          grid-template-columns: 1fr;
        }
        .gfoot__link--next {
          align-items: flex-start;
          text-align: left;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryFooterComponent {
  readonly slug = input.required<string>();

  protected readonly index = computed(() => COMPONENTS.findIndex((c) => c.slug === this.slug()));
  protected readonly prev = computed(() => {
    const i = this.index();
    return i > 0 ? COMPONENTS[i - 1] : null;
  });
  protected readonly next = computed(() => {
    const i = this.index();
    return i >= 0 && i < COMPONENTS.length - 1 ? COMPONENTS[i + 1] : null;
  });
  protected readonly specDoc = computed(() => SPEC_DOC_NAMES[this.slug()] ?? null);
}
