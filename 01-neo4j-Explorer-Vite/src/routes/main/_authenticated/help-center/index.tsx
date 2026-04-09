import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/apps/main/components/coming-soon'

export const Route = createFileRoute('/main/_authenticated/help-center/')({
  component: ComingSoon,
})
