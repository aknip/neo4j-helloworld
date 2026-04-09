import { createFileRoute } from '@tanstack/react-router'
import { ReferenceAppAuthenticatedLayout } from '@/apps/main/components/layout/authenticated-layout'

export const Route = createFileRoute('/main/_authenticated')({
  component: ReferenceAppAuthenticatedLayout,
})
