import { createFileRoute } from '@tanstack/react-router'
import { ComponentExample } from '@/apps/reference-app/components/component-example'

export const Route = createFileRoute('/reference-app/_authenticated/component-showcase')({
  component: ComponentExample,
})
