import { createFileRoute } from '@tanstack/react-router'
import { SettingsAppearance } from '@/apps/reference-app/features/settings/appearance'

export const Route = createFileRoute('/reference-app/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
