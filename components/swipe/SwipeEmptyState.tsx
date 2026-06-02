'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SwipeEmptyStateProps = {
  title: string
  description?: string
  ctaLabel: string
  ctaHref: string
}

export function SwipeEmptyState({ title, description, ctaLabel, ctaHref }: SwipeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-6 flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] shadow-inner">
        <Sparkles className="size-10 text-[#4F46E5]" aria-hidden />
        <span className="absolute -right-1 -top-1 text-2xl" aria-hidden>
          ✨
        </span>
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-[#0A0A0A]">{title}</h2>
      {description && <p className="mt-2 max-w-xs text-sm text-[#6B7280]">{description}</p>}
      <Button asChild className="mt-6 rounded-full bg-[#4F46E5] px-6 hover:bg-[#4338CA]">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  )
}
