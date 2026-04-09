import { ConfigDrawer } from '@/apps/reference-app/components/config-drawer'
import { Header } from '@/apps/reference-app/components/layout/header'
import { Main } from '@/apps/reference-app/components/layout/main'
import { ProfileDropdown } from '@/apps/reference-app/components/profile-dropdown'
import { Search } from '@/apps/reference-app/components/search'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AppSwitch } from '@/apps/reference-app/components/app-switch'
import { HeroSection } from './components/hero-section'
import { AccessRoutes } from './components/access-routes'
import { ProductHighlights } from './components/product-highlights'
import { TrustElements } from './components/trust-elements'

export function KfzMarktplatz() {
  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitcher />
          <ConfigDrawer />
          <AppSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <HeroSection />
        <AccessRoutes />
        <ProductHighlights />
        <TrustElements />
        <div className='bg-muted px-4 py-16 sm:px-6 sm:py-20 lg:px-8'>
          <div className='mx-auto max-w-7xl text-center'>
            <p className='text-sm text-muted-foreground'>
              © 2024 Landing Page. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </Main>
    </>
  )
}
