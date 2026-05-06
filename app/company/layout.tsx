import { CompanyPortalShell } from '@/components/company/CompanyPortalShell'

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <CompanyPortalShell>{children}</CompanyPortalShell>
}
