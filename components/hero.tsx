'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Briefcase, Sparkles, User } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/wmo-motion'

const floatingCards = [
  {
    id: 'A',
    title: 'Frontend Intern',
    subtitle: 'Startup • Remote',
    tags: ['React', 'Tailwind'],
    icon: Briefcase,
    delay: 0,
  },
  {
    id: 'B',
    title: 'Freelance sprint',
    subtitle: 'Landing page build',
    tags: ['₹5k', '3 days'],
    icon: Briefcase,
    delay: 0.08,
  },
  {
    id: 'C',
    title: 'Rahul Sharma',
    subtitle: 'B.Tech • Open to roles',
    tags: ['UI/UX', 'React'],
    icon: User,
    delay: 0.16,
  },
  {
    id: 'D',
    title: 'Match found',
    subtitle: 'Notion · 98% fit',
    tags: ['98% fit'],
    icon: Sparkles,
    delay: 0.24,
  },
] as const

export function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden pt-14">
      {/* Ambient */}
      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="absolute left-[10%] top-[18%] h-72 w-72 rounded-full bg-[#4F46E5]/14 blur-[100px]"
            animate={{ opacity: [0.5, 0.85, 0.5], x: [0, 24, 0], y: [0, -12, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute bottom-[8%] right-[8%] h-96 w-96 rounded-full bg-indigo-300/25 blur-[110px]"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </>
      )}

      <div className="dot-grid absolute inset-0 opacity-70" aria-hidden />

      <div className="z-10 grid max-w-[1200px] items-center gap-12 px-4 py-16 ">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
        >
          <motion.div variants={fadeUp}>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#4338CA] shadow-sm backdrop-blur-sm">
              Hiring reimagined
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-semibold tracking-tight text-black">
            <span className="block text-[2.65rem] leading-[1.05] sm:text-6xl lg:text-[3.85rem]">
              Your first real entry into the
            </span>
            <span className="mt-2 block bg-gradient-to-r from-[#0f172a] via-[#4F46E5] to-[#6366f1] bg-clip-text text-[2.65rem] leading-[1.05] text-transparent sm:text-6xl lg:text-[3.85rem]">
              business world.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-[#475569] lg:mx-0 lg:max-w-lg"
          >
            Internships, freelance, and graduate roles — matched for skills, pace, and fit. Built for students,
            fresh grads, and teams that hire with intention.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <motion.div whileHover={{ scale: reduceMotion ? 1 : 1.03 }} whileTap={{ scale: reduceMotion ? 1 : 0.98 }}>
              <Link
                href="/auth/signup?role=candidate"
                className="inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#0A0A0A] px-8 text-sm font-semibold text-white shadow-xl shadow-black/15 transition-colors hover:bg-[#141414]"
              >
                Join as candidate
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: reduceMotion ? 1 : 1.03 }} whileTap={{ scale: reduceMotion ? 1 : 0.98 }}>
              <Link
                href="/auth/signup?role=company"
                className="inline-flex h-12 min-h-[44px] items-center justify-center rounded-full border border-black/[0.08] bg-white/90 px-8 text-sm font-semibold text-[#0f172a] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              >
                Hire talent
              </Link>
            </motion.div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-10 text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
            Trusted by campuses & founders · Messaging · Skill-first matching
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
