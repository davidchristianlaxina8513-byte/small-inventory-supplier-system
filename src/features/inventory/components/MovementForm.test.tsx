import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MovementForm } from './MovementForm'

const action = async () => ({ status: 'idle' as const })

const locations = [
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    officeId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    officeName: 'Property Custodian Office',
    name: 'Main Storage',
    isActive: true,
  },
]

describe('MovementForm', () => {
  it('offers only receipts and issues to office staff', () => {
    render(
      <MovementForm
        action={action}
        itemId="dddddddd-dddd-4ddd-8ddd-dddddddddddd"
        locations={locations}
        canAdjust={false}
      />
    )

    expect(screen.getByLabelText('Movement type')).toBeInTheDocument()
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Reason')).toBeInTheDocument()
    expect(screen.getByLabelText('Reference (optional)')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /adjustment in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /adjustment out/i })).not.toBeInTheDocument()
  })

  it('offers adjustments to office heads and admins', () => {
    render(
      <MovementForm
        action={action}
        itemId="dddddddd-dddd-4ddd-8ddd-dddddddddddd"
        locations={locations}
        canAdjust
      />
    )

    expect(screen.getByRole('option', { name: /adjustment in/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /adjustment out/i })).toBeInTheDocument()
  })
})
