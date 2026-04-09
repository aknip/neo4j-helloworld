import { createFileRoute } from '@tanstack/react-router'
import { SettingsDisplay } from '@/apps/reference-app/features/settings/display'

export const Route = createFileRoute('/reference-app/_authenticated/settings/display')({
  component: SettingsDisplay,
})
