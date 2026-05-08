"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function FinalCTA() {
  return (
    <section className="dot-grid relative w-full overflow-hidden bg-background py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#eef2ff]/40 via-transparent to-transparent"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-4xl px-6 text-center sm:px-8">
        <motion.h2
          className="mb-6 text-4xl font-semibold tracking-tight text-black md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        >
          Ready to turn your work mode on!
        </motion.h2>

        <motion.div
          className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/auth/signup"
              className="inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#0f172a] px-8 text-sm font-semibold text-white shadow-xl shadow-black/15 transition-colors hover:bg-black"
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/auth/login"
              className="inline-flex h-12 min-h-[44px] items-center justify-center rounded-full border border-black/[0.08] bg-white px-8 text-sm font-semibold text-[#0f172a] shadow-sm transition-colors hover:bg-[#fafafa]"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Security", "Roadmap"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Press"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Community", "Support", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Cookies", "Compliance"],
    },
  ];

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-[#050505] to-black py-16 text-white">
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/50 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        viewport={{ once: true }}
      />
      <div className="relative z-[1] mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-12 grid gap-12 md:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <Link href="/" className="mb-4 flex items-center outline-offset-4">
              <span
                className={`${poppins.className} text-sm font-semibold tracking-tight text-white`}
              >
                work mode on
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50">
              Smart job matching for the next generation.
            </p>
          </motion.div>

          {footerLinks.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
            >
              <h4 className="mb-4 text-sm font-semibold text-white">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-white/45">
            © {new Date().getFullYear()} work mode on. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
