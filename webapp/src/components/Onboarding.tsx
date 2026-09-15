import { Link } from '@tanstack/react-router';
import { CheckCircle2, Circle, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUserBlueprints } from '../hooks/useUsers.js';
import { authClient } from '../lib/auth-client.js';
import * as m from '../paraglide/messages.js';

const WELCOME_DISMISS_KEY = (userId: string) => `onboarding_welcome_dismissed_${userId}`;
const CHECKLIST_DISMISS_KEY = 'onboarding_checklist_dismissed';
const BLUEPRINT_VIEWED_KEY = 'onboarding_blueprint_viewed';
const NEW_USER_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** Marks a blueprint as viewed — call from the blueprint detail page. */
export function markBlueprintViewed(): void {
	localStorage.setItem(BLUEPRINT_VIEWED_KEY, '1');
}

/** Welcome banner shown to recently-created accounts. Dismissible. */
export function WelcomeBanner() {
	const { data: session } = authClient.useSession();
	const [dismissed, setDismissed] = useState(true);
	const [isNew, setIsNew] = useState(false);

	const userId = session?.user?.id;
	const createdAt = session?.user?.createdAt as string | undefined;

	useEffect(() => {
		if (!userId) return;
		setDismissed(localStorage.getItem(WELCOME_DISMISS_KEY(userId)) === '1');
		const created = createdAt ? new Date(createdAt).getTime() : Number.NaN;
		setIsNew(!Number.isNaN(created) && Date.now() - created < NEW_USER_WINDOW_MS);
	}, [userId, createdAt]);

	if (!userId || dismissed || !isNew) return null;

	return (
		<div className="relative rounded-xl bg-surface-container-low p-5 pr-10">
			<div className="flex items-start gap-3">
				<Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
				<div className="space-y-1">
					<p className="font-semibold text-on-surface">{m.onboarding_welcome_title()}</p>
					<p className="text-sm text-on-surface-variant">{m.onboarding_welcome_description()}</p>
				</div>
			</div>
			<button
				type="button"
				aria-label={m.onboarding_checklist_dismiss()}
				onClick={() => {
					localStorage.setItem(WELCOME_DISMISS_KEY(userId), '1');
					setDismissed(true);
				}}
				className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}

interface ChecklistStep {
	label: string;
	done: boolean;
	to?: string;
}

/** 3-step getting-started checklist. Hidden when dismissed or fully completed. */
export function OnboardingChecklist() {
	const { data: session } = authClient.useSession();
	const [dismissed, setDismissed] = useState(false);
	const [viewed, setViewed] = useState(true);

	const userId = session?.user?.id;
	const { data: myBlueprints } = useUserBlueprints(userId ?? '');

	useEffect(() => {
		setDismissed(localStorage.getItem(CHECKLIST_DISMISS_KEY) === '1');
		setViewed(localStorage.getItem(BLUEPRINT_VIEWED_KEY) === '1');
	}, []);

	if (dismissed || !userId) return null;

	const steps: ChecklistStep[] = [
		{ label: m.onboarding_step_signin(), done: true },
		{ label: m.onboarding_step_view(), done: viewed, to: '/' },
		{ label: m.onboarding_step_publish(), done: !!myBlueprints?.items?.length },
	];

	if (steps.every((step) => step.done)) return null;

	return (
		<div className="relative rounded-xl border border-outline-variant p-5 pr-10">
			<div className="space-y-1">
				<p className="font-semibold text-on-surface">{m.onboarding_checklist_title()}</p>
				<ul className="mt-2 space-y-1.5">
					{steps.map((step) => (
						<li key={step.label} className="flex items-center gap-2 text-sm">
							{step.done ? (
								<CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
							) : (
								<Circle className="h-4 w-4 shrink-0 text-outline-variant" />
							)}
							{step.done || !step.to ? (
								<span
									className={step.done ? 'text-on-surface-variant line-through' : 'text-on-surface'}
								>
									{step.label}
								</span>
							) : (
								<Link to={step.to} className="text-primary hover:underline">
									{step.label}
								</Link>
							)}
						</li>
					))}
				</ul>
			</div>
			<button
				type="button"
				aria-label={m.onboarding_checklist_dismiss()}
				onClick={() => {
					localStorage.setItem(CHECKLIST_DISMISS_KEY, '1');
					setDismissed(true);
				}}
				className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}
