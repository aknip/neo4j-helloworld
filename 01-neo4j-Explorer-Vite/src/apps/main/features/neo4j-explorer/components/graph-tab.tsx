import { useRef, useEffect, useState, useCallback } from 'react'
import cytoscape, { type Core } from 'cytoscape'
import { useQuery } from '@tanstack/react-query'
import { fetchLabels } from '../lib/api'
import { displayName, labelColor, primaryLabel } from '../lib/utils'
import { Button } from '@/apps/main/components/ui/button'
import { Skeleton } from '@/apps/main/components/ui/skeleton'
import axios from 'axios'

interface GraphNode {
  eid: string
  labels: string[]
  props: Record<string, unknown>
}

interface GraphRel {
  source: string
  target: string
  type: string
}

export function GraphTab() {
  const cyRef = useRef<HTMLDivElement>(null)
  const cyInstance = useRef<Core | null>(null)
  const [maxNodes, setMaxNodes] = useState(100)
  const [selectedLabels, setSelectedLabels] = useState<string[] | null>(null)

  const { data: labels, isLoading: labelsLoading } = useQuery({
    queryKey: ['schema', 'labels'],
    queryFn: fetchLabels,
  })

  const allLabels = labels?.map((l) => l.label).sort() ?? []

  // Auto-select all labels on first load only
  useEffect(() => {
    if (allLabels.length > 0 && selectedLabels === null) {
      setSelectedLabels(allLabels)
    }
  }, [allLabels])

  const activeLabels = selectedLabels ?? []

  // Fetch graph data via dedicated graph endpoint
  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ['graph', activeLabels, maxNodes],
    queryFn: async () => {
      if (!activeLabels.length) return { nodes: [] as GraphNode[], rels: [] as GraphRel[] }
      const res = await axios.get<{ nodes: GraphNode[]; rels: GraphRel[] }>(
        '/api/nodes/graph',
        { params: { labels: activeLabels.join(','), limit: maxNodes } }
      )
      return res.data
    },
    enabled: activeLabels.length > 0,
  })

  const renderGraph = useCallback(() => {
    if (!cyRef.current || !graphData) return

    if (cyInstance.current) {
      cyInstance.current.destroy()
    }

    const elements: cytoscape.ElementDefinition[] = []

    for (const n of graphData.nodes) {
      const pLabel = primaryLabel(n.labels)
      const color = labelColor(pLabel, allLabels)
      elements.push({
        data: {
          id: n.eid,
          label: displayName(n.props),
          nodeLabel: pLabel,
          color,
          tooltip: Object.entries(n.props)
            .filter(([k]) => !['createdAt', 'updatedAt'].includes(k))
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n'),
        },
      })
    }

    for (const r of graphData.rels) {
      elements.push({
        data: {
          id: `${r.source}-${r.type}-${r.target}`,
          source: r.source,
          target: r.target,
          label: r.type,
        },
      })
    }

    const cy = cytoscape({
      container: cyRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            width: 22,
            height: 22,
            'text-max-width': '90px',
            'text-wrap': 'ellipsis',
          },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(label)',
            'font-size': '9px',
            color: '#999',
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            width: 1.5,
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: () => 30000,
        idealEdgeLength: () => 200,
        edgeElasticity: () => 100,
        gravity: 0.15,
        numIter: 1000,
        nodeDimensionsIncludeLabels: true,
      } as cytoscape.LayoutOptions,
    })

    // Tooltip on hover
    cy.on('mouseover', 'node', (e) => {
      const node = e.target
      node.tippy = node.tippy
      // Simple approach: use title attribute on container
      if (cyRef.current) {
        cyRef.current.title = node.data('tooltip') ?? ''
      }
    })
    cy.on('mouseout', 'node', () => {
      if (cyRef.current) cyRef.current.title = ''
    })

    cy.fit(undefined, 30)
    cyInstance.current = cy
  }, [graphData, allLabels])

  useEffect(() => {
    renderGraph()
    return () => {
      if (cyInstance.current) {
        cyInstance.current.destroy()
        cyInstance.current = null
      }
    }
  }, [renderGraph])

  if (labelsLoading) return <Skeleton className='h-96 w-full' />

  if (!allLabels.length) {
    return (
      <p className='text-muted-foreground'>
        Keine Daten vorhanden. Bitte zuerst Cypher-Dateien importieren.
      </p>
    )
  }

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) => {
      const current = prev ?? []
      return current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label]
    })
  }

  return (
    <div className='flex gap-4'>
      {/* Graph */}
      <div className='flex-1'>
        {graphLoading && <Skeleton className='h-[600px] w-full' />}
        <div
          ref={cyRef}
          className='border-border bg-background h-[600px] rounded-md border'
          style={{ display: graphLoading ? 'none' : 'block' }}
        />
      </div>

      {/* Controls */}
      <div className='w-64 shrink-0 space-y-4'>
        <div>
          <label className='text-sm font-medium'>
            Max. Nodes: {maxNodes}
          </label>
          <input
            type='range'
            min={10}
            max={500}
            step={10}
            value={maxNodes}
            onChange={(e) => setMaxNodes(Number(e.target.value))}
            className='w-full'
          />
        </div>

        <div>
          <p className='mb-2 text-sm font-medium'>Labels filtern</p>
          <div className='flex flex-wrap gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                setSelectedLabels(
                  activeLabels.length === allLabels.length ? [] : allLabels
                )
              }
            >
              {activeLabels.length === allLabels.length
                ? 'Keine'
                : 'Alle'}
            </Button>
          </div>
          <div className='mt-2 space-y-1'>
            {allLabels.map((l) => {
              const color = labelColor(l, allLabels)
              const count = labels?.find((lb) => lb.label === l)?.count ?? 0
              const checked = activeLabels.includes(l)
              return (
                <label
                  key={l}
                  className='flex cursor-pointer items-center gap-2 text-sm'
                >
                  <input
                    type='checkbox'
                    checked={checked}
                    onChange={() => toggleLabel(l)}
                    className='rounded'
                  />
                  <span
                    className='inline-block h-3 w-3 rounded-full'
                    style={{ backgroundColor: color }}
                  />
                  <span>
                    {l}{' '}
                    <span className='text-muted-foreground'>({count})</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Legende */}
        <div>
          <p className='mb-2 text-sm font-medium'>Legende</p>
          <div className='space-y-1'>
            {activeLabels.map((l) => {
              const color = labelColor(l, allLabels)
              const count =
                labels?.find((lb) => lb.label === l)?.count ?? 0
              return (
                <div key={l} className='flex items-center gap-2 text-sm'>
                  <span
                    className='inline-block h-3 w-3 rounded-full'
                    style={{ backgroundColor: color }}
                  />
                  {l} ({count})
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
