import type { Component } from 'svelte';

/** Contract every dashboard plugin must satisfy. */
export interface DashboardPlugin {
	id: string;
	name: string;
	icon: string;
	/** Small component shown as the dashboard tile. */
	widget: Component<any>;
	/** Full page shown when the tile is clicked. */
	detail: Component<any>;
	/** Optional props passed to both the widget and detail components (e.g. which trip to show). */
	props?: Record<string, unknown>;
}
