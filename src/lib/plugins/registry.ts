import { derived, get } from 'svelte/store';
import type { DashboardPlugin } from './types';
import TemperatureWidget from './temperature/Widget.svelte';
import TemperatureDetail from './temperature/Detail.svelte';
import MapWidget from './map/Widget.svelte';
import MapDetail from './map/Detail.svelte';
import TravelWidget from './travel/Widget.svelte';
import TravelDetail from './travel/Detail.svelte';
import { trips } from '$lib/trip';

/** Plugins that always appear on the dashboard, one tile each. */
const staticPlugins: DashboardPlugin[] = [
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

/** Dashboard tiles: static plugins plus one "Ski Trip" tile per configured trip. */
export const plugins = derived(trips, ($trips): DashboardPlugin[] => [
	...staticPlugins,
	...$trips.map(
		(t): DashboardPlugin => ({
			id: `trip-${t.id}`,
			name: `${t.destination} Trip`,
			icon: '🎿',
			widget: TravelWidget,
			detail: TravelDetail,
			props: { tripId: t.id }
		})
	)
]);

export function getPlugin(id: string): DashboardPlugin | undefined {
	return get(plugins).find((p) => p.id === id);
}
