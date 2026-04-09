import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/apps/reference-app/features/settings'

export const Route = createFileRoute('/reference-app/_authenticated/settings')({
  component: Settings,
})
