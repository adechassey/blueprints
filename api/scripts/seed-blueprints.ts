/**
 * Synthetic blueprints for local development and tests.
 *
 * Invented on purpose: real blueprints live in the registry's database, never
 * in this repository (see the "Client data" rule in CLAUDE.md). They cover
 * every architecture layer and the main technologies so that filters, stacks
 * and the scaffold command have something to work with locally.
 */
import type { BlueprintLayer } from '@blueprints/shared';

export interface SeedBlueprint {
	name: string;
	description: string;
	usage: string;
	layer: BlueprintLayer;
	/** Technology slugs from the catalog (migration 0009_technology_catalog). */
	technologies: string[];
	tags: string[];
	content: string;
}

export const SEED_BLUEPRINTS: SeedBlueprint[] = [
	{
		name: 'Drizzle schema with relations',
		description: 'A table and its foreign keys, with the indexes the queries rely on.',
		usage: 'Use when adding an entity to the schema.',
		layer: 'database',
		technologies: ['drizzle', 'postgresql', 'typescript'],
		tags: ['schema'],
		content: `## Context

A table, its relations and the indexes the read paths rely on.

## Implementation

\`\`\`ts
export const orders = pgTable(
	'orders',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		reference: text('reference').notNull(),
		customerId: uuid('customer_id')
			.notNull()
			.references(() => customers.id, { onDelete: 'cascade' }),
		placedAt: timestamp('placed_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		unique('orders_reference_unique').on(t.reference),
		index('orders_customer_idx').on(t.customerId),
	],
);
\`\`\`
`,
	},
	{
		name: 'Repository with a transaction',
		description: 'Writes that must succeed or fail together, in one transaction.',
		usage: 'Use when a write touches several tables.',
		layer: 'database',
		technologies: ['drizzle', 'postgresql', 'typescript'],
		tags: ['repository'],
		content: `## Context

Two writes that must not be observed half-applied.

## Implementation

\`\`\`ts
export async function placeOrder(db: DB, input: NewOrder) {
	return db.transaction(async (tx) => {
		const [order] = await tx.insert(orders).values(input.order).returning();
		if (!order) throw new Error('Insert order failed');
		await tx.insert(orderLines).values(input.lines.map((line) => ({ ...line, orderId: order.id })));
		return order;
	});
}
\`\`\`
`,
	},
	{
		name: 'Hono route with Zod validation',
		description: 'A typed endpoint validating its body before it reaches the service.',
		usage: 'Use for every write endpoint.',
		layer: 'api',
		technologies: ['hono', 'zod', 'typescript'],
		tags: ['validation'],
		content: `## Context

Validation belongs at the edge: the service receives a parsed input.

## Implementation

\`\`\`ts
const createOrderSchema = z.object({
	reference: z.string().min(1),
	lines: z.array(z.object({ sku: z.string(), quantity: z.number().int().positive() })).min(1),
});

export const orderRoutes = new Hono().post(
	'/orders',
	requireAuth,
	zValidator('json', createOrderSchema),
	async (c) => c.json(await placeOrder(db, c.req.valid('json')), 201),
);
\`\`\`
`,
	},
	{
		name: 'Paginated listing endpoint',
		description: 'Page, limit and total, with the filters applied to both queries.',
		usage: 'Use for any endpoint returning a collection.',
		layer: 'api',
		technologies: ['hono', 'drizzle', 'typescript'],
		tags: ['pagination'],
		content: `## Context

The count query must carry the same filters as the page query, or the total lies.

## Implementation

\`\`\`ts
const conditions = [eq(orders.customerId, customerId)];
if (status) conditions.push(eq(orders.status, status));
const where = and(...conditions);

const items = await db.select().from(orders).where(where).limit(limit).offset((page - 1) * limit);
const [{ total }] = await db.select({ total: count() }).from(orders).where(where);
return { items, total, page, limit };
\`\`\`
`,
	},
	{
		name: 'Pure core business rules',
		description: 'Decision logic with no I/O, unit-tested to 100%.',
		usage: 'Use when a rule is worth testing on its own.',
		layer: 'domain',
		technologies: ['typescript'],
		tags: ['core'],
		content: `## Context

Keep the rule pure: the service does the I/O, the core decides.

## Implementation

\`\`\`ts
/** An order can be cancelled until it ships, and never twice. */
export function canCancel(order: { status: OrderStatus; shippedAt: Date | null }): boolean {
	if (order.status === 'cancelled') return false;
	return order.shippedAt === null;
}
\`\`\`
`,
	},
	{
		name: 'Lifecycle state machine',
		description: 'Allowed transitions declared once, rejected everywhere else.',
		usage: 'Use when an entity has statuses.',
		layer: 'domain',
		technologies: ['typescript', 'zod'],
		tags: ['lifecycle'],
		content: `## Context

Transitions declared as data, so an illegal one cannot be written by accident.

## Implementation

\`\`\`ts
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
	draft: ['placed', 'cancelled'],
	placed: ['shipped', 'cancelled'],
	shipped: [],
	cancelled: [],
};

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
	if (!TRANSITIONS[from].includes(to)) {
		throw new InvalidTransitionError(from, to);
	}
}
\`\`\`
`,
	},
	{
		name: 'Data table with pagination',
		description: 'A sortable table wired to server-side pagination.',
		usage: 'Use for any list screen.',
		layer: 'ui',
		technologies: ['react', 'tanstack-table', 'tailwindcss'],
		tags: ['table'],
		content: `## Context

The table renders a page; the server owns sorting and paging.

## Implementation

\`\`\`tsx
export function OrdersTable({ data, total, page, onPageChange }: OrdersTableProps) {
	const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

	return (
		<div className="space-y-4">
			<table className="w-full text-sm">{/* headers and rows from \`table\` */}</table>
			<Pagination page={page} total={total} limit={20} onPageChange={onPageChange} />
		</div>
	);
}
\`\`\`
`,
	},
	{
		name: 'Form with field validation',
		description: 'A form validating against the same schema as the API.',
		usage: 'Use for create and edit screens.',
		layer: 'ui',
		technologies: ['react', 'tanstack-form', 'zod'],
		tags: ['forms'],
		content: `## Context

One schema, shared by the form and the endpoint: the messages cannot drift.

## Implementation

\`\`\`tsx
const form = useForm({
	defaultValues: { reference: '' },
	validators: { onChange: createOrderSchema },
	onSubmit: async ({ value }) => createOrder.mutateAsync(value),
});
\`\`\`
`,
	},
	{
		name: 'TanStack Query mutation',
		description: 'A mutation invalidating exactly the queries it affects.',
		usage: 'Use for every write from the webapp.',
		layer: 'state',
		technologies: ['react', 'tanstack-query', 'typescript'],
		tags: ['hooks'],
		content: `## Context

Invalidate the lists the write changed, and surface failures to the user.

## Implementation

\`\`\`ts
export function useCreateOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateOrderInput) => api.orders.$post({ json: input }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			toast.success('Order created');
		},
		onError: (error) => toast.error('Something went wrong', { description: error.message }),
	});
}
\`\`\`
`,
	},
	{
		name: 'Vitest coverage on core files',
		description: 'Pure logic held at 100% coverage by configuration.',
		usage: 'Use when adding a package that holds business rules.',
		layer: 'testing',
		technologies: ['vitest', 'typescript'],
		tags: ['coverage'],
		content: `## Context

Thresholds make the rule enforceable instead of aspirational.

## Implementation

\`\`\`ts
export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			include: ['src/**/*.core.ts'],
			thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
		},
	},
});
\`\`\`
`,
	},
	{
		name: 'Docker compose for local Postgres',
		description: 'A local database with a pinned image and a healthcheck.',
		usage: 'Use to run the stack locally.',
		layer: 'infra',
		technologies: ['docker', 'postgresql'],
		tags: [],
		content: `## Context

Pin the image and wait for readiness, so the app never races the database.

## Implementation

\`\`\`yaml
services:
  postgres:
    image: pgvector/pgvector:pg17
    ports: ['5433:5432']
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U app']
      interval: 5s
\`\`\`
`,
	},
	{
		name: 'Vite app with path aliases',
		description: 'Aliases resolved the same way by the bundler and TypeScript.',
		usage: 'Use when setting up a frontend package.',
		layer: 'tooling',
		technologies: ['vite', 'react', 'typescript'],
		tags: [],
		content: `## Context

The bundler and \`tsc\` must agree, or imports resolve in one and fail in the other.

## Implementation

\`\`\`ts
export default defineConfig({
	plugins: [react()],
	resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
\`\`\`
`,
	},
];
