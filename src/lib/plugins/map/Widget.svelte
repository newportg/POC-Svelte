<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { location } from '$lib/location';
	import { trips } from '$lib/trip';
	import { getCountryFlagUrl } from '$lib/countryFlags';

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

		for (const t of $trips) {
			const flagUrl = getCountryFlagUrl(t.country);
			const icon = flagUrl
				? L.icon({ iconUrl: flagUrl, iconSize: [22, 15], iconAnchor: [11, 15], className: 'trip-flag-img' })
				: L.divIcon({
						html: `<span class="trip-flag">📍</span>`,
						className: 'trip-flag-icon',
						iconSize: [20, 20],
						iconAnchor: [10, 20]
					});
			L.marker([t.lat, t.lon], { icon }).addTo(map);
		}

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
	:global(.trip-flag-icon) {
		background: none;
		border: none;
	}
	:global(.trip-flag) {
		font-size: 1.1rem;
		line-height: 1;
	}
	:global(.trip-flag-img) {
		border-radius: 2px;
		box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
	}
</style>
