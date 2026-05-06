'use client'

import { format } from 'date-fns'
import { ArrowLeft, Send } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { ConversationSummary, MessageRow } from '@/lib/company-types'
import { cn } from '@/lib/utils'

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  if (!p[0]) return '?'
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

type ChatWindowProps = {
  currentUserId: string | undefined
  partnerMeta: ConversationSummary | undefined
  messagesForPartner: MessageRow[]
  loading?: boolean
  showMobileBack?: boolean
  onBack?: () => void
  onSend: (text: string) => Promise<void>
}

export function ChatWindow({
  currentUserId,
  partnerMeta,
  messagesForPartner,
  loading,
  showMobileBack,
  onBack,
  onSend,
}: ChatWindowProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const sorted = useMemo(
    () =>
      [...messagesForPartner].sort(
        (a, b) => new Date(a.sent_at ?? 0).getTime() - new Date(b.sent_at ?? 0).getTime(),
      ),
    [messagesForPartner],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sorted.length, partnerMeta?.partnerUserId])

  async function submit() {
    const t = draft.trim()
    if (!t || sending) return
    setSending(true)
    await onSend(t)
    setDraft('')
    setSending(false)
  }

  if (!partnerMeta) {
    return (
      <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center border border-dashed border-gray-200 bg-[#FAFAFA] md:min-h-0 md:rounded-xl">
        <p className="px-6 text-center text-sm text-[#6B7280]">Select a conversation to read messages.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-1 flex-col border border-gray-100 bg-white md:rounded-xl md:shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
          <Skeleton className="size-10 rounded-xl bg-gray-100" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded bg-gray-100" />
            <Skeleton className="h-3 w-48 rounded bg-gray-100" />
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-hidden p-4">
          <Skeleton className="ml-auto h-10 w-3/5 rounded-2xl bg-[#EEF2FF]" />
          <Skeleton className="h-10 w-3/5 rounded-2xl bg-gray-100" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[320px] flex-1 flex-col border border-gray-100 bg-white md:max-h-[calc(100vh-12rem)] md:rounded-xl md:shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-3 md:px-4">
        {showMobileBack ? (
          <Button type="button" variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={onBack}>
            <ArrowLeft className="size-5" />
            <span className="sr-only">Back</span>
          </Button>
        ) : null}
        <Avatar className="size-10 shrink-0 rounded-xl border border-gray-100">
          <AvatarImage src={partnerMeta.partnerAvatar ?? undefined} alt="" />
          <AvatarFallback className="rounded-xl bg-[#EEF2FF] text-xs font-semibold text-[#4338CA]">
            {initials(partnerMeta.partnerName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#0A0A0A]">{partnerMeta.partnerName}</p>
          {partnerMeta.jobTitle ? (
            <p className="truncate text-xs text-[#6B7280]">Re: {partnerMeta.jobTitle}</p>
          ) : (
            <p className="text-xs text-[#9CA3AF]">Direct message</p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[#FAFAFA] p-4">
        {sorted.map((m) => {
          const mine = m.sender_id === currentUserId
          const time =
            m.sent_at &&
            (() => {
              try {
                return format(new Date(m.sent_at), 'MMM d · h:mm a')
              } catch {
                return ''
              }
            })()
          return (
            <div key={m.id} className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                  mine ? 'rounded-br-md bg-[#4F46E5] text-white' : 'rounded-bl-md bg-white text-[#374151] ring-1 ring-gray-100',
                )}
              >
                {m.content}
              </div>
              {time ? <span className="text-[10px] text-[#9CA3AF]">{time}</span> : null}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 bg-white p-3 md:p-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="rounded-full border-gray-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            disabled={sending || !draft.trim()}
            className="shrink-0 rounded-full bg-[#4F46E5] hover:bg-[#4338CA]"
            onClick={() => submit()}
          >
            <Send className="size-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
