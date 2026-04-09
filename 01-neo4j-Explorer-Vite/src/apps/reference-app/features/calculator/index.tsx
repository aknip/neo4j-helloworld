import { Header } from '@/apps/reference-app/components/layout/header'
import { Main } from '@/apps/reference-app/components/layout/main'
import { Search } from '@/apps/reference-app/components/search'
import { ThemeSwitch } from '@/apps/reference-app/components/theme-switch'
import { ConfigDrawer } from '@/apps/reference-app/components/config-drawer'
import { ProfileDropdown } from '@/apps/reference-app/components/profile-dropdown'
import { PremiumCalculator } from '@/apps/portal-1/features/oldtimer-versicherung/components/premium-calculator'

export function Calculator() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-0'>
        <div className='px-4 py-12 md:py-16 max-w-6xl mx-auto w-full'>
          <div className='mb-8 text-center'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4'>
              Premium Calculator
            </h2>
            <p className='text-lg text-gray-600 dark:text-gray-400'>
              Calculate your insurance premium in five simple steps
            </p>
          </div>
          <PremiumCalculator />
        </div>
      </Main>
    </>
  )
}
