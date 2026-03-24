import { createFileRoute } from '@tanstack/react-router';
import { blueprints } from '../blueprints';
import { BlueprintList } from '../components/BlueprintList';
import * as m from '../paraglide/messages.js';

export const Route = createFileRoute('/')({
	component: () => (
		<>
			<h1 className="mb-6 text-2xl font-bold text-gray-900">{m.page_all_title()}</h1>
			<BlueprintList blueprints={blueprints} />
		</>
	),
});
