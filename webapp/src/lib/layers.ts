import type { BlueprintLayer } from '@blueprints/shared';
import {
	Boxes,
	Database,
	FlaskConical,
	type LucideIcon,
	PanelsTopLeft,
	Server,
	Webhook,
	Workflow,
	Wrench,
} from 'lucide-react';
import * as m from '../paraglide/messages.js';

interface LayerMeta {
	icon: LucideIcon;
	label: () => string;
	description: () => string;
}

/** How each architecture layer is presented: icon, label and one-line description. */
export const LAYER_META: Record<BlueprintLayer, LayerMeta> = {
	database: {
		icon: Database,
		label: m.layer_database,
		description: m.layer_database_description,
	},
	api: { icon: Webhook, label: m.layer_api, description: m.layer_api_description },
	domain: { icon: Boxes, label: m.layer_domain, description: m.layer_domain_description },
	ui: { icon: PanelsTopLeft, label: m.layer_ui, description: m.layer_ui_description },
	state: { icon: Workflow, label: m.layer_state, description: m.layer_state_description },
	infra: { icon: Server, label: m.layer_infra, description: m.layer_infra_description },
	testing: {
		icon: FlaskConical,
		label: m.layer_testing,
		description: m.layer_testing_description,
	},
	tooling: { icon: Wrench, label: m.layer_tooling, description: m.layer_tooling_description },
};
