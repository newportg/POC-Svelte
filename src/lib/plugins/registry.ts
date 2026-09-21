import type { DashboardPlugin } from './types';
import TemperatureWidget from './temperature/Widget.svelte';
import TemperatureDetail from './temperature/Detail.svelte';
import MapWidget from './map/Widget.svelte';
import MapDetail from './map/Detail.svelte';

/** Add new plugins here to have them appear on the dashboard. */
export const plugins: DashboardPlugin[] = [
	{
		id: 'temperature',
		name: 'Local Weather',
		icon: '🌡️',
		widget: TemperatureWidget,
		detail: TemperatureDetail
	},
	{
		id: 'map',
		name: 'Local Map',
		icon: '🗺️',
		widget: MapWidget,
		detail: MapDetail
	}
];

export function getPlugin(id: string): DashboardPlugin | undefined {
	return plugins.find((p) => p.id === id);
}
