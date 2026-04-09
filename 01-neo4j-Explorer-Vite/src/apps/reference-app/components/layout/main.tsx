import { cn } from '@/lib/utils'

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  fluid?: boolean
  ref?: React.Ref<HTMLElement>
  /** Use theme CSS variables for padding/max-width if available */
  useThemeVariables?: boolean
}

export function Main({ fixed, className, fluid, useThemeVariables = true, style, ...props }: MainProps) {
  // Theme-Variablen als Inline-Style (wenn vorhanden, werden sie angewendet)
  const themeStyle: React.CSSProperties = useThemeVariables
    ? {
        // Padding aus Theme-Config (Fallback auf Standard)
        paddingLeft: 'var(--theme-content-padding, 1rem)',
        paddingRight: 'var(--theme-content-padding, 1rem)',
        // Max-Width aus Theme-Config (nur wenn nicht fluid)
        ...(fluid ? {} : { maxWidth: 'var(--theme-layout-max-width, 80rem)' }),
        ...style,
      }
    : style;

  return (
    <main
      data-layout={fixed ? 'fixed' : 'auto'}
      className={cn(
        'py-6',

        // Padding-Klassen nur wenn keine Theme-Variablen
        !useThemeVariables && 'px-4',

        // If layout is fixed, make the main container flex and grow
        fixed && 'flex grow flex-col overflow-hidden',

        // If layout is not fluid, set the max-width (nur wenn keine Theme-Variablen)
        !fluid && !useThemeVariables &&
          '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',

        // Wenn Theme-Variablen und nicht fluid, zentrieren
        !fluid && useThemeVariables && 'mx-auto w-full',

        className
      )}
      style={themeStyle}
      {...props}
    />
  )
}
