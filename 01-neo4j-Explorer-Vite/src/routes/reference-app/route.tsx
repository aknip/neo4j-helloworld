import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppProvider } from '@/context/app-context'
import { FlexibleThemeProvider } from '@/context/flexible-theme-provider'

export const Route = createFileRoute('/reference-app')({
  component: () => (
    <AppProvider appId='reference-app'>
      <FlexibleThemeProvider defaultTheme='reference-app-light'>
        <Outlet />
      </FlexibleThemeProvider>
    </AppProvider>
  ),
})
