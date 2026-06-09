'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { MapPin } from 'lucide-react'
import { SkillsInput } from '@/components/candidate/SkillsInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { JobRow } from '@/lib/company-types'
import { CITIES } from '@/lib/onboarding-options'
import { supabase } from '@/lib/supabase'

type JobFormProps = {
  companyProfileId: string
  mode: 'new' | 'edit'
  initial?: JobRow | null
}

export function JobForm({ companyProfileId, mode, initial }: JobFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState(initial?.type ?? 'internship')
  const [workMode, setWorkMode] = useState(initial?.mode ?? 'remote')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [stipendMin, setStipendMin] = useState(
    initial?.stipend_min != null ? String(initial.stipend_min) : '',
  )
  const [stipendMax, setStipendMax] = useState(
    initial?.stipend_max != null ? String(initial.stipend_max) : '',
  )
  const [skills, setSkills] = useState<string[]>(
    Array.isArray(initial?.skills_required) ? initial.skills_required! : [],
  )
  const [description, setDescription] = useState(initial?.description ?? '')
  const [isActive, setIsActive] = useState(initial?.is_active !== false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = 'Job title is required.'
    if (!location.trim()) next.location = 'Location is required.'
    if (description.trim().length < 100) next.description = 'Use at least 100 characters for the description.'
    if (!skills.length) next.skills = 'Add at least one skill.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSubmitting(true)

    const row = {
      company_id: companyProfileId,
      title: title.trim(),
      type,
      mode: workMode,
      location: location.trim(),
      stipend_min: stipendMin.trim() ? Number(stipendMin) : null,
      stipend_max: stipendMax.trim() ? Number(stipendMax) : null,
      skills_required: skills,
      description: description.trim(),
      is_active: isActive,
    }

    if (mode === 'new') {
      const { error } = await supabase.from('jobs').insert({
        ...row,
        posted_at: new Date().toISOString(),
      })
      setSubmitting(false)
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Job posted!')
      router.push('/company/jobs')
      router.refresh()
      return
    }

    if (!initial?.id) {
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('jobs').update(row).eq('id', initial.id)
    setSubmitting(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Job updated!')
    router.push('/company/jobs')
    router.refresh()
  }

  return (
    <Card className="mx-auto max-w-2xl rounded-xl border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{mode === 'new' ? 'Post a new job' : 'Edit job'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border-gray-200"
              placeholder="Software Engineer Intern"
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Job type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work mode</Label>
              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger className="rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Combobox
              id="location"
              value={location}
              onChange={setLocation}
              options={CITIES}
              placeholder="e.g. Bengaluru or Remote"
              icon={<MapPin className="size-4" />}
              inputClassName="rounded-lg border-gray-200"
            />
            {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min">Stipend / salary min (₹ / month)</Label>
              <Input
                id="min"
                type="number"
                min={0}
                value={stipendMin}
                onChange={(e) => setStipendMin(e.target.value)}
                className="rounded-lg border-gray-200"
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Stipend / salary max (₹ / month)</Label>
              <Input
                id="max"
                type="number"
                min={0}
                value={stipendMax}
                onChange={(e) => setStipendMax(e.target.value)}
                className="rounded-lg border-gray-200"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills required</Label>
            <SkillsInput skills={skills} onChange={setSkills} />
            {errors.skills && <p className="text-sm text-red-600">{errors.skills}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between gap-2">
              <Label htmlFor="desc">Job description</Label>
              <span className="text-xs text-[#9CA3AF]">{description.trim().length}/min 100</span>
            </div>
            <Textarea
              id="desc"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-y rounded-lg border-gray-200 text-[#374151]"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-[#FAFAFA] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">Listing active</p>
              <p className="text-xs text-[#6B7280]">Inactive jobs stay hidden from candidates.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="min-h-11 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            >
              {submitting ? 'Saving…' : mode === 'new' ? 'Publish job' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" className="rounded-lg" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
