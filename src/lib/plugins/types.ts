import type { Component } from 'svelte';

/** Contract every dashboard plugin must satisfy. */
export interface DashboardPlugin {
	id: string;
	name: string;
	icon: string;
	/** Small component shown as the dashboard tile. */
	widget: Component;
	/** Full page shown when the tile is clicked. */
	detail: Component;
}
