<script lang="ts">
	import { cn } from '$lib/utils';

	let { class: className = '', children }: { class?: string; children: import('svelte').Snippet } = $props();
</script>

<div class={cn('rounded-lg border border-[var(--border)] bg-[var(--card-bg)] shadow-sm', className)}>
	{@render children()}
</div>