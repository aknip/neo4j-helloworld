import { useQuery } from '@tanstack/react-query'
import { fetchLabels, fetchRelTypes } from '../lib/api'
import { useSettings } from '../hooks/use-settings'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/apps/main/components/ui/table'
import { Badge } from '@/apps/main/components/ui/badge'
import { Skeleton } from '@/apps/main/components/ui/skeleton'

export function SchemaTab() {
  const { labelDisplayName, propertyDisplayName, relTypeDisplayName } = useSettings()
  const {
    data: labels,
    isLoading: labelsLoading,
    error: labelsError,
  } = useQuery({ queryKey: ['schema', 'labels'], queryFn: fetchLabels })

  const {
    data: relTypes,
    isLoading: relsLoading,
    error: relsError,
  } = useQuery({ queryKey: ['schema', 'rels'], queryFn: fetchRelTypes })

  if (labelsLoading || relsLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-40 w-full' />
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-40 w-full' />
      </div>
    )
  }

  if (labelsError || relsError) {
    return (
      <p className='text-destructive'>
        Fehler beim Laden des Schemas: {String(labelsError || relsError)}
      </p>
    )
  }

  if (!labels?.length && !relTypes?.length) {
    return (
      <p className='text-muted-foreground'>
        Keine Daten vorhanden. Bitte zuerst Cypher-Dateien importieren.
      </p>
    )
  }

  return (
    <div className='space-y-8'>
      {/* Node Labels */}
      <div>
        <h2 className='mb-3 text-lg font-semibold'>Node Labels</h2>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead className='w-24 text-right'>Nodes</TableHead>
                <TableHead>Properties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labels?.map((l) => (
                <TableRow key={l.label}>
                  <TableCell className='font-medium'>{labelDisplayName(l.label)}</TableCell>
                  <TableCell className='text-right'>{l.count}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {l.properties.length > 0
                        ? l.properties.map((p) => (
                            <Badge key={p.property} variant='secondary'>
                              {propertyDisplayName(p.property)}
                              <span className='text-muted-foreground ml-1 text-xs'>
                                ({p.types.join(', ') || '?'})
                              </span>
                              {p.mandatory && (
                                <span className='text-destructive ml-0.5'>*</span>
                              )}
                            </Badge>
                          ))
                        : '—'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Relationship Types */}
      <div>
        <h2 className='mb-3 text-lg font-semibold'>Relationship Types</h2>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Typ</TableHead>
                <TableHead className='w-24 text-right'>Anzahl</TableHead>
                <TableHead>Properties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relTypes?.map((r) => (
                <TableRow key={r.type}>
                  <TableCell className='font-medium'>{relTypeDisplayName(r.type)}</TableCell>
                  <TableCell className='text-right'>{r.count}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {r.properties.length > 0
                        ? r.properties.map((p) => (
                            <Badge key={p.property} variant='secondary'>
                              {propertyDisplayName(p.property)}
                              <span className='text-muted-foreground ml-1 text-xs'>
                                ({p.types.join(', ') || '?'})
                              </span>
                            </Badge>
                          ))
                        : '—'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mermaid-Diagramm dynamisch generieren */}
      {labels && labels.length > 0 && relTypes && relTypes.length > 0 && (
        <MermaidDiagram labels={labels} relTypes={relTypes} />
      )}
    </div>
  )
}

function MermaidDiagram({
  labels,
  relTypes,
}: {
  labels: { label: string; count: number }[]
  relTypes: { type: string; count: number }[]
}) {
  // Mermaid-Syntax aus Schema generieren
  const lines = ['graph LR']
  for (const l of labels) {
    lines.push(`  ${l.label}["${l.label} (${l.count})"]`)
  }
  // Beziehungen als Edges zwischen Labels sind ohne vollständige Schema-Info
  // nicht 1:1 ableitbar — zeigen wir die RelTypes als Info-Box
  lines.push('')
  lines.push('  subgraph Beziehungen')
  for (const r of relTypes) {
    lines.push(`    ${r.type.replace(/[^a-zA-Z0-9_]/g, '_')}["${r.type} (${r.count})"]`)
  }
  lines.push('  end')

  return (
    <div>
      <h2 className='mb-3 text-lg font-semibold'>Ontologie-Übersicht</h2>
      <pre className='bg-muted rounded-md p-4 text-sm overflow-x-auto'>
        {lines.join('\n')}
      </pre>
    </div>
  )
}
