'use client'



import { motion, useReducedMotion } from 'framer-motion'

import { CompanyBottomNav } from '@/components/company/BottomNav'

import { CompanyBrandMark, CompanySidebar } from '@/components/company/Sidebar'

import { PageEnter } from '@/components/motion/PageEnter'



export function CompanyPortalShell({ children }: { children: React.ReactNode }) {

  const reduceMotion = useReducedMotion()



  return (

    <div className="mesh-app-bg relative min-h-screen text-[#0A0A0A]">

      <header className="sticky top-0 z-40 flex h-14 items-center overflow-hidden border-b border-white/[0.08] bg-[#0A0A0A] px-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] md:px-6">

        {!reduceMotion && (

          <motion.div

            aria-hidden

            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4F46E5]/55 to-transparent"

            initial={{ scaleX: 0, opacity: 0 }}

            animate={{ scaleX: 1, opacity: 1 }}

            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}

          />

        )}

        <CompanyBrandMark />

      </header>

      <CompanySidebar />

      <main className="relative min-h-[calc(100vh-3.5rem)] pb-24 pt-6 md:ml-[260px] md:pb-10 md:pt-8">

        <div className="mx-auto max-w-6xl px-4 md:px-8">

          <PageEnter>{children}</PageEnter>

        </div>

      </main>

      <CompanyBottomNav />

    </div>

  )

}

