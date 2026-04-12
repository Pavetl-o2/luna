"use client";

import { useState, type FormEvent } from "react";
import type { BirthFormValues, Gender } from "@/lib/types";

interface Props {
  onSubmit: (values: BirthFormValues) => void;
  disabled?: boolean;
  error?: string | null;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "mujer", label: "Mujer" },
  { value: "hombre", label: "Hombre" },
  { value: "no-binario", label: "No binario" },
  { value: "prefiero-no-decir", label: "Prefiero no decirlo" },
];

export default function BirthForm({ onSubmit, disabled, error }: Props) {
  const [values, setValues] = useState<BirthFormValues>({
    name: "",
    date: "",
    time: "",
    city: "",
    gender: "prefiero-no-decir",
  });

  function update<K extends keyof BirthFormValues>(key: K, value: BirthFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(values);
  }

  const canSubmit =
    values.name.trim() && values.date && values.time && values.city.trim() && !disabled;

  return (
    <form className="birth-form" onSubmit={handleSubmit}>
      <h2>Datos de nacimiento</h2>

      <label className="full">
        Nombre
        <input
          type="text"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Ej. Ana García"
          required
          disabled={disabled}
        />
      </label>

      <label>
        Fecha de nacimiento
        <input
          type="date"
          value={values.date}
          onChange={(e) => update("date", e.target.value)}
          required
          disabled={disabled}
        />
      </label>

      <label>
        Hora de nacimiento
        <input
          type="time"
          value={values.time}
          onChange={(e) => update("time", e.target.value)}
          required
          disabled={disabled}
        />
      </label>

      <label className="full">
        Ciudad de nacimiento
        <input
          type="text"
          value={values.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="Ej. Madrid, España"
          required
          disabled={disabled}
        />
      </label>

      <label className="full">
        Género
        <select
          value={values.gender}
          onChange={(e) => update("gender", e.target.value as Gender)}
          disabled={disabled}
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {error && <div className="error">{error}</div>}

      <div className="submit-row">
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {disabled ? "Calculando…" : "Calcular carta astral"}
        </button>
      </div>
    </form>
  );
}
