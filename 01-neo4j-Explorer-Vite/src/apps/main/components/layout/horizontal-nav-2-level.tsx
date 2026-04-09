/**
 * Two-Level Horizontal Navigation
 *
 * Similar to the assekuradeur horizontal nav but uses:
 * - Reference-app sidebar data
 * - CSS variables from theme for colors (--theme-header-background, --primary)
 * - More flexible styling that adapts to different themes
 */

import { Link, useLocation } from '@tanstack/react-router'
import { ChevronDown, User, LogOut } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/apps/main/components/ui/avatar'
import { sidebarData } from './sidebar-data'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ConfigDrawer } from '@/apps/main/components/config-drawer'
import { AppSwitch } from '@/apps/main/components/app-switch'
import { useState, useMemo } from 'react'

const user = sidebarData.user

export function HorizontalNav2Level() {
  const location = useLocation()
  const { themeConfig } = useFlexibleTheme()

  // Check if header should be sticky (default to true for backwards compatibility)
  const isSticky = themeConfig?.header?.sticky ?? true

  // Determine active level 1 item based on current path
  const activeLevel1 = useMemo(() => {
    const path = location.pathname
    for (const group of sidebarData.navGroups) {
      for (const item of group.items) {
        if ('url' in item && path.startsWith(item.url)) {
          return group.title
        }
        if ('items' in item) {
          for (const subItem of item.items || []) {
            if (path.startsWith(subItem.url)) {
              return group.title
            }
          }
        }
      }
    }
    return sidebarData.navGroups[0]?.title || '' // Default to first group
  }, [location.pathname])

  const [selectedLevel1, setSelectedLevel1] = useState(activeLevel1)

  // Get level 2 items based on selected level 1
  const level2Items = useMemo(() => {
    const group = sidebarData.navGroups.find((g) => g.title === selectedLevel1)
    return group?.items || []
  }, [selectedLevel1])

  return (
    <header className={cn(
      'z-50 w-full shadow-[0_2px_4px_rgba(0,0,0,0.1)]',
      isSticky && 'sticky top-0'
    )}>
      {/* Logo and User Menu - Blue Navigation Bar */}
      <div
        className="relative pt-[60px] pb-4 text-white overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-header-background, hsl(var(--primary)))',
        }}
      >
        {/* Content */}
        <div
          className="relative z-10 flex items-center justify-between w-full"
          style={{
            maxWidth: 'var(--theme-header-max-width, 100%)',
            marginInline: 'auto',
            paddingLeft: 'var(--theme-content-padding, 1.5rem)',
            paddingRight: 'var(--theme-content-padding, 1.5rem)',
          }}
        >
          {/* Logo / Brand */}
          <Link to="/main/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-[hsl(var(--primary))] font-bold text-lg">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">Reference App</span>
              <span className="font-light text-sm opacity-80">Two-Level Navigation</span>
            </div>
          </Link>

          {/* Theme Controls & User Menu */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <ConfigDrawer />
            <AppSwitch />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 text-white hover:bg-white/10 hover:text-white">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
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
      </div>

      {/* Level 1 Navigation - Light background */}
      <div className="h-[38px] bg-[hsl(var(--secondary))] border-b border-[hsl(var(--border))] overflow-x-auto">
        <nav
          className="flex items-center gap-1 h-full"
          style={{
            maxWidth: 'var(--theme-header-max-width, 100%)',
            marginInline: 'auto',
            paddingLeft: 'var(--theme-content-padding, 1.5rem)',
            paddingRight: 'var(--theme-content-padding, 1.5rem)',
          }}
        >
          {sidebarData.navGroups.map((group) => {
            const isActive = selectedLevel1 === group.title
            return (
              <button
                key={group.title}
                onClick={() => setSelectedLevel1(group.title)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-[border-color,color] duration-150 whitespace-nowrap border-b-[3px]',
                  isActive
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                    : 'border-transparent text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]'
                )}
              >
                {group.title}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Level 2 Navigation - White background */}
      <div className="h-[38px] bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] overflow-x-auto">
        <nav
          className="flex items-center gap-1 h-full"
          style={{
            maxWidth: 'var(--theme-header-max-width, 100%)',
            marginInline: 'auto',
            paddingLeft: 'var(--theme-content-padding, 1.5rem)',
            paddingRight: 'var(--theme-content-padding, 1.5rem)',
          }}
        >
          {level2Items.map((item) => {
            const Icon = item.icon

            // Check if this item has sub-items (NavCollapsible)
            if ('items' in item && item.items) {
              const hasActiveChild = item.items.some((subItem) =>
                location.pathname.startsWith(subItem.url)
              )

              return (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-[border-color,color] duration-150 whitespace-nowrap border-b-[3px]',
                        hasActiveChild
                          ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                          : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]'
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.title}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.items.map((subItem) => {
                      const SubIcon = subItem.icon
                      return (
                        <DropdownMenuItem key={subItem.url} asChild>
                          <Link to={subItem.url} className="flex items-center gap-2">
                            {SubIcon && <SubIcon className="h-4 w-4" />}
                            {subItem.title}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }

            // Regular NavLink item
            if (!('url' in item)) return null

            // Check if active, but ensure more specific URLs take precedence
            const isActive = location.pathname.startsWith(item.url) &&
                             !level2Items.some(otherItem =>
                               otherItem !== item &&
                               'url' in otherItem &&
                               otherItem.url.length > item.url.length &&
                               location.pathname.startsWith(otherItem.url)
                             )
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-[border-color,color] duration-150 whitespace-nowrap border-b-[3px]',
                  isActive
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.title}
                {item.badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
