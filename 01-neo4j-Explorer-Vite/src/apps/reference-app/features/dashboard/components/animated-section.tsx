import { ReactNode, ElementType } from 'react'
import { cn } from '@/lib/utils'
import { useAnimations } from '@/context/animations-provider'

interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: ElementType
}

export function AnimatedSection({
  children,
  delay = 0,
  className,
  as: Component = 'div'
}: AnimatedSectionProps) {
  const { animationsEnabled } = useAnimations()

  return (
    <Component
      className={cn(animationsEnabled && 'animate-fade-in-up', className)}
      style={
        animationsEnabled
          ? {
              animationDelay: `${delay}ms`,
              animationFillMode: 'both',
            }
          : undefined
      }
    >
      {children}
    </Component>
  )
}
