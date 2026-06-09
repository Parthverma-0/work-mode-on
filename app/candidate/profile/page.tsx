'use client'

import Image from 'next/image'
import {
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  Circle,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { SkillsInput } from '@/components/candidate/SkillsInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { useCandidate } from '@/hooks/useCandidate'
import { CITIES, COLLEGES, COURSES, GRADUATION_YEARS } from '@/lib/onboarding-options'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (!p.length) return 'WMO'
  return ((p[0][0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}

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

  const hasResume = Boolean(resumeFile || candidate?.resume_url)
  const checklist = useMemo(
    () => [
      { label: 'Headline', done: Boolean(headline.trim()) },
      { label: 'Bio', done: Boolean(bio.trim()) },
      { label: 'Skills', done: skills.length > 0 },
      { label: 'Education', done: Boolean(college.trim()) },
      { label: 'Résumé', done: hasResume },
      { label: 'Portfolio', done: Boolean(portfolioUrl.trim()) },
    ],
    [headline, bio, skills.length, college, hasResume, portfolioUrl],
  )
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)

  // Resume → store the storage PATH; it's signed on demand at view time so the
  // link never expires.
  async function uploadResume(file: File): Promise<string> {
    if (!user) throw new Error('Not signed in')
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${user.id}/resume_${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('resumes').upload(path, file, { upsert: true })
    if (upErr) throw new Error(upErr.message)
    return path
  }

  // Avatar → public bucket, returns a permanent public URL (no expiry).
  async function uploadAvatar(file: File): Promise<string> {
    if (!user) throw new Error('Not signed in')
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${user.id}/avatar_${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) throw new Error(upErr.message)
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
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
      const url = await uploadAvatar(file)
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
        resumeUrl = await uploadResume(resumeFile)
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-44 animate-pulse rounded-3xl bg-slate-100/90" />
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100/90" />
          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100/90" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100/90" />
          </div>
        </div>
      </div>
    )
  }

  const displayName = fullName.trim() || 'Your name'

  const sections = [
    { id: 'basic', label: 'Basic info', icon: UserRound },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'links', label: 'Links & résumé', icon: Link2 },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Hero */}
      <section className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="dot-grid-subtle pointer-events-none absolute inset-0 rounded-3xl opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#4F46E5]/10 blur-[90px]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-[#EEF2FF] shadow-md ring-4 ring-white sm:size-28">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex size-full items-center justify-center text-2xl font-bold text-[#4338CA]">
                {initials(displayName)}
              </div>
            )}
            <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1 bg-black/45 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60">
              <Camera className="size-3.5" aria-hidden />
              {avatarUploading ? 'Uploading…' : 'Edit'}
              <input type="file" accept="image/*" className="sr-only" onChange={saveAvatar} disabled={avatarUploading} />
            </label>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a] sm:text-3xl">{displayName}</h1>
              {openToWork && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857] ring-1 ring-[#A7F3D0]">
                  <span className="size-1.5 rounded-full bg-[#10B981]" aria-hidden />
                  Open to Work
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[15px] text-[#475569]">
              {headline.trim() || 'Add a headline so recruiters get you in seconds.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#64748b]">
              {city.trim() && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {city}
                </span>
              )}
              {(college.trim() || graduationYear) && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="size-4 shrink-0" aria-hidden />
                  {[college.trim(), graduationYear && `’${graduationYear.slice(-2)}`].filter(Boolean).join(' · ')}
                </span>
              )}
              {user?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-4 shrink-0" aria-hidden />
                  {user.email}
                </span>
              )}
            </div>
          </div>

          <div className="w-full shrink-0 rounded-2xl bg-white/70 p-4 ring-1 ring-black/[0.05] md:w-44">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Strength</span>
              <span className="text-2xl font-bold tabular-nums text-[#4338CA]">{completion}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#EEF2FF]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366f1] transition-[width] duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile strength</CardTitle>
              <CardDescription>Complete each section to stand out in search.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-[#10B981]" aria-hidden />
                  ) : (
                    <Circle className="size-4 shrink-0 text-[#cbd5e1]" aria-hidden />
                  )}
                  <span className={cn(item.done ? 'text-[#0f172a]' : 'text-[#94a3b8]')}>{item.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Jump to</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#475569] transition-colors hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                >
                  <s.icon className="size-4 shrink-0" aria-hidden />
                  {s.label}
                </a>
              ))}
            </CardContent>
          </Card>

          <div className="md:hidden">
            <SignOutButton
              variant="outline"
              className="w-full rounded-xl border-red-200 text-[#EF4444] hover:bg-red-50"
              label="Sign out"
            />
          </div>
        </aside>

        {/* Sections */}
        <div className="space-y-6">
          <Card id="basic" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserRound className="size-5 text-[#4F46E5]" aria-hidden /> Basic info
              </CardTitle>
              <CardDescription>Name, contact, and how you introduce yourself.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Combobox
                    id="city"
                    value={city}
                    onChange={setCity}
                    options={CITIES}
                    placeholder="Where you’re based"
                    icon={<MapPin className="size-4" />}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Final year CS student | React Developer"
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
                    className="resize-none rounded-xl"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-black/[0.06] bg-[#FAFAFA] px-4 py-3 sm:col-span-2">
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">Open to work</p>
                    <p className="text-xs text-[#6B7280]">Show recruiters you&apos;re available.</p>
                  </div>
                  <Switch checked={openToWork} onCheckedChange={setOpenToWork} aria-label="Open to work" />
                </div>
              </div>
              <Button type="button" disabled={saving === 'basic'} onClick={saveBasic}>
                {saving === 'basic' ? 'Saving…' : 'Save changes'}
              </Button>
            </CardContent>
          </Card>

          <Card id="education" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="size-5 text-[#4F46E5]" aria-hidden /> Education
              </CardTitle>
              <CardDescription>Where you study and when you graduate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Combobox
                  id="college"
                  value={college}
                  onChange={setCollege}
                  options={COLLEGES}
                  placeholder="Start typing your college…"
                  icon={<GraduationCap className="size-4" />}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course">Course / degree</Label>
                  <Combobox
                    id="course"
                    value={course}
                    onChange={setCourse}
                    options={COURSES}
                    placeholder="e.g. B.Tech — Computer Science"
                    icon={<BookOpen className="size-4" />}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation year</Label>
                  <Combobox
                    id="graduationYear"
                    value={graduationYear}
                    onChange={setGraduationYear}
                    options={GRADUATION_YEARS}
                    placeholder="Select year"
                    icon={<CalendarDays className="size-4" />}
                  />
                </div>
              </div>
              <Button type="button" disabled={saving === 'edu'} onClick={saveEducation}>
                {saving === 'edu' ? 'Saving…' : 'Save changes'}
              </Button>
            </CardContent>
          </Card>

          <Card id="skills" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="size-5 text-[#4F46E5]" aria-hidden /> Skills
              </CardTitle>
              <CardDescription>Add skills employers search for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillsInput skills={skills} onChange={setSkills} />
              <Button type="button" disabled={saving === 'skills'} onClick={saveSkills}>
                {saving === 'skills' ? 'Saving…' : 'Save changes'}
              </Button>
            </CardContent>
          </Card>

          <Card id="links" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="size-5 text-[#4F46E5]" aria-hidden /> Links & résumé
              </CardTitle>
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
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label>Résumé</Label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#cbd5e1] bg-[#FAFAFA]/60 px-4 py-4 transition-colors hover:border-[#4F46E5]/40 hover:bg-[#EEF2FF]/40">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#4F46E5] ring-1 ring-black/[0.04]">
                    {hasResume ? <FileText className="size-5" aria-hidden /> : <Upload className="size-5" aria-hidden />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#374151]">
                      {resumeLabel || 'Drop résumé or click to upload'}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">PDF, DOC, or DOCX</p>
                  </div>
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
              <Button type="button" disabled={saving === 'links'} onClick={saveLinks}>
                {saving === 'links' ? 'Saving…' : 'Save changes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
