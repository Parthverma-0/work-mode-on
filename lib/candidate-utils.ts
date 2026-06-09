import { formatDistanceToNowStrict } from 'date-fns'

export function formatPostedAgo(postedAt: string | null): string {
  if (!postedAt) return 'Recently posted'
  try {
    return `${formatDistanceToNowStrict(new Date(postedAt), { addSuffix: false })} ago`
  } catch {
    return 'Recently posted'
  }
}

export function formatStipend(min: number | null, max: number | null): string {
  if (min != null && max != null) return `₹${min.toLocaleString('en-IN')}–₹${max.toLocaleString('en-IN')}/month`
  if (min != null) return `₹${min.toLocaleString('en-IN')}/month`
  if (max != null) return `₹${max.toLocaleString('en-IN')}/month`
  return 'Not disclosed'
}

export function normalizeCompany(job: { company_profiles?: unknown }): {
  company_name: string | null
  logo_url: string | null
  industry: string | null
} {
  const fallback = { company_name: null, logo_url: null, industry: null }
  const cp = job.company_profiles
  if (!cp) return fallback
  const obj = (Array.isArray(cp) ? cp[0] : cp) as Record<string, unknown> | undefined
  if (!obj) return fallback
  return {
    company_name: (obj.company_name as string | null) ?? null,
    logo_url: (obj.logo_url as string | null) ?? null,
    industry: (obj.industry as string | null) ?? null,
  }
}

export function profileCompletionPercent(row: {
  headline: string | null
  bio: string | null
  skills: string[] | null
  resume_url: string | null
  portfolio_url: string | null
  college: string | null
}): number {
  const checks = [
    Boolean(row.headline?.trim()),
    Boolean(row.bio?.trim()),
    Boolean(row.skills?.length),
    Boolean(row.resume_url),
    Boolean(row.portfolio_url?.trim()),
    Boolean(row.college?.trim()),
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
}
