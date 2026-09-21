// Prerender everything discoverable at build time; adapter-static's `fallback` handles
// any route (e.g. a trip added later via Settings) that can't be known ahead of time.
export const prerender = true;
