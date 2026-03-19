import { type Page, expect } from '@playwright/test'

/**
 * Clear persisted Zustand state so each test starts fresh.
 * Must be called before navigating to the app.
 */
export async function clearPersistedState(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear()
    localStorage.setItem('jomi-bhag-lang', 'en')
  })
}

interface EstateStepOptions {
  addExtraChildren?: boolean
}

/**
 * Navigate through relationship/family steps and land on Estate Inventory.
 */
export async function goToEstateInventory(
  page: Page,
  options: EstateStepOptions = {},
) {
  const { addExtraChildren = false } = options

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.locator('button:text-is("Father")').click()
  await expect(page.getByText("I am the deceased's...")).toBeVisible()

  await page.locator('button:text-is("Son")').click()
  await expect(page.getByText("Is the deceased's wife (your mother) alive?")).toBeVisible()

  await page.locator('button:text-is("Yes")').click()

  const nextButton = page.getByRole('button', { name: 'Next' })
  await expect(nextButton).toBeEnabled()
  await nextButton.click()

  if (addExtraChildren) {
    await page.getByRole('button', { name: 'Increase Sons' }).click()
    await page.getByRole('button', { name: 'Increase Daughters' }).click()
  }

  await expect(nextButton).toBeEnabled()
  await nextButton.click()

  await expect(page.getByRole('button', { name: 'Calculate Shares' })).toBeVisible()
}

/**
 * Complete the wizard to reach Results page.
 * Scenario: Father died, user is son, 1 wife (auto), 2 sons (1 auto + 1), 1 daughter.
 * Adds one property.
 */
export async function wizardToResults(page: Page) {
  await goToEstateInventory(page, { addExtraChildren: true })

  // Step 3: Estate inventory
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
