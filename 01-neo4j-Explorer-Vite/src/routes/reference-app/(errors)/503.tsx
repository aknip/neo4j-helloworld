import { createFileRoute } from '@tanstack/react-router'
import { MaintenanceError } from '@/apps/reference-app/features/errors/maintenance-error'

export const Route = createFileRoute('/reference-app/(errors)/503')({
  component: MaintenanceError,
})
