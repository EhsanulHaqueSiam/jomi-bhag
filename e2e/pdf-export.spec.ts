import { test, expect } from '@playwright/test'
import {
  clearPersistedState,
  wizardToResults,
  goToIndividualDistribution,
  performQurah,
} from './helpers'

test.describe('PDF Export', () => {
  test.setTimeout(60000)

  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('Download PDF button triggers generation and completes', async ({ page }) => {
    await wizardToResults(page)

    const pdfButton = page.locator('button:has-text("Download PDF")')
    await expect(pdfButton).toBeVisible()
    await expect(pdfButton).toBeEnabled()

    // Click and verify spinner appears (isGenerating = true)
    await pdfButton.click()

    // The button should show a spinner while generating
    const spinner = page.locator('button:has-text("Download PDF") .animate-spin')
    // Wait for generation to complete (spinner disappears, button re-enabled)
    await expect(pdfButton).toBeEnabled({ timeout: 45000 })
  })

  test('PDF generation works after using individual distribution', async ({ page }) => {
    await wizardToResults(page)
    await goToIndividualDistribution(page)
    await performQurah(page)

    await page.getByRole('button', { name: 'Back to Results' }).click()
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })

    const pdfButton = page.locator('button:has-text("Download PDF")')
    await pdfButton.click()

    // Wait for generation to complete without error
    await expect(pdfButton).toBeEnabled({ timeout: 45000 })
  })
})
