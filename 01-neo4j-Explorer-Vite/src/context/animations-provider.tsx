import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const DEFAULT_ANIMATIONS_ENABLED = true
const ANIMATIONS_COOKIE_NAME = 'animations-enabled'
const ANIMATIONS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type AnimationsContextType = {
  defaultAnimationsEnabled: boolean
  animationsEnabled: boolean
  setAnimationsEnabled: (enabled: boolean) => void
  resetAnimations: () => void
}

const AnimationsContext = createContext<AnimationsContextType | null>(null)

export function AnimationsProvider({ children }: { children: React.ReactNode }) {
  const [animationsEnabled, _setAnimationsEnabled] = useState<boolean>(() => {
    const cookieValue = getCookie(ANIMATIONS_COOKIE_NAME)
    if (cookieValue === null || cookieValue === undefined) {
      return DEFAULT_ANIMATIONS_ENABLED
    }
    return cookieValue === 'true'
  })

  useEffect(() => {
    const htmlElement = document.documentElement
    if (animationsEnabled) {
      htmlElement.classList.remove('animations-disabled')
    } else {
      htmlElement.classList.add('animations-disabled')
    }
  }, [animationsEnabled])

  const setAnimationsEnabled = (enabled: boolean) => {
    _setAnimationsEnabled(enabled)
    setCookie(ANIMATIONS_COOKIE_NAME, String(enabled), ANIMATIONS_COOKIE_MAX_AGE)
  }

  const resetAnimations = () => {
    _setAnimationsEnabled(DEFAULT_ANIMATIONS_ENABLED)
    removeCookie(ANIMATIONS_COOKIE_NAME)
  }

  return (
    <AnimationsContext
      value={{
        defaultAnimationsEnabled: DEFAULT_ANIMATIONS_ENABLED,
        animationsEnabled,
        setAnimationsEnabled,
        resetAnimations,
      }}
    >
      {children}
    </AnimationsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnimations() {
  const context = useContext(AnimationsContext)
  if (!context) {
    throw new Error('useAnimations must be used within an AnimationsProvider')
  }
  return context
}
