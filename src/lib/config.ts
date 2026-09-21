export interface LocationConfig {
	name: string;
	lat: number;
	lon: number;
}

/** Default location used until the user configures one in Settings. */
export const DEFAULT_LOCATION: LocationConfig = {
	name: 'Woking, UK',
	lat: 51.3168,
	lon: -0.5599
};
