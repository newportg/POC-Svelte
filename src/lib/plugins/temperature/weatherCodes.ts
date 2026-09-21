export interface WeatherCodeInfo {
	label: string;
	icon: string;
}

// WMO weather interpretation codes used by Open-Meteo
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
	0: { label: 'Clear sky', icon: '☀️' },
	1: { label: 'Mainly clear', icon: '🌤️' },
	2: { label: 'Partly cloudy', icon: '⛅' },
	3: { label: 'Overcast', icon: '☁️' },
	45: { label: 'Fog', icon: '🌫️' },
	48: { label: 'Depositing rime fog', icon: '🌫️' },
	51: { label: 'Light drizzle', icon: '🌦️' },
	53: { label: 'Drizzle', icon: '🌦️' },
	55: { label: 'Dense drizzle', icon: '🌧️' },
	56: { label: 'Freezing drizzle', icon: '🌧️' },
	57: { label: 'Dense freezing drizzle', icon: '🌧️' },
	61: { label: 'Slight rain', icon: '🌧️' },
	63: { label: 'Rain', icon: '🌧️' },
	65: { label: 'Heavy rain', icon: '🌧️' },
	66: { label: 'Freezing rain', icon: '🌧️' },
	67: { label: 'Heavy freezing rain', icon: '🌧️' },
	71: { label: 'Slight snow', icon: '🌨️' },
	73: { label: 'Snow', icon: '🌨️' },
	75: { label: 'Heavy snow', icon: '❄️' },
	77: { label: 'Snow grains', icon: '❄️' },
	80: { label: 'Slight rain showers', icon: '🌦️' },
	81: { label: 'Rain showers', icon: '🌧️' },
	82: { label: 'Violent rain showers', icon: '⛈️' },
	85: { label: 'Slight snow showers', icon: '🌨️' },
	86: { label: 'Heavy snow showers', icon: '❄️' },
	95: { label: 'Thunderstorm', icon: '⛈️' },
	96: { label: 'Thunderstorm with hail', icon: '⛈️' },
	99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

export function getWeatherInfo(code: number | null): WeatherCodeInfo {
	if (code === null) return { label: 'Unknown', icon: '❔' };
	return WEATHER_CODES[code] ?? { label: 'Unknown', icon: '❔' };
}
