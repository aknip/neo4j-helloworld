/**
 * Hook für Theme URL-Parameter Synchronisation
 *
 * Liest den Theme-Parameter aus der URL und aktualisiert die URL bei Theme-Wechseln.
 * Verwendet window.history.replaceState für URL-Updates, um unabhängig vom Router zu bleiben.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { getDefaultThemeForApp, isValidTheme } from '@/lib/theme-registry';

interface UseThemeUrlParamReturn {
  /** Theme-ID aus URL oder Default-Theme */
  themeFromUrl: string;
  /** Setzt den Theme-Parameter in der URL */
  setThemeInUrl: (themeId: string) => void;
  /** Entfernt den Theme-Parameter aus der URL */
  clearThemeFromUrl: () => void;
}

/**
 * Hook zum Lesen und Setzen des Theme-Parameters in der URL.
 */
export function useThemeUrlParam(): UseThemeUrlParamReturn {
  const location = useLocation();
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams(window.location.search));

  // Update searchParams when location changes
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, [location.search]);

  // Aktuelle App-Route ermitteln (z.B. "/reference-app" aus "/reference-app/dashboard")
  const appRoute = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    return pathParts.length > 0 ? `/${pathParts[0]}` : '/';
  }, [location.pathname]);

  // Theme aus URL-Parameter lesen
  const themeFromUrl = useMemo(() => {
    const themeParam = searchParams.get('theme');

    if (themeParam && isValidTheme(themeParam)) {
      return themeParam;
    }

    // Fallback auf Default-Theme der App
    return getDefaultThemeForApp(appRoute);
  }, [searchParams, appRoute]);

  // Theme in URL setzen
  const setThemeInUrl = useCallback(
    (themeId: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set('theme', themeId);
      window.history.replaceState({}, '', url.toString());
      setSearchParams(new URLSearchParams(url.search));
    },
    []
  );

  // Theme aus URL entfernen
  const clearThemeFromUrl = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('theme');
    window.history.replaceState({}, '', url.toString());
    setSearchParams(new URLSearchParams(url.search));
  }, []);

  return {
    themeFromUrl,
    setThemeInUrl,
    clearThemeFromUrl,
  };
}
