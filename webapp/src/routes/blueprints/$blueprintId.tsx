import { createFileRoute } from '@tanstack/react-router';

/**
 * Bare parent route for /blueprints/$blueprintId. Without a component, the
 * router renders the matched child directly (index = detail, /edit = editor).
 * Never add a component here without an <Outlet/> — the edit page would
 * silently stop rendering (the parent would swallow it).
 */
export const Route = createFileRoute('/blueprints/$blueprintId')({});
