"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export function StatsTestimonials() {
  const [counts, setCounts] = useState({
    jobs: 0,
    candidates: 0,
    companies: 0,
    colleges: 0,
  });

  useEffect(() => {
    const targets = {
      jobs: 50000,
      candidates: 250000,
      companies: 5000,
      colleges: 500,
    };

    const duration = 2000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setCounts({
        jobs: Math.floor(targets.jobs * progress),
        candidates: Math.floor(targets.candidates * progress),
        companies: Math.floor(targets.companies * progress),
        colleges: Math.floor(targets.colleges * progress),
      });

      if (progress === 1) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      school: "Stanford",
      role: "Software Engineer at Google",
      text: "Found my dream job in 2 weeks. The swipe interface made job hunting actually fun!",
      rating: 5,
    },
    {
      name: "Michael Park",
      school: "MIT",
      role: "Product Manager at Meta",
      text: "Direct messaging cut my application time by 80%. Game changer.",
      rating: 5,
    },
    {
      name: "Emma Wilson",
      school: "Harvard",
      role: "UX Designer at Airbnb",
      text: "Got 3 offers from companies I actually wanted to work for.",
      rating: 5,
    },
  ];

  const stats = [
    { label: "Jobs Listed",      value: counts.jobs,       suffix: "+" },
    { label: "Candidates",       value: counts.candidates, suffix: "+" },
    { label: "Companies",        value: counts.companies,  suffix: "+" },
    { label: "College Partners", value: counts.colleges,   suffix: "+" },
  ];

  return (
    <section className="w-full bg-indigo-600 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">

        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Trusted by thousands
          </h2>
          <p className="text-lg text-white/70">
            Join the fastest-growing job matching platform
          </p>
        </motion.div>

        {/*
          FIX: replace the fixed-width flex row with a responsive CSS grid.

          Before: flex row with each child at width:280px + flexShrink:0
                  → 4 × 280px = 1120px minimum; overflows and gets clipped on mobile.

          After:  grid-cols-2 on mobile (2 stats per row, each ~50% wide)
                  grid-cols-4 from md up (original single-row layout).

          The number font size also scales down slightly on mobile via clamp
          so "250,000+" never wraps inside its cell.
        */}
        <motion.div
          className="mb-20 grid grid-cols-2 gap-y-10 md:grid-cols-4"
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
              <div
                className="mb-2 font-bold"
                style={{
                  fontSize: "clamp(2rem, 7vw, 3.75rem)",
                  fontVariantNumeric: "tabular-nums",
                  fontFeatureSettings: "'tnum'",
                  lineHeight: 1.1,
                }}
              >
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm text-white/65">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col rounded-2xl bg-white p-6 text-black"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-700">
                {testimonial.text}
              </p>
              <div className="mt-auto border-t border-gray-100 pt-4">
                <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                <div className="mt-0.5 text-xs text-gray-400">{testimonial.school}</div>
                <div className="text-xs text-gray-400">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}