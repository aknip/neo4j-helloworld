import { createFileRoute } from '@tanstack/react-router'
import { ReferenceAppAuthenticatedLayout } from '@/apps/reference-app/components/layout/authenticated-layout'

export const Route = createFileRoute('/reference-app/_authenticated')({
  component: ReferenceAppAuthenticatedLayout,
})
