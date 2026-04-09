import { createFileRoute } from '@tanstack/react-router'
import { GeneralError } from '@/apps/main/features/errors/general-error'

export const Route = createFileRoute('/main/(errors)/500')({
  component: GeneralError,
})
