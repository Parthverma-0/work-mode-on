'use client'



import Link from 'next/link'

import { usePathname } from 'next/navigation'

import { motion, useReducedMotion } from 'framer-motion'

import {

  Building2,

  Briefcase,

  LayoutDashboard,

  MessageSquare,

  Search,

  Sparkles,

  Users,

} from 'lucide-react'

import { cn } from '@/lib/utils'



const tabs = [

  { href: '/company/dashboard', label: 'Home', icon: LayoutDashboard },

  { href: '/company/swipe', label: 'Discover', icon: Sparkles },

  { href: '/company/jobs', label: 'Jobs', icon: Briefcase },

  { href: '/company/applicants', label: 'Applicants', icon: Users },

  { href: '/company/candidates', label: 'Find', icon: Search },

  { href: '/company/messages', label: 'Chat', icon: MessageSquare },

  { href: '/company/profile', label: 'Company', icon: Building2 },

] as const



export function CompanyBottomNav() {

  const pathname = usePathname()

  const reduceMotion = useReducedMotion()



  return (

    <nav

      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#050505]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl md:hidden"

      aria-label="Mobile company navigation"

    >

      <div className="mx-auto flex max-w-lg items-end justify-around gap-0 px-0.5 pt-1">

        {tabs.map(({ href, label, icon: Icon }) => {

          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (

            <Link

              key={href}

              href={href}

              className={cn(

                'relative flex min-h-[52px] min-w-[40px] flex-1 flex-col items-center justify-end gap-0.5 px-1 pb-2 pt-1 text-[9px] font-semibold leading-tight transition-colors',

                active ? 'text-[#818CF8]' : 'text-white/55 hover:text-white/85',

              )}

            >

              {!reduceMotion && active && (

                <motion.span

                  layoutId="company-mobile-indicator"

                  className="absolute top-1 h-1 w-8 rounded-full bg-gradient-to-r from-[#818CF8] to-[#4F46E5] shadow-[0_0_12px_rgba(99,102,241,0.85)]"

                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}

                />

              )}

              <Icon className="size-[18px] shrink-0" aria-hidden />

              <span className="text-center">{label}</span>

            </Link>

          )

        })}

      </div>

    </nav>

  )

}

