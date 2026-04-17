import type { RadarItem } from '../types'

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const STEM_WUXING: Record<string, string> = {
  甲: '木', 乙: '木',
  丙: '火', 丁: '火',
  戊: '土', 己: '土',
  庚: '金', 辛: '金',
  壬: '水', 癸: '水',
}

const BRANCH_WUXING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
}

const BRANCH_POSITIONS: Record<string, number> = {
  子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5,
  午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
}

function getStemIndex(year: number): number {
  return (((year - 4) % 10) + 10) % 10
}

function getBranchIndex(year: number): number {
  return (((year - 4) % 12) + 12) % 12
}

function getStemFromDay(dateStr: string): { stemIndex: number; branchIndex: number } {
  const date = new Date(dateStr)
  const baseDate = new Date(1984, 1, 6)
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / 86400000)
  return {
    stemIndex: ((diffDays % 10) + 10) % 10,
    branchIndex: ((diffDays % 12) + 12) % 12,
  }
}

function calcBazi(birthDate: string): { year: string; month: string; day: string; hour: string } {
  const d = new Date(birthDate)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const hour = d.getHours()

  const yStem = getStemIndex(year)
  const yBranch = getBranchIndex(year)
  const yinYang = yStem % 2
  const mBranchIdx = (2 + month - 2 + (yinYang === 0 ? 0 : 1)) % 12
  const mStemIdx = ((yStem % 5) * 2 + month) % 10

  const { stemIndex: dStemIdx, branchIndex: dBranchIdx } = getStemFromDay(birthDate)
  const hBranchIdx = Math.floor(hour / 2) % 12
  const hStemIdx = (dStemIdx * 2 + Math.floor(hour / 2)) % 10

  return {
    year: HEAVENLY_STEMS[yStem] + EARTHLY_BRANCHES[yBranch],
    month: HEAVENLY_STEMS[mStemIdx] + EARTHLY_BRANCHES[mBranchIdx],
    day: HEAVENLY_STEMS[dStemIdx] + EARTHLY_BRANCHES[dBranchIdx],
    hour: HEAVENLY_STEMS[hStemIdx] + EARTHLY_BRANCHES[hBranchIdx],
  }
}

function calcWuxingBalance(bazi: string): Record<string, number> {
  const scores: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  if (bazi.length >= 2) {
    scores[STEM_WUXING[bazi[0]] || '土']++
    scores[BRANCH_WUXING[bazi[1]] || '土']++
  }
  return scores
}

function mergeWuxing(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  return { 木: a.木 + b.木, 火: a.火 + b.火, 土: a.土 + b.土, 金: a.金 + b.金, 水: a.水 + b.水 }
}

function generateExplanation(
  myBazi: { year: string; month: string; day: string; hour: string },
  partnerBazi: { year: string; month: string; day: string; hour: string },
): string[] {
  const explanations: string[] = []

  const yStemMy = myBazi.year[0]
  const yStemPartner = partnerBazi.year[0]
  const yBranchMy = myBazi.year[1]
  const yBranchPartner = partnerBazi.year[1]

  const stemDiff = Math.abs(HEAVENLY_STEMS.indexOf(yStemMy) - HEAVENLY_STEMS.indexOf(yStemPartner))
  if (stemDiff === 5) {
    explanations.push(`年柱天干${yStemMy}${yStemPartner}成五合之局，象徵命中注定的牽絆，是非常難得的機緣。`)
  }

  const branchDiff = Math.abs((BRANCH_POSITIONS[yBranchMy] ?? 0) - (BRANCH_POSITIONS[yBranchPartner] ?? 0))
  if (branchDiff === 4 || branchDiff === 8) {
    explanations.push(`年柱地支${yBranchMy}${yBranchPartner}形成三合局，三人成局能量旺盛，能互相增幅。`)
  } else if (branchDiff === 6) {
    explanations.push(`年柱地支${yBranchMy}${yBranchPartner}相冲，動力強但不穩定，需要磨合。`)
  }

  const dStemMy = myBazi.day[0]
  const dStemPartner = partnerBazi.day[0]
  const dBranchMy = myBazi.day[1]
  const dBranchPartner = partnerBazi.day[1]

  const dStemDiff = Math.abs(HEAVENLY_STEMS.indexOf(dStemMy) - HEAVENLY_STEMS.indexOf(dStemPartner))
  if (dStemDiff === 5) {
    explanations.push(`日柱天干${dStemMy}${dStemPartner}正合，夫妻之緣，感情專一而深刻。`)
  }

  const dBranchDiff = Math.abs((BRANCH_POSITIONS[dBranchMy] ?? 0) - (BRANCH_POSITIONS[dBranchPartner] ?? 0))
  if (dBranchDiff === 6) {
    explanations.push(`日柱地支${dBranchMy}${dBranchPartner}相冲，感情張力大，需相互包容才能長久。`)
  } else if (dBranchDiff === 0) {
    explanations.push(`日柱地支相同（${dBranchMy}），命格相近相吸，相處和諧默契。`)
  }

  if (explanations.length < 3) {
    const monthDiff = Math.abs((BRANCH_POSITIONS[myBazi.month[1]] ?? 0) - (BRANCH_POSITIONS[partnerBazi.month[1]] ?? 0))
    if (monthDiff <= 3) {
      explanations.push(`月柱地支相近，成長背景與價值觀相似，溝通無障礙。`)
    } else {
      explanations.push(`月柱地支相異(${myBazi.month[1]}vs${partnerBazi.month[1]})，思維方式不同，能激發彼此成長。`)
    }
  }

  if (explanations.length < 4) {
    const hourSame = myBazi.hour[1] === partnerBazi.hour[1]
    if (hourSame) {
      explanations.push(`時柱地支相同(${myBazi.hour[1]})，作息與生活節奏一致，日常相處融洽。`)
    } else {
      explanations.push(`時柱地支各異(${myBazi.hour[1]}vs${partnerBazi.hour[1]})，需多預留私人空間。`)
    }
  }

  if (explanations.length < 3) {
    explanations.push(`整體命格展現獨特的互補與差異，珍惜差異就能長久。`)
  }

  return explanations.slice(0, 5)
}

