import { cn } from '@/lib/utils'
import { ThemeSwitcher } from '@/apps/main/components/theme-switcher'
import { AppSwitcher } from '@/apps/main/components/app-switcher'

function ExampleWrapper({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className='bg-background min-h-screen w-full flex flex-col'>
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex h-14 items-center px-4 md:px-6'>
          <div className='font-semibold'>main</div>
          <div className='ms-auto flex items-center space-x-2'>
            <ThemeSwitcher />
            <AppSwitcher currentApp='main' />
          </div>
        </div>
      </header>
      <div
        data-slot='example-wrapper'
        className={cn(
          'mx-auto grid w-full max-w-5xl min-w-0 flex-1 content-center items-start gap-8 p-4 pt-2 sm:gap-12 sm:p-6 md:grid-cols-2 md:gap-8 lg:p-12 2xl:max-w-6xl',
          className
        )}
        {...props}
      />
    </div>
  )
}

function Example({
  title,
  children,
  className,
  containerClassName,
  ...props
}: React.ComponentProps<'div'> & {
  title?: string
  containerClassName?: string
}) {
  return (
    <div
      data-slot='example'
      className={cn(
        'mx-auto flex w-full max-w-lg min-w-0 flex-col gap-1 self-stretch lg:max-w-none',
        containerClassName
      )}
      {...props}
    >
      {title && (
        <div className='text-muted-foreground px-1.5 py-2 text-xs font-medium'>
          {title}
        </div>
      )}
      <div
        data-slot='example-content'
        className={cn(
          "bg-background text-foreground flex min-w-0 flex-1 flex-col items-center gap-6 border border-dashed p-4 sm:p-6 *:[div:not([class*='w-'])]:w-full",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { ExampleWrapper, Example }
