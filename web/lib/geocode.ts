import type { GeocodeResult } from "./types";

/**
 * Geocodifica una ciudad usando Nominatim (OpenStreetMap).
 * Nominatim es gratis y no necesita API key, pero la ToS exige un User-Agent
 * identificable. Lo pasamos desde el navegador vía header (limitación: en
 * browsers no podemos forzar User-Agent, pero Nominatim acepta Referer).
 *
 * Después enriquecemos con la timezone usando timeapi.io (también gratis).
 */
export async function geocodeCity(city: string): Promise<GeocodeResult> {
  if (!city.trim()) {
    throw new Error("Introduce una ciudad.");
  }

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
  nominatimUrl.searchParams.set("q", city);
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("limit", "1");
  nominatimUrl.searchParams.set("addressdetails", "1");
  nominatimUrl.searchParams.set("accept-language", "es");

  const geoRes = await fetch(nominatimUrl.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!geoRes.ok) {
    throw new Error("No se pudo contactar con el servicio de geocoding.");
  }

  const geoJson = (await geoRes.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: { country_code?: string };
  }>;

  if (!geoJson.length) {
    throw new Error(`No se encontró la ciudad "${city}". Prueba con "Ciudad, País".`);
  }

  const first = geoJson[0];
  const lat = parseFloat(first.lat);
  const lng = parseFloat(first.lon);
  const country_code = (first.address?.country_code || "").toUpperCase();
  const display_name = first.display_name;

  // Obtener timezone a partir de coordenadas
  const tzUrl = new URL("https://timeapi.io/api/TimeZone/coordinate");
  tzUrl.searchParams.set("latitude", String(lat));
  tzUrl.searchParams.set("longitude", String(lng));

  const tzRes = await fetch(tzUrl.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!tzRes.ok) {
    throw new Error("No se pudo determinar la zona horaria.");
  }
  const tzJson = (await tzRes.json()) as { timeZone?: string };
  const tz_str = tzJson.timeZone;
  if (!tz_str) {
    throw new Error("El servicio de zona horaria no devolvió un valor válido.");
  }

  return { lat, lng, display_name, country_code, tz_str };
}
