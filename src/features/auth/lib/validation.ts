export type CredentialErrors = {
  email?: string
  password?: string
}

export type RegistrationErrors = {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  schoolId?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCredentials(email: string, password: string): CredentialErrors {
  const errors: CredentialErrors = {}
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    errors.email = 'Enter your email address.'
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Enter your password.'
  }

  return errors
}

export function validateRegistration(data: {
  fullName: string
  email: string
  password: string
  confirmPassword?: string
  schoolId?: string
}): RegistrationErrors {
  const errors: RegistrationErrors = {}
  const fullName = data.fullName.trim()
  const email = data.email.trim()
  const password = data.password
  const confirmPassword = data.confirmPassword

  if (!fullName) {
    errors.fullName = 'Enter your full name.'
  } else if (fullName.length < 2 || fullName.length > 160) {
    errors.fullName = 'Full name must be between 2 and 160 characters.'
  }

  if (!email) {
    errors.email = 'Enter your email address.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Enter a password.'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (data.schoolId && data.schoolId.trim().length > 64) {
    errors.schoolId = 'School ID cannot exceed 64 characters.'
  }

  return errors
}
