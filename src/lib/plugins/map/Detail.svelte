<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { location } from '$lib/location';

	let mapEl: HTMLDivElement;
	let map: LeafletMap | null = null;
	let marker: Marker | null = null;
	let unsubscribe: () => void;
	let address = $state('');
	let addressLoading = $state(false);

	async function reverseGeocode(lat: number, lon: number) {
		addressLoading = true;
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
			);
			if (res.ok) {
				const data = await res.json();
				address = data.display_name ?? '';
			}
		} catch {
			address = '';
		} finally {
			addressLoading = false;
		}
	}

	onMount(async () => {
		const L = (await import('leaflet')).default;
		const start = { lat: $location.lat, lon: $location.lon };
		map = L.map(mapEl, { zoomControl: true }).setView([start.lat, start.lon], 12);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		marker = L.marker([start.lat, start.lon]).addTo(map);

		let firstFix = true;
		unsubscribe = location.subscribe((loc) => {
			if (map && marker) {
				map.setView([loc.lat, loc.lon], firstFix ? 14 : map.getZoom());
				marker.setLatLng([loc.lat, loc.lon]);
				if (firstFix) {
					firstFix = false;
					void reverseGeocode(loc.lat, loc.lon);
				}
			}
		});
	});

	onDestroy(() => {
		unsubscribe?.();
		map?.remove();
	});
</script>

<section class="map-detail">
	<header>
		<h1>Local Map</h1>
		<p class="address">
			{#if addressLoading}
				Locating…
			{:else}
				{address || `${$location.lat.toFixed(3)}, ${$location.lon.toFixed(3)}`}
			{/if}
		</p>
	</header>

	<div class="map-container" bind:this={mapEl}></div>

	<div class="scroll-panel">
		<h2>Nearby information</h2>
		<p>Coordinates: {$location.lat.toFixed(5)}, {$location.lon.toFixed(5)}</p>
		<p>
			Drag, scroll and zoom the map above to explore the area around your current location. Map
			data &copy; OpenStreetMap contributors.
		</p>
	</div>
</section>

<style>
	.map-detail {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1rem 1.5rem 0;
	}
	header {
		margin-bottom: 0.75rem;
	}
	.address {
		color: var(--muted, #666);
		margin: 0;
	}
	.map-container {
		flex: 1;
		min-height: 400px;
		border-radius: 8px;
		overflow: hidden;
	}
	.scroll-panel {
		max-height: 30vh;
		overflow-y: auto;
		padding: 1rem 0 2rem;
	}
</style>
