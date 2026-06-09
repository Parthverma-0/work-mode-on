'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Heart, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase()
}

type MatchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  subtitle: string
  leftName: string
  leftAvatar?: string | null
  rightName: string
  rightAvatar?: string | null
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
}

export function MatchModal({
  open,
  onOpenChange,
  title = "It's a Match!",
  subtitle,
  leftName,
  leftAvatar,
  rightName,
  rightAvatar,
  primaryLabel,
  onPrimary,
  secondaryLabel = 'Keep swiping',
}: MatchModalProps) {
  const reduceMotion = useReducedMotion()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border-0 bg-white p-0 sm:max-w-md">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative px-6 pb-7 pt-10 text-center">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#EEF2FF] via-white to-white"
            aria-hidden
          />
          <div className="relative">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="flex items-center justify-center"
            >
              <div className="flex items-center -space-x-4">
                <Avatar className="size-20 border-4 border-white shadow-md">
                  <AvatarImage src={leftAvatar ?? undefined} alt="" />
                  <AvatarFallback className="bg-[#EEF2FF] text-xl font-semibold text-[#4338CA]">
                    {initials(leftName)}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="z-10 flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#6366f1] text-white shadow-lg ring-4 ring-white"
                  initial={reduceMotion ? false : { scale: 0 }}
                  animate={reduceMotion ? undefined : { scale: [0, 1.25, 1] }}
                  transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                >
                  <Heart className="size-5 fill-current" aria-hidden />
                </motion.div>
                <Avatar className="size-20 border-4 border-white shadow-md">
                  <AvatarImage src={rightAvatar ?? undefined} alt="" />
                  <AvatarFallback className="bg-[#EEF2FF] text-xl font-semibold text-[#4338CA]">
                    {initials(rightName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>

            <motion.h2
              initial={reduceMotion ? false : { y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="gradient-text-indigo mt-6 text-3xl font-bold tracking-tight"
            >
              {title}
            </motion.h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#64748b]">{subtitle}</p>

            <div className="mt-7 flex flex-col gap-2.5">
              <Button
                onClick={onPrimary}
                className="h-12 rounded-xl bg-[#4F46E5] text-[15px] font-semibold shadow-lg shadow-[#4F46E5]/25 hover:bg-[#4338CA]"
              >
                <MessageCircle className="mr-2 size-4" aria-hidden />
                {primaryLabel}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-xl text-[#64748b] hover:bg-[#f1f5f9]"
              >
                {secondaryLabel}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
