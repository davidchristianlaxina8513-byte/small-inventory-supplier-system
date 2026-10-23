import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'

const evidenceDirectory = path.resolve('docs/midterm/screenshots')
const adminEmail = process.env.MIDTERM_ADMIN_EMAIL
const adminPassword = process.env.MIDTERM_ADMIN_PASSWORD
const studentEmail = process.env.MIDTERM_STUDENT_EMAIL
const studentPassword = process.env.MIDTERM_STUDENT_PASSWORD

async function screenshot(page: Page, filename: string) {
  await page.screenshot({ path: path.join(evidenceDirectory, filename), fullPage: true })
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 })
}

test('captures the genuine admin API and category evidence', async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'Set MIDTERM_ADMIN_EMAIL and MIDTERM_ADMIN_PASSWORD.')
  test.setTimeout(120_000)

  const suffix = Date.now().toString(36)
  const createdName = `IT305 Evidence Category ${suffix}`
  const editedName = `${createdName} Edited`

  await page.goto('/login')
  await screenshot(page, '01-login.png')

  await signIn(page, adminEmail!, adminPassword!)
  await expect(page.getByRole('heading', { name: /Welcome,/ })).toBeVisible()
  await screenshot(page, '02-admin-dashboard.png')

  const healthRequest = page.waitForResponse(
    (response) => response.url().endsWith('/api/health') && response.request().method() === 'GET'
  )
  await page.reload()
  const response = await healthRequest
  expect(response.status()).toBe(200)
  expect(await response.json()).toEqual({ status: 'ok' })
  await expect(page.getByRole('status')).toHaveText('System API Online')
  await screenshot(page, '03-api-status-online.png')

  await page.goto('/api/health')
  await expect(page.locator('body')).toContainText('"status":"ok"')
  await screenshot(page, '04-api-response.png')

  await page.goto('/inventory/categories')
  await expect(page.getByRole('heading', { name: 'Categories', exact: true })).toBeVisible()
  await screenshot(page, '05-category-before-create.png')

  await page.locator('#new-category-name').fill(createdName)
  await page.getByRole('button', { name: 'Add category' }).click()
  await expect(page.getByRole('status')).toHaveText('Created successfully.', { timeout: 30_000 })
  const category = page.getByRole('listitem').filter({ hasText: createdName })
  await expect(category).toBeVisible()
  await screenshot(page, '06-category-after-create.png')

  await category.getByLabel('Category name').fill(editedName)
  await category.getByRole('button', { name: 'Save category' }).click()
  await expect(page.getByRole('status')).toHaveText('Updated successfully.', { timeout: 30_000 })
  const editedCategory = page.getByRole('listitem').filter({ hasText: editedName })
  await expect(editedCategory).toBeVisible()
  await screenshot(page, '07-category-after-edit.png')

  await editedCategory.getByLabel('Active category').uncheck()
  await editedCategory.getByRole('button', { name: 'Save category' }).click()
  await expect(page.getByRole('status')).toHaveText('Updated successfully.', { timeout: 30_000 })
  await expect(page.getByRole('listitem').filter({ hasText: editedName })).toContainText('Inactive')
  await screenshot(page, '08-category-after-deactivation.png')
})

test('captures server-enforced student rejection from the admin route', async ({ page }) => {
  test.skip(
    !studentEmail || !studentPassword,
    'Set student evidence account environment variables.'
  )
  test.setTimeout(60_000)

  await signIn(page, studentEmail!, studentPassword!)
  const response = await page.goto('/admin/users')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'This page could not be found.' })).toBeVisible()
  await screenshot(page, '09-student-access-denied.png')
})
