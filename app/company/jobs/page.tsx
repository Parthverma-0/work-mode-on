'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { JobCard } from '@/components/company/JobCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { useCompany } from '@/hooks/useCompany'
import { useCompanyJobs } from '@/hooks/useCompanyJobs'

export default function CompanyJobsPage() {
  const { user } = useAuth()
  const { company, loading: companyLoading } = useCompany(user?.id)
  const { jobs, loading: jobsLoading, refresh } = useCompanyJobs(company?.id)
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all')

  const filtered = useMemo(() => {
    if (tab === 'active') return jobs.filter((j) => j.is_active !== false)
    if (tab === 'inactive') return jobs.filter((j) => j.is_active === false)
    return jobs
  }, [jobs, tab])

  const loading = companyLoading || jobsLoading

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">My job listings</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Manage visibility, applicants, and edits.</p>
        </div>
        <Button className="shrink-0 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]" asChild>
          <Link href="/company/jobs/new">
            <Plus className="mr-2 size-4" aria-hidden />
            Post new job
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
        <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-xl bg-[#F3F4F6] p-1">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white">
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white">
            Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="rounded-lg data-[state=active]:bg-white">
            Inactive
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 outline-none">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="rounded-xl border border-gray-100 border-dashed bg-[#FAFAFA] shadow-none">
              <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                <p className="text-sm text-[#6B7280]">
                  {tab === 'all'
                    ? 'No jobs posted yet.'
                    : tab === 'active'
                      ? 'No active listings.'
                      : 'No inactive listings.'}
                </p>
                {tab === 'all' ? (
                  <Button className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]" asChild>
                    <Link href="/company/jobs/new">Post your first job</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} onUpdated={() => refresh()} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
