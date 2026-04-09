import { createFileRoute } from '@tanstack/react-router'
import { UnauthorisedError } from '@/apps/main/features/errors/unauthorized-error'

export const Route = createFileRoute('/main/(errors)/401')({
  component: UnauthorisedError,
})
