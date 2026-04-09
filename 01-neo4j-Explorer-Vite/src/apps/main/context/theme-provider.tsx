import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>

// Reference App: Light theme as permanent default (session-only changes)
const DEFAULT_THEME: Theme = 'light'

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  resetTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: DEFAULT_THEME,
  resolvedTheme: 'light',
  setTheme: () => null,
  resetTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ReferenceAppThemeProvider({ children }: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(DEFAULT_THEME)

  const resolvedTheme = useMemo((): ResolvedTheme => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return theme as ResolvedTheme
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
      root.classList.remove('light', 'dark')
      root.classList.add(currentResolvedTheme)
    }

    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light'
        applyTheme(systemTheme)
      }
    }

    applyTheme(resolvedTheme)

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, resolvedTheme])

  const setTheme = (newTheme: Theme) => {
    _setTheme(newTheme)
  }

  const resetTheme = () => {
    _setTheme(DEFAULT_THEME)
  }

  const contextValue: ThemeProviderState = {
    theme,
    resolvedTheme,
    setTheme,
    resetTheme,
  }

  return <ThemeContext value={contextValue}>{children}</ThemeContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReferenceAppTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useReferenceAppTheme must be used within a ReferenceAppThemeProvider')
  return context
}

// Re-export as useTheme for compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { useReferenceAppTheme as useTheme }
