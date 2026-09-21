<script lang="ts">
	import { page } from '$app/stores';
	import { plugins } from '$lib/plugins/registry';
	import { base } from '$app/paths';

	let plugin = $derived($plugins.find((p) => p.id === ($page.params.id ?? '')));
</script>

<div class="plugin-page">
	<a class="back-link" href={base || '/'}>← Back to dashboard</a>

	{#if plugin}
		{@const Detail = plugin.detail}
		<Detail {...plugin.props ?? {}} />
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
