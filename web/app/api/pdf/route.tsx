import OpenAI from "openai";
import { Resvg } from "@resvg/resvg-js";
import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import type { ChartResponse } from "@/lib/types";
import {
  assertReadingShape,
  type Reading,
} from "@/lib/reading-schema";
import { EsenciaAstralDocument } from "@/lib/pdf/EsenciaAstralDocument";
import { translateSign, formatDegree } from "@/lib/pdf/theme";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/pdf
 *
 * Recibe { chart: ChartResponse } y devuelve un PDF con la lectura
 * astrológica generada por el LLM, siguiendo la plantilla "Esencia Astral".
 *
 * Pipeline:
 *   1. Construye el prompt con los datos de la carta.
 *   2. Llama a OpenRouter pidiendo salida en JSON estructurado.
 *   3. Convierte el SVG de la rueda natal a PNG con resvg.
 *   4. Renderiza el PDF con react-pdf.
 *   5. Devuelve el PDF como application/pdf.
 */
export async function POST(req: NextRequest) {
  try {
    const { chart } = (await req.json()) as { chart: ChartResponse };
    if (!chart) {
      return json({ error: "Falta el campo 'chart' en el body." }, 400);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return json({ error: "OPENROUTER_API_KEY no está configurada." }, 500);
    }

    // 1. Generar el reading estructurado con el LLM
    const reading = await generateReading(chart, apiKey);

    // 2. Convertir SVG → PNG data URL
    const chartImage = svgToPngDataUrl(chart.svg);

    // 3. Renderizar el PDF
    const pdfBuffer = await renderToBuffer(
      <EsenciaAstralDocument
        chart={chart}
        reading={reading}
        chartImage={chartImage}
      />
    );

    const fileName = buildFileName(chart.summary.name ?? "lectura");

    // Buffer extiende Uint8Array; lo envolvemos explícitamente para
    // que TypeScript lo acepte como BodyInit.
    const body = new Uint8Array(
      pdfBuffer.buffer,
      pdfBuffer.byteOffset,
      pdfBuffer.byteLength
    );

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/pdf] Error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: message }, 500);
  }
}

// ---------------------------------------------------------------- helpers

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "lectura";
  return `esencia-astral-${slug}.pdf`;
}

function svgToPngDataUrl(svg: string): string {
  if (!svg) return "";
  try {
    const resvg = new Resvg(svg, {
      background: "rgba(255,255,255,1)",
      fitTo: { mode: "width", value: 900 },
    });
    const pngData = resvg.render().asPng();
    const base64 = Buffer.from(pngData).toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (err) {
    console.error("[svgToPngDataUrl] Failed to convert SVG:", err);
    return "";
  }
}

async function generateReading(
  chart: ChartResponse,
  apiKey: string
): Promise<Reading> {
  const client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://luna.vercel.app",
      "X-Title": process.env.NEXT_PUBLIC_APP_NAME ?? "Luna Astro",
    },
  });

  const model =
    process.env.OPENROUTER_MODEL ?? "google/gemini-3.1-flash-lite-preview";

  const systemPrompt = [
    "Eres una astróloga profesional con formación en astrología psicológica y humanista.",
    "Redactas lecturas de cartas natales en ESPAÑOL FORMAL, con tono cálido, respetuoso, claro y evocador.",
    "Evitas el lenguaje sensacionalista, los clichés y las afirmaciones deterministas.",
    "Escribes para mujeres en un contexto de autoconocimiento.",
    "NUNCA inventas datos astrológicos: trabajas exclusivamente con las posiciones reales que recibes.",
    "DEVUELVES EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO sin marcado markdown, sin texto fuera del JSON,",
    "siguiendo exactamente el esquema solicitado por el usuario.",
  ].join(" ");

  const userPrompt = buildUserPrompt(chart);

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.75,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("El modelo no devolvió contenido.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    // Último intento: extraer el primer bloque JSON del texto
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(
        `La respuesta del modelo no es JSON válido:\n${content.slice(0, 300)}`
      );
    }
    parsed = JSON.parse(match[0]);
  }

  assertReadingShape(parsed);
  return parsed;
}

