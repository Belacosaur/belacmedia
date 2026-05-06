type BrandLogoProps = {
  /**
   * header = nav (responsive: symbol → letter → horizontal)
   * hero = large vertical stack (marketing / splash)
   * panel = compact BM mark (auth cards)
   * footer = lettermark (marketing footer)
   */
  variant?: 'header' | 'hero' | 'panel' | 'footer'
  className?: string
  /** When false, parent should provide accessible name (e.g. link aria-label). */
  decorative?: boolean
}

const SRC = {
  horizontal: '/symbolhorizontallogo.png',
  vertical: '/symbolverticallogo.png',
  symbol: '/logosymbol.png',
  letter: '/symbolletterlogo.png',
} as const

function imgClass(variant: NonNullable<BrandLogoProps['variant']>) {
  if (variant === 'hero') return 'brand-logo brand-logo--hero'
  if (variant === 'panel') return 'brand-logo brand-logo--panel'
  if (variant === 'footer') return 'brand-logo brand-logo--footer'
  return 'brand-logo brand-logo--header'
}

export default function BrandLogo({
  variant = 'header',
  className = '',
  decorative = false,
}: BrandLogoProps) {
  const cls = `${imgClass(variant)} ${className}`.trim()
  const common = {
    className: cls,
    decoding: 'async' as const,
    ...(decorative ? { role: 'presentation' as const, alt: '' } : { alt: 'Belac Media' }),
  }

  if (variant === 'header') {
    return (
      <picture>
        <source media="(max-width: 480px)" srcSet={SRC.symbol} />
        <source media="(max-width: 720px)" srcSet={SRC.letter} />
        <img src={SRC.horizontal} {...common} />
      </picture>
    )
  }

  const src =
    variant === 'hero' ? SRC.vertical : variant === 'footer' ? SRC.letter : SRC.symbol

  return <img src={src} {...common} />
}
