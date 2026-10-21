import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import type { SignInState } from '../actions'

test('renders accessible sign-in fields and preserves the next destination', () => {
  render(<LoginForm next="/admin/users" />)

  expect(screen.getByLabelText('Email address')).toHaveAttribute('autocomplete', 'username')
  expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password')
  expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  expect(screen.getByDisplayValue('/admin/users')).toHaveAttribute('type', 'hidden')
})

test('shows a server error without clearing the email address', async () => {
  const action = vi.fn(
    async (): Promise<SignInState> => ({
      error: 'Sign-in failed. Check your email address and password.',
      email: 'staff@school.test',
    })
  )

  render(<LoginForm action={action} />)
  fireEvent.change(screen.getByLabelText('Email address'), {
    target: { value: 'staff@school.test' },
  })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Sign-in failed. Check your email address and password.'
  )
  expect(screen.getByLabelText('Email address')).toHaveValue('staff@school.test')
  expect(action).toHaveBeenCalledOnce()
})

test('shows field-level validation errors returned by the action', async () => {
  const action = vi.fn(
    async (): Promise<SignInState> => ({
      fieldErrors: { email: 'Enter a valid email address.' },
      email: 'nope',
    })
  )

  render(<LoginForm action={action} />)
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'nope' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
  expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true')
})
