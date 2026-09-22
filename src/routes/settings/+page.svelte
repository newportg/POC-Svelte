<script lang="ts">
	import { location, setLocation } from '$lib/location';
	import { theme, setTheme, type ThemeName } from '$lib/theme';
	import { trips, upsertTrip, removeTrip, newTripId } from '$lib/trip';
	import type { TripConfig } from '$lib/config';
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';

	let name = $state($location.name);
	let lat = $state($location.lat);
	let lon = $state($location.lon);
	let saved = $state(false);

	let selectedTripId = $state($trips[0]?.id ?? '');
	let selectedTrip = $derived($trips.find((t) => t.id === selectedTripId));

	let destination = $state('');
	let country = $state('');
	let tripLat = $state(0);
	let tripLon = $state(0);
	let hotelName = $state('');
	let hotelLocation = $state('');
	let checkIn = $state('');
	let checkOut = $state('');
	let photoAlbumUrl = $state('');
	let gpxFilesText = $state('');
	let tripSaved = $state(false);

	function loadTripForm(t: TripConfig | undefined) {
		destination = t?.destination ?? '';
		country = t?.country ?? '';
		tripLat = t?.lat ?? 0;
		tripLon = t?.lon ?? 0;
		hotelName = t?.hotelName ?? '';
		hotelLocation = t?.hotelLocation ?? '';
		checkIn = t?.checkIn ?? '';
		checkOut = t?.checkOut ?? '';
		photoAlbumUrl = t?.photoAlbumUrl ?? '';
		gpxFilesText = (t?.gpxFiles ?? []).join('\n');
	}
	$effect(() => {
		loadTripForm(selectedTrip);
	});

	function handleSelectTrip(e: Event) {
		selectedTripId = (e.target as HTMLSelectElement).value;
		loadTripForm($trips.find((t) => t.id === selectedTripId));
	}

	function handleSave(e: SubmitEvent) {
		e.preventDefault();
		setLocation({ name, lat: Number(lat), lon: Number(lon) });
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	function handleTripSave(e: SubmitEvent) {
		e.preventDefault();
		const gpxFiles = gpxFilesText
			.split('\n')
			.map((s) => s.trim())
			.filter(Boolean);
		upsertTrip({
			id: selectedTripId,
			destination,
			country,
			lat: Number(tripLat),
			lon: Number(tripLon),
			hotelName,
			hotelLocation,
			checkIn,
			checkOut,
			photoAlbumUrl: photoAlbumUrl || undefined,
			gpxFiles: gpxFiles.length > 0 ? gpxFiles : undefined
		});
		tripSaved = true;
		setTimeout(() => (tripSaved = false), 2000);
	}

	function handleAddTrip() {
		selectedTripId = newTripId();
		loadTripForm(undefined);
	}

	function handleRemoveTrip() {
		if (!selectedTripId) return;
		removeTrip(selectedTripId);
		selectedTripId = $trips[0]?.id ?? '';
		loadTripForm($trips.find((t) => t.id === selectedTripId));
	}

	function handleThemeChange(e: Event) {
		setTheme((e.target as HTMLSelectElement).value as ThemeName);
	}
</script>

<div class="settings-page">
	<a class="back-link" href={base || '/'}>← Back to dashboard</a>
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
			<Button type="submit">Save</Button>
			{#if saved}
				<span class="saved">Saved</span>
			{/if}
		</form>
	</section>

	<section>
		<h2>Ski trips</h2>
		<label>
			Trip
			<select value={selectedTripId} onchange={handleSelectTrip}>
				{#each $trips as t (t.id)}
					<option value={t.id}>{t.destination}</option>
				{/each}
			</select>
		</label>

		<form onsubmit={handleTripSave}>
			<label>
				Trip ID <span class="hint-inline">(use this in GPX file paths)</span>
				<input type="text" value={selectedTripId} readonly />
			</label>
			<label>
				Destination
				<input type="text" bind:value={destination} placeholder="e.g. Canazei" required />
			</label>
			<label>
				Country
				<input type="text" bind:value={country} placeholder="e.g. Italy" required />
			</label>
			<label>
				Latitude
				<input type="number" step="any" bind:value={tripLat} required />
			</label>
			<label>
				Longitude
				<input type="number" step="any" bind:value={tripLon} required />
			</label>
			<label>
				Hotel name
				<input type="text" bind:value={hotelName} placeholder="e.g. Dolomites Inn" required />
			</label>
			<label>
				Hotel location
				<input type="text" bind:value={hotelLocation} placeholder="e.g. Penia" required />
			</label>
			<label>
				Check-in
				<input type="date" bind:value={checkIn} />
			</label>
			<label>
				Check-out
				<input type="date" bind:value={checkOut} />
			</label>
			<label>
				Photo album URL (optional)
				<input
					type="url"
					bind:value={photoAlbumUrl}
					placeholder="https://photos.app.goo.gl/..."
				/>
			</label>
			<label>
				GPX activity files (optional, one path per line)
				<textarea
					bind:value={gpxFilesText}
					rows="3"
					placeholder="/activities/selva-2026/day1.gpx"
				></textarea>
			</label>
			<div class="trip-actions">
				<Button type="submit">Save trip</Button>
				<Button type="button" variant="outline" onclick={handleAddTrip}>Add new trip</Button>
				<Button type="button" variant="destructive" onclick={handleRemoveTrip}>Remove trip</Button>
			</div>
			{#if tripSaved}
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
	.trip-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
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
	.hint-inline {
		font-weight: normal;
		font-size: 0.8rem;
		color: var(--muted, #666);
	}
	input[readonly] {
		color: var(--muted, #666);
		background: color-mix(in srgb, var(--card-bg, #fff) 90%, var(--border, #ccc));
	}
	input,
	select,
	textarea {
		padding: 0.5rem;
		font-size: 1rem;
		font-family: inherit;
		border: 1px solid var(--border, #ccc);
		border-radius: 6px;
		background: var(--card-bg, #fff);
		color: inherit;
	}
	.saved {
		color: var(--success, #2e7d32);
		font-size: 0.9rem;
	}
</style>
