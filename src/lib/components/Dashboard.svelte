<script lang="ts">
	import { plugins } from '$lib/plugins/registry';
	import { base } from '$app/paths';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
	{#each $plugins as plugin (plugin.id)}
		{@const Widget = plugin.widget}
		<a class="block text-inherit no-underline transition-transform hover:-translate-y-0.5" href={`${base}/plugin/${plugin.id}`}>
				<Card class="h-full p-3 transition-shadow hover:shadow-lg">
			<div class="mb-1.5 flex items-center gap-2 text-sm font-semibold">
				<span class="text-xl" aria-hidden="true">{plugin.icon}</span>
				<span>{plugin.name}</span>
			</div>
			<div class="flex-1">
				<Widget {...plugin.props ?? {}} />
			</div>
				<Badge class="mt-2">Open details</Badge>
				</Card>
		</a>
	{/each}
</div>
