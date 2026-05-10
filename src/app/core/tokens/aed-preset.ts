import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

/**
 * AED's PrimeNG preset — wraps Aura, redirecting every `--p-*` runtime
 * variable PrimeNG emits to AED's `--sc-*` source-of-truth tokens.
 *
 * This is the v21-native equivalent of the old `06-primeng-bridge.css`
 * layer. Same effect (PrimeNG components inherit AED brand), but
 * expressed as a JS preset that PrimeNG's theme engine compiles into
 * CSS at boot, instead of a flat-CSS shadow that overrode the
 * compiled output.
 *
 * The values reference our `--sc-*` tokens via `var()` so the
 * declarations under `core/tokens/layers/` stay the only place a
 * value is actually written. PrimeNG's preset compiler emits
 * `--p-primary-500: var(--sc-color-blue-500)` in the final CSS,
 * which the browser resolves at runtime exactly like the old
 * bridge did.
 *
 * Wired up in `src/app/app.config.ts` via
 * `providePrimeNG({ theme: { preset: AedPreset, ... } })`.
 */
export const AedPreset = definePreset(Aura, {
  /*
   * Primitive overrides — color scales + border-radius. Each `green`,
   * `yellow`, `red`, `blue` re-maps Aura's defaults to our `--sc-*`
   * scales so PrimeNG components consume AED palettes directly. We
   * also override `borderRadius` which Aura keeps under `primitive`.
   */
  primitive: {
    borderRadius: {
      xs: 'var(--sc-radius-50)',
      sm: 'var(--sc-radius-100)',
      md: 'var(--sc-radius-200)',
      lg: 'var(--sc-radius-300)',
      xl: 'var(--sc-radius-500)',
    },
    green: {
      50: 'var(--sc-color-green-50)',
      100: 'var(--sc-color-green-100)',
      200: 'var(--sc-color-green-200)',
      300: 'var(--sc-color-green-300)',
      400: 'var(--sc-color-green-400)',
      500: 'var(--sc-color-green-500)',
      600: 'var(--sc-color-green-600)',
      700: 'var(--sc-color-green-700)',
      800: 'var(--sc-color-green-800)',
      900: 'var(--sc-color-green-900)',
      950: 'var(--sc-color-green-950)',
    },
    yellow: {
      50: 'var(--sc-color-yellow-50)',
      100: 'var(--sc-color-yellow-100)',
      200: 'var(--sc-color-yellow-200)',
      300: 'var(--sc-color-yellow-300)',
      400: 'var(--sc-color-yellow-400)',
      500: 'var(--sc-color-yellow-500)',
      600: 'var(--sc-color-yellow-600)',
      700: 'var(--sc-color-yellow-700)',
      800: 'var(--sc-color-yellow-800)',
      900: 'var(--sc-color-yellow-900)',
      950: 'var(--sc-color-yellow-950)',
    },
    red: {
      50: 'var(--sc-color-red-50)',
      100: 'var(--sc-color-red-100)',
      200: 'var(--sc-color-red-200)',
      300: 'var(--sc-color-red-300)',
      400: 'var(--sc-color-red-400)',
      500: 'var(--sc-color-red-500)',
      600: 'var(--sc-color-red-600)',
      700: 'var(--sc-color-red-700)',
      800: 'var(--sc-color-red-800)',
      900: 'var(--sc-color-red-900)',
      950: 'var(--sc-color-red-950)',
    },
    /*
     * Aura emits `--p-blue-*` as its "info" tone. AED's info color is
     * electric-blue, not brand blue — point this scale at electric-blue.
     */
    blue: {
      50: 'var(--sc-color-electric-blue-50)',
      100: 'var(--sc-color-electric-blue-100)',
      200: 'var(--sc-color-electric-blue-200)',
      300: 'var(--sc-color-electric-blue-300)',
      400: 'var(--sc-color-electric-blue-400)',
      500: 'var(--sc-color-electric-blue-500)',
      600: 'var(--sc-color-electric-blue-600)',
      700: 'var(--sc-color-electric-blue-700)',
      800: 'var(--sc-color-electric-blue-800)',
      900: 'var(--sc-color-electric-blue-900)',
      950: 'var(--sc-color-electric-blue-950)',
    },
  },
  semantic: {
    primary: {
      50: 'var(--sc-color-blue-50)',
      100: 'var(--sc-color-blue-100)',
      200: 'var(--sc-color-blue-200)',
      300: 'var(--sc-color-blue-300)',
      400: 'var(--sc-color-blue-400)',
      500: 'var(--sc-color-blue-500)',
      600: 'var(--sc-color-blue-600)',
      700: 'var(--sc-color-blue-700)',
      800: 'var(--sc-color-blue-800)',
      900: 'var(--sc-color-blue-900)',
      950: 'var(--sc-color-blue-950)',
    },
    /* Focus ring — already covered by AED's button + form-field
     * styles, but PrimeNG components use this for their own focus
     * affordance. */
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--sc-color-soft-blue-500)',
      offset: '2px',
    },
    formField: {
      paddingX: 'var(--sc-spacing-300)',
      paddingY: 'var(--sc-spacing-200)',
      borderRadius: 'var(--sc-radius-200)',
      transitionDuration: 'var(--sc-transition-base)',
    },
    /* Dialog / popover overlay shells — radius + shadow. */
    overlay: {
      modal: {
        borderRadius: 'var(--sc-radius-400)',
        shadow: 'var(--sc-shadow-dialog)',
      },
      popover: {
        borderRadius: 'var(--sc-radius-300)',
        shadow: 'var(--sc-shadow-popover)',
      },
    },
    colorScheme: {
      light: {
        surface: {
          0: 'var(--sc-color-gray-0)',
          50: 'var(--sc-color-gray-50)',
          100: 'var(--sc-color-gray-100)',
          200: 'var(--sc-color-gray-200)',
          300: 'var(--sc-color-gray-300)',
          400: 'var(--sc-color-gray-400)',
          500: 'var(--sc-color-gray-500)',
          600: 'var(--sc-color-gray-600)',
          700: 'var(--sc-color-gray-700)',
          800: 'var(--sc-color-gray-800)',
          900: 'var(--sc-color-gray-900)',
          950: 'var(--sc-color-gray-950)',
        },
        primary: {
          color: 'var(--sc-bg-primary)',
          contrastColor: 'var(--sc-text-on-primary)',
          hoverColor: 'var(--sc-bg-primary-hover)',
          activeColor: 'var(--sc-bg-primary-active)',
        },
        mask: {
          /* Same alpha + base as the old bridge's `--p-mask-background`. */
          background: 'rgb(var(--sc-shadow-color-rgb) / 0.4)',
          color: 'var(--sc-text-inverse)',
        },
        formField: {
          background: 'var(--sc-bg-surface)',
          disabledBackground: 'var(--sc-bg-disabled)',
          color: 'var(--sc-text-primary)',
          disabledColor: 'var(--sc-text-disabled)',
          placeholderColor: 'var(--sc-text-subtle)',
          borderColor: 'var(--sc-border-default)',
          hoverBorderColor: 'var(--sc-border-strong)',
          focusBorderColor: 'var(--sc-bg-primary)',
          invalidBorderColor: 'var(--sc-border-error)',
        },
        text: {
          color: 'var(--sc-text-primary)',
          hoverColor: 'var(--sc-text-primary)',
          mutedColor: 'var(--sc-text-secondary)',
          hoverMutedColor: 'var(--sc-text-primary)',
        },
        content: {
          background: 'var(--sc-bg-surface)',
          hoverBackground: 'var(--sc-bg-secondary-hover)',
          borderColor: 'var(--sc-border-default)',
          color: 'var(--sc-text-primary)',
          hoverColor: 'var(--sc-text-primary)',
        },
        overlay: {
          modal: {
            background: 'var(--sc-bg-surface)',
            borderColor: 'var(--sc-border-default)',
            color: 'var(--sc-text-primary)',
          },
          popover: {
            background: 'var(--sc-bg-surface)',
            borderColor: 'var(--sc-border-default)',
            color: 'var(--sc-text-primary)',
          },
        },
      },
      /*
       * Dark scheme inherits its palette from the same `--sc-*` tokens —
       * dark mode lives at the CSS layer 7 (`07-dark.css`) which
       * re-declares those tokens under the `.aed-dark` selector. So we
       * don't need to duplicate dark values here; the same `var(--sc-bg-
       * surface)` reference resolves to the dark surface when
       * `.aed-dark` is on `<html>`. PrimeNG's own dark-scheme machinery
       * is therefore a no-op for us — but we keep the shape so future
       * upstream changes to `colorScheme.dark` don't surprise us.
       */
      dark: {
        surface: {
          0: 'var(--sc-color-gray-0)',
          50: 'var(--sc-color-gray-50)',
          100: 'var(--sc-color-gray-100)',
          200: 'var(--sc-color-gray-200)',
          300: 'var(--sc-color-gray-300)',
          400: 'var(--sc-color-gray-400)',
          500: 'var(--sc-color-gray-500)',
          600: 'var(--sc-color-gray-600)',
          700: 'var(--sc-color-gray-700)',
          800: 'var(--sc-color-gray-800)',
          900: 'var(--sc-color-gray-900)',
          950: 'var(--sc-color-gray-950)',
        },
        primary: {
          color: 'var(--sc-bg-primary)',
          contrastColor: 'var(--sc-text-on-primary)',
          hoverColor: 'var(--sc-bg-primary-hover)',
          activeColor: 'var(--sc-bg-primary-active)',
        },
        formField: {
          background: 'var(--sc-bg-surface)',
          disabledBackground: 'var(--sc-bg-disabled)',
          color: 'var(--sc-text-primary)',
          disabledColor: 'var(--sc-text-disabled)',
          placeholderColor: 'var(--sc-text-subtle)',
          borderColor: 'var(--sc-border-default)',
          hoverBorderColor: 'var(--sc-border-strong)',
          focusBorderColor: 'var(--sc-bg-primary)',
          invalidBorderColor: 'var(--sc-border-error)',
        },
        text: {
          color: 'var(--sc-text-primary)',
          hoverColor: 'var(--sc-text-primary)',
          mutedColor: 'var(--sc-text-secondary)',
          hoverMutedColor: 'var(--sc-text-primary)',
        },
        content: {
          background: 'var(--sc-bg-surface)',
          hoverBackground: 'var(--sc-bg-secondary-hover)',
          borderColor: 'var(--sc-border-default)',
          color: 'var(--sc-text-primary)',
          hoverColor: 'var(--sc-text-primary)',
        },
      },
    },
  },
});
