<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Map as LeafletMap, Marker } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { trips } from '$lib/trip';
	import { fetchTripWeather, type TripWeather } from './weather';
	import GpxActivity from './GpxActivity.svelte';

	let { tripId }: { tripId: string } = $props();
	let trip = $derived($trips.find((t) => t.id === tripId));

	let mapEl: HTMLDivElement = $state()!;
	let map: LeafletMap | null = null;
	let marker: Marker | null = null;

	let weather = $state<TripWeather | null>(null);
	let weatherLoading = $state(false);
	let weatherError = $state<string | null>(null);

	async function loadWeather() {
		if (!trip) return;
		weatherLoading = true;
		weatherError = null;
		try {
			weather = await fetchTripWeather(trip.lat, trip.lon, trip.checkIn, trip.checkOut);
		} catch (e) {
			weatherError = e instanceof Error ? e.message : 'Failed to load weather';
		} finally {
			weatherLoading = false;
		}
	}

	$effect(() => {
		tripId;
		void loadWeather();
	});

	onMount(async () => {
		if (!trip) return;
		const L = (await import('leaflet')).default;
		map = L.map(mapEl, { zoomControl: true }).setView([trip.lat, trip.lon], 13);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		marker = L.marker([trip.lat, trip.lon])
			.addTo(map)
			.bindPopup(`${trip.destination} ski area`);
	});

	onDestroy(() => {
		map?.remove();
	});

	function formatDate(dateStr: string): string {
		if (!dateStr) return 'TBD';
		const d = new Date(dateStr);
		return isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
	}

	function formatShortDate(dateStr: string): string {
		const d = new Date(dateStr);
		return isNaN(d.getTime())
			? dateStr
			: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
	}
</script>

{#if trip}
	<section class="travel-detail">
		<header>
			<h1>🎿 {trip.destination}, {trip.country}</h1>
		</header>

		<div class="section">
			<h2>Ski map</h2>
			<div class="map-container" bind:this={mapEl}></div>
			<p class="hint">
				For full piste maps and lift status, see
				<a href="https://www.dolomitisuperski.com" target="_blank" rel="noopener noreferrer"
					>Dolomiti Superski</a
				>.
			</p>
		</div>

		<div class="section">
			<h2>Hotel</h2>
			<dl class="hotel-details">
				<div>
					<dt>Name</dt>
					<dd>{trip.hotelName}</dd>
				</div>
				<div>
					<dt>Location</dt>
					<dd>{trip.hotelLocation}</dd>
				</div>
				<div>
					<dt>Check-in</dt>
					<dd>{formatDate(trip.checkIn)}</dd>
				</div>
				<div>
					<dt>Check-out</dt>
					<dd>{formatDate(trip.checkOut)}</dd>
				</div>
			</dl>
		</div>

		<div class="section">
			<h2>{weather?.historical ? 'Weather during your trip' : 'Weather forecast & snow'}</h2>
			{#if weatherLoading}
				<p class="hint">Loading weather…</p>
			{:else if weatherError}
				<p class="hint">{weatherError}</p>
			{:else if weather && weather.days.length > 0}
				<p class="snow-total">❄️ Total snowfall: {weather.totalSnowCm.toFixed(1)} cm</p>
				<div class="weather-days">
					{#each weather.days as d (d.date)}
						<div class="weather-day">
							<span class="day-date">{formatShortDate(d.date)}</span>
							<span class="day-temp">
								{d.tempMin !== null ? Math.round(d.tempMin) : '–'}° / {d.tempMax !== null
									? Math.round(d.tempMax)
									: '–'}°
							</span>
							<span class="day-snow">{d.snowfallCm !== null ? `${d.snowfallCm.toFixed(1)}cm` : '–'}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="hint">No weather data available for these dates yet.</p>
			{/if}
		</div>

		{#if trip.photoAlbumUrl}
			<div class="section">
				<h2>Photos</h2>
				<a
					class="photos-link"
					href={trip.photoAlbumUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					📷 View photo album ↗
				</a>
			</div>
		{/if}

		{#if trip.gpxFiles && trip.gpxFiles.length > 0}
			<div class="section">
				<h2>Strava activities</h2>
				<div class="activities-list">
					{#each trip.gpxFiles as file (file)}
						<GpxActivity path={file} />
					{/each}
				</div>
			</div>
		{/if}
	</section>
{:else}
	<p>Trip not found.</p>
{/if}

<style>
	.travel-detail {
		max-width: 720px;
		margin: 0 auto;
		padding: 1.5rem;
	}
	.section {
		margin-bottom: 2rem;
	}
	.map-container {
		height: 320px;
		border-radius: 8px;
		overflow: hidden;
	}
	.hint {
		font-size: 0.85rem;
		color: var(--muted, #666);
		margin-top: 0.5rem;
	}
	.hotel-details {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	.hotel-details dt {
		font-size: 0.85rem;
		color: var(--muted, #666);
	}
	.hotel-details dd {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
	}
	.photos-link {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		background: var(--accent, #3b82f6);
		color: #fff;
		text-decoration: none;
		font-weight: 600;
	}
	.activities-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.snow-total {
		font-weight: 600;
		margin: 0 0 0.75rem;
	}
	.weather-days {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.weather-day {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 1rem;
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border, #e2e2e2);
		border-radius: 6px;
		font-size: 0.9rem;
	}
	.day-date {
		color: var(--muted, #666);
	}
	.day-snow {
		font-weight: 600;
	}
</style>