function calcScore(
  myBazi: { year: string; month: string; day: string; hour: string },
  partnerBazi: { year: string; month: string; day: string; hour: string },
  myWuxing: Record<string, number>,
  partnerWuxing: Record<string, number>,
): number {
  let score = 50

  const stemDiff = Math.abs(HEAVENLY_STEMS.indexOf(myBazi.year[0]) - HEAVENLY_STEMS.indexOf(partnerBazi.year[0]))
  if (stemDiff === 5) score += 10

  const branchDiff = Math.abs((BRANCH_POSITIONS[myBazi.year[1]] ?? 0) - (BRANCH_POSITIONS[partnerBazi.year[1]] ?? 0))
  if (branchDiff === 4 || branchDiff === 8) score += 8
  if (branchDiff === 6) score -= 5

  const dStemDiff = Math.abs(HEAVENLY_STEMS.indexOf(myBazi.day[0]) - HEAVENLY_STEMS.indexOf(partnerBazi.day[0]))
  if (dStemDiff === 5) score += 10

  if (myBazi.day[1] === partnerBazi.day[1]) score += 8

  let hubu = false
  const wuxingKeys = ['木', '火', '土', '金', '水']
  wuxingKeys.forEach(w => {
    if (myWuxing[w] > 0 && partnerWuxing[w] === 0) hubu = true
    if (partnerWuxing[w] > 0 && myWuxing[w] === 0) hubu = true
  })
  if (hubu) score += 15

  const myTotal = Object.values(myWuxing).reduce((a, b) => a + b, 0)
  const partnerTotal = Object.values(partnerWuxing).reduce((a, b) => a + b, 0)
  if (Math.abs(myTotal - partnerTotal) <= 2) score += 10

  const myStrong = Object.entries(myWuxing).sort((a, b) => b[1] - a[1])[0][0]
  const partnerStrong = Object.entries(partnerWuxing).sort((a, b) => b[1] - a[1])[0][0]
  if (myStrong === partnerStrong) score += 5

  const seed = new Date().getSeconds()
  score += ((seed * 17) % 20) - 10

  return Math.max(1, Math.min(100, Math.round(score)))
}

function getWuxingConclusion(score: number, myWuxing: Record<string, number>, partnerWuxing: Record<string, number>): string {
  const myStrong = Object.entries(myWuxing).sort((a, b) => b[1] - a[1])[0][0]
  const partnerStrong = Object.entries(partnerWuxing).sort((a, b) => b[1] - a[1])[0][0]

  if (score >= 80) return `金玉良緣：${myStrong}與${partnerStrong}相生相合，命格天成，堪稱神仙眷侶。`
  if (score >= 60) return `吉緣天成：${myStrong}與${partnerStrong}氣場和諧，攜手今生有望。`
  if (score >= 40) return `中性緣分：${myStrong}與${partnerStrong}各有所長，需要磨合才能長久。`
  return `挑戰緣分：${myStrong}與${partnerStrong}差異明顯，需用心經營方能美滿。`
}

export function runMatch(myData: { name: string; birthDate: string }, partner: { name: string; birthDate: string }): {
  id: string; date: string; myName: string; partnerName: string
  score: number; wuxingConclusion: string; explanation: string[]; radarData: RadarItem[]
} {
  const myBazi = calcBazi(myData.birthDate)
  const partnerBazi = calcBazi(partner.birthDate)

  const myDayWuxing = calcWuxingBalance(myBazi.day)
  const partnerDayWuxing = calcWuxingBalance(partnerBazi.day)

  const myWuxing = mergeWuxing(myDayWuxing, partnerDayWuxing)
  const partnerWuxing = mergeWuxing(partnerDayWuxing, myDayWuxing)

  const score = calcScore(myBazi, partnerBazi, myWuxing, partnerWuxing)
  const conclusion = getWuxingConclusion(score, myWuxing, partnerWuxing)
  const explanations = generateExplanation(myBazi, partnerBazi)

  const radarData: RadarItem[] = [
    { dimension: '木', myValue: myWuxing['木'], partnerValue: partnerWuxing['木'] },
    { dimension: '火', myValue: myWuxing['火'], partnerValue: partnerWuxing['火'] },
    { dimension: '土', myValue: myWuxing['土'], partnerValue: partnerWuxing['土'] },
    { dimension: '金', myValue: myWuxing['金'], partnerValue: partnerWuxing['金'] },
    { dimension: '水', myValue: myWuxing['水'], partnerValue: partnerWuxing['水'] },
  ]

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    myName: myData.name,
    partnerName: partner.name,
    score,
    wuxingConclusion: conclusion,
    explanation: explanations,
    radarData,
  }
}
