import type { GeocodeResult } from "./types";

/**
 * Geocodifica una ciudad usando Nominatim (OpenStreetMap).
 * Nominatim es gratis y no necesita API key.
 *
 * La timezone se resuelve en el servidor (api/chart.py) a partir de
 * lat/lng usando la librería timezonefinder, que lleva los datos de
 * zonas horarias embebidos y no requiere peticiones de red externas.
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

  return { lat, lng, display_name, country_code };
}
