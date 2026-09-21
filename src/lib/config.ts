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

export interface TripConfig {
	id: string;
	destination: string;
	country: string;
	lat: number;
	lon: number;
	hotelName: string;
	hotelLocation: string;
	checkIn: string;
	checkOut: string;
	/** Optional link to a shared photo album for this trip. */
	photoAlbumUrl?: string;
}

/** Default trips used until the user configures their own in Settings. */
export const DEFAULT_TRIPS: TripConfig[] = [
	{
		id: 'canazei-2027',
		destination: 'Canazei',
		country: 'Italy',
		lat: 46.4767,
		lon: 11.7719,
		hotelName: 'Dolomites Inn',
		hotelLocation: 'Penia',
		checkIn: '2027-01-02',
		checkOut: '2027-01-09'
	},
	{
		id: 'selva-2026',
		destination: 'Selva Val Gardena',
		country: 'Italy',
		lat: 46.5546,
		lon: 11.755,
		hotelName: 'Hotel Olympia',
		hotelLocation: 'Selva Val Gardena',
		checkIn: '2026-01-03',
		checkOut: '2026-01-10',
		photoAlbumUrl: 'https://photos.app.goo.gl/vWiCtA2PqneABLuZ8'
	}
];
