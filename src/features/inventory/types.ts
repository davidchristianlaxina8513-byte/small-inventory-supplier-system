export type InventoryActionState = {
  status: 'idle' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

export type InventoryAction = (
  previousState: InventoryActionState,
  formData: FormData
) => Promise<InventoryActionState>
