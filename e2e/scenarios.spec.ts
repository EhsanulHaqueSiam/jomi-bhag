import { test, expect } from '@playwright/test'
import { clearPersistedState, wizardToResults } from './helpers'

test.describe('Scenario Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('saves and loads a scenario', async ({ page }) => {
    await wizardToResults(page)

    // Navigate to My Scenarios
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await nav.getByText('My Scenarios').click()
    await page.waitForTimeout(300)

    // Click Save Current button
    await page.getByRole('button', { name: 'Save Current' }).click()

    // Verify scenario card appears with "Scenario saved!" confirmation
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // A scenario card should be visible
    await expect(page.getByText('Load')).toBeVisible()

    // Click Load to load the scenario -- should navigate back to wizard
    await page.getByText('Load').click()

    // Should navigate to calculator page
    await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })
  })

  test('renames a scenario', async ({ page }) => {
    await wizardToResults(page)

    // Navigate to My Scenarios and save
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await nav.getByText('My Scenarios').click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Save Current' }).click()
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // Find the scenario name and click it to edit (inline rename)
    const scenarioNameEl = page.locator('[data-testid="rename-input"], [data-testid="scenario-name"]').first()

    // The name should be clickable for inline edit
    // Find the auto-generated scenario name and click it
    const nameLink = page.locator('h3, [role="heading"]').filter({ hasText: /Scenario|Father|2.*son/i }).first()
    await nameLink.click()

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

  test('deletes a scenario', async ({ page }) => {
    await wizardToResults(page)

    // Navigate to My Scenarios and save
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await nav.getByText('My Scenarios').click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Save Current' }).click()
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // Click delete button on the scenario card
    await page.getByText('Delete').click()

    // Confirmation should appear
    await expect(page.getByText('Delete this scenario?')).toBeVisible()

    // Click Confirm to delete
    await page.getByText('Confirm').click()
    await page.waitForTimeout(300)

    // Scenario should be removed -- empty state should appear
    await expect(page.getByText('No saved scenarios')).toBeVisible()
  })

  test('compares two scenarios', async ({ page }) => {
    // Save first scenario
    await wizardToResults(page)

    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await nav.getByText('My Scenarios').click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Save Current' }).click()
    await expect(page.getByText('Scenario saved!')).toBeVisible({ timeout: 3000 })

    // Go back to calculator to create a different scenario
    await nav.getByText('Calculator').click()
    await page.waitForTimeout(300)

    // Save current state again (same config but different save)
    await nav.getByText('My Scenarios').click()
    await page.waitForTimeout(300)
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
