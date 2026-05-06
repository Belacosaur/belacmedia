import { motion, useReducedMotion } from 'framer-motion'

export default function HeroProductVisual() {
  const reduce = useReducedMotion()

  const subtle = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      }

  const floatReveal = reduce
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <div className="bp-hero-visual" aria-hidden>
      <motion.div className="bp-hero-visual__frame" {...subtle}>
        <picture>
          <source type="image/webp" srcSet="/belacmediabelac.webp" />
          <img
            src="/belacmediabelac.png"
            alt=""
            className="bp-hero-visual__photo"
            width={1254}
            height={1254}
            loading="eager"
            decoding="async"
          />
        </picture>
      </motion.div>
      {/* Positioning uses transform on this wrapper — motion must not set transform here or centering breaks */}
      <div className="bp-hero-visual__float">
        <motion.div className="bp-hero-visual__float-inner" {...floatReveal}>
          <p className="bp-hero-visual__float-stat">100%</p>
          <p className="bp-hero-visual__float-copy">
            Delivery you can plan around—dashboards, portals, and production shipped so social is not
            the thing that slips.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
