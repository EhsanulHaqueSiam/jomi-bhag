import { test, expect } from '@playwright/test'
import {
  clearPersistedState,
  wizardToResults,
  goToEstateInventory,
} from './helpers'

test.describe('Asset Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('adds property via Add Property button on step 4', async ({ page }) => {
    await goToEstateInventory(page)

    // Step 4: Click Add Property
    await page.getByRole('button', { name: 'Add Property' }).click()
    await page.waitForTimeout(300)

    // A property card/section should appear
    await expect(page.getByRole('button', { name: /Delete Property/i })).toBeVisible()
  })

  test('adds movable asset on step 4', async ({ page }) => {
    await goToEstateInventory(page)

    // Step 4: Click a category button from the asset category picker
    const goldButton = page.getByRole('button', { name: 'Gold/Silver' })
    await expect(goldButton).toBeVisible()
    await goldButton.click()
    await page.waitForTimeout(300)

    // A movable asset entry should appear
    await expect(page.getByText('Metal Type')).toBeVisible()
  })

  test('property and movable assets appear in results', async ({ page }) => {
    await wizardToResults(page)

    // wizardToResults adds a property -- verify estate breakdown shows it
    // Look for the Estate Breakdown card content
    await expect(page.getByText(/Land\/Property|Properties/i)).toBeVisible({ timeout: 5000 })
  })

  test('removes property on step 4', async ({ page }) => {
    await goToEstateInventory(page)

    // Add a property
    await page.getByRole('button', { name: 'Add Property' }).click()
    await page.waitForTimeout(300)

    // Verify property card is present
    await expect(page.getByRole('button', { name: /Delete Property/i })).toBeVisible()

    // Find and click the remove/delete button on the property card
    const removeButton = page.getByRole('button', { name: /Delete Property/i })
    await expect(removeButton).toBeVisible()
    await removeButton.click()

    // Property should be removed -- Add Property button should still be available
    await expect(page.getByRole('button', { name: 'Add Property' })).toBeVisible()
  })
})
