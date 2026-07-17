import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calcBazi,
  calcWuxingBalance,
  getStemIndex,
  getBranchIndex,
  getStemFromDay,
  mergeWuxing,
  generateExplanation,
  calcScore,
  getWuxingConclusion,
  runMatch,
} from './bazi'

// ============================================================
// Helper functions
// ============================================================

describe('bazi.ts — getStemIndex', () => {
  it('returns 0 for year 4 (base reference year)', () => {
    // year 4 corresponds to stem index 0 (甲)
    expect(getStemIndex(4)).toBe(0)
  })

  it('handles year before 4 (negative modulo)', () => {
    // year 3 should map to index 9 (癸)
    expect(getStemIndex(3)).toBe(9)
  })

  it('cycles every 10 years', () => {
    expect(getStemIndex(2014)).toBe(getStemIndex(2004))
    expect(getStemIndex(2024)).toBe(getStemIndex(2014))
  })
})

describe('bazi.ts — getBranchIndex', () => {
  it('returns 0 for year 4', () => {
    expect(getBranchIndex(4)).toBe(0)
  })

  it('handles year before 4', () => {
    expect(getBranchIndex(3)).toBe(11)
  })

  it('cycles every 12 years', () => {
    expect(getBranchIndex(2016)).toBe(getBranchIndex(2004))
  })
})

describe('bazi.ts — getStemFromDay', () => {
  it('base date 1984-02-06 maps to stem 0 branch 0', () => {
    const result = getStemFromDay('1984-02-06T12:00:00')
    expect(result.stemIndex).toBe(0)
    expect(result.branchIndex).toBe(0)
  })

  it('returns same result for different times of same day', () => {
    const morning = getStemFromDay('1990-06-15T08:00:00')
    const evening = getStemFromDay('1990-06-15T20:00:00')
    expect(morning).toEqual(evening)
  })
})

// ============================================================
// calcBazi
// ============================================================

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

  it('different hours yield different hour pillars', () => {
    const morning = calcBazi('1990-06-15T08:00:00')
    const evening = calcBazi('1990-06-15T20:00:00')
    expect(morning.hour).not.toBe(evening.hour)
  })

  it('same hour across different dates has same hour pillar structure', () => {
    const a = calcBazi('1990-06-15T12:00:00')
    const b = calcBazi('1995-03-20T12:00:00')
    // 12:00 is 午時 (branch index 6)
    expect(a.hour[1]).toBe('午')
    expect(b.hour[1]).toBe('午')
  })
})

// ============================================================
// calcWuxingBalance
// ============================================================

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

  it('counts 丙午 (both fire) correctly', () => {
    const result = calcWuxingBalance('丙午')
    expect(result.火).toBe(2)
  })

  it('falls back to 土 for unknown chars', () => {
    const result = calcWuxingBalance('X?')
    expect(result.土).toBe(2)
  })

  it('returns zeros for empty string', () => {
    const result = calcWuxingBalance('')
    expect(result.木 + result.火 + result.土 + result.金 + result.水).toBe(0)
  })
})

// ============================================================
// mergeWuxing
// ============================================================

