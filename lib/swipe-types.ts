import type { JobWithCompany } from '@/lib/candidate-types'
import type { CandidateProfileLite, CandidateSearchRow, ProfileLite } from '@/lib/company-types'

export type JobCompanyProfile = {
  company_name: string | null
  industry: string | null
  logo_url: string | null
}

export type SwipeJob = Omit<JobWithCompany, 'company_profiles'> & {
  company_profiles: JobCompanyProfile | JobCompanyProfile[] | null
}

export type SwipeCandidate = CandidateSearchRow

/**
 * One card in the company's applicant-review deck — a single application
 * (one card per applied job) the company hasn't decided on yet.
 */
export type SwipeApplicant = {
  /** application id — unique per card */
  id: string
  jobId: string
  jobTitle: string | null
  status: string
  coverNote: string | null
  candidate: CandidateProfileLite
  profile: ProfileLite | null
}

export type SwipeDirection = 'left' | 'right'

export type OverlayVariant = 'job' | 'candidate'
