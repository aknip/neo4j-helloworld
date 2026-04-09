/**
 * Theme Switcher Component for Reference App
 */

import { Moon, Palette, Sun, Check } from 'lucide-react'
import { Button } from '@/apps/reference-app/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/apps/reference-app/components/ui/dropdown-menu'
import { useFlexibleTheme } from '@/context/flexible-theme-provider'

function getThemeBaseName(themeId: string): string {
  return themeId.replace(/-light$/, '').replace(/-dark$/, '')
}

function formatDisplayName(baseName: string): string {
  return baseName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface ThemeGroup {
  baseName: string
  displayName: string
  lightTheme?: { id: string; name: string }
  darkTheme?: { id: string; name: string }
}

export function ThemeSwitcher() {
  const { currentTheme, availableThemes, setTheme, toggleDarkMode, isDark, hasCounterpart } =
    useFlexibleTheme()

  const themeGroups: ThemeGroup[] = []
  const groupMap = new Map<string, ThemeGroup>()

  availableThemes.forEach((theme) => {
    const baseName = getThemeBaseName(theme.id)

    if (!groupMap.has(baseName)) {
      const group: ThemeGroup = {
        baseName,
        displayName: formatDisplayName(baseName),
      }
      groupMap.set(baseName, group)
      themeGroups.push(group)
    }

    const group = groupMap.get(baseName)!
    if (theme.id.endsWith('-dark')) {
      group.darkTheme = { id: theme.id, name: theme.name }
    } else {
      group.lightTheme = { id: theme.id, name: theme.name }
    }
  })

  themeGroups.sort((a, b) => a.displayName.localeCompare(b.displayName))
  const currentBaseName = getThemeBaseName(currentTheme)

  return (
    <div className='flex items-center gap-1'>
      {hasCounterpart && (
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleDarkMode}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
          <span className='sr-only'>
            {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' title='Change theme'>
            <Palette className='h-4 w-4' />
            <span className='sr-only'>Change theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themeGroups.map((group) => (
            <DropdownMenuSub key={group.baseName}>
              <DropdownMenuSubTrigger
                className={currentBaseName === group.baseName ? 'bg-accent/50' : ''}
              >
                <span className='flex items-center gap-2'>
                  {currentBaseName === group.baseName && (
                    <Check className='h-4 w-4' />
                  )}
                  <span className={currentBaseName !== group.baseName ? 'ml-6' : ''}>
                    {group.displayName}
                  </span>
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {group.lightTheme && (
                    <DropdownMenuItem
                      onClick={() => setTheme(group.lightTheme!.id)}
                      className={currentTheme === group.lightTheme.id ? 'bg-accent' : ''}
                    >
                      <Sun className='h-4 w-4 mr-2' />
                      Light
                      {currentTheme === group.lightTheme.id && (
                        <Check className='h-4 w-4 ml-auto' />
                      )}
                    </DropdownMenuItem>
                  )}
                  {group.darkTheme && (
                    <DropdownMenuItem
                      onClick={() => setTheme(group.darkTheme!.id)}
                      className={currentTheme === group.darkTheme.id ? 'bg-accent' : ''}
                    >
                      <Moon className='h-4 w-4 mr-2' />
                      Dark
                      {currentTheme === group.darkTheme.id && (
                        <Check className='h-4 w-4 ml-auto' />
                      )}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
