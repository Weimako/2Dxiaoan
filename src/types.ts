import { ReactNode } from 'react'

export type Page =
  | 'login'
  | 'home'
  | 'assessment'
  | 'quiz'
  | 'result'
  | 'settings'
  | 'tools'
  | 'tool-breathing'
  | 'tool-mood'
  | 'tool-meditation'
  | 'tool-energy'
  | 'videos'
  | 'video-detail'
  | 'chat'
  | 'emotion'
  | 'summary'
  | 'profile'
  | 'scripts'
  | 'articles'

export type IconName =
  | 'apple'
  | 'lock'
  | 'heart'
  | 'settings'
  | 'moon'
  | 'type'
  | 'arrow'
  | 'eye'
  | 'home'
  | 'video'
  | 'sparkles'
  | 'check'
  | 'bookmark'
  | 'share'
  | 'play'
  | 'pause'
  | 'rotate'
  | 'sun'
  | 'calendar'
  | 'user'

export interface VideoItem {
  id: string
  title: string
  sub: string
  time: string
  category: string
  tags: string[]
  description: string
  suitable: string
  accentColor: string
  watchedCount?: number
}

export interface MoodEntry {
  id: string
  date: string
  time: string
  mood: string
  note: string
  tags: string[]
}

export interface EnergyResult {
  score: number
  level: string
  date: string
  advice: string
  details: {
    sleep: string
    mood: string
    pressure: string
    energy: string
  }
}

export interface ChatDialogItem {
  id: string
  role: 'user' | 'assistant'
  text: string
  time: string
  userId?: string
  sessionId?: string
}
