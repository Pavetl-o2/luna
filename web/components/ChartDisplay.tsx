"use client";

import { useState } from "react";
import type { ChartPlanet, ChartResponse } from "@/lib/types";

interface Props {
  chart: ChartResponse;
}

function formatPosition(planet: ChartPlanet | null | undefined): string {
  if (!planet || planet.position == null) return "—";
  const deg = Math.floor(planet.position);
  const min = Math.floor((planet.position - deg) * 60);
  return `${deg}° ${String(min).padStart(2, "0")}'`;
}

function SummaryCard({
  label,
  planet,
  customValue,
}: {
  label: string;
  planet?: ChartPlanet | null;
  customValue?: string;
}) {
  return (
    <div className="summary-card">
      <div className="label">{label}</div>
      <div className="value">{customValue ?? planet?.sign ?? "—"}</div>
      {planet && <div className="position">{formatPosition(planet)}</div>}
    </div>
  );
}

export default function ChartDisplay({ chart }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePdf() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(payload.error || `Error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const name = (chart.summary.name || "lectura")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      a.download = `esencia-astral-${name || "lectura"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="chart-display">
      <h2>Carta natal de {chart.summary.name ?? ""}</h2>

      <div className="chart-summary">
        <SummaryCard label="Sol" planet={chart.summary.sun} />
        <SummaryCard label="Luna" planet={chart.summary.moon} />
        <SummaryCard label="Ascendente" planet={chart.summary.ascendant} />
        <SummaryCard
          label="Elemento dominante"
          customValue={chart.summary.dominant_element ?? "—"}
        />
      </div>

      {chart.svg ? (
        <div
          className="chart-svg-wrapper"
          dangerouslySetInnerHTML={{ __html: chart.svg }}
        />
      ) : (
        <div className="error">No se pudo generar el gráfico SVG.</div>
      )}

      {error && <div className="error" style={{ marginTop: "1rem" }}>{error}</div>}

      <div className="actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleGeneratePdf}
          disabled={generating}
        >
          {generating
            ? "Generando análisis… (puede tardar hasta 1 minuto)"
            : "Generar análisis PDF"}
        </button>
      </div>
    </section>
  );
}
