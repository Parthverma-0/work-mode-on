'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Search,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { cn } from '@/lib/utils'

const links = [
  { href: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidate/swipe', label: 'Discover ✨', icon: Sparkles },
  { href: '/candidate/jobs', label: 'Browse Jobs', icon: Search },
  { href: '/candidate/applications', label: 'My Applications', icon: ClipboardList },
  { href: '/candidate/messages', label: 'Messages', icon: MessageSquare },
  { href: '/candidate/profile', label: 'My Profile', icon: User },
  { href: '/candidate/courses', label: 'Courses', icon: BookOpen },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-[260px] flex-col border-r border-black/[0.06] bg-white/72 backdrop-blur-xl md:flex">
      <nav className="flex flex-1 flex-col gap-1 p-4 pt-6" aria-label="Candidate navigation">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex min-h-[44px] items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'text-[#4F46E5]' : 'text-[#6B7280] hover:bg-black/[0.03] hover:text-[#0A0A0A]',
              )}
            >
              {!reduceMotion && active && (
                <motion.span
                  layoutId="candidate-nav-shell"
                  className="absolute inset-0 z-0 rounded-xl bg-white shadow-[0_1px_12px_-4px_rgba(79,70,229,0.35)] ring-1 ring-[#4F46E5]/18"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="relative z-[1] size-[18px] shrink-0 opacity-90" aria-hidden />
              <span className="relative z-[1]">{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-black/[0.06] bg-white/40 p-4 backdrop-blur-sm">
        <SignOutButton layout="nav-row" />
      </div>
    </aside>
  )
}

export function CandidateBrandMark() {
  const reduceMotion = useReducedMotion()
  return (
    <Link href="/candidate/dashboard" className="group flex items-center gap-2 text-white outline-offset-4">
      <motion.span
        className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4F46E5] shadow-lg shadow-black/35"
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <Zap className="size-4 text-white" aria-hidden />
      </motion.span>
      <span className="text-sm font-semibold tracking-tight">Work Mode On</span>
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 ring-1 ring-white/15">
        Candidate
      </span>
    </Link>
  )
}
