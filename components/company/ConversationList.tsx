'use client'

import { formatDistanceToNowStrict } from 'date-fns'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { ConversationSummary } from '@/lib/company-types'
import { cn } from '@/lib/utils'

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  if (!p[0]) return '?'
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

type ConversationListProps = {
  conversations: ConversationSummary[]
  loading?: boolean
  selectedPartnerId: string | null
  onSelect: (partnerUserId: string) => void
  search: string
  onSearchChange: (v: string) => void
}

export function ConversationList({
  conversations,
  loading,
  selectedPartnerId,
  onSelect,
  search,
  onSearchChange,
}: ConversationListProps) {
  const term = search.trim().toLowerCase()
  const filtered = term
    ? conversations.filter((c) => c.partnerName.toLowerCase().includes(term))
    : conversations

  if (loading) {
    return (
      <div className="flex h-full flex-col border border-gray-100 bg-white md:rounded-xl md:shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <Skeleton className="h-10 w-full rounded-lg bg-gray-100" />
        </div>
        <div className="flex-1 space-y-2 p-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col border border-gray-100 bg-white md:max-h-[calc(100vh-12rem)] md:rounded-xl md:shadow-sm">
      <div className="border-b border-gray-100 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations"
            className="rounded-lg border-gray-200 pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-[#6B7280]">
            {term ? 'No matches.' : 'No messages yet. Reach out from Applicants or Find Candidates.'}
          </p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((c) => {
              const active = c.partnerUserId === selectedPartnerId
              const ago =
                c.lastAt &&
                (() => {
                  try {
                    return formatDistanceToNowStrict(new Date(c.lastAt), { addSuffix: true })
                  } catch {
                    return ''
                  }
                })()
              return (
                <li key={c.partnerUserId}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.partnerUserId)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors',
                      active ? 'bg-[#EEF2FF] ring-1 ring-[#C7D2FE]' : 'hover:bg-[#FAFAFA]',
                    )}
                  >
                    <Avatar className="size-10 shrink-0 rounded-xl border border-gray-100">
                      <AvatarImage src={c.partnerAvatar ?? undefined} alt="" />
                      <AvatarFallback className="rounded-xl bg-[#F3F4F6] text-xs font-semibold text-[#6B7280]">
                        {initials(c.partnerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-[#0A0A0A]">{c.partnerName}</span>
                        <span className="shrink-0 text-[10px] text-[#9CA3AF]">{ago}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280]">{c.lastPreview}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {c.unread > 0 ? (
                          <span className="inline-flex size-2 rounded-full bg-[#4F46E5]" aria-label={`${c.unread} unread`} />
                        ) : null}
                        {c.jobTitle ? (
                          <span className="truncate text-[10px] text-[#9CA3AF]">Re: {c.jobTitle}</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
