import { useState } from 'react'
import { User, Save, Calendar } from 'lucide-react'
import type { Person } from '../types'
import { saveMyData, loadMyData } from '../utils/storage'

interface Props {
  onSaved?: () => void
}

export default function MyDataForm({ onSaved }: Props) {
  const [name, setName] = useState(() => {
    const existing = loadMyData()
    return existing?.name ?? ''
  })
  const [birthDate, setBirthDate] = useState(() => loadMyData()?.birthDate ?? '')
  const [gender, setGender] = useState<'male' | 'female'>(() => {
    const existing = loadMyData()
    return existing?.gender ?? 'female'
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

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
    const person: Person = { id: 'my-data', name: name.trim(), birthDate, gender }
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
        {/* Gender toggle: 命定天子 / 命定天女 */}
        <div>
          <label className="block text-sm text-purple-300 mb-2">性別（選擇命定類型）</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                gender === 'male'
                  ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/30'
                  : 'bg-purple-900/30 text-purple-400 border-2 border-transparent hover:border-purple-500/30'
              }`}
            >
              ♂ 命定天子
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                gender === 'female'
                  ? 'bg-pink-600 text-white border-2 border-pink-400 shadow-lg shadow-pink-500/30'
                  : 'bg-purple-900/30 text-purple-400 border-2 border-transparent hover:border-purple-500/30'
              }`}
            >
              ♀ 命定天女
            </button>
          </div>
          <p className="text-purple-600 text-xs mt-1 text-center">
            {gender === 'male' ? '想認識女性伴侶' : '想認識男性伴侶'}
          </p>
        </div>

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
