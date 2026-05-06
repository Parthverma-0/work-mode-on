'use client'

import Image from 'next/image'
import { Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { SkillsInput } from '@/components/candidate/SkillsInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuth } from '@/context/AuthContext'
import { useCandidate } from '@/hooks/useCandidate'
import { supabase } from '@/lib/supabase'

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i)

export default function CandidateProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const { candidate, loading, refresh } = useCandidate(user?.id)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [city, setCity] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [openToWork, setOpenToWork] = useState(true)

  const [college, setCollege] = useState('')
  const [course, setCourse] = useState('')
  const [graduationYear, setGraduationYear] = useState<string>('')

  const [skills, setSkills] = useState<string[]>([])

  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeLabel, setResumeLabel] = useState('')

  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!profile && !candidate) return
    setFullName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
    setAvatarPreview(profile?.avatar_url ?? null)
    if (candidate) {
      setCity(candidate.city ?? '')
      setHeadline(candidate.headline ?? '')
      setBio(candidate.bio ?? '')
      setOpenToWork(candidate.open_to_work ?? true)
      setCollege(candidate.college ?? '')
      setCourse(candidate.course ?? '')
      setGraduationYear(candidate.graduation_year ? String(candidate.graduation_year) : '')
      setSkills(Array.isArray(candidate.skills) ? candidate.skills : [])
      setPortfolioUrl(candidate.portfolio_url ?? '')
      setResumeLabel(candidate.resume_url ? 'Resume on file' : '')
    }
  }, [profile, candidate])

  async function uploadToResumes(file: File, subpath: string): Promise<string> {
    if (!user) throw new Error('Not signed in')
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${user.id}/${subpath}.${ext}`
    const { error: upErr } = await supabase.storage.from('resumes').upload(path, file, { upsert: true })
    if (upErr) throw new Error(upErr.message)
    const { data: signed, error: sErr } = await supabase.storage
      .from('resumes')
      .createSignedUrl(path, 60 * 60 * 24 * 365)
    if (sErr || !signed?.signedUrl) throw new Error(sErr?.message ?? 'Signed URL failed')
    return signed.signedUrl
  }

  async function saveBasic() {
    if (!user) return
    setSaving('basic')
    try {
      await supabase.from('profiles').update({ full_name: fullName.trim(), phone: phone.trim() }).eq('id', user.id)
      await supabase
        .from('candidate_profiles')
        .update({
          headline: headline.trim(),
          bio: bio.trim() || null,
          city: city.trim(),
          open_to_work: openToWork,
        })
        .eq('user_id', user.id)
      await refreshProfile(user.id)
      await refresh()
      toast.success('Saved ✓')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function saveAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true)
    try {
      const url = await uploadToResumes(file, 'avatar')
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      setAvatarPreview(url)
      await refreshProfile(user.id)
      toast.success('Saved ✓')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function saveEducation() {
    if (!user) return
    setSaving('edu')
    try {
      await supabase
        .from('candidate_profiles')
        .update({
          college: college.trim(),
          course: course.trim(),
          graduation_year: graduationYear ? Number(graduationYear) : null,
        })
        .eq('user_id', user.id)
      await refresh()
      toast.success('Saved ✓')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function saveSkills() {
    if (!user) return
    setSaving('skills')
    try {
      await supabase.from('candidate_profiles').update({ skills }).eq('user_id', user.id)
      await refresh()
      toast.success('Saved ✓')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function saveLinks() {
    if (!user) return
    setSaving('links')
    try {
      let resumeUrl: string | null = candidate?.resume_url ?? null
      if (resumeFile) {
        resumeUrl = await uploadToResumes(resumeFile, `resume_${Date.now()}`)
      }
      await supabase
        .from('candidate_profiles')
        .update({
          portfolio_url: portfolioUrl.trim() || null,
          resume_url: resumeUrl,
        })
        .eq('user_id', user.id)
      setResumeFile(null)
      setResumeLabel(resumeUrl ? 'Resume on file' : '')
      await refresh()
      toast.success('Saved ✓')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  if (loading && !candidate) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A] md:text-3xl">My profile</h1>
        {openToWork && (
          <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857] ring-1 ring-[#A7F3D0]">
            Open to Work
          </span>
        )}
      </div>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Basic info</CardTitle>
          <CardDescription>Name, contact, and how you introduce yourself.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-100">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center text-sm font-medium text-[#6B7280]">
                  Photo
                </div>
              )}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                {avatarUploading ? '…' : 'Edit'}
                <input type="file" accept="image/*" className="sr-only" onChange={saveAvatar} disabled={avatarUploading} />
              </label>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Final year CS student | React Developer"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex justify-between gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <span className="text-xs text-[#9CA3AF]">{bio.length}/300</span>
                </div>
                <Textarea
                  id="bio"
                  value={bio}
                  maxLength={300}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="resize-none rounded-lg border-gray-200"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-[#FAFAFA] px-4 py-3 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">Open to work</p>
                  <p className="text-xs text-[#6B7280]">Show recruiters you&apos;re available.</p>
                </div>
                <Switch checked={openToWork} onCheckedChange={setOpenToWork} aria-label="Open to work" />
              </div>
            </div>
          </div>
          <Button
            type="button"
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            disabled={saving === 'basic'}
            onClick={saveBasic}
          >
            {saving === 'basic' ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Education</CardTitle>
          <CardDescription>Where you study and when you graduate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Input id="college" value={college} onChange={(e) => setCollege(e.target.value)} className="rounded-lg border-gray-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course / degree</Label>
            <Input id="course" value={course} onChange={(e) => setCourse(e.target.value)} className="rounded-lg border-gray-200" />
          </div>
          <div className="space-y-2">
            <Label>Graduation year</Label>
            <Select value={graduationYear || undefined} onValueChange={setGraduationYear}>
              <SelectTrigger className="rounded-lg border-gray-200">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            disabled={saving === 'edu'}
            onClick={saveEducation}
          >
            {saving === 'edu' ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
          <CardDescription>Add skills employers search for.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkillsInput skills={skills} onChange={setSkills} />
          <Button
            type="button"
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            disabled={saving === 'skills'}
            onClick={saveSkills}
          >
            {saving === 'skills' ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Links & resume</CardTitle>
          <CardDescription>Portfolio and CV.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input
              id="portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="rounded-lg border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label>Resume</Label>
            <p className="text-sm text-[#6B7280]">{resumeLabel || 'No resume uploaded'}</p>
            <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-[#FAFAFA]/50 px-4 py-8 transition-colors hover:border-[#4F46E5]/40 hover:bg-[#FAFAFA]">
              <Upload className="size-5 text-[#9CA3AF]" aria-hidden />
              <span className="text-sm font-medium text-[#374151]">Drop resume or click to upload</span>
              <span className="text-xs text-[#9CA3AF]">PDF, DOC, DOCX</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setResumeFile(f)
                  if (f) setResumeLabel(f.name)
                }}
              />
            </label>
          </div>
          <Button
            type="button"
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            disabled={saving === 'links'}
            onClick={saveLinks}
          >
            {saving === 'links' ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center pb-4 md:hidden">
        <SignOutButton
          variant="outline"
          className="min-h-11 rounded-lg border-red-200 text-[#EF4444] hover:bg-red-50"
          label="Sign out"
        />
      </div>
    </div>
  )
}
