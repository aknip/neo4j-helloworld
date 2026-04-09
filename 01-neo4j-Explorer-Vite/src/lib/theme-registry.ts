/**
 * Theme Registry
 *
 * Verwaltet die verfügbaren Themes und deren Metadaten.
 * Da wir zur Laufzeit keine Verzeichnisse scannen können,
 * werden die Themes hier statisch registriert.
 */

import type { ThemeConfig, ThemeMetadata } from '@/types/theme';

/**
 * Statische Liste aller verfügbaren Themes.
 * Neue Themes müssen hier hinzugefügt werden.
 */
const AVAILABLE_THEMES: ThemeMetadata[] = [
  // App-specific themes
  { id: 'reference-app-OLD-light', name: 'Reference App OLD Light', path: '/themes/reference-app-OLD-light' },
  { id: 'reference-app-OLD-dark', name: 'Reference App OLD Dark', path: '/themes/reference-app-OLD-dark' },
  { id: 'makler-light', name: 'Makler Light', path: '/themes/makler-light' },
  { id: 'makler-dark', name: 'Makler Dark', path: '/themes/makler-dark' },
  { id: 'versicherer-light', name: 'Versicherer Light', path: '/themes/versicherer-light' },
  { id: 'versicherer-dark', name: 'Versicherer Dark', path: '/themes/versicherer-dark' },
  { id: 'assekuradeur-light', name: 'Assekuradeur Light', path: '/themes/assekuradeur-light' },
  { id: 'assekuradeur-dark', name: 'Assekuradeur Dark', path: '/themes/assekuradeur-dark' },
  { id: 'shadcn-create-light', name: 'shadcn/create Light', path: '/themes/shadcn-create-light' },
  { id: 'shadcn-create-dark', name: 'shadcn/create Dark', path: '/themes/shadcn-create-dark' },
  // Alternative navigation layouts
  { id: 'horizontal-light', name: 'Horizontal Nav Light', path: '/themes/horizontal-light' },
  { id: 'horizontal-dark', name: 'Horizontal Nav Dark', path: '/themes/horizontal-dark' },
  { id: 'hamburger-light', name: 'Hamburger Nav Light', path: '/themes/hamburger-light' },
  { id: 'hamburger-dark', name: 'Hamburger Nav Dark', path: '/themes/hamburger-dark' },
  { id: 'maia-green-light', name: 'Maia Green Light', path: '/themes/maia-green-light' },
  { id: 'maia-green-dark', name: 'Maia Green Dark', path: '/themes/maia-green-dark' },
  { id: 'nova-green-light', name: 'Nova Green Light', path: '/themes/nova-green-light' },
  { id: 'nova-green-dark', name: 'Nova Green Dark', path: '/themes/nova-green-dark' },
  { id: 'shadcn-create-01-light', name: 'Shadcn Create 01 Light', path: '/themes/shadcn-create-01-light' },
  { id: 'shadcn-create-01-dark', name: 'Shadcn Create 01 Dark', path: '/themes/shadcn-create-01-dark' },
  { id: 'shadcn-create-02-light', name: 'Shadcn Create 02 Light', path: '/themes/shadcn-create-02-light' },
  { id: 'shadcn-create-02-dark', name: 'Shadcn Create 02 Dark', path: '/themes/shadcn-create-02-dark' },
  { id: 'shadcn-create-03-light', name: 'Shadcn Create 03 Light', path: '/themes/shadcn-create-03-light' },
  { id: 'shadcn-create-03-dark', name: 'Shadcn Create 03 Dark', path: '/themes/shadcn-create-03-dark' },
  { id: 'reference-app-light', name: 'Reference App Light', path: '/themes/reference-app-light' },
  { id: 'reference-app-dark', name: 'Reference App Dark', path: '/themes/reference-app-dark' },
  { id: 'wireframe-light', name: 'Wireframe Light', path: '/themes/wireframe-light' },
  { id: 'wireframe-dark', name: 'Wireframe Dark', path: '/themes/wireframe-dark' },
  { id: 'kfz-marktplatz-light', name: 'KFZ Marktplatz Light', path: '/themes/kfz-marktplatz-light' },
  { id: 'kfz-marktplatz-dark', name: 'KFZ Marktplatz Dark', path: '/themes/kfz-marktplatz-dark' },
  { id: 'main-light', name: 'Main Light', path: '/themes/main-light' },
  { id: 'main-dark', name: 'Main Dark', path: '/themes/main-dark' },
];

/**
 * Default-Themes pro App-Route.
 */
const DEFAULT_THEMES: Record<string, string> = {
  '/reference-app': 'reference-app-light',
  '/main': 'main-light',
};

/**
 * Gibt alle verfügbaren Themes zurück.
 */
export function getAvailableThemes(): ThemeMetadata[] {
  return [...AVAILABLE_THEMES];
}

/**
 * Prüft, ob ein Theme existiert.
 */
export function isValidTheme(themeId: string): boolean {
  return AVAILABLE_THEMES.some((theme) => theme.id === themeId);
}

/**
 * Gibt die Metadaten eines Themes zurück.
 */
export function getThemeMetadata(themeId: string): ThemeMetadata | undefined {
  return AVAILABLE_THEMES.find((theme) => theme.id === themeId);
}

/**
 * Lädt die config.json eines Themes.
 */
export async function getThemeConfig(themeId: string): Promise<ThemeConfig | null> {
  const metadata = getThemeMetadata(themeId);
  if (!metadata) {
    console.warn(`Theme "${themeId}" not found in registry`);
    return null;
  }

  try {
    const response = await fetch(`${metadata.path}/config.json`);
    if (!response.ok) {
      console.warn(`Failed to load config for theme "${themeId}": ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Error loading config for theme "${themeId}":`, error);
    return null;
  }
}

/**
 * Gibt das Default-Theme für eine App-Route zurück.
 */
export function getDefaultThemeForApp(appRoute: string): string {
  // Finde die passende Route (längster Match)
  const matchingRoute = Object.keys(DEFAULT_THEMES)
    .filter((route) => appRoute.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  return matchingRoute ? DEFAULT_THEMES[matchingRoute] : 'reference-app-light';
}

/**
 * Findet das Gegenstück-Theme (light ↔ dark).
 */
export function getCounterpartTheme(themeId: string): string | null {
  if (themeId.endsWith('-light')) {
    const darkTheme = themeId.replace('-light', '-dark');
    return isValidTheme(darkTheme) ? darkTheme : null;
  }
  if (themeId.endsWith('-dark')) {
    const lightTheme = themeId.replace('-dark', '-light');
    return isValidTheme(lightTheme) ? lightTheme : null;
  }
  return null;
}

/**
 * Prüft, ob ein Theme ein Dark-Theme ist.
 */
export function isDarkTheme(themeId: string): boolean {
  return themeId.endsWith('-dark');
}
