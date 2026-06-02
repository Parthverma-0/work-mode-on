'use client'

import { motion } from 'framer-motion'
import { Star, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type SwipeControlsProps = {
  onLeft: () => void
  onRight: () => void
  onSuperLike?: () => void
  showSuperLike?: boolean
  variant?: 'job' | 'company'
  disabled?: boolean
}

export function SwipeControls({
  onLeft,
  onRight,
  onSuperLike,
  showSuperLike = false,
  variant = 'job',
  disabled,
}: SwipeControlsProps) {
  const rightColors =
    variant === 'company'
      ? 'border-[#C7D2FE] text-[#4F46E5] shadow-[#4F46E5]/10 hover:border-[#A5B4FC] hover:bg-[#EEF2FF]'
      : 'border-emerald-200 text-emerald-500 shadow-emerald-500/10 hover:border-emerald-300 hover:bg-emerald-50'
  return (
    <div className="flex items-center justify-center gap-5 sm:gap-6">
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onLeft}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'flex size-14 items-center justify-center rounded-full border-2 border-red-200 bg-white text-red-500 shadow-lg shadow-red-500/10 transition-colors',
          'hover:border-red-300 hover:bg-red-50 disabled:opacity-40',
        )}
        aria-label="Skip"
      >
        <X className="size-7 stroke-[2.5]" aria-hidden />
      </motion.button>

      {showSuperLike && onSuperLike && (
        <motion.button
          type="button"
          disabled={disabled}
          onClick={onSuperLike}
          whileTap={{ scale: 0.92 }}
          className={cn(
            'flex size-12 items-center justify-center rounded-full border-2 border-amber-200 bg-white text-amber-500 shadow-lg shadow-amber-500/10 transition-colors',
            'hover:border-amber-300 hover:bg-amber-50 disabled:opacity-40',
          )}
          aria-label="Save for later"
        >
          <Star className="size-6 fill-amber-400 stroke-amber-500" aria-hidden />
        </motion.button>
      )}

      <motion.button
        type="button"
        disabled={disabled}
        onClick={onRight}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'flex size-14 items-center justify-center rounded-full border-2 bg-white shadow-lg transition-colors disabled:opacity-40',
          rightColors,
        )}
        aria-label="Interested"
      >
        <Check className="size-7 stroke-[2.5]" aria-hidden />
      </motion.button>
    </div>
  )
}
