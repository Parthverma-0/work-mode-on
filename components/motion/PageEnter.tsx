'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { smoothTransition } from '@/lib/wmo-motion'

export function PageEnter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothTransition}
    >
      {children}
    </motion.div>
  )
}
