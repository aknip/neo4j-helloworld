import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/apps/reference-app/features/auth/otp'

export const Route = createFileRoute('/reference-app/(auth)/otp')({
  component: Otp,
})
