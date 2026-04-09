import { createFileRoute } from '@tanstack/react-router'
import { NotFoundError } from '@/apps/reference-app/features/errors/not-found-error'

export const Route = createFileRoute('/reference-app/(errors)/404')({
  component: NotFoundError,
})
