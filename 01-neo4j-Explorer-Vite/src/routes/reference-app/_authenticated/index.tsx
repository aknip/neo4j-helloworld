import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/apps/reference-app/features/dashboard'

export const Route = createFileRoute('/reference-app/_authenticated/')({
  component: Dashboard,
})
