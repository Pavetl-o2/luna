export type Gender = "mujer" | "hombre" | "no-binario" | "prefiero-no-decir";

export interface BirthFormValues {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  city: string;
  gender: Gender;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
  country_code: string; // ISO-3166 alpha-2, e.g. "ES"
  tz_str: string; // e.g. "Europe/Madrid"
}

export interface ChartPlanet {
  name: string | null;
  sign: string | null;
  sign_num?: number | null;
  position: number | null;
  abs_pos: number | null;
  house: string | null;
  retrograde: boolean;
  element?: string | null;
  quality?: string | null;
}

export interface ChartResponse {
  summary: {
    name: string | null;
    sun: ChartPlanet | null;
    moon: ChartPlanet | null;
    ascendant: ChartPlanet | null;
    midheaven: ChartPlanet | null;
  };
  planets: Record<string, ChartPlanet>;
  houses: Record<string, ChartPlanet>;
  birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    city: string;
    nation: string;
    lat: number;
    lng: number;
    tz_str: string;
  };
  svg: string;
  gender?: Gender;
}
