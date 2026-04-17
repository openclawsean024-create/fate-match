import { useState, useEffect } from 'react'
import { User, Save, Calendar } from 'lucide-react'
import type { Person } from '../types'
import { saveMyData, loadMyData } from '../utils/storage'

interface Props {
  onSaved?: () => void
}

export default function MyDataForm({ onSaved }: Props) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const existing = loadMyData()
    if (existing) {
      setName(existing.name)
      setBirthDate(existing.birthDate)
    }
  }, [])

  const today = new Date().toISOString().split('T')[0]

  function validate(): boolean {
    if (!name.trim()) {
      setError('請輸入姓名')
      return false
    }
    if (name.trim().length < 1) {
      setError('姓名至少1個字')
      return false
    }
    if (!birthDate) {
      setError('請選擇出生日期')
      return false
    }
    if (birthDate > today) {
      setError('出生日期不得為未來')
      return false
    }
    setError('')
    return true
  }

  function handleSave() {
    if (!validate()) return
    const person: Person = { id: 'my-data', name: name.trim(), birthDate }
    saveMyData(person)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved?.()
  }

  return (
    <div className="bg-purple-950/60 rounded-2xl p-5 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-4">
        <User size={18} className="text-purple-400" />
        <h2 className="text-lg font-bold text-purple-200">我的資料</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-purple-300 mb-1">姓名</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="輸入你的姓名"
            className="w-full bg-purple-900/30 border border-purple-500/30 rounded-xl px-4 py-3 text-purple-100 placeholder-purple-700 focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-purple-300 mb-1">出生日期</label>
          <div className="relative">
            <input
              type="date"
              value={birthDate}
              max={today}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full bg-purple-900/30 border border-purple-500/30 rounded-xl px-4 py-3 text-purple-100 focus:outline-none focus:border-purple-400 transition-colors"
            />
            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none" />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {saved ? '已儲存 ✓' : '儲存我的資料'}
        </button>
      </div>
    </div>
  )
}
