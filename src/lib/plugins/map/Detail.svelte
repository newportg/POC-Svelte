<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type LType from 'leaflet';
	import type { Map as LeafletMap, Marker, LayerGroup } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { location } from '$lib/location';
	import { trips } from '$lib/trip';
	import type { TripConfig } from '$lib/config';
	import { getCountryFlagUrl } from '$lib/countryFlags';
	import { base } from '$app/paths';

	let mapEl: HTMLDivElement;
	let map: LeafletMap | null = null;
	let marker: Marker | null = null;
	let tripLayer: LayerGroup | null = null;
	let leafletModule: typeof LType | null = null;
	let unsubscribe: () => void;
	let address = $state('');
	let addressLoading = $state(false);

	function escapeHtml(value: string): string {
		return value.replace(
			/[&<>"']/g,
			(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c
		);
	}

	function renderTripMarkers() {
		if (!leafletModule || !tripLayer) return;
		tripLayer.clearLayers();
		for (const t of $trips) {
			const flagUrl = getCountryFlagUrl(t.country);
			const icon = flagUrl
				? leafletModule.icon({
						iconUrl: flagUrl,
						iconSize: [32, 21],
						iconAnchor: [16, 21],
						className: 'trip-flag-img'
					})
				: leafletModule.divIcon({
						html: `<span class="trip-flag">📍</span>`,
						className: 'trip-flag-icon',
						iconSize: [28, 28],
						iconAnchor: [14, 28]
					});
			leafletModule
				.marker([t.lat, t.lon], { icon })
				.bindPopup(
					`<strong>${escapeHtml(t.destination)}</strong><br/><a href="${base}/plugin/trip-${encodeURIComponent(t.id)}">View trip details</a>`
				)
				.addTo(tripLayer);
		}
	}

	function zoomToTrip(t: TripConfig) {
		map?.flyTo([t.lat, t.lon], 13);
	}

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
		leafletModule = L;
		const start = { lat: $location.lat, lon: $location.lon };
		map = L.map(mapEl, { zoomControl: true }).setView([start.lat, start.lon], 12);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		marker = L.marker([start.lat, start.lon]).addTo(map);
		tripLayer = L.layerGroup().addTo(map);
		renderTripMarkers();

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

	$effect(() => {
		$trips;
		renderTripMarkers();
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

	{#if $trips.length > 0}
		<div class="zoom-links">
			<span class="zoom-label">Zoom to:</span>
			<button type="button" onclick={() => map?.flyTo([$location.lat, $location.lon], 14)}>
				📍 {$location.name}
			</button>
			{#each $trips as t (t.id)}
				<button type="button" onclick={() => zoomToTrip(t)}>{t.destination}</button>
			{/each}
		</div>
	{/if}

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
	.zoom-links {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
	.zoom-label {
		font-size: 0.85rem;
		color: var(--muted, #666);
	}
	.zoom-links button {
		padding: 0.3rem 0.75rem;
		font-size: 0.85rem;
		border: 1px solid var(--border, #ccc);
		border-radius: 999px;
		background: var(--card-bg, #fff);
		color: inherit;
		cursor: pointer;
	}
	.zoom-links button:hover {
		background: var(--accent, #3b82f6);
		color: #fff;
	}
	.scroll-panel {
		max-height: 30vh;
		overflow-y: auto;
		padding: 1rem 0 2rem;
	}
	:global(.trip-flag-icon) {
		background: none;
		border: none;
	}
	:global(.trip-flag) {
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
	}
	:global(.trip-flag-img) {
		border-radius: 2px;
		box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
		cursor: pointer;
	}
</style>
