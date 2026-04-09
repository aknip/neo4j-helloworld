import { createFileRoute } from '@tanstack/react-router'
import { SettingsAccount } from '@/apps/reference-app/features/settings/account'

export const Route = createFileRoute('/reference-app/_authenticated/settings/account')({
  component: SettingsAccount,
})
