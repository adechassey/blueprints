import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CommentSection } from '../../components/CommentSection.js';
import { MarkdownRenderer } from '../../components/MarkdownRenderer.js';
import {
	useBlueprint,
	useBlueprintVersions,
	useDeleteBlueprint,
} from '../../hooks/useBlueprints.js';
import { apiFetch } from '../../lib/api.js';
import { authClient } from '../../lib/auth-client.js';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/blueprints/$blueprintId')({
	component: BlueprintDetailPage,
});

function BlueprintDetailPage() {
	const { blueprintId } = Route.useParams();
	// biome-ignore lint/suspicious/noExplicitAny: API response shape
	const { data: blueprint, isLoading } = useBlueprint(blueprintId) as any;
	// biome-ignore lint/suspicious/noExplicitAny: API response shape
	const { data: versions } = useBlueprintVersions(blueprintId) as any;
	const { data: session } = authClient.useSession();
	const deleteMutation = useDeleteBlueprint();
	const navigate = useNavigate();

	if (isLoading) return <p className="text-sm text-gray-500">{m.loading()}</p>;
	if (!blueprint) return <p className="text-sm text-gray-500">{m.empty_state()}</p>;

	const isOwner = session?.user?.id === blueprint.authorId;
	const isAdmin = session?.user?.role === 'admin';
	const canEdit = isOwner || isAdmin;

	const handleDelete = async () => {
		if (!confirm(m.blueprint_detail_confirm_delete())) return;
		await deleteMutation.mutateAsync(blueprintId);
		navigate({ to: '/' });
	};

	const handleCopy = async () => {
		if (blueprint.currentVersion?.content) {
			await navigator.clipboard.writeText(blueprint.currentVersion.content);
			apiFetch(`/blueprints/${blueprintId}/download`, { method: 'POST' }).catch(() => {});
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">{blueprint.name}</h1>
					{blueprint.description && <p className="mt-1 text-gray-600">{blueprint.description}</p>}
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleCopy}
						className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
					>
						{m.blueprint_detail_copy()}
					</button>
					{canEdit && (
						<>
							<a
								href={`/blueprints/${blueprintId}/edit`}
								className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 no-underline hover:bg-gray-200"
							>
								{m.blueprint_detail_edit()}
							</a>
							<button
								type="button"
								onClick={handleDelete}
								className="rounded-md bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200"
							>
								{m.blueprint_detail_delete()}
							</button>
						</>
					)}
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
					{blueprint.stack}
				</span>
				<span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
					{blueprint.layer}
				</span>
				<span className="text-xs text-gray-400">
					{m.blueprint_detail_downloads({ count: blueprint.downloadCount ?? 0 })}
				</span>
				{blueprint.tags?.map((tag: { name: string }) => (
					<span
						key={tag.name}
						className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
					>
						{tag.name}
					</span>
				))}
			</div>

			{blueprint.currentVersion && (
				<div className="rounded-lg border bg-white p-6">
					<MarkdownRenderer content={blueprint.currentVersion.content} />
				</div>
			)}

			{versions && versions.length > 0 && (
				<div>
					<h2 className="mb-3 text-lg font-semibold">{m.blueprint_detail_versions()}</h2>
					<div className="space-y-2">
						{versions.map(
							(v: { id: string; version: number; createdAt: string; changelog?: string }) => (
								<div
									key={v.id}
									className="flex items-center gap-3 rounded border bg-white px-4 py-2 text-sm"
								>
									<span className="font-medium">
										{m.blueprint_detail_version({ version: v.version })}
									</span>
									<span className="text-gray-400">
										{new Date(v.createdAt).toLocaleDateString()}
									</span>
									{v.changelog && <span className="text-gray-500">{v.changelog}</span>}
								</div>
							),
						)}
					</div>
				</div>
			)}

			<CommentSection blueprintId={blueprintId} />
		</div>
	);
}
