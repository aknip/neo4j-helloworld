import { FolderOpen, Target, Search } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/apps/reference-app/components/ui/card'
import { Button } from '@/apps/reference-app/components/ui/button'

export function AccessRoutes() {
  const routes = [
    {
      title: 'Kategorien',
      description: 'Nach Produktkategorie',
      icon: FolderOpen,
      subtitle: 'Finden Sie Produkte nach ihrer Kategorie',
    },
    {
      title: 'Ich suche...',
      description: 'Nach Bedarf',
      icon: Target,
      subtitle: 'Basierend auf Ihrem spezifischen Bedarf',
    },
    {
      title: 'Alle Produkte',
      description: 'Mit Filtern',
      icon: Search,
      subtitle: 'Durchsuchen Sie unser vollständiges Angebot',
    },
  ]

  return (
    <section className='mx-auto max-w-7xl px-4 py-16 pt-16 sm:px-6 sm:py-24 sm:pt-10 lg:px-8'>
      <div className='text-center'>
        <h2 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
          Wie möchten Sie vorgehen?
        </h2>
        <p className='mt-2 text-muted-foreground'>
          Wählen Sie Ihren bevorzugten Weg, um die richtige Lösung zu finden
        </p>
      </div>

      <div className='grid gap-4 mt-12 sm:grid-cols-2 lg:grid-cols-3'>
        {routes.map((route) => {
          const Icon = route.icon
          return (
            <Card
              key={route.title}
              className='cursor-pointer transition-all hover:shadow-lg'
            >
              <CardHeader>
                <div className='mb-4 inline-block rounded-lg bg-muted p-3'>
                  <Icon className='h-6 w-6 text-muted-foreground' />
                </div>
                <CardTitle className='text-xl'>{route.title}</CardTitle>
                <CardDescription className='text-base font-semibold text-foreground'>
                  {route.description}
                </CardDescription>
              </CardHeader>
              <div className='px-6 pb-6'>
                <p className='mb-4 text-sm text-muted-foreground'>
                  {route.subtitle}
                </p>
                <Button
                  variant='outline'
                  className='w-full'
                >
                  Erkunden
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
