import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Button } from './Button'

test('renders an accessible disabled button', () => {
  render(<Button disabled>Save</Button>)
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
})
