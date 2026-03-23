import { createFileRoute } from '@tanstack/react-router'
import { blueprints } from '../../blueprints'
import { BlueprintList } from '../../components/BlueprintList'

export const Route = createFileRoute('/stack/$stack')({
  component: StackPage,
})

function StackPage() {
  const { stack } = Route.useParams()
  const filtered = blueprints.filter((b) => b.stack === stack)

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold capitalize text-gray-900">{stack} Blueprints</h1>
      <BlueprintList blueprints={filtered} />
    </>
  )
}
