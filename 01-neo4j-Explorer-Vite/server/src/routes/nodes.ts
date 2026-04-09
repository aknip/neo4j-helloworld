import { Router } from 'express'
import neo4j from 'neo4j-driver'
import { runQuery, runWrite } from '../neo4j.js'
import { readSettings } from './settings.js'

export const nodesRouter = Router()

// Helper: Node mit allen Beziehungen laden
async function fetchNodeContext(eid: string) {
  const node = await runQuery(
    `MATCH (n) WHERE elementId(n) = $eid
     RETURN properties(n) AS props, labels(n) AS labels`,
    { eid }
  )

  if (!node.length) return null

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

  return { node: node[0] as { props: Record<string, unknown>; labels: string[] }, outRels, inRels }
}

// Helper: Display-Name aus Properties ermitteln
function nodeDisplayName(props: Record<string, unknown>): string {
  const keys = Object.keys(props).sort()
  for (const k of keys) {
    if (k.toLowerCase().includes('name') || k.toLowerCase().includes('title')) {
      if (props[k]) return String(props[k])
    }
  }
  for (const k of keys) {
    if (k.toLowerCase().endsWith('number') || k === 'id') {
      if (props[k]) return String(props[k])
    }
  }
  for (const k of keys) {
    const v = props[k]
    if (typeof v === 'string' && v && !['createdAt', 'updatedAt', 'status'].includes(k)) {
      return v.slice(0, 50)
    }
  }
  return String(props['id'] ?? '?')
}

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
    const context = await fetchNodeContext(req.params.eid)
    if (!context) {
      return res.status(404).json({ error: 'Node nicht gefunden' })
    }
    res.json(context)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/nodes/:eid/summary — LLM-Zusammenfassung eines Nodes
nodesRouter.post('/:eid/summary', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: 'OPENROUTER_API_KEY ist nicht konfiguriert' })
      return
    }

    const context = await fetchNodeContext(req.params.eid)
    if (!context) {
      return res.status(404).json({ error: 'Node nicht gefunden' })
    }

    const settings = readSettings()
    const lblName = (l: string) => settings?.labels[l]?.displayName ?? l
    const propName = (k: string) => settings?.properties[k]?.displayName ?? k
    const relName = (t: string) => settings?.relationshipTypes[t]?.displayName ?? t

    // Properties formatieren
    const propsText = Object.entries(context.node.props)
      .map(([k, v]) => `- ${propName(k)}: ${v}`)
      .join('\n')

    // Ausgehende Beziehungen
    const MAX_RELS = 50
    const outAll = context.outRels as Array<{
      type: string; relProps: Record<string, unknown>
      targetProps: Record<string, unknown>; targetLabels: string[]
    }>
    const outTruncated = outAll.length > MAX_RELS
    const outText = outAll.slice(0, MAX_RELS).map((r) => {
      const target = nodeDisplayName(r.targetProps)
      const labels = r.targetLabels.map(lblName).join(', ')
      const rp = Object.entries(r.relProps)
      const rpText = rp.length
        ? `\n  Beziehungs-Eigenschaften: ${rp.map(([k, v]) => `${propName(k)}: ${v}`).join(', ')}`
        : ''
      return `- ${relName(r.type)} → ${target} (${labels})${rpText}`
    }).join('\n')

    // Eingehende Beziehungen
    const inAll = context.inRels as Array<{
      type: string; relProps: Record<string, unknown>
      sourceProps: Record<string, unknown>; sourceLabels: string[]
    }>
    const inTruncated = inAll.length > MAX_RELS
    const inText = inAll.slice(0, MAX_RELS).map((r) => {
      const source = nodeDisplayName(r.sourceProps)
      const labels = r.sourceLabels.map(lblName).join(', ')
      const rp = Object.entries(r.relProps)
      const rpText = rp.length
        ? `\n  Beziehungs-Eigenschaften: ${rp.map(([k, v]) => `${propName(k)}: ${v}`).join(', ')}`
        : ''
      return `- ${source} (${labels}) → ${relName(r.type)}${rpText}`
    }).join('\n')

    const nodeName = nodeDisplayName(context.node.props)
    const nodeLabels = context.node.labels.map(lblName).join(', ')

    const userPrompt = [
      `Knoten: ${nodeName} (${nodeLabels})`,
      '',
      'Eigenschaften:',
      propsText || '- Keine',
      '',
      `Ausgehende Beziehungen (${outAll.length}):`,
      outText || '- Keine',
      outTruncated ? `(… und ${outAll.length - MAX_RELS} weitere)` : '',
      '',
      `Eingehende Beziehungen (${inAll.length}):`,
      inText || '- Keine',
      inTruncated ? `(… und ${inAll.length - MAX_RELS} weitere)` : '',
    ].filter((l) => l !== '').join('\n')

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
              'Du bist ein Assistent, der Knoten aus einem Knowledge-Graph zusammenfasst. ' +
              'Erstelle eine Zusammenfassung mit folgender Struktur:\n\n' +
              '## Kurzzusammenfassung\n' +
              '- 3-5 Stichpunkte mit den wichtigsten Fakten\n\n' +
              '## Detaillierte Zusammenfassung\n' +
              'Gruppiere die Informationen nach fachlich sinnvollen Themen in Unterabschnitte (### Überschriften).\n' +
              'Verwende Aufzählungszeichen.\n' +
              'Berücksichtige sowohl die Eigenschaften als auch alle Beziehungen.\n' +
              'Schreibe sachlich und fachlich korrekt. Verwende die angegebenen deutschen Bezeichnungen.',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      res.status(502).json({ error: `LLM-API Fehler: ${response.status} ${body}` })
      return
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>
    }

    const summary = data.choices?.[0]?.message?.content ?? ''
    res.json({ summary })
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
