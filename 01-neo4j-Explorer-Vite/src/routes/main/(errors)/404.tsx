import { createFileRoute } from '@tanstack/react-router'
import { NotFoundError } from '@/apps/main/features/errors/not-found-error'

export const Route = createFileRoute('/main/(errors)/404')({
  component: NotFoundError,
})
