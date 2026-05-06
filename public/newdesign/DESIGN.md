---
name: Modern Australian Premium
colors:
  surface: '#fcf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fcf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#434747'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5d5f5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1a1c1c'
  on-primary-container: '#838484'
  inverse-primary: '#c6c6c6'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fcf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-xl:
    fontFamily: Noto Serif
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system embodies a "Premium but Grounded" aesthetic, specifically tailored for a high-end Australian agency. It balances the sophisticated exclusivity of a boutique brand with the approachable, tactile warmth of a modern editorial publication. 

The style is **Minimalist-Hybrid**. It utilizes high-contrast color blocks to create a narrative journey: starting with a prestigious, dark-mode "Midnight" entrance and transitioning into a highly functional, "Gallery-White" content experience. The aesthetic avoids cold corporate tropes in favor of a "Modern Café" vibe—human, artisanal, and impeccably organized. Visual interest is generated through precise typography and the interplay of light and shadow rather than decorative ornamentation.

## Colors

The palette is anchored by "Midnight" (#121414) and "Gold" (#C5A059). These two colors define the hero and high-impact areas, establishing immediate authority. 

For the body of the experience, the system shifts to a light-mode foundation. **Midnight** remains the primary color for heavy text and structural elements, while **Gold** is used sparingly for accents, active states, and call-to-actions. Background surfaces utilize a mix of pure white for clarity and a subtle off-white (#F9F9F7) to add a warm, "paper-like" quality to secondary sections. Text in light mode uses a deep charcoal to maintain high legibility without the harshness of pure black.

## Typography

This design system uses a sophisticated serif/sans-serif pairing to communicate the "Modern Café" personality. 

**Noto Serif** is used for all headlines and display text. Its classic proportions provide a sense of heritage and permanence. For the body and technical information, **Space Grotesk** is used. Its geometric, slightly technical character provides a clean, modern contrast to the serif, ensuring the agency feels forward-thinking and precise. 

Apply tight tracking to large serif headlines for an editorial look, while increasing letter spacing for Space Grotesk labels to improve scanability at small sizes.

## Layout & Spacing

The layout follows a **Fixed-Grid** philosophy with generous vertical breathing room to maintain the premium feel. The system utilizes a 12-column grid with a 1280px max-width container. 

Spacing is based on a 4px baseline, but emphasizes large "macro-spacing" (80px+) between sections to allow the content to stand on its own. Alignment should feel architectural; maintain consistent left-margins for body text to create a strong vertical "spine" through the page. Elements should be grouped using logical proximity, favoring open space over containment lines wherever possible.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** rather than heavy shadows. In the dark hero sections, depth is created by placing Midnight containers over slightly lighter Charcoal backgrounds.

In light mode, the system uses **Low-contrast Outlines** and very soft, diffused ambient shadows (0% spread, 15% opacity Midnight) to lift cards off the background. The goal is to make elements feel "placed" on a desk rather than "floating" in a digital space. Use subtle 1px borders in a muted gold or light grey to define boundaries without adding visual clutter.

## Shapes

The shape language is disciplined and professional. A consistent **4px (0.25rem)** corner radius is applied to all interactive elements, including buttons, input fields, and cards. This subtle rounding softens the industrial edges of the grid while maintaining a sharp, high-end architectural feel. 

Large-scale containers or image carousels may occasionally use 0px (sharp) corners to reinforce the editorial "print" aesthetic, especially when they span the full width of the grid.