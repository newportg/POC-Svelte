<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } = $props();
</script>

<span class={cn('inline-flex items-center rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]', className)}>
	{@render children()}
</span>