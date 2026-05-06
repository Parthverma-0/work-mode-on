export type JobType = 'internship' | 'full-time' | 'part-time' | 'freelance'
export type JobMode = 'remote' | 'onsite' | 'hybrid'

export type CompanySummary = {
  company_name: string | null
  logo_url: string | null
}

export type JobWithCompany = {
  id: string
  company_id: string
  title: string
  type: JobType | string
  description: string | null
  skills_required: string[] | null
  location: string | null
  mode: JobMode | string | null
  stipend_min: number | null
  stipend_max: number | null
  is_active: boolean | null
  posted_at: string | null
  company_profiles: CompanySummary | CompanySummary[] | null
}

export type CandidateProfileRow = {
  id: string
  user_id: string
  headline: string | null
  bio: string | null
  resume_url: string | null
  portfolio_url: string | null
  skills: string[] | null
  city: string | null
  college: string | null
  course: string | null
  graduation_year: number | null
  open_to_work: boolean | null
}

export type ApplicationStatus = 'submitted' | 'viewed' | 'shortlisted' | 'rejected'

export type ApplicationWithJob = {
  id: string
  job_id: string
  candidate_id: string
  status: ApplicationStatus | string
  cover_note: string | null
  resume_url: string | null
  applied_at: string | null
  jobs: JobWithCompany | null
}

export type CourseRow = {
  id: string
  title: string
  provider: string | null
  url: string | null
  affiliate_url: string | null
  skills_covered: string[] | null
  level: string | null
  is_featured: boolean | null
}
