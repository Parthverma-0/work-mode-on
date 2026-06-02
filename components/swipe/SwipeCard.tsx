'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { SwipeOverlay } from '@/components/swipe/SwipeOverlay'
import type { OverlayVariant } from '@/lib/swipe-types'
import { cn } from '@/lib/utils'

const SWIPE_THRESHOLD = 100
const EXIT_X = 320

export type SwipeCardHandle = {
  swipeLeft: () => void
  swipeRight: () => void
  superLike: () => void
}

type SwipeCardProps = {
  children: React.ReactNode
  overlayVariant: OverlayVariant
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSuperLike?: () => void
  interactive?: boolean
  className?: string
}

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(function SwipeCard(
  { children, overlayVariant, onSwipeLeft, onSwipeRight, onSuperLike, interactive = true, className },
  ref,
) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])

  function flyOut(direction: 'left' | 'right', callback: () => void) {
    animate(x, direction === 'right' ? EXIT_X : -EXIT_X, {
      duration: 0.22,
      ease: [0.32, 0.72, 0, 1],
      onComplete: callback,
    })
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      flyOut('right', onSwipeRight)
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      flyOut('left', onSwipeLeft)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
    }
  }

  function flyUp(callback: () => void) {
    animate(y, -420, {
      duration: 0.28,
      ease: [0.32, 0.72, 0, 1],
      onComplete: callback,
    })
    animate(x, 0, { duration: 0.28 })
  }

  useImperativeHandle(ref, () => ({
    swipeLeft: () => flyOut('left', onSwipeLeft),
    swipeRight: () => flyOut('right', onSwipeRight),
    superLike: () => flyUp(onSuperLike ?? onSwipeRight),
  }))

  return (
    <motion.div
      style={{ x, y, rotate, zIndex: 20 }}
      drag={interactive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={interactive ? handleDragEnd : undefined}
      whileDrag={interactive ? { cursor: 'grabbing' } : undefined}
      className={cn(
        'relative w-full max-w-sm touch-none select-none',
        interactive && 'cursor-grab active:cursor-grabbing',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]">
        {interactive && (
          <SwipeOverlay
            variant={overlayVariant}
            rightOpacity={rightOpacity}
            leftOpacity={leftOpacity}
          />
        )}
        <div className="relative z-[1]">{children}</div>
      </div>
    </motion.div>
  )
})
