type BrandLogoProps = {
  /** header = nav bars; hero = marketing; panel = auth cards */
  variant?: 'header' | 'hero' | 'panel'
  className?: string
  /** When false, parent should provide accessible name (e.g. link aria-label). */
  decorative?: boolean
}

export default function BrandLogo({
  variant = 'header',
  className = '',
  decorative = false,
}: BrandLogoProps) {
  const v =
    variant === 'hero'
      ? 'brand-logo brand-logo--hero'
      : variant === 'panel'
        ? 'brand-logo brand-logo--panel'
        : 'brand-logo brand-logo--header'
  return (
    <img
      src="/belacmedia.png"
      alt={decorative ? '' : 'Belac Media'}
      className={`${v} ${className}`.trim()}
      decoding="async"
      {...(decorative ? { role: 'presentation' as const } : {})}
    />
  )
}
