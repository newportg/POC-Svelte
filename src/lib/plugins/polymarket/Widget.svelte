<script lang="ts">
	import { polymarketCategories } from './categories';
</script>

<div class="polymarket-widget">
	<span class="icon" aria-hidden="true">🎲</span>
	<strong>{polymarketCategories.length} categories</strong>
	<span class="hint">Polymarket events</span>
</div>

<style>
	.polymarket-widget {
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
		font-size: 0.85rem;
		color: var(--muted, #888);
	}
</style>
