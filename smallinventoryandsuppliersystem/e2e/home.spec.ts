import { expect, test } from '@playwright/test'

test('loads the starter', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Your starter is running' })).toBeVisible()
})
