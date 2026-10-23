import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ItemForm } from './ItemForm'

const action = async () => ({ status: 'idle' as const })

const offices = [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Property Custodian Office' }]
const categories = [
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    officeId: offices[0].id,
    officeName: offices[0].name,
    name: 'Supplies',
    isActive: true,
  },
]

describe('ItemForm', () => {
  it('renders catalog fields without a quantity-on-hand field', () => {
    render(
      <ItemForm
        action={action}
        mode="create"
        offices={offices}
        categories={categories}
        cancelHref="/inventory"
      />
    )

    expect(screen.getByLabelText('Item code')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Unit of measure')).toBeInTheDocument()
    expect(screen.getByLabelText('Tracking type')).toBeInTheDocument()
    expect(screen.getByLabelText(/reorder level/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/quantity on hand/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^quantity$/i)).not.toBeInTheDocument()
  })

  it('shows the office name when only one office is available', () => {
    render(
      <ItemForm
        action={action}
        mode="create"
        offices={offices}
        categories={categories}
        cancelHref="/inventory"
      />
    )

    expect(screen.getByText('Property Custodian Office')).toBeInTheDocument()
  })
})
