'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Briefcase, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springSnappy } from '@/lib/wmo-motion'

type Role = 'candidate' | 'company'

type RoleSelectorProps = {
  value: Role | null
  onChange: (role: Role) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const reduceMotion = useReducedMotion()

  const items: { role: Role; title: string; desc: string; icon: typeof Briefcase }[] = [
    {
      role: 'candidate',
      title: "I'm looking for opportunities",
      desc: 'Student, grad, or professional',
      icon: Briefcase,
    },
    {
      role: 'company',
      title: "I'm hiring",
      desc: 'Post roles & message talent',
      icon: Building2,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(({ role, title, desc, icon: Icon }) => {
        const selected = value === role
        return (
          <motion.button
            key={role}
            type="button"
            layout
            onClick={() => onChange(role)}
            transition={springSnappy}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            className={cn(
              'relative flex min-h-[96px] rounded-2xl border p-4 text-left transition-colors',
              selected
                ? 'border-[#4F46E5] bg-gradient-to-br from-[#eef2ff] to-white shadow-[0_12px_36px_-14px_rgba(79,70,229,0.45)] ring-1 ring-[#4F46E5]/20'
                : 'border-[#e2e8f0] bg-white/60 hover:border-[#c7d2fe] hover:bg-white',
            )}
          >
            {selected && (
              <motion.span
                layoutId="role-glow"
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4F46E5]/5 to-transparent"
                transition={springSnappy}
              />
            )}
            <span
              className={cn(
                'mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                selected ? 'bg-white text-[#4F46E5] shadow-sm' : 'bg-[#f8fafc] text-[#64748b]',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="relative z-[1] min-w-0">
              <span className="block font-semibold text-[#0f172a]">{title}</span>
              <span className="mt-0.5 block text-sm text-[#64748b]">{desc}</span>
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
