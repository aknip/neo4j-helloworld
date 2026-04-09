import { Link, useLocation } from '@tanstack/react-router'
import { ChevronDown, User, LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlexibleTheme } from '@/context/flexible-theme-provider'
import { Button } from '@/apps/reference-app/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/apps/reference-app/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/apps/reference-app/components/ui/avatar'
import { sidebarData } from './sidebar-data'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ConfigDrawer } from '@/apps/reference-app/components/config-drawer'
import { AppSwitch } from '@/apps/reference-app/components/app-switch'
import { Search } from '@/apps/reference-app/components/search'

const user = sidebarData.user

// Flatten nav items for horizontal display (only first-level items)
const mainNavItems = sidebarData.navGroups[0]?.items || []

export function HorizontalNav() {
  const location = useLocation()
  const { themeConfig } = useFlexibleTheme()

  // Check if header should be sticky (default to true for backwards compatibility)
  const isSticky = themeConfig?.header?.sticky ?? true

  return (
    <header className={cn(
      'z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      isSticky && 'sticky top-0'
    )}>
      <div
        className="flex h-16 items-center justify-between"
        style={{
          maxWidth: 'var(--theme-header-max-width, 100%)',
          marginInline: 'auto',
          paddingLeft: 'var(--theme-content-padding, 1.5rem)',
          paddingRight: 'var(--theme-content-padding, 1.5rem)',
        }}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-6">
          <Link to="/reference-app/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              R
            </div>
            <span className="font-semibold text-lg hidden sm:inline-block">
              Reference App
            </span>
          </Link>

          {/* Main Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => {
              // Skip items without URL (collapsible items)
              if (!('url' in item)) return null

              const isActive = location.pathname.startsWith(item.url)
              const Icon = item.icon
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.title}
                  {item.badge && (
                    <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* More dropdown for additional nav groups */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  More
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {sidebarData.navGroups.slice(1).map((group) => (
                  <div key={group.title}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {group.title}
                    </div>
                    {group.items.map((item) => {
                      if ('url' in item) {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem key={item.url} asChild>
                            <Link to={item.url} className="flex items-center gap-2">
                              {Icon && <Icon className="h-4 w-4" />}
                              {item.title}
                            </Link>
                          </DropdownMenuItem>
                        )
                      }
                      // Collapsible items - show first sub-item
                      if ('items' in item && item.items?.[0]) {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem key={item.title} asChild>
                            <Link to={item.items[0].url} className="flex items-center gap-2">
                              {Icon && <Icon className="h-4 w-4" />}
                              {item.title}
                            </Link>
                          </DropdownMenuItem>
                        )
                      }
                      return null
                    })}
                    <DropdownMenuSeparator />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Right Side: Search, Theme, User */}
        <div className="flex items-center gap-2">
          <Search />
          <ThemeSwitcher />
          <ConfigDrawer />
          <AppSwitch />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/reference-app/settings" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/reference-app/sign-in" className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav
        className="lg:hidden flex items-center gap-1 pb-2 overflow-x-auto border-t pt-2"
        style={{
          maxWidth: 'var(--theme-header-max-width, 100%)',
          marginInline: 'auto',
          paddingLeft: 'var(--theme-content-padding, 1.5rem)',
          paddingRight: 'var(--theme-content-padding, 1.5rem)',
        }}
      >
        {mainNavItems.map((item) => {
          if (!('url' in item)) return null

          const isActive = location.pathname.startsWith(item.url)
          const Icon = item.icon
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.title}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
