'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springSnappy } from '@/lib/wmo-motion'

type StepProgressProps = {
  step: number
  totalSteps?: number
  /** Short labels under each step dot */
  labels?: string[]
}

export function StepProgress({ step, totalSteps = 3, labels }: StepProgressProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
        <span>
          Step {step} of {totalSteps}
        </span>
        <span className="tabular-nums text-[#4F46E5]">{Math.round((step / totalSteps) * 100)}%</span>
      </div>

      <div className="relative flex items-center gap-0">
        <div
          className="absolute left-0 right-0 top-[15px] h-0.5 rounded-full bg-[#e2e8f0]"
          aria-hidden
        />
        <motion.div
          className="absolute left-0 top-[15px] h-0.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#818CF8]"
          aria-hidden
          initial={false}
          animate={{
            width: `${((step - 1) / Math.max(1, totalSteps - 1)) * 100}%`,
          }}
          transition={reduceMotion ? { duration: 0 } : springSnappy}
          style={{ maxWidth: '100%' }}
        />

        {Array.from({ length: totalSteps }, (_, i) => {
          const n = i + 1
          const done = n < step
          const current = n === step
          return (
            <div key={n} className="relative z-[1] flex flex-1 flex-col items-center gap-2">
              <motion.div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  done && 'border-[#4F46E5] bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/25',
                  current &&
                    !done &&
                    'border-[#4F46E5] bg-white text-[#4F46E5] shadow-[0_0_0_4px_rgba(79,70,229,0.12)]',
                  !done && !current && 'border-[#e2e8f0] bg-white text-[#94a3b8]',
                )}
                layout
                transition={springSnappy}
              >
                {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : n}
              </motion.div>
              {labels?.[i] && (
                <span
                  className={cn(
                    'hidden max-w-[5.5rem] text-center text-[10px] font-medium leading-tight sm:block',
                    current ? 'text-[#4338CA]' : 'text-[#94a3b8]',
                  )}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
