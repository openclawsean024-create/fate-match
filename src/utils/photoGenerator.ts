/**
 * AI Photo Generator — 根據生肖+性別產生「命定天女/天子」形象照
 * 使用 randomuser.me API（免費，穩定）
 * 策略：依出生年份取得生肖，再以生肖+姓名為 seed 取得一致性的人物照
 * gender: 'male'=命定天子（想要女性），'female'=命定天女（想要男性）
 * 所以 gender 會反過來決定照片性別：male→female photo, female→male photo
 */

const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬']

export function getZodiacAnimal(birthDate: string): string {
  const year = new Date(birthDate).getFullYear()
  // 1984 為鼠年（甲子年），以此為基準計算
  const baseYear = 1984
  const diff = ((year - baseYear) % 12) + 12
  const index = diff % 12
  return ZODIAC_ANIMALS[index]
}

/**
 * 根據生肖+性別產生形象照 URL
 * gender: 命定天子的性別（男→想認識女性，所以照片用 female）
 *         命定天女的性別（女→想認識男性，所以照片用 male）
 * 回傳格式：https://randomuser.me/api/portraits/...
 */
export async function generatePartnerImage(
  birthDate: string,
  myGender: 'male' | 'female'
): Promise<string> {
  const zodiac = getZodiacAnimal(birthDate)
  const seed = `${zodiac}${birthDate.replace(/-/g, '')}`
  // 命定天子(male)想找女性→顯示女性照片; 命定天女(female)想找男性→顯示男性照片
  const targetGender = myGender === 'male' ? 'female' : 'male'

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(
      `https://randomuser.me/api/?seed=${encodeURIComponent(seed)}&gender=${targetGender}&inc=picture`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (data.results?.[0]?.picture?.large) {
      return data.results[0].picture.large
    }
    throw new Error('No picture in response')
  } catch {
    // Fallback: DiceBear Avatars（備援，完全免費無需 API key）
    // DiceBear 用不同的 style 區分性別
    const fallbackSeed = `${zodiac}${birthDate.replace(/-/g, '')}`
    const style = targetGender === 'female' ? 'adventurer' : 'avataaars'
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(fallbackSeed)}&backgroundColor=b6e3f4`
  }
}

/**
 * 取得生肖名稱（用於顯示）
 */
export function getZodiacName(birthDate: string): string {
  return getZodiacAnimal(birthDate)
}
