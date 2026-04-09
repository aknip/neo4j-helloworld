import { createContext, useContext, type ReactNode } from 'react'

export type AppId = 'main' | 'reference-app' | 'kfz-marktplatz' | 'kfz-marktplatz-old' | 'portal-central' | 'portal-2' | 'makler' | 'assekuradeur' | 'versicherer' | 'a12-design' | 'shadcn-create'

interface AppContextValue {
  appId: AppId
}

const AppContext = createContext<AppContextValue | null>(null)

interface AppProviderProps {
  appId: AppId
  children: ReactNode
}

export function AppProvider({ appId, children }: AppProviderProps) {
  return <AppContext value={{ appId }}>{children}</AppContext>
}

export function useCurrentApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useCurrentApp must be used within an AppProvider')
  }
  return context
}
