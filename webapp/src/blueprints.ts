export type Blueprint = {
  id: string
  name: string
  usage: string
  source: string
  file: string
  stack: 'webapp' | 'server' | 'shared'
  category: string
}

function inferStack(source: string, file: string): 'webapp' | 'server' | 'shared' {
  if (source.includes('/webapp/')) return 'webapp'
  if (source.includes('/server/')) return 'server'
  if (source.includes('/schemas/')) return 'shared'
  if (file.endsWith('.tsx')) return 'webapp'
  return 'server'
}

function inferCategory(id: string): string {
  const prefix = id.split('-')[0]
  const categoryMap: Record<string, string> = {
    adapter: 'Adapter',
    audit: 'Audit & Logging',
    wide: 'Audit & Logging',
    controller: 'Controller',
    dto: 'DTO',
    repository: 'Repository',
    schema: 'Schema',
    service: 'Service',
    route: 'Route',
    create: 'Page',
    edit: 'Page',
    list: 'Page',
    view: 'Page',
    domain: 'Page',
    atom: 'UI Component',
    molecule: 'UI Component',
    data: 'UI Component',
    file: 'UI Component',
    form: 'UI Component',
    section: 'UI Component',
    selection: 'UI Component',
    table: 'UI Component',
    tanstack: 'Data Fetching',
    use: 'Data Fetching',
    decimal: 'Domain Logic',
    fiscal: 'Domain Logic',
    error: 'Infrastructure',
    module: 'Infrastructure',
    permissions: 'Infrastructure',
    zod: 'Infrastructure',
  }
  return categoryMap[prefix] ?? 'Other'
}

