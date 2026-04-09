import { createFileRoute } from '@tanstack/react-router'
import { GeneralError } from '@/apps/reference-app/features/errors/general-error'

export const Route = createFileRoute('/reference-app/(errors)/500')({
  component: GeneralError,
})
