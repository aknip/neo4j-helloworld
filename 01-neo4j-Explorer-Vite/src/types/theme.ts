/**
 * Flexible Theme System - Type Definitions
 *
 * Diese Typen definieren die Struktur für das Theme-Konfigurationssystem.
 */

export interface ThemeConfig {
  name: string;
  layout: ThemeLayoutConfig;
  navigation: ThemeNavigationConfig;
  header: ThemeHeaderConfig;
  footer: ThemeFooterConfig;
}

export interface ThemeLayoutConfig {
  type: 'scrolling' | 'fixed';
  maxWidth: string;
  /** Max-width for header/navigation area (defaults to "100%" if not specified) */
  headerMaxWidth?: string;
  contentPadding: string;
  contentPaddingMobile: string;
}

export interface ThemeNavigationConfig {
  position: 'vertical-left' | 'vertical-centered' | 'horizontal-top' | 'horizontal-top-2-level' | 'hamburger';
  width: string;
  collapsedWidth: string;
  collapsible: boolean;
  /** Whether the navigation should be collapsed by default (especially for vertical-left/vertical-centered) */
  collapsedByDefault?: boolean;
}

export interface ThemeHeaderConfig {
  height: string;
  sticky: boolean;
}

export interface ThemeFooterConfig {
  height: string;
}

export interface ThemeMetadata {
  id: string;
  name: string;
  path: string;
}
