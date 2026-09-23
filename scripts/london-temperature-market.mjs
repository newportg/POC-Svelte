import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DATA_PATH = 'static/data/london-temperature-predictions.json';
const NOAA_URL = 'https://aviationweather.gov/api/data/metar?ids=EGLC&format=json&hours=24';
const forceRun = process.env.LONDON_MARKET_FORCE === 'true';

function londonParts(date = new Date()) {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/London',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	});
	const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
	return {
		date: `${parts.year}-${parts.month}-${parts.day}`,
		hour: Number(parts.hour),
		minute: Number(parts.minute)
	};
}

function shouldRun() {
	if (forceRun) return true;
	const now = londonParts();
	return now.hour === 15 && now.minute >= 50;
}

async function loadSaved() {
	try {
		return JSON.parse(await readFile(DATA_PATH, 'utf8'));
	} catch {
		return { predictions: {} };
	}
}

if (!shouldRun()) {
	console.log('Not the London 15:55 run window; skipping.');
	process.exit(0);
}

const market = londonParts();
const response = await fetch(NOAA_URL, { headers: { 'User-Agent': 'POC-Svelte London temperature market' } });
if (!response.ok) throw new Error(`NOAA request failed: ${response.status}`);
const observations = await response.json();
const temperatures = observations
	.filter((observation) => {
		if (observation.obsTime === undefined) return false;
		return londonParts(new Date(observation.obsTime * 1000)).date === market.date;
	})
	.map((observation) => observation.temp)
	.filter((temperature) => typeof temperature === 'number');

if (temperatures.length === 0) throw new Error(`No NOAA EGLC observations found for ${market.date}`);

const saved = await loadSaved();
saved.predictions[market.date] = {
	predictionC: Math.round(Math.max(...temperatures)),
	marketDate: market.date,
	savedAt: new Date().toISOString(),
	source: NOAA_URL,
	observationCount: temperatures.length
};

await mkdir('static/data', { recursive: true });
await writeFile(DATA_PATH, `${JSON.stringify(saved, null, 2)}\n`);
console.log(`Saved ${market.date}: ${saved.predictions[market.date].predictionC}°C`);
