import { SavedAssessmentRecord } from '../types/assessment'

const STORAGE_PREFIX = 'xiaoan_assessment_history_v2_'

export function getAssessmentHistory(userId: string = 'guest'): SavedAssessmentRecord[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((r) => !r.userId || r.userId === userId)
    }
    return []
  } catch (err) {
    console.warn('Failed to load assessment history:', err)
    return []
  }
}

export function saveAssessmentRecord(
  record: SavedAssessmentRecord,
  userId: string = 'guest'
): boolean {
  try {
    const safeRecord: SavedAssessmentRecord = {
      ...record,
      userId,
    }
    const current = getAssessmentHistory(userId)
    // Prepend new record so latest is first
    const updated = [safeRecord, ...current.filter((r) => r.id !== safeRecord.id)].slice(0, 50)
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
    return true
  } catch (err) {
    console.error('Failed to save assessment record:', err)
    return false
  }
}

export function deleteAssessmentRecord(id: string, userId: string = 'guest'): boolean {
  try {
    const current = getAssessmentHistory(userId)
    const updated = current.filter((r) => r.id !== id)
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated))
    return true
  } catch (err) {
    console.error('Failed to delete assessment record:', err)
    return false
  }
}
