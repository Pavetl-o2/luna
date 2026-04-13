"use client";

import { useState } from "react";
import BirthForm from "@/components/BirthForm";
import ChartDisplay from "@/components/ChartDisplay";
import { geocodeCity } from "@/lib/geocode";
import type { BirthFormValues, ChartResponse } from "@/lib/types";

export default function HomePage() {
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: BirthFormValues) {
    setError(null);
    setChart(null);
    setLoading(true);
    try {
      // 1. Geocodificar la ciudad (lat/lng). La timezone la resuelve
      //    el backend a partir de lat/lng con timezonefinder.
      const geo = await geocodeCity(values.city);

      // 2. Separar fecha y hora
      const [year, month, day] = values.date.split("-").map(Number);
      const [hour, minute] = values.time.split(":").map(Number);

      // 3. Llamar a la función Python /api/chart
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          year,
          month,
          day,
          hour,
          minute,
          lat: geo.lat,
          lng: geo.lng,
          city: geo.display_name,
          nation: geo.country_code,
          gender: values.gender,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(payload.error || `Error ${res.status}`);
      }

      const data = (await res.json()) as ChartResponse;
      setChart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BirthForm onSubmit={handleSubmit} disabled={loading} error={error} />
      {loading && <div className="loading">Calculando tu carta astral…</div>}
      {chart && <ChartDisplay chart={chart} />}
    </>
  );
}
