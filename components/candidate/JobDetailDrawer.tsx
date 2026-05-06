'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useIsMobile } from '@/components/ui/use-mobile'
import { cn } from '@/lib/utils'
import type { JobWithCompany } from '@/lib/candidate-types'
import { formatPostedAgo, formatStipend, normalizeCompany } from '@/lib/candidate-utils'

type JobDetailDrawerProps = {
  job: JobWithCompany | null
  open: boolean
  onOpenChange: (open: boolean) => void
  readOnly?: boolean
  hasApplied?: boolean
  onApply?: () => void
}

export function JobDetailDrawer({
  job,
  open,
  onOpenChange,
  readOnly,
  hasApplied,
  onApply,
}: JobDetailDrawerProps) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const company = job ? normalizeCompany(job) : { company_name: null, logo_url: null }

  const body = job ? (
    <>
      <div className="flex gap-4 border-b border-gray-100 pb-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
          {company.logo_url ? (
            <Image src={company.logo_url} alt="" fill className="object-cover" sizes="56px" unoptimized />
          ) : (
            <div className="flex size-full items-center justify-center text-sm font-semibold text-[#6B7280]">
              {(company.company_name ?? '?').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#6B7280]">{company.company_name}</p>
          <h2 className="text-xl font-semibold tracking-tight text-[#0A0A0A]">{job.title}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="rounded-md bg-[#F3F4F6] font-normal text-[#374151]">{job.type}</Badge>
            <Badge className="rounded-md bg-[#EEF2FF] font-normal text-[#4338CA]">{job.mode ?? '—'}</Badge>
            {job.location && (
              <Badge variant="outline" className="rounded-md font-normal">
                {job.location}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-[50vh] min-h-[120px] pr-3 md:max-h-[calc(100vh-280px)]">
        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Description
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
              {job.description ?? 'No description provided.'}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Skills required
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(job.skills_required ?? []).length ? (
                job.skills_required!.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[#F9FAFB] px-3 py-1 text-xs font-medium text-[#374151] ring-1 ring-gray-100"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[#9CA3AF]">Not specified</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Compensation</p>
              <p className="mt-1 font-medium text-[#0A0A0A]">
                {formatStipend(job.stipend_min, job.stipend_max)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Posted</p>
              <p className="mt-1 font-medium text-[#0A0A0A]">{formatPostedAgo(job.posted_at)}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  ) : null

  const footer =
    !readOnly && job && onApply ? (
      <Button
        type="button"
        disabled={hasApplied}
        onClick={() => onApply()}
        className={cn(
          'min-h-11 w-full rounded-lg font-medium',
          hasApplied ? 'bg-[#ECFDF5] text-[#047857] hover:bg-[#ECFDF5]' : 'bg-[#4F46E5] hover:bg-[#4338CA]',
        )}
      >
        {hasApplied ? 'Applied ✓' : 'Apply Now'}
      </Button>
    ) : readOnly ? (
      <p className="text-center text-xs text-[#6B7280]">Application submitted — read only</p>
    ) : null

  if (!mounted) return null

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] rounded-t-2xl border border-gray-100 bg-white px-4 pb-6">
          <DrawerHeader className="text-left">
            <DrawerTitle className="sr-only">Job details</DrawerTitle>
          </DrawerHeader>
          {body}
          {footer && <DrawerFooter className="pt-2">{footer}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-gray-100 bg-white p-6 sm:max-w-lg"
      >
        <SheetHeader className="space-y-0 p-0 text-left">
          <SheetTitle className="sr-only">Job details</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
        {footer && <SheetFooter className="mt-auto border-t border-gray-100 p-0 pt-4">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}
