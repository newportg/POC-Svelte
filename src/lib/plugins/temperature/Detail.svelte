<script lang="ts">
	import { onMount } from 'svelte';
	import { weather, ensureWeather, refreshWeather } from './weatherStore';
	import { getWeatherInfo } from './weatherCodes';
	import { location } from '$lib/location';

	onMount(() => ensureWeather());

	let refreshing = $state(false);
	async function handleRefresh() {
		refreshing = true;
		await refreshWeather();
		refreshing = false;
	}
</script>

<section class="weather-detail">
	<header>
		<h1>Local Weather</h1>
		<button onclick={handleRefresh} disabled={refreshing}>
			{refreshing ? 'Refreshing…' : 'Refresh'}
		</button>
	</header>

	{#if $weather.error && $weather.temperature === null}
		<p class="error">Couldn't load weather: {$weather.error}</p>
	{:else}
		<div class="hero">
			<span class="icon">{getWeatherInfo($weather.weatherCode).icon}</span>
			<span class="temp">{Math.round($weather.temperature ?? 0)}°C</span>
			<span class="label">{getWeatherInfo($weather.weatherCode).label}</span>
		</div>

		<dl class="stats">
			<div>
				<dt>Feels like</dt>
				<dd>{$weather.apparentTemperature !== null ? `${Math.round($weather.apparentTemperature)}°C` : '–'}</dd>
			</div>
			<div>
				<dt>Humidity</dt>
				<dd>{$weather.humidity !== null ? `${$weather.humidity}%` : '–'}</dd>
			</div>
			<div>
				<dt>Wind speed</dt>
				<dd>{$weather.windSpeed !== null ? `${$weather.windSpeed} km/h` : '–'}</dd>
			</div>
			<div>
				<dt>Location</dt>
				<dd>{$location.lat.toFixed(3)}, {$location.lon.toFixed(3)}</dd>
			</div>
		</dl>

		{#if $weather.updatedAt}
			<p class="updated">Last updated {$weather.updatedAt.toLocaleTimeString()}</p>
		{/if}
	{/if}
</section>

<style>
	.weather-detail {
		max-width: 640px;
		margin: 0 auto;
		padding: 1.5rem;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		margin: 2rem 0;
	}
	.hero .icon {
		font-size: 4rem;
	}
	.hero .temp {
		font-size: 3rem;
		font-weight: 700;
	}
	.hero .label {
		color: var(--muted, #666);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	.stats dt {
		font-size: 0.85rem;
		color: var(--muted, #666);
	}
	.stats dd {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}
	.updated {
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: var(--muted, #888);
	}
	.error {
		color: var(--error, #c0392b);
	}
</style>
