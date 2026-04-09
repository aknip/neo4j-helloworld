import { createFileRoute } from '@tanstack/react-router'
import { SettingsNotifications } from '@/apps/reference-app/features/settings/notifications'

export const Route = createFileRoute('/reference-app/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
