import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PenLine, FileText, Share2 } from 'lucide-react'
import { fetchLabels, fetchNodes } from '../lib/api'
import { useExplorerState } from '../hooks/use-explorer-state'
import { displayName, labelColor, primaryLabel } from '../lib/utils'
import { useSettings } from '../hooks/use-settings'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/apps/main/components/ui/button'
import { Button } from '@/apps/main/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/apps/main/components/ui/select'
import { Skeleton } from '@/apps/main/components/ui/skeleton'
import { ScrollArea } from '@/apps/main/components/ui/scroll-area'
import { Separator } from '@/apps/main/components/ui/separator'
import { NodeDetail } from './node-detail'
import { NodeCreateForm } from './node-create-form'
import { NodeSummary } from './node-summary'

const subNavItems = [
  { key: 'editor', title: 'Editor', icon: <PenLine size={18} /> },
  { key: 'summary', title: 'Zusammenfassung', icon: <FileText size={18} /> },
  { key: 'graph', title: 'Graph', icon: <Share2 size={18} /> },
]

function ExplorerSubNav({
  activeItem,
  onSelect,
  disabledKeys,
}: {
  activeItem: string
  onSelect: (key: string) => void
  disabledKeys: string[]
}) {
  return (
    <>
      <div className='p-1 md:hidden'>
        <Select
          value={activeItem}
          onValueChange={(v) => {
            if (!disabledKeys.includes(v)) onSelect(v)
          }}
        >
          <SelectTrigger className='h-12 sm:w-48'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subNavItems.map((item) => (
              <SelectItem
                key={item.key}
                value={item.key}
                disabled={disabledKeys.includes(item.key)}
              >
                <div className='flex gap-x-4 px-2 py-1'>
                  <span className='scale-125'>{item.icon}</span>
                  <span className='text-md'>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea
        orientation='horizontal'
        type='always'
        className='hidden w-full min-w-40 bg-background px-1 py-2 md:block'
      >
        <nav className='flex space-x-2 py-1 lg:flex-col lg:space-y-1 lg:space-x-0'>
          {subNavItems.map((item) => {
            const isDisabled = disabledKeys.includes(item.key)
            return (
              <button
                key={item.key}
                onClick={() => !isDisabled && onSelect(item.key)}
                disabled={isDisabled}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  activeItem === item.key
                    ? 'bg-muted hover:bg-accent'
                    : isDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-accent hover:underline',
                  'justify-start'
                )}
              >
                <span className='me-2'>{item.icon}</span>
                {item.title}
              </button>
            )
          })}
        </nav>
      </ScrollArea>
    </>
  )
}

export function ExplorerTab() {
  const { selectedLabel, setLabel, selectedEid, mode, setMode, setEid } =
    useExplorerState()
  const { labelDisplayName } = useSettings()
  const queryClient = useQueryClient()
  const [activeSubNav, setActiveSubNav] = useState('editor')

  const disabledKeys = selectedEid ? [] : ['summary', 'graph']

  // Reset sub-nav when node is deselected
  useEffect(() => {
    if (!selectedEid && activeSubNav !== 'editor') {
      setActiveSubNav('editor')
    }
  }, [selectedEid, activeSubNav])

  const { data: labels, isLoading: labelsLoading } = useQuery({
    queryKey: ['schema', 'labels'],
    queryFn: fetchLabels,
  })

  const allLabels = labels?.map((l) => l.label).sort() ?? []

  // Auto-select first label
  const currentLabel = selectedLabel || allLabels[0] || ''

  const { data: nodes, isLoading: nodesLoading } = useQuery({
    queryKey: ['nodes', currentLabel],
    queryFn: () => fetchNodes(currentLabel),
    enabled: !!currentLabel,
  })

  if (labelsLoading) {
    return <Skeleton className='h-40 w-full' />
  }

  if (!allLabels.length) {
    return (
      <p className='text-muted-foreground'>
        Keine Daten vorhanden. Bitte zuerst Cypher-Dateien importieren.
      </p>
    )
  }

  let content: React.ReactNode

  if (activeSubNav === 'summary' && selectedEid) {
    content = <NodeSummary eid={selectedEid} />
  } else if (activeSubNav === 'graph' && selectedEid) {
    content = (
      <p className='text-muted-foreground'>Work in progress...</p>
    )
  } else if (mode === 'create') {
    content = (
      <NodeCreateForm
        label={currentLabel}
        onCreated={() => {
          setMode('browse')
          queryClient.invalidateQueries({ queryKey: ['nodes'] })
        }}
        onCancel={() => setMode('browse')}
      />
    )
  } else if (mode === 'detail') {
    content = <NodeDetail />
  } else {
    // Browse-Modus
    content = (
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <Select
            value={currentLabel}
            onValueChange={(v) => {
              setLabel(v)
              setEid(null)
              setMode('browse')
            }}
          >
            <SelectTrigger className='w-64'>
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

          <Button
            onClick={() => {
              setLabel(currentLabel)
              setMode('create')
            }}
          >
            Neuen Node erstellen
          </Button>
        </div>

        {nodesLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : !nodes?.length ? (
          <p className='text-muted-foreground'>
            Keine :{currentLabel} Nodes vorhanden.
          </p>
        ) : (
          <div className='space-y-1'>
            <p className='text-muted-foreground text-sm'>
              {nodes.length} Nodes
            </p>
            <div className='space-y-1'>
              {nodes.map((n) => {
                const name = displayName(n.props)
                const pLabel = primaryLabel(n.labels)
                const color = labelColor(pLabel, allLabels)
                return (
                  <button
                    key={n.eid}
                    className='hover:bg-accent flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors'
                    onClick={() => {
                      setEid(n.eid)
                      setLabel(currentLabel)
                      setMode('detail')
                    }}
                  >
                    <span
                      className='inline-block h-3 w-3 shrink-0 rounded-full'
                      style={{ backgroundColor: color }}
                    />
                    <span className='font-medium'>{name}</span>
                    <span className='text-muted-foreground text-sm'>
                      {n.labels
                        .map((l) => `:${labelDisplayName(l)}`)
                        .join(', ')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Separator className='my-4' />
      <div className='flex flex-1 flex-col space-y-2 md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <aside className='top-0 lg:sticky lg:w-1/5'>
          <ExplorerSubNav
            activeItem={activeSubNav}
            onSelect={setActiveSubNav}
            disabledKeys={disabledKeys}
          />
        </aside>
        <div className='flex w-full overflow-y-hidden p-1'>{content}</div>
      </div>
    </>
  )
}
