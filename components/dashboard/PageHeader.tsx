'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  eyebrow?: string
  eyebrowIcon?: React.ReactNode
  title: React.ReactNode
  description?: string
  action?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  action,
  align = 'left',
  className,
}: PageHeaderProps) {
  const reduce = useReducedMotion()
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-4',
        align === 'center' && 'flex-col items-center text-center',
        className,
      )}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(align === 'center' && 'flex flex-col items-center')}
      >
        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4338CA] shadow-sm backdrop-blur-sm">
            {eyebrowIcon}
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a] sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#64748b] sm:text-[15px]">
            {description}
          </p>
        )}
      </motion.div>
      {action}
    </div>
  )
}
