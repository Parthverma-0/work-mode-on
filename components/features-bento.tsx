'use client'

import { motion } from 'framer-motion'
import { Network, Smartphone, Bell, Shield } from 'lucide-react'

export function FeaturesBento() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <section className="mesh-app-bg relative w-full overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Powerful features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to find the perfect match, faster than ever.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="auto-rows-max grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Large Card - AI Matching (col-span 2) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.35)' }}
            className="col-span-full rounded-3xl border border-black/[0.06] bg-white/90 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.15)] backdrop-blur-sm transition-all md:col-span-2 md:p-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-black">AI-powered matching</h3>
              </div>
              <Network className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
            </div>
            <div className="h-40 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <div className="text-center">
                <p className="text-sm text-indigo-600">Animated dot network</p>
              </div>
            </div>
          </motion.div>

          {/* Medium Card - Swipe to Apply (col-span 1) */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.35)' }}
            className="col-span-full flex min-h-[320px] flex-col rounded-3xl border border-black/[0.06] bg-white/90 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.15)] backdrop-blur-sm transition-all md:col-span-1 md:row-span-2 md:min-h-0 md:p-8"
          >
            <h3 className="text-xl font-bold text-black mb-4">Swipe to apply</h3>
            <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl flex items-center justify-center border border-indigo-100 mb-4">
              <Smartphone className="w-12 h-12 text-indigo-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-600">Phone mockup interface</p>
          </motion.div>

          {/* Small Cards Row 2 */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.35)' }}
            className="col-span-full rounded-3xl border border-black/[0.06] bg-white/90 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all md:col-span-1 md:p-8"
          >
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-lg font-bold text-black">WhatsApp alerts</h3>
              <Bell className="w-6 h-6 text-indigo-400" strokeWidth={2} />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full"></div>
                  <div className="h-3 bg-indigo-100 rounded-full w-20"></div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.35)' }}
            className="col-span-full rounded-3xl border border-black/[0.06] bg-white/90 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all md:col-span-1 md:p-8"
          >
            <h3 className="mb-6 text-lg font-bold text-black">College verified</h3>
            <div className="flex flex-wrap gap-2">
              {['MIT', 'Stanford', 'Harvard', 'IIT Bombay'].map((college) => (
                <span
                  key={college}
                  className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium"
                >
                  {college}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.35)' }}
            className="col-span-full rounded-3xl border border-black/[0.06] bg-white/90 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all md:col-span-1 md:p-8"
          >
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-lg font-bold text-black">Instant work</h3>
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
              <div className="h-4 bg-indigo-100 rounded w-1/2"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
