import { createFileRoute } from '@tanstack/react-router'
import { MaintenanceError } from '@/apps/main/features/errors/maintenance-error'

export const Route = createFileRoute('/main/(errors)/503')({
  component: MaintenanceError,
})
