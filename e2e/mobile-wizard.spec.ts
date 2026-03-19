import { test, expect } from '@playwright/test'
import { clearPersistedState } from './helpers'

test.describe('Mobile Wizard Flow', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('mobile wizard completes full flow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Step 1: Select "Father" as the deceased
    await expect(page.getByText('Click on who passed away')).toBeVisible()
    await page.locator('button:text-is("Father")').click()

    // Follow-up: I am the deceased's Son
    await page.locator('button:text-is("Son")').click()

    // Follow-up: Is the deceased's wife alive? Yes
    await page.locator('button:text-is("Yes")').click()

    // Next via mobile bottom nav
    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    // Step 2: Immediate Family
    await expect(page.getByText('Immediate Family')).toBeVisible()

    // Add 1 more son + 1 daughter
    await page.getByRole('button', { name: 'Increase Sons' }).click()
    await page.getByRole('button', { name: 'Increase Daughters' }).click()

    // Next to Step 3
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    // Step 3: Estate inventory -> Calculate
    await page.getByRole('button', { name: 'Calculate Shares' }).click()

    // Step 5: Results
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })
  })

  test('mobile bottom nav shows Next button on steps 1-3', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Step 1: select a relationship first
    await page.locator('button:text-is("Father")').click()
    await page.locator('button:text-is("Son")').click()
    await page.locator('button:text-is("Yes")').click()

    // Next button should be visible in the fixed mobile nav
    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeVisible()
    await expect(nextButton).toBeEnabled()

    // Click Next to go to step 2
    await nextButton.click()
    await expect(page.getByText('Immediate Family')).toBeVisible()
  })

  test('mobile Calculate Shares button on step 4', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate through steps 1-3
    await page.locator('button:text-is("Father")').click()
    await page.locator('button:text-is("Son")').click()
    await page.locator('button:text-is("Yes")').click()
    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    // Step 3: Calculate Shares button should be visible
    await expect(page.getByRole('button', { name: 'Calculate Shares' })).toBeVisible()

    // Skip to Results link should also be visible
    await expect(page.getByRole('button', { name: 'Skip to Results' })).toBeVisible()
  })

  test('mobile Back button appears on steps 2+ but not step 1', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Step 1: select a relationship
    await page.locator('button:text-is("Father")').click()
    await page.locator('button:text-is("Son")').click()
    await page.locator('button:text-is("Yes")').click()

    // On step 1, Back should NOT be visible
    const backButton = page.getByRole('button', { name: 'Back' })
    await expect(backButton).not.toBeVisible()

    // Navigate to step 2
    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()
    await expect(page.getByText('Immediate Family')).toBeVisible()

    // On step 2, Back SHOULD be visible
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
  })
})
