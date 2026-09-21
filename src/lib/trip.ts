import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_TRIPS, type TripConfig } from './config';

const STORAGE_KEY = 'dashboard:trips';

function loadStored(): TripConfig[] {
	if (!browser) return DEFAULT_TRIPS;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		// ignore malformed storage
	}
	return DEFAULT_TRIPS;
}

export const trips = writable<TripConfig[]>(loadStored());

function persist(list: TripConfig[]) {
	if (browser) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
		} catch {
			// ignore storage failures (e.g. private browsing)
		}
	}
}

/** Creates or updates a trip by id and persists the full list. */
export function upsertTrip(t: TripConfig) {
	trips.update((list) => {
		const idx = list.findIndex((x) => x.id === t.id);
		const next = idx === -1 ? [...list, t] : list.map((x, i) => (i === idx ? t : x));
		persist(next);
		return next;
	});
}

export function removeTrip(id: string) {
	trips.update((list) => {
		const next = list.filter((x) => x.id !== id);
		persist(next);
		return next;
	});
}

export function newTripId(): string {
	return `trip-${Date.now()}`;
}
