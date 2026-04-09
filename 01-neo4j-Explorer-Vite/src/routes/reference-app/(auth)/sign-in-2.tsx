import { createFileRoute } from '@tanstack/react-router'
import { SignIn2 } from '@/apps/reference-app/features/auth/sign-in/sign-in-2'

export const Route = createFileRoute('/reference-app/(auth)/sign-in-2')({
  component: SignIn2,
})
