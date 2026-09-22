<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		variant = 'default',
		class: className = '',
		children,
		...rest
	}: {
		variant?: 'default' | 'outline' | 'ghost' | 'destructive';
		class?: string;
		children?: import('svelte').Snippet;
	} & Record<string, unknown> = $props();

	const variants = {
		default: 'bg-[var(--accent)] text-white hover:opacity-90',
		outline: 'border border-[var(--border)] bg-transparent hover:bg-black/5 dark:hover:bg-white/10',
		ghost: 'hover:bg-black/5 dark:hover:bg-white/10',
		destructive: 'bg-[var(--error)] text-white hover:opacity-90'
	};
</script>

<button class={cn('inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50', variants[variant], className)} {...rest}>
	{@render children?.()}
</button>