import { createFileRoute } from '@tanstack/react-router'
import { ForbiddenError } from '@/apps/reference-app/features/errors/forbidden'

export const Route = createFileRoute('/reference-app/(errors)/403')({
  component: ForbiddenError,
})
