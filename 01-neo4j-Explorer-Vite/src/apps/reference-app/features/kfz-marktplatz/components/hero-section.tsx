import { Button } from '@/apps/reference-app/components/ui/button'

export function HeroSection() {
  return (
    <section className='relative overflow-hidden bg-background'>
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl'>
            Landing Page
          </h1>
          <p className='mt-4 text-lg text-muted-foreground'>
            Erkunden Sie unser vielfältiges Produktangebot und finden Sie die richtige Lösung
          </p>
          <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center'>
            <Button size='lg'>
              Produkte entdecken
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
