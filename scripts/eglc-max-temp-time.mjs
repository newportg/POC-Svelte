// One-off analysis: average earliest time of day EGLC reaches its daily max temperature.
// Historical METAR data comes from Iowa State Mesonet (NOAA's own aviationweather.gov API
// only retains a rolling ~24-48h window, too short for a meaningful average).
const STATION = 'EGLC';
const DAYS = Number(process.argv[2] ?? 90);
const MIN_OBSERVATIONS_PER_DAY = 20; // skip days with too many gaps to trust the max

function toIemDate(date) {
	return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

const end = new Date();
const start = new Date(end.getTime() - DAYS * 24 * 60 * 60 * 1000);
const { year: y1, month: m1, day: d1 } = toIemDate(start);
const { year: y2, month: m2, day: d2 } = toIemDate(end);

const url =
	`https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?station=${STATION}&data=tmpf` +
	`&year1=${y1}&month1=${m1}&day1=${d1}&year2=${y2}&month2=${m2}&day2=${d2}` +
	`&tz=Europe%2FLondon&format=onlycomma&latlon=no&missing=M&trace=T&direct=no&report_type=3`;

const response = await fetch(url, { headers: { 'User-Agent': 'POC-Svelte EGLC max-temp-time analysis' } });
if (!response.ok) throw new Error(`IEM request failed: ${response.status}`);
const csv = await response.text();

const lines = csv.trim().split('\n');
const header = lines[0].split(',');
const validIdx = header.indexOf('valid');
const tmpfIdx = header.indexOf('tmpf');

const byDay = new Map();
for (const line of lines.slice(1)) {
	const cols = line.split(',');
	const valid = cols[validIdx];
	const tmpf = Number(cols[tmpfIdx]);
	if (!valid || !Number.isFinite(tmpf)) continue;

	const [datePart, timePart] = valid.split(' ');
	const [hour, minute] = timePart.split(':').map(Number);
	const minutesOfDay = hour * 60 + minute;

	if (!byDay.has(datePart)) byDay.set(datePart, []);
	byDay.get(datePart).push({ minutesOfDay, tmpf });
}

const maxTimes = [];
let skippedDays = 0;
for (const [date, observations] of byDay) {
	if (observations.length < MIN_OBSERVATIONS_PER_DAY) {
		skippedDays++;
		continue;
	}
	const maxTemp = Math.max(...observations.map((o) => o.tmpf));
	const earliest = observations.find((o) => o.tmpf === maxTemp);
	maxTimes.push({ date, maxTemp, minutesOfDay: earliest.minutesOfDay });
}

if (maxTimes.length === 0) throw new Error('No qualifying days found; widen the date range.');

const avgMinutes = maxTimes.reduce((sum, d) => sum + d.minutesOfDay, 0) / maxTimes.length;
const sorted = [...maxTimes].sort((a, b) => a.minutesOfDay - b.minutesOfDay);
const medianMinutes = sorted[Math.floor(sorted.length / 2)].minutesOfDay;

function formatMinutes(minutes) {
	const h = Math.floor(minutes / 60) % 24;
	const m = Math.round(minutes % 60);
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

console.log(`Station: ${STATION}`);
console.log(`Days requested: ${DAYS} (qualifying days analyzed: ${maxTimes.length}, skipped: ${skippedDays})`);
console.log(`Average earliest time of daily max temp: ${formatMinutes(avgMinutes)} Europe/London`);
console.log(`Median earliest time of daily max temp: ${formatMinutes(medianMinutes)} Europe/London`);
