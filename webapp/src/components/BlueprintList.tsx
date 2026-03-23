import type { Blueprint } from '../blueprints'
import { categories } from '../blueprints'

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
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${stackColors[blueprint.stack]}`}
        >
          {blueprint.stack}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{blueprint.usage}</p>
      <p className="mt-2 font-mono text-xs text-gray-400">{blueprint.file}</p>
    </div>
  )
}

export function BlueprintList({ blueprints }: { blueprints: Blueprint[] }) {
  const grouped = categories
    .map((cat) => ({
      category: cat,
      items: blueprints.filter((b) => b.category === cat),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-500">
        {blueprints.length} blueprint{blueprints.length !== 1 ? 's' : ''}
      </p>
      {grouped.map((group) => (
        <section key={group.category}>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            {group.category}
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
