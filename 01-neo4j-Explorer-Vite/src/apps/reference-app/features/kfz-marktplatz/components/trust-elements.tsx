import { insurers } from '../data/insurers'

export function TrustElements() {
  return (
    <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold tracking-tight text-foreground'>
          Unsere Partner
        </h2>
        <p className='mt-2 text-muted-foreground'>
          Wir arbeiten mit führenden Herstellern und Partnern zusammen
        </p>
      </div>

      <div className='mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6'>
        {insurers.map((insurer) => (
          <div
            key={insurer.id}
            className='flex items-center justify-center rounded-lg border-2 border-border bg-card px-6 py-4 transition-all hover:border-primary/50 hover:bg-accent'
          >
            <span className='text-sm font-semibold text-foreground'>
              {insurer.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
