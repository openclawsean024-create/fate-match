export interface Person {
  id: string
  name: string
  birthDate: string // YYYY-MM-DD
  birthTime?: string // HH:MM (optional, for time-based adjustments)
}

export interface MatchResult {
  id: string
  date: string
  myName: string
  partnerName: string
  score: number
  wuxingConclusion: string
  explanation: string[]
  radarData: RadarItem[]
}

export interface RadarItem {
  dimension: string
  myValue: number
  partnerValue: number
}

export type Tab = 'myData' | 'matchList' | 'history'