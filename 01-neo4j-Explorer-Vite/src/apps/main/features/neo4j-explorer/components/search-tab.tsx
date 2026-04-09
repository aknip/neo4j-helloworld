import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchNodes } from '../lib/api'
import { useExplorerState } from '../hooks/use-explorer-state'
import { displayName, primaryLabel, labelColor } from '../lib/utils'
import { useSettings } from '../hooks/use-settings'
import { Input } from '@/apps/main/components/ui/input'
import { Badge } from '@/apps/main/components/ui/badge'
import { Skeleton } from '@/apps/main/components/ui/skeleton'

export function SearchTab() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { navigateToNode } = useExplorerState()
  const { labelDisplayName, propertyDisplayName } = useSettings()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchNodes(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const allLabels = [
    ...new Set((results ?? []).flatMap((r) => r.labels)),
  ].sort()

  return (
    <div className='space-y-4'>
      <Input
        placeholder='Suchbegriff eingeben (z.B. Mueller, Allianz, Feuer...)'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className='max-w-md'
      />

      {debouncedQuery.length < 2 && (
        <p className='text-muted-foreground text-sm'>
          Mindestens 2 Zeichen eingeben.
        </p>
      )}

      {isLoading && <Skeleton className='h-40 w-full' />}

      {debouncedQuery.length >= 2 && !isLoading && !results?.length && (
        <p className='text-muted-foreground text-sm'>Keine Treffer.</p>
      )}

      {results && results.length > 0 && (
        <div className='space-y-1'>
          <p className='text-muted-foreground text-sm'>
            {results.length} Treffer
          </p>
          {results.map((r) => {
            const name = displayName(r.props)
            const pLabel = primaryLabel(r.labels)
            const color = labelColor(pLabel, allLabels)
            return (
              <button
                key={r.eid}
                className='hover:bg-accent flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors'
                onClick={() => navigateToNode(r.eid, pLabel)}
              >
                <span
                  className='inline-block h-3 w-3 shrink-0 rounded-full'
                  style={{ backgroundColor: color }}
                />
                <span className='font-medium'>{name}</span>
                <Badge variant='secondary'>{labelDisplayName(pLabel)}</Badge>
                <span className='text-muted-foreground text-xs'>
                  gefunden in: {r.hits.map((h) => propertyDisplayName(h)).join(', ')}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
