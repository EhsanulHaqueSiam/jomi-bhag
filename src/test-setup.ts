import '@testing-library/jest-dom/vitest'

// Node 25+ ships a native localStorage stub that lacks clear/getItem/setItem methods.
// Vitest's jsdom environment sets up a proper Storage implementation, but the native
// one can shadow it. Ensure the jsdom Storage is used everywhere.
if (
  typeof globalThis.localStorage !== 'undefined' &&
  typeof globalThis.localStorage.clear !== 'function'
) {
  // The jsdom environment installs a proper Storage on window.
  // If window.localStorage has the correct API, copy it to globalThis.
  // Otherwise create a simple in-memory implementation.
  const storage = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return storage.size
    },
    clear() {
      storage.clear()
    },
    getItem(key: string) {
      return storage.get(key) ?? null
    },
    key(index: number) {
      return [...storage.keys()][index] ?? null
    },
    removeItem(key: string) {
      storage.delete(key)
    },
    setItem(key: string, value: string) {
      storage.set(key, value)
    },
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    writable: true,
    configurable: true,
  })
}
