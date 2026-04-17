import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { Person } from '../types'
import { runMatch } from '../utils/bazi'
import { addToHistory } from '../utils/storage'
import MatchResultCard from './MatchResultCard'

interface Props {
  myData: Person | null
  selectedPartner: Person | null
}

export default function MatchEngine({ myData, selectedPartner }: Props) {
  const [result, setResult] = useState<ReturnType<typeof runMatch> | null>(null)
  const [loading, setLoading] = useState(false)

  const canMatch = myData && selectedPartner

  async function handleMatch() {
    if (!canMatch) return
    setLoading(true)
    setResult(null)

    await new Promise(r => setTimeout(r, 2500))

    const matchResult = runMatch(myData!, selectedPartner!)
    addToHistory(matchResult)
    setResult(matchResult)
    setLoading(false)
  }

  return (
    <div className="bg-purple-950/60 rounded-2xl p-5 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-yellow-400" />
        <h2 className="text-lg font-bold text-purple-200">配對分析</h2>
      </div>

      {!result && !loading && (
        <button
          onClick={handleMatch}
          disabled={!canMatch}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            canMatch
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/50'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Sparkles size={20} />
          {canMatch ? '開始分析配對' : '選擇對象後開始分析'}
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-purple-400 text-sm animate-pulse">命運齒輪轉動中...</p>
          <p className="text-purple-600 text-xs mt-1">八字的秘密即將揭曉</p>
        </div>
      )}

      {result && <MatchResultCard result={result} />}
    </div>
  )
}