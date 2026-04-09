import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettings, saveSettings, reinitSettings } from '../lib/api'
import type { ExplorerSettings } from '../lib/types'
import { Button } from '@/apps/main/components/ui/button'
import { Input } from '@/apps/main/components/ui/input'
import { Switch } from '@/apps/main/components/ui/switch'
import { Separator } from '@/apps/main/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/apps/main/components/ui/table'
import { Skeleton } from '@/apps/main/components/ui/skeleton'
import { toast } from 'sonner'

export function SettingsTab() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['explorer-settings'],
    queryFn: fetchSettings,
  })

  const [draft, setDraft] = useState<ExplorerSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [reiniting, setReiniting] = useState(false)

  // Sync draft when settings load
  useEffect(() => {
    if (settings && !draft) {
      setDraft(structuredClone(settings))
    }
  }, [settings])

  if (isLoading || !draft) {
    return <Skeleton className='h-60 w-full' />
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings(draft)
      queryClient.invalidateQueries({ queryKey: ['explorer-settings'] })
      toast.success('Einstellungen gespeichert')
    } catch (err) {
      toast.error(`Fehler: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  const handleReinit = async () => {
    setReiniting(true)
    try {
      const fresh = await reinitSettings()
      setDraft(structuredClone(fresh))
      queryClient.invalidateQueries({ queryKey: ['explorer-settings'] })
      toast.success('Schema neu geladen')
    } catch (err) {
      toast.error(`Fehler: ${err}`)
    } finally {
      setReiniting(false)
    }
  }

  const setLabelVisible = (label: string, visible: boolean) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        labels: {
          ...prev.labels,
          [label]: { ...prev.labels[label], visible },
        },
      }
    })
  }

  const setLabelDisplayName = (label: string, displayName: string) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        labels: {
          ...prev.labels,
          [label]: { ...prev.labels[label], displayName },
        },
      }
    })
  }

  const setPropertyDisplayName = (prop: string, displayName: string) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        properties: {
          ...prev.properties,
          [prop]: { displayName },
        },
      }
    })
  }

  const setRelTypeDisplayName = (type: string, displayName: string) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        relationshipTypes: {
          ...prev.relationshipTypes,
          [type]: { displayName },
        },
      }
    })
  }

  const labelEntries = Object.entries(draft.labels).sort(([a], [b]) =>
    a.localeCompare(b)
  )
  const propertyEntries = Object.entries(draft.properties).sort(([a], [b]) =>
    a.localeCompare(b)
  )
  const relTypeEntries = Object.entries(draft.relationshipTypes).sort(
    ([a], [b]) => a.localeCompare(b)
  )

  return (
    <div className='space-y-8'>
      {/* Actions */}
      <div className='flex items-center gap-3'>
        <Button onClick={handleSave} disabled={saving || !isDirty}>
          {saving ? 'Speichere...' : 'Speichern'}
        </Button>
        <Button variant='outline' onClick={handleReinit} disabled={reiniting}>
          {reiniting ? 'Lade...' : 'Schema neu laden'}
        </Button>
        {isDirty && (
          <span className='text-muted-foreground text-sm'>
            Ungespeicherte Änderungen
          </span>
        )}
      </div>

      {/* Node Labels */}
      <div>
        <h2 className='mb-3 text-lg font-semibold'>Node Labels</h2>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-24'>Sichtbar</TableHead>
                <TableHead className='w-48'>Original-Name</TableHead>
                <TableHead>Anzeigename</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labelEntries.map(([key, val]) => (
                <TableRow key={key}>
                  <TableCell>
                    <Switch
                      checked={val.visible}
                      onCheckedChange={(v) => setLabelVisible(key, v)}
                    />
                  </TableCell>
                  <TableCell className='font-mono text-sm'>{key}</TableCell>
                  <TableCell>
                    <Input
                      value={val.displayName}
                      onChange={(e) =>
                        setLabelDisplayName(key, e.target.value)
                      }
                      className='max-w-xs'
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Properties */}
      <div>
        <h2 className='mb-3 text-lg font-semibold'>Properties</h2>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-48'>Original-Name</TableHead>
                <TableHead>Anzeigename</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyEntries.map(([key, val]) => (
                <TableRow key={key}>
                  <TableCell className='font-mono text-sm'>{key}</TableCell>
                  <TableCell>
                    <Input
                      value={val.displayName}
                      onChange={(e) =>
                        setPropertyDisplayName(key, e.target.value)
                      }
                      className='max-w-xs'
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Relationship Types */}
      <div>
        <h2 className='mb-3 text-lg font-semibold'>Beziehungstypen</h2>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-48'>Original-Name</TableHead>
                <TableHead>Anzeigename</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relTypeEntries.map(([key, val]) => (
                <TableRow key={key}>
                  <TableCell className='font-mono text-sm'>{key}</TableCell>
                  <TableCell>
                    <Input
                      value={val.displayName}
                      onChange={(e) =>
                        setRelTypeDisplayName(key, e.target.value)
                      }
                      className='max-w-xs'
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
