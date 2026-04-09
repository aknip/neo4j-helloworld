import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/apps/main/features/settings'

export const Route = createFileRoute('/main/_authenticated/settings')({
  component: Settings,
})
