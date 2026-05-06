'use client'

import { JobForm } from '@/components/company/JobForm'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useCompany } from '@/hooks/useCompany'

export default function NewCompanyJobPage() {
  const { user } = useAuth()
  const { company, loading } = useCompany(user?.id)

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-4">
        <Skeleton className="h-10 w-48 rounded-lg bg-gray-100" />
        <Skeleton className="h-[520px] w-full rounded-xl bg-gray-100" />
      </div>
    )
  }

  if (!company) {
    return <p className="py-10 text-center text-sm text-[#6B7280]">Company profile not found.</p>
  }

  return (
    <div className="py-4">
      <h1 className="mb-6 text-2xl font-semibold text-[#0A0A0A]">Post a job</h1>
      <JobForm companyProfileId={company.id} mode="new" />
    </div>
  )
}
