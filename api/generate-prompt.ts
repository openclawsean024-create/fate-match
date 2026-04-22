import type { VercelRequest, VercelResponse } from '@vercel/node'

// 8 regions with full keyword handbook from SPEC v6.1
const REGION_KEYWORDS: Record<string, { scenes: string[], outfits: string[], hair: string[], makeup: string[], vibe: string[] }> = {
  TW: {
    scenes: ['Taipei cityscape', 'Miramar Ferris wheel', 'Taiwan night market', '霓虹燈夜景', '台北街頭'],
    outfits: ['簡約休閒', '白色T恤', '破牛仔褲', '文青打扮', '島耕作風格', 'floral dress'],
    hair: ['自然黑長直', '微微內彎', '空氣劉海'],
    makeup: ['清新淡妝', '偽素顏妝容', '軟糯感妝容'],
    vibe: ['溫柔敦厚', '鄰家女孩感', '有點呆萌', 'approachable warmth'],
  },
  HK: {
    scenes: ['Hong Kong skyline at night', 'Victoria Harbour', 'Central mid-levels escalator', 'Mong Kok neon lights', '中環街景'],
    outfits: ['港味時尚', 'logo tee + 短褲', '東方錶/Swatch 手錶', '快速變化的時裝'],
    hair: ['微卷短髮', '離子燙直髮', '韓式空氣劉海'],
    makeup: ['啞光底妝', '啞光唇膏', '自然妝感'],
    vibe: ['自成一格的港風', '不跟風但有品味', '帶點 cool', 'confident aura'],
  },
  CN: {
    scenes: ['Shanghai Bund night view', 'Beijing Wangfujing', 'Guangzhou Canton Tower', 'Shenzhen metropolitan'],
    outfits: ['網紅風格', '設計師品牌', '簡約黑白灰', '小眾品牌愛好者', '精緻時尚'],
    hair: ['精緻打理過的長髮', '韓式髮型為主', '柔順直髮或大波浪'],
    makeup: ['精緻妝容', '完整的妝前打底', '啞光妝感', '口紅偏紅'],
    vibe: ['大氣從容', '小姐姐風格', '有格局', 'poised elegance'],
  },
  MY: {
    scenes: ['Kuala Lumpur Petronas Twin Towers', 'Penang street art', 'Malaysia night market'],
    outfits: ['多元文化混搭風格', '唐装元素混搭', '簡單T-shirt+牛仔', '清真時尚'],
    hair: ['自然黑色短髮', '保守打理', '馬來式包頭'],
    makeup: ['清新自然', '淡妝為主', 'tropical glow'],
    vibe: ['多元包容', 'warm and approachable', '熱帶氣息'],
  },
  SG: {
    scenes: ['Marina Bay Sands', 'Gardens by the Bay', 'Orchard Road'],
    outfits: ['商務休閒風格', '設計師品牌', 'Smart casual', '簡約但有品質'],
    hair: ['精心打理', 'OL 常見短髮或中長髮', '離子燙直髮'],
    makeup: ['精緻職業妝容', 'Nude 妝感', '啞光'],
    vibe: ['都市時尚', '高效優雅', '國際化'],
  },
  JP: {
    scenes: ['Tokyo Shibuya crossing', 'Osaka Dotonbori', 'Japanese urban night', '和傘/桜背景'],
    outfits: ['日本街頭時尚', 'URAHARA 風格', '古着混搭', '男友風格搭配', '透明感妝容'],
    hair: ['透明感髪色', '霧面灰棕', '空氣感短髮', '外長內短層次'],
    makeup: ['透明感妝容', '血色感妝容', '垂眼妝/貓眼妝'],
    vibe: ['鹽顔', '清爽系', '不經意的時尚', 'effortless style'],
  },
  KR: {
    scenes: ['Seoul Hongdae', 'Gangnam district', 'Korean urban night scene', '首爾街頭霓虹'],
    outfits: ['K-fashion', 'Seoul street style', '設計師品牌混搭', '窄管褲+寬鬆上衣'],
    hair: ['韓式長髮', '水光長髮', '空氣劉海', '減齡髮型'],
    makeup: ['K-beauty 水光妝', '玻璃唇', '漸層唇妝', '輕透底妝'],
    vibe: ['韓系精緻感', '網紅感', '有親和力的精緻', 'glowy skin aura'],
  },
  OTHER: {
    scenes: ['Asian urban cityscape', 'modern metropolitan background', 'soft bokeh lights'],
    outfits: ['Modern casual fashion', 'clean and simple style', 'timeless elegant'],
    hair: ['Natural healthy hair', 'well-maintained', 'classic styling'],
    makeup: ['Natural makeup', 'glowing skin', 'subtle definition'],
    vibe: ['Universally attractive', 'confident and warm'],
  },
}

