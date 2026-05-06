/** Shared brand kit content — interactive page + printable one-sheet artboard stay aligned. */

export const BRAND_KIT_LOGOS = [
  {
    id: 'symbol',
    title: 'Symbol mark',
    path: '/logosymbol.png',
    usage: 'Favicon, mobile nav, app icon contexts.',
    preview: 'dark' as const,
    tall: false,
  },
  {
    id: 'letter',
    title: 'Lettermark',
    path: '/symbolletterlogo.png',
    usage: 'Footer, email signatures, narrow headers.',
    preview: 'dark' as const,
    tall: false,
  },
  {
    id: 'horizontal',
    title: 'Horizontal lockup',
    path: '/symbolhorizontallogo.png',
    usage: 'Primary web header, decks, digital letterhead.',
    preview: 'dark' as const,
    tall: false,
  },
  {
    id: 'vertical',
    title: 'Vertical lockup',
    path: '/symbolverticallogo.png',
    usage: 'Hero splash, posters, vertical social.',
    preview: 'dark' as const,
    tall: true,
  },
] as const

export const BRAND_KIT_COLORS = [
  { token: '--bp-midnight', hex: '#121414', note: 'Hero, footer, dark UI' },
  { token: '--bp-midnight-soft', hex: '#1a1c1c', note: 'Dark gradients' },
  { token: '--bp-gold', hex: '#c5a059', note: 'Primary accent' },
  { token: '--bp-gold-dim', hex: '#9a7d46', note: 'Muted gold on light' },
  { token: '--bp-surface', hex: '#fcf8f8', note: 'Light page ground' },
  { token: '--bp-surface-low', hex: '#f6f3f2', note: 'Alternate sections' },
  { token: '--bp-on-surface', hex: '#1c1b1b', note: 'Primary text (light)' },
  { token: '--bp-on-surface-variant', hex: '#434747', note: 'Secondary text' },
  { token: '--bp-hero-ink', hex: '#f4f0ef', note: 'Primary text (dark)' },
] as const

export const BRAND_KIT_CSS_SNIPPET = `/* Marketing scope — see marketing-design.css */
.page--marketing-split {
  --bp-midnight: #121414;
  --bp-midnight-soft: #1a1c1c;
  --bp-gold: #c5a059;
  --bp-gold-dim: #9a7d46;
  --bp-surface: #fcf8f8;
  --bp-on-surface: #1c1b1b;
  --bp-hero-ink: #f4f0ef;
  --font-serif: 'Noto Serif', Georgia, serif;
  --font-sans-marketing: 'Space Grotesk', system-ui, sans-serif;
}`

export const BRAND_KIT_ONESHEET_FILENAME = 'belac-media-brand-kit.png'
