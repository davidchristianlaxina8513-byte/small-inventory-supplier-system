const SUCCESS_MESSAGES: Record<string, string> = {
  created: 'Created successfully.',
  updated: 'Updated successfully.',
  activated: 'Activated successfully.',
  deactivated: 'Deactivated successfully.',
  movement: 'Stock movement recorded.',
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'The request was invalid. Refresh and try again.',
  'not-found': 'The selected record no longer exists.',
  unauthorized: 'You are not authorized to manage this office.',
  failed: 'The change could not be saved.',
}

type InventoryNoticeProps = {
  success?: string
  error?: string
}

export function InventoryNotice({ success, error }: InventoryNoticeProps) {
  if (success) {
    return (
      <p
        role="status"
        className="rounded-control border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      >
        {SUCCESS_MESSAGES[success] ?? 'Saved successfully.'}
      </p>
    )
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-control border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        {ERROR_MESSAGES[error] ?? 'The change could not be saved.'}
      </p>
    )
  }

  return null
}
