import { Router } from 'express'
import { runQuery } from '../neo4j.js'

export const statsRouter = Router()

// GET /api/stats
statsRouter.get('/', async (_req, res) => {
  try {
    const result = await runQuery<{ nodes: number; rels: number }>(
      `MATCH (n) WITH count(n) AS nodes
       OPTIONAL MATCH ()-[r]->()
       RETURN nodes, count(r) AS rels`
    )
    if (result.length) {
      res.json({
        nodes: typeof result[0].nodes === 'object' ? Number(result[0].nodes) : result[0].nodes,
        rels: typeof result[0].rels === 'object' ? Number(result[0].rels) : result[0].rels,
      })
    } else {
      res.json({ nodes: 0, rels: 0 })
    }
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
