import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchNodeDetail,
  updateNode,
  deleteNode,
  fetchLabels,
  fetchRelTypes,
  fetchNodes,
  createRelationship,
  deleteRelationship,
} from '../lib/api'
import { useExplorerState } from '../hooks/use-explorer-state'
import { displayName, primaryLabel, labelColor } from '../lib/utils'
import { useSettings } from '../hooks/use-settings'
import { Button } from '@/apps/main/components/ui/button'
import { Input } from '@/apps/main/components/ui/input'
import { Label } from '@/apps/main/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/apps/main/components/ui/select'
import { Badge } from '@/apps/main/components/ui/badge'
import { Skeleton } from '@/apps/main/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/apps/main/components/ui/alert-dialog'
import { Separator } from '@/apps/main/components/ui/separator'
import { toast } from 'sonner'
import { ArrowRight, ArrowLeft, Trash2, ExternalLink } from 'lucide-react'

export function NodeDetail() {
  const { selectedEid, setMode, setEid, setLabel, navigateToNode } =
    useExplorerState()
  const { labelDisplayName, propertyDisplayName, relTypeDisplayName } = useSettings()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['node-detail', selectedEid],
    queryFn: () => fetchNodeDetail(selectedEid!),
    enabled: !!selectedEid,
  })

  if (!selectedEid) return null

  if (isLoading) return <Skeleton className='h-60 w-full' />

  if (error || !data?.node) {
    return (
      <div>
        <p className='text-destructive'>Node nicht gefunden.</p>
        <Button
          variant='outline'
          className='mt-2'
          onClick={() => {
            setMode('browse')
            setEid(null)
          }}
        >
          Zurück
        </Button>
      </div>
    )
  }

  const { node, outRels, inRels } = data
  const labelsStr = node.labels.map((l) => `:${labelDisplayName(l)}`).join(', ')

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold'>
            {displayName(node.props)}{' '}
            <span className='text-muted-foreground text-base font-normal'>
              {labelsStr}
            </span>
          </h2>
        </div>
        <div className='flex gap-2'>
          <DeleteNodeButton
            eid={selectedEid}
            name={displayName(node.props)}
            onDeleted={() => {
              setMode('browse')
              setEid(null)
              queryClient.invalidateQueries({ queryKey: ['nodes'] })
              queryClient.invalidateQueries({ queryKey: ['schema'] })
            }}
          />
          <Button
            variant='outline'
            onClick={() => {
              setMode('browse')
              setEid(null)
            }}
          >
            Schließen
          </Button>
        </div>
      </div>

      <Separator />

      {/* Properties editieren */}
      <PropertyEditor
        eid={selectedEid}
        props={node.props}
        propertyDisplayName={propertyDisplayName}
        onSaved={() => {
          queryClient.invalidateQueries({
            queryKey: ['node-detail', selectedEid],
          })
        }}
      />

      <Separator />

      {/* Ausgehende Beziehungen */}
      <RelationshipSection
        title={`Ausgehende Beziehungen (${outRels.length})`}
        icon={<ArrowRight className='h-4 w-4' />}
        labelDisplayName={labelDisplayName}
        relTypeDisplayName={relTypeDisplayName}
        rels={outRels.map((r) => ({
          relId: r.relId,
          type: r.type,
          relProps: r.relProps,
          otherEid: r.targetId!,
          otherLabels: r.targetLabels!,
          otherProps: r.targetProps!,
          direction: 'out' as const,
        }))}
        onNavigate={navigateToNode}
        onDelete={(relId) => {
          deleteRelationship(relId).then(() => {
            queryClient.invalidateQueries({
              queryKey: ['node-detail', selectedEid],
            })
          })
        }}
      />

      {/* Eingehende Beziehungen */}
      <RelationshipSection
        title={`Eingehende Beziehungen (${inRels.length})`}
        icon={<ArrowLeft className='h-4 w-4' />}
        labelDisplayName={labelDisplayName}
        relTypeDisplayName={relTypeDisplayName}
        rels={inRels.map((r) => ({
          relId: r.relId,
          type: r.type,
          relProps: r.relProps,
          otherEid: r.sourceId!,
          otherLabels: r.sourceLabels!,
          otherProps: r.sourceProps!,
          direction: 'in' as const,
        }))}
        onNavigate={navigateToNode}
        onDelete={(relId) => {
          deleteRelationship(relId).then(() => {
            queryClient.invalidateQueries({
              queryKey: ['node-detail', selectedEid],
            })
          })
        }}
      />

      <Separator />

      {/* Beziehung erstellen */}
      <CreateRelationshipSection
        fromEid={selectedEid}
        labelDisplayName={labelDisplayName}
        relTypeDisplayName={relTypeDisplayName}
        onCreated={() => {
          queryClient.invalidateQueries({
            queryKey: ['node-detail', selectedEid],
          })
        }}
      />
    </div>
  )
}

