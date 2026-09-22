<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map as LeafletMap } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { base } from '$app/paths';
	import { parseGpx, type GpxStats } from '$lib/gpx';

	let { path, label }: { path: string; label?: string } = $props();

	let mapEl: HTMLDivElement = $state()!;
	let map: LeafletMap | null = null;
	let stats = $state<GpxStats | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	function formatDuration(seconds: number | null): string {
		if (seconds === null) return '–';
		const h = Math.floor(seconds / 3600);
		const m = Math.round((seconds % 3600) / 60);
		return h > 0 ? `${h}h ${m}m` : `${m}m`;
	}

	/** Builds a simple distance-vs-elevation SVG path for the elevation profile. */
	function elevationPath(s: GpxStats, width = 300, height = 60): string {
		const withEle = s.points.filter((p) => p.ele !== null);
		if (withEle.length < 2) return '';
		const eles = withEle.map((p) => p.ele as number);
		const min = Math.min(...eles);
		const range = Math.max(...eles) - min || 1;
		return withEle
			.map((p, i) => {
				const x = (i / (withEle.length - 1)) * width;
				const y = height - (((p.ele as number) - min) / range) * height;
				return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	onMount(async () => {
		try {
			const res = await fetch(`${base}${path}`);
			if (!res.ok) throw new Error(`Couldn't load GPX file (${res.status})`);
			const text = await res.text();
			stats = parseGpx(text);

			const L = (await import('leaflet')).default;
			map = L.map(mapEl, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false });
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

			const latlngs: [number, number][] = stats.points.map((p) => [p.lat, p.lon]);
			if (latlngs.length > 1) {
				const line = L.polyline(latlngs, { color: '#e03131', weight: 3 }).addTo(map);
				map.fitBounds(line.getBounds(), { padding: [10, 10] });
			} else if (latlngs.length === 1) {
				map.setView(latlngs[0], 14);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load activity';
		} finally {
			loading = false;
		}
	});

	onDestroy(() => {
		map?.remove();
	});
</script>

<div class="gpx-activity">
	<div class="gpx-map" bind:this={mapEl}></div>

	{#if loading}
		<p class="hint">Loading activity…</p>
	{:else if error}
		<p class="hint">{error}</p>
	{:else if stats}
		<div class="gpx-header">
			<strong>{stats.name ?? label ?? 'Activity'}</strong>
			{#if stats.startTime}
				<span class="gpx-date">{stats.startTime.toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
			{/if}
		</div>
		<div class="gpx-stats">
			<span>{stats.distanceKm.toFixed(1)} km</span>
			<span>⬆️ {Math.round(stats.elevationGainM)} m</span>
			<span>⬇️ {Math.round(stats.elevationLossM)} m</span>
			<span>{formatDuration(stats.durationSeconds)}</span>
			{#if stats.avgSpeedKmh}
				<span>{stats.avgSpeedKmh.toFixed(1)} km/h avg</span>
			{/if}
		</div>
		{#if elevationPath(stats)}
			<svg class="elevation-chart" viewBox="0 0 300 60" preserveAspectRatio="none">
				<path d={elevationPath(stats)} fill="none" stroke="var(--accent, #3b82f6)" stroke-width="2" />
			</svg>
		{/if}
	{/if}
</div>

<style>
	.gpx-activity {
		border: 1px solid var(--border, #e2e2e2);
		border-radius: 8px;
		padding: 0.75rem;
	}
	.gpx-map {
		height: 160px;
		border-radius: 6px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}
	.gpx-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.35rem;
	}
	.gpx-date {
		font-size: 0.8rem;
		color: var(--muted, #666);
	}
	.gpx-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		font-size: 0.85rem;
	}
	.elevation-chart {
		width: 100%;
		height: 40px;
		margin-top: 0.5rem;
	}
	.hint {
		font-size: 0.85rem;
		color: var(--muted, #666);
	}
</style>
