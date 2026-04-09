/**
 * Dynamic Layout Component
 *
 * Wechselt zwischen verschiedenen Layout-Modi basierend auf dem Theme-Config:
 * - vertical-left: Standard Sidebar-Layout (Sidebar am linken Rand)
 * - vertical-centered: Zentriertes Sidebar-Layout (Sidebar + Content zentriert mit maxWidth)
 * - horizontal-top: Horizontale Navigation oben (1-stufig)
 * - horizontal-top-2-level: Horizontale Navigation oben (2-stufig mit blauem Header)
 * - hamburger: Mobile-Style Hamburger-Menü
 */

import { Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useFlexibleTheme } from '@/context/flexible-theme-provider'
import { SidebarInset, SidebarProvider } from '@/apps/main/components/ui/sidebar'
import { ReferenceAppSidebar } from './sidebar'
import { HorizontalNav } from './horizontal-nav'
import { HorizontalNav2Level } from './horizontal-nav-2-level'
import { HamburgerNav } from './hamburger-nav'
import { SkipToMain } from '@/apps/main/components/skip-to-main'

export function DynamicLayout() {
  const { themeConfig, isLoading, currentTheme } = useFlexibleTheme()

  // Determine navigation position from theme config
  const navPosition = themeConfig?.navigation?.position || 'vertical-left'

  // During loading, show a minimal layout to prevent flash
  if (isLoading && !themeConfig) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen bg-background">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Horizontal top navigation layout (single level)
  // Wrap with SidebarProvider (closed) to satisfy components that use useSidebar
  // Inner div with flex-col ensures vertical stacking since SidebarProvider uses flex-row
  if (navPosition === 'horizontal-top') {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex w-full flex-col">
          <SkipToMain />
          <HorizontalNav />
          <main
            id="content"
            className={cn(
              'min-h-[calc(100svh-4rem)]',
              'px-4 py-6 md:px-8 lg:px-12'
            )}
            style={{
              maxWidth: 'var(--theme-layout-max-width, 100%)',
              marginInline: 'auto',
            }}
          >
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    )
  }

  // Horizontal top 2-level navigation layout (assekuradeur-style)
  // Blue header with logo, two navigation levels below
  if (navPosition === 'horizontal-top-2-level') {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex w-full flex-col">
          <SkipToMain />
          <HorizontalNav2Level />
          <main
            id="content"
            className={cn(
              'min-h-[calc(100svh-180px)]',
              'px-4 py-6 md:px-8 lg:px-12'
            )}
            style={{
              maxWidth: 'var(--theme-layout-max-width, 100%)',
              marginInline: 'auto',
            }}
          >
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    )
  }

  // Hamburger navigation layout
  // Wrap with SidebarProvider (closed) to satisfy components that use useSidebar
  // Inner div with flex-col ensures vertical stacking since SidebarProvider uses flex-row
  if (navPosition === 'hamburger') {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex w-full flex-col">
          <SkipToMain />
          <HamburgerNav />
          <main
            id="content"
            className={cn(
              'min-h-[calc(100svh-3.5rem)]',
              'px-4 py-4 md:px-6'
            )}
            style={{
              maxWidth: 'var(--theme-layout-max-width, 100%)',
              marginInline: 'auto',
            }}
          >
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    )
  }

  // Use collapsedByDefault from theme config to determine initial sidebar state
  const sidebarDefaultOpen = !(themeConfig?.navigation?.collapsedByDefault ?? false)

  // Vertical centered layout: Sidebar + Content centered with maxWidth
  // The outer wrapper provides positioning context and centering
  // CSS overrides change sidebar from fixed to absolute positioning
  if (navPosition === 'vertical-centered') {
    return (
      <>
        {/* CSS override to change sidebar from fixed to absolute positioning */}
        <style>{`
          [data-nav-centered] [data-slot="sidebar-container"] {
            position: absolute !important;
            inset-inline-start: 0 !important;
          }
          [data-nav-centered] [data-slot="sidebar-container"][data-side="left"] {
            left: 0 !important;
            right: auto !important;
          }
        `}</style>
        <div
          className="relative mx-auto min-h-svh"
          style={{
            maxWidth: 'var(--theme-layout-max-width, 100%)',
          }}
        >
          <SidebarProvider
            key={`sidebar-centered-${currentTheme}`}
            defaultOpen={sidebarDefaultOpen}
            data-nav-centered
          >
            <SkipToMain />
            <ReferenceAppSidebar />
            <SidebarInset
              className={cn(
                '@container/content flex-1',
                'has-data-[layout=fixed]:h-svh',
                'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
              )}
            >
              <Outlet />
            </SidebarInset>
          </SidebarProvider>
        </div>
      </>
    )
  }

  // Default: Vertical left sidebar layout (sidebar at viewport edge)
  // Key includes theme ID to force remount when theme changes,
  // ensuring collapsedByDefault is applied correctly
  return (
    <SidebarProvider key={`sidebar-${currentTheme}`} defaultOpen={sidebarDefaultOpen}>
      <SkipToMain />
      <ReferenceAppSidebar />
      <SidebarInset
        className={cn(
          '@container/content',
          'has-data-[layout=fixed]:h-svh',
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
        )}
      >
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
