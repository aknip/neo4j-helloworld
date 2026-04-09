import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronDown, User, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFlexibleTheme } from '@/context/flexible-theme-provider'
import { Button } from '@/apps/main/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/apps/main/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/apps/main/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/apps/main/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '@/apps/main/components/ui/avatar'
import { sidebarData } from './sidebar-data'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ConfigDrawer } from '@/apps/main/components/config-drawer'
import { AppSwitch } from '@/apps/main/components/app-switch'
import { Search } from '@/apps/main/components/search'

const user = sidebarData.user

export function HamburgerNav() {
  const location = useLocation()
  const { themeConfig } = useFlexibleTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Check if header should be sticky (default to true for backwards compatibility)
  const isSticky = themeConfig?.header?.sticky ?? true

  return (
    <header className={cn(
      'z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      isSticky && 'sticky top-0'
    )}>
      <div
        className="flex h-14 items-center justify-between"
        style={{
          maxWidth: 'var(--theme-header-max-width, 100%)',
          marginInline: 'auto',
          paddingLeft: 'var(--theme-content-padding, 1rem)',
          paddingRight: 'var(--theme-content-padding, 1rem)',
        }}
      >
        {/* Left: Hamburger Menu + Logo */}
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    R
                  </div>
                  <span>Reference App</span>
                </SheetTitle>
              </SheetHeader>

              {/* Navigation Groups */}
              <nav className="flex flex-col gap-1 p-4">
                {sidebarData.navGroups.map((group) => (
                  <div key={group.title} className="mb-4">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.title}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        // Item with direct URL
                        if ('url' in item) {
                          const isActive = location.pathname.startsWith(item.url)
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.url}
                              to={item.url}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground hover:bg-accent'
                              )}
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                              {item.title}
                              {item.badge && (
                                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-1">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          )
                        }

                        // Collapsible item with sub-items
                        if ('items' in item && item.items) {
                          const Icon = item.icon
                          const hasActiveChild = item.items.some((subItem) =>
                            location.pathname.startsWith(subItem.url)
                          )
                          return (
                            <Collapsible key={item.title} defaultOpen={hasActiveChild}>
                              <CollapsibleTrigger asChild>
                                <button
                                  className={cn(
                                    'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    hasActiveChild
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-foreground hover:bg-accent'
                                  )}
                                >
                                  {Icon && <Icon className="h-4 w-4" />}
                                  {item.title}
                                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="ml-4 pl-3 border-l flex flex-col gap-0.5 mt-1">
                                  {item.items.map((subItem) => {
                                    const isActive = location.pathname === subItem.url
                                    const SubIcon = subItem.icon
                                    return (
                                      <Link
                                        key={subItem.url}
                                        to={subItem.url}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                          'flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors',
                                          isActive
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        )}
                                      >
                                        {SubIcon && <SubIcon className="h-4 w-4" />}
                                        {subItem.title}
                                      </Link>
                                    )
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        }

                        return null
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* User Section at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/main/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              R
            </div>
            <span className="font-semibold hidden sm:inline-block">
              Reference App
            </span>
          </Link>
        </div>

        {/* Right: Search, Theme, User */}
        <div className="flex items-center gap-1">
          <Search />
          <ThemeSwitcher />
          <ConfigDrawer />
          <AppSwitch />

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
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
                <Link to="/main/settings" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/main/sign-in" className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
