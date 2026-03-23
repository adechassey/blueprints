import { createFileRoute } from '@tanstack/react-router'
import { blueprints } from '../blueprints'
import { BlueprintList } from '../components/BlueprintList'

export const Route = createFileRoute('/')({
  component: () => (
    <>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">All Blueprints</h1>
      <BlueprintList blueprints={blueprints} />
    </>
  ),
})