function buildUserPrompt(chart: ChartResponse): string {
  const { summary, planets, houses, birth, gender } = chart;

  const planetLine = (key: string, label: string): string => {
    const p = planets[key];
    if (!p) return `- ${label}: (sin datos)`;
    return `- ${label}: ${translateSign(p.sign)} ${formatDegree(
      p.position
    )}${p.house ? `, casa ${p.house}` : ""}${p.retrograde ? " (retrógrado)" : ""}`;
  };

  const houseLine = (key: string, num: number): string => {
    const h = houses[key];
    if (!h) return `- Casa ${num}: (sin datos)`;
    return `- Casa ${num}: cúspide en ${translateSign(h.sign)} ${formatDegree(
      h.position
    )}`;
  };

  return [
    `DATOS NATALES`,
    `Nombre: ${summary.name ?? "—"}`,
    `Género: ${gender ?? "no especificado"}`,
    `Fecha y hora: ${birth.year}-${pad(birth.month)}-${pad(birth.day)} ${pad(birth.hour)}:${pad(birth.minute)}`,
    `Lugar: ${birth.city}`,
    `Zona horaria: ${birth.tz_str}`,
    `Elemento dominante: ${summary.dominant_element ?? "no calculado"}`,
    ``,
    `POSICIONES PLANETARIAS`,
    planetLine("sun", "Sol"),
    planetLine("moon", "Luna"),
    planetLine("mercury", "Mercurio"),
    planetLine("venus", "Venus"),
    planetLine("mars", "Marte"),
    planetLine("jupiter", "Júpiter"),
    planetLine("saturn", "Saturno"),
    planetLine("uranus", "Urano"),
    planetLine("neptune", "Neptuno"),
    planetLine("pluto", "Plutón"),
    ``,
    `CASAS PRINCIPALES`,
    houseLine("first_house", 1),
    houseLine("fourth_house", 4),
    houseLine("seventh_house", 7),
    houseLine("tenth_house", 10),
    ``,
    `TAREA`,
    `Redacta una lectura astrológica personalizada siguiendo EXACTAMENTE este`,
    `esquema JSON. Cada campo de texto debe estar escrito en español formal,`,
    `ser específico de la posición astrológica indicada y conectar con experiencias`,
    `concretas de personalidad, emociones y vínculos. No describas solo "el signo":`,
    `explica CÓMO se expresa esa energía en esta persona concreta.`,
    ``,
    `Devuelve un JSON con la siguiente forma (sin markdown, sin explicaciones fuera del JSON):`,
    ``,
    JSON.stringify(READING_JSON_SCHEMA, null, 2),
    ``,
    `Requisitos de longitud orientativos:`,
    `- introduction: 2-3 frases cálidas de bienvenida, mencionando a ${summary.name ?? "la persona"}.`,
    `- threeBig.{sun|moon|ascendant}.whatItShows: 3-4 frases.`,
    `- threeBig.{sun|moon|ascendant}.keywords: exactamente 3 palabras clave cortas.`,
    `- planets.*.keyAspect: 1 frase corta describiendo un aspecto o rasgo central.`,
    `- planets.*.whatItMeans: 4-5 frases.`,
    `- planets.*.lightSide.* y shadow.*: 1 frase cada uno.`,
    `- planets.*.integrationTip: 1-2 frases accionables.`,
    `- houses.*.rulingPlanet: deducido del signo de la cúspide.`,
    `- houses.*.keyMessage: 1-2 frases.`,
    `- synthesis.centralEnergy: 4-6 frases que integren toda la lectura.`,
    `- synthesis.finalMessage: 3-4 frases cálidas y cercanas.`,
  ].join("\n");
}

function pad(n: number | null | undefined): string {
  if (n == null) return "00";
  return String(n).padStart(2, "0");
}

// Esquema documentado (no es JSON Schema formal; es una forma de ejemplo
// para que el modelo entienda la estructura exacta que esperamos).
const READING_JSON_SCHEMA = {
  introduction: "string",
  threeBig: {
    sun: { whatItShows: "string", keywords: ["string", "string", "string"] },
    moon: { whatItShows: "string", keywords: ["string", "string", "string"] },
    ascendant: {
      whatItShows: "string",
      keywords: ["string", "string", "string"],
    },
  },
  planets: {
    mercury: {
      keyAspect: "string",
      whatItMeans: "string",
      lightSide: {
        naturalTalent: "string",
        healthyExpression: "string",
        contributionToBonds: "string",
      },
      shadow: {
        defensePattern: "string",
        hardToSee: "string",
        needsToWork: "string",
      },
      integrationTip: "string",
    },
    venus: {
      keyAspect: "string",
      whatItMeans: "string",
      lightSide: {
        naturalTalent: "string",
        healthyExpression: "string",
        contributionToBonds: "string",
      },
      shadow: {
        defensePattern: "string",
        hardToSee: "string",
        needsToWork: "string",
      },
      integrationTip: "string",
    },
    mars: {
      keyAspect: "string",
      whatItMeans: "string",
      lightSide: {
        naturalTalent: "string",
        healthyExpression: "string",
        contributionToBonds: "string",
      },
      shadow: {
        defensePattern: "string",
        hardToSee: "string",
        needsToWork: "string",
      },
      integrationTip: "string",
    },
    jupiter: {
      keyAspect: "string",
      whatItMeans: "string",
      lightSide: {
        naturalTalent: "string",
        healthyExpression: "string",
        contributionToBonds: "string",
      },
      shadow: {
        defensePattern: "string",
        hardToSee: "string",
        needsToWork: "string",
      },
      integrationTip: "string",
    },
    saturn: {
      keyAspect: "string",
      whatItMeans: "string",
      lightSide: {
        naturalTalent: "string",
        healthyExpression: "string",
        contributionToBonds: "string",
      },
      shadow: {
        defensePattern: "string",
        hardToSee: "string",
        needsToWork: "string",
      },
      integrationTip: "string",
    },
  },
  houses: {
    house1: { rulingPlanet: "string", keyMessage: "string" },
    house4: { rulingPlanet: "string", keyMessage: "string" },
    house7: { rulingPlanet: "string", keyMessage: "string" },
    house10: { rulingPlanet: "string", keyMessage: "string" },
  },
  synthesis: {
    centralEnergy: "string",
    finalMessage: "string",
  },
};
