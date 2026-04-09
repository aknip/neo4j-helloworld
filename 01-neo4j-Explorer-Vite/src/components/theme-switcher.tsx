/**
 * Theme Switcher Component
 *
 * Dropdown-Komponente zum Wechseln zwischen verfügbaren Themes.
 * Zweistufiges Menü: 1. Ebene Themename, 2. Ebene Light/Dark Varianten.
 * Bietet zusätzlich einen Dark/Light-Mode Toggle wenn ein Gegenstück-Theme existiert.
 *
 * Hinweis: Verwendet die UI-Komponenten aus der Reference-App.
 * Bei Integration in andere Apps müssen ggf. die Imports angepasst werden.
 */

import { Moon, Palette, Sun, Check } from 'lucide-react';
import { Button } from '@/apps/reference-app/components/ui/button';
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
} from '@/apps/reference-app/components/ui/dropdown-menu';
import { useFlexibleTheme } from '@/context/flexible-theme-provider';

// Hilfsfunktion: Extrahiert den Basis-Namen eines Themes (ohne -light/-dark Suffix)
function getThemeBaseName(themeId: string): string {
  return themeId.replace(/-light$/, '').replace(/-dark$/, '');
}

// Hilfsfunktion: Formatiert den Basis-Namen für die Anzeige
function formatDisplayName(baseName: string): string {
  return baseName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface ThemeGroup {
  baseName: string;
  displayName: string;
  lightTheme?: { id: string; name: string };
  darkTheme?: { id: string; name: string };
}

export function ThemeSwitcher() {
  const { currentTheme, availableThemes, setTheme, toggleDarkMode, isDark, hasCounterpart } =
    useFlexibleTheme();

  // Themes nach Basis-Namen gruppieren
  const themeGroups: ThemeGroup[] = [];
  const groupMap = new Map<string, ThemeGroup>();

  availableThemes.forEach((theme) => {
    const baseName = getThemeBaseName(theme.id);

    if (!groupMap.has(baseName)) {
      const group: ThemeGroup = {
        baseName,
        displayName: formatDisplayName(baseName),
      };
      groupMap.set(baseName, group);
      themeGroups.push(group);
    }

    const group = groupMap.get(baseName)!;
    if (theme.id.endsWith('-dark')) {
      group.darkTheme = { id: theme.id, name: theme.name };
    } else {
      group.lightTheme = { id: theme.id, name: theme.name };
    }
  });

  // Gruppen alphabetisch sortieren
  themeGroups.sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Prüfen ob aktuelles Theme zu einer Gruppe gehört
  const currentBaseName = getThemeBaseName(currentTheme);

  return (
    <div className='flex items-center gap-4'>
      {/* Dark/Light Toggle Button (nur wenn Gegenstück existiert) */}
      {hasCounterpart && (
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleDarkMode}
          title={isDark ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
        >
          {isDark ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
          <span className='sr-only'>
            {isDark ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
          </span>
        </Button>
      )}

      {/* Theme Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' title='Theme wechseln'>
            <Palette className='h-4 w-4' />
            <span className='sr-only'>Theme wechseln</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel>Theme auswählen</DropdownMenuLabel>
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
  );
}
