export type AccountStatus = 'pending' | 'active' | 'suspended'

export function canAccessApplication(status: AccountStatus | null | undefined): status is 'active' {
  return status === 'active'
}

export function describeAccountStatus(status: AccountStatus): string {
  switch (status) {
    case 'pending':
      return 'Your account is waiting for an administrator to approve it.'
    case 'suspended':
      return 'Your account is suspended. Contact an administrator if you believe this is a mistake.'
    case 'active':
      return 'Your account is active.'
  }
}
