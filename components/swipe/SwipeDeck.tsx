'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Undo2 } from 'lucide-react'
import { SwipeCard, type SwipeCardHandle } from '@/components/swipe/SwipeCard'
import { SwipeControls } from '@/components/swipe/SwipeControls'
import { SwipeEmptyState } from '@/components/swipe/SwipeEmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import type { OverlayVariant } from '@/lib/swipe-types'
import { cn } from '@/lib/utils'

type SwipeDeckProps<T extends { id: string }> = {
  items: T[]
  loading: boolean
  canUndo: boolean
  overlayVariant: OverlayVariant
  showSuperLike?: boolean
  controlsVariant?: 'job' | 'company'
  emptyTitle: string
  emptyCtaLabel: string
  emptyCtaHref: string
  onSwipeLeft: (item: T) => void
  onSwipeRight: (item: T) => void
  onSuperLike?: (item: T) => void
  onUndo: () => void
  renderCard: (item: T) => React.ReactNode
  header?: React.ReactNode
}

export function SwipeDeck<T extends { id: string }>({
  items,
  loading,
  canUndo,
  overlayVariant,
  showSuperLike,
  controlsVariant = 'job',
  emptyTitle,
  emptyCtaLabel,
  emptyCtaHref,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onUndo,
  renderCard,
  header,
}: SwipeDeckProps<T>) {
  const topCardRef = useRef<SwipeCardHandle>(null)
  const [busy, setBusy] = useState(false)

  const visible = items.slice(0, 3)
  const topItem = items[0]

  async function runAction(action: () => void | Promise<void>) {
    if (busy || !topItem) return
    setBusy(true)
    try {
      await action()
    } finally {
      setTimeout(() => setBusy(false), 280)
    }
  }

  function handleSwipeLeft() {
    if (!topItem) return
    runAction(() => onSwipeLeft(topItem))
  }

  function handleSwipeRight() {
    if (!topItem) return
    runAction(() => onSwipeRight(topItem))
  }

  function handleSuperLike() {
    if (!topItem || !onSuperLike) return
    runAction(() => onSuperLike(topItem))
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        <Skeleton className="h-[420px] w-full rounded-2xl bg-gray-100" />
        <div className="flex gap-4">
          <Skeleton className="size-14 rounded-full bg-gray-100" />
          <Skeleton className="size-12 rounded-full bg-gray-100" />
          <Skeleton className="size-14 rounded-full bg-gray-100" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <SwipeEmptyState title={emptyTitle} ctaLabel={emptyCtaLabel} ctaHref={emptyCtaHref} />
    )
  }

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col">
      {canUndo && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onUndo}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#6B7280] shadow-sm backdrop-blur-sm transition-colors hover:border-[#4F46E5]/30 hover:text-[#4F46E5] disabled:opacity-50"
          >
            <Undo2 className="size-3.5" aria-hidden />
            Undo
          </button>
        </div>
      )}

      {header}

      <div className="relative mx-auto h-[min(72vh,640px)] w-full max-w-sm">
        {[...visible].reverse().map((item, reverseIndex) => {
          const index = visible.length - 1 - reverseIndex
          const isTop = index === 0

          if (isTop) {
            return (
              <div key={item.id} className="absolute inset-x-0 top-0">
                <SwipeCard
                  ref={topCardRef}
                  overlayVariant={overlayVariant}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onSuperLike={showSuperLike && onSuperLike ? handleSuperLike : undefined}
                  interactive={!busy}
                >
                  {renderCard(item)}
                </SwipeCard>
              </div>
            )
          }

          return (
            <motion.div
              key={item.id}
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{
                scale: 1 - index * 0.05,
                y: index * 10,
                zIndex: visible.length - index,
              }}
              initial={false}
              animate={{
                scale: 1 - index * 0.05,
                y: index * 10,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div
                className={cn(
                  'w-full max-w-sm overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md',
                  index === 1 && 'opacity-95',
                  index === 2 && 'opacity-90',
                )}
              >
                {renderCard(item)}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 pb-2">
        <SwipeControls
          disabled={busy}
          showSuperLike={showSuperLike}
          variant={controlsVariant}
          onLeft={() => topCardRef.current?.swipeLeft()}
          onRight={() => topCardRef.current?.swipeRight()}
          onSuperLike={showSuperLike ? () => topCardRef.current?.superLike() : undefined}
        />
      </div>
    </div>
  )
}
