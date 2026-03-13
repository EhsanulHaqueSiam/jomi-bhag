import { describe, it, expect, beforeEach } from 'vitest'
import Fraction from 'fraction.js'

// We test the replacer/reviver through fractionStorage's getItem/setItem
// which internally uses JSON.stringify/parse with the custom replacer/reviver
import { fractionStorage } from '@/stores/fractionStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('fractionStorage replacer', () => {
  it('serializes Fraction(1,3) to tagged object', async () => {
    const data = { state: { value: new Fraction(1, 3) }, version: 1 }
    fractionStorage!.setItem('test', data)
    const raw = localStorage.getItem('test')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.state.value).toEqual({ __frac__: '1/3' })
  })

  it('serializes Fraction(0) correctly', () => {
    const data = { state: { value: new Fraction(0) }, version: 1 }
    fractionStorage!.setItem('test', data)
    const raw = localStorage.getItem('test')
    const parsed = JSON.parse(raw!)
    expect(parsed.state.value).toEqual({ __frac__: '0' })
  })
})

describe('fractionStorage reviver', () => {
  it('deserializes tagged object back to Fraction', async () => {
    const original = { state: { value: new Fraction(1, 3) }, version: 1 }
    fractionStorage!.setItem('test', original)
    const result = await fractionStorage!.getItem('test')
    expect(result).not.toBeNull()
    expect(result!.state.value).toBeInstanceOf(Fraction)
    expect((result!.state.value as unknown as Fraction).equals(new Fraction(1, 3))).toBe(true)
  })
})

describe('fractionStorage round-trip', () => {
  const edgeCases = [
    { label: 'Fraction(0)', frac: new Fraction(0), expected: '0' },
    { label: 'Fraction(1,2)', frac: new Fraction(1, 2), expected: '1/2' },
    { label: 'Fraction(2,3)', frac: new Fraction(2, 3), expected: '2/3' },
    { label: 'Fraction(-1,4)', frac: new Fraction(-1, 4), expected: '-1/4' },
  ]

  for (const { label, frac } of edgeCases) {
    it(`round-trips ${label} correctly`, async () => {
      const data = { state: { value: frac }, version: 1 }
      fractionStorage!.setItem('test', data)
      const result = await fractionStorage!.getItem('test')
      expect(result!.state.value).toBeInstanceOf(Fraction)
      expect((result!.state.value as unknown as Fraction).equals(frac)).toBe(true)
    })
  }
})

describe('non-Fraction passthrough', () => {
  it('string values pass through unchanged', async () => {
    const data = { state: { name: 'hello' }, version: 1 }
    fractionStorage!.setItem('test', data)
    const result = await fractionStorage!.getItem('test')
    expect(result!.state.name).toBe('hello')
  })

  it('number values pass through unchanged', async () => {
    const data = { state: { count: 42 }, version: 1 }
    fractionStorage!.setItem('test', data)
    const result = await fractionStorage!.getItem('test')
    expect(result!.state.count).toBe(42)
  })

  it('null values pass through unchanged', async () => {
    const data = { state: { empty: null }, version: 1 }
    fractionStorage!.setItem('test', data)
    const result = await fractionStorage!.getItem('test')
    expect(result!.state.empty).toBeNull()
  })

  it('array values pass through unchanged', async () => {
    const data = { state: { items: [1, 2, 3] }, version: 1 }
    fractionStorage!.setItem('test', data)
    const result = await fractionStorage!.getItem('test')
    expect(result!.state.items).toEqual([1, 2, 3])
  })
})

describe('deeply nested Fraction', () => {
  it('round-trips correctly', async () => {
    const data = {
      state: {
        results: {
          shares: [
            { totalShare: new Fraction(1, 6), sharePerHeir: new Fraction(1, 6) },
            { totalShare: new Fraction(1, 3), sharePerHeir: new Fraction(1, 6) },
          ],
          totalBeforeAdjustment: new Fraction(1, 1),
        },
      },
      version: 1,
    }
    fractionStorage!.setItem('test', data)
    const result = await fractionStorage!.getItem('test')
    const shares = result!.state.results.shares as Array<{ totalShare: Fraction; sharePerHeir: Fraction }>
    expect(shares[0].totalShare).toBeInstanceOf(Fraction)
    expect(shares[0].totalShare.equals(new Fraction(1, 6))).toBe(true)
    expect(shares[1].sharePerHeir.equals(new Fraction(1, 6))).toBe(true)
    expect((result!.state.results as { totalBeforeAdjustment: Fraction }).totalBeforeAdjustment.equals(new Fraction(1))).toBe(true)
  })
})
