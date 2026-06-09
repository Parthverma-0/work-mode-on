'use client'

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Msg = { role: 'user' | 'assistant'; content: string }

const GREETING: Msg = {
  role: 'assistant',
  content: "Hi! I'm the WMO Assistant 👋 Ask me anything about applying, swiping, matches, or your profile.",
}

const SUGGESTIONS = ['How does swipe to apply work?', 'What is a match?', 'How do I add my résumé?']

export function ChatWidget() {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send(text: string) {
    const content = text.trim()
    if (!content || loading) return

    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json().catch(() => ({}))
      const reply =
        res.ok && data.reply
          ? data.reply
          : data.error || 'Something went wrong. Please try again in a moment.'
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'I couldn’t reach the server. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            role="dialog"
            aria-label="WMO support assistant"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-36 right-4 z-[60] flex h-[min(72vh,560px)] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28)] md:bottom-24 md:right-6"
          >
            {/* Header */}
            <div className="relative flex items-center gap-3 bg-gradient-to-br from-[#4F46E5] to-[#6366f1] px-4 py-3.5 text-white">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/20">
                <Bot className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">WMO Assistant</p>
                <p className="flex items-center gap-1 text-[11px] text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden /> Usually replies instantly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15"
                aria-label="Close chat"
              >
                <X className="size-4.5" aria-hidden />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#FAFAFB] px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'rounded-br-md bg-[#4F46E5] text-white'
                        : 'rounded-bl-md bg-white text-[#334155] ring-1 ring-black/[0.05]',
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 ring-1 ring-black/[0.05]">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="size-1.5 rounded-full bg-[#94a3b8]"
                        animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="space-y-1.5 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="flex w-full items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2 text-left text-xs font-medium text-[#475569] transition-colors hover:border-[#4F46E5]/30 hover:text-[#4338CA]"
                    >
                      <Sparkles className="size-3.5 shrink-0 text-[#4F46E5]" aria-hidden />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}
            <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-black/[0.06] bg-white p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask anything…"
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-black/[0.1] bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#a5b4fc] focus:ring-[3px] focus:ring-[#4f46e5]/15"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all hover:bg-[#4338CA] active:scale-95 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="size-4.5" aria-hidden />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button — sits above the mobile bottom nav */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-4 z-[60] flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#6366f1] text-white shadow-[0_10px_30px_-6px_rgba(79,70,229,0.6)] transition-shadow hover:shadow-[0_14px_38px_-6px_rgba(79,70,229,0.7)] md:bottom-6 md:right-6"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        aria-expanded={open}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="size-6" aria-hidden />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="size-6" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
