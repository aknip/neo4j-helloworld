import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/apps/reference-app/components/coming-soon'

export const Route = createFileRoute('/reference-app/_authenticated/help-center/')({
  component: ComingSoon,
})
