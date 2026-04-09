import { DirectionProvider } from '@/context/direction-provider'
import { LayoutProvider } from '@/context/layout-provider'
import { ReferenceAppThemeProvider } from '@/apps/reference-app/context/theme-provider'
import { ReferenceAppFontProvider } from '@/apps/reference-app/context/font-provider'
import { SearchProvider } from '@/context/search-provider'
import { DynamicLayout } from './dynamic-layout'
import '@/apps/reference-app/styles/index.css'

export function ReferenceAppAuthenticatedLayout() {
  // Reference App: Layout determined by theme config (vertical-left, horizontal-top, hamburger)
  return (
    <div data-app="reference-app">
      <DirectionProvider>
        <ReferenceAppThemeProvider>
          <ReferenceAppFontProvider>
            <SearchProvider>
              <LayoutProvider>
                <DynamicLayout />
              </LayoutProvider>
            </SearchProvider>
          </ReferenceAppFontProvider>
        </ReferenceAppThemeProvider>
      </DirectionProvider>
    </div>
  )
}
