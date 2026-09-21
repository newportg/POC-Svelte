import { writable, get } from 'svelte/store';
import { location } from '$lib/location';

export interface WeatherState {
	loading: boolean;
	error: string | null;
	temperature: number | null;
	apparentTemperature: number | null;
	humidity: number | null;
	windSpeed: number | null;
	weatherCode: number | null;
	updatedAt: Date | null;
}

export const weather = writable<WeatherState>({
	loading: true,
	error: null,
	temperature: null,
	apparentTemperature: null,
	humidity: null,
	windSpeed: null,
	weatherCode: null,
	updatedAt: null
});

const REFRESH_MS = 10 * 60 * 1000;
let started = false;

/** Starts weather fetching for the configured location, and keeps refreshing on an interval. Idempotent. */
export function ensureWeather() {
	if (started) return;
	started = true;

	location.subscribe((loc) => {
		void fetchWeather(loc.lat, loc.lon);
	});

	setInterval(() => {
		const loc = get(location);
		void fetchWeather(loc.lat, loc.lon);
	}, REFRESH_MS);
}

export async function refreshWeather() {
	const loc = get(location);
	await fetchWeather(loc.lat, loc.lon);
}

async function fetchWeather(lat: number, lon: number) {
	weather.update((s) => ({ ...s, loading: true, error: null }));
	try {
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
		const data = await res.json();
		const c = data.current;
		weather.set({
			loading: false,
			error: null,
			temperature: c.temperature_2m,
			apparentTemperature: c.apparent_temperature,
			humidity: c.relative_humidity_2m,
			windSpeed: c.wind_speed_10m,
			weatherCode: c.weather_code,
			updatedAt: new Date()
		});
	} catch (e) {
		weather.update((s) => ({
			...s,
			loading: false,
			error: e instanceof Error ? e.message : 'Failed to load weather'
		}));
	}
}
