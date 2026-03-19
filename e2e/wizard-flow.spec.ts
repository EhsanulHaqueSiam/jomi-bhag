import { test, expect } from '@playwright/test'
import {
  clearPersistedState,
  wizardToResults,
  goToEstateInventory,
} from './helpers'

test.describe('Wizard Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('completes wizard and shows inheritance results', async ({ page }) => {
    await goToEstateInventory(page, { addExtraChildren: true })

    // Step 3: Calculate
    await page.getByRole('button', { name: 'Calculate Shares' }).click()

    // Step 4: Results
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })

    // Verify heir cards are shown (use heading role to avoid ambiguity)
    await expect(page.getByRole('heading', { name: 'Wife' })).toBeVisible()
  })

  test('adds property and shows Distribute Assets button', async ({ page }) => {
    await wizardToResults(page)
    await expect(page.getByRole('button', { name: 'Distribute Assets' })).toBeVisible()
  })
})
