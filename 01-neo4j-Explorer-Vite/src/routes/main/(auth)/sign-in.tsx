import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@/apps/main/features/auth/sign-in'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/main/(auth)/sign-in')({
  component: SignIn,
  validateSearch: searchSchema,
})
