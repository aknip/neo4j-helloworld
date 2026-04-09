import { createFileRoute } from '@tanstack/react-router'
import { SettingsNotifications } from '@/apps/main/features/settings/notifications'

export const Route = createFileRoute('/main/_authenticated/settings/notifications')({
  component: SettingsNotifications,
})
