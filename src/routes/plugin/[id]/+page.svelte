<script lang="ts">
	import { page } from '$app/stores';
	import { plugins } from '$lib/plugins/registry';
	import { base } from '$app/paths';

	let plugin = $derived($plugins.find((p) => p.id === ($page.params.id ?? '')));
</script>

<div class="flex min-h-full flex-col">
	<a class="inline-flex items-center px-5 pt-3 text-xs font-medium no-underline hover:underline" href={base || '/'}>← Back to dashboard</a>

	{#if plugin}
		{@const Detail = plugin.detail}
		<Detail {...plugin.props ?? {}} />
	{:else}
		<p>Plugin "{$page.params.id}" not found.</p>
	{/if}
</div>
