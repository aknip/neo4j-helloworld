import express from 'express'
import cors from 'cors'
import { closeDriver } from './neo4j.js'
import { schemaRouter } from './routes/schema.js'
import { nodesRouter } from './routes/nodes.js'
import { relationshipsRouter } from './routes/relationships.js'
import { searchRouter } from './routes/search.js'
import { importRouter } from './routes/import.js'
import { statsRouter } from './routes/stats.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/schema', schemaRouter)
app.use('/api/nodes', nodesRouter)
app.use('/api/relationships', relationshipsRouter)
app.use('/api/search', searchRouter)
app.use('/api/import', importRouter)
app.use('/api/stats', statsRouter)

app.listen(PORT, () => {
  console.log(`Neo4j Explorer API running on http://localhost:${PORT}`)
})

process.on('SIGINT', async () => {
  await closeDriver()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeDriver()
  process.exit(0)
})
