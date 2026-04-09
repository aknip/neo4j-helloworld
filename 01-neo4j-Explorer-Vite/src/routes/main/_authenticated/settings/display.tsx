import { createFileRoute } from '@tanstack/react-router'
import { SettingsDisplay } from '@/apps/main/features/settings/display'

export const Route = createFileRoute('/main/_authenticated/settings/display')({
  component: SettingsDisplay,
})
