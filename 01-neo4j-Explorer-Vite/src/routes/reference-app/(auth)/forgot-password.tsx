import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/apps/reference-app/features/auth/forgot-password'

export const Route = createFileRoute('/reference-app/(auth)/forgot-password')({
  component: ForgotPassword,
})
