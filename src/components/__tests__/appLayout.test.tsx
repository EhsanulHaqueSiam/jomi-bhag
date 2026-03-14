import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from '@/components/layout/AppLayout'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AppLayout', () => {
  it('renders header with "Jomi-Bhag" and "Islamic Inheritance Calculator"', () => {
    render(
      <AppLayout page="wizard" onNavigate={() => {}}>
        <div>content</div>
      </AppLayout>,
    )

    expect(screen.getByText('Jomi-Bhag')).toBeInTheDocument()
    expect(screen.getByText('Islamic Inheritance Calculator')).toBeInTheDocument()
  })

  it('desktop nav shows Calculator and My Scenarios buttons', () => {
    render(
      <AppLayout page="wizard" onNavigate={() => {}}>
        <div>content</div>
      </AppLayout>,
    )

    const desktopNav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(desktopNav).toBeInTheDocument()
    expect(desktopNav.querySelector('button')).not.toBeNull()

    // Both buttons exist somewhere in desktop nav
    const buttons = desktopNav.querySelectorAll('button')
    const buttonTexts = Array.from(buttons).map((b) => b.textContent?.trim())
    expect(buttonTexts).toContain('Calculator')
    expect(buttonTexts).toContain('My Scenarios')
  })

  it('mobile nav renders Calculator and My Scenarios', () => {
    render(
      <AppLayout page="wizard" onNavigate={() => {}}>
        <div>content</div>
      </AppLayout>,
    )

    const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation' })
    expect(mobileNav).toBeInTheDocument()

    const buttons = mobileNav.querySelectorAll('button')
    const buttonTexts = Array.from(buttons).map((b) => b.textContent?.trim())
    expect(buttonTexts).toContain('Calculator')
    expect(buttonTexts).toContain('My Scenarios')
  })

  it('click Calculator button calls onNavigate("wizard")', () => {
    const onNavigate = vi.fn()

    render(
      <AppLayout page="scenarios" onNavigate={onNavigate}>
        <div>content</div>
      </AppLayout>,
    )

    // Use the desktop nav Calculator button
    const desktopNav = screen.getByRole('navigation', { name: 'Main navigation' })
    const calcButton = Array.from(desktopNav.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Calculator',
    )!

    fireEvent.click(calcButton)
    expect(onNavigate).toHaveBeenCalledWith('wizard')
  })

  it('click My Scenarios button calls onNavigate("scenarios")', () => {
    const onNavigate = vi.fn()

    render(
      <AppLayout page="wizard" onNavigate={onNavigate}>
        <div>content</div>
      </AppLayout>,
    )

    const desktopNav = screen.getByRole('navigation', { name: 'Main navigation' })
    const scenButton = Array.from(desktopNav.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'My Scenarios',
    )!

    fireEvent.click(scenButton)
    expect(onNavigate).toHaveBeenCalledWith('scenarios')
  })

  it('active page gets emerald text styling', () => {
    render(
      <AppLayout page="wizard" onNavigate={() => {}}>
        <div>content</div>
      </AppLayout>,
    )

    const desktopNav = screen.getByRole('navigation', { name: 'Main navigation' })
    const calcButton = Array.from(desktopNav.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Calculator',
    )!
    const scenButton = Array.from(desktopNav.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'My Scenarios',
    )!

    // Active tab should have text-emerald-700
    expect(calcButton.className).toContain('text-emerald-700')
    // Inactive tab should NOT
    expect(scenButton.className).not.toContain('text-emerald-700')
  })

  it('children are rendered inside main content area', () => {
    render(
      <AppLayout page="wizard" onNavigate={() => {}}>
        <div data-testid="child-content">Hello World</div>
      </AppLayout>,
    )

    const child = screen.getByTestId('child-content')
    expect(child).toBeInTheDocument()
    expect(child.textContent).toBe('Hello World')

    // Should be inside main tag
    const main = document.querySelector('main')
    expect(main).not.toBeNull()
    expect(main!.contains(child)).toBe(true)
  })
})
