'use client'

import { useEffect, useMemo, useState } from 'react'
import { Briefcase, Building2, ImageIcon, MapPin, Upload, X } from 'lucide-react'
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CITIES, INDUSTRIES } from '@/lib/onboarding-options'
import { uploadCompanyLogo } from '@/lib/upload-logo-client'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const STEP_LABELS = ['Organization', 'Story & logo', 'Social']

const fieldClass =
  'h-12 rounded-xl border-[#e2e8f0] bg-white/90 shadow-none transition-colors placeholder:text-[#94a3b8] focus-visible:border-[#a5b4fc] focus-visible:ring-[#10B981]/15'

function stepCopy(step: number) {
  switch (step) {
    case 1:
      return {
        title: 'Company basics',
        description: 'Official name, industry, and locations help candidates trust who they’re applying to.',
      }
    case 2:
      return {
        title: 'Your story',
        description: 'A short narrative and crisp logo create a polished first impression on every listing.',
      }
    default:
      return {
        title: 'Stay connected',
        description: 'Add social links — all optional — so talent can explore your culture beyond Work Mode.',
      }
  }
}

type CompanyOnboardingProps = {
  userId: string
}

export function CompanyOnboarding({ userId }: CompanyOnboardingProps) {
  const { refreshProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [city, setCity] = useState('')
  const [website, setWebsite] = useState('')
  const [about, setAbout] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoName, setLogoName] = useState('')
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadExisting = async () => {
      const { data: company } = await supabase
        .from('company_profiles')
        .select('company_name, industry, city, website, about, social_links, logo_url')
        .eq('user_id', userId)
        .maybeSingle()

      if (!company) return
      setCompanyName(company.company_name ?? '')
      setIndustry(company.industry ?? '')
      setCity(company.city ?? '')
      setWebsite(company.website ?? '')
      setAbout(company.about ?? '')

      const links = Array.isArray(company.social_links) ? company.social_links : []
      setLinkedin(links.find((link) => String(link).includes('linkedin')) ?? '')
      setInstagram(links.find((link) => String(link).includes('instagram')) ?? '')
      setTwitter(links.find((link) => String(link).includes('twitter')) ?? '')
      if (company.logo_url) {
        setExistingLogoUrl(company.logo_url as string)
        setLogoName('Logo already uploaded')
      }
    }

    loadExisting()
  }, [userId])

  const isLastStep = step === 3
  const submitText = useMemo(() => (loading ? 'Saving…' : 'Complete onboarding'), [loading])
  const meta = stepCopy(step)

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {}
    if (step === 1) {
      if (!companyName.trim()) nextErrors.companyName = 'Company name is required.'
      if (!industry.trim()) nextErrors.industry = 'Industry is required.'
      if (!city.trim()) nextErrors.city = 'City is required.'
      if (!website.trim()) nextErrors.website = 'Website is required.'
    }
    if (step === 2 && !about.trim()) nextErrors.about = 'About is required.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleNext() {
    if (!validateCurrentStep()) return
    if (!isLastStep) {
      setStep((prev) => prev + 1)
      return
    }

    setLoading(true)
    try {
      let logoUrl: string | null = existingLogoUrl
      if (logoFile) {
        logoUrl = await uploadCompanyLogo(logoFile, userId)
      }

      const socialLinks = [linkedin, instagram, twitter].filter(Boolean)

      const { error } = await supabase.from('company_profiles').upsert(
        {
          user_id: userId,
          company_name: companyName,
          industry,
          city,
          website,
          about,
          logo_url: logoUrl,
          social_links: socialLinks,
        },
        { onConflict: 'user_id' },
      )

      if (error) {
        setErrors({ form: error.message })
        return
      }

      void refreshProfile(userId)
      window.location.assign(`${window.location.origin}/company/dashboard`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.'
      setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  const logoHintKind = logoFile ? 'new' : existingLogoUrl && !logoFile ? 'saved' : null

  return (
    <OnboardingFrame variant="company" step={step} stepLabels={STEP_LABELS} title={meta.title} description={meta.description}>
      <div className="space-y-6">
        {step === 1 && (
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-[#475569]">
                Company name
              </Label>
              <Input
                id="companyName"
                className={fieldClass}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Startup Pvt Ltd"
              />
              {errors.companyName && <p className="text-sm text-red-600">{errors.companyName}</p>}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-[#475569]">
                  Industry
                </Label>
                <Combobox
                  id="industry"
                  value={industry}
                  onChange={setIndustry}
                  options={INDUSTRIES}
                  placeholder="SaaS, fintech…"
                  icon={<Briefcase className="size-4" />}
                  inputClassName={fieldClass}
                />
                {errors.industry && <p className="text-sm text-red-600">{errors.industry}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[#475569]">
                  City / HQ
                </Label>
                <Combobox
                  id="city"
                  value={city}
                  onChange={setCity}
                  options={CITIES}
                  placeholder="Head office city"
                  icon={<MapPin className="size-4" />}
                  inputClassName={fieldClass}
                />
                {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-[#475569]">
                Website
              </Label>
              <Input id="website" className={fieldClass} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
              {errors.website && <p className="text-sm text-red-600">{errors.website}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="about" className="text-[#475569]">
                About company
              </Label>
              <Textarea
                id="about"
                className={cn(
                  fieldClass.replace('h-12', 'min-h-[160px]'),
                  'rounded-2xl py-4 leading-relaxed',
                )}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={6}
                placeholder="Mission, traction, culture — keep it concise and inviting."
              />
              {errors.about && <p className="text-sm text-red-600">{errors.about}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[#475569]">Logo</Label>
              <label
                htmlFor="logo"
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#cbd5e1] bg-gradient-to-br from-emerald-50/40 via-[#fafafa] to-[#eef2ff]/50 px-4 py-10 text-center transition-colors',
                  'hover:border-[#059669]/40 hover:bg-emerald-50/30',
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04]">
                  <ImageIcon className="size-6 text-[#64748b]" aria-hidden />
                </div>
                <span className="flex items-center gap-2 text-sm font-semibold text-[#475569]">
                  <Upload className="size-4 shrink-0" aria-hidden /> Drop logo or click to upload
                </span>
                <span className="text-xs text-[#94a3b8]">PNG / JPG / WebP • square works best</span>
              </label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setLogoFile(file)
                  setLogoName(file?.name ?? '')
                }}
              />
              {logoHintKind && logoName && (
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-4 text-sm',
                    logoHintKind === 'new'
                      ? 'border-[#86efac]/90 bg-emerald-50/90 text-emerald-900'
                      : 'border-[#e2e8f0] bg-[#f8fafc]',
                  )}
                >
                  <Building2 className={cn('mt-0.5 size-5 shrink-0', logoHintKind === 'new' ? 'text-emerald-600' : 'text-[#64748b]')} aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold">{logoHintKind === 'new' ? 'New logo selected' : 'Logo on file'}</p>
                    <p className="mt-0.5 text-xs opacity-95">{logoName}</p>
                  </div>
                  {logoHintKind === 'new' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        setLogoFile(null)
                        setLogoName(existingLogoUrl ? 'Logo already uploaded' : '')
                      }}
                      aria-label="Remove logo"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-[#475569]">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                className={fieldClass}
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-[#475569]">
                Instagram
              </Label>
              <Input
                id="instagram"
                className={fieldClass}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-[#475569]">
                X (Twitter)
              </Label>
              <Input id="twitter" className={fieldClass} value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/…" />
            </div>
          </div>
        )}

        {errors.form && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errors.form}</div>
        )}

        <div className="mt-2 flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" disabled={step === 1 || loading} className="h-12 rounded-xl border-[#e2e8f0] bg-white/90" onClick={() => setStep(step - 1)}>
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="h-12 min-w-[12rem] rounded-xl bg-[#059669] font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-emerald-700/25"
          >
            {isLastStep ? submitText : 'Continue'}
          </Button>
        </div>
      </div>
    </OnboardingFrame>
  )
}
