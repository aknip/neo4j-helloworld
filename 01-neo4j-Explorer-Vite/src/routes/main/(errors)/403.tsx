import { createFileRoute } from '@tanstack/react-router'
import { ForbiddenError } from '@/apps/main/features/errors/forbidden'

export const Route = createFileRoute('/main/(errors)/403')({
  component: ForbiddenError,
})
