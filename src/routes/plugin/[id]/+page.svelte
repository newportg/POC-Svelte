<script lang="ts">
	import { page } from '$app/stores';
	import { getPlugin } from '$lib/plugins/registry';

	let plugin = $derived(getPlugin($page.params.id ?? ''));
</script>

<div class="plugin-page">
	<a class="back-link" href="/">← Back to dashboard</a>

	{#if plugin}
		{@const Detail = plugin.detail}
		<Detail />
	{:else}
		<p>Plugin "{$page.params.id}" not found.</p>
	{/if}
</div>

<style>
	.plugin-page {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.back-link {
		display: inline-block;
		padding: 0.75rem 1.5rem 0;
		color: inherit;
		text-decoration: none;
	}
	.back-link:hover {
		text-decoration: underline;
	}
</style>
