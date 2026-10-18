import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$module/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$module/"!</div>
}
