'use client'

import { motion } from 'framer-motion'
import { Network, Smartphone, MessageCircle, MessageSquare } from 'lucide-react'

export function ScrollStack() {
  const cards = [
    {
      badge: 'AI Powered',
      title: 'Your skills, perfectly matched.',
      description: 'Our algorithm reads your profile and surfaces only the roles built for you.',
      icon: Network
    },
    {
      badge: 'Swipe',
      title: 'Job hunting, finally fun.',
      description: 'Swipe right on roles you love. Apply in one tap — your profile does the talking.'
    },
    {
      badge: 'Instant',
      title: 'Recruiters notified the second you apply.',
      description: 'Resume and profile summary lands in the recruiter\'s WhatsApp instantly.',
      icon: MessageCircle
    },
    {
      badge: 'Direct',
      title: 'Skip the middleman entirely.',
      description: 'Chat directly with hiring managers. No recruiters, no delays, no ghosting.',
      icon: MessageSquare
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
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
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            One platform. Jobs, internships, freelance work, and direct hiring.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="bg-white border border-gray-200 rounded-2xl p-8 grid grid-cols-2 gap-12 items-center"
            >
              {/* Left Content */}
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium mb-4">
                  {card.badge}
                </span>
                <h3 className="text-3xl font-bold text-black mb-4">
                  {card.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Right Visual */}
              <div className="rounded-xl h-64 flex items-center justify-center">
                {card.icon && (
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <img src="aiPowered.png" className="w-80 h-70" />
                  </motion.div>
                )}
                {!card.icon && idx === 1 && (
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                    <p className="text-sm text-indigo-600">Phone mockup</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
