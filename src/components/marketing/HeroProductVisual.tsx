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
        <svg
          className="bp-hero-visual__mark"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M24 4L6 12v12c0 11.1 7.2 21.5 18 24 10.8-2.5 18-12.9 18-24V12L24 4z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M17 24l5 5 10-12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
