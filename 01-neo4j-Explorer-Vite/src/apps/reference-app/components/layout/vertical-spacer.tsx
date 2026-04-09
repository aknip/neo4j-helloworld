interface VerticalSpacerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'h-8',      // 32px
  md: 'h-12',     // 48px
  lg: 'h-16',     // 64px
  xl: 'h-24',     // 96px
}

export function VerticalSpacer({ size = 'md', className }: VerticalSpacerProps) {
  return <div className={`${sizeMap[size]} ${className || ''}`} aria-hidden="true" />
}
