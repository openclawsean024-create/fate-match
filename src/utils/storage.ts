import type { Person, MatchResult } from '../types'

const MY_DATA_KEY = 'fate_match_my_data'
const PARTNERS_KEY = 'fate_match_partners'
const HISTORY_KEY = 'fate_match_history'

export function saveMyData(person: Person): void {
  localStorage.setItem(MY_DATA_KEY, JSON.stringify(person))
}

export function loadMyData(): Person | null {
  const raw = localStorage.getItem(MY_DATA_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Person
  } catch {
    return null
  }
}

export function savePartners(partners: Person[]): void {
  localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners))
}

export function loadPartners(): Person[] {
  const raw = localStorage.getItem(PARTNERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Person[]
  } catch {
    return []
  }
}

export function saveHistory(history: MatchResult[]): void {
  const trimmed = history.slice(-10)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
}

export function loadHistory(): MatchResult[] {
  const raw = localStorage.getItem(HISTORY_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as MatchResult[]
  } catch {
    return []
  }
}

export function addToHistory(result: MatchResult): MatchResult[] {
  const history = loadHistory()
  history.unshift(result)
  const trimmed = history.slice(0, 10)
  saveHistory(trimmed)
  return trimmed
}