import { useState, useEffect } from 'react'
import { Heart, BookOpen, Clock, Sparkles } from 'lucide-react'
import MyDataForm from './components/MyDataForm'
import PartnerList from './components/PartnerList'
import MatchEngine from './components/MatchEngine'
import MatchResultCard from './components/MatchResultCard'
import HistoryPanel from './components/HistoryPanel'
import type { Person, MatchResult, Tab } from './types'
import { loadMyData } from './utils/storage'

export default function App() {
  const [tab, setTab] = useState<Tab>('myData')
  const [myData, setMyData] = useState<Person | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<Person | null>(null)
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null)
  const [matchKey, setMatchKey] = useState(0)

  useEffect(() => {
    setMyData(loadMyData())
  }, [])

  function handleMyDataSaved() {
    setMyData(loadMyData())
  }

  function handleSelectPartner(p: Person) {
    setSelectedPartner(p)
    setSelectedResult(null)
    setMatchKey(k => k + 1)
  }

  function handleSelectHistory(result: MatchResult) {
    setSelectedResult(result)
    setSelectedPartner(null)
  }

  function handleNewMatch() {
    setSelectedResult(null)
    setMatchKey(k => k + 1)
  }

  const tabs: { key: Tab; label: string; icon: typeof Heart }[] = [
    { key: 'myData', label: '我的資料', icon: BookOpen },
    { key: 'matchList', label: '對象名單', icon: Heart },
    { key: 'history', label: '歷史記錄', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-[#0f0a1a] text-purple-100 pb-8" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Sparkles size={24} className="text-yellow-300" />
          <h1 className="text-2xl font-black text-white">命定天子 / 命定天女</h1>
        </div>
        <p className="text-purple-300 text-sm ml-9">八字合盤・命理配對</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-purple-950/80 mx-4 mt-4 rounded-2xl p-1 border border-purple-500/20">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-purple-400 hover:text-purple-200'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="px-4 mt-4 space-y-4">
        {tab === 'myData' && (
          <>
            <MyDataForm onSaved={handleMyDataSaved} />
            {myData && (
              <div className="bg-purple-950/60 rounded-2xl p-5 border border-purple-500/20">
                <p className="text-purple-400 text-sm mb-2">已儲存的資料</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-xl font-black text-white">
                    {myData.name[0]}
                  </div>
                  <div>
                    <p className="text-purple-100 font-bold">{myData.name}</p>
                    <p className="text-purple-500 text-sm">出生：{myData.birthDate}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'matchList' && (
          <>
            <PartnerList
              selectedId={selectedPartner?.id ?? null}
              onSelect={handleSelectPartner}
            />
            {selectedPartner && (
              <MatchEngine
                key={matchKey}
                myData={myData}
                selectedPartner={selectedPartner}
              />
            )}
          </>
        )}

        {tab === 'history' && (
          <HistoryPanel onSelect={handleSelectHistory} />
        )}
      </div>

      {/* Result overlay when history item is selected */}
      {selectedResult && (
        <div className="px-4 mt-4">
          <button
            onClick={() => setSelectedResult(null)}
            className="mb-3 text-purple-400 text-sm hover:text-purple-200 transition-colors"
          >
            ← 返回列表
          </button>
          <MatchResultCard result={selectedResult} />
          <button
            onClick={handleNewMatch}
            className="w-full mt-3 bg-purple-700 hover:bg-purple-600 text-purple-200 font-bold py-3 rounded-xl transition-colors"
          >
            開始新配對
          </button>
        </div>
      )}
    </div>
  )
}
