import { createFileRoute } from '@tanstack/react-router'
import { KfzMarktplatz } from '@/apps/reference-app/features/kfz-marktplatz'

export const Route = createFileRoute('/reference-app/_authenticated/kfz-marktplatz/')({
  component: KfzMarktplatz,
})
