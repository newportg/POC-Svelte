<script lang="ts">
	import { plugins } from '$lib/plugins/registry';
	import { base } from '$app/paths';
</script>

<div class="dashboard-grid">
	{#each $plugins as plugin (plugin.id)}
		{@const Widget = plugin.widget}
		<a class="dashboard-card" href={`${base}/plugin/${plugin.id}`}>
			<div class="card-header">
				<span class="card-icon">{plugin.icon}</span>
				<span class="card-name">{plugin.name}</span>
			</div>
			<div class="card-body">
				<Widget {...plugin.props ?? {}} />
			</div>
		</a>
	{/each}
</div>

<style>
	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.25rem;
	}
	.dashboard-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border, #e2e2e2);
		border-radius: 12px;
		padding: 1rem;
		text-decoration: none;
		color: inherit;
		background: var(--card-bg, #fff);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}
	.dashboard-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}
	.card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}
	.card-icon {
		font-size: 1.25rem;
	}
	.card-body {
		flex: 1;
	}
</style>
