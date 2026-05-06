'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type StatCardProps = {
  title: string
  value: string | number
  loading?: boolean
  className?: string
}

export function StatCard({ title, value, loading, className }: StatCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="h-full"
    >
      <Card
        className={cn(
          'group h-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white/90 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_16px_48px_-16px_rgba(79,70,229,0.18)] hover:ring-1 hover:ring-[#4F46E5]/12',
          className,
        )}
      >
        <CardContent className="relative p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4F46E5]/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">{title}</p>
          {loading ? (
            <Skeleton className="mt-3 h-9 w-20 rounded-lg bg-slate-100" />
          ) : (
            <p className="relative mt-2 text-3xl font-semibold tabular-nums tracking-tight text-[#0f172a]">
              {value}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
