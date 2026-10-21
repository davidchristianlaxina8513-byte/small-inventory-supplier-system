import { signOutAction } from '../actions'
import { Button } from '@/components/common/Button'

export function SignOutForm() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary">
        Sign out
      </Button>
    </form>
  )
}
