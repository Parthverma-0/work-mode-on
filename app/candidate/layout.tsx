import { CandidatePortalShell } from '@/components/candidate/CandidatePortalShell'

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <CandidatePortalShell>{children}</CandidatePortalShell>
}
