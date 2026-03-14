import { test, expect } from '@playwright/test'
import {
  clearPersistedState,
  wizardToResults,
  goToIndividualDistribution,
  performQurah,
} from './helpers'

test.describe('Individual Distribution', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('shows view toggle with Group and Individual tabs', async ({ page }) => {
    await wizardToResults(page)
    await page.getByRole('button', { name: 'Distribute Assets' }).click()
    await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

    // Verify view toggle exists
    const tablist = page.getByRole('tablist', { name: 'Distribution view' })
    await expect(tablist).toBeVisible()

    const groupTab = page.getByRole('tab', { name: 'By Group' })
    const individualTab = page.getByRole('tab', { name: 'By Individual' })
    await expect(groupTab).toBeVisible()
    await expect(individualTab).toBeVisible()

    // Group tab selected by default
    await expect(groupTab).toHaveAttribute('aria-selected', 'true')
    await expect(individualTab).toHaveAttribute('aria-selected', 'false')
  })

  test('switches to individual view and shows heir sections', async ({ page }) => {
    await wizardToResults(page)
    await goToIndividualDistribution(page)

    // Should see heir type section groups (sons and/or daughters)
    const sections = page.locator('[role="group"]')
    expect(await sections.count()).toBeGreaterThan(0)
  })

  test('Draw Lots (Qurah) button opens ceremony overlay', async ({ page }) => {
    await wizardToResults(page)
    await goToIndividualDistribution(page)

    await page.getByRole('button', { name: 'Draw Lots (Qurah)' }).click()

    const dialog = page.getByRole('dialog', { name: /Qurah.*Ceremony/i })
    await expect(dialog).toBeVisible()

    // Bismillah header
    await expect(page.getByText('In the name of Allah')).toBeVisible()

    // Draw Lots button inside the dialog
    await expect(dialog.getByRole('button', { name: /Draw Lots/i })).toBeVisible()
  })

  test('Qurah ceremony performs draw and shows staggered reveal', async ({ page }) => {
    await wizardToResults(page)
    await goToIndividualDistribution(page)

    await page.getByRole('button', { name: 'Draw Lots (Qurah)' }).click()

    const dialog = page.getByRole('dialog', { name: /Qurah.*Ceremony/i })
    await dialog.getByRole('button', { name: /Draw Lots/i }).click()

    // Wait for reveal
    await page.waitForTimeout(2000)

    // Done button should appear after all revealed
    await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 3000 })

    // Equilibrium indicators should be visible
    const eqLabels = page.locator('[aria-label^="Equilibrium:"]')
    expect(await eqLabels.count()).toBeGreaterThan(0)

    // Close
    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).not.toBeVisible()
  })

  test('Qurah ceremony closes on Escape key', async ({ page }) => {
    await wizardToResults(page)
    await goToIndividualDistribution(page)

    await page.getByRole('button', { name: 'Draw Lots (Qurah)' }).click()
    const dialog = page.getByRole('dialog', { name: /Qurah.*Ceremony/i })
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('switching views preserves state', async ({ page }) => {
    await wizardToResults(page)
    await goToIndividualDistribution(page)

    // Perform Qurah
    await performQurah(page)

    // Switch to group view
    await page.getByRole('tab', { name: 'By Group' }).click()
    await page.waitForTimeout(300)
    await expect(page.getByText(/groups balanced/i)).toBeVisible({ timeout: 3000 })

    // Switch back to individual
    await page.getByRole('tab', { name: 'By Individual' }).click()
    await page.waitForTimeout(500)

    // Individual sections should still exist
    const sections = page.locator('[role="group"]')
    expect(await sections.count()).toBeGreaterThan(0)
  })

  test('Back to Results button navigates back', async ({ page }) => {
    await wizardToResults(page)
    await page.getByRole('button', { name: 'Distribute Assets' }).click()
    await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: 'Back to Results' }).click()
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })
  })

  test('shows balanced count in summary banner', async ({ page }) => {
    await wizardToResults(page)
    await page.getByRole('button', { name: 'Distribute Assets' }).click()
    await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

    // Group view summary
    await expect(page.getByText(/groups balanced/i)).toBeVisible({ timeout: 3000 })

    // Individual view summary
    await page.getByRole('tab', { name: 'By Individual' }).click()
    await page.waitForTimeout(500)
    await expect(page.getByText(/groups balanced/i)).toBeVisible({ timeout: 3000 })
  })
})
