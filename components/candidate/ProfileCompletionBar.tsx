'use client'

import { TrendingUp } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type ProfileCompletionBarProps = {
  percent: number
  className?: string
}

export function ProfileCompletionBar({ percent, className }: ProfileCompletionBarProps) {
  const safe = Math.min(100, Math.max(0, percent))
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'glass-panel relative overflow-hidden rounded-2xl p-5 ring-1 ring-black/[0.04] sm:p-6',
        className,
      )}
    >
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-[#4F46E5]/12 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4338CA] shadow-sm ring-1 ring-[#4F46E5]/10 sm:flex">
            <TrendingUp className="size-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0f172a]">Profile strength</p>
            <p className="mt-1 text-xs leading-relaxed text-[#64748b] sm:text-[13px]">
              Complete every section to rank higher in search and message threads.
            </p>
          </div>
        </div>
        <motion.span
          className="text-lg font-bold tabular-nums tracking-tight text-[#4F46E5] sm:text-xl"
          key={safe}
          initial={reduceMotion ? false : { scale: 0.92, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        >
          {safe}%
        </motion.span>
      </div>
      <Progress
        value={safe}
        className="relative mt-5 h-2.5 bg-[#e2e8f0]/90 [&>div]:bg-gradient-to-r [&>div]:from-[#4F46E5] [&>div]:to-[#818CF8]"
      />
    </motion.div>
  )
}
