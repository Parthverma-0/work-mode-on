'use client'

import { useCallback, useMemo, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { ChatWindow } from '@/components/company/ChatWindow'
import { ConversationList } from '@/components/company/ConversationList'
import { PageHeader } from '@/components/dashboard/PageHeader'
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
    <div className="space-y-6 pb-4">
      <PageHeader
        eyebrow="Inbox"
        eyebrowIcon={<MessageCircle className="size-3.5" aria-hidden />}
        title="Messages"
        description="Your recruiter conversations, all in one place."
      />

      <div className="flex h-[calc(100vh-13rem)] min-h-[520px] flex-col gap-4 md:flex-row md:items-stretch">
        <div
          className={`md:w-[330px] md:shrink-0 ${
            mobilePanel === 'chat' ? 'hidden md:flex md:flex-col' : 'flex min-h-0 flex-1 flex-col md:flex-none'
          }`}
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
