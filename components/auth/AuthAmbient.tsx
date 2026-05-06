'use client'

import { motion, useReducedMotion } from 'framer-motion'

type AuthAmbientProps = {
  children: React.ReactNode
}

export function AuthAmbient({ children }: AuthAmbientProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0 dot-grid-subtle opacity-60" aria-hidden />

      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="absolute -top-56 -right-44 h-[28rem] w-[28rem] rounded-full bg-[#4F46E5]/22 blur-[100px]"
            animate={{ opacity: [0.35, 0.58, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-48 -left-40 h-[24rem] w-[24rem] rounded-full bg-[#818CF8]/18 blur-[90px]"
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1.05, 1, 1.05] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[80px]"
            animate={{ opacity: [0.2, 0.38, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </>
      )}

      {/* Top edge highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[#4F46E5]/35 to-transparent"
      />

      <div className="relative z-[2]">{children}</div>
    </div>
  )
}
