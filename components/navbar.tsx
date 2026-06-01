"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, X, ArrowRight, Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import { springSnappy } from "@/lib/wmo-motion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function Navbar() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close stale menus on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpanded(null);
      } else {
        setMobileOpen(false);
        setMobileExpanded(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      label: "How it works",
      id: "how-it-works",
      cards: [
        { title: "For Candidates", links: ["Create profile", "AI matching", "Swipe & apply"] },
        { title: "For Companies", links: ["Post jobs", "Review matches", "Hire fast"] },
        { title: "College Partners", links: ["Join as college", "Student lots", "TPO portal"] },
      ],
    },
    {
      label: "Features",
      id: "features",
      cards: [
        { title: "Matching", links: ["AI-powered", "Swipe feed", "Skill tagging"] },
        { title: "Communication", links: ["Direct messaging", "WhatsApp alerts", "Notifications"] },
        { title: "Platform", links: ["Course recs", "Freelance work", "Analytics"] },
      ],
    },
  ];

  return (
    <>
      {/* ── Navbar ──
          Root nav: full width, overflow-x-hidden to prevent any child blowing out the viewport.
          Inner div: flex + justify-between so logo always left, CTAs always right, no gaps that push content wide.
          Desktop links: absolutely centred so they don't participate in the flex flow at all.
      */}
      <nav className="glass-navbar fixed top-0 z-50 h-14 w-full overflow-x-hidden">
        <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-8">

          {/* Logo — always visible */}
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-lg outline-offset-4 transition-opacity hover:opacity-90"
          >
            <span className={`${poppins.className} text-sm font-semibold tracking-tight text-black`}>
              work mode on
            </span>
          </Link>

          {/* Desktop nav links — absolutely centred, hidden on mobile */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
            {menuItems.map((item) => {
              const active = expanded === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  aria-expanded={active}
                  onClick={() => setExpanded(active ? null : item.id)}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-1 rounded-lg px-2 text-sm font-medium outline-offset-2 transition-colors ${
                    active ? "text-[#4338CA]" : "text-black hover:text-[#0f172a]"
                  }`}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                >
                  {item.label}
                  <motion.span animate={{ rotate: active ? 180 : 0 }} transition={springSnappy}>
                    <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                  </motion.span>
                </motion.button>
              );
            })}
            <button
              type="button"
              className="min-h-[44px] rounded-lg px-2 text-sm font-medium text-black transition-colors hover:text-[#0f172a]"
            >
              Pricing
            </button>
          </div>

          {/* Desktop CTA — hidden on mobile */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="inline-flex min-h-[44px] items-center px-3 text-sm font-medium text-black transition-colors hover:text-[#0f172a]"
            >
              Sign in
            </Link>
            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <Link
                href="/auth/signup"
                className="flex min-h-[40px] items-center gap-2 rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20"
              >
                Get started
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </motion.div>
          </div>

          {/* Mobile right side: compact CTA + hamburger — hidden on desktop */}
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <Link
              href="/auth/signup"
              className="flex h-9 items-center rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-4 text-xs font-semibold text-white shadow-md"
            >
              Get started
            </Link>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-black transition-colors hover:bg-black/5"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </nav>

      {/* ── Desktop mega-menu dropdown ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-14 z-40 hidden w-full overflow-hidden border-b border-white/10 bg-[#0a0a0a] dot-grid-dark md:block"
          >
            <div className="mx-auto max-w-7xl px-8 py-12">
              <div className="mb-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
                <span className={`${poppins.className} text-sm font-semibold tracking-tight text-white`}>
                  work mode on
                </span>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 rounded-full bg-[#4F46E5] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/40 transition-colors hover:bg-[#4338CA]"
                  onClick={() => setExpanded(null)}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6">
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
                          : { y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }
                      }
                      className="flex min-h-[200px] flex-col rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-5 shadow-xl shadow-black/30 backdrop-blur-sm"
                    >
                      <h3 className="mb-6 text-base font-semibold text-white">{card.title}</h3>
                      <div className="mt-auto flex flex-col gap-3">
                        {card.links.map((link, linkIdx) => (
                          <a
                            key={linkIdx}
                            href="#"
                            className="group flex cursor-pointer items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
                          >
                            <span className="text-white/30 transition-colors group-hover:text-[#818CF8]" aria-hidden>
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

      {/* ── Mobile slide-in drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />

            {/* Drawer panel — 80% wide, max 320px, slides from right */}
            <motion.div
              key="drawer"
              initial={reduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-full w-4/5 max-w-xs flex-col bg-[#0a0a0a] shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-5">
                <span className={`${poppins.className} text-sm font-semibold tracking-tight text-white`}>
                  work mode on
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer body — scrollable */}
              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="flex flex-col gap-1">
                  {menuItems.map((item) => {
                    const open = mobileExpanded === item.id;
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setMobileExpanded(open ? null : item.id)}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          {item.label}
                          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springSnappy}>
                            <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                          </motion.span>
                        </button>

                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-3 px-2 pb-3 pt-2">
                                {item.cards.map((card) => (
                                  <div
                                    key={card.title}
                                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4"
                                  >
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                                      {card.title}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                      {card.links.map((link, i) => (
                                        <a
                                          key={i}
                                          href="#"
                                          className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                                          onClick={() => setMobileOpen(false)}
                                        >
                                          <span
                                            className="text-white/25 transition-colors group-hover:text-[#818CF8]"
                                            aria-hidden
                                          >
                                            ↗
                                          </span>
                                          {link}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Pricing
                  </button>
                </div>

                <div className="my-5 border-t border-white/[0.08]" />

                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[48px] items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#4F46E5] text-sm font-semibold text-white shadow-lg shadow-black/40 transition-colors hover:bg-[#4338CA]"
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}