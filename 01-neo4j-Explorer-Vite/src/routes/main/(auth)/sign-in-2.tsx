import { createFileRoute } from '@tanstack/react-router'
import { SignIn2 } from '@/apps/main/features/auth/sign-in/sign-in-2'

export const Route = createFileRoute('/main/(auth)/sign-in-2')({
  component: SignIn2,
})
