<script lang="ts">
	import { trips } from '$lib/trip';

	let { tripId }: { tripId: string } = $props();
	let trip = $derived($trips.find((t) => t.id === tripId));

	function daysUntil(dateStr: string): number | null {
		if (!dateStr) return null;
		const target = new Date(dateStr);
		if (isNaN(target.getTime())) return null;
		const diff = target.getTime() - Date.now();
		return Math.ceil(diff / (1000 * 60 * 60 * 24));
	}

	function tripYear(dateStr: string): number | null {
		if (!dateStr) return null;
		const date = new Date(dateStr);
		return isNaN(date.getTime()) ? null : date.getFullYear();
	}

	let days = $derived(trip ? daysUntil(trip.checkIn) : null);
	let year = $derived(trip ? tripYear(trip.checkIn) : null);
</script>

{#if trip}
	<div class="travel-widget">
		<span class="icon">🎿</span>
		<span class="destination">{trip.destination}</span>
		{#if year !== null}
			<span class="year">{year}</span>
		{/if}
		{#if days !== null && days >= 0}
			<span class="countdown">{days === 0 ? 'Today!' : `${days} days`}</span>
		{/if}
	</div>
{/if}

<style>
	.travel-widget {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		height: 100%;
		min-height: 90px;
	}
	.icon {
		font-size: 2.25rem;
		line-height: 1;
	}
	.destination {
		font-weight: 600;
		font-size: 1.1rem;
	}
	.year {
		font-size: 0.85rem;
		color: var(--muted, #888);
	}
	.countdown {
		font-size: 0.85rem;
		color: var(--muted, #888);
	}
</style>
