'use client'

import { motion, useReducedMotion } from 'framer-motion'

type DashboardSectionProps = {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function DashboardSection({ title, description, action, children }: DashboardSectionProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-48px' }}
          transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-lg font-semibold tracking-tight text-[#0f172a] sm:text-xl">{title}</h2>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#64748b]">{description}</p> : null}
        </motion.div>
        {action}
      </div>
      {children}
    </section>
  )
}
