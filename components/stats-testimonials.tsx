'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

export function StatsTestimonials() {
  const [counts, setCounts] = useState({
    jobs: 0,
    candidates: 0,
    companies: 0,
    colleges: 0
  })

  useEffect(() => {
    const targets = {
      jobs: 50000,
      candidates: 250000,
      companies: 5000,
      colleges: 500
    }

    const duration = 2000
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      setCounts({
        jobs: Math.floor(targets.jobs * progress),
        candidates: Math.floor(targets.candidates * progress),
        companies: Math.floor(targets.companies * progress),
        colleges: Math.floor(targets.colleges * progress)
      })

      if (progress === 1) clearInterval(interval)
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: 'Sarah Chen',
      school: 'Stanford',
      role: 'Software Engineer at Google',
      text: 'Found my dream job in 2 weeks. The swipe interface made job hunting actually fun!',
      rating: 5
    },
    {
      name: 'Michael Park',
      school: 'MIT',
      role: 'Product Manager at Meta',
      text: 'Direct messaging cut my application time by 80%. Game changer.',
      rating: 5
    },
    {
      name: 'Emma Wilson',
      school: 'Harvard',
      role: 'UX Designer at Airbnb',
      text: 'Got 3 offers from companies I actually wanted to work for.',
      rating: 5
    }
  ]

  const stats = [
    { label: 'Jobs Listed', value: counts.jobs, suffix: '+' },
    { label: 'Candidates', value: counts.candidates, suffix: '+' },
    { label: 'Companies', value: counts.companies, suffix: '+' },
    { label: 'College Partners', value: counts.colleges, suffix: '+' }
  ]

  return (
    <section className="w-full bg-indigo-600 py-20 text-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by thousands
          </h2>
          <p className="text-lg text-white/70">
            Join the fastest-growing job matching platform
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl md:text-6xl font-bold mb-2">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm text-white/65">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white text-black rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm mb-4 leading-relaxed">
                {testimonial.text}
              </p>
              <div className="border-t border-white/20 pt-4">
                <div className="font-semibold text-sm">
                  {testimonial.name}
                </div>
                <div className="text-xs text-secondary">
                  {testimonial.school}
                </div>
                <div className="text-xs text-secondary">
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
