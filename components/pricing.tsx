'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      cta: 'Get Started',
      badge: null,
      features: [
        'Browse unlimited jobs',
        '10 applications/month',
        'Basic AI matching',
        'Email notifications'
      ]
    },
    {
      name: 'Premium',
      price: isYearly ? '$86' : '$9',
      period: isYearly ? 'year' : 'month',
      cta: 'Start Free Trial',
      badge: 'Most Popular',
      featured: true,
      features: [
        'Everything in Free',
        'Unlimited applications',
        'Advanced AI matching',
        'WhatsApp alerts',
        'Priority support',
        'Profile analytics'
      ]
    },
    {
      name: 'Company',
      price: '$299',
      period: 'month',
      cta: 'Contact Sales',
      badge: null,
      features: [
        'Unlimited job postings',
        'Advanced candidate search',
        'Team collaboration',
        'Dedicated account manager',
        'Analytics dashboard'
      ]
    }
  ]

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-secondary mb-8">
            No hidden fees. No surprises.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-black' : 'text-secondary'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-black rounded-full transition-colors"
            >
              <motion.div
                className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full"
                animate={{ x: isYearly ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-black' : 'text-secondary'}`}>
              Yearly
              {isYearly && <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Save 20%</span>}
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`rounded-2xl p-8 transition-all ${
                plan.featured
                  ? 'bg-indigo-600 text-white border-2 border-indigo-600 scale-105'
                  : 'bg-white border border-gray-200 text-black'
              }`}
            >
              {plan.badge && (
                <div className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium ${
                  plan.featured
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {plan.badge}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-5xl font-bold">
                  {plan.price}
                </span>
                <span className={`ml-2 text-sm ${plan.featured ? 'text-white/70' : 'text-secondary'}`}>
                  /{plan.period}
                </span>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-medium mb-8 transition-colors flex items-center justify-center gap-2 ${
                  plan.featured
                    ? 'bg-white text-indigo-600 hover:bg-white/90'
                    : 'bg-black text-white hover:bg-black/90'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${
                      plan.featured ? 'text-white' : 'text-indigo-600'
                    }`} />
                    <span className={`text-sm ${
                      plan.featured ? 'text-white/90' : 'text-secondary'
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
