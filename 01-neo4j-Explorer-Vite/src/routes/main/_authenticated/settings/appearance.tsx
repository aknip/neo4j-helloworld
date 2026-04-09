import { createFileRoute } from '@tanstack/react-router'
import { SettingsAppearance } from '@/apps/main/features/settings/appearance'

export const Route = createFileRoute('/main/_authenticated/settings/appearance')({
  component: SettingsAppearance,
})
