<script lang="ts">
	import { onMount } from 'svelte';
	import { polymarketCategories } from './categories';

	type PolymarketEvent = {
		title: string;
		slug: string;
		image?: string;
		volume?: number;
		endDate?: string;
		tags?: { label: string; slug: string }[];
	};

	let selectedCategory = $state<string | null>(null);
	let selectedSubcategory = $state('all');
	let availableCategorySlugs = $state<string[]>([]);
	let categoriesLoading = $state(true);
	let events = $state<PolymarketEvent[]>([]);
	let loading = $state(false);
	let error = $state('');
	let subcategories = $derived.by(() => {
		const groups = new Map<string, { label: string; slug: string; count: number }>();
		for (const event of events) {
			for (const tag of event.tags ?? []) {
				if (tag.slug === selectedCategory || tag.slug.includes('/')) continue;
				const existing = groups.get(tag.slug);
				if (existing) existing.count += 1;
				else groups.set(tag.slug, { label: tag.label, slug: tag.slug, count: 1 });
			}
		}
		return [...groups.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
	});
	let visibleEvents = $derived(
		selectedSubcategory === 'all'
			? events
			: events.filter((event) => event.tags?.some((tag) => tag.slug === selectedSubcategory))
	);
	let availableCategories = $derived(
		polymarketCategories.filter((category) => availableCategorySlugs.includes(category.slug))
	);

	onMount(async () => {
		const results = await Promise.all(
			polymarketCategories.map(async (category) => {
				try {
					const params = new URLSearchParams({
						tag_slug: category.slug,
						closed: 'false',
						limit: '1'
					});
					const response = await fetch(`https://gamma-api.polymarket.com/events?${params}`);
					if (!response.ok) return null;
					const categoryEvents = (await response.json()) as PolymarketEvent[];
					return categoryEvents.length > 0 ? category.slug : null;
				} catch {
					return null;
				}
			})
		);
		availableCategorySlugs = results.filter(
			(slug): slug is (typeof polymarketCategories)[number]['slug'] => slug !== null
		);
		categoriesLoading = false;
	});

	async function selectCategory(category: (typeof polymarketCategories)[number]) {
		selectedCategory = category.label;
		selectedSubcategory = 'all';
		loading = true;
		error = '';
		events = [];

		try {
			const params = new URLSearchParams({
				tag_slug: category.slug,
				closed: 'false',
				limit: '50',
				order: 'volume',
				ascending: 'false'
			});
			const response = await fetch(`https://gamma-api.polymarket.com/events?${params}`);
			if (!response.ok) throw new Error('Unable to load events');
			events = (await response.json()) as PolymarketEvent[];
		} catch {
			error = 'Events could not be loaded right now.';
		} finally {
			loading = false;
		}
	}

	function formatVolume(volume: number | undefined): string {
		if (!volume) return 'No volume reported';
		return `$${new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(volume)} volume`;
	}

	function formatDate(date: string | undefined): string {
		if (!date) return 'No end date';
		const parsed = new Date(date);
		return isNaN(parsed.getTime()) ? 'No end date' : `Ends ${parsed.toLocaleDateString()}`;
	}
</script>

<section class="polymarket-detail">
	<header>
		<h1>🎲 Polymarket event categories</h1>
		<p>Browse the current categories from Polymarket's navigation.</p>
	</header>

	{#if categoriesLoading}
		<p class="status">Loading categories...</p>
	{:else if availableCategories.length === 0}
		<p class="status">No active Polymarket categories found.</p>
	{:else}
		<ul class="category-list">
		{#each availableCategories as category}
			<li>
				<button
					type="button"
					class:selected={selectedCategory === category.label}
					onclick={() => selectCategory(category)}
				>
					{category.label}
				</button>
			</li>
		{/each}
		</ul>
	{/if}

	{#if selectedCategory}
		<section class="events-section" aria-live="polite">
			<h2>{selectedCategory} events</h2>
			{#if loading}
				<p class="status">Loading events...</p>
			{:else if error}
				<p class="status error">{error}</p>
			{:else if events.length === 0}
				<p class="status">No active events found in this category.</p>
			{:else}
				<nav class="subcategory-menu" aria-label={`${selectedCategory} subcategories`}>
					<button type="button" class:selected={selectedSubcategory === 'all'} onclick={() => (selectedSubcategory = 'all')}>
						All <span>{events.length}</span>
					</button>
					{#each subcategories as subcategory (subcategory.slug)}
						<button
							type="button"
							class:selected={selectedSubcategory === subcategory.slug}
							onclick={() => (selectedSubcategory = subcategory.slug)}
						>
							{subcategory.label} <span>{subcategory.count}</span>
						</button>
					{/each}
				</nav>

				{#if visibleEvents.length === 0}
					<p class="status">No events found in this subcategory.</p>
				{:else}
					<div class="event-list">
					{#each visibleEvents as event (event.slug)}
						<a class="event" href={`https://polymarket.com/event/${event.slug}`} target="_blank" rel="noopener noreferrer">
							{#if event.image}
								<img src={event.image} alt="" loading="lazy" />
							{/if}
							<span class="event-content">
								<strong>{event.title}</strong>
								<span>{formatVolume(event.volume)} · {formatDate(event.endDate)}</span>
							</span>
						</a>
					{/each}
					</div>
				{/if}
			{/if}
		</section>
	{/if}
</section>

<style>
	.polymarket-detail {
		padding: 1rem 1.5rem;
	}
	header {
		margin-bottom: 1.25rem;
	}
	h1 {
		margin: 0 0 0.4rem;
	}
	p {
		margin: 0;
		color: var(--muted, #666);
	}
	.category-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.category-list li {
		border: 1px solid var(--border, #ddd);
		border-radius: 8px;
		background: var(--card-bg, #fff);
		overflow: hidden;
	}
	.category-list button {
		width: 100%;
		padding: 1rem;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	.category-list button:hover,
	.category-list button.selected {
		background: var(--accent, #e8eefc);
	}
	.events-section {
		margin-top: 2rem;
	}
	h2 {
		margin: 0 0 0.75rem;
	}
	.status {
		color: var(--muted, #666);
	}
	.subcategory-menu {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		overflow-x: auto;
		border-bottom: 1px solid var(--border, #ddd);
	}
	.subcategory-menu button {
		flex: 0 0 auto;
		padding: 0.45rem 0.7rem;
		border: 1px solid var(--border, #ddd);
		border-radius: 999px;
		background: var(--card-bg, #fff);
		color: inherit;
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.subcategory-menu button:hover,
	.subcategory-menu button.selected {
		border-color: var(--accent, #8095c9);
		background: var(--accent, #e8eefc);
	}
	.subcategory-menu span {
		color: var(--muted, #666);
		font-size: 0.75rem;
	}
	.error {
		color: var(--danger, #b42318);
	}
	.event-list {
		display: grid;
		gap: 0.75rem;
	}
	.event {
		display: flex;
		gap: 0.85rem;
		align-items: center;
		padding: 0.75rem;
		border: 1px solid var(--border, #ddd);
		border-radius: 8px;
		background: var(--card-bg, #fff);
		color: inherit;
		text-decoration: none;
	}
	.event:hover {
		border-color: var(--accent, #8095c9);
	}
	.event img {
		width: 56px;
		height: 56px;
		flex: 0 0 56px;
		border-radius: 6px;
		object-fit: cover;
	}
	.event-content {
		display: grid;
		gap: 0.25rem;
	}
	.event-content span {
		font-size: 0.85rem;
		color: var(--muted, #666);
	}
</style>
