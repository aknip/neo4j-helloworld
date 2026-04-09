import { Header } from '@/apps/main/components/layout/header'
import { Main } from '@/apps/main/components/layout/main'
import { ProfileDropdown } from '@/apps/main/components/profile-dropdown'
import { Search } from '@/apps/main/components/search'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AppSwitch } from '@/apps/main/components/app-switch'
import { ConfigDrawer } from '@/apps/main/components/config-drawer'

export function Dashboard() {
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
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>
        <div className='flex items-center justify-center rounded-lg border border-dashed p-12'>
          <p className='text-muted-foreground'>
            Willkommen! Hier können neue Funktionen hinzugefügt werden.
          </p>
        </div>
      </Main>
    </>
  )
}
