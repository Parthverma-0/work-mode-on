'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FileText, Upload, X } from 'lucide-react'
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame'
import { SkillsInput } from '@/components/candidate/SkillsInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'
import { uploadCandidateResumeBlob } from '@/lib/upload-resume-client'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const STEP_LABELS = ['Basics', 'Education', 'Skills & résumé']

const fieldClass =
  'h-12 rounded-xl border-[#e2e8f0] bg-white/90 shadow-none transition-colors placeholder:text-[#94a3b8] focus-visible:border-[#a5b4fc] focus-visible:ring-[#4F46E5]/15'

function stepCopy(step: number) {
  switch (step) {
    case 1:
      return {
        title: 'Introduce yourself',
        description:
          'A clear headline and contact details help recruiters understand who you are in seconds.',
      }
    case 2:
      return {
        title: 'Education',
        description: 'Tell us where you studied and whether you’re open to new opportunities.',
      }
    default:
      return {
        title: 'Skills & portfolio',
        description: 'Highlight strengths and optionally attach a résumé — you can polish this anytime from your profile.',
      }
  }
}

type CandidateOnboardingProps = {
  userId: string
}

type SavePhase = 'idle' | 'uploading' | 'saving'

export function CandidateOnboarding({ userId }: CandidateOnboardingProps) {
  const { refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [savePhase, setSavePhase] = useState<SavePhase>('idle')
  const [headline, setHeadline] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [course, setCourse] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [openToWork, setOpenToWork] = useState(true)
  const [skills, setSkills] = useState<string[]>([])
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null)
  const [pendingResumeLabel, setPendingResumeLabel] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loading = savePhase !== 'idle'
  const meta = stepCopy(step)

  useEffect(() => {
    const loadExisting = async () => {
      const { data: profile } = await supabase.from('profiles').select('phone').eq('id', userId).maybeSingle()

      const { data: candidate } = await supabase
        .from('candidate_profiles')
        .select(
          'headline, city, college, course, graduation_year, open_to_work, skills, portfolio_url, resume_url',
        )
        .eq('user_id', userId)
        .maybeSingle()

      if (profile?.phone) setPhone(profile.phone)
      if (candidate) {
        setHeadline(candidate.headline ?? '')
        setCity(candidate.city ?? '')
        setCollege(candidate.college ?? '')
        setCourse(candidate.course ?? '')
        setGraduationYear(candidate.graduation_year ? String(candidate.graduation_year) : '')
        setOpenToWork(candidate.open_to_work ?? true)
        setSkills(Array.isArray(candidate.skills) ? candidate.skills : [])
        setPortfolioUrl(candidate.portfolio_url ?? '')
        if (candidate.resume_url) {
          setExistingResumeUrl(candidate.resume_url as string)
          setPendingResumeLabel(null)
        }
      }
    }

    loadExisting()
  }, [userId])

  const effectiveResumeHint = useMemo(() => {
    if (pendingResumeLabel) return { kind: 'new' as const, label: pendingResumeLabel }
    if (resumeFile === null && existingResumeUrl)
      return { kind: 'saved' as const, label: 'Résumé on file — upload a new file to replace it.' }
    return null
  }, [pendingResumeLabel, resumeFile, existingResumeUrl])

  const isLastStep = step === 3
  const submitText = useMemo(() => {
    if (savePhase === 'uploading') return 'Uploading résumé…'
    if (savePhase === 'saving') return 'Saving profile…'
    return 'Complete onboarding'
  }, [savePhase])

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {}

    if (step === 1) {
      if (!headline.trim()) nextErrors.headline = 'Headline is required.'
      if (!city.trim()) nextErrors.city = 'City is required.'
      if (!phone.trim()) nextErrors.phone = 'Phone is required.'
    }
    if (step === 2) {
      if (!college.trim()) nextErrors.college = 'College is required.'
      if (!course.trim()) nextErrors.course = 'Course is required.'
      if (!graduationYear.trim()) nextErrors.graduationYear = 'Graduation year is required.'
    }
    if (step === 3) {
      if (!skills.length) nextErrors.skills = 'Add at least one skill.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function clearPendingResume() {
    setResumeFile(null)
    setPendingResumeLabel(null)
  }

  async function handleNext() {
    if (!validateCurrentStep()) return
    if (!isLastStep) {
      setStep((prev) => prev + 1)
      return
    }

    setErrors({})

    try {
      let resumeUrl: string | null = null

      if (resumeFile) {
        setSavePhase('uploading')
        resumeUrl = await uploadCandidateResumeBlob(resumeFile, userId)
      } else {
        resumeUrl = existingResumeUrl
      }

      setSavePhase('saving')

      const { error: profileErr } = await supabase.from('profiles').update({ phone }).eq('id', userId)

      if (profileErr) {
        setErrors({ form: profileErr.message })
        setSavePhase('idle')
        return
      }

      const { error: upsertErr } = await supabase.from('candidate_profiles').upsert(
        {
          user_id: userId,
          headline,
          city,
          college,
          course,
          graduation_year: Number(graduationYear),
          open_to_work: openToWork,
          skills,
          portfolio_url: portfolioUrl.trim() || null,
          resume_url: resumeUrl,
        },
        { onConflict: 'user_id' },
      )

      if (upsertErr) {
        setErrors({ form: upsertErr.message })
        setSavePhase('idle')
        return
      }

      setSavePhase('idle')
      void refreshProfile(userId)

      window.location.assign(`${window.location.origin}/candidate/dashboard`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setErrors({ form: message })
      setSavePhase('idle')
    }
  }

  return (
    <OnboardingFrame
      variant="candidate"
      step={step}
      stepLabels={STEP_LABELS}
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-6">
        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="headline" className="text-[#475569]">
                Headline
              </Label>
              <Input
                id="headline"
                className={fieldClass}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Final-year CS • React & systems"
              />
              {errors.headline && <p className="text-sm text-red-600">{errors.headline}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-[#475569]">
                City
              </Label>
              <Input id="city" className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Where you’re based" />
              {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#475569]">
                Phone
              </Label>
              <Input id="phone" className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="college" className="text-[#475569]">
                College
              </Label>
              <Input id="college" className={fieldClass} value={college} onChange={(e) => setCollege(e.target.value)} />
              {errors.college && <p className="text-sm text-red-600">{errors.college}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="course" className="text-[#475569]">
                Course / major
              </Label>
              <Input id="course" className={fieldClass} value={course} onChange={(e) => setCourse(e.target.value)} />
              {errors.course && <p className="text-sm text-red-600">{errors.course}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduationYear" className="text-[#475569]">
                Graduation year
              </Label>
              <Input
                id="graduationYear"
                type="number"
                className={fieldClass}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              />
              {errors.graduationYear && <p className="text-sm text-red-600">{errors.graduationYear}</p>}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc]/80 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-[#0f172a]">Open to work</p>
                <p className="text-xs text-[#64748b]">Recruiters can discover you faster when this is on.</p>
              </div>
              <Switch checked={openToWork} onCheckedChange={setOpenToWork} aria-label="Open to work opportunities" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label className="text-[#475569]">Skills</Label>
              <SkillsInput skills={skills} onChange={setSkills} />
              {errors.skills && <p className="text-sm text-red-600">{errors.skills}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <Label className="text-[#475569]">Résumé</Label>
                <span className="text-xs font-normal text-[#94a3b8]">
                  Optional — upload now or later from Profile.
                </span>
              </div>
              <label
                htmlFor="resume"
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd5e1] bg-gradient-to-br from-[#fafafa] to-[#f1f5f9]/80 px-4 py-10 text-center text-sm text-[#64748b] transition-colors',
                  'hover:border-[#4F46E5]/35 hover:bg-[#eef2ff]/40',
                )}
              >
                <Upload className="h-8 w-8 text-[#94a3b8]" aria-hidden />
                <span className="font-medium text-[#475569]">Drop a file or click to upload</span>
                <span className="text-xs text-[#94a3b8]">PDF, DOC, or DOCX</span>
              </label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setResumeFile(file)
                  setPendingResumeLabel(file ? file.name : null)
                  e.target.value = ''
                }}
              />

              {effectiveResumeHint && (
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 text-sm shadow-sm',
                    effectiveResumeHint.kind === 'new'
                      ? 'border-[#86efac]/80 bg-[#ecfdf5] text-[#14532d]'
                      : 'border-[#e2e8f0] bg-[#f8fafc] text-[#475569]',
                  )}
                >
                  {effectiveResumeHint.kind === 'new' ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#16a34a]" aria-hidden />
                  ) : (
                    <FileText className="mt-0.5 size-5 shrink-0 text-[#64748b]" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {effectiveResumeHint.kind === 'new' ? 'Ready to upload' : 'Résumé on file'}
                    </p>
                    <p className="mt-0.5 break-all text-xs opacity-95">{effectiveResumeHint.label}</p>
                    {effectiveResumeHint.kind === 'new' && (
                      <p className="mt-2 text-xs opacity-85">
                        We’ll upload securely when you complete onboarding.
                      </p>
                    )}
                  </div>
                  {effectiveResumeHint.kind === 'new' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-[#475569] hover:text-red-600"
                      onClick={clearPendingResume}
                      aria-label="Remove selected file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio" className="text-[#475569]">
                Portfolio URL
              </Label>
              <Input
                id="portfolio"
                type="url"
                className={fieldClass}
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
        )}

        {errors.form && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">{errors.form}</div>
        )}

        <div className="mt-2 flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={step === 1 || loading}
            className="h-12 rounded-xl border-[#e2e8f0] bg-white/90"
            onClick={() => setStep(step - 1)}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className={cn(
              'h-12 min-w-[12rem] rounded-xl bg-[#4F46E5] px-8 font-semibold text-white shadow-lg shadow-[#4F46E5]/25 transition hover:bg-[#4338CA] hover:shadow-[#4338CA]/30',
            )}
          >
            {isLastStep ? submitText : 'Continue'}
          </Button>
        </div>
      </div>
    </OnboardingFrame>
  )
}
