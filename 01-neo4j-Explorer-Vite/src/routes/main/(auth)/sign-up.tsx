import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@/apps/main/features/auth/sign-up'

export const Route = createFileRoute('/main/(auth)/sign-up')({
  component: SignUp,
})
