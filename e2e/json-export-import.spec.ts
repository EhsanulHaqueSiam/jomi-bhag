import { test, expect } from '@playwright/test'
import {
  clearPersistedState,
  wizardToResults,
  goToIndividualDistribution,
  performQurah,
} from './helpers'

test.describe('JSON Export', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('Export JSON button triggers download', async ({ page }) => {
    await wizardToResults(page)

    // Patch URL.createObjectURL BEFORE clicking
    await page.evaluate(() => {
      const exportWindow = window as Window & { __exportedBlob?: Blob | null }
      exportWindow.__exportedBlob = null
      const orig = URL.createObjectURL.bind(URL)
      URL.createObjectURL = function (blob: Blob) {
        if (blob.type === 'application/json') {
          exportWindow.__exportedBlob = blob
        }
        return orig(blob)
      }
    })

    await page.locator('button:has-text("Export JSON")').click()
    await page.waitForTimeout(1000)

    // Read the captured blob
    const jsonContent = await page.evaluate(async () => {
      const exportWindow = window as Window & { __exportedBlob?: Blob | null }
      const blob = exportWindow.__exportedBlob ?? null
      if (!blob) return ''
      return await blob.text()
    })

    expect(jsonContent).toBeTruthy()
    const parsed = JSON.parse(jsonContent)
    expect(parsed).toHaveProperty('schemaVersion')
    expect(parsed).toHaveProperty('data')
    expect(parsed.data).toHaveProperty('relationship')
  })

  test('includes individual distribution data after Qurah', async ({ page }) => {
    await wizardToResults(page)
    await goToIndividualDistribution(page)
    await performQurah(page)

    await page.getByRole('button', { name: 'Back to Results' }).click()
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })

    await page.evaluate(() => {
      const exportWindow = window as Window & { __exportedBlob?: Blob | null }
      exportWindow.__exportedBlob = null
      const orig = URL.createObjectURL.bind(URL)
      URL.createObjectURL = function (blob: Blob) {
        if (blob.type === 'application/json') {
          exportWindow.__exportedBlob = blob
        }
        return orig(blob)
      }
    })

    await page.locator('button:has-text("Export JSON")').click()
    await page.waitForTimeout(1000)

    const jsonContent = await page.evaluate(async () => {
      const exportWindow = window as Window & { __exportedBlob?: Blob | null }
      const blob = exportWindow.__exportedBlob ?? null
      if (!blob) return ''
      return await blob.text()
    })

    const parsed = JSON.parse(jsonContent)
    expect(parsed.data).toHaveProperty('individualDistribution')
    expect(parsed.data.individualDistribution.qurahUsed).toBe(true)
  })
})

test.describe('JSON Import', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('file input accepts JSON files on step 1', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const fileInput = page.locator('input[type="file"][accept*=".json"]')
    await expect(fileInput).toBeAttached()
  })
})
