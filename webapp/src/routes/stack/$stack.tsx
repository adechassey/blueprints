import { createFileRoute } from '@tanstack/react-router';
import { blueprints } from '../../blueprints';
import { BlueprintList } from '../../components/BlueprintList';
import * as m from '../../paraglide/messages.js';

export const Route = createFileRoute('/stack/$stack')({
	component: StackPage,
});

function StackPage() {
	const { stack } = Route.useParams();
	const filtered = blueprints.filter((b) => b.stack === stack);

	return (
		<>
			<h1 className="mb-6 text-2xl font-bold capitalize text-gray-900">
				{m.page_stack_title({ stack })}
			</h1>
			<BlueprintList blueprints={filtered} />
		</>
	);
}
