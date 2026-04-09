/**
 * Flexible Theme Provider
 *
 * React Context Provider für das flexible Theme-System.
 * Verwaltet das aktuelle Theme, lädt Theme-CSS dynamisch und
 * synchronisiert mit URL-Parametern.
 *
 * Phase 4: Setzt config.json-Werte als CSS-Variablen auf dem Root-Element.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ThemeConfig, ThemeMetadata } from '@/types/theme';
import {
  getAvailableThemes,
  getCounterpartTheme,
  getDefaultThemeForApp,
  getThemeConfig,
  isDarkTheme,
  isValidTheme,
} from '@/lib/theme-registry';
import { loadTheme, preloadTheme } from '@/lib/theme-loader';
import { useThemeUrlParam } from '@/hooks/use-theme-url-param';

/**
 * Wendet die Theme-Konfiguration als CSS-Variablen auf das Root-Element an.
 */
function applyThemeConfigToCssVariables(config: ThemeConfig | null): void {
  const root = document.documentElement;

  if (!config) {
    // Entferne alle Theme-spezifischen CSS-Variablen
    root.style.removeProperty('--theme-layout-max-width');
    root.style.removeProperty('--theme-header-max-width');
    root.style.removeProperty('--theme-content-padding');
    root.style.removeProperty('--theme-content-padding-mobile');
    root.style.removeProperty('--theme-nav-width');
    root.style.removeProperty('--theme-nav-collapsed-width');
    root.style.removeProperty('--theme-header-height');
    root.style.removeProperty('--theme-footer-height');
    root.removeAttribute('data-layout');
    root.removeAttribute('data-nav-position');
    root.removeAttribute('data-nav-collapsible');
    root.removeAttribute('data-header-sticky');
    return;
  }

  // Layout-Variablen
  root.style.setProperty('--theme-layout-max-width', config.layout.maxWidth);
  root.style.setProperty('--theme-header-max-width', config.layout.headerMaxWidth || '100%');
  root.style.setProperty('--theme-content-padding', config.layout.contentPadding);
  root.style.setProperty('--theme-content-padding-mobile', config.layout.contentPaddingMobile);

  // Navigation-Variablen
  root.style.setProperty('--theme-nav-width', config.navigation.width);
  root.style.setProperty('--theme-nav-collapsed-width', config.navigation.collapsedWidth);

  // Header-Variablen
  root.style.setProperty('--theme-header-height', config.header.height);

  // Footer-Variablen
  root.style.setProperty('--theme-footer-height', config.footer.height);

  // Data-Attribute für CSS-Selektoren
  root.setAttribute('data-layout', config.layout.type);
  root.setAttribute('data-nav-position', config.navigation.position);
  root.setAttribute('data-nav-collapsible', String(config.navigation.collapsible));
  root.setAttribute('data-header-sticky', String(config.header.sticky));
}

interface FlexibleThemeContextValue {
  /** ID des aktuellen Themes */
  currentTheme: string;
  /** Konfiguration des aktuellen Themes */
  themeConfig: ThemeConfig | null;
  /** Liste aller verfügbaren Themes */
  availableThemes: ThemeMetadata[];
  /** Wechselt zu einem anderen Theme */
  setTheme: (themeId: string) => void;
  /** Wechselt zwischen Light und Dark Mode */
  toggleDarkMode: () => void;
  /** Ob gerade ein Theme geladen wird */
  isLoading: boolean;
  /** Ob das aktuelle Theme ein Dark-Theme ist */
  isDark: boolean;
  /** Ob ein Light/Dark-Gegenstück existiert */
  hasCounterpart: boolean;
}

const FlexibleThemeContext = createContext<FlexibleThemeContextValue | null>(null);

interface FlexibleThemeProviderProps {
  children: ReactNode;
  /** Optionales Default-Theme (überschreibt App-basiertes Default) */
  defaultTheme?: string;
}

export function FlexibleThemeProvider({ children, defaultTheme }: FlexibleThemeProviderProps) {
  const { themeFromUrl, setThemeInUrl } = useThemeUrlParam();
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedTheme, setLoadedTheme] = useState<string | null>(null);

  // Das effektive Theme (URL-Parameter > Default)
  const currentTheme = useMemo(() => {
    if (themeFromUrl && isValidTheme(themeFromUrl)) {
      return themeFromUrl;
    }
    if (defaultTheme && isValidTheme(defaultTheme)) {
      return defaultTheme;
    }
    return getDefaultThemeForApp(window.location.pathname);
  }, [themeFromUrl, defaultTheme]);

  // Verfügbare Themes
  const availableThemes = useMemo(() => getAvailableThemes(), []);

  // Prüfen ob Dark-Theme
  const isDark = useMemo(() => isDarkTheme(currentTheme), [currentTheme]);

  // Prüfen ob Gegenstück existiert
  const hasCounterpart = useMemo(() => getCounterpartTheme(currentTheme) !== null, [currentTheme]);

  // Theme laden wenn sich currentTheme ändert
  useEffect(() => {
    if (loadedTheme === currentTheme) {
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);

      // Theme-CSS laden
      const success = await loadTheme(currentTheme);
      if (cancelled) return;

      if (success) {
        // Theme-Config laden
        const config = await getThemeConfig(currentTheme);
        if (cancelled) return;

        // CSS-Variablen aus config.json anwenden
        applyThemeConfigToCssVariables(config);

        setThemeConfig(config);
        setLoadedTheme(currentTheme);

        // Gegenstück vorladen für schnelles Umschalten
        const counterpart = getCounterpartTheme(currentTheme);
        if (counterpart) {
          preloadTheme(counterpart);
        }
      }

      setIsLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [currentTheme, loadedTheme]);

  // Theme wechseln
  const setTheme = useCallback(
    (themeId: string) => {
      if (!isValidTheme(themeId)) {
        console.warn(`Invalid theme: "${themeId}"`);
        return;
      }
      setThemeInUrl(themeId);
    },
    [setThemeInUrl]
  );

  // Dark/Light Mode umschalten
  const toggleDarkMode = useCallback(() => {
    const counterpart = getCounterpartTheme(currentTheme);
    if (counterpart) {
      setTheme(counterpart);
    }
  }, [currentTheme, setTheme]);

  const value: FlexibleThemeContextValue = {
    currentTheme,
    themeConfig,
    availableThemes,
    setTheme,
    toggleDarkMode,
    isLoading,
    isDark,
    hasCounterpart,
  };

  return <FlexibleThemeContext.Provider value={value}>{children}</FlexibleThemeContext.Provider>;
}

/**
 * Hook zum Zugriff auf den Theme-Context.
 */
export function useFlexibleTheme(): FlexibleThemeContextValue {
  const context = useContext(FlexibleThemeContext);
  if (!context) {
    throw new Error('useFlexibleTheme must be used within a FlexibleThemeProvider');
  }
  return context;
}
