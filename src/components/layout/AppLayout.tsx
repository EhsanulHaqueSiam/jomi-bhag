import type { ReactNode } from 'react'
import type { AppPage } from '@/types/scenario'

interface AppLayoutProps {
  children: ReactNode
  page: AppPage
  onNavigate: (page: AppPage) => void
}

export function AppLayout({ children, page, onNavigate }: AppLayoutProps) {
  const isWide = page === 'distribution' || page === 'division'

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Subtle Islamic geometric pattern background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="relative px-4 py-6 text-center md:py-8">
        <h1 className="text-2xl font-bold text-emerald-800 md:text-3xl">
          Jomi-Bhag
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Islamic Inheritance Calculator
        </p>

        {/* Desktop navigation tabs */}
        <nav className="mt-4 hidden justify-center gap-6 md:flex" aria-label="Main navigation">
          <button
            type="button"
            onClick={() => onNavigate('wizard')}
            className={`relative pb-1 text-sm font-medium transition-colors ${
              page === 'wizard'
                ? 'text-emerald-700'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            Calculator
            {page === 'wizard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('scenarios')}
            className={`relative pb-1 text-sm font-medium transition-colors ${
              page === 'scenarios'
                ? 'text-emerald-700'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            My Scenarios
            {page === 'scenarios' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-600" />
            )}
          </button>
        </nav>
      </header>

      {/* Main content area */}
      <main
        className={`relative px-4 pb-32 md:mx-auto md:pb-8 ${
          isWide
            ? 'md:max-w-5xl md:px-6 lg:max-w-7xl lg:px-8'
            : 'md:max-w-lg lg:max-w-xl'
        }`}
      >
        <div
          className={
            isWide
              ? 'p-0 md:p-4'
              : 'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-8'
          }
        >
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white md:hidden"
        aria-label="Mobile navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          type="button"
          onClick={() => onNavigate('wizard')}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
            page === 'wizard' ? 'text-emerald-700' : 'text-gray-500'
          }`}
        >
          {/* Calculator icon */}
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zM6 13a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
          Calculator
        </button>
        <button
          type="button"
          onClick={() => onNavigate('scenarios')}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
            page === 'scenarios' ? 'text-emerald-700' : 'text-gray-500'
          }`}
        >
          {/* Folder/bookmark icon */}
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          My Scenarios
        </button>
      </nav>
    </div>
  )
}
