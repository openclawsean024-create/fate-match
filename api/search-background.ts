import type { VercelRequest, VercelResponse } from '@vercel/node'

const SEARCH_KEYWORDS: Record<string, { primary: string; fallback: string }> = {
  TW: { primary: 'Taiwan cityscape', fallback: 'Taiwan night market' },
  HK: { primary: 'Hong Kong skyline night', fallback: 'Victoria Harbour' },
  CN: { primary: 'Shanghai Bund night', fallback: 'Beijing cityscape' },
  MY: { primary: 'Kuala Lumpur skyline', fallback: 'Petronas Towers night' },
  SG: { primary: 'Marina Bay Sands night', fallback: 'Singapore skyline' },
  JP: { primary: 'Tokyo night streets', fallback: 'Shibuya crossing night' },
  KR: { primary: 'Seoul Hongdae night', fallback: 'Gangnam district night' },
  OTHER: { primary: 'Asian cityscape', fallback: 'modern urban background' },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ imageUrl: null, error: 'METHOD_NOT_ALLOWED' })
  }

  const { region } = req.query as { region?: string }
  const regionCode = (region || 'OTHER').toUpperCase()
  const keywords = SEARCH_KEYWORDS[regionCode] || SEARCH_KEYWORDS.OTHER

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !engineId) {
    return res.status(200).json({ imageUrl: null, error: 'MISSING_API_KEYS' })
  }

  // Try primary keyword first, then fallback
  const keywordsToTry = [keywords.primary, keywords.fallback]

  for (const keyword of keywordsToTry) {
    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1')
      url.searchParams.set('key', apiKey)
      url.searchParams.set('cx', engineId)
      url.searchParams.set('q', keyword)
      url.searchParams.set('searchType', 'image')
      url.searchParams.set('num', '1')
      url.searchParams.set('imgSize', 'medium')

      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        if (response.status === 429) {
          return res.status(200).json({ imageUrl: null, error: 'QUOTA_EXCEEDED' })
        }
        continue
      }

      const data = await response.json() as { items?: { link: string }[] }
      const imageUrl = data.items?.[0]?.link

      if (!imageUrl) continue

      // Fetch the image and convert to base64
      try {
        const imgResponse = await fetch(imageUrl, {
          signal: AbortSignal.timeout(5000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; fate-match-bot/1.0)',
          },
        })

        if (!imgResponse.ok) continue

        const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'
        const buffer = await imgResponse.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')

        return res.status(200).json({
          imageUrl: `data:${contentType};base64,${base64}`,
          sourceUrl: imageUrl,
          keyword,
        })
      } catch {
        continue
      }
    } catch {
      continue
    }
  }

  return res.status(200).json({ imageUrl: null, error: 'NO_RESULTS' })
}
