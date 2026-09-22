<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } = $props();
</script>

<span class={cn('inline-flex items-center rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[0.7rem] font-medium text-[var(--muted)]', className)}>
	{@render children()}
</span>