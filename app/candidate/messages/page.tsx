'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChatWindow } from '@/components/company/ChatWindow'
import { ConversationList } from '@/components/company/ConversationList'
import { useAuth } from '@/context/AuthContext'
import { useMessages } from '@/hooks/useMessages'
import type { MessageRow } from '@/lib/company-types'

function partnerId(msg: MessageRow, me: string) {
  return msg.sender_id === me ? msg.receiver_id : msg.sender_id
}

export default function CandidateMessagesPage() {
  const { user } = useAuth()
  const jobTitles = useMemo(() => new Map<string, string>(), [])
  const { messages, conversations, loading, sendMessage, markConversationRead } = useMessages(
    user?.id,
    jobTitles,
  )

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mobilePanel, setMobilePanel] = useState<'list' | 'chat'>('list')

  const partnerMeta = useMemo(
    () => conversations.find((c) => c.partnerUserId === selectedPartnerId),
    [conversations, selectedPartnerId],
  )

  const thread = useMemo(() => {
    if (!user?.id || !selectedPartnerId) return []
    return messages.filter((m) => partnerId(m, user.id) === selectedPartnerId)
  }, [messages, user?.id, selectedPartnerId])

  const selectPartner = useCallback(
    async (pid: string) => {
      setSelectedPartnerId(pid)
      setMobilePanel('chat')
      await markConversationRead(pid)
    },
    [markConversationRead],
  )

  const handleSend = useCallback(
    async (text: string) => {
      if (!selectedPartnerId) return
      const jobId = partnerMeta?.jobId ?? null
      await sendMessage(selectedPartnerId, text, jobId)
    },
    [selectedPartnerId, partnerMeta?.jobId, sendMessage],
  )

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">Messages</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          See recruiter conversations and reply here.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <div
          className={`md:w-[320px] md:shrink-0 ${mobilePanel === 'chat' ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}
        >
          <ConversationList
            conversations={conversations}
            loading={loading && !conversations.length}
            selectedPartnerId={selectedPartnerId}
            onSelect={(pid) => selectPartner(pid)}
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <div
          className={`min-h-0 flex-1 ${mobilePanel === 'list' ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}
        >
          <ChatWindow
            currentUserId={user?.id}
            partnerMeta={partnerMeta}
            messagesForPartner={thread}
            loading={false}
            showMobileBack
            onBack={() => setMobilePanel('list')}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  )
}