const raw: Array<{ id: string; name: string; usage: string; source: string; file: string }> = [
  { id: 'adapter-prisma-type', name: 'Adapter Prisma Type', usage: 'Use for deriving adapter input types from Prisma include clauses via GetPayload utility', source: 'target/server/src/inbox-notification/repository/inbox-notification.adapter.ts:L6', file: 'adapter-prisma-type.ts' },
  { id: 'adapter-to-detail-record', name: 'Adapter To Detail Record', usage: 'Use for mapping a Prisma entity with included relations to a domain detail type', source: 'target/server/src/activity-template/repository/activity-template.adapter.ts:L39', file: 'adapter-to-detail-record.ts' },
  { id: 'adapter-to-record', name: 'Adapter To Record', usage: 'Use for mapping Prisma model types to domain record types', source: 'target/server/src/area/repository/area.adapter.ts:L5', file: 'adapter-to-record.ts' },
  { id: 'atom', name: 'Atom', usage: 'Use for base UI primitives with CVA variants, Base UI, and Tailwind styling', source: 'target/webapp/src/ui/components/atoms/button/Button.tsx:L50', file: 'atom.tsx' },
  { id: 'audit-log-emit', name: 'Audit Log Emit', usage: 'Use after entity mutations (create/update/delete) to emit an audit log entry', source: 'target/server/src/area/area.service.ts:L113', file: 'audit-log-emit.ts' },
  { id: 'controller-count', name: 'Controller Count', usage: 'Use for GET count endpoints returning a single { count } object', source: 'target/server/src/inbox-notification/inbox-notification.controller.ts:L41', file: 'controller-count.ts' },
  { id: 'controller-create', name: 'Controller Create', usage: 'Use for POST / endpoints creating an entity with 201 response', source: 'target/server/src/area/area.controller.ts:L108', file: 'controller-create.ts' },
  { id: 'controller-find-one', name: 'Controller Find One', usage: 'Use for GET /:id endpoints returning a single entity', source: 'target/server/src/area/area.controller.ts:L86', file: 'controller-find-one.ts' },
  { id: 'controller-hard-delete', name: 'Controller Hard Delete', usage: 'Use for DELETE /:id/hard endpoints with 204 response', source: 'target/server/src/area/area.controller.ts:L150', file: 'controller-hard-delete.ts' },
  { id: 'controller-lookup', name: 'Controller Lookup', usage: 'Use for GET /all endpoints returning id/name pairs for dropdowns', source: 'target/server/src/area/area.controller.ts:L63', file: 'controller-lookup.ts' },
  { id: 'controller-search', name: 'Controller Search', usage: 'Use for paginated list endpoints with filtering/sorting via POST /search', source: 'target/server/src/area/area.controller.ts:L38', file: 'controller-search.ts' },
  { id: 'controller-update', name: 'Controller Update', usage: 'Use for PUT /:id endpoints with partial update and 204 response', source: 'target/server/src/area/area.controller.ts:L130', file: 'controller-update.ts' },
  { id: 'create-page', name: 'Create Page', usage: 'Use for entity create pages with Form compound component, mutation, ConfirmationDialog, and toast', source: 'target/webapp/src/ui/components/pages/areas/AreaCreatePage.tsx:L19', file: 'create-page.tsx' },
  { id: 'data-table', name: 'Data Table', usage: 'Use for generic data tables wrapping TanStack Table with action menu and pagination', source: 'target/webapp/src/ui/components/molecules/data-table/DataTable.tsx:L85', file: 'data-table.tsx' },
  { id: 'decimal-core-logic', name: 'Decimal Core Logic', usage: 'Use when writing pure business logic that performs arithmetic on monetary/percentage values', source: 'target/server/src/activity/activity.core.ts:L260', file: 'decimal-core-logic.ts' },
  { id: 'decimal-schema-field', name: 'Decimal Schema Field', usage: 'Use when adding a monetary or percentage field to a Zod entity schema', source: 'target/schemas/src/activity.schema.ts:L45', file: 'decimal-schema-field.ts' },
  { id: 'decimal-schema-refinement', name: 'Decimal Schema Refinement', usage: 'Use when adding cross-field Zod refinements that compare or aggregate Decimal values', source: 'target/schemas/src/activity.core.ts:L19', file: 'decimal-schema-refinement.ts' },
  { id: 'decimal-webapp-compute', name: 'Decimal Webapp Compute', usage: 'Use when writing webapp utility functions that compute monetary or percentage values', source: 'target/webapp/src/core/activity/activity-brands.util.ts:L24', file: 'decimal-webapp-compute.ts' },
  { id: 'domain-data-table', name: 'Domain Data Table', usage: 'Use for domain entity tables composing DataTable molecule with columns, action menu, skeleton, and toolbar', source: 'target/webapp/src/ui/components/organisms/brand/BrandsTable.tsx:L22', file: 'domain-data-table.tsx' },
  { id: 'dto-codec', name: 'DTO Codec', usage: 'Use when creating a DTO for a schema that contains codec fields (MoneySchema, PercentageSchema)', source: 'target/server/src/activity/dto/activity.dto.ts:L16', file: 'dto-codec.ts' },
  { id: 'dto-create', name: 'DTO Create', usage: 'Use for create input DTO and create result DTO as a pair', source: 'target/server/src/area/dto/area.dto.ts:L20', file: 'dto-create.ts' },
  { id: 'dto-entity', name: 'DTO Entity', usage: 'Use for the main entity DTO class wrapping a Zod schema', source: 'target/server/src/area/dto/area.dto.ts:L12', file: 'dto-entity.ts' },
  { id: 'dto-lookup', name: 'DTO Lookup', usage: 'Use for lookup response DTOs returning id/name pairs', source: 'target/server/src/area/dto/area.dto.ts:L45', file: 'dto-lookup.ts' },
  { id: 'dto-paginated', name: 'DTO Paginated', usage: 'Use for paginated list response DTOs with data array and meta', source: 'target/server/src/area/dto/area.dto.ts:L37', file: 'dto-paginated.ts' },
  { id: 'dto-query', name: 'DTO Query', usage: 'Use for query param and path param DTOs wrapping shared Zod schemas via createZodDto', source: 'target/server/src/area/dto/query-area.dto.ts:L5', file: 'dto-query.ts' },
  { id: 'dto-update', name: 'DTO Update', usage: 'Use for update input DTO wrapping a partial schema', source: 'target/server/src/area/dto/area.dto.ts:L29', file: 'dto-update.ts' },
  { id: 'edit-page', name: 'Edit Page', usage: 'Use for entity edit pages with Form compound component, PUT mutation, ConfirmationDialog, and dual query invalidation', source: 'target/webapp/src/ui/components/pages/areas/AreaEditPage.tsx:L21', file: 'edit-page.tsx' },
  { id: 'error-factory', name: 'Error Factory', usage: 'Use for typed NestJS exception factories with ErrorCodes and i18n messages', source: 'target/server/src/area/area.error.ts:L5', file: 'error-factory.ts' },
  { id: 'file-input', name: 'File Input', usage: 'Use for file upload fields with preview, drag-and-drop, and ARIA accessibility', source: 'target/webapp/src/ui/components/molecules/file-upload-field/FileUploadField.tsx:L66', file: 'file-input.tsx' },
  { id: 'fiscal-month-iteration', name: 'Fiscal Month Iteration', usage: 'Use for iterating over fiscal months to compute totals, transform month-keyed records, or build month-indexed data structures', source: 'target/schemas/src/fiscal-month.constant.ts:L2', file: 'fiscal-month-iteration.ts' },
  { id: 'form-field', name: 'Form Field', usage: 'Use for form fields composing Label + Input with error/help text and ARIA attributes', source: 'target/webapp/src/ui/components/molecules/form-field/FormField.tsx:L60', file: 'form-field.tsx' },
  { id: 'form-validation', name: 'Form Validation', usage: 'Use for entity forms with Zod schema validation via TanStack Form compound component pattern', source: 'target/webapp/src/ui/components/organisms/area/AreaForm.tsx:L30', file: 'form-validation.tsx' },
  { id: 'list-page', name: 'List Page', usage: 'Use for entity list pages with paginated table, permission-gated CRUD navigation, and page header with icon', source: 'target/webapp/src/ui/components/pages/areas/AreasPage.tsx:L15', file: 'list-page.tsx' },
  { id: 'module-entity', name: 'Module Entity', usage: 'Use for NestJS module wiring Controller, Service, Repository, and PrismaService with AuditLogModule', source: 'target/server/src/area/area.module.ts:L9', file: 'module-entity.ts' },
  { id: 'molecule', name: 'Molecule', usage: 'Use for components composing 2-3 atoms with typed props and i18n labels', source: 'target/webapp/src/ui/components/molecules/confirmation-dialog/ConfirmationDialog.tsx:L27', file: 'molecule.tsx' },
  { id: 'permissions-context', name: 'Permissions Context', usage: 'Use for permission checks in components via useMatch context and can/canAtLeastOne helpers', source: 'target/webapp/src/core/permissions/use-permissions.ts:L13', file: 'permissions-context.ts' },
  { id: 'repository-complex-filter', name: 'Repository Complex Filter', usage: 'Use for building Prisma where clauses with direct, relational, and manyToMany filters via applyAllFilters', source: 'target/server/src/activity/repository/activity.repository.ts:L474', file: 'repository-complex-filter.ts' },
  { id: 'repository-count', name: 'Repository Count', usage: 'Use for Prisma count queries with where clause returning a single number', source: 'target/server/src/inbox-notification/repository/inbox-notification.repository.ts:L53', file: 'repository-count.ts' },
  { id: 'repository-create', name: 'Repository Create', usage: 'Use for Prisma create with company relation connect and adapter mapping', source: 'target/server/src/area/repository/area.repository.ts:L105', file: 'repository-create.ts' },
  { id: 'repository-cross-module', name: 'Repository Cross Module', usage: 'Use for repository methods that expose domain data tailored for consumption by another module', source: 'target/server/src/activity/repository/activity.repository.ts:L490', file: 'repository-cross-module.ts' },
  { id: 'repository-find-one', name: 'Repository Find One', usage: 'Use for findUnique by ID with adapter mapping to domain record', source: 'target/server/src/area/repository/area.repository.ts:L80', file: 'repository-find-one.ts' },
  { id: 'repository-hard-delete', name: 'Repository Hard Delete', usage: 'Use for Prisma delete with P2003 foreign key error handling', source: 'target/server/src/area/repository/area.repository.ts:L137', file: 'repository-hard-delete.ts' },
  { id: 'repository-lookup', name: 'Repository Lookup', usage: 'Use for findMany with select {id, name} and optional status filter', source: 'target/server/src/area/repository/area.repository.ts:L52', file: 'repository-lookup.ts' },
  { id: 'repository-search', name: 'Repository Search', usage: 'Use for paginated queries with where clause, orderBy, skip/take, and parallel count', source: 'target/server/src/area/repository/area.repository.ts:L24', file: 'repository-search.ts' },
  { id: 'repository-transaction', name: 'Repository Transaction', usage: 'Use for wrapping multiple Prisma operations in an interactive transaction for atomicity', source: 'target/server/src/subarea/repository/subarea.repository.ts:L164', file: 'repository-transaction.ts' },
  { id: 'repository-type', name: 'Repository Type', usage: 'Use for defining repository contract with domain record types derived from shared schemas', source: 'target/server/src/area/repository/area.repository.type.ts:L11', file: 'repository-type.ts' },
  { id: 'repository-update', name: 'Repository Update', usage: 'Use for Prisma update by ID with partial data', source: 'target/server/src/area/repository/area.repository.ts:L124', file: 'repository-update.ts' },
  { id: 'repository-virtual-filter', name: 'Repository Virtual Filter', usage: 'Use for building Prisma where clauses with virtual() filters that apply custom OR logic across multiple columns or relations', source: 'target/server/src/budget-version-reassign/repository/budget-version-reassign.repository.ts:L302', file: 'repository-virtual-filter.ts' },
  { id: 'route-create', name: 'Route Create', usage: 'Use for entity create routes with beforeLoad i18n title and companyId param extraction', source: 'target/webapp/src/app/routes/company/$companyId/catalogs/areas/new.tsx:L6', file: 'route-create.tsx' },
  { id: 'route-edit', name: 'Route Edit', usage: 'Use for entity edit routes with loader prefetching GET /:id and useSuspenseQuery', source: 'target/webapp/src/app/routes/company/$companyId/catalogs/areas/edit/$id.tsx:L8', file: 'route-edit.tsx' },
  { id: 'route-list', name: 'Route List', usage: 'Use for paginated list routes with validateSearch, loaderDeps, ensureQueryData, and useSuspenseQuery', source: 'target/webapp/src/app/routes/company/$companyId/catalogs/areas/index.tsx:L8', file: 'route-list.tsx' },
  { id: 'route-view', name: 'Route View', usage: 'Use for entity view routes with loader prefetching GET /:id and back navigation', source: 'target/webapp/src/app/routes/company/$companyId/catalogs/areas/view/$id.tsx:L8', file: 'route-view.tsx' },
  { id: 'schema-create', name: 'Schema Create', usage: 'Use for create input schema via EntitySchema.omit({id, companyId, timestamps})', source: 'target/schemas/src/area.schema.ts:L35', file: 'schema-create.ts' },
  { id: 'schema-entity', name: 'Schema Entity', usage: 'Use for base entity schema with .describe() for OpenAPI and i18n error messages', source: 'target/schemas/src/area.schema.ts:L14', file: 'schema-entity.ts' },
  { id: 'schema-lookup', name: 'Schema Lookup', usage: 'Use for lookup query schema with optional status and relation filters', source: 'target/schemas/src/area.schema.ts:L103', file: 'schema-lookup.ts' },
  { id: 'schema-paginated', name: 'Schema Paginated', usage: 'Use for paginated response schema with data array and PaginationMetaSchema', source: 'target/schemas/src/area.schema.ts:L86', file: 'schema-paginated.ts' },
  { id: 'schema-search', name: 'Schema Search', usage: 'Use for search query schema with FilterableFields and SortableFields arrays', source: 'target/schemas/src/area.schema.ts:L70', file: 'schema-search.ts' },
  { id: 'schema-update', name: 'Schema Update', usage: 'Use for update input schema via CreateSchema.partial()', source: 'target/schemas/src/area.schema.ts:L50', file: 'schema-update.ts' },
  { id: 'section-form-section', name: 'Section Form Section', usage: 'Use for individual sections within a section-based accordion form', source: 'target/webapp/src/ui/components/organisms/budget-version-movement/BudgetVersionSection.tsx:L20', file: 'section-form-section.tsx' },
  { id: 'section-form', name: 'Section Form', usage: 'Use for multi-step accordion forms with section locking, change-detection, and child-reset', source: 'target/webapp/src/ui/components/organisms/budget-version-movement/BudgetVersionMovementForm.tsx:L34', file: 'section-form.tsx' },
  { id: 'selection-ui-usage', name: 'Selection UI Usage', usage: 'Use for organism sections that bind reusable selection molecules directly to form state with localized labels and mode-based disabling', source: 'target/webapp/src/ui/components/organisms/activity/ActivityFormTargetAudience.tsx:L7', file: 'selection-ui-usage.tsx' },
  { id: 'service-bypass-permissions', name: 'Service Bypass Permissions', usage: 'Use for cross-domain service methods where the caller is responsible for permission checks', source: 'target/server/src/activity-template/activity-template.service.ts:L82', file: 'service-bypass-permissions.ts' },
  { id: 'service-create', name: 'Service Create', usage: 'Use for create with permission check, duplicate validation, and audit log', source: 'target/server/src/area/area.service.ts:L88', file: 'service-create.ts' },
  { id: 'service-delete', name: 'Service Delete', usage: 'Use for delete with admin permission check and audit log', source: 'target/server/src/area/area.service.ts:L163', file: 'service-delete.ts' },
  { id: 'service-excel-export', name: 'Service Excel Export', usage: 'Use for exporting domain data as a downloadable XLSX file via ExcelWriterService', source: 'target/server/src/budget-version/budget-version.service.ts:L241', file: 'service-excel-export.ts' },
  { id: 'service-find-one', name: 'Service Find One', usage: 'Use for single entity retrieval with not-found error throwing', source: 'target/server/src/area/area.service.ts:L71', file: 'service-find-one.ts' },
  { id: 'service-lookup', name: 'Service Lookup', usage: 'Use for lookup endpoints needing requireAtLeastOneOf permission check', source: 'target/server/src/area/area.service.ts:L49', file: 'service-lookup.ts' },
  { id: 'service-search', name: 'Service Search', usage: 'Use for paginated search with permission check and buildPaginationMeta', source: 'target/server/src/area/area.service.ts:L32', file: 'service-search.ts' },
  { id: 'service-update-nested', name: 'Service Update Nested', usage: 'Use for update methods where the entity has child sub-entities requiring validation before persistence', source: 'target/server/src/activity-template/activity-template.service.ts:L131', file: 'service-update-nested.ts' },
  { id: 'service-update', name: 'Service Update', usage: 'Use for update with existence check, duplicate validation, and audit log', source: 'target/server/src/area/area.service.ts:L130', file: 'service-update.ts' },
  { id: 'table-columns', name: 'Table Columns', usage: 'Use for defining table columns with createColumnCapabilities, DataTableColumnHeader, and i18n meta', source: 'target/webapp/src/ui/components/organisms/area/AreasTable.columns.tsx:L15', file: 'table-columns.tsx' },
  { id: 'tanstack-mutation', name: 'TanStack Mutation', usage: 'Use for mutations with apiClient.useMutation, toast feedback, and query invalidation', source: 'target/webapp/src/ui/components/pages/brands/BrandCreatePage.tsx:L25', file: 'tanstack-mutation.tsx' },
  { id: 'tanstack-query', name: 'TanStack Query', usage: 'Use for type-safe data fetching with apiClient.useSuspenseQuery in route components', source: 'target/webapp/src/app/routes/company/$companyId/catalogs/brands/index.tsx:L33', file: 'tanstack-query.tsx' },
  { id: 'use-format-currency', name: 'Use Format Currency', usage: 'Use when displaying monetary values in organisms/pages that need currency formatting', source: 'target/webapp/src/ui/components/organisms/activity/ActivityFinancialSummary.tsx:L45', file: 'use-format-currency.tsx' },
  { id: 'view-page', name: 'View Page', usage: 'Use for read-only entity view pages with Form compound component in view mode', source: 'target/webapp/src/ui/components/pages/areas/AreaViewPage.tsx:L12', file: 'view-page.tsx' },
  { id: 'wide-event-logging', name: 'Wide Event Logging', usage: 'Use for adding business context to the request-scoped canonical log line via logger.assign', source: 'target/server/src/area/area.service.ts:L105', file: 'wide-event-logging.ts' },
  { id: 'zod-codec', name: 'Zod Codec', usage: 'Use when defining a Zod schema that needs to transform between wire format and runtime type with bidirectional encode/decode', source: 'target/schemas/src/decimal.schema.ts:L9', file: 'zod-codec.ts' },
]

export const blueprints: Blueprint[] = raw.map((b) => ({
  ...b,
  stack: inferStack(b.source, b.file),
  category: inferCategory(b.id),
}))

export const stacks = ['webapp', 'server', 'shared'] as const

export const categories = [...new Set(blueprints.map((b) => b.category))].sort()