const TRAIT_VISUALS: Record<string, string> = {
  '溫柔': 'gentle smile, soft features, warm eyes',
  '開朗': 'bright smile, expressive eyes, lively energy',
  '獨立': 'confident posture, self-assured gaze, poised',
  '善解人意': 'warm compassionate eyes, approachable expression',
  '細心': 'meticulous neat appearance, polished details',
  '體貼': 'caring gentle presence, empathetic expression',
  '活潑': 'energetic expression, playful sparkle in eyes',
  '穩重': 'calm composed demeanor, steady confident gaze',
  '浪漫': 'dreamy romantic atmosphere, soft gaze',
  '幽默': 'warm inviting smile, twinkling eyes',
}

const NEGATIVE_PROMPT = 'ugly, deformed, low resolution, watermark, text, signature, cropped, out of frame, bad anatomy, extra limbs, blurry, poorly drawn'

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function buildFallbackPrompt(
  traits: string[],
  gender: string,
  region: string,
  luckyColors: string[]
): string {
  const r = REGION_KEYWORDS[region] || REGION_KEYWORDS.OTHER
  const genderWord = gender === 'male' ? 'Male' : 'Female'
  const traitDescs = traits.slice(0, 3).map(t => TRAIT_VISUALS[t] || t).join(', ')
  const outfitStr = pick(r.outfits, 2).join(', ')
  const sceneStr = pick(r.scenes, 2).join(', ')
  const vibeStr = pick(r.vibe, 1)[0]
  const colorStr = luckyColors.length > 0 ? luckyColors[0] : 'warm'

  return `${genderWord} portrait, realistic photography style, soft natural lighting, ${traitDescs}, ${outfitStr}, ${sceneStr} background, ${vibeStr}, ${colorStr} color theme, intimate atmosphere, close-up shot, highly detailed, 8k, masterpiece\nNegative prompt: ${NEGATIVE_PROMPT}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }

  const { traits, gender, birthDate, luckyColors, region } = req.body as {
    traits?: string[]
    gender?: string
    birthDate?: string
    luckyColors?: string[]
    region?: string
  }

  if (!traits || !gender || !region) {
    return res.status(400).json({ error: 'INVALID_PARAMS', message: '缺少必填參數 traits, gender, region' })
  }

  const regionCode = (region || 'OTHER').toUpperCase()
  const r = REGION_KEYWORDS[regionCode] || REGION_KEYWORDS.OTHER
  const genderWord = gender === 'male' ? 'Male' : 'Female'
  const genderDesc = gender === 'male'
    ? 'strong jawline, masculine features'
    : 'feminine elegance, soft features'

  const traitDescs = traits.slice(0, 5).map(t => TRAIT_VISUALS[t] || t).join(', ')
  const colorStr = luckyColors && luckyColors.length > 0 ? luckyColors.join(' and ') : 'warm neutral'

  const traitBlock = traitDescs ? `, ${traitDescs}` : ''
  const sceneStr = pick(r.scenes, 3).join(', ')
  const outfitStr = pick(r.outfits, 3).join(', ')
  const hairStr = pick(r.hair, 1)[0]
  const makeupStr = pick(r.makeup, 1)[0]
  const vibeStr = pick(r.vibe, 2).join(', ')

  const prompt = `${genderWord} portrait, realistic photography style, soft natural lighting${traitBlock}, ${hairStr}, ${makeupStr}, ${outfitStr}, ${sceneStr} background, ${vibeStr}, ${colorStr} color theme in outfit, intimate atmosphere, close-up shot, highly detailed, 8k, masterpiece\nNegative prompt: ${NEGATIVE_PROMPT}`

  return res.status(200).json({ prompt })
}
