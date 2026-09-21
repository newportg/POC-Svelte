<script lang="ts">
	import { location, setLocation } from '$lib/location';
	import { theme, setTheme, type ThemeName } from '$lib/theme';

	let name = $state($location.name);
	let lat = $state($location.lat);
	let lon = $state($location.lon);
	let saved = $state(false);

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		setLocation({ name, lat: Number(lat), lon: Number(lon) });
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	function handleThemeChange(e: Event) {
		setTheme((e.target as HTMLSelectElement).value as ThemeName);
	}
</script>

<div class="settings-page">
	<a class="back-link" href="/">← Back to dashboard</a>
	<h1>Settings</h1>

	<section>
		<h2>Theme</h2>
		<label>
			Appearance
			<select value={$theme} onchange={handleThemeChange}>
				<option value="system">Match system</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</label>
	</section>

	<section>
		<h2>Location</h2>
		<form onsubmit={handleSave}>
			<label>
				Location name
				<input type="text" bind:value={name} placeholder="e.g. Woking, UK" required />
			</label>
			<label>
				Latitude
				<input type="number" step="any" bind:value={lat} required />
			</label>
			<label>
				Longitude
				<input type="number" step="any" bind:value={lon} required />
			</label>
			<button type="submit">Save</button>
			{#if saved}
				<span class="saved">Saved</span>
			{/if}
		</form>
	</section>
</div>

<style>
	.settings-page {
		max-width: 420px;
		margin: 0 auto;
		padding: 1.5rem;
	}
	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		color: inherit;
		text-decoration: none;
	}
	.back-link:hover {
		text-decoration: underline;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	section {
		margin-bottom: 2rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.9rem;
	}
	input,
	select {
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid var(--border, #ccc);
		border-radius: 6px;
		background: var(--card-bg, #fff);
		color: inherit;
	}
	button {
		align-self: flex-start;
		padding: 0.5rem 1.25rem;
	}
	.saved {
		color: var(--success, #2e7d32);
		font-size: 0.9rem;
	}
</style>
