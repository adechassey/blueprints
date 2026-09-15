import { createFileRoute } from '@tanstack/react-router';
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, Search, SearchX } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute.js';
import { Avatar } from '../../components/ui/avatar.js';
import { Badge } from '../../components/ui/badge.js';
import { Button } from '../../components/ui/button.js';
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from '../../components/ui/dialog.js';
import { EmptyState } from '../../components/ui/empty.js';
import { Select } from '../../components/ui/select.js';
import { Skeleton } from '../../components/ui/skeleton.js';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../../components/ui/table.js';
import { useAdminUsers, useChangeRole } from '../../hooks/useAdmin.js';
import { authClient } from '../../lib/auth-client.js';
import { cn } from '../../lib/utils.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/admin/users')({
	component: AdminUsersPage,
});

const roleBadgeVariant: Record<string, 'error' | 'shared' | 'default'> = {
	admin: 'error',
	maintainer: 'shared',
	user: 'default',
};

interface AdminUser {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	role?: string | null;
	createdAt: string;
	blueprintCount?: number | null;
}

function SortButton({
	dir,
	children,
	onClick,
}: {
	dir: false | 'asc' | 'desc';
	children: React.ReactNode;
	onClick: ((event: unknown) => void) | undefined;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex cursor-pointer items-center gap-1.5 uppercase tracking-wider hover:text-on-surface"
		>
			{children}
			{dir === 'asc' ? (
				<ArrowUp className="h-3.5 w-3.5" />
			) : dir === 'desc' ? (
				<ArrowDown className="h-3.5 w-3.5" />
			) : (
				<ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
			)}
		</button>
	);
}

function AdminUsersPage() {
	const { data: users, isLoading } = useAdminUsers();
	const changeRole = useChangeRole();
	const { data: session } = authClient.useSession();
	const [search, setSearch] = useState('');
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pendingRoleChange, setPendingRoleChange] = useState<{
		userId: string;
		role: string;
		userName: string;
	} | null>(null);

	const handleRoleChange = useCallback(
		(userId: string, role: string, userName: string) => {
			if (userId === session?.user?.id) return;
			setPendingRoleChange({ userId, role, userName });
		},
		[session?.user?.id],
	);

	const columns = useMemo<ColumnDef<AdminUser>[]>(
		() => [
			{
				accessorKey: 'name',
				header: ({ column }) => (
					<SortButton dir={column.getIsSorted()} onClick={column.getToggleSortingHandler()}>
						{m.admin_user()}
					</SortButton>
				),
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<Avatar src={row.original.image} fallback={row.original.name} size="md" />
						<div className="min-w-0">
							<p className="truncate font-semibold text-on-surface">{row.original.name}</p>
							<p className="truncate text-sm text-on-surface-variant">{row.original.email}</p>
						</div>
					</div>
				),
			},
			{
				accessorFn: (u) => u.role ?? 'user',
				id: 'role',
				header: ({ column }) => (
					<SortButton dir={column.getIsSorted()} onClick={column.getToggleSortingHandler()}>
						{m.admin_role()}
					</SortButton>
				),
				cell: ({ row }) => (
					<Badge variant={roleBadgeVariant[row.original.role ?? 'user'] ?? 'default'}>
						{row.original.role ?? 'user'}
					</Badge>
				),
			},
			{
				accessorKey: 'createdAt',
				header: ({ column }) => (
					<SortButton dir={column.getIsSorted()} onClick={column.getToggleSortingHandler()}>
						{m.admin_joined()}
					</SortButton>
				),
				cell: ({ row }) => (
					<span className="whitespace-nowrap text-on-surface-variant">
						{new Date(row.original.createdAt).toLocaleDateString()}
					</span>
				),
			},
			{
				accessorFn: (u) => u.blueprintCount ?? 0,
				id: 'blueprintCount',
				header: ({ column }) => (
					<SortButton dir={column.getIsSorted()} onClick={column.getToggleSortingHandler()}>
						{m.admin_blueprints_col()}
					</SortButton>
				),
				cell: ({ row }) => (
					<span className="text-on-surface-variant">{row.original.blueprintCount ?? 0}</span>
				),
			},
			{
				id: 'actions',
				header: () => <span className="sr-only">Actions</span>,
				cell: ({ row }) => (
					<div className="flex justify-end">
						<Select
							value={row.original.role ?? 'user'}
							onChange={(e) => handleRoleChange(row.original.id, e.target.value, row.original.name)}
							disabled={row.original.id === session?.user?.id}
							className="w-36"
							aria-label={`${m.admin_role}: ${row.original.name}`}
						>
							<option value="user">user</option>
							<option value="maintainer">maintainer</option>
							<option value="admin">admin</option>
						</Select>
					</div>
				),
			},
		],
		[handleRoleChange, session?.user?.id],
	);

	const table = useReactTable<AdminUser>({
		data: users ?? [],
		columns,
		state: {
			sorting,
			globalFilter: search,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setSearch,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: (row, _columnId, value) => {
			const term = String(value).toLowerCase();
			return (
				row.original.name.toLowerCase().includes(term) ||
				row.original.email.toLowerCase().includes(term)
			);
		},
	});

	const confirmRoleChange = () => {
		if (pendingRoleChange) {
			changeRole.mutate(
				{ userId: pendingRoleChange.userId, role: pendingRoleChange.role },
				{ onSettled: () => setPendingRoleChange(null) },
			);
		}
	};

	const rows = table.getRowModel().rows;

	return (
		<ProtectedRoute>
			<div className="space-y-6">
				<h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
					{m.admin_manage_users()}
				</h1>

				<div className="relative max-w-sm">
					<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
					<input
						type="text"
						placeholder={m.admin_search_users()}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
					/>
				</div>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
							<Skeleton key={i} className="h-16" />
						))}
					</div>
				) : rows.length ? (
					<div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-rest">
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((hg) => (
									<TableRow key={hg.id}>
										{hg.headers.map((header) => (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{rows.map((row) => (
									<TableRow
										key={row.id}
										className={cn(row.original.id === session?.user?.id && 'bg-primary/5')}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : search ? (
					<EmptyState icon={SearchX} title={m.admin_no_users()} />
				) : (
					<EmptyState icon={SearchX} title={m.admin_no_users()} />
				)}

				<Dialog open={!!pendingRoleChange} onClose={() => setPendingRoleChange(null)}>
					<DialogTitle>{m.admin_confirm_role_change()}</DialogTitle>
					<DialogDescription>
						{pendingRoleChange?.userName} &rarr;{' '}
						<Badge variant={roleBadgeVariant[pendingRoleChange?.role ?? 'user'] ?? 'default'}>
							{pendingRoleChange?.role}
						</Badge>
					</DialogDescription>
					<DialogFooter>
						<Button variant="secondary" size="sm" onClick={() => setPendingRoleChange(null)}>
							Cancel
						</Button>
						<Button variant="primary" size="sm" onClick={confirmRoleChange}>
							Confirm
						</Button>
					</DialogFooter>
				</Dialog>
			</div>
		</ProtectedRoute>
	);
}
