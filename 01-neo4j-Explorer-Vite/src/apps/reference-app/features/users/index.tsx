import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/apps/reference-app/components/config-drawer'
import { Header } from '@/apps/reference-app/components/layout/header'
import { Main } from '@/apps/reference-app/components/layout/main'
import { ProfileDropdown } from '@/apps/reference-app/components/profile-dropdown'
import { Search } from '@/apps/reference-app/components/search'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AppSwitch } from '@/apps/reference-app/components/app-switch'
import { AnimatedSection } from '../dashboard/components/animated-section'
import { USERS_DELAYS } from '@/apps/reference-app/config/animation-config'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { users } from './data/users'

const route = getRouteApi('/reference-app/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <UsersProvider>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitcher />
          <ConfigDrawer />
          <AppSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <AnimatedSection delay={USERS_DELAYS.header}>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
              <p className='text-muted-foreground'>
                Manage your users and their roles here.
              </p>
            </div>
            <UsersPrimaryButtons />
          </div>
        </AnimatedSection>
        <AnimatedSection delay={USERS_DELAYS.table}>
          <UsersTable data={users} search={search} navigate={navigate} />
        </AnimatedSection>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
