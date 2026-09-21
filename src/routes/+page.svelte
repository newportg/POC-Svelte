<script lang="ts">
	import Dashboard from '$lib/components/Dashboard.svelte';
</script>

<main>
	<div class="header-row">
		<h1>Dashboard</h1>
		<a class="settings-link" href="/settings">⚙ Settings</a>
	</div>
	<Dashboard />
</main>

<style>
	main {
		max-width: 900px;
		margin: 0 auto;
		padding: 1.5rem;
	}
	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.settings-link {
		color: inherit;
		text-decoration: none;
	}
	.settings-link:hover {
		text-decoration: underline;
	}
</style>
