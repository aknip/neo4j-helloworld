export interface Neo4jNode {
  eid: string
  labels: string[]
  props: Record<string, unknown>
}

export interface Neo4jRelationship {
  relId: string
  type: string
  relProps: Record<string, unknown>
  sourceId?: string
  sourceLabels?: string[]
  sourceProps?: Record<string, unknown>
  targetId?: string
  targetLabels?: string[]
  targetProps?: Record<string, unknown>
}

export interface NodeDetail {
  node: { props: Record<string, unknown>; labels: string[] }
  outRels: Neo4jRelationship[]
  inRels: Neo4jRelationship[]
}

export interface LabelSchema {
  label: string
  count: number
  properties: { property: string; types: string[]; mandatory: boolean }[]
}

export interface RelTypeSchema {
  type: string
  count: number
  properties: { property: string; types: string[] }[]
}

export interface ImportResult {
  status: 'ok' | 'warning' | 'error'
  file: string
  detail: string
}

export interface ImportResponse {
  results: ImportResult[]
  stats: { nodes: number; rels: number }
}

export interface SearchResult {
  eid: string
  labels: string[]
  props: Record<string, unknown>
  hits: string[]
}

export interface LabelSettings {
  visible: boolean
  displayName: string
}

export interface PropertySettings {
  displayName: string
}

export interface RelTypeSettings {
  displayName: string
}

export interface ExplorerSettings {
  version: number
  labels: Record<string, LabelSettings>
  properties: Record<string, PropertySettings>
  relationshipTypes: Record<string, RelTypeSettings>
}
