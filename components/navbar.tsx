"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, X, ArrowRight } from "lucide-react";
import { Poppins } from "next/font/google";
import { springSnappy } from "@/lib/wmo-motion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function Navbar() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const menuItems = [
    {
      label: "How it works",
      id: "how-it-works",
      cards: [
        {
          title: "For Candidates",
          links: ["Create profile", "AI matching", "Swipe & apply"],
        },
        {
          title: "For Companies",
          links: ["Post jobs", "Review matches", "Hire fast"],
        },
        {
          title: "College Partners",
          links: ["Join as college", "Student lots", "TPO portal"],
        },
      ],
    },
    {
      label: "Features",
      id: "features",
      cards: [
        {
          title: "Matching",
          links: ["AI-powered", "Swipe feed", "Skill tagging"],
        },
        {
          title: "Communication",
          links: ["Direct messaging", "WhatsApp alerts", "Notifications"],
        },
        {
          title: "Platform",
          links: ["Course recs", "Freelance work", "Analytics"],
        },
      ],
    },
  ];

  return (
    <>
      <nav className="glass-navbar fixed top-0 z-50 flex h-14 w-full items-center gap-4 px-4 sm:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg outline-offset-4 transition-opacity hover:opacity-90"
        >
          <span
            className={`${poppins.className} text-sm font-semibold tracking-tight text-black`}
          >
            work mode on
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-4 md:gap-8">
          {menuItems.map((item) => {
            const active = expanded === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                aria-expanded={active}
                onClick={() => setExpanded(active ? null : item.id)}
                className={`flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 text-sm font-medium outline-offset-2 transition-colors ${
                  active ? "text-[#4338CA]" : "text-black hover:text-[#0f172a]"
                }`}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              >
                {item.label}
                <motion.span
                  animate={{ rotate: active ? 180 : 0 }}
                  transition={springSnappy}
                >
                  <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                </motion.span>
              </motion.button>
            );
          })}
          <button
            type="button"
            className="hidden min-h-[44px] shrink-0 rounded-lg px-2 text-sm font-medium text-black transition-colors hover:text-[#0f172a] md:inline"
          >
            Pricing
          </button>
        </div>

        <div className="relative z-20 flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/auth/login"
            className="min-h-[44px] px-3 text-sm font-medium text-black outline-offset-4 transition-colors hover:text-[#0f172a] sm:inline-flex sm:items-center"
          >
            Sign in
          </Link>
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <Link
              href="/auth/signup"
              className="flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 sm:px-6"
            >
              Get started
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </nav>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-14 z-40 w-full overflow-hidden border-b border-white/10 bg-[#0a0a0a] dot-grid-dark"
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-12">
              <div className="mb-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="flex items-center">
                  <span
                    className={`${poppins.className} text-sm font-semibold tracking-tight text-white`}
                  >
                    work mode on
                  </span>
                </div>
                <motion.div
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <Link
                    href="/auth/signup"
                    className="flex items-center gap-2 rounded-full bg-[#4F46E5] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/40 transition-colors hover:bg-[#4338CA]"
                    onClick={() => setExpanded(null)}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                {menuItems
                  .find((m) => m.id === expanded)
                  ?.cards.map((card, idx) => (
                    <motion.div
                      key={card.title}
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 + 0.04, duration: 0.35 }}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              y: -3,
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              },
                            }
                      }
                      className="flex min-h-[200px] flex-col rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 shadow-xl shadow-black/30 backdrop-blur-sm"
                    >
                      <h3 className="mb-6 text-base font-semibold text-white">
                        {card.title}
                      </h3>
                      <div className="mt-auto flex flex-col gap-3">
                        {card.links.map((link, linkIdx) => (
                          <a
                            key={linkIdx}
                            href="#"
                            className="group flex cursor-pointer items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
                          >
                            <span
                              className="text-white/30 transition-colors group-hover:text-[#818CF8]"
                              aria-hidden
                            >
                              ↗
                            </span>
                            {link}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
