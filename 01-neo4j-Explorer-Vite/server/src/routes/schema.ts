import { Router } from 'express'
import { runQuery } from '../neo4j.js'

export const schemaRouter = Router()

// GET /api/schema/labels — Labels mit Counts und Properties
schemaRouter.get('/labels', async (_req, res) => {
  try {
    const counts = await runQuery<{ lbl: string; count: number }>(
      `MATCH (n) WITH labels(n) AS lbls, count(*) AS cnt
       UNWIND lbls AS lbl RETURN lbl, sum(cnt) AS count ORDER BY lbl`
    )

    let schema: Record<string, { property: string; types: string[]; mandatory: boolean }[]> = {}
    try {
      const rows = await runQuery<{
        nodeLabels: string[]
        propertyName: string
        propertyTypes: string[]
        mandatory: boolean
      }>('CALL db.schema.nodeTypeProperties()')
      for (const r of rows) {
        for (const lbl of r.nodeLabels ?? []) {
          if (!schema[lbl]) schema[lbl] = []
          // Deduplicate: skip if property already exists for this label
          if (!schema[lbl].some((p) => p.property === r.propertyName)) {
            schema[lbl].push({
              property: r.propertyName,
              types: r.propertyTypes ?? [],
              mandatory: r.mandatory ?? false,
            })
          }
        }
      }
    } catch {
      // db.schema.nodeTypeProperties() not available
    }

    const labels = counts.map((c) => ({
      label: c.lbl,
      count: typeof c.count === 'object' ? Number(c.count) : c.count,
      properties: schema[c.lbl] ?? [],
    }))

    res.json(labels)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/schema/rels — Relationship-Types mit Counts und Properties
schemaRouter.get('/rels', async (_req, res) => {
  try {
    const counts = await runQuery<{ type: string; count: number }>(
      `MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY type`
    )

    let schema: Record<string, { property: string; types: string[] }[]> = {}
    try {
      const rows = await runQuery<{
        relType: string
        propertyName: string
        propertyTypes: string[]
      }>('CALL db.schema.relTypeProperties()')
      for (const r of rows) {
        let rt = r.relType ?? ''
        if (rt.startsWith(':`') && rt.endsWith('`')) rt = rt.slice(2, -1)
        if (!schema[rt]) schema[rt] = []
        schema[rt].push({
          property: r.propertyName,
          types: r.propertyTypes ?? [],
        })
      }
    } catch {
      // db.schema.relTypeProperties() not available
    }

    const rels = counts.map((c) => ({
      type: c.type,
      count: typeof c.count === 'object' ? Number(c.count) : c.count,
      properties: schema[c.type] ?? [],
    }))

    res.json(rels)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
