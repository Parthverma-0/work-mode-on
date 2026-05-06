import type { Transition, Variants } from 'framer-motion'

export const easing = [0.25, 0.1, 0.25, 1] as const

export const smoothTransition: Transition = {
  duration: 0.4,
  ease: easing,
}

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: springSnappy },
}
