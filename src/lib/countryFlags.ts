/** Rough country name → ISO 3166-1 alpha-2 code mapping for map markers. Extend as needed. */
const COUNTRY_CODES: Record<string, string> = {
	italy: 'it',
	uk: 'gb',
	'united kingdom': 'gb',
	england: 'gb',
	france: 'fr',
	switzerland: 'ch',
	austria: 'at',
	germany: 'de',
	spain: 'es',
	usa: 'us',
	'united states': 'us'
};

/** Returns a small flag image URL (via flagcdn.com) for a country name, or null if unknown. */
export function getCountryFlagUrl(country: string): string | null {
	const code = COUNTRY_CODES[country.trim().toLowerCase()];
	return code ? `https://flagcdn.com/w40/${code}.png` : null;
}
