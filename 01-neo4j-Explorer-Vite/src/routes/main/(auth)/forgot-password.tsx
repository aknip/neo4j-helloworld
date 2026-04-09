import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/apps/main/features/auth/forgot-password'

export const Route = createFileRoute('/main/(auth)/forgot-password')({
  component: ForgotPassword,
})
