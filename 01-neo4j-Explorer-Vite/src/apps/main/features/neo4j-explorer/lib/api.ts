import axios from 'axios'
import type {
  Neo4jNode,
  NodeDetail,
  LabelSchema,
  RelTypeSchema,
  SearchResult,
  ImportResponse,
  ExplorerSettings,
} from './types'

const api = axios.create({ baseURL: '/api' })

// Schema
export const fetchLabels = () =>
  api.get<LabelSchema[]>('/schema/labels').then((r) => r.data)

export const fetchRelTypes = () =>
  api.get<RelTypeSchema[]>('/schema/rels').then((r) => r.data)

// Nodes
export const fetchNodes = (label: string, limit = 200) =>
  api.get<Neo4jNode[]>('/nodes', { params: { label, limit } }).then((r) => r.data)

export const fetchNodeDetail = (eid: string) =>
  api.get<NodeDetail>(`/nodes/${encodeURIComponent(eid)}`).then((r) => r.data)

export const fetchNodeProperties = (label: string) =>
  api.get<string[]>(`/nodes/properties/${encodeURIComponent(label)}`).then((r) => r.data)

export const createNode = (label: string, properties: Record<string, string>) =>
  api.post('/nodes', { label, properties }).then((r) => r.data)

export const updateNode = (eid: string, properties: Record<string, string>) =>
  api.put(`/nodes/${encodeURIComponent(eid)}`, { properties }).then((r) => r.data)

export const deleteNode = (eid: string) =>
  api.delete(`/nodes/${encodeURIComponent(eid)}`).then((r) => r.data)

// Relationships
export const createRelationship = (fromEid: string, toEid: string, type: string) =>
  api.post('/relationships', { fromEid, toEid, type }).then((r) => r.data)

export const deleteRelationship = (relEid: string) =>
  api.delete(`/relationships/${encodeURIComponent(relEid)}`).then((r) => r.data)

// Search
export const searchNodes = (q: string) =>
  api.get<SearchResult[]>('/search', { params: { q } }).then((r) => r.data)

// Stats
export const fetchStats = () =>
  api.get<{ nodes: number; rels: number }>('/stats').then((r) => r.data)

// Import
export const fetchImportFiles = (dir: string) =>
  api.get<string[]>('/import/files', { params: { dir } }).then((r) => r.data)

export const resetAndImport = (dir: string) =>
  api.post<ImportResponse>('/import/reset-and-import', { dir }).then((r) => r.data)

// Settings
export const fetchSettings = () =>
  api.get<ExplorerSettings>('/settings').then((r) => r.data)

export const saveSettings = (settings: ExplorerSettings) =>
  api.put<ExplorerSettings>('/settings', settings).then((r) => r.data)

export const reinitSettings = () =>
  api.post<ExplorerSettings>('/settings/init').then((r) => r.data)

export const translateSettings = () =>
  api.post<ExplorerSettings>('/settings/translate').then((r) => r.data)

// Node Summary
export const fetchNodeSummary = (eid: string) =>
  api.post<{ summary: string }>(`/nodes/${encodeURIComponent(eid)}/summary`).then((r) => r.data)
