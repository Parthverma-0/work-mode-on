'use client'

import { motion, type MotionValue } from 'framer-motion'
import type { OverlayVariant } from '@/lib/swipe-types'
import { cn } from '@/lib/utils'

type SwipeOverlayProps = {
  variant: OverlayVariant
  rightOpacity: MotionValue<number>
  leftOpacity: MotionValue<number>
}

export function SwipeOverlay({ variant, rightOpacity, leftOpacity }: SwipeOverlayProps) {
  const isJob = variant === 'job'
  const rightLabel = isJob ? 'APPLY' : 'SHORTLIST'
  const rightColor = isJob ? 'border-emerald-500 text-emerald-500' : 'border-[#4F46E5] text-[#4F46E5]'
  const rightWash = isJob ? 'from-emerald-500/25' : 'from-[#4F46E5]/25'

  return (
    <>
      {/* Right = positive action */}
      <motion.div
        style={{ opacity: rightOpacity }}
        className={cn(
          'pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-l to-transparent',
          rightWash,
        )}
        aria-hidden
      >
        <span
          className={cn(
            'absolute left-6 top-8 rotate-[-16deg] rounded-xl border-[3px] bg-white/40 px-4 py-1 text-3xl font-extrabold uppercase tracking-wider backdrop-blur-sm',
            rightColor,
          )}
        >
          {rightLabel}
        </span>
      </motion.div>

      {/* Left = pass */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-red-500/25 to-transparent"
        aria-hidden
      >
        <span className="absolute right-6 top-8 rotate-[16deg] rounded-xl border-[3px] border-red-500 bg-white/40 px-4 py-1 text-3xl font-extrabold uppercase tracking-wider text-red-500 backdrop-blur-sm">
          PASS
        </span>
      </motion.div>
    </>
  )
}
