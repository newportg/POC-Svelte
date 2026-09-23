import { browser } from '$app/environment';
import { base } from '$app/paths';

export interface TemperaturePrediction {
	marketDate: string;
	predictionC: number;
	savedAt: string;
}

export interface PublishedTemperatureResult {
	label: string;
	minimum?: number;
	maximum?: number;
}

const STORAGE_KEY = 'dashboard:london-temperature-predictions';
function loadPredictions(): TemperaturePrediction[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as TemperaturePrediction[]) : [];
	} catch {
		return [];
	}
}

export async function hydratePredictions() {
	if (!browser) return;
	try {
		const response = await fetch(`${base}/data/london-temperature-predictions.json`, {
			cache: 'no-store'
		});
		if (!response.ok) return;
		const data = (await response.json()) as { predictions?: Record<string, TemperaturePrediction> };
		const merged = new Map(loadPredictions().map((prediction) => [prediction.marketDate, prediction]));
		for (const prediction of Object.values(data.predictions ?? {})) {
			merged.set(prediction.marketDate, prediction);
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged.values()]));
	} catch {
		// Local predictions remain available if the deployed data file is unavailable.
	}
}

export function getPrediction(marketDate: string): TemperaturePrediction | undefined {
	return loadPredictions().find((prediction) => prediction.marketDate === marketDate);
}

export function getPredictions(): TemperaturePrediction[] {
	return loadPredictions().sort((a, b) => b.marketDate.localeCompare(a.marketDate));
}

export function savePrediction(prediction: TemperaturePrediction) {
	if (!browser) return;
	const predictions = loadPredictions().filter((item) => item.marketDate !== prediction.marketDate);
	predictions.push(prediction);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
}

export function londonDateParts(date = new Date()): { date: string; hour: number } {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/London',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hourCycle: 'h23'
	});
	const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
	return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export function addDays(dateString: string, days: number): string {
	const date = new Date(`${dateString}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

export async function fetchLondonForecast(marketDate: string): Promise<number> {
	const date = `${marketDate}T23:59:59Z`;
	const response = await fetch(
		`/api/noaa/api/data/metar?ids=EGLC&format=json&date=${encodeURIComponent(date)}&hours=24`
	);
	if (!response.ok) throw new Error('London forecast unavailable');
	const observations = (await response.json()) as { obsTime?: number; temp?: number }[];
	const temperatures = observations
		.filter(
			(observation) =>
				observation.obsTime !== undefined &&
				londonDateParts(new Date(observation.obsTime * 1000)).date === marketDate
		)
		.map((observation) => observation.temp)
		.filter((temperature): temperature is number => typeof temperature === 'number');
	if (temperatures.length === 0) throw new Error('No NOAA observations available for this market date');
	return Math.max(...temperatures);
}

export async function fetchPublishedTemperatureResult(
	marketDate: string
): Promise<PublishedTemperatureResult | null> {
	const date = new Date(`${marketDate}T12:00:00Z`);
	const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }).toLowerCase();
	const day = date.getUTCDate();
	const year = date.getUTCFullYear();
	const slug = `highest-temperature-in-london-on-${month}-${day}-${year}`;
	const response = await fetch(`/api/polymarket/events?slug=${slug}`);
	if (!response.ok) throw new Error('Polymarket result unavailable');
	const events = (await response.json()) as {
		markets?: { closed?: boolean; groupItemTitle?: string; outcomePrices?: string }[];
	}[];
	const event = events[0];
	const winningMarket = event?.markets?.find((market) => {
		if (!market.closed || !market.outcomePrices) return false;
		try {
			return Number(JSON.parse(market.outcomePrices)[0]) === 1;
		} catch {
			return false;
		}
	});
	if (!winningMarket?.groupItemTitle) return null;

	const label = winningMarket.groupItemTitle.replace(/Â/g, '');
	const exact = label.match(/(\d+)\s*°C$/);
	const below = label.match(/(\d+)\s*°C?\s*or below/i);
	const higher = label.match(/(\d+)\s*°C?\s*or higher/i);
	if (exact) return { label, minimum: Number(exact[1]), maximum: Number(exact[1]) };
	if (below) return { label, maximum: Number(below[1]) };
	if (higher) return { label, minimum: Number(higher[1]) };
	return { label };
}

export function predictionMatchesResult(prediction: number, result: PublishedTemperatureResult): boolean {
	return (
		(result.minimum === undefined || prediction >= result.minimum) &&
		(result.maximum === undefined || prediction <= result.maximum)
	);
}
