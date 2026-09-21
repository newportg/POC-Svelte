export type TripStatus = 'past' | 'ongoing' | 'upcoming';

export interface DailyTripWeather {
	date: string;
	tempMax: number | null;
	tempMin: number | null;
	snowfallCm: number | null;
}

export interface TripWeather {
	/** True if this is actual recorded weather for a trip that has already finished. */
	historical: boolean;
	days: DailyTripWeather[];
	totalSnowCm: number;
}

function startOfDay(d: Date): Date {
	const copy = new Date(d);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

export function getTripStatus(checkIn: string, checkOut: string): TripStatus {
	const today = startOfDay(new Date());
	const outDate = checkOut ? startOfDay(new Date(checkOut)) : null;
	const inDate = checkIn ? startOfDay(new Date(checkIn)) : null;
	if (outDate && !isNaN(outDate.getTime()) && outDate < today) return 'past';
	if (inDate && !isNaN(inDate.getTime()) && inDate > today) return 'upcoming';
	return 'ongoing';
}

/** Fetches actual (past trips) or forecast (upcoming/ongoing trips) daily temperature + snowfall. */
export async function fetchTripWeather(
	lat: number,
	lon: number,
	checkIn: string,
	checkOut: string
): Promise<TripWeather> {
	const historical = getTripStatus(checkIn, checkOut) === 'past';
	const base = historical
		? 'https://archive-api.open-meteo.com/v1/archive'
		: 'https://api.open-meteo.com/v1/forecast';

	const params = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lon),
		daily: 'temperature_2m_max,temperature_2m_min,snowfall_sum',
		timezone: 'auto'
	});
	if (checkIn) params.set('start_date', checkIn);
	if (checkOut) params.set('end_date', checkOut);

	const res = await fetch(`${base}?${params.toString()}`);
	if (!res.ok) {
		let reason = `Weather request failed (${res.status})`;
		try {
			const errJson = await res.json();
			if (errJson?.reason) reason = errJson.reason;
		} catch {
			// ignore, use default reason
		}
		if (reason.toLowerCase().includes('out of allowed range')) {
			reason = "Forecast isn't available this far ahead yet — check back closer to your trip.";
		}
		throw new Error(reason);
	}

	const data = await res.json();
	const dates: string[] = data.daily?.time ?? [];
	const tmax: number[] = data.daily?.temperature_2m_max ?? [];
	const tmin: number[] = data.daily?.temperature_2m_min ?? [];
	const snow: number[] = data.daily?.snowfall_sum ?? [];

	const days: DailyTripWeather[] = dates.map((date, i) => ({
		date,
		tempMax: tmax[i] ?? null,
		tempMin: tmin[i] ?? null,
		snowfallCm: snow[i] ?? null
	}));
	const totalSnowCm = days.reduce((sum, d) => sum + (d.snowfallCm ?? 0), 0);

	return { historical, days, totalSnowCm };
}
