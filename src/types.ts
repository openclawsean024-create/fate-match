export interface Person {
  id: string
  name: string
  birthDate: string // YYYY-MM-DD
  birthTime?: string // HH:MM (optional, for time-based adjustments)
  gender?: 'male' | 'female' // 'male'=命定天子 (seeks female), 'female'=命定天女 (seeks male)
}

export interface MatchResult {
  id: string
  date: string
  myName: string
  partnerName: string
  partnerBirthDate: string
  partnerImageUrl: string
  partnerGender: 'male' | 'female' // opposite of my gender: male→female, female→male
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

export type Tab = 'myData' | 'matchList' | 'regionPhotos' | 'history'