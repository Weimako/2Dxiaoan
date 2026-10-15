import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface ThemeContextType {
  soothing: boolean
  toggleSoothing: () => void
  setSoothing: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType>({
  soothing: false,
  toggleSoothing: () => {},
  setSoothing: () => {},
})

const STORAGE_KEY = 'xiaoan_soothing_mode'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [soothing, setSoothingState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(soothing))
    } catch {
      // ignore
    }
    // Update attribute on root element for instant style cascade
    const themeValue = soothing ? 'calm' : 'default'
    document.documentElement.setAttribute('data-theme', themeValue)
  }, [soothing])

  const toggleSoothing = () => {
    setSoothingState((prev) => !prev)
  }

  const setSoothing = (value: boolean) => {
    setSoothingState(value)
  }

  return (
    <ThemeContext.Provider value={{ soothing, toggleSoothing, setSoothing }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
