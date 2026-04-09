import { useContext } from 'react'
import { LayoutContext, type Collapsible, type Variant, type LayoutContextType } from '@/context/layout-provider'

// Reference App: Fixed settings - inset sidebar, default layout
const FIXED_VARIANT: Variant = 'inset'
const FIXED_COLLAPSIBLE: Collapsible = 'icon'

type LayoutProviderProps = {
  children: React.ReactNode
}

export function ReferenceAppLayoutProvider({ children }: LayoutProviderProps) {
  // For ReferenceApp, layout is fixed - all setter methods are no-ops
  const contextValue: LayoutContextType = {
    resetLayout: () => {}, // No-op for fixed layout
    defaultCollapsible: FIXED_COLLAPSIBLE,
    collapsible: FIXED_COLLAPSIBLE,
    setCollapsible: () => {}, // No-op for fixed layout
    defaultVariant: FIXED_VARIANT,
    variant: FIXED_VARIANT,
    setVariant: () => {}, // No-op for fixed layout
  }

  return <LayoutContext value={contextValue}>{children}</LayoutContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReferenceAppLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useReferenceAppLayout must be used within a ReferenceAppLayoutProvider')
  }
  return context
}

// Re-export as useLayout for compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { useReferenceAppLayout as useLayout }
