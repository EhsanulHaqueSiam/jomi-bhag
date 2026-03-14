import { type Page, expect } from '@playwright/test'

/**
 * Clear persisted Zustand state so each test starts fresh.
 * Must be called before navigating to the app.
 */
export async function clearPersistedState(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear()
  })
}

/**
 * Complete the wizard to reach Results page.
 * Scenario: Father died, user is son, 1 wife (auto), 2 sons (1 auto + 1), 1 daughter.
 * Adds one property.
 */
export async function wizardToResults(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Step 1: Select "Father" as the deceased
  await page.locator('button:text-is("Father")').click()
  // Follow-up: I am the deceased's Son
  await page.locator('button:text-is("Son")').click()
  // Follow-up: Is the deceased's wife alive? Yes
  await page.locator('button:text-is("Yes")').click()

  // Next to Step 2
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 2: Add 1 more son + 1 daughter
  await page.getByRole('button', { name: 'Increase Sons' }).click()
  await page.getByRole('button', { name: 'Increase Daughters' }).click()

  // Next to Step 3
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 3: Siblings - skip
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 4: Add a property
  await page.getByRole('button', { name: 'Add Property' }).click()
  await page.waitForTimeout(300)

  // Calculate
  await page.getByRole('button', { name: 'Calculate Shares' }).click()
  await expect(page.getByText('Inheritance Results')).toBeVisible({ timeout: 5000 })
}

/**
 * From Results page, navigate to Distribution and switch to individual view.
 */
export async function goToIndividualDistribution(page: Page) {
  await page.getByRole('button', { name: 'Distribute Assets' }).click()
  await expect(page.getByText('Asset Distribution')).toBeVisible({ timeout: 5000 })

  await page.getByRole('tab', { name: 'By Individual' }).click()
  await page.waitForTimeout(500)
}

/**
 * Perform Qurah ceremony inside individual distribution view.
 */
export async function performQurah(page: Page) {
  await page.getByRole('button', { name: 'Draw Lots (Qurah)' }).click()

  const dialog = page.getByRole('dialog', { name: /Qurah.*Ceremony/i })
  await expect(dialog).toBeVisible()

  await dialog.getByRole('button', { name: /Draw Lots/i }).click()

  // Wait for staggered reveal
  await page.waitForTimeout(2000)

  // Close ceremony
  await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible({ timeout: 3000 })
  await dialog.getByRole('button', { name: 'Done' }).click()
  await expect(dialog).not.toBeVisible()
}
