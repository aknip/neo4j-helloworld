import { createContext, useContext, useEffect, useState } from 'react'
import { fonts } from '@/config/fonts'

type ReferenceAppFont = (typeof fonts)[number]

const REFERENCE_APP_DEFAULT_FONT = 'inter'

type ReferenceAppFontContextType = {
  font: ReferenceAppFont
  setFont: (font: ReferenceAppFont) => void
  resetFont: () => void
  availableFonts: readonly ReferenceAppFont[]
}

const ReferenceAppFontContext = createContext<ReferenceAppFontContextType | null>(null)

export function ReferenceAppFontProvider({ children }: { children: React.ReactNode }) {
  const [font, _setFont] = useState<ReferenceAppFont>(REFERENCE_APP_DEFAULT_FONT)

  useEffect(() => {
    const applyFont = (font: string) => {
      const root = document.documentElement
      root.classList.forEach((cls) => {
        if (cls.startsWith('font-')) root.classList.remove(cls)
      })
      root.classList.add(`font-${font}`)
    }

    applyFont(font)
  }, [font])

  const setFont = (font: ReferenceAppFont) => {
    _setFont(font)
  }

  const resetFont = () => {
    _setFont(REFERENCE_APP_DEFAULT_FONT)
  }

  return (
    <ReferenceAppFontContext
      value={{ font, setFont, resetFont, availableFonts: fonts }}
    >
      {children}
    </ReferenceAppFontContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReferenceAppFont = () => {
  const context = useContext(ReferenceAppFontContext)
  if (!context) {
    throw new Error(
      'useReferenceAppFont must be used within a ReferenceAppFontProvider'
    )
  }
  return context
}
