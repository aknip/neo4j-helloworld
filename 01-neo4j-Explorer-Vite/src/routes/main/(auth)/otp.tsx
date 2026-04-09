import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/apps/main/features/auth/otp'

export const Route = createFileRoute('/main/(auth)/otp')({
  component: Otp,
})
