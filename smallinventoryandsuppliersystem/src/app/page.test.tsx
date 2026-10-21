import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './page'

test('renders the starter heading', () => {
  render(<HomePage />)
  expect(screen.getByRole('heading', { name: 'Your starter is running' })).toBeInTheDocument()
})
