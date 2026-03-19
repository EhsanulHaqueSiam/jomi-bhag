import { test, expect } from '@playwright/test'
import { clearPersistedState, wizardToResults } from './helpers'

test.describe('Land Division', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('navigates to distribution page via Distribute Assets button', async ({ page }) => {
    await wizardToResults(page)

    await page.getByRole('button', { name: 'Distribute Assets' }).click()
    await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

    // By Group tab should be selected by default
    const groupTab = page.getByRole('tab', { name: 'By Group' })
    await expect(groupTab).toBeVisible()
    await expect(groupTab).toHaveAttribute('aria-selected', 'true')
  })

  test('shows heir group cards on distribution page', async ({ page }) => {
    await wizardToResults(page)
    await page.getByRole('button', { name: 'Distribute Assets' }).click()
    await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

    // Should see group cards with heir type labels
    // The wizard adds wife, 2 sons, 1 daughter
    await expect(page.getByRole('heading', { name: 'Wife' })).toBeVisible()
  })

  test('Randomize button reshuffles assignments without crash', async ({ page }) => {
    await wizardToResults(page)
    await page.getByRole('button', { name: 'Distribute Assets' }).click()
    await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

    // Click Randomize button
    const randomizeBtn = page.getByRole('button', { name: 'Randomize' })
    await expect(randomizeBtn).toBeVisible()
    await randomizeBtn.click()

    // Page should still show group cards (no crash)
    await expect(page.getByText('Asset Distribution')).toBeVisible()

    // Equilibrium summary should be visible
    await expect(page.getByText(/groups balanced/i)).toBeVisible({ timeout: 3000 })
  })

  test('back to results navigation works', async ({ page }) => {
    await wizardToResults(page)
    await page.getByRole('button', { name: 'Distribute Assets' }).click()
    await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: 'Back to Results' }).click()
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })
  })
})
