import { test, expect } from '@playwright/test'
import { clearPersistedState, wizardToResults } from './helpers'

test.describe('Wizard Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('completes wizard and shows inheritance results', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Step 1: Select "Father" as the deceased
    await expect(page.getByText('Click on who passed away')).toBeVisible()
    await page.locator('button:text-is("Father")').click()

    // Follow-up: I am the deceased's Son
    await page.locator('button:text-is("Son")').click()

    // Follow-up: Is the deceased's wife alive? Yes
    await page.locator('button:text-is("Yes")').click()

    // Next to Step 2
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 2: Immediate Family
    await expect(page.getByText('Immediate Family')).toBeVisible()

    // Add 1 more son + 1 daughter
    await page.getByRole('button', { name: 'Increase Sons' }).click()
    await page.getByRole('button', { name: 'Increase Daughters' }).click()

    // Next to Step 3
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 3: skip
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 4: Calculate
    await page.getByRole('button', { name: 'Calculate Shares' }).click()

    // Step 5: Results
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })

    // Verify heir cards are shown (use heading role to avoid ambiguity)
    await expect(page.getByRole('heading', { name: 'Wife' })).toBeVisible()
  })

  test('adds property and shows Distribute Assets button', async ({ page }) => {
    await wizardToResults(page)
    await expect(page.getByRole('button', { name: 'Distribute Assets' })).toBeVisible()
  })
})
