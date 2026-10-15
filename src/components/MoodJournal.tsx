import { useState, useEffect } from 'react'
import { MoodEntry } from '../types'

interface MoodJournalProps {
  onBack: () => void
  userId?: string
}

const moodOptions = [
  { label: '开心', icon: '☀️', color: '#f3c784', bg: '#fdf7ea', tip: '心里像晴天，明朗温和' },
  { label: '平静', icon: '🍃', color: '#689e73', bg: '#eff7ee', tip: '心如止水，安然沉静' },
  { label: '疲惫', icon: '☁️', color: '#88989e', bg: '#f1f5f7', tip: '电量稍低，需要好好歇息' },
  { label: '焦虑', icon: '🌧️', color: '#bfa366', bg: '#fbf7eb', tip: '念头有些乱，步子踩得急' },
  { label: '难过', icon: '💧', color: '#638ea8', bg: '#edf4f8', tip: '胸口有点沉，想静静待着' },
  { label: '生气', icon: '⚡', color: '#c9776b', bg: '#fbf0ee', tip: '感觉界限被触碰，有些火气' },
]

const tagOptions = ['工作与学习', '人际相处', '身体感受', '天气与环境', '独处时光', '小确幸', '家庭生活']

export function MoodJournal({ onBack, userId = 'guest' }: MoodJournalProps) {
  const [selectedMood, setSelectedMood] = useState<string>('平静')
  const [note, setNote] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>(['独处时光'])
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [toast, setToast] = useState<string>('')

  const storageKey = `xiaoan_mood_entries_v2_${userId}`

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setEntries(JSON.parse(saved))
      } else {
        const sample: MoodEntry[] = [
          {
            id: 'sample-1',
            date: '今天',
            time: '09:20',
            mood: '平静',
            note: '早晨喝了一杯温水，窗外有轻轻的风，感觉新的一天可以慢慢来。',
            tags: ['独处时光', '身体感受'],
          },
        ]
        setEntries(sample)
        localStorage.setItem(storageKey, JSON.stringify(sample))
      }
    } catch {
      // Fallback
    }
  }, [storageKey])

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  function handleSave() {
    if (!selectedMood) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: dateStr,
      time: timeStr,
      mood: selectedMood,
      note: note.trim() || '随手记下了这一刻的心情。',
      tags: selectedTags,
    }

    const updated = [newEntry, ...entries]
    setEntries(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // Ignore
    }

    setNote('')
    setToast('心情记录已妥善收好 🌿')
    setTimeout(() => setToast(''), 3000)
  }

  function handleDelete(id: string) {
    const updated = entries.filter((e) => e.id !== id)
    setEntries(updated)
    try {
      localStorage.setItem('xiaoan_mood_entries', JSON.stringify(updated))
    } catch {
      // Ignore
    }
  }

  const activeMoodObj = moodOptions.find((m) => m.label === selectedMood) || moodOptions[0]

  return (
    <div className="mood-journal-layout">
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button onClick={() => setToast('')}>好的</button>
        </div>
      )}

      {/* Left panel: Mood input */}
      <section className="glass-card mood-card-input">
        <header className="mood-section-header">
          <h3>此刻的心情是怎样的？</h3>
          <p>选择一个最接近的心情，不需修饰，真实就好。</p>
        </header>

        {/* Mood choices */}
        <div className="mood-grid">
          {moodOptions.map((item) => {
            const isSelected = selectedMood === item.label
            return (
              <button
                key={item.label}
                type="button"
                className={`mood-choice-btn ${isSelected ? 'active' : ''}`}
                style={{
                  '--mood-color': item.color,
                  '--mood-bg': item.bg,
                } as React.CSSProperties}
                onClick={() => setSelectedMood(item.label)}
              >
                <span className="mood-icon">{item.icon}</span>
                <span className="mood-label">{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mood-hint" style={{ color: activeMoodObj.color }}>
          {activeMoodObj.icon} {activeMoodObj.label}：{activeMoodObj.tip}
        </div>

        {/* Context tags */}
        <div className="mood-tags-area">
          <label>关联生活维度：</label>
          <div className="mood-tags-row">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`mood-tag-pill ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Thoughts textarea */}
        <div className="mood-textarea-wrap">
          <label htmlFor="mood-note-input">发生或想到了什么？（可留空）</label>
          <textarea
            id="mood-note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="写一句给小安听，或者只是一串碎片杂念..."
            rows={3}
          />
        </div>

        <div className="mood-save-bar">
          <button className="primary-button" onClick={handleSave}>
            记录此刻心情
          </button>
        </div>
      </section>

      {/* Right panel: History and stats */}
      <section className="glass-card mood-history-panel">
        <header className="mood-history-header">
          <h3>我的心情轨迹</h3>
          <span className="mood-count-badge">已记录 {entries.length} 篇</span>
        </header>

        <div className="mood-entries-list">
          {entries.length === 0 ? (
            <div className="mood-empty-state">
              <span className="mood-empty-icon">🍃</span>
              <p>暂无记录，在左侧选一个心情开始吧。</p>
            </div>
          ) : (
            entries.map((entry) => {
              const moodInfo = moodOptions.find((m) => m.label === entry.mood) || moodOptions[1]
              return (
                <article key={entry.id} className="mood-history-item">
                  <div className="mood-item-top">
                    <span
                      className="mood-badge"
                      style={{ background: moodInfo.bg, color: moodInfo.color, borderColor: moodInfo.color }}
                    >
                      {moodInfo.icon} {entry.mood}
                    </span>
                    <time className="mood-time">
                      {entry.date} {entry.time}
                    </time>
                    <button
                      className="mood-del-btn"
                      onClick={() => handleDelete(entry.id)}
                      title="删除此条"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mood-note-content">{entry.note}</p>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="mood-item-tags">
                      {entry.tags.map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  )}
                </article>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
