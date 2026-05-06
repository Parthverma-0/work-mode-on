'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type JobOpt = { id: string; title: string }

type MessageModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiverName: string
  jobs: JobOpt[]
  /** Job context for thread */
  defaultJobId: string | null
  jobSubtitle?: string | null
  onSend: (content: string, jobId: string | null) => Promise<{ error: string | null }>
}

export function MessageModal({
  open,
  onOpenChange,
  receiverName,
  jobs,
  defaultJobId,
  jobSubtitle,
  onSend,
}: MessageModalProps) {
  const [body, setBody] = useState('')
  const [jobId, setJobId] = useState<string>('none')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!open) return
    setBody('')
    setJobId(defaultJobId ?? 'none')
  }, [open, defaultJobId])

  async function handleSend() {
    const text = body.trim()
    if (!text) {
      toast.error('Write a message first.')
      return
    }
    setSending(true)
    const resolvedJob = jobId === 'none' ? null : jobId
    const { error } = await onSend(text, resolvedJob)
    setSending(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Message sent')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border border-gray-100">
        <DialogHeader>
          <DialogTitle className="text-[#0A0A0A]">Message {receiverName}</DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            {jobSubtitle ? <>Context: {jobSubtitle}</> : 'Start a conversation about your opportunity.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {jobs.length > 0 ? (
            <div className="space-y-2">
              <Label className="text-[#374151]">Related job</Label>
              <Select value={jobId} onValueChange={setJobId}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General (no specific job)</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="msg-body" className="text-[#374151]">
              Message
            </Label>
            <Textarea
              id="msg-body"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi — we'd love to hear more about your experience with…"
              className="resize-none rounded-lg border-gray-200 text-[#374151]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" className="rounded-lg" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={sending}
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            onClick={() => handleSend()}
          >
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
