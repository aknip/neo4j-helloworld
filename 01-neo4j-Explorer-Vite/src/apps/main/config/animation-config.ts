/**
 * Zentrale Konfiguration für Staggering-Animationen in der Reference-App
 *
 * Diese Datei definiert alle Timing-Parameter für die AnimatedSection-Komponente.
 * Änderungen an den Geschwindigkeiten müssen nur hier vorgenommen werden.
 */

/**
 * Basis-Delays für verschiedene Sektionstypen (in Millisekunden)
 */
export const BASE_DELAYS = {
  /** Seiten-Header: Wird als erstes angezeigt */
  header: 0,
  /** Erste Sektion nach dem Header (z.B. Stat Cards) */
  firstSection: 50,
  /** Tabs-Sektion */
  tabs: 100,
} as const

/**
 * Stagger-Increments für verschiedene Element-Typen (in Millisekunden)
 * Diese Werte werden zum Base-Delay addiert, um aufeinanderfolgende Elemente zu verzögern
 */
export const STAGGER_INCREMENTS = {
  /** Standard-Cards (KPI, Statistik) */
  cards: 25,
  /** Dashboard Content-Bereiche (Overview, Recent Sales) */
  contentSections: 50,
  /** Tabellen-Zeilen (keine Animation für bessere Performance) */
  tableRows: 0,
} as const

/**
 * Dashboard-spezifische Delays
 */
export const DASHBOARD_DELAYS = {
  /** Header mit Download-Button */
  header: BASE_DELAYS.header,
  /** Tabs-Liste */
  tabs: BASE_DELAYS.tabs,
  /** Stat-Cards (Total Revenue, Subscriptions, Sales, Active Now) */
  statCards: {
    base: 150,
    increment: STAGGER_INCREMENTS.cards,
  },
  /** Content-Bereiche im Overview-Tab */
  overviewContent: {
    overview: 300,
    recentSales: 350,
  },
  /** Analytics-Tab Content */
  analyticsContent: 200,
} as const

/**
 * Tasks-spezifische Delays
 */
export const TASKS_DELAYS = {
  /** Page Header (Titel, Beschreibung, Buttons) */
  header: BASE_DELAYS.header,
  /** Tasks-Tabelle */
  table: BASE_DELAYS.firstSection,
} as const

/**
 * Users-spezifische Delays
 */
export const USERS_DELAYS = {
  /** Page Header (Titel, Beschreibung, Buttons) */
  header: BASE_DELAYS.header,
  /** Users-Tabelle */
  table: BASE_DELAYS.firstSection,
} as const

/**
 * Chats-spezifische Delays
 */
export const CHATS_DELAYS = {
  /** Chat-Liste Header (Inbox + Search) */
  listHeader: BASE_DELAYS.header,
  /** Chat-Liste */
  chatList: BASE_DELAYS.firstSection,
  /** Chat-Bereich (rechte Seite) */
  chatArea: 100,
} as const

/**
 * Tab-Content-Animationen
 *
 * Diese Konfiguration wird von der AnimatedTabContent-Komponente verwendet.
 * Die Animation wird automatisch beim Tab-Wechsel getriggert.
 */
export const TAB_CONTENT_ANIMATION = {
  /** Animation-Dauer für Tab-Content beim Wechsel (in Millisekunden) */
  duration: 400,
  /** Animation-Typ: fade-in-up (definiert in global CSS) */
  type: 'fade-in-up' as const,
} as const

/**
 * Helper-Funktion: Berechnet das Delay für ein Element in einer staggered Liste
 *
 * @param base - Basis-Delay in Millisekunden
 * @param index - Index des Elements (0-basiert)
 * @param increment - Increment pro Element in Millisekunden
 * @returns Das berechnete Delay in Millisekunden
 *
 * @example
 * // Für Stat-Cards im Dashboard:
 * const delay = calculateStaggerDelay(150, 0, 25) // => 150ms für erstes Element
 * const delay = calculateStaggerDelay(150, 1, 25) // => 175ms für zweites Element
 */
export function calculateStaggerDelay(
  base: number,
  index: number,
  increment: number
): number {
  return base + index * increment
}

/**
 * Helper-Funktion: Erstellt ein Delay für Dashboard Stat-Cards
 *
 * @param index - Index der Card (0-basiert)
 * @returns Das berechnete Delay in Millisekunden
 */
export function getDashboardStatCardDelay(index: number): number {
  return calculateStaggerDelay(
    DASHBOARD_DELAYS.statCards.base,
    index,
    DASHBOARD_DELAYS.statCards.increment
  )
}
