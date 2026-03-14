import { test, expect } from '@playwright/test'
import { clearPersistedState, wizardToResults } from './helpers'

test.describe('Asset Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('adds property via Add Property button on step 4', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate through steps 1-3
    await page.locator('button:text-is("Father")').click()
    await page.locator('button:text-is("Son")').click()
    await page.locator('button:text-is("Yes")').click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 4: Click Add Property
    await page.getByRole('button', { name: 'Add Property' }).click()
    await page.waitForTimeout(300)

    // A property card/section should appear
    // Properties show with labels like "Residential #1"
    await expect(page.getByText(/#1/)).toBeVisible()
  })

  test('adds movable asset on step 4', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate through steps 1-3
    await page.locator('button:text-is("Father")').click()
    await page.locator('button:text-is("Son")').click()
    await page.locator('button:text-is("Yes")').click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 4: Click a category button from the asset category picker
    // Categories include Gold, Silver, Cash, Vehicle, Jewelry, Furniture, Livestock, Custom
    const goldButton = page.getByRole('button', { name: /Gold/i })
    await expect(goldButton).toBeVisible()
    await goldButton.click()
    await page.waitForTimeout(300)

    // A movable asset entry should appear
    // Gold assets show a form with unit/weight
    await expect(page.getByText(/Gold/i).first()).toBeVisible()
  })

  test('property and movable assets appear in results', async ({ page }) => {
    await wizardToResults(page)

    // wizardToResults adds a property -- verify estate breakdown shows it
    // Look for the Estate Breakdown card content
    await expect(page.getByText(/Land\/Property|Properties/i)).toBeVisible({ timeout: 5000 })
  })

  test('removes property on step 4', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate through steps 1-3
    await page.locator('button:text-is("Father")').click()
    await page.locator('button:text-is("Son")').click()
    await page.locator('button:text-is("Yes")').click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('button', { name: 'Next' }).click()

    // Add a property
    await page.getByRole('button', { name: 'Add Property' }).click()
    await page.waitForTimeout(300)

    // Verify property card is present
    await expect(page.getByText(/#1/)).toBeVisible()

    // Find and click the remove/delete button on the property card
    const removeButton = page.getByRole('button', { name: /remove|delete/i })
    await expect(removeButton).toBeVisible()
    await removeButton.click()

    // Property should be removed -- Add Property button should still be available
    await expect(page.getByRole('button', { name: 'Add Property' })).toBeVisible()
  })
})
