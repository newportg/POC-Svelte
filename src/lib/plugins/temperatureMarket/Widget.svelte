<script lang="ts">
	import { onMount } from 'svelte';
	import { addDays, getPrediction, londonDateParts } from './marketStore';

	let prediction = $state<number | null>(null);
	let marketDate = $state('');

	onMount(() => {
		marketDate = addDays(londonDateParts().date, 1);
		prediction = getPrediction(marketDate)?.predictionC ?? null;
	});
</script>

<div class="market-widget">
	<span class="icon" aria-hidden="true">🌡️</span>
	{#if prediction !== null}
		<strong>{prediction.toFixed(1)}°C</strong>
		<span class="hint">London prediction saved</span>
	{:else}
		<strong>London high</strong>
		<span class="hint">Make today's prediction</span>
	{/if}
</div>

<style>
	.market-widget {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-height: 90px;
		text-align: center;
	}
	.icon {
		font-size: 2.25rem;
		line-height: 1;
	}
	.hint {
		font-size: 0.8rem;
		color: var(--muted, #888);
	}
</style>
