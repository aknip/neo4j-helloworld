import { useRef, useEffect, useState, useCallback } from 'react'
import cytoscape, { type Core } from 'cytoscape'
import { useQuery } from '@tanstack/react-query'
import { fetchLabels } from '../lib/api'
import { displayName, labelColor, primaryLabel } from '../lib/utils'
import { useSettings } from '../hooks/use-settings'
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

const DEPTH_CYCLE = [1, 2, 3, 4, null] as const
type FocusDepth = 1 | 2 | 3 | 4 | null

export function GraphTab() {
  const cyRef = useRef<HTMLDivElement>(null)
  const cyInstance = useRef<Core | null>(null)
  const [maxNodes, setMaxNodes] = useState(100)
  const [selectedLabels, setSelectedLabels] = useState<string[] | null>(null)
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
  const [focusDepth, setFocusDepth] = useState<FocusDepth>(null)

  const { labelDisplayName, isLabelVisible, propertyDisplayName, relTypeDisplayName } = useSettings()

  const { data: labels, isLoading: labelsLoading } = useQuery({
    queryKey: ['schema', 'labels'],
    queryFn: fetchLabels,
  })

  const allLabels = labels?.map((l) => l.label).sort() ?? []
  const visibleLabels = allLabels.filter((l) => isLabelVisible(l))

  // Auto-select all visible labels on first load only
  useEffect(() => {
    if (visibleLabels.length > 0 && selectedLabels === null) {
      setSelectedLabels(visibleLabels)
    }
  }, [visibleLabels])

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
            .map(([k, v]) => `${propertyDisplayName(k)}: ${v}`)
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
          label: relTypeDisplayName(r.type),
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
          selector: 'node.focused',
          style: {
            'border-width': 3,
            'border-color': '#000',
            width: 28,
            height: 28,
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
      if (cyRef.current) {
        cyRef.current.title = e.target.data('tooltip') ?? ''
      }
    })
    cy.on('mouseout', 'node', () => {
      if (cyRef.current) cyRef.current.title = ''
    })

    // Click: focus neighborhood
    cy.on('tap', 'node', (e) => {
      const clickedId = e.target.id()
      setFocusNodeId((prevId) => {
        if (prevId === clickedId) {
          // Same node: cycle depth
          setFocusDepth((prev) => {
            const idx = DEPTH_CYCLE.indexOf(prev)
            return DEPTH_CYCLE[(idx + 1) % DEPTH_CYCLE.length]
          })
          return clickedId
        }
        // Different node: start at depth 1
        setFocusDepth(1)
        return clickedId
      })
    })

    // Click on background: reset
    cy.on('tap', (e) => {
      if (e.target === cy) {
        setFocusNodeId(null)
        setFocusDepth(null)
      }
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

  // Apply focus filter when focusNodeId/focusDepth change
  useEffect(() => {
    const cy = cyInstance.current
    if (!cy) return

    if (!focusNodeId || focusDepth === null) {
      // Show all
      cy.elements().show()
      cy.elements().removeClass('dimmed')
      cy.nodes().removeClass('focused')
      return
    }

    const root = cy.getElementById(focusNodeId)
    if (!root.length) return

    // BFS to collect nodes within N hops
    let frontier = root.collection()
    for (let hop = 0; hop < focusDepth; hop++) {
      frontier = frontier.nodes().closedNeighborhood()
    }

    const visible = frontier
    const hidden = cy.elements().difference(visible)

    visible.show()
    hidden.hide()

    // Highlight root
    cy.nodes().removeClass('focused')
    root.addClass('focused')
  }, [focusNodeId, focusDepth])

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
        {focusNodeId && focusDepth !== null && (
          <div className='bg-muted mb-2 flex items-center justify-between rounded-md px-3 py-1.5 text-sm'>
            <span>
              Fokus: <strong>{cyInstance.current?.getElementById(focusNodeId)?.data('label') ?? focusNodeId}</strong> — Ebene {focusDepth}
              <span className='text-muted-foreground ml-2'>(Klick auf Node: nächste Ebene, Klick auf Hintergrund: zurücksetzen)</span>
            </span>
          </div>
        )}
        {graphLoading && <Skeleton className='h-[600px] w-full' />}
        <div
          ref={cyRef}
          className='border-border bg-background h-[600px] rounded-md border'
          style={{ display: graphLoading ? 'none' : 'block' }}
        />
      </div>

      {/* Controls */}
      <div className='w-88 shrink-0 space-y-4'>
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
                  activeLabels.length === visibleLabels.length ? [] : visibleLabels
                )
              }
            >
              {activeLabels.length === visibleLabels.length
                ? 'Keine'
                : 'Alle'}
            </Button>
          </div>
          <div className='mt-2 grid grid-cols-2 gap-1'>
            {visibleLabels.map((l) => {
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
                  <span className='text-xs'>
                    {labelDisplayName(l)}{' '}
                    <span className='text-muted-foreground'>({count})</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
