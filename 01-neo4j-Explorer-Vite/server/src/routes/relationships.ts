import { Router } from 'express'
import { runWrite } from '../neo4j.js'

export const relationshipsRouter = Router()

// POST /api/relationships — Beziehung erstellen
relationshipsRouter.post('/', async (req, res) => {
  try {
    const { fromEid, toEid, type } = req.body as {
      fromEid: string
      toEid: string
      type: string
    }
    if (!fromEid || !toEid || !type) {
      return res.status(400).json({ error: 'fromEid, toEid, and type required' })
    }

    await runWrite(
      `MATCH (a) WHERE elementId(a) = $fromEid
       MATCH (b) WHERE elementId(b) = $toEid
       CREATE (a)-[:\`${type}\`]->(b)`,
      { fromEid, toEid }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// DELETE /api/relationships/:relEid
relationshipsRouter.delete('/:relEid', async (req, res) => {
  try {
    const { relEid } = req.params
    await runWrite(
      'MATCH ()-[r]->() WHERE elementId(r) = $relEid DELETE r',
      { relEid }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
