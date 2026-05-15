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
  { slug: 'multi-select', name: 'MultiSelect', num: '08' },
  { slug: 'checkbox', name: 'Checkbox', num: '09' },
  { slug: 'toast', name: 'Toast', num: '10' },
  { slug: 'modal', name: 'Modal', num: '11' },
];

const SPEC_DOC_NAMES: Record<string, string> = {
  button: '01-button.md',
  input: '02-input.md',
  'input-number': '03-input-number.md',
  select: '04-select.md',
  datepicker: '05-datepicker.md',
  tabs: '06-tabs.md',
  tooltip: '07-tooltip.md',
  'multi-select': '08-multi-select.md',
  checkbox: '09-checkbox.md',
  toast: '10-toast.md',
  modal: '11-modal.md',
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
            [href]="'https://github.com/arebury/smart-contact-platform/blob/main/packages/design-system/docs/components/' + sd"
            target="_blank"
            rel="noopener"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M17 7H8M17 7v9"/>
            </svg>
            Edit spec doc
            <code class="gfoot__edit-name">{{ sd }}</code>
          </a>
        }
        <span class="gfoot__mark">SCDS · {{ slug() }}</span>
      </div>
    </footer>
  `,
  styles: [`
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
    .gfoot__placeholder { display: block; }
    .gfoot__link {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 18px;
      border: 1px solid var(--sc-border-default);
      border-radius: 6px;
      text-decoration: none;
      color: var(--sc-text-primary);
      transition: border-color 140ms ease, transform 140ms cubic-bezier(0.22,1,0.36,1), background 140ms ease;
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
        transition: opacity 120ms ease, transform 120ms ease;
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
      .gfoot__nav { grid-template-columns: 1fr; }
      .gfoot__link--next { align-items: flex-start; text-align: left; }
    }
  `],
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
