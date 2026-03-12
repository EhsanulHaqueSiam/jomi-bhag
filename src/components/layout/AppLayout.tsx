import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
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
      </header>

      {/* Main content area */}
      <main className="relative px-4 pb-24 md:mx-auto md:max-w-lg md:pb-8 lg:max-w-xl">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
