import { createFileRoute } from '@tanstack/react-router'
import { SettingsAccount } from '@/apps/main/features/settings/account'

export const Route = createFileRoute('/main/_authenticated/settings/account')({
  component: SettingsAccount,
})
