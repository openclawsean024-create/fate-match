import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getZodiacName, getZodiacAnimal, generatePartnerImage } from './photoGenerator'

// ============================================================
// getZodiacAnimal / getZodiacName
// ============================================================

describe('photoGenerator.ts — getZodiacAnimal', () => {
  it('returns 鼠 for 1984 (base year)', () => {
    expect(getZodiacAnimal('1984-01-01')).toBe('鼠')
  })

  it('returns 牛 for 1985', () => {
    expect(getZodiacAnimal('1985-06-15')).toBe('牛')
  })

  it('returns 虎 for 1986', () => {
    expect(getZodiacAnimal('1986-03-20')).toBe('虎')
  })

  it('cycles every 12 years', () => {
    expect(getZodiacAnimal('1984-01-01')).toBe(getZodiacAnimal('1996-01-01'))
    expect(getZodiacAnimal('1984-01-01')).toBe(getZodiacAnimal('2008-01-01'))
  })

  it('handles year before 1984', () => {
    // 1972 = 鼠年 (12 years before 1984)
    expect(getZodiacAnimal('1972-06-15')).toBe('鼠')
  })

  it('returns all 12 zodiac animals over 12 consecutive years', () => {
    const animals = new Set<string>()
    for (let y = 1984; y < 1996; y++) {
      animals.add(getZodiacAnimal(`${y}-01-01`))
    }
    expect(animals.size).toBe(12)
  })

  it('extracts year from date string regardless of month/day', () => {
    expect(getZodiacAnimal('1990-01-01')).toBe(getZodiacAnimal('1990-12-31'))
  })
})

describe('photoGenerator.ts — getZodiacName', () => {
  it('is an alias for getZodiacAnimal', () => {
    expect(getZodiacName('1990-06-15')).toBe(getZodiacAnimal('1990-06-15'))
    expect(getZodiacName('2000-03-20')).toBe(getZodiacAnimal('2000-03-20'))
  })
})

// ============================================================
// generatePartnerImage — with mocked fetch
// ============================================================

describe('photoGenerator.ts — generatePartnerImage', () => {
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  // Helper: create a partial Response-like mock that satisfies photoGenerator's needs
  function mockResponse(opts: { ok?: boolean; status?: number; picture?: string; results?: unknown[] } = {}) {
    return {
      ok: opts.ok ?? true,
      status: opts.status ?? 200,
      json: async () => ({
        results: opts.results ?? [{ picture: { large: opts.picture ?? 'https://x/y.jpg' } }],
      }),
    }
  }

  // Cast helper to bypass strict Response type checking (mock doesn't implement full interface)
  function asFetchMock(fn: (input: RequestInfo | URL, init?: RequestInit) => Promise<unknown>) {
    return fn as unknown as typeof fetch
  }

  it('returns randomuser.me URL on success', async () => {
    globalThis.fetch = asFetchMock(async () => mockResponse({ picture: 'https://randomuser.me/api/portraits/women/23.jpg' }))

    const url = await generatePartnerImage('1990-06-15', 'female')
    expect(url).toContain('randomuser.me')
  })

  it('passes gender=male when myGender is female (reverse)', async () => {
    let calledUrl = ''
    globalThis.fetch = asFetchMock(async (url) => {
      calledUrl = String(url)
      return mockResponse()
    })

    await generatePartnerImage('1990-06-15', 'female')
    expect(calledUrl).toContain('gender=male')
  })

  it('passes gender=female when myGender is male (reverse)', async () => {
    let calledUrl = ''
    globalThis.fetch = asFetchMock(async (url) => {
      calledUrl = String(url)
      return mockResponse()
    })

    await generatePartnerImage('1990-06-15', 'male')
    expect(calledUrl).toContain('gender=female')
  })

  it('falls back to dicebear adventurer when fetch fails', async () => {
    globalThis.fetch = asFetchMock(async () => {
      throw new Error('network down')
    })

    // male → wants female photo → adventurer style
    const url = await generatePartnerImage('1990-06-15', 'male')
    expect(url).toContain('dicebear')
    expect(url).toContain('adventurer')
  })

  it('falls back to dicebear avataaars for male target', async () => {
    globalThis.fetch = asFetchMock(async () => {
      throw new Error('timeout')
    })

    // female → wants male photo → avataaars style
    const url = await generatePartnerImage('1990-06-15', 'female')
    expect(url).toContain('dicebear')
    expect(url).toContain('avataaars')
  })

  it('falls back to dicebear when response is not ok (5xx)', async () => {
    globalThis.fetch = asFetchMock(async () => mockResponse({ ok: false, status: 503 }))

    const url = await generatePartnerImage('1990-06-15', 'female')
    expect(url).toContain('dicebear')
  })

  it('falls back when response has no picture', async () => {
    globalThis.fetch = asFetchMock(async () => mockResponse({ results: [] }))

    const url = await generatePartnerImage('1990-06-15', 'male')
    expect(url).toContain('dicebear')
  })

  it('passes AbortSignal to fetch (timeout config present)', async () => {
    let signalUsed = false
    globalThis.fetch = asFetchMock(async (_url, init) => {
      if (init?.signal) signalUsed = true
      return mockResponse()
    })

    await generatePartnerImage('1990-06-15', 'female')
    expect(signalUsed).toBe(true)
  })
})