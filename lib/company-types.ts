export type JobType = 'internship' | 'full-time' | 'part-time' | 'freelance'
export type JobMode = 'remote' | 'onsite' | 'hybrid'

export type CompanyProfileRow = {
  id: string
  user_id: string
  company_name: string | null
  industry: string | null
  website: string | null
  about: string | null
  logo_url: string | null
  city: string | null
  social_links: string[] | null
}

export type JobRow = {
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
}

export type JobWithApplicantCount = JobRow & { applicant_count?: number }

export type ApplicationStatus = 'submitted' | 'viewed' | 'shortlisted' | 'rejected'

export type CandidateProfileLite = {
  id: string
  user_id: string
  headline: string | null
  skills: string[] | null
  college: string | null
  graduation_year: number | null
  resume_url: string | null
  portfolio_url: string | null
  city: string | null
  course: string | null
  open_to_work: boolean | null
  bio: string | null
}

export type ProfileLite = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export type ApplicationWithDetails = {
  id: string
  job_id: string
  candidate_id: string
  status: ApplicationStatus | string
  cover_note: string | null
  resume_url: string | null
  applied_at: string | null
  jobs: { title: string } | null
  candidate_profiles: CandidateProfileLite | null
  profiles?: ProfileLite | null
}

export type CandidateSearchRow = CandidateProfileLite & {
  profiles: ProfileLite | ProfileLite[] | null
}

export type MessageRow = {
  id: string
  sender_id: string
  receiver_id: string
  job_id: string | null
  content: string
  is_read: boolean | null
  sent_at: string | null
}

export type ConversationSummary = {
  partnerUserId: string
  partnerName: string
  partnerAvatar: string | null
  lastPreview: string
  lastAt: string
  unread: number
  jobId: string | null
  jobTitle: string | null
}
