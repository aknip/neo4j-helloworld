/**
 * Theme Loader
 *
 * Verantwortlich für das dynamische Laden und Entladen von Theme-CSS.
 */

import { getThemeMetadata, isValidTheme } from './theme-registry';

const THEME_STYLESHEET_ID = 'flexible-theme-stylesheet';
const PRELOAD_LINK_PREFIX = 'theme-preload-';

/**
 * Lädt ein Theme-CSS dynamisch.
 * Ersetzt das aktuell geladene Theme-CSS.
 */
export async function loadTheme(themeId: string): Promise<boolean> {
  if (!isValidTheme(themeId)) {
    console.warn(`Cannot load invalid theme: "${themeId}"`);
    return false;
  }

  const metadata = getThemeMetadata(themeId);
  if (!metadata) {
    return false;
  }

  const cssUrl = `${metadata.path}/theme.css`;

  // Prüfen ob die CSS-Datei existiert
  try {
    const response = await fetch(cssUrl, { method: 'HEAD' });
    if (!response.ok) {
      console.warn(`Theme CSS not found: ${cssUrl}`);
      return false;
    }
  } catch {
    console.warn(`Failed to check theme CSS: ${cssUrl}`);
    return false;
  }

  // Altes Theme-Stylesheet entfernen
  unloadTheme();

  // Neues Theme-Stylesheet hinzufügen
  const link = document.createElement('link');
  link.id = THEME_STYLESHEET_ID;
  link.rel = 'stylesheet';
  link.href = cssUrl;
  link.dataset.themeId = themeId;

  // Warten bis das CSS geladen ist
  return new Promise((resolve) => {
    link.onload = () => {
      // Theme-ID als data-Attribut auf dem HTML-Element setzen
      document.documentElement.dataset.theme = themeId;
      resolve(true);
    };
    link.onerror = () => {
      console.warn(`Failed to load theme CSS: ${cssUrl}`);
      resolve(false);
    };
    document.head.appendChild(link);
  });
}

/**
 * Entfernt das aktuell geladene Theme-CSS.
 */
export function unloadTheme(): void {
  const existingLink = document.getElementById(THEME_STYLESHEET_ID);
  if (existingLink) {
    existingLink.remove();
  }
  delete document.documentElement.dataset.theme;
}

/**
 * Lädt ein Theme-CSS vorab (Preload).
 * Nützlich für schnelleres Umschalten.
 */
export function preloadTheme(themeId: string): void {
  if (!isValidTheme(themeId)) {
    return;
  }

  const metadata = getThemeMetadata(themeId);
  if (!metadata) {
    return;
  }

  const preloadId = `${PRELOAD_LINK_PREFIX}${themeId}`;
  if (document.getElementById(preloadId)) {
    return; // Bereits vorgeladen
  }

  const link = document.createElement('link');
  link.id = preloadId;
  link.rel = 'preload';
  link.as = 'style';
  link.href = `${metadata.path}/theme.css`;
  document.head.appendChild(link);
}

/**
 * Gibt die ID des aktuell geladenen Themes zurück.
 */
export function getCurrentThemeId(): string | null {
  const link = document.getElementById(THEME_STYLESHEET_ID) as HTMLLinkElement | null;
  return link?.dataset.themeId ?? null;
}
