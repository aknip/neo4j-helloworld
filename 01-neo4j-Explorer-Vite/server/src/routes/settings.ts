import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { runQuery } from '../neo4j.js'

export const settingsRouter = Router()

const DATA_DIR = path.resolve(import.meta.dirname, '../../data')
const SETTINGS_FILE = path.join(DATA_DIR, 'explorer-settings.json')

interface LabelSettings {
  visible: boolean
  displayName: string
}

interface PropertySettings {
  displayName: string
}

interface RelTypeSettings {
  displayName: string
}

interface ExplorerSettings {
  version: number
  labels: Record<string, LabelSettings>
  properties: Record<string, PropertySettings>
  relationshipTypes: Record<string, RelTypeSettings>
}

function readSettings(): ExplorerSettings | null {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8')
    return JSON.parse(raw) as ExplorerSettings
  } catch {
    return null
  }
}

function writeSettings(settings: ExplorerSettings): void {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
}

async function buildFromSchema(): Promise<ExplorerSettings> {
  const labelRows = await runQuery<{ lbl: string }>(
    `MATCH (n) WITH labels(n) AS lbls UNWIND lbls AS lbl RETURN DISTINCT lbl ORDER BY lbl`
  )

  const properties = new Set<string>()
  try {
    const propRows = await runQuery<{ propertyName: string }>(
      'CALL db.schema.nodeTypeProperties()'
    )
    for (const r of propRows) {
      if (r.propertyName) properties.add(r.propertyName)
    }
  } catch {
    // not available
  }

  const relRows = await runQuery<{ type: string }>(
    `MATCH ()-[r]->() RETURN DISTINCT type(r) AS type ORDER BY type`
  )

  const settings: ExplorerSettings = {
    version: 1,
    labels: {},
    properties: {},
    relationshipTypes: {},
  }

  for (const r of labelRows) {
    settings.labels[r.lbl] = { visible: true, displayName: r.lbl }
  }
  for (const p of properties) {
    settings.properties[p] = { displayName: p }
  }
  for (const r of relRows) {
    settings.relationshipTypes[r.type] = { displayName: r.type }
  }

  return settings
}

// GET /api/settings — load config (auto-init if missing)
settingsRouter.get('/', async (_req, res) => {
  try {
    let settings = readSettings()
    if (!settings) {
      settings = await buildFromSchema()
      writeSettings(settings)
    }
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// PUT /api/settings — replace config
settingsRouter.put('/', (req, res) => {
  try {
    const settings = req.body as ExplorerSettings
    writeSettings(settings)
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/settings/init — re-init from schema, merging with existing overrides
settingsRouter.post('/init', async (_req, res) => {
  try {
    const fresh = await buildFromSchema()
    const existing = readSettings()

    if (existing) {
      // Merge: keep user overrides for items that still exist in schema
      for (const [key, val] of Object.entries(existing.labels)) {
        if (fresh.labels[key]) {
          fresh.labels[key] = val
        }
      }
      for (const [key, val] of Object.entries(existing.properties)) {
        if (fresh.properties[key]) {
          fresh.properties[key] = val
        }
      }
      for (const [key, val] of Object.entries(existing.relationshipTypes)) {
        if (fresh.relationshipTypes[key]) {
          fresh.relationshipTypes[key] = val
        }
      }
    }

    writeSettings(fresh)
    res.json(fresh)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
