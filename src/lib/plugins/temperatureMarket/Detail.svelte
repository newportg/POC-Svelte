<script lang="ts">
	import { onMount } from 'svelte';
	import {
		addDays,
		fetchLondonForecast,
		fetchPublishedTemperatureResult,
		getPrediction,
		getPredictions,
		londonDateParts,
		predictionMatchesResult,
		savePrediction,
		type PublishedTemperatureResult,
		type TemperaturePrediction
	} from './marketStore';

	let marketDate = $state('');
	let prediction = $state<TemperaturePrediction | undefined>();
	let forecast = $state<number | null>(null);
	let predictionInput = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saved = $state(false);
	let closed = $state(false);
	let history = $state<TemperaturePrediction[]>([]);
	let results = $state<Record<string, PublishedTemperatureResult | null>>({});

	function refreshState() {
		const londonNow = londonDateParts();
		marketDate = londonNow.hour < 16 ? londonNow.date : addDays(londonNow.date, 1);
		closed = false;
		prediction = getPrediction(marketDate);
		if (prediction) predictionInput = String(prediction.predictionC);
		history = getPredictions();
	}

	onMount(async () => {
		refreshState();
		try {
			forecast = await fetchLondonForecast(marketDate);
			if (!prediction) predictionInput = forecast.toFixed(1);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'NOAA observations unavailable';
		} finally {
			loading = false;
		}

		for (const savedPrediction of history) {
			if (savedPrediction.marketDate >= marketDate) continue;
			try {
				results[savedPrediction.marketDate] = await fetchPublishedTemperatureResult(savedPrediction.marketDate);
			} catch {
				results[savedPrediction.marketDate] = null;
			}
		}
	});

	function save() {
		const value = Number(predictionInput);
		if (!Number.isFinite(value) || value < -50 || value > 60 || closed) return;
		saving = true;
		savePrediction({ marketDate, predictionC: Math.round(value), savedAt: new Date().toISOString() });
		prediction = getPrediction(marketDate);
		history = getPredictions();
		saved = true;
		saving = false;
		setTimeout(() => (saved = false), 2000);
	}
</script>

<section class="market-detail">
	<header>
		<h1>🌡️ London high-temperature market</h1>
		<p>Paper-trade simulation for {marketDate || 'tomorrow'}.</p>
	</header>

	<div class="rules">
		<h2>Market rules</h2>
		<ul>
			<li>Target: London's daily maximum temperature.</li>
			<li>Source: NOAA observations from London City Airport station EGLC.</li>
			<li>Unit: whole degrees Celsius, matching the market resolution.</li>
			<li>Close: 16:00 Europe/London each day.</li>
			<li>Predictions are saved locally and cannot be changed after close.</li>
		</ul>
	</div>

	<div class="prediction-panel">
		<div>
			<span class="label">Prediction for {marketDate || 'tomorrow'}</span>
			{#if loading}
				<p class="status">Loading London forecast...</p>
			{:else if error}
				<p class="status error">{error}</p>
			{:else}
				<p class="forecast">NOAA EGLC estimate: {forecast?.toFixed(1)}°C</p>
			{/if}
		</div>

		<label>
			Your prediction (°C)
			<input type="number" min="-50" max="60" step="1" bind:value={predictionInput} disabled={closed || saving} />
		</label>
		<button type="button" onclick={save} disabled={closed || loading || saving || !predictionInput}>
			{closed ? 'Market closed' : prediction ? 'Update prediction' : 'Save prediction'}
		</button>
		{#if saved}<span class="success">Prediction saved</span>{/if}
	</div>

	{#if prediction}
		<p class="saved-detail">Saved prediction: <strong>{prediction.predictionC}°C</strong> at {new Date(prediction.savedAt).toLocaleString()}</p>
	{/if}

	{#if history.length > 0}
		<section class="history">
			<h2>Prediction results</h2>
			{#each history as savedPrediction (savedPrediction.marketDate)}
				{@const result = results[savedPrediction.marketDate]}
				<div class="result-row">
					<span>{savedPrediction.marketDate}</span>
					<span>Guess {savedPrediction.predictionC}°C</span>
					{#if result === null || result === undefined}
						<strong class="pending">Pending</strong>
					{:else if predictionMatchesResult(savedPrediction.predictionC, result)}
						<strong class="correct">Correct</strong>
					{:else}
						<strong class="incorrect">Incorrect</strong>
					{/if}
					{#if result !== null && result !== undefined}<span>Published {result.label}</span>{/if}
				</div>
			{/each}
		</section>
	{/if}
</section>

<style>
	.market-detail {
		max-width: 720px;
		margin: 0 auto;
		padding: 1.5rem;
	}
	header { margin-bottom: 1.25rem; }
	h1 { margin: 0 0 0.4rem; }
	p { margin: 0; color: var(--muted, #666); }
	.rules, .prediction-panel {
		padding: 1rem;
		border: 1px solid var(--border, #ddd);
		border-radius: 8px;
		background: var(--card-bg, #fff);
	}
	.rules { margin-bottom: 1rem; }
	h2 { margin: 0 0 0.5rem; font-size: 1.05rem; }
	.rules ul { margin: 0; padding-left: 1.2rem; color: var(--muted, #666); }
	.prediction-panel { display: grid; gap: 1rem; }
	.label, label { display: grid; gap: 0.35rem; font-weight: 600; }
	.label { font-size: 0.85rem; color: var(--muted, #666); }
	.forecast { margin-top: 0.35rem; font-size: 1.35rem; font-weight: 700; color: var(--text); }
	input { width: 100%; box-sizing: border-box; padding: 0.65rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); color: var(--text); }
	button { width: fit-content; padding: 0.65rem 0.9rem; border: 0; border-radius: 6px; background: var(--accent); color: white; cursor: pointer; }
	button:disabled { cursor: not-allowed; opacity: 0.55; }
	.status, .saved-detail { margin-top: 0.5rem; }
	.error { color: var(--error, #c0392b); }
	.success { color: var(--success, #2e7d32); font-size: 0.85rem; }
	.saved-detail { padding-top: 1rem; }
	.history { margin-top: 1.5rem; }
	.result-row { display: grid; grid-template-columns: 1fr auto auto auto; gap: 0.75rem; align-items: center; padding: 0.7rem 0; border-bottom: 1px solid var(--border); }
	.correct { color: var(--success, #2e7d32); }
	.incorrect { color: var(--error, #c0392b); }
	.pending { color: var(--muted, #666); }
	@media (max-width: 600px) { .result-row { grid-template-columns: 1fr auto; } }
</style>
