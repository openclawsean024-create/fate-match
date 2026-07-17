import { describe, it, expect } from 'vitest'
import { calcBazi, calcWuxingBalance } from './bazi'

describe('bazi.ts — calcBazi', () => {
  it('returns 4 pillars for valid date', () => {
    const result = calcBazi('1990-01-01T12:00:00')
    expect(result.year).toHaveLength(2)
    expect(result.month).toHaveLength(2)
    expect(result.day).toHaveLength(2)
    expect(result.hour).toHaveLength(2)
  })

  it('year pillar is from HEAVENLY_STEMS + EARTHLY_BRANCHES', () => {
    const result = calcBazi('2024-01-01T12:00:00')
    const validStems = '甲乙丙丁戊己庚辛壬癸'
    const validBranches = '子丑寅卯辰巳午未申酉戌亥'
    expect(validStems).toContain(result.year[0])
    expect(validBranches).toContain(result.year[1])
  })

  it('handles year boundary (Dec 31 vs Jan 1)', () => {
    const dec = calcBazi('2023-12-31T12:00:00')
    const jan = calcBazi('2024-01-01T12:00:00')
    expect(dec.year).not.toBe(jan.year)
  })

  it('handles leap year Feb 29', () => {
    const result = calcBazi('2024-02-29T12:00:00')
    expect(result.year).toHaveLength(2)
  })
})

describe('bazi.ts — calcWuxingBalance', () => {
  it('returns 5-element map with all keys', () => {
    const result = calcWuxingBalance('甲子')
    expect(result).toHaveProperty('木')
    expect(result).toHaveProperty('火')
    expect(result).toHaveProperty('土')
    expect(result).toHaveProperty('金')
    expect(result).toHaveProperty('水')
  })

  it('counts stem + branch correctly', () => {
    // 甲子 = 木(甲) + 水(子)
    const result = calcWuxingBalance('甲子')
    expect(result.木).toBe(1)
    expect(result.水).toBe(1)
    expect(result.火).toBe(0)
  })

  it('falls back to 土 for unknown chars', () => {
    const result = calcWuxingBalance('X?')
    // X and ? are not in STEM_WUXING/BRANCH_WUXING, should fallback to 土 (×2)
    expect(result.土).toBe(2)
  })
})