import { test, expect, type Page } from '@playwright/test'
import { clearPersistedState, wizardToResults } from './helpers'

async function openScenariosPage(page: Page, isMobile: boolean) {
  const nav = page.getByRole('navigation', {
    name: isMobile ? 'Mobile navigation' : 'Main navigation',
  })
  await nav.getByRole('button', { name: 'My Scenarios', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Save Current' })).toBeVisible()
}

async function openCalculatorPage(page: Page, isMobile: boolean) {
  const nav = page.getByRole('navigation', {
    name: isMobile ? 'Mobile navigation' : 'Main navigation',
  })
  await nav.getByRole('button', { name: 'Calculator', exact: true }).click()
  await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })
}

test.describe('Scenario Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('saves and loads a scenario', async ({ page, isMobile }) => {
    await wizardToResults(page)

    // Navigate to My Scenarios
    await openScenariosPage(page, isMobile)

    // Click Save Current button
    await page.getByRole('button', { name: 'Save Current' }).click()

    // Verify scenario card appears with "Scenario saved!" confirmation
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // A scenario card should be visible
    await expect(page.getByRole('button', { name: 'Load' })).toBeVisible()

    // Click Load to load the scenario -- should navigate back to wizard
    await page.getByRole('button', { name: 'Load' }).click()

    // Should navigate to calculator page
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })
  })

  test('renames a scenario', async ({ page, isMobile }) => {
    await wizardToResults(page)

    // Navigate to My Scenarios and save
    await openScenariosPage(page, isMobile)
    await page.getByRole('button', { name: 'Save Current' }).click()
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // Scenario name button opens inline rename input
    const renameTrigger = page.locator('button[title="Click to rename"]').first()
    await expect(renameTrigger).toBeVisible()
    await renameTrigger.click()

    // The rename input should appear
    const renameInput = page.getByTestId('rename-input')
    await expect(renameInput).toBeVisible({ timeout: 3000 })

    // Clear and type new name
    await renameInput.fill('My Custom Scenario Name')

    // Blur to save
    await renameInput.blur()
    await page.waitForTimeout(300)

    // Verify new name appears
    await expect(page.getByText('My Custom Scenario Name')).toBeVisible()
  })

  test('deletes a scenario', async ({ page, isMobile }) => {
    await wizardToResults(page)

    // Navigate to My Scenarios and save
    await openScenariosPage(page, isMobile)
    await page.getByRole('button', { name: 'Save Current' }).click()
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // Click delete button on the scenario card
    await page.getByRole('button', { name: 'Delete' }).click()

    // Confirmation should appear
    await expect(page.getByText('Delete this scenario?')).toBeVisible()

    // Click Confirm to delete
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.waitForTimeout(300)

    // Scenario should be removed -- empty state should appear
    await expect(page.getByText('No saved scenarios')).toBeVisible()
  })

  test('compares two scenarios', async ({ page, isMobile }) => {
    // Save first scenario
    await wizardToResults(page)

    await openScenariosPage(page, isMobile)
    await page.getByRole('button', { name: 'Save Current' }).click()
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // Go back to calculator to create a different scenario
    await openCalculatorPage(page, isMobile)

    // Save current state again (same config but different save)
    await openScenariosPage(page, isMobile)
    await page.getByRole('button', { name: 'Save Current' }).click()
    await page.waitForTimeout(500)

    // Should now have 2 scenario cards with checkboxes for selection
    const checkboxes = page.getByRole('checkbox')
    const checkboxCount = await checkboxes.count()
    expect(checkboxCount).toBeGreaterThanOrEqual(2)

    // Select both scenarios
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()

    // Compare button should appear
    const compareButton = page.getByRole('button', { name: /Compare/i })
    await expect(compareButton).toBeVisible()
    await compareButton.click()

    // Comparison view should be visible
    await expect(page.getByText('Comparing')).toBeVisible({ timeout: 5000 })
  })
})
