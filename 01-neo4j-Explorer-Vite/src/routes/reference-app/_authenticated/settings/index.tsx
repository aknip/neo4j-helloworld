import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/apps/reference-app/features/settings/profile'

export const Route = createFileRoute('/reference-app/_authenticated/settings/')({
  component: SettingsProfile,
})
