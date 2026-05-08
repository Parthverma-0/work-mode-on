'use client'

import { useState } from 'react'

export function MarqueeSection() {
  const [isPaused, setIsPaused] = useState(false)

  const companies = [
    'Founders',
    'Students',
    'Employees',
    'TPOs',
    'Recruiters',
    'Colleges',
    'Founders',
    'Students',
    'Employees',
    'TPOs',
    'Recruiters',
    'Colleges'
  ]

  // Duplicate for seamless loop
  const displayCompanies = [...companies, ...companies]

  return (
    <section className="w-full bg-white border-t border-b border-gray-100 py-5">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center gap-8">
          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            Trusted by
          </span>
          <div
            className="overflow-hidden flex-1"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex gap-4"
              style={{
                animation: isPaused ? 'none' : 'marquee 30s linear infinite',
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            >
              {displayCompanies.map((company, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-600 whitespace-nowrap flex-shrink-0"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
