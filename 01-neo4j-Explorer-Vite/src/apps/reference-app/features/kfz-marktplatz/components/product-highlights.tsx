import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/apps/reference-app/components/ui/card'
import { Button } from '@/apps/reference-app/components/ui/button'
import { products } from '../data/products'

export function ProductHighlights() {
  const highlightedProducts = products.slice(0, 6)

  return (
    <section className='mx-auto max-w-7xl px-4 py-12 pt-8 sm:px-6 sm:py-24 sm:pt-16 lg:px-8 bg-muted/50'>
      <div className='text-center'>
        <h2 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
          Beliebte Produkte
        </h2>
        <p className='mt-2 text-muted-foreground'>
          Entdecken Sie unsere meistgewählten Versicherungsprodukte
        </p>
      </div>

      <div className='grid gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-3'>
        {highlightedProducts.map((product) => {
          const Icon = product.icon
          return (
            <Card
              key={product.id}
              className='flex flex-col transition-all hover:shadow-lg bg-card'
            >
              <CardHeader>
                <div className='mb-3 inline-block rounded-lg bg-muted p-2.5'>
                  <Icon className='h-5 w-5 text-muted-foreground' />
                </div>
                <CardTitle className='text-lg'>{product.name}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-1 flex-col'>
                <p className='mb-4 flex-1 text-sm text-muted-foreground'>
                  {product.shortDescription}
                </p>
                <div className='mb-4 space-y-1'>
                  {product.highlights.slice(0, 2).map((highlight, idx) => (
                    <div key={idx} className='flex items-start gap-2'>
                      <span className='mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0' />
                      <span className='text-xs text-muted-foreground'>
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant='ghost'
                  className='w-full justify-between'
                >
                  Mehr erfahren
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
