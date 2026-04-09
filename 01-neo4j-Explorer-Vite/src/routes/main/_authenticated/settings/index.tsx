import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/apps/main/features/settings/profile'

export const Route = createFileRoute('/main/_authenticated/settings/')({
  component: SettingsProfile,
})
