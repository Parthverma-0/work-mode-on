'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JobForm } from '@/components/company/JobForm'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useCompany } from '@/hooks/useCompany'
import type { JobRow } from '@/lib/company-types'
import { supabase } from '@/lib/supabase'

export default function EditCompanyJobPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const { user } = useAuth()
  const { company, loading: companyLoading } = useCompany(user?.id)
  const [job, setJob] = useState<JobRow | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)

  useEffect(() => {
    if (!id || !company?.id) {
      if (!companyLoading) setLoadingJob(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingJob(true)
      const { data, error } = await supabase
        .from('jobs')
        .select(
          'id, company_id, title, type, description, skills_required, location, mode, stipend_min, stipend_max, is_active, posted_at',
        )
        .eq('id', id)
        .maybeSingle()
      if (cancelled) return
      if (error || !data || data.company_id !== company.id) {
        setJob(null)
      } else {
        setJob(data as JobRow)
      }
      setLoadingJob(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id, company?.id, companyLoading])

  if (companyLoading || loadingJob) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-4">
        <Skeleton className="h-10 w-48 rounded-lg bg-gray-100" />
        <Skeleton className="h-[520px] w-full rounded-xl bg-gray-100" />
      </div>
    )
  }

  if (!company || !job) {
    return <p className="py-10 text-center text-sm text-[#6B7280]">Job not found or access denied.</p>
  }

  return (
    <div className="py-4">
      <h1 className="mb-6 text-2xl font-semibold text-[#0A0A0A]">Edit job</h1>
      <JobForm companyProfileId={company.id} mode="edit" initial={job} />
    </div>
  )
}