function PropertyEditor({
  eid,
  props,
  propertyDisplayName,
  onSaved,
}: {
  eid: string
  props: Record<string, unknown>
  propertyDisplayName: (prop: string) => string
  onSaved: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(props)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, v != null ? String(v) : ''])
    )
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateNode(eid, values)
      toast.success('Properties gespeichert')
      onSaved()
    } catch (err) {
      toast.error(`Fehler: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-medium'>Properties</h3>
      <div className='grid gap-3'>
        {Object.entries(values).map(([k, v]) => (
          <div key={k} className='grid grid-cols-[200px_1fr] items-center gap-3'>
            <Label className='text-muted-foreground text-sm'>{propertyDisplayName(k)}</Label>
            <Input
              value={v}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [k]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Speichere...' : 'Speichern'}
      </Button>
    </div>
  )
}

function DeleteNodeButton({
  eid,
  name,
  onDeleted,
}: {
  eid: string
  name: string
  onDeleted: () => void
}) {
  const handleDelete = async () => {
    try {
      await deleteNode(eid)
      toast.success('Node gelöscht')
      onDeleted()
    } catch (err) {
      toast.error(`Fehler: ${err}`)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          <Trash2 className='mr-1 h-4 w-4' />
          Löschen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Node löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            "{name}" wird mit allen Beziehungen unwiderruflich gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface RelRow {
  relId: string
  type: string
  relProps: Record<string, unknown>
  otherEid: string
  otherLabels: string[]
  otherProps: Record<string, unknown>
  direction: 'in' | 'out'
}

function RelationshipSection({
  title,
  icon,
  rels,
  labelDisplayName,
  relTypeDisplayName,
  onNavigate,
  onDelete,
}: {
  title: string
  icon: React.ReactNode
  rels: RelRow[]
  labelDisplayName: (label: string) => string
  relTypeDisplayName: (type: string) => string
  onNavigate: (eid: string, label: string) => void
  onDelete: (relId: string) => void
}) {
  if (!rels.length) return null

  return (
    <div className='space-y-2'>
      <h3 className='flex items-center gap-2 text-sm font-medium'>
        {icon} {title}
      </h3>
      <div className='space-y-1'>
        {rels.map((r) => {
          const otherName = displayName(r.otherProps)
          const otherLabel = primaryLabel(r.otherLabels)
          const relPropsStr = Object.keys(r.relProps).length
            ? ` ${JSON.stringify(r.relProps)}`
            : ''
          return (
            <div
              key={r.relId}
              className='flex items-center gap-2 rounded-md px-3 py-1.5 text-sm'
            >
              <span className='flex-1'>
                {r.direction === 'out' ? (
                  <>
                    -[:<Badge variant='outline'>{relTypeDisplayName(r.type)}</Badge>
                    {relPropsStr}]-&gt; {otherName}{' '}
                    <span className='text-muted-foreground'>
                      (:{labelDisplayName(otherLabel)})
                    </span>
                  </>
                ) : (
                  <>
                    {otherName}{' '}
                    <span className='text-muted-foreground'>
                      (:{labelDisplayName(otherLabel)})
                    </span>{' '}
                    -[:<Badge variant='outline'>{relTypeDisplayName(r.type)}</Badge>
                    {relPropsStr}]-&gt;
                  </>
                )}
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onNavigate(r.otherEid, otherLabel)}
              >
                <ExternalLink className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive'
                onClick={() => onDelete(r.relId)}
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CreateRelationshipSection({
  fromEid,
  labelDisplayName,
  relTypeDisplayName,
  onCreated,
}: {
  fromEid: string
  labelDisplayName: (label: string) => string
  relTypeDisplayName: (type: string) => string
  onCreated: () => void
}) {
  const [relType, setRelType] = useState('')
  const [targetLabel, setTargetLabel] = useState('')
  const [targetEid, setTargetEid] = useState('')

  const { data: labels } = useQuery({
    queryKey: ['schema', 'labels'],
    queryFn: fetchLabels,
  })
  const { data: relTypes } = useQuery({
    queryKey: ['schema', 'rels'],
    queryFn: fetchRelTypes,
  })

  const allLabels = labels?.map((l) => l.label).sort() ?? []
  const allRelTypes = relTypes?.map((r) => r.type).sort() ?? []

  const { data: targetNodes } = useQuery({
    queryKey: ['nodes', targetLabel],
    queryFn: () => fetchNodes(targetLabel, 50),
    enabled: !!targetLabel,
  })

  const handleCreate = async () => {
    if (!relType || !targetEid) return
    try {
      await createRelationship(fromEid, targetEid, relType)
      toast.success('Beziehung erstellt')
      setRelType('')
      setTargetLabel('')
      setTargetEid('')
      onCreated()
    } catch (err) {
      toast.error(`Fehler: ${err}`)
    }
  }

  if (!allRelTypes.length || !allLabels.length) return null

  return (
    <div className='space-y-3'>
      <h3 className='text-sm font-medium'>Beziehung erstellen</h3>
      <div className='flex flex-wrap items-end gap-3'>
        <div>
          <Label className='text-xs'>Beziehungstyp</Label>
          <Select value={relType} onValueChange={setRelType}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Typ wählen' />
            </SelectTrigger>
            <SelectContent>
              {allRelTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {relTypeDisplayName(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className='text-xs'>Ziel-Label</Label>
          <Select
            value={targetLabel}
            onValueChange={(v) => {
              setTargetLabel(v)
              setTargetEid('')
            }}
          >
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Label wählen' />
            </SelectTrigger>
            <SelectContent>
              {allLabels.map((l) => (
                <SelectItem key={l} value={l}>
                  {labelDisplayName(l)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {targetNodes && targetNodes.length > 0 && (
          <div>
            <Label className='text-xs'>Ziel-Node</Label>
            <Select value={targetEid} onValueChange={setTargetEid}>
              <SelectTrigger className='w-64'>
                <SelectValue placeholder='Node wählen' />
              </SelectTrigger>
              <SelectContent>
                {targetNodes.map((n) => (
                  <SelectItem key={n.eid} value={n.eid}>
                    {displayName(n.props)} ({n.labels.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleCreate} disabled={!relType || !targetEid}>
          Erstellen
        </Button>
      </div>
    </div>
  )
}
