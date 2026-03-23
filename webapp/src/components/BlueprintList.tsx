import type { Blueprint } from '../blueprints'
import { layers } from '../blueprints'

const stackColors: Record<string, string> = {
  webapp: 'bg-blue-100 text-blue-700',
  server: 'bg-green-100 text-green-700',
  shared: 'bg-amber-100 text-amber-700',
}

function BlueprintCard({ blueprint }: { blueprint: Blueprint }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 text-sm">{blueprint.name}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${stackColors[blueprint.stack] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {blueprint.stack}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{blueprint.usage}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
          {blueprint.layer}
        </span>
        <span className="font-mono text-xs text-gray-400">{blueprint.id}</span>
      </div>
    </div>
  )
}

export function BlueprintList({ blueprints }: { blueprints: Blueprint[] }) {
  const grouped = layers
    .map((layer) => ({
      layer,
      items: blueprints.filter((b) => b.layer === layer),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500">
        {blueprints.length} blueprint{blueprints.length !== 1 ? 's' : ''}
      </p>
      {grouped.map((group) => (
        <section key={group.layer}>
          <h2 className="mb-3 text-lg font-semibold capitalize text-gray-800">
            {group.layer}
            <span className="ml-2 text-sm font-normal text-gray-400">{group.items.length}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.items.map((b) => (
              <BlueprintCard key={b.id} blueprint={b} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
