import { Router } from 'express'
import neo4j from 'neo4j-driver'
import { runQuery, runWrite } from '../neo4j.js'

export const nodesRouter = Router()

// GET /api/nodes?label=X&limit=200
nodesRouter.get('/', async (req, res) => {
  try {
    const label = req.query.label as string
    const limit = parseInt(req.query.limit as string) || 200
    if (!label) {
      return res.status(400).json({ error: 'label parameter required' })
    }

    const nodes = await runQuery(
      `MATCH (n:\`${label}\`)
       RETURN elementId(n) AS eid, properties(n) AS props, labels(n) AS labels
       ORDER BY n.id, n.name LIMIT $limit`,
      { limit: neo4j.int(limit) }
    )
    res.json(nodes)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/nodes/graph?labels=A,B&limit=100 — Nodes für Graph-Visualisierung
nodesRouter.get('/graph', async (req, res) => {
  try {
    const labelsParam = req.query.labels as string
    const limit = parseInt(req.query.limit as string) || 100
    if (!labelsParam) {
      return res.status(400).json({ error: 'labels parameter required' })
    }

    const labelsList = labelsParam.split(',').filter(Boolean)
    const labelFilter = labelsList.map((l) => `n:\`${l}\``).join(' OR ')

    const nodes = await runQuery(
      `MATCH (n) WHERE ${labelFilter}
       RETURN elementId(n) AS eid, labels(n) AS labels, properties(n) AS props
       LIMIT $limit`,
      { limit: neo4j.int(limit) }
    )

    const eids = nodes.map((n: Record<string, unknown>) => n.eid)

    const rels = eids.length
      ? await runQuery(
          `MATCH (a)-[r]->(b)
           WHERE elementId(a) IN $eids AND elementId(b) IN $eids
           RETURN elementId(a) AS source, elementId(b) AS target, type(r) AS type`,
          { eids }
        )
      : []

    res.json({ nodes, rels })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/nodes/graph-rels — Relationships zwischen gegebenen Nodes
nodesRouter.post('/graph-rels', async (req, res) => {
  try {
    const { eids } = req.body as { eids: string[] }
    if (!eids?.length) return res.json([])

    const rels = await runQuery(
      `MATCH (a)-[r]->(b)
       WHERE elementId(a) IN $eids AND elementId(b) IN $eids
       RETURN elementId(a) AS source, elementId(b) AS target, type(r) AS type`,
      { eids }
    )
    res.json(rels)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/nodes/:eid — Node-Detail mit Beziehungen
nodesRouter.get('/:eid', async (req, res) => {
  try {
    const { eid } = req.params

    const node = await runQuery(
      `MATCH (n) WHERE elementId(n) = $eid
       RETURN properties(n) AS props, labels(n) AS labels`,
      { eid }
    )

    const outRels = await runQuery(
      `MATCH (n)-[r]->(m) WHERE elementId(n) = $eid
       RETURN type(r) AS type, properties(r) AS relProps,
       properties(m) AS targetProps, labels(m) AS targetLabels,
       elementId(m) AS targetId, elementId(r) AS relId`,
      { eid }
    )

    const inRels = await runQuery(
      `MATCH (m)-[r]->(n) WHERE elementId(n) = $eid
       RETURN type(r) AS type, properties(r) AS relProps,
       properties(m) AS sourceProps, labels(m) AS sourceLabels,
       elementId(m) AS sourceId, elementId(r) AS relId`,
      { eid }
    )

    if (!node.length) {
      return res.status(404).json({ error: 'Node nicht gefunden' })
    }

    res.json({ node: node[0], outRels, inRels })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/nodes/:eid/properties — Bekannte Properties eines Labels
nodesRouter.get('/properties/:label', async (req, res) => {
  try {
    const { label } = req.params
    const rows = await runQuery<{ k: string }>(
      `MATCH (n:\`${label}\`) WITH keys(n) AS ks UNWIND ks AS k
       RETURN DISTINCT k ORDER BY k`
    )
    res.json(rows.map((r) => r.k))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/nodes — Node erstellen
nodesRouter.post('/', async (req, res) => {
  try {
    const { label, properties } = req.body as {
      label: string
      properties: Record<string, string>
    }
    if (!label) {
      return res.status(400).json({ error: 'label required' })
    }

    const clean = Object.fromEntries(
      Object.entries(properties ?? {}).filter(([, v]) => v)
    )
    if (!Object.keys(clean).length) {
      return res.status(400).json({ error: 'Mindestens eine Property erforderlich' })
    }

    const propsStr = Object.keys(clean)
      .map((k) => `n.\`${k}\` = $props.\`${k}\``)
      .join(', ')

    await runWrite(`CREATE (n:\`${label}\`) SET ${propsStr}`, { props: clean })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// PUT /api/nodes/:eid — Node-Properties aktualisieren
nodesRouter.put('/:eid', async (req, res) => {
  try {
    const { eid } = req.params
    const { properties } = req.body as { properties: Record<string, string> }

    const propsStr = Object.keys(properties)
      .map((k) => `n.\`${k}\` = $props.\`${k}\``)
      .join(', ')

    await runWrite(
      `MATCH (n) WHERE elementId(n) = $eid SET ${propsStr}`,
      { eid, props: properties }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// DELETE /api/nodes/:eid
nodesRouter.delete('/:eid', async (req, res) => {
  try {
    const { eid } = req.params
    await runWrite('MATCH (n) WHERE elementId(n) = $eid DETACH DELETE n', { eid })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
