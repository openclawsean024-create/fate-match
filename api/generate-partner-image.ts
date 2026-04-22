import type { VercelRequest, VercelResponse } from '@vercel/node'

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

const REGION_KEYWORDS: Record<string, { scenes: string[], outfits: string[], hair: string[], makeup: string[], vibe: string[] }> = {
  TW: {
    scenes: ['Taipei cityscape', 'Miramar Ferris wheel', 'Taiwan night market', '台北街頭'],
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

const NEGATIVE_PROMPT = 'ugly, deformed, low resolution, watermark, text, signature, cropped, out of frame, bad anatomy, extra limbs, blurry, poorly drawn'

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

async function generatePrompt(
  traits: string[],
  gender: string,
  birthDate: string,
  luckyColors: string[],
  region: string
): Promise<{ prompt: string; source: 'gpt4o' | 'fallback' }> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Fallback immediately if no API key
    return { prompt: buildFallbackPrompt(traits, gender, region, luckyColors), source: 'fallback' }
  }

  const regionCode = (region || 'OTHER').toUpperCase()
  const r = REGION_KEYWORDS[regionCode] || REGION_KEYWORDS.OTHER
  const genderWord = gender === 'male' ? 'Male' : 'Female'
  const genderDesc = gender === 'male' ? 'strong jawline, masculine features' : 'feminine elegance, soft features'

  const traitDescs = traits.slice(0, 5).map(t => TRAIT_VISUALS[t] || t).join(', ')
  const colorStr = luckyColors && luckyColors.length > 0 ? luckyColors.join(' and ') : 'warm neutral'
  const sceneStr = pick(r.scenes, 3).join(', ')
  const outfitStr = pick(r.outfits, 3).join(', ')
  const hairStr = pick(r.hair, 1)[0]
  const makeupStr = pick(r.makeup, 1)[0]
  const vibeStr = pick(r.vibe, 2).join(', ')

  const systemPrompt = `你是一個專業的 AI 圖片 Prompt 工程師，專精於根據命理分析結果生成 Stable Diffusion 圖片 Prompt。

用戶會提供：
- traits（伴侶特質陣列，最多 5 個）
- gender（male/female）
- luckyColors（幸運色陣列，最多 3 個）
- region（居住地區代碼：TW/HK/CN/MY/SG/JP/KR/OTHER）

地區代碼對照：
- TW（台灣）：台灣本地用戶，場景以台北為主，穿著偏休閒文青風
- HK（香港）：香港本地用戶，場景以維多利亞港/中環為主，港味時尚
- CN（中國大陸）：一線城市用戶（北上廣深），精緻網紅風
- MY（馬來西亞）：多元文化混搭，熱帶風情
- SG（新加坡）：都市優雅，商務休閒
- JP（日本）：東京/大阪街頭，透明感/鹽顏風格
- KR（韓國）：首爾江南風，K-beauty 水光妝
- OTHER：通用亞洲風格

你的任務是生成一個詳細的 Stable Diffusion Prompt，格式如下：
[性別] portrait, realistic photography style, [光線],
[命格關鍵字→視覺化描述],
[地區風格描述（穿著/場景/妝容/氣質）],
[幸運色融入穿著配色],
[intimate atmosphere, close-up shot],
highly detailed, 8k, masterpiece

Negative prompt: ugly, deformed, low resolution, watermark, text, signature, cropped, out of frame, bad anatomy, extra limbs

規則：
1. 每個 trait 必須轉換為對應的視覺描述
2. 地區風格必須明確附加（穿著/場景/妝容/氣質關鍵字）
3. luckyColors 必須體現在穿著配色描述中
4. Prompt 總長度控制在 150-300 tokens
5. 輸出只含 Prompt 文字，不含任何說明或標記
6. 若性別為 male，加入：strong jawline, masculine features
7. 若性別為 female，加入：feminine elegance, soft features`

  const userMessage = `性別: ${genderWord}
特質: ${traits.join(', ')}
幸運色: ${colorStr}
地區: ${regionCode}
場景關鍵字: ${sceneStr}
穿著關鍵字: ${outfitStr}
髮型關鍵字: ${hairStr}
妝容關鍵字: ${makeupStr}
氣質關鍵字: ${vibeStr}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return { prompt: buildFallbackPrompt(traits, gender, region, luckyColors), source: 'fallback' }
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] }
    const promptText = data.choices?.[0]?.message?.content?.trim()

    if (!promptText || promptText.length < 50) {
      return { prompt: buildFallbackPrompt(traits, gender, region, luckyColors), source: 'fallback' }
    }

    return { prompt: promptText, source: 'gpt4o' }
  } catch {
    return { prompt: buildFallbackPrompt(traits, gender, region, luckyColors), source: 'fallback' }
  }
}

function buildFallbackPrompt(
  traits: string[],
  gender: string,
  region: string,
  luckyColors: string[]
): string {
  const r = REGION_KEYWORDS[(region || 'OTHER').toUpperCase()] || REGION_KEYWORDS.OTHER
  const genderWord = gender === 'male' ? 'Male' : 'Female'
  const genderDesc = gender === 'male' ? 'strong jawline, masculine features' : 'feminine elegance, soft features'
  const traitDescs = traits.slice(0, 3).map(t => TRAIT_VISUALS[t] || t).join(', ')
  const outfitStr = pick(r.outfits, 2).join(', ')
  const sceneStr = pick(r.scenes, 2).join(', ')
  const vibeStr = pick(r.vibe, 1)[0]
  const colorStr = luckyColors && luckyColors.length > 0 ? luckyColors[0] : 'warm'
  const hairStr = pick(r.hair, 1)[0]
  const makeupStr = pick(r.makeup, 1)[0]

  return `${genderWord} portrait, realistic photography style, soft natural lighting, ${traitDescs}, ${hairStr}, ${makeupStr}, ${outfitStr} in ${colorStr} tones, ${sceneStr} background, ${vibeStr}, intimate close-up shot, highly detailed, 8k, masterpiece\nNegative prompt: ${NEGATIVE_PROMPT}`
}

async function generateImage(prompt: string, retries = 0): Promise<{ imageUrl: string; source: 'ai-generated' } | { error: string; canRetry: boolean }> {
  const apiKey = process.env.STABILITY_API_KEY

  if (!apiKey) {
    return { error: 'IMAGE_GENERATION_FAILED', canRetry: false }
  }

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text2image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1.0 }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (response.status === 429) {
      if (retries < 1) {
        const waitMs = (retries + 1) * 2000
        await new Promise(resolve => setTimeout(resolve, waitMs))
        return generateImage(prompt, retries + 1)
      }
      return { error: 'IMAGE_GENERATION_RATELIMIT', canRetry: true }
    }

    if (!response.ok) {
      return { error: 'IMAGE_GENERATION_FAILED', canRetry: true }
    }

    const data = await response.json() as { artifacts?: { base64?: string }[] }
    const base64 = data.artifacts?.[0]?.base64

    if (!base64) {
      return { error: 'IMAGE_GENERATION_FAILED', canRetry: true }
    }

    return { imageUrl: `data:image/png;base64,${base64}`, source: 'ai-generated' }
  } catch {
    return { error: 'IMAGE_GENERATION_TIMEOUT', canRetry: true }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now()

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED', canRetry: false })
  }

  const { traits, gender, birthDate, luckyColors, region } = req.body as {
    traits?: string[]
    gender?: string
    birthDate?: string
    luckyColors?: string[]
    region?: string
  }

  if (!traits || !gender || !region) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PARAMS',
      message: '缺少必填參數 traits, gender, region',
      canRetry: false,
    })
  }

  // Step 1: Generate prompt (GPT-4o or Fallback)
  const { prompt, source: promptSource } = await generatePrompt(
    traits,
    gender,
    birthDate || '',
    luckyColors || [],
    region
  )

  // Step 2: Search background (optional, non-blocking)
  let backgroundImage: { imageUrl: string; sourceUrl: string } | null = null
  if (process.env.ENABLE_GOOGLE_IMAGES === 'true') {
    try {
      const bgUrl = new URL(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['host']}/api/search-background`)
      bgUrl.searchParams.set('region', region)
      // Note: Can't call self from Edge Function easily, skip background for now
      // Background is optional anyway
    } catch {
      // Ignore
    }
  }

  // Step 3: Generate image with Stability AI
  const imageResult = await generateImage(prompt)

  if ('error' in imageResult) {
    const errorMessages: Record<string, string> = {
      IMAGE_GENERATION_TIMEOUT: 'AI 圖片生成逾時，請稍後重試',
      IMAGE_GENERATION_RATELIMIT: 'AI 算命師有點忙，請等一下再重試',
      IMAGE_GENERATION_FAILED: 'AI 圖片生成失敗，請稍後重試',
    }

    return res.status(
      imageResult.error === 'IMAGE_GENERATION_TIMEOUT' ? 504 :
      imageResult.error === 'IMAGE_GENERATION_RATELIMIT' ? 429 : 500
    ).json({
      success: false,
      error: imageResult.error,
      message: errorMessages[imageResult.error] || '發生未知錯誤，請稍後重試',
      canRetry: imageResult.canRetry,
    })
  }

  return res.status(200).json({
    success: true,
    imageUrl: imageResult.imageUrl,
    promptUsed: prompt,
    source: backgroundImage ? 'ai-with-background' : 'ai-generated',
    metadata: {
      region: region.toUpperCase(),
      gender,
      backgroundSource: backgroundImage ? 'google-images' : 'none',
      processingTimeMs: Date.now() - startTime,
    },
  })
}
