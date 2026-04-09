import { createFileRoute } from '@tanstack/react-router'
import { UnauthorisedError } from '@/apps/reference-app/features/errors/unauthorized-error'

export const Route = createFileRoute('/reference-app/(errors)/401')({
  component: UnauthorisedError,
})
