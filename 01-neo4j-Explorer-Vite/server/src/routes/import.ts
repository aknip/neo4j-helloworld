import { Router } from 'express'
import { runQuery, runWrite } from '../neo4j.js'
import fs from 'fs'
import path from 'path'

export const importRouter = Router()

// Resolve relative paths from the project root (parent of server/)
// import.ts is at server/src/routes/ → 4 levels up to repo root
const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..', '..', '..')

function resolveDir(dir: string): string {
  if (path.isAbsolute(dir)) return dir
  return path.resolve(PROJECT_ROOT, dir)
}

function parseCypherFile(filepath: string): string[] {
  const content = fs.readFileSync(filepath, 'utf-8')
  const lines = content
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
  const text = lines.join('\n')
  return text
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
}

// GET /api/import/files?dir=...
importRouter.get('/files', (req, res) => {
  try {
    const rawDir = req.query.dir as string
    if (!rawDir) return res.json([])
    const dir = resolveDir(rawDir)
    if (!fs.existsSync(dir)) return res.json([])
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.cypher'))
      .sort()
    res.json(files)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/import/reset-and-import
importRouter.post('/reset-and-import', async (req, res) => {
  try {
    const { dir: rawDir } = req.body as { dir: string }
    if (!rawDir) {
      return res.status(400).json({ error: 'dir parameter required' })
    }
    const dir = resolveDir(rawDir)
    if (!fs.existsSync(dir)) {
      return res.status(400).json({ error: `Verzeichnis nicht gefunden: ${dir}` })
    }

    // Constraints droppen
    try {
      const constraints = await runQuery<{ name: string }>(
        'SHOW CONSTRAINTS YIELD name RETURN name'
      )
      for (const c of constraints) {
        await runWrite(`DROP CONSTRAINT \`${c.name}\` IF EXISTS`)
      }
    } catch {
      // ignore
    }

    // Indexes droppen (ausser Lookup-Indexes)
    try {
      const indexes = await runQuery<{ name: string }>(
        "SHOW INDEXES YIELD name, type WHERE type <> 'LOOKUP' RETURN name"
      )
      for (const idx of indexes) {
        await runWrite(`DROP INDEX \`${idx.name}\` IF EXISTS`)
      }
    } catch {
      // ignore
    }

    // Alle Daten löschen
    await runWrite('MATCH (n) DETACH DELETE n')

    // Cypher-Dateien importieren
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.cypher'))
      .sort()

    const results: { status: string; file: string; detail: string }[] = []

    for (const filename of files) {
      const filepath = path.join(dir, filename)
      try {
        const statements = parseCypherFile(filepath)
        const errors: string[] = []
        for (let i = 0; i < statements.length; i++) {
          try {
            await runWrite(statements[i])
          } catch (e) {
            errors.push(`Statement ${i + 1}: ${e}`)
          }
        }
        if (errors.length) {
          results.push({
            status: 'warning',
            file: filename,
            detail: `${errors.length} Fehler`,
          })
        } else {
          results.push({
            status: 'ok',
            file: filename,
            detail: `${statements.length} Statements`,
          })
        }
      } catch (e) {
        results.push({ status: 'error', file: filename, detail: String(e) })
      }
    }

    // Statistik
    const stats = await runQuery<{ nodes: number; rels: number }>(
      `MATCH (n) WITH count(n) AS nodes
       OPTIONAL MATCH ()-[r]->()
       RETURN nodes, count(r) AS rels`
    )

    res.json({
      results,
      stats: stats.length
        ? {
            nodes: typeof stats[0].nodes === 'object' ? Number(stats[0].nodes) : stats[0].nodes,
            rels: typeof stats[0].rels === 'object' ? Number(stats[0].rels) : stats[0].rels,
          }
        : { nodes: 0, rels: 0 },
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
