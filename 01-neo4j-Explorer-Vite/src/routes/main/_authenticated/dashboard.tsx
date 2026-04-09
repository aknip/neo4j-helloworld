import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/apps/main/features/dashboard'

export const Route = createFileRoute('/main/_authenticated/dashboard')({
  component: Dashboard,
})
