import { Router } from 'express'
import { runQuery } from '../neo4j.js'

export const searchRouter = Router()

// GET /api/search?q=text
searchRouter.get('/', async (req, res) => {
  try {
    const q = req.query.q as string
    if (!q || q.length < 2) {
      return res.json([])
    }

    const results = await runQuery(
      `MATCH (n)
       WITH n, [k IN keys(n) WHERE n[k] IS :: STRING
         AND toLower(toString(n[k])) CONTAINS toLower($search)] AS hits
       WHERE size(hits) > 0
       RETURN elementId(n) AS eid, labels(n) AS labels,
         properties(n) AS props, hits
       LIMIT 50`,
      { search: q }
    )
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