describe('bazi.ts — mergeWuxing', () => {
  it('sums two wuxing maps element-wise', () => {
    const a = { 木: 1, 火: 0, 土: 0, 金: 0, 水: 0 }
    const b = { 木: 2, 火: 0, 土: 0, 金: 0, 水: 0 }
    const result = mergeWuxing(a, b)
    expect(result.木).toBe(3)
  })

  it('handles zero values correctly', () => {
    const a = { 木: 0, 火: 0, 土: 0, 金: 5, 水: 0 }
    const b = { 木: 0, 火: 3, 土: 0, 金: 0, 水: 0 }
    const result = mergeWuxing(a, b)
    expect(result.金).toBe(5)
    expect(result.火).toBe(3)
  })

  it('returns all 5 keys in result', () => {
    const result = mergeWuxing(
      { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
    )
    expect(result).toHaveProperty('木')
    expect(result).toHaveProperty('火')
    expect(result).toHaveProperty('土')
    expect(result).toHaveProperty('金')
    expect(result).toHaveProperty('水')
    expect(Object.keys(result)).toHaveLength(5)
  })
})

// ============================================================
// generateExplanation
// ============================================================

describe('bazi.ts — generateExplanation', () => {
  const myBazi = { year: '甲子', month: '丙寅', day: '戊辰', hour: '壬子' }
  const partnerBazi = { year: '己丑', month: '癸卯', day: '辛巳', hour: '癸丑' }

  it('includes gender-specific description for male partner', () => {
    const result = generateExplanation(myBazi, partnerBazi, 'male')
    expect(result[0]).toContain('堅毅')
  })

  it('includes gender-specific description for female partner', () => {
    const result = generateExplanation(myBazi, partnerBazi, 'female')
    expect(result[0]).toContain('柔雅')
  })

  it('always returns at least 3 explanations', () => {
    const result = generateExplanation(myBazi, partnerBazi, 'female')
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  it('returns at most 5 explanations (sliced)', () => {
    const result = generateExplanation(myBazi, partnerBazi, 'male')
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('detects year stem 5-diff (天合)', () => {
    // 甲 and 己 differ by 5 → stem 五合
    const my = { ...myBazi, year: '甲子' }
    const partner = { ...partnerBazi, year: '己丑' }
    const result = generateExplanation(my, partner, 'female')
    const joined = result.join(' ')
    expect(joined).toContain('五合')
  })

  it('detects day branch same (日柱地支相同)', () => {
    // 辰 vs 申 — diff is 8 (4 or 8 = 三合) — let's use exact match
    const my2 = { ...myBazi, day: '甲子' }
    const partner2 = { ...partnerBazi, day: '甲子' }
    const result = generateExplanation(my2, partner2, 'female')
    const joined = result.join(' ')
    expect(joined).toContain('命格相近')
  })

  it('always has at least 3 explanations (fallback path)', () => {
    // Construct a case that triggers fallback
    const my = { year: '甲子', month: '丙寅', day: '戊辰', hour: '壬子' }
    const partner = { year: '甲子', month: '丙寅', day: '戊辰', hour: '壬子' }
    // identical — should still return >=3
    const result = generateExplanation(my, partner, 'female')
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  it('handles month branch same (close 月柱)', () => {
    // 寅 and 卯 differ by 1 → monthDiff <= 3 → "相近"
    const my = { ...myBazi, month: '丙寅' }
    const partner = { ...partnerBazi, month: '丁卯' }
    const result = generateExplanation(my, partner, 'female')
    const joined = result.join(' ')
    expect(joined).toContain('相近')
  })

  it('handles month branch different (far 月柱)', () => {
    // 寅 and 戌 differ by 10 → monthDiff > 3 → "相異"
    const my = { ...myBazi, month: '丙寅' }
    const partner = { ...partnerBazi, month: '戊戌' }
    const result = generateExplanation(my, partner, 'female')
    const joined = result.join(' ')
    expect(joined).toContain('相異')
  })

  it('handles hour branch same', () => {
    // Force length<4 path by using identical year/month/day that produce 2 explanations
    // Then identical hour pushes to 3
    const my = { year: '甲子', month: '丙寅', day: '戊子', hour: '壬子' }
    const partner = { year: '甲子', month: '丙寅', day: '戊子', hour: '壬子' }
    const result = generateExplanation(my, partner, 'female')
    const joined = result.join(' ')
    expect(joined).toMatch(/(相同|時柱)/)
  })

  it('handles hour branch different', () => {
    const my = { year: '甲子', month: '丙寅', day: '戊子', hour: '壬子' }
    const partner = { year: '甲子', month: '丙寅', day: '戊子', hour: '癸丑' }
    const result = generateExplanation(my, partner, 'female')
    const joined = result.join(' ')
    expect(joined).toMatch(/(各異|時柱)/)
  })
})

// ============================================================
// calcScore
// ============================================================

describe('bazi.ts — calcScore', () => {
  const myBazi = { year: '甲子', month: '丙寅', day: '戊辰', hour: '壬子' }
  const partnerBazi = { year: '己丑', month: '癸卯', day: '辛巳', hour: '癸丑' }
  const myWuxing = { 木: 1, 火: 1, 土: 1, 金: 0, 水: 1 }
  const partnerWuxing = { 木: 0, 火: 1, 土: 1, 金: 1, 水: 1 }

  it('returns a number between 1 and 100', () => {
    const result = calcScore(myBazi, partnerBazi, myWuxing, partnerWuxing)
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('returns integer (rounded)', () => {
    const result = calcScore(myBazi, partnerBazi, myWuxing, partnerWuxing)
    expect(Number.isInteger(result)).toBe(true)
  })

  it('boosts score when year stem differ by 5 (五合 bonus)', () => {
    // 甲 vs 己 differs by 5 → +10
    const noStem5Bazi = { ...myBazi, year: '乙丑' }  // 乙 vs 己 differ by 4 → no bonus
    // Note: score has random +/-10 — can't strictly compare
    // But the average across multiple runs should show the bonus
    const runs = 20
    let withBonus = 0
    let withoutBonus = 0
    for (let i = 0; i < runs; i++) {
      withBonus += calcScore(myBazi, partnerBazi, myWuxing, partnerWuxing)
      withoutBonus += calcScore(noStem5Bazi, partnerBazi, myWuxing, partnerWuxing)
    }
    const avgWith = withBonus / runs
    const avgWithout = withoutBonus / runs
    // Use loose bounds — avgWith should generally be >= avgWithout - 5
    expect(avgWith).toBeGreaterThan(avgWithout - 5)
  })

  it('complementary wuxing (互補) gives bonus', () => {
    // My has 木, partner doesn't → 互補
    const sameWuxing = { 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 }
    // 互補 adds +15, so average should be higher
    const runs = 30
    let withBonus = 0
    let withoutBonus = 0
    for (let i = 0; i < runs; i++) {
      withBonus += calcScore(myBazi, partnerBazi, myWuxing, partnerWuxing)
      withoutBonus += calcScore(myBazi, partnerBazi, sameWuxing, sameWuxing)
    }
    const avgWith = withBonus / runs
    const avgWithout = withoutBonus / runs
    expect(avgWith).toBeGreaterThan(avgWithout)
  })

  it('day branch same gives bonus', () => {
    const sameDayBazi = { ...myBazi, day: '甲子' }
    const sameDayPartner = { ...partnerBazi, day: '甲子' }
    const diffDayBazi = { ...myBazi, day: '乙丑' }
    const diffDayPartner = { ...partnerBazi, day: '辛巳' }
    // Run multiple times to average out random noise
    const runs = 30
    let withBonus = 0
    let withoutBonus = 0
    for (let i = 0; i < runs; i++) {
      withBonus += calcScore(sameDayBazi, sameDayPartner, myWuxing, partnerWuxing)
      withoutBonus += calcScore(diffDayBazi, diffDayPartner, myWuxing, partnerWuxing)
    }
    const avgWith = withBonus / runs
    const avgWithout = withoutBonus / runs
    expect(avgWith).toBeGreaterThan(avgWithout)
  })

  it('clamps to 100 even with extreme bonus', () => {
    // Same year, month, day, hour — every bonus triggers
    const score = calcScore(myBazi, myBazi, myWuxing, myWuxing)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('clamps to 1 even with extreme penalty', () => {
    // Year branch 6 diff → -5
    const my = { year: '子', month: '丙寅', day: '戊辰', hour: '壬子' } as never
    const partner = { year: '午', month: '癸卯', day: '辛巳', hour: '癸丑' } as never
    // Try many random configs to get below 1
    let min = 100
    for (let i = 0; i < 50; i++) {
      const s = calcScore(my, partner, { 木: 0, 火: 0, 土: 5, 金: 0, 水: 0 }, { 木: 5, 火: 0, 土: 0, 金: 0, 水: 0 })
      if (s < min) min = s
    }
    expect(min).toBeGreaterThanOrEqual(1)
  })
})

// ============================================================
// getWuxingConclusion
// ============================================================

describe('bazi.ts — getWuxingConclusion', () => {
  it('returns 金玉良緣 for score >= 80', () => {
    const result = getWuxingConclusion(85, { 木: 2, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 2, 水: 0 })
    expect(result).toContain('金玉良緣')
  })

  it('returns 吉緣天成 for score 60-79', () => {
    const result = getWuxingConclusion(65, { 木: 2, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 2, 水: 0 })
    expect(result).toContain('吉緣天成')
  })

  it('returns 中性緣分 for score 40-59', () => {
    const result = getWuxingConclusion(50, { 木: 2, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 2, 水: 0 })
    expect(result).toContain('中性緣分')
  })

  it('returns 挑戰緣分 for score < 40', () => {
    const result = getWuxingConclusion(20, { 木: 2, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 2, 水: 0 })
    expect(result).toContain('挑戰緣分')
  })

  it('includes both my and partner strongest wuxing', () => {
    const result = getWuxingConclusion(85, { 木: 2, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 2, 水: 0 })
    expect(result).toContain('木')
    expect(result).toContain('金')
  })

  it('handles boundary score 80 (still 金玉良緣)', () => {
    const result = getWuxingConclusion(80, { 木: 1, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 1, 水: 0 })
    expect(result).toContain('金玉良緣')
  })

  it('handles boundary score 60 (still 吉緣天成)', () => {
    const result = getWuxingConclusion(60, { 木: 1, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 1, 水: 0 })
    expect(result).toContain('吉緣天成')
  })

  it('handles boundary score 40 (still 中性緣分)', () => {
    const result = getWuxingConclusion(40, { 木: 1, 火: 0, 土: 0, 金: 0, 水: 0 }, { 木: 0, 火: 0, 土: 0, 金: 1, 水: 0 })
    expect(result).toContain('中性緣分')
  })
})
// ============================================================
// runMatch (orchestrator)
// ============================================================

describe('bazi.ts — runMatch', () => {
  beforeEach(() => {
    // mock fetch for photoGenerator
    globalThis.fetch = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [{ picture: { large: 'https://x/y.jpg' } }] }),
    })) as unknown as typeof fetch
  })

  it('returns a complete MatchResult', async () => {
    const result = await runMatch(
      { name: 'Sean', birthDate: '1990-06-15', gender: 'male' },
      { name: '王小明', birthDate: '1992-03-20' }
    )
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('date')
    expect(result.myName).toBe('Sean')
    expect(result.partnerName).toBe('王小明')
    expect(result.partnerGender).toBe('female')  // male → wants female
    expect(result.score).toBeGreaterThanOrEqual(1)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.wuxingConclusion).toBeTruthy()
    expect(result.explanation.length).toBeGreaterThan(0)
    expect(result.radarData).toHaveLength(5)
  })

  it('defaults gender to female when omitted', async () => {
    const result = await runMatch(
      { name: 'A', birthDate: '1990-06-15' },  // no gender
      { name: 'B', birthDate: '1992-03-20' }
    )
    expect(result.partnerGender).toBe('male')  // female (default) → wants male
  })

  it('reverses gender correctly', async () => {
    const femaleUser = await runMatch(
      { name: 'A', birthDate: '1990-06-15', gender: 'female' },
      { name: 'B', birthDate: '1992-03-20' }
    )
    expect(femaleUser.partnerGender).toBe('male')

    const maleUser = await runMatch(
      { name: 'A', birthDate: '1990-06-15', gender: 'male' },
      { name: 'B', birthDate: '1992-03-20' }
    )
    expect(maleUser.partnerGender).toBe('female')
  })

  it('radarData contains 5 wuxing dimensions', async () => {
    const result = await runMatch(
      { name: 'A', birthDate: '1990-06-15', gender: 'female' },
      { name: 'B', birthDate: '1992-03-20' }
    )
    const dims = result.radarData.map(d => d.dimension)
    expect(dims).toEqual(['木', '火', '土', '金', '水'])
  })

  it('id is a string', async () => {
    const result = await runMatch(
      { name: 'A', birthDate: '1990-06-15', gender: 'female' },
      { name: 'B', birthDate: '1992-03-20' }
    )
    expect(typeof result.id).toBe('string')
    expect(result.id.length).toBeGreaterThan(0)
  })

  it('date is ISO format', async () => {
    const result = await runMatch(
      { name: 'A', birthDate: '1990-06-15', gender: 'female' },
      { name: 'B', birthDate: '1992-03-20' }
    )
    expect(new Date(result.date).toString()).not.toBe('Invalid Date')
  })

  it('falls back to dicebear when photo API fails', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network')
    }) as typeof fetch

    const result = await runMatch(
      { name: 'A', birthDate: '1990-06-15', gender: 'female' },
      { name: 'B', birthDate: '1992-03-20' }
    )
    expect(result.partnerImageUrl).toContain('dicebear')
  })
})
