/**
 * Esquema de la "lectura" (reading) que genera el LLM.
 *
 * Este objeto JSON mapea 1:1 a los campos de la plantilla
 * "Esencia Astral" y se inyecta en el PDF por el renderizador.
 * El LLM DEBE devolver exactamente esta forma para que la
 * composición del PDF funcione sin parches.
 */

export interface BigThreeCardReading {
  /** Explicación breve (2-3 frases) de qué muestra esta posición. */
  whatItShows: string;
  /** 3 palabras clave cortas. */
  keywords: [string, string, string];
}

export interface PlanetPageReading {
  /** Ej: "Conjunción con Venus" o "Trígono con Luna". */
  keyAspect: string;
  /** Párrafo explicativo (3-5 frases) del significado. */
  whatItMeans: string;
  lightSide: {
    naturalTalent: string;
    healthyExpression: string;
    contributionToBonds: string;
  };
  shadow: {
    defensePattern: string;
    hardToSee: string;
    needsToWork: string;
  };
  /** Consejo cálido y accionable (1-2 frases). */
  integrationTip: string;
}

export interface HouseReading {
  /** Signo o planeta en la cúspide, en lenguaje accesible. */
  rulingPlanet: string;
  /** Mensaje clave (1-2 frases). */
  keyMessage: string;
}

export interface Reading {
  /** Párrafo de bienvenida personalizado (2-3 frases). */
  introduction: string;

  threeBig: {
    sun: BigThreeCardReading;
    moon: BigThreeCardReading;
    ascendant: BigThreeCardReading;
  };

  planets: {
    mercury: PlanetPageReading;
    venus: PlanetPageReading;
    mars: PlanetPageReading;
    jupiter: PlanetPageReading;
    saturn: PlanetPageReading;
  };

  houses: {
    house1: HouseReading;
    house4: HouseReading;
    house7: HouseReading;
    house10: HouseReading;
  };

  synthesis: {
    /** Párrafo que integra la esencia (4-6 frases). */
    centralEnergy: string;
    /** Mensaje final cálido (3-4 frases). */
    finalMessage: string;
  };
}

/** Utilidad para verificar rápidamente que el LLM devolvió la forma correcta. */
export function assertReadingShape(obj: unknown): asserts obj is Reading {
  if (!obj || typeof obj !== "object") {
    throw new Error("El reading no es un objeto.");
  }
  const r = obj as Record<string, unknown>;
  const required = [
    "introduction",
    "threeBig",
    "planets",
    "houses",
    "synthesis",
  ];
  for (const key of required) {
    if (!(key in r)) {
      throw new Error(`El reading no contiene el campo "${key}".`);
    }
  }
}
