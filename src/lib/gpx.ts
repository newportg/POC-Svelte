export interface GpxPoint {
	lat: number;
	lon: number;
	ele: number | null;
	time: Date | null;
}

export interface GpxStats {
	name: string | null;
	points: GpxPoint[];
	distanceKm: number;
	elevationGainM: number;
	elevationLossM: number;
	durationSeconds: number | null;
	avgSpeedKmh: number | null;
	startTime: Date | null;
}

function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

function haversineKm(a: GpxPoint, b: GpxPoint): number {
	const R = 6371;
	const dLat = toRad(b.lat - a.lat);
	const dLon = toRad(b.lon - a.lon);
	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Parses a GPX file's track points and derives distance/elevation/duration stats. */
export function parseGpx(xmlText: string): GpxStats {
	const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
	if (doc.querySelector('parsererror')) {
		throw new Error('Invalid GPX file');
	}

	const points: GpxPoint[] = Array.from(doc.getElementsByTagName('trkpt'))
		.map((pt): GpxPoint => {
			const lat = parseFloat(pt.getAttribute('lat') ?? '');
			const lon = parseFloat(pt.getAttribute('lon') ?? '');
			const eleText = pt.getElementsByTagName('ele')[0]?.textContent;
			const timeText = pt.getElementsByTagName('time')[0]?.textContent;
			const ele = eleText ? parseFloat(eleText) : null;
			const time = timeText ? new Date(timeText) : null;
			return { lat, lon, ele: ele !== null && !isNaN(ele) ? ele : null, time };
		})
		.filter((p) => !isNaN(p.lat) && !isNaN(p.lon));

	let distanceKm = 0;
	let elevationGainM = 0;
	let elevationLossM = 0;
	for (let i = 1; i < points.length; i++) {
		distanceKm += haversineKm(points[i - 1], points[i]);
		const prevEle = points[i - 1].ele;
		const ele = points[i].ele;
		if (prevEle !== null && ele !== null) {
			const diff = ele - prevEle;
			if (diff > 0) elevationGainM += diff;
			else elevationLossM += -diff;
		}
	}

	const startTime = points.find((p) => p.time)?.time ?? null;
	const endTime = [...points].reverse().find((p) => p.time)?.time ?? null;
	const durationSeconds =
		startTime && endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : null;
	const avgSpeedKmh =
		durationSeconds && durationSeconds > 0 ? distanceKm / (durationSeconds / 3600) : null;
	const name = doc.getElementsByTagName('name')[0]?.textContent ?? null;

	return { name, points, distanceKm, elevationGainM, elevationLossM, durationSeconds, avgSpeedKmh, startTime };
}
