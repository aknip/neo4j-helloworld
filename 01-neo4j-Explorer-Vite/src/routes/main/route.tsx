import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppProvider } from '@/context/app-context'
import { FlexibleThemeProvider } from '@/context/flexible-theme-provider'

export const Route = createFileRoute('/main')({
  component: () => (
    <AppProvider appId='main'>
      <FlexibleThemeProvider defaultTheme='main-light'>
        <Outlet />
      </FlexibleThemeProvider>
    </AppProvider>
  ),
})
