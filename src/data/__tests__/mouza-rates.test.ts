import { describe, test, expect } from 'vitest'
import { getMouzaRate, UPAZILA_BY_DIVISION } from '@/data/mouza-rates'
import type { Division } from '@/core/land/types'

const ALL_DIVISIONS: Division[] = [
  'dhaka', 'chittagong', 'rajshahi', 'khulna',
  'barisal', 'sylhet', 'rangpur', 'mymensingh',
]

describe('UPAZILA_BY_DIVISION', () => {
  test('covers all 8 divisions', () => {
    for (const div of ALL_DIVISIONS) {
      expect(UPAZILA_BY_DIVISION[div]).toBeDefined()
      expect(UPAZILA_BY_DIVISION[div].length).toBeGreaterThan(0)
    }
  })

  test('each division has at least 5 upazilas', () => {
    for (const div of ALL_DIVISIONS) {
      expect(UPAZILA_BY_DIVISION[div].length).toBeGreaterThanOrEqual(5)
    }
  })

  test('total upazila count is 80+', () => {
    const total = ALL_DIVISIONS.reduce(
      (sum, div) => sum + UPAZILA_BY_DIVISION[div].length,
      0,
    )
    expect(total).toBeGreaterThanOrEqual(80)
  })

  test('each upazila entry has value, label, and bangla fields', () => {
    for (const div of ALL_DIVISIONS) {
      for (const up of UPAZILA_BY_DIVISION[div]) {
        expect(up.value).toBeTruthy()
        expect(up.label).toBeTruthy()
        expect(up.bangla).toBeTruthy()
      }
    }
  })

  test('dhaka has city corp entry and savar', () => {
    const dhakaUps = UPAZILA_BY_DIVISION['dhaka'].map((u) => u.value)
    expect(dhakaUps).toContain('savar')
    expect(dhakaUps.some((v) => v.includes('city'))).toBe(true)
  })
})

describe('getMouzaRate', () => {
  test('returns positive number for valid lookup', () => {
    const rate = getMouzaRate('dhaka', 'savar', 'residential')
    expect(rate).not.toBeNull()
    expect(rate).toBeGreaterThan(0)
  })

  test('agricultural < residential < commercial for same upazila', () => {
    const agri = getMouzaRate('dhaka', 'savar', 'agricultural')!
    const resi = getMouzaRate('dhaka', 'savar', 'residential')!
    const comm = getMouzaRate('dhaka', 'savar', 'commercial')!
    expect(agri).toBeLessThan(resi)
    expect(resi).toBeLessThan(comm)
  })

  test('returns null for mixed type', () => {
    expect(getMouzaRate('dhaka', 'savar', 'mixed')).toBeNull()
  })

  test('returns null for nonexistent upazila', () => {
    expect(getMouzaRate('dhaka', 'nonexistent_upazila', 'residential')).toBeNull()
  })

  test('all 8 divisions have rate data', () => {
    for (const div of ALL_DIVISIONS) {
      const firstUpazila = UPAZILA_BY_DIVISION[div][0].value
      const rate = getMouzaRate(div, firstUpazila, 'residential')
      expect(rate).not.toBeNull()
      expect(rate).toBeGreaterThan(0)
    }
  })

  test('dhaka rates are higher than rural divisions', () => {
    const dhakaRate = getMouzaRate('dhaka', 'savar', 'residential')!
    const rangpurFirst = UPAZILA_BY_DIVISION['rangpur'][0].value
    const rangpurRate = getMouzaRate('rangpur', rangpurFirst, 'residential')!
    expect(dhakaRate).toBeGreaterThan(rangpurRate)
  })

  test('rate ordering holds for all divisions', () => {
    for (const div of ALL_DIVISIONS) {
      const firstUpazila = UPAZILA_BY_DIVISION[div][0].value
      const agri = getMouzaRate(div, firstUpazila, 'agricultural')!
      const resi = getMouzaRate(div, firstUpazila, 'residential')!
      const comm = getMouzaRate(div, firstUpazila, 'commercial')!
      expect(agri).toBeLessThan(resi)
      expect(resi).toBeLessThan(comm)
    }
  })
})
