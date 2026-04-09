import { ConfigDrawer } from '@/apps/reference-app/components/config-drawer'
import { Header } from '@/apps/reference-app/components/layout/header'
import { Main } from '@/apps/reference-app/components/layout/main'
import { ProfileDropdown } from '@/apps/reference-app/components/profile-dropdown'
import { Search } from '@/apps/reference-app/components/search'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AppSwitch } from '@/apps/reference-app/components/app-switch'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { tasks } from './data/tasks'
import { AnimatedSection } from '../dashboard/components/animated-section'
import { TASKS_DELAYS } from '@/apps/reference-app/config/animation-config'

export function Tasks() {
  return (
    <TasksProvider>
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
        <AnimatedSection delay={TASKS_DELAYS.header}>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
              <p className='text-muted-foreground'>
                Here&apos;s a list of your tasks for this month!
              </p>
            </div>
            <TasksPrimaryButtons />
          </div>
        </AnimatedSection>
        <AnimatedSection delay={TASKS_DELAYS.table}>
          <TasksTable data={tasks} />
        </AnimatedSection>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
