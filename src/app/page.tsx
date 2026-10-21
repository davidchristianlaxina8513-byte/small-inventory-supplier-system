import { redirect } from 'next/navigation'
import { canAccessApplication } from '@/features/auth/lib/accountStatus'
import { getSessionProfile } from '@/features/auth/services/session'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const profile = await getSessionProfile()

  if (!profile) redirect('/login')
  redirect(canAccessApplication(profile.status) ? '/dashboard' : '/account-status')
}
