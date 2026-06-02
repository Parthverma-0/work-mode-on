import type { JobWithCompany } from '@/lib/candidate-types'
import type { CandidateSearchRow } from '@/lib/company-types'

export type JobCompanyProfile = {
  company_name: string | null
  industry: string | null
  logo_url: string | null
}

export type SwipeJob = JobWithCompany & {
  company_profiles: JobCompanyProfile | JobCompanyProfile[] | null
}

export type SwipeCandidate = CandidateSearchRow

export type SwipeDirection = 'left' | 'right'

export type OverlayVariant = 'job' | 'candidate'
