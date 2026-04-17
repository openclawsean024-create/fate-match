import { useState, useEffect } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import type { Person } from '../types'
import { savePartners, loadPartners } from '../utils/storage'

interface Props {
  selectedId: string | null
  onSelect: (p: Person) => void
}

export default function PartnerList({ selectedId, onSelect }: Props) {
  const [partners, setPartners] = useState<Person[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBirth, setNewBirth] = useState('')
  const [formError, setFormError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    setPartners(loadPartners())
  }, [])

  function validate(): boolean {
    setFormError('')
    if (!newName.trim() || newName.trim().length < 1) {
      setFormError('姓名至少1個字')
      return false
    }
    if (!newBirth) {
      setFormError('請選擇出生日期')
      return false
    }
    if (newBirth > today) {
      setFormError('出生日期不得為未來')
      return false
    }
    return true
  }

  function handleAdd() {
    if (!validate()) return
    const person: Person = {
      id: Date.now().toString(),
      name: newName.trim(),
      birthDate: newBirth,
    }
    const updated = [...partners, person]
    setPartners(updated)
    savePartners(updated)
    setNewName('')
    setNewBirth('')
    setShowForm(false)
  }

  function handleDelete(id: string) {
    const updated = partners.filter(p => p.id !== id)
    setPartners(updated)
    savePartners(updated)
  }

  return (
    <div className="bg-purple-950/60 rounded-2xl p-5 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-purple-400" />
          <h2 className="text-lg font-bold text-purple-200">對象名單</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={14} />
          新增
        </button>
      </div>

      {showForm && (
        <div className="bg-purple-900/40 rounded-xl p-4 mb-4 border border-purple-500/30 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="姓名"
            className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-100 placeholder-purple-700 focus:outline-none focus:border-purple-400 transition-colors text-sm"
          />
          <input
            type="date"
            value={newBirth}
            max={today}
            onChange={e => setNewBirth(e.target.value)}
            className="w-full bg-purple-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-100 focus:outline-none focus:border-purple-400 transition-colors text-sm"
          />
          {formError && <p className="text-red-400 text-xs">{formError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-sm py-2 rounded-lg transition-colors"
            >
              確認新增
            </button>
            <button
              onClick={() => { setShowForm(false); setNewName(''); setNewBirth(''); setFormError('') }}
              className="px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm py-2 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {partners.length === 0 && (
        <p className="text-purple-700 text-sm text-center py-6">尚無對象，點擊上方「新增」加入</p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {partners.map(p => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
              selectedId === p.id
                ? 'bg-purple-600/40 border border-purple-400/50'
                : 'bg-purple-900/20 border border-transparent hover:border-purple-500/30'
            }`}
          >
            <div>
              <p className="text-purple-100 font-medium text-sm">{p.name}</p>
              <p className="text-purple-500 text-xs">{p.birthDate}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); handleDelete(p.id) }}
              className="text-red-400 hover:text-red-300 p-1 transition-colors"
              title="刪除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
