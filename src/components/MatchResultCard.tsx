import { useRef } from 'react'
import { Share2, Heart, Zap, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { MatchResult } from '../types'

interface Props {
  result: MatchResult
}

export default function MatchResultCard({ result }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  function handleShare() {
    const card = cardRef.current
    if (!card) return

    try {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 400
      const ctx = canvas.getContext('2d')!

      const gradient = ctx.createLinearGradient(0, 0, 600, 400)
      gradient.addColorStop(0, '#1a1128')
      gradient.addColorStop(1, '#0f0a1a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 600, 400)

      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 3
      ctx.strokeRect(10, 10, 580, 380)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 72px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(result.score.toString(), 300, 120)

      ctx.font = '20px sans-serif'
      ctx.fillStyle = '#a78bfa'
      ctx.fillText('緣分分數', 300, 150)

      ctx.font = 'bold 28px sans-serif'
      ctx.fillStyle = '#f5f0ff'
      ctx.fillText(`${result.myName}  ♥  ${result.partnerName}`, 300, 195)

      ctx.strokeStyle = '#7c3aed'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(50, 210)
      ctx.lineTo(550, 210)
      ctx.stroke()

      ctx.font = 'bold 18px sans-serif'
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(result.wuxingConclusion, 300, 245)

      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#c4b5fd'
      const explanations = result.explanation.slice(0, 3)
      explanations.forEach((exp, i) => {
        const text = `• ${exp.substring(0, 45)}`
        ctx.fillText(text, 50, 275 + i * 28)
      })

      ctx.font = '12px sans-serif'
      ctx.fillStyle = '#6b7280'
      ctx.fillText('命定天子/命定天女 | fate-match', 300, 385)

      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `fate-match-${result.score}.png`
      link.href = url
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

  return (
    <div>
      <div ref={cardRef} className="hidden" />

      <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/40 rounded-2xl p-5 border border-purple-400/30 mb-4">
        <div className="text-center mb-4">
          <div className="text-6xl font-black mb-1" style={{ color: scoreColor }}>
            {result.score}
          </div>
          <p className="text-purple-400 text-sm">緣分分數</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-purple-800/50 rounded-full px-4 py-2">
            <span className="text-purple-200 font-bold">{result.myName}</span>
          </div>
          <Heart size={20} className="text-pink-400 fill-pink-400" />
          <div className="bg-pink-800/50 rounded-full px-4 py-2">
            <span className="text-pink-200 font-bold">{result.partnerName}</span>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <p className="text-yellow-300 font-bold text-sm text-center">{result.wuxingConclusion}</p>
        </div>

        <div className="h-40 mb-4">
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

        <div className="space-y-2 mb-4">
          {result.explanation.map((exp, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-purple-400 mt-0.5">{i === 0 ? <Star size={12} /> : <Zap size={12} />}</span>
              <p className="text-purple-200 text-sm leading-relaxed">{exp}</p>
            </div>
          ))}
        </div>

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
