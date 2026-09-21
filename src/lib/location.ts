import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { DEFAULT_LOCATION, type LocationConfig } from './config';

const STORAGE_KEY = 'dashboard:location';

function loadStored(): LocationConfig {
	if (!browser) return DEFAULT_LOCATION;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return { ...DEFAULT_LOCATION, ...JSON.parse(raw) };
	} catch {
		// ignore malformed storage
	}
	return DEFAULT_LOCATION;
}

export const location = writable<LocationConfig>(loadStored());

/** Updates the configured location and persists it for next time. */
export function setLocation(loc: LocationConfig) {
	location.set(loc);
	if (browser) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
		} catch {
			// ignore storage failures (e.g. private browsing)
		}
	}
}
