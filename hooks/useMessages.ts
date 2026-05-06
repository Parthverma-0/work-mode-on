'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ConversationSummary, MessageRow } from '@/lib/company-types'

function partnerId(msg: MessageRow, me: string): string {
  return msg.sender_id === me ? msg.receiver_id : msg.sender_id
}

export function useMessages(currentUserId: string | undefined, jobTitles: Map<string, string>) {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [partnerProfiles, setPartnerProfiles] = useState<
    Map<string, { full_name: string | null; avatar_url: string | null }>
  >(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!currentUserId) {
      setMessages([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: qErr } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, job_id, content, is_read, sent_at')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('sent_at', { ascending: true })

    if (qErr) {
      setError(qErr.message)
      setMessages([])
      setLoading(false)
      return
    }

    const rows = (data ?? []) as MessageRow[]
    setMessages(rows)

    const partnerIds = [...new Set(rows.map((m) => partnerId(m, currentUserId)))]
    if (partnerIds.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', partnerIds)
      const pmap = new Map(
        (profs ?? []).map((p) => [
          p.id as string,
          { full_name: p.full_name as string | null, avatar_url: p.avatar_url as string | null },
        ]),
      )
      setPartnerProfiles(pmap)
    } else {
      setPartnerProfiles(new Map())
    }

    setLoading(false)
  }, [currentUserId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase
      .channel(`company-messages-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as MessageRow
          if (row.sender_id !== currentUserId && row.receiver_id !== currentUserId) return
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [...prev, row].sort(
              (a, b) =>
                new Date(a.sent_at ?? 0).getTime() - new Date(b.sent_at ?? 0).getTime(),
            )
          })
          const pid = partnerId(row, currentUserId)
          setPartnerProfiles((prev) => {
            if (prev.has(pid)) return prev
            const next = new Map(prev)
            supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', pid)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  next.set(pid, {
                    full_name: data.full_name as string | null,
                    avatar_url: data.avatar_url as string | null,
                  })
                  setPartnerProfiles(new Map(next))
                }
              })
            return prev
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  const conversations = useMemo((): ConversationSummary[] => {
    if (!currentUserId) return []
    const byPartner = new Map<string, MessageRow[]>()
    for (const m of messages) {
      const pid = partnerId(m, currentUserId)
      const arr = byPartner.get(pid) ?? []
      arr.push(m)
      byPartner.set(pid, arr)
    }

    const list: ConversationSummary[] = []
    for (const [partnerUserId, msgs] of byPartner) {
      const sorted = [...msgs].sort(
        (a, b) => new Date(b.sent_at ?? 0).getTime() - new Date(a.sent_at ?? 0).getTime(),
      )
      const last = sorted[0]
      const unread = msgs.filter(
        (m) => m.receiver_id === currentUserId && !m.is_read,
      ).length
      const prof = partnerProfiles.get(partnerUserId)
      const jobId = last.job_id
      list.push({
        partnerUserId,
        partnerName: prof?.full_name ?? 'Candidate',
        partnerAvatar: prof?.avatar_url ?? null,
        lastPreview: last.content.slice(0, 80) + (last.content.length > 80 ? '…' : ''),
        lastAt: last.sent_at ?? '',
        unread,
        jobId,
        jobTitle: jobId ? jobTitles.get(jobId) ?? null : null,
      })
    }

    return list.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
  }, [messages, currentUserId, partnerProfiles, jobTitles])

  const sendMessage = useCallback(
    async (receiverId: string, content: string, jobId: string | null) => {
      if (!currentUserId?.trim() || !content.trim()) return { error: 'Invalid message' }
      const { error: insErr } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        job_id: jobId,
        content: content.trim(),
        is_read: false,
      })
      if (insErr) return { error: insErr.message }
      await refresh()
      return { error: null }
    },
    [currentUserId, refresh],
  )

  const markConversationRead = useCallback(
    async (partnerUserId: string) => {
      if (!currentUserId) return
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', partnerUserId)
      await refresh()
    },
    [currentUserId, refresh],
  )

  return {
    messages,
    conversations,
    loading,
    error,
    refresh,
    sendMessage,
    markConversationRead,
    partnerProfiles,
  }
}
