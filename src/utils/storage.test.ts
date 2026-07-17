import { describe, it, expect, beforeEach } from 'vitest'
import { saveMyData, loadMyData, savePartners, loadPartners, saveHistory, loadHistory, addToHistory } from './storage'
import type { Person, MatchResult } from '../types'

beforeEach(() => {
  localStorage.clear()
})

describe('storage.ts — my data', () => {
  it('returns null when nothing saved', () => {
    expect(loadMyData()).toBeNull()
  })

  it('round-trips person data', () => {
    const person: Person = { id: 'me', name: 'Sean', birthDate: '1990-01-01', gender: 'male' }
    saveMyData(person)
    expect(loadMyData()).toEqual(person)
  })

  it('returns null for corrupt JSON', () => {
    localStorage.setItem('fate_match_my_data', '{not-json')
    expect(loadMyData()).toBeNull()
  })
})

describe('storage.ts — partners', () => {
  it('returns [] when nothing saved', () => {
    expect(loadPartners()).toEqual([])
  })

  it('round-trips array', () => {
    const partners: Person[] = [
      { id: 'p1', name: '王小明', birthDate: '1992-06-15' },
      { id: 'p2', name: '李小華', birthDate: '1995-03-20' },
    ]
    savePartners(partners)
    expect(loadPartners()).toEqual(partners)
  })

  it('returns [] for corrupt JSON', () => {
    localStorage.setItem('fate_match_partners', 'broken')
    expect(loadPartners()).toEqual([])
  })
})

describe('storage.ts — history', () => {
  it('returns [] when nothing saved', () => {
    expect(loadHistory()).toEqual([])
  })

  it('trims to last 10 when saving 11', () => {
    const items: MatchResult[] = Array.from({ length: 11 }, (_, i) => ({
      id: `${i}`,
      date: new Date(2026, 0, i + 1).toISOString(),
      myName: 'Sean',
      partnerName: `P${i}`,
      partnerBirthDate: '1990-01-01',
      partnerImageUrl: '',
      partnerGender: 'female',
      score: 80,
      wuxingConclusion: '',
      explanation: [],
      radarData: [],
    }))
    saveHistory(items)
    const result = loadHistory()
    expect(result).toHaveLength(10)
  })

  it('addToHistory prepends and trims', () => {
    const old: MatchResult = {
      id: 'old',
      date: '2026-01-01',
      myName: 'S', partnerName: 'P', partnerBirthDate: '1990-01-01',
      partnerImageUrl: '', partnerGender: 'female', score: 50,
      wuxingConclusion: '', explanation: [], radarData: [],
    }
    saveHistory([old])

    const fresh: MatchResult = { ...old, id: 'new', partnerName: 'New' }
    const updated = addToHistory(fresh)

    expect(updated[0].id).toBe('new')
    expect(updated[1].id).toBe('old')
    expect(updated).toHaveLength(2)
  })
})