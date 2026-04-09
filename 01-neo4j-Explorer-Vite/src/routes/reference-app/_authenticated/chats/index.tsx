import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/apps/reference-app/features/chats'

export const Route = createFileRoute('/reference-app/_authenticated/chats/')({
  component: Chats,
})
