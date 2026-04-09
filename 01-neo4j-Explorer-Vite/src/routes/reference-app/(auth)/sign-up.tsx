import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@/apps/reference-app/features/auth/sign-up'

export const Route = createFileRoute('/reference-app/(auth)/sign-up')({
  component: SignUp,
})
