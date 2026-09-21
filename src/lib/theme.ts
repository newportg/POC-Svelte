import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeName = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'dashboard:theme';

function loadStored(): ThemeName {
	if (!browser) return 'system';
	return (localStorage.getItem(STORAGE_KEY) as ThemeName | null) ?? 'system';
}

export const theme = writable<ThemeName>(loadStored());

/** Updates the active theme, persists it, and applies it to the document. */
export function setTheme(t: ThemeName) {
	theme.set(t);
	if (browser) localStorage.setItem(STORAGE_KEY, t);
	applyTheme(t);
}

function applyTheme(t: ThemeName) {
	if (!browser) return;
	const resolved =
		t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
	document.documentElement.setAttribute('data-theme', resolved);
}

if (browser) {
	applyTheme(get(theme));
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (get(theme) === 'system') applyTheme('system');
	});
}
