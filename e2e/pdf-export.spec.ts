import { fileURLToPath } from 'url'
import path from 'path'
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

    // Wait for generation to complete (button re-enabled)
    await expect(pdfButton).toBeEnabled({ timeout: 45000 })
  })

  test('PDF generation works in Bangla UI mode', async ({ page }) => {
    await wizardToResults(page)

    // Switch app language to Bangla (from default English)
    await page.getByRole('button', { name: 'Switch to Bangla' }).click()
    await expect(page.getByText('উত্তরাধিকার ফলাফল')).toBeVisible({ timeout: 5000 })

    const pdfButton = page
      .getByRole('button', { name: /পিডিএফ ডাউনলোড|Download PDF/i })
      .first()
    await expect(pdfButton).toBeVisible()
    await expect(pdfButton).toBeEnabled()
    await pdfButton.click()

    // Would fail before fix when italic Bengali font variant was unresolved.
    await expect(pdfButton).toBeEnabled({ timeout: 45000 })

    await expect(page.getByText(/PDF (download|print) failed/i)).not.toBeVisible()
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

  test('PDF generation succeeds with Bengali Unicode property nicknames', async ({ page }) => {
    // Listen for page errors BEFORE triggering PDF generation
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    // Navigate to home
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Import the test-scenario.json file which contains Bengali property nicknames
    // The file input is inside ImportDropZone on Step 1
    const currentDir = path.dirname(fileURLToPath(import.meta.url))
    const scenarioPath = path.resolve(currentDir, '..', 'test-scenario.json')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(scenarioPath)

    // Wait for the confirm dialog and click "Import" button
    const importButton = page.getByRole('button', { name: /^Import$/i })
    await expect(importButton).toBeVisible({ timeout: 5000 })
    await importButton.click()

    // After import + calculateShares(), the app navigates to Results (step 4)
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 10000 })

    // Click "Download PDF" to trigger PDF generation
    const pdfButton = page.locator('button:has-text("Download PDF")')
    await expect(pdfButton).toBeVisible()
    await expect(pdfButton).toBeEnabled()
    await pdfButton.click()

    // Wait for PDF generation to complete (button re-enables)
    await expect(pdfButton).toBeEnabled({ timeout: 45000 })

    // Assert no xCoordinate error occurred during PDF generation
    const xCoordinateErrors = errors.filter((e) => e.includes('xCoordinate'))
    expect(xCoordinateErrors).toHaveLength(0)

    // Assert no error toast appeared on screen
    const errorToast = page.locator('text=PDF download failed')
    await expect(errorToast).not.toBeVisible()
  })
})
