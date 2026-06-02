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

  return (
    <>
      <motion.div
        style={{ opacity: rightOpacity }}
        className={cn(
          'pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl',
          isJob ? 'bg-emerald-500/20' : 'bg-[#4F46E5]/20',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'rotate-[-20deg] text-6xl font-bold',
            isJob ? 'text-emerald-500' : 'text-[#4F46E5]',
          )}
        >
          ✓
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: leftOpacity }}
        className={cn(
          'pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl',
          isJob ? 'bg-red-500/20' : 'bg-gray-500/20',
        )}
        aria-hidden
      >
        <span
          className={cn(
            'rotate-[20deg] text-6xl font-bold',
            isJob ? 'text-red-500' : 'text-gray-500',
          )}
        >
          ✕
        </span>
      </motion.div>
    </>
  )
}
