import { expect, test } from '@playwright/test'

test('redirects unauthenticated visitors to sign in', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('keeps the health endpoint public', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
})
