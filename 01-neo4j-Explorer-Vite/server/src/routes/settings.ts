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

// POST /api/settings/translate — translate displayNames to German via OpenRouter LLM
settingsRouter.post('/translate', async (_req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: 'OPENROUTER_API_KEY ist nicht konfiguriert' })
      return
    }

    const settings = readSettings()
    if (!settings) {
      res.status(400).json({ error: 'Keine Einstellungen vorhanden. Bitte zuerst Schema laden.' })
      return
    }

    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(DATA_DIR, `explorer-settings.backup-${timestamp}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(settings, null, 2), 'utf-8')

    // Build translation payload (only displayName values)
    const payload: Record<string, Record<string, string>> = {
      labels: {},
      properties: {},
      relationshipTypes: {},
    }
    for (const [key, val] of Object.entries(settings.labels)) {
      payload.labels[key] = val.displayName
    }
    for (const [key, val] of Object.entries(settings.properties)) {
      payload.properties[key] = val.displayName
    }
    for (const [key, val] of Object.entries(settings.relationshipTypes)) {
      payload.relationshipTypes[key] = val.displayName
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'Du bist ein Übersetzer für eine Versicherungs-Software. Übersetze die Werte im folgenden JSON ins Deutsche. ' +
              'Die JSON-Struktur muss unverändert bleiben, die Keys dürfen nicht übersetzt werden, nur die Values. ' +
              'Übersetze auf Deutsch mit Umlauten (ä,ö,ü), ersteze "_" durch " ", ersetze Camel-Case-Schreibung durch korrekte Worttrennung mit Leerzeichen, passe immer auf die korrekte deutsche Groß-/Kleinschreibung an, schreibe niemals in VERSALIEN. ' +
              'Beispiele: Übersetze "AFFECTS_COVERAGE" in "beeinflusst Deckung" . Übersetze "changeDescription" in "ändere Beschreibung" . ' +
              'Fachbegriffe aus der Versicherungsbranche sollen korrekt übersetzt werden. ' +
              'Antworte NUR mit dem JSON, ohne Markdown-Codeblöcke oder Erklärungen.',
          },
          {
            role: 'user',
            content: JSON.stringify(payload, null, 2),
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      res.status(502).json({ error: `Übersetzungs-API Fehler: ${response.status} ${body}` })
      return
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>
    }

    // Parse LLM response — strip markdown fences defensively
    let content = data.choices?.[0]?.message?.content ?? ''
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fenceMatch) content = fenceMatch[1]
    content = content.trim()

    let translated: Record<string, Record<string, string>>
    try {
      translated = JSON.parse(content)
    } catch {
      res.status(502).json({ error: 'Ungültige Antwort vom Übersetzungsmodell' })
      return
    }

    if (!translated.labels || !translated.properties || !translated.relationshipTypes) {
      res.status(502).json({ error: 'Unerwartete Antwortstruktur vom Übersetzungsmodell' })
      return
    }

    // Merge translated displayNames back, preserving all other fields
    for (const [key, val] of Object.entries(settings.labels)) {
      if (translated.labels[key]) {
        settings.labels[key] = { ...val, displayName: translated.labels[key] }
      }
    }
    for (const [key, val] of Object.entries(settings.properties)) {
      if (translated.properties[key]) {
        settings.properties[key] = { ...val, displayName: translated.properties[key] }
      }
    }
    for (const [key, val] of Object.entries(settings.relationshipTypes)) {
      if (translated.relationshipTypes[key]) {
        settings.relationshipTypes[key] = { ...val, displayName: translated.relationshipTypes[key] }
      }
    }

    writeSettings(settings)
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
