import { createFileRoute } from '@tanstack/react-router'
import { Neo4jExplorer } from '@/apps/main/features/neo4j-explorer'

export const Route = createFileRoute('/main/_authenticated/neo4j-explorer')({
  component: Neo4jExplorer,
})
