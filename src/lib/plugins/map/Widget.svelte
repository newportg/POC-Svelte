<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { location } from '$lib/location';

	let mapEl: HTMLDivElement;
	let map: LeafletMap | null = null;
	let marker: Marker | null = null;
	let unsubscribe: () => void;

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const start = { lat: $location.lat, lon: $location.lon };
		map = L.map(mapEl, {
			zoomControl: false,
			dragging: false,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			touchZoom: false,
			boxZoom: false,
			keyboard: false,
			attributionControl: false
		}).setView([start.lat, start.lon], 12);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19
		}).addTo(map);

		marker = L.marker([start.lat, start.lon]).addTo(map);

		unsubscribe = location.subscribe((loc) => {
			if (map && marker) {
				map.setView([loc.lat, loc.lon], 13);
				marker.setLatLng([loc.lat, loc.lon]);
			}
		});
	});

	onDestroy(() => {
		unsubscribe?.();
		map?.remove();
	});
</script>

<div class="map-widget" bind:this={mapEl} aria-hidden="true"></div>

<style>
	.map-widget {
		width: 100%;
		height: 100%;
		min-height: 120px;
		border-radius: 8px;
		pointer-events: none;
	}
</style>
