'use client'

import { Upload } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { useCompany } from '@/hooks/useCompany'
import { uploadCompanyLogo } from '@/lib/upload-logo-client'
import { supabase } from '@/lib/supabase'

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Media',
  'Other',
]

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const { company, loading, refresh } = useCompany(user?.id)

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [city, setCity] = useState('')
  const [website, setWebsite] = useState('')
  const [about, setAbout] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [savingBasic, setSavingBasic] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)

  useEffect(() => {
    if (!company) return
    setCompanyName(company.company_name ?? '')
    setIndustry(company.industry ?? '')
    setCity(company.city ?? '')
    setWebsite(company.website ?? '')
    setAbout(company.about ?? '')
    setLogoPreview(company.logo_url)
    const links = Array.isArray(company.social_links) ? company.social_links : []
    setLinkedin(links.find((l) => String(l).toLowerCase().includes('linkedin')) ?? '')
    setInstagram(links.find((l) => String(l).toLowerCase().includes('instagram')) ?? '')
    setTwitter(
      links.find((l) => {
        const x = String(l).toLowerCase()
        return x.includes('twitter') || x.includes('x.com')
      }) ?? '',
    )
  }, [company])

  async function persistRow() {
    if (!user?.id) return
    let logoUrl = company?.logo_url ?? null
    if (logoFile) {
      logoUrl = await uploadCompanyLogo(logoFile, user.id)
      setLogoFile(null)
    }
    const social_links = [linkedin, instagram, twitter].filter((s) => s.trim())
    const { error } = await supabase.from('company_profiles').upsert(
      {
        user_id: user.id,
        company_name: companyName.trim(),
        industry: industry.trim(),
        city: city.trim(),
        website: website.trim(),
        logo_url: logoUrl,
        about: about.slice(0, 500),
        social_links,
      },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    setLogoPreview(logoUrl)
  }

  async function saveBasic() {
    if (!user?.id) return
    setSavingBasic(true)
    try {
      await persistRow()
      toast.success('Saved ✓')
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSavingBasic(false)
    }
  }

  async function saveAbout() {
    if (!user?.id) return
    setSavingAbout(true)
    try {
      await persistRow()
      toast.success('Saved ✓')
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSavingAbout(false)
    }
  }

  async function saveSocial() {
    if (!user?.id) return
    setSavingSocial(true)
    try {
      await persistRow()
      toast.success('Saved ✓')
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSavingSocial(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <Skeleton className="h-10 w-56 rounded-lg bg-gray-100" />
        <Skeleton className="h-64 w-full rounded-xl bg-gray-100" />
      </div>
    )
  }

  if (!company && user) {
    return <p className="py-10 text-center text-sm text-[#6B7280]">Company profile not found.</p>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Company profile</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Update how candidates see your brand.</p>
      </div>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Basic info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#FAFAFA]">
              {logoPreview ? (
                <Image src={logoPreview} alt="" fill className="object-cover" sizes="96px" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#9CA3AF]">Logo</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <label className="flex cursor-pointer flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#FAFAFA]">
                  <Upload className="size-4" aria-hidden />
                  Upload square image
                </span>
                <input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setLogoFile(f)
                      setLogoPreview(URL.createObjectURL(f))
                    }
                  }}
                />
              </label>
              <p className="text-xs text-[#9CA3AF]">Stored at logos/{'{'}user_id{'}'}/logo — public URL.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="co-name">Company name</Label>
            <Input
              id="co-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              list="industry-options"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="rounded-lg border-gray-200"
              placeholder="e.g. Technology"
            />
            <datalist id="industry-options">
              {INDUSTRIES.map((i) => (
                <option key={i} value={i} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-lg border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="web">Website URL</Label>
            <Input
              id="web"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="rounded-lg border-gray-200"
              placeholder="https://"
            />
          </div>

          <Button
            type="button"
            disabled={savingBasic}
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            onClick={() => saveBasic()}
          >
            {savingBasic ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between gap-2">
            <Label htmlFor="about">Tell candidates your story</Label>
            <span className="text-xs text-[#9CA3AF]">{about.length}/500</span>
          </div>
          <Textarea
            id="about"
            rows={6}
            maxLength={500}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="resize-y rounded-lg border-gray-200"
          />
          <Button
            type="button"
            disabled={savingAbout}
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            onClick={() => saveAbout()}
          >
            {savingAbout ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Social links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="li">LinkedIn</Label>
            <Input
              id="li"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="rounded-lg border-gray-200"
              placeholder="https://linkedin.com/company/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ig">Instagram</Label>
            <Input
              id="ig"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="rounded-lg border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tw">Twitter / X</Label>
            <Input
              id="tw"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="rounded-lg border-gray-200"
            />
          </div>
          <Button
            type="button"
            disabled={savingSocial}
            className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
            onClick={() => saveSocial()}
          >
            {savingSocial ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
