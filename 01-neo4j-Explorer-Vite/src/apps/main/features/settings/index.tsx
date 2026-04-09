import { Outlet } from '@tanstack/react-router'
import { Monitor, Bell, Palette, Wrench, UserCog } from 'lucide-react'
import { Separator } from '@/apps/main/components/ui/separator'
import { ConfigDrawer } from '@/apps/main/components/config-drawer'
import { Header } from '@/apps/main/components/layout/header'
import { Main } from '@/apps/main/components/layout/main'
import { ProfileDropdown } from '@/apps/main/components/profile-dropdown'
import { Search } from '@/apps/main/components/search'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AppSwitch } from '@/apps/main/components/app-switch'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: <Palette size={18} />,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: <Bell size={18} />,
  },
  {
    title: 'Display',
    href: '/settings/display',
    icon: <Monitor size={18} />,
  },
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitcher />
          <ConfigDrawer />
          <AppSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
