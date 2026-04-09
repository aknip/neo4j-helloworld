import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchImportFiles, resetAndImport, fetchStats } from '../lib/api'
import type { ImportResult } from '../lib/types'
import { Button } from '@/apps/main/components/ui/button'
import { Input } from '@/apps/main/components/ui/input'
import { Label } from '@/apps/main/components/ui/label'
import { Badge } from '@/apps/main/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/apps/main/components/ui/sheet'
import { Separator } from '@/apps/main/components/ui/separator'
import { toast } from 'sonner'
import { Upload, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export function ImportPanel() {
  const [cypherDir, setCypherDir] = useState('Ontology_UWWB/cypher')
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const queryClient = useQueryClient()

  const { data: files } = useQuery({
    queryKey: ['import-files', cypherDir],
    queryFn: () => fetchImportFiles(cypherDir),
    enabled: cypherDir.length > 0,
  })

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })

  const handleImport = async () => {
    setImporting(true)
    setResults([])
    try {
      const res = await resetAndImport(cypherDir)
      setResults(res.results)
      toast.success(
        `Import abgeschlossen: ${res.stats.nodes} Nodes, ${res.stats.rels} Beziehungen`
      )
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries()
    } catch (err) {
      toast.error(`Import fehlgeschlagen: ${err}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm'>
          <Upload className='mr-1 h-4 w-4' />
          Import
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[400px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Cypher-Import</SheetTitle>
        </SheetHeader>

        <div className='mt-4 space-y-4'>
          {/* Verzeichnis-Auswahl */}
          <div>
            <Label>Cypher-Verzeichnis</Label>
            <Input
              value={cypherDir}
              onChange={(e) => setCypherDir(e.target.value)}
              placeholder='Pfad zum Verzeichnis mit .cypher-Dateien'
            />
          </div>

          {/* Datei-Liste */}
          {files && files.length > 0 && (
            <div>
              <p className='text-muted-foreground mb-1 text-sm'>
                {files.length} Dateien:
              </p>
              <div className='bg-muted max-h-40 overflow-y-auto rounded-md p-2 text-xs'>
                {files.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
            </div>
          )}

          {files && files.length === 0 && cypherDir && (
            <p className='text-muted-foreground text-sm'>
              Keine .cypher-Dateien im Verzeichnis
            </p>
          )}

          <Separator />

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={importing || !files?.length}
            className='w-full'
          >
            {importing
              ? 'Importiere...'
              : 'Datenbank zurücksetzen & importieren'}
          </Button>

          {/* Ergebnisse */}
          {results.length > 0 && (
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Ergebnis:</p>
              {results.map((r) => (
                <div key={r.file} className='flex items-center gap-2 text-sm'>
                  {r.status === 'ok' && (
                    <CheckCircle className='h-4 w-4 text-green-500' />
                  )}
                  {r.status === 'warning' && (
                    <AlertTriangle className='h-4 w-4 text-yellow-500' />
                  )}
                  {r.status === 'error' && (
                    <XCircle className='h-4 w-4 text-red-500' />
                  )}
                  <span>{r.file}</span>
                  <span className='text-muted-foreground text-xs'>
                    {r.detail}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Statistik */}
          <div className='flex gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats?.nodes ?? '—'}</p>
              <p className='text-muted-foreground text-xs'>Nodes</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold'>{stats?.rels ?? '—'}</p>
              <p className='text-muted-foreground text-xs'>Beziehungen</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
