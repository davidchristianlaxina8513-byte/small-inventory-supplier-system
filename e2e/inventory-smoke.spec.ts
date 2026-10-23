import { expect, test } from '@playwright/test'

const adminEmail = process.env.MIDTERM_ADMIN_EMAIL
const adminPassword = process.env.MIDTERM_ADMIN_PASSWORD

test('admin can create an item, receive stock, issue stock, and view the ledger', async ({
  page,
}) => {
  test.skip(!adminEmail || !adminPassword, 'Set MIDTERM_ADMIN_EMAIL and MIDTERM_ADMIN_PASSWORD.')
  test.setTimeout(120_000)
  const suffix = Date.now().toString(36)
  const categoryName = `SMOKE Cat ${suffix}`
  const locationName = `SMOKE Loc ${suffix}`
  const itemCode = `SMOKE-${suffix}`

  await page.goto('/login')
  await page.getByLabel('Email address').fill(adminEmail!)
  await page.getByLabel('Password').fill(adminPassword!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 })
  await expect(page.getByRole('link', { name: 'Inventory', exact: true })).toBeVisible()

  await page.getByRole('link', { name: 'Inventory', exact: true }).click()
  await expect(page).toHaveURL(/\/inventory$/, { timeout: 30_000 })
  await expect(page.getByRole('heading', { name: 'Items and stock' })).toBeVisible()
  await page.getByRole('link', { name: 'Categories' }).click()
  await expect(page.getByRole('heading', { name: 'Categories', exact: true })).toBeVisible()
  await page.locator('#new-category-name').fill(categoryName)
  await page.getByRole('button', { name: 'Add category' }).click()
  await expect(page.getByRole('status')).toHaveText('Created successfully.', { timeout: 30_000 })
  await expect(page.getByRole('heading', { name: categoryName })).toBeVisible()

  await page.goto('/inventory/locations')
  await page.locator('#new-location-name').fill(locationName)
  await page.getByRole('button', { name: 'Add location' }).click()
  await expect(page.getByRole('status')).toHaveText('Created successfully.', { timeout: 30_000 })
  await expect(page.getByRole('heading', { name: locationName })).toBeVisible()

  await page.goto('/inventory/new')
  await page.getByLabel('Item code').fill(itemCode)
  await page.getByLabel('Name').fill(`Smoke Item ${suffix}`)
  await page.getByLabel('Category').selectOption({ label: categoryName })
  await page.getByLabel('Unit of measure').fill('piece')
  await page.getByLabel('Tracking type').selectOption('quantity_stock')
  await page.getByLabel('Reorder level (optional)').fill('1')
  await page.getByRole('button', { name: 'Create item' }).click()
  await expect(page).toHaveURL(/\/inventory\/[0-9a-f-]+\?success=created$/, { timeout: 30_000 })
  await expect(page.getByText('Created successfully.')).toBeVisible()

  await page.locator('#movement-location').selectOption({ label: locationName })
  await page.locator('#movement-quantity').fill('5')
  await page.locator('#movement-reason').fill('Initial smoke receipt')
  await page.getByRole('button', { name: 'Record movement' }).click()
  await expect(page).toHaveURL(/\?success=movement$/, { timeout: 30_000 })
  await expect(page.getByText('Stock movement recorded.')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Stock in (receipt)' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Initial smoke receipt' })).toBeVisible()
  await expect(page.getByText('5 piece').first()).toBeVisible()

  await page.locator('#movement-type').selectOption('issue')
  await page.locator('#movement-location').selectOption({ label: locationName })
  await page.locator('#movement-quantity').fill('2')
  await page.locator('#movement-reason').fill('Smoke workflow issue')
  await page.getByRole('button', { name: 'Record movement' }).click()
  await expect(page).toHaveURL(/\?success=movement$/, { timeout: 30_000 })
  await expect(page.getByText('Stock movement recorded.')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Stock out (issue)' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Smoke workflow issue' })).toBeVisible()
  await expect(page.getByText('3 piece').first()).toBeVisible()
})
