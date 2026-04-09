import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/apps/reference-app/components/ui/sidebar'
import { useFlexibleTheme } from '@/context/flexible-theme-provider'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
  /** Use theme CSS variables for height if available */
  useThemeVariables?: boolean
}

export function Header({ className, fixed, children, useThemeVariables = true, style, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const { themeConfig } = useFlexibleTheme()

  // Check if we're using vertical navigation (sidebar mode: vertical-left or vertical-centered)
  const navPosition = themeConfig?.navigation?.position
  const isVerticalNav = navPosition === 'vertical-left' || navPosition === 'vertical-centered' || !themeConfig

  // Check if header should be sticky - respect theme config, default to true
  const themeStickyEnabled = themeConfig?.header?.sticky ?? true
  // Only apply sticky if both `fixed` prop is true AND theme config allows it
  const isSticky = fixed && themeStickyEnabled

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  // Theme-Variablen als Inline-Style
  const themeStyle: React.CSSProperties = useThemeVariables
    ? {
        height: 'var(--theme-header-height, 4rem)',
        ...style,
      }
    : style;

  // Don't render this page-level header when using horizontal-top or hamburger navigation
  // because the layout already provides the navigation header
  if (!isVerticalNav) {
    return null
  }

  return (
    <header
      className={cn(
        'z-50',
        // Höhe nur wenn keine Theme-Variablen (sonst via style)
        !useThemeVariables && 'h-16',
        isSticky && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && isSticky ? 'shadow' : 'shadow-none',
        className
      )}
      style={themeStyle}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            isSticky &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        {children}
      </div>
    </header>
  )
}
