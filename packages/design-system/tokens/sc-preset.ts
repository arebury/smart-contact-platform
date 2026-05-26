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
 * `providePrimeNG({ theme: { preset: ScPreset, ... } })`.
 */
export const ScPreset = definePreset(Aura, {
  /*
   * Primitive overrides — color scales + border-radius. Each `green`,
   * `yellow`, `red`, `blue` re-maps Aura's defaults to our `--sc-*`
   * scales so PrimeNG components consume AED palettes directly. We
   * also override `borderRadius` which Aura keeps under `primitive`.
   *
   * Note: the `yellow:` key is PrimeNG's primitive name (kept as Aura
   * vocabulary); its values reference AED's `--sc-color-amber-*` since
   * AED's "warning" tone is amber, not yellow. The naming mismatch is
   * intentional — PrimeNG-internal vs AED-vocabulary stays decoupled.
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
      50: 'var(--sc-color-amber-50)',
      100: 'var(--sc-color-amber-100)',
      200: 'var(--sc-color-amber-200)',
      300: 'var(--sc-color-amber-300)',
      400: 'var(--sc-color-amber-400)',
      500: 'var(--sc-color-amber-500)',
      600: 'var(--sc-color-amber-600)',
      700: 'var(--sc-color-amber-700)',
      800: 'var(--sc-color-amber-800)',
      900: 'var(--sc-color-amber-900)',
      950: 'var(--sc-color-amber-950)',
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
     * Aura emits `--p-blue-*` as the info tone for Message and Toast
     * components — point at AED electric-blue so info banners pick up
     * the brand color.
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
    /*
     * `<p-button severity="info">` references `{sky.*}` (not `{blue.*}`)
     * in PrimeOne's component definitions. Override `primitive.sky` to
     * AED electric-blue so the info-button matches the rest of AED's
     * info treatment (Message, Toast, etc.). No other PrimeNG component
     * consumes `--p-sky-*` in Aura v4, so this is button-info-only.
     */
    sky: {
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
    /*
     * `<p-button severity="warn">` references `{orange.*}` in PrimeOne.
     * AED's warning semantic is amber (`--sc-color-amber-*`, ex-yellow),
     * matching Message and Toast warn treatments. Override
     * `primitive.orange` so the warn-button matches the rest of AED.
     *
     * Note: AED has a separate `--sc-color-orange-*` primitive used by
     * the label palette (`--sc-label-orange-*`). That scale is consumed
     * directly from AED CSS, not through the PrimeNG bridge, so this
     * override doesn't affect label colors.
     */
    orange: {
      50: 'var(--sc-color-amber-50)',
      100: 'var(--sc-color-amber-100)',
      200: 'var(--sc-color-amber-200)',
      300: 'var(--sc-color-amber-300)',
      400: 'var(--sc-color-amber-400)',
      500: 'var(--sc-color-amber-500)',
      600: 'var(--sc-color-amber-600)',
      700: 'var(--sc-color-amber-700)',
      800: 'var(--sc-color-amber-800)',
      900: 'var(--sc-color-amber-900)',
      950: 'var(--sc-color-amber-950)',
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
     * affordance. Electric-blue chosen to match the brand "info"
     * tone — vibrant blue glow visible in Figma input focus state.
     *
     * Drift consciente del JSON PrimeOne (que propone navy primary):
     * a11y exige contraste vibrante vs el border primary enfocado.
     * Documentado en `docs/customs-catalog.md §1.1`. */
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--sc-border-focus)',
      offset: '2px',
    },
    /* Disabled opacity 0.6 — adopción 1:1 del JSON PrimeOne 4.0
     * `semanticCommon.disabledOpacity: 60`. Aura default coincide pero
     * lo declaramos explícito para defensa contra futuros minor updates
     * que pudieran cambiar el default. NO requiere token CSS SCDS — los
     * 24 hits `opacity: 0.4-0.6` cross-app son patterns locales
     * (hover/paused/muted), no disabled canónicos. */
    disabledOpacity: '0.6',
    formField: {
      /* Padding 10.5/7 — valor EXACTO Figma Smart Contact Prime
       * (`inputtext/padding/x = 10.5`, `inputtext/padding/y = 7`),
       * verificado en nodos 23:834 (input default Normal), 6195:7753
       * (select), 109:12493 (datepicker idle). Antes redondeábamos a
       * 12/8 vía tokens, pero la 1:1 audit con Figma exige decimales.
       * Raw px aquí (no token) porque 10.5 y 7 caen off-scale en
       * `--sc-spacing-*`. Aplica a todos los formFields PrimeNG
       * (input, select, datepicker, multiselect, etc). */
      paddingX: '10.5px',
      paddingY: '7px',
      borderRadius: 'var(--sc-radius-200)',
      transitionDuration: 'var(--sc-transition-base)',
      /* Tamaños sm/lg 1:1 del Kit Pro export (claves formFieldSm y formFieldLg).
       * Sin esto, TODOS los form fields size sm/lg (input, select, multiselect,
       * datepicker…) caían a los defaults rem de Aura (font 14px). Mismo origen
       * que el button.root.sm/lg (button deriva de form.field en PrimeNG). */
      sm: {
        fontSize: '12.25px',
        paddingX: '8.75px',
        paddingY: '5.25px',
      },
      lg: {
        fontSize: '15.75px',
        paddingX: '12.25px',
        paddingY: '8.75px',
      },
    },
    /* Dialog / popover / select / navigation overlay shells — radius +
     * shadow. Aura's defaults use `rgba(0,0,0,0.1)` for select +
     * navigation, which leaks pure-black (untinted) shadows into
     * PrimeNG dropdowns and menus. We override all four overlay slots
     * with our shadow tokens so every PrimeNG surface inherits the
     * brand-tinted shadow scale from `--sc-shadow-color-rgb`. */
    overlay: {
      modal: {
        borderRadius: 'var(--sc-radius-400)',
        shadow: 'var(--sc-shadow-dialog)',
      },
      popover: {
        borderRadius: 'var(--sc-radius-200)',
        shadow: 'var(--sc-shadow-popover)',
      },
      select: {
        borderRadius: 'var(--sc-radius-200)',
        shadow: 'var(--sc-shadow-dropdown)',
      },
      navigation: {
        shadow: 'var(--sc-shadow-dropdown)',
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
          invalidPlaceholderColor: 'var(--sc-text-danger)',
          /* Aura's default formField.shadow is `rgba(18, 18, 23, 0.05)`
           * — pure-black. Override with the AED `--sc-shadow-xs` which
           * is tinted via `--sc-shadow-color-rgb`. */
          shadow: 'var(--sc-shadow-xs)',
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
          select: {
            background: 'var(--sc-bg-elevated)',
            borderColor: 'var(--sc-border-default)',
            color: 'var(--sc-text-primary)',
          },
        },
      },
      /*
       * Dark scheme inherits its palette from the same `--sc-*` tokens —
       * dark mode lives at the CSS layer 7 (`07-dark.css`) which
       * re-declares those tokens under the `.sc-dark` selector. So we
       * don't need to duplicate dark values here; the same `var(--sc-bg-
       * surface)` reference resolves to the dark surface when
       * `.sc-dark` is on `<html>`. PrimeNG's own dark-scheme machinery
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
          /* Dark-mode inputs are "embedded" — same bg as the canvas
           * (gray-950) instead of floating one step lighter. Matches
           * Smart Contact Prime dark mode (frame 9795:26786). */
          background: 'var(--sc-bg-default)',
          disabledBackground: 'var(--sc-bg-disabled)',
          color: 'var(--sc-text-primary)',
          disabledColor: 'var(--sc-text-disabled)',
          placeholderColor: 'var(--sc-text-subtle)',
          borderColor: 'var(--sc-border-default)',
          hoverBorderColor: 'var(--sc-border-strong)',
          focusBorderColor: 'var(--sc-bg-primary)',
          invalidBorderColor: 'var(--sc-border-error)',
          invalidPlaceholderColor: 'var(--sc-text-danger)',
          shadow: 'var(--sc-shadow-xs)',
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
  /* ────────────────────────────────────────────────────────────────────
   * Per-component overrides — used for components where Aura defaults
   * diverge from Figma `Smart Contact Prime`. Each block here is the
   * minimal subset of the component's token tree; everything else
   * inherits Aura defaults (which inherit from semantic above).
   *
   * Audit references (Session 30):
   *   tabs    → canvas 6738:49740
   *   tooltip → canvas 6738:50212
   * ────────────────────────────────────────────────────────────────────
   */
  components: {
    /* Button — canvas 6738:49717.
     * Figma tokens (verificados via MCP en node 10:124):
     *   button/padding/x = 10.5, button/padding/y = 7,
     *   button/border/radius = 6, button/gap = 7.
     * Aura default es 1rem/0.5rem (16/8) → diverge. Override explícito
     * para no depender de cascade button→formField (Aura puede romperlo
     * entre versiones). Aplica a todas las severities (primary, secondary,
     * danger, info, warn, help, contrast) y a todos los flags (outlined,
     * text, link). Brand divergences de COLOR ya cubiertas arriba via
     * primitive.sky / orange y semantic.primary. */
    button: {
      root: {
        paddingX: '10.5px',
        paddingY: '7px',
        borderRadius: '6px',
        gap: '7px',
        iconOnlyWidth: '35px',
        /* Tamaños sm/lg van BAJO root (PrimeNG: `button.root.sm`, no `button.sm`).
         * Valores 1:1 del Kit Pro export (componentCommon.button*): sm 12.25 /
         * 8.75 / 5.25 (iconOnly 28); lg 15.75 / 12.25 / 8.75 (iconOnly 42). Sin
         * esto, sm/lg caían a los defaults rem de Aura (font 14px) → el "small"
         * salía como el md. */
        sm: {
          fontSize: '12.25px',
          paddingX: '8.75px',
          paddingY: '5.25px',
          iconOnlyWidth: '28px',
        },
        lg: {
          fontSize: '15.75px',
          paddingX: '12.25px',
          paddingY: '8.75px',
          iconOnlyWidth: '42px',
        },
      },
    },
    tabs: {
      /* Figma tab padding 14/15.75 (raw decimals from `tabs/tab/padding/x,y`,
       * node 3358:29419). Aura default 1rem/1.125rem (16/18) → diverge. */
      tab: {
        padding: '14px 15.75px',
        gap: '7px',
        /* Color tokens inherit: color = text.muted, activeColor = primary.
         * Our SC primary is navy (--sc-bg-primary), Figma shows azure.
         * Documented brand divergence — same as button[severity=primary]. */
      },
      /* Figma tabpanel padding 12.25/15.75/15.75/15.75 (top/right/bottom/left,
       * tokens `tabs/tabpanel/padding/*`, node 6555:1639). */
      tabpanel: {
        padding: '12.25px 15.75px 15.75px 15.75px',
      },
    },
    /* Tooltip — node 327:12831 family.
     * Figma: bg slate-700, color white, padding 10.5/7, radius 6,
     * max-width 175, shadow same as datepicker panel. */
    tooltip: {
      root: {
        background: 'var(--sc-color-gray-700)',
        color: 'var(--sc-color-gray-0)',
        padding: '7px 10.5px',
        borderRadius: 'var(--sc-radius-200)',
        maxWidth: '175px',
      },
    },
  },
});
