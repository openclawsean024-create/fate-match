import { useRef, useState, useEffect } from 'react'
import { Share2, Heart, Zap, Star, Image } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { MatchResult } from '../types'
import { getZodiacName } from '../utils/photoGenerator'

interface Props {
  result: MatchResult
}

export default function MatchResultCard({ result }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [partnerImg, setPartnerImg] = useState<string>(result.partnerImageUrl)
  const [imgLoading, setImgLoading] = useState(true)

  // 嘗試載入 randomuser.me 的生肖形象照（非阻塞更新）
  useEffect(() => {
    setImgLoading(true)
    const zodiac = getZodiacName(result.partnerBirthDate)
    // 使用伴侶姓名+生肖作為 seed，確保每次都是同一張圖
    const seed = `${result.partnerName}${zodiac}`
    fetch(`https://randomuser.me/api/?seed=${encodeURIComponent(seed)}&gender=male&inc=picture`)
      .then(r => r.json())
      .then(d => {
        if (d.results?.[0]?.picture?.large) {
          setPartnerImg(d.results[0].picture.large)
        }
      })
      .catch(() => {
        // 維持 fallback DiceBear URL
      })
      .finally(() => setImgLoading(false))
  }, [result.partnerBirthDate, result.partnerName])

  function handleShare() {
    const card = cardRef.current
    if (!card) return

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 480
      const ctx = canvas.getContext('2d')!

      const gradient = ctx.createLinearGradient(0, 0, 600, 480)
      gradient.addColorStop(0, '#1a1128')
      gradient.addColorStop(1, '#0f0a1a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 600, 480)

      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 3
      ctx.strokeRect(10, 10, 580, 460)

      // Score
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 80px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(result.score.toString(), 300, 100)

      ctx.font = '18px sans-serif'
      ctx.fillStyle = '#a78bfa'
      ctx.fillText('緣分分數', 300, 130)

      // Names
      ctx.font = 'bold 26px sans-serif'
      ctx.fillStyle = '#f5f0ff'
      ctx.fillText(`${result.myName}  ♥  ${result.partnerName}`, 300, 175)

      // Divider
      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(50, 190)
      ctx.lineTo(550, 190)
      ctx.stroke()

      // Conclusion
      ctx.font = 'bold 17px sans-serif'
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(result.wuxingConclusion, 300, 225)

      // Explanations
      ctx.font = '13px sans-serif'
      ctx.fillStyle = '#c4b5fd'
      const explanations = result.explanation.slice(0, 4)
      explanations.forEach((exp, i) => {
        const text = `• ${exp.substring(0, 48)}`
        ctx.fillText(text, 50, 255 + i * 28)
      })

      // Footer
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#6b7280'
      ctx.fillText('命定天子/命定天女 | fate-match', 300, 455)

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `fate-match-${result.score}.png`
      link.href = dataUrl
      link.click()
    } catch {
      const text = `${result.myName} ♥ ${result.partnerName} | 緣分分數: ${result.score}\n${result.wuxingConclusion}\n\n${result.explanation.join('\n')}`
      navigator.clipboard?.writeText(text).catch(() => {})
    }
  }

  const chartData = result.radarData.map(d => ({
    name: d.dimension,
    我的五行: d.myValue,
    對方五行: d.partnerValue,
  }))

  const scoreColor = result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ec4899'
  const zodiacLabel = getZodiacName(result.partnerName)

  return (
    <div>
      <div ref={cardRef} className="hidden" />

      <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/40 rounded-2xl p-5 border border-purple-400/30 mb-4">

        {/* 頂部：分數 + AI 形象照 */}
        <div className="flex items-center gap-4 mb-4">
          {/* AI 形象照 */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              {imgLoading ? (
                <div className="w-16 h-16 rounded-full bg-purple-800/50 flex items-center justify-center animate-pulse">
                  <Image size={20} className="text-purple-400" />
                </div>
              ) : (
                <img
                  src={partnerImg}
                  alt={`${result.partnerName} 命定形象`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-pink-400 shadow-lg shadow-pink-500/30"
                  onError={() => setPartnerImg(result.partnerImageUrl)}
                />
              )}
              {/* 命定光環 */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-40 blur-sm -z-10" />
            </div>
            <span className="text-xs text-pink-400 font-medium">{zodiacLabel}年生</span>
          </div>

          {/* 分數區 */}
          <div className="flex-1 text-center">
            <div className="text-5xl font-black mb-0.5" style={{ color: scoreColor }}>
              {result.score}
            </div>
            <p className="text-purple-400 text-xs">緣分分數</p>
          </div>

          {/* 對方名字區 */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-pink-800/50 flex items-center justify-center text-pink-200 font-black text-sm border border-pink-500/30">
              {result.partnerName[0]}
            </div>
            <span className="text-xs text-pink-400 font-medium truncate max-w-[60px]">{result.partnerName}</span>
          </div>
        </div>

        {/* 名字橫幅 */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="bg-purple-800/50 rounded-full px-4 py-2">
            <span className="text-purple-200 font-bold text-sm">{result.myName}</span>
          </div>
          <Heart size={18} className="text-pink-400 fill-pink-400" />
          <div className="bg-pink-800/50 rounded-full px-4 py-2">
            <span className="text-pink-200 font-bold text-sm">{result.partnerName}</span>
          </div>
        </div>

        {/* 五行結論 */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <p className="text-yellow-300 font-bold text-sm text-center">{result.wuxingConclusion}</p>
        </div>

        {/* 五行長條圖 */}
        <div className="h-36 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: '#a78bfa', fontSize: 12 }} />
              <YAxis tick={{ fill: '#a78bfa', fontSize: 10 }} domain={[0, 3]} />
              <Tooltip
                contentStyle={{ background: '#1a1128', border: '1px solid #7c3aed', borderRadius: 8, color: '#f5f0ff' }}
              />
              <Bar dataKey="我的五行" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="對方五行" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 解說文字 */}
        <div className="space-y-2 mb-4">
          {result.explanation.map((exp, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-purple-400 mt-0.5 flex-shrink-0">
                {i === 0 ? <Star size={12} /> : <Zap size={12} />}
              </span>
              <p className="text-purple-200 text-sm leading-relaxed">{exp}</p>
            </div>
          ))}
        </div>

        {/* 分享按鈕 */}
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          分享命定結果
        </button>
      </div>
    </div>
  )
}
