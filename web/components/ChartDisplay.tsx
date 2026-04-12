"use client";

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
}: {
  label: string;
  planet: ChartPlanet | null | undefined;
}) {
  return (
    <div className="summary-card">
      <div className="label">{label}</div>
      <div className="value">{planet?.sign ?? "—"}</div>
      <div className="position">{formatPosition(planet)}</div>
    </div>
  );
}

export default function ChartDisplay({ chart }: Props) {
  function handleGeneratePdf() {
    window.alert(
      "La generación del análisis en PDF estará disponible en la próxima fase."
    );
  }

  return (
    <section className="chart-display">
      <h2>Carta natal de {chart.summary.name ?? ""}</h2>

      <div className="chart-summary">
        <SummaryCard label="Sol" planet={chart.summary.sun} />
        <SummaryCard label="Luna" planet={chart.summary.moon} />
        <SummaryCard label="Ascendente" planet={chart.summary.ascendant} />
        <SummaryCard label="Medio cielo" planet={chart.summary.midheaven} />
      </div>

      {chart.svg ? (
        <div
          className="chart-svg-wrapper"
          dangerouslySetInnerHTML={{ __html: chart.svg }}
        />
      ) : (
        <div className="error">No se pudo generar el gráfico SVG.</div>
      )}

      <div className="actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleGeneratePdf}
        >
          Generar análisis PDF
        </button>
      </div>
    </section>
  );
}
