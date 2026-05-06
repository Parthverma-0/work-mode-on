'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { StepProgress } from '@/components/onboarding/StepProgress'
import { cn } from '@/lib/utils'
import { smoothTransition } from '@/lib/wmo-motion'

type OnboardingFrameProps = {
  variant: 'candidate' | 'company'
  step: number
  totalSteps?: number
  stepLabels: string[]
  title: string
  description: string
  children: React.ReactNode
}

export function OnboardingFrame({
  variant,
  step,
  totalSteps = 3,
  stepLabels,
  title,
  description,
  children,
}: OnboardingFrameProps) {
  const reduceMotion = useReducedMotion()

  const eyebrow =
    variant === 'candidate' ? 'Your candidate profile' : 'Your company workspace'

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'glass-panel overflow-hidden rounded-3xl border-0 shadow-none ring-1 ring-black/[0.04]',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden border-b border-black/[0.06] px-6 py-8 sm:px-10 sm:py-10',
          variant === 'candidate'
            ? 'bg-gradient-to-br from-[#eef2ff]/90 via-white to-[#faf5ff]/50'
            : 'bg-gradient-to-br from-[#e0e7ff]/85 via-white to-[#ecfdf5]/40',
        )}
      >
        {!reduceMotion && (
          <>
            <motion.div
              aria-hidden
              className={cn(
                'absolute -right-20 -top-20 h-48 w-48 rounded-full blur-[80px]',
                variant === 'candidate' ? 'bg-[#4F46E5]/20' : 'bg-[#10B981]/15',
              )}
              animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="absolute -bottom-24 -left-16 h-40 w-40 rounded-full bg-[#818CF8]/12 blur-[70px]"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`head-${step}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={smoothTransition}
            className="relative z-[1] max-w-xl"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4338CA]">{eyebrow}</p>
            <h2 className="mt-3 text-[1.65rem] font-semibold tracking-tight text-[#0f172a] sm:text-3xl">{title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#64748b]">{description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="relative z-[1] mt-8 max-w-lg">
          <StepProgress step={step} totalSteps={totalSteps} labels={stepLabels} />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`body-${step}`}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ ...smoothTransition, duration: 0.35 }}
          className="px-6 py-8 sm:px-10 sm:py-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
