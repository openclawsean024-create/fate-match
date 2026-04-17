import { useEffect, useState } from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import type { MatchResult } from '../types'
import { loadHistory } from '../utils/storage'

interface Props {
  onSelect: (result: MatchResult) => void
}

export default function HistoryPanel({ onSelect }: Props) {
  const [history, setHistory] = useState<MatchResult[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  function formatDate(iso: string) {
    const d = new Date(iso)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const getScoreColor = (score: number) =>
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-pink-400'

  return (
    <div className="bg-purple-950/60 rounded-2xl p-5 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-purple-400" />
        <h2 className="text-lg font-bold text-purple-200">歷史記錄</h2>
        <span className="ml-auto text-purple-600 text-xs">最近10筆</span>
      </div>

      {history.length === 0 && (
        <p className="text-purple-700 text-sm text-center py-6">尚無記錄，完成配對後可回顧</p>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {history.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center justify-between p-3 bg-purple-900/20 border border-transparent hover:border-purple-500/30 rounded-xl cursor-pointer transition-all"
          >
            <div>
              <p className="text-purple-100 text-sm font-medium">
                {item.myName} ♥ {item.partnerName}
              </p>
              <p className="text-purple-600 text-xs">{formatDate(item.date)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-lg ${getScoreColor(item.score)}`}>{item.score}</span>
              <ChevronRight size={16} className="text-purple-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}