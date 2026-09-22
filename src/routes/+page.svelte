<script lang="ts">
	import Dashboard from '$lib/components/Dashboard.svelte';
	import { base } from '$app/paths';
	import { Settings2 } from '@lucide/svelte';
</script>

<main class="mx-auto max-w-5xl px-5 py-6">
	<div class="mb-6 flex items-center justify-between gap-4">
		<div>
			<p class="mb-1 text-sm font-medium uppercase tracking-[0.18em] text-[var(--accent)]">Personal dashboard</p>
			<h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
		</div>
		<a class="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm font-medium no-underline transition-colors hover:bg-black/5 dark:hover:bg-white/10" href={`${base}/settings`}>
			<Settings2 size={16} />
			Settings
		</a>
	</div>
	<Dashboard />
</main>
