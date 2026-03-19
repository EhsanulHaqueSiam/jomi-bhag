import { test, expect } from '@playwright/test'
import { clearPersistedState } from './helpers'

test.describe('App Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('shows Jomi-Bhag header and calculator page by default', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Jomi-Bhag')).toBeVisible()
    await expect(page.getByText('Islamic Inheritance Calculator')).toBeVisible()
  })

  test('desktop nav tabs switch between Calculator and My Scenarios', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop navigation is hidden on mobile viewport')
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Desktop nav should have Calculator and My Scenarios
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    await expect(nav.getByText('Calculator')).toBeVisible()
    await expect(nav.getByText('My Scenarios')).toBeVisible()

    // Click My Scenarios
    await nav.getByText('My Scenarios').click()
    await page.waitForTimeout(300)

    // Click Calculator to go back
    await nav.getByText('Calculator').click()
    await page.waitForTimeout(300)

    // Should see wizard
    await expect(page.getByText('Click on who passed away')).toBeVisible()
  })
})

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // iPhone 14 size

  test.beforeEach(async ({ page }) => {
    await clearPersistedState(page)
  })

  test('shows bottom navigation bar on mobile', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(mobileNav).toBeVisible()
    await expect(mobileNav.getByText('Calculator')).toBeVisible()
    await expect(mobileNav.getByText('My Scenarios')).toBeVisible()
  })

  test('mobile nav switches pages', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' })

    // Go to My Scenarios
    await mobileNav.getByText('My Scenarios').click()
    await page.waitForTimeout(300)

    // Go back to Calculator
    await mobileNav.getByText('Calculator').click()
    await page.waitForTimeout(300)

    await expect(page.getByText('Click on who passed away')).toBeVisible()
  })
})
