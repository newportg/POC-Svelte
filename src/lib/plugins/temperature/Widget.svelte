<script lang="ts">
	import { onMount } from 'svelte';
	import { weather, ensureWeather } from './weatherStore';
	import { getWeatherInfo } from './weatherCodes';

	onMount(() => ensureWeather());
</script>

<div class="temp-widget">
	{#if $weather.temperature === null && $weather.loading}
		<span class="status">Loading…</span>
	{:else if $weather.temperature === null && $weather.error}
		<span class="status error">Unavailable</span>
	{:else}
		<span class="icon">{getWeatherInfo($weather.weatherCode).icon}</span>
		<span class="temp">{Math.round($weather.temperature ?? 0)}°C</span>
	{/if}
</div>

<style>
	.temp-widget {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: 100%;
		min-height: 90px;
		font-size: 2rem;
	}
	.icon {
		font-size: 2.25rem;
		line-height: 1;
	}
	.temp {
		font-weight: 600;
	}
	.status {
		font-size: 1rem;
		color: var(--muted, #888);
	}
	.status.error {
		color: var(--error, #c0392b);
	}
</style>
