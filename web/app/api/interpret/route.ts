import OpenAI from "openai";
import type { NextRequest } from "next/server";
import type { ChartResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/interpret
 *
 * Recibe un ChartResponse (el mismo objeto devuelto por /api/chart) y
 * devuelve una interpretación astrológica en streaming usando OpenRouter.
 *
 * Esta ruta queda lista para la fase 2 (generación de PDF con la lectura).
 * Actualmente no se llama desde la UI, pero funciona end-to-end si se le
 * envía un POST manualmente.
 */
export async function POST(req: NextRequest) {
  try {
    const chart = (await req.json()) as ChartResponse;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY no está configurada." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": process.env.NEXT_PUBLIC_APP_NAME ?? "Luna Astro",
      },
    });

    const model = process.env.OPENROUTER_MODEL ?? "google/gemini-3.1-flash-lite-preview";

    const systemPrompt = [
      "Eres un astrólogo profesional con formación en astrología psicológica y humanista.",
      "Escribe siempre en español formal, con tono respetuoso, claro y evocador.",
      "Evitas el lenguaje sensacionalista y las afirmaciones deterministas.",
      "Estructuras tu análisis en secciones claras: introducción general, Sol y esencia,",
      "Luna y mundo emocional, Ascendente y presentación, planetas personales, aspectos",
      "destacados, casas relevantes y cierre integrador.",
    ].join(" ");

    const userPrompt = buildUserPrompt(chart);

    const stream = await client.chat.completions.create({
      model,
      stream: true,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function buildUserPrompt(chart: ChartResponse): string {
  const { summary, planets, houses, birth, gender } = chart;

  const planetsList = Object.values(planets)
    .filter((p) => p.name && p.sign)
    .map(
      (p) =>
        `- ${p.name}: ${p.sign} ${formatDeg(p.position)}${
          p.house ? `, casa ${p.house}` : ""
        }${p.retrograde ? " (retrógrado)" : ""}`
    )
    .join("\n");

  const housesList = Object.entries(houses)
    .filter(([, h]) => h.sign)
    .map(([key, h]) => `- ${key}: cúspide en ${h.sign} ${formatDeg(h.position)}`)
    .join("\n");

  return [
    `Datos de nacimiento:`,
    `- Nombre: ${summary.name ?? "—"}`,
    `- Género: ${gender ?? "no especificado"}`,
    `- Fecha: ${birth.year}-${pad(birth.month)}-${pad(birth.day)} ${pad(birth.hour)}:${pad(birth.minute)}`,
    `- Lugar: ${birth.city} (${birth.nation})`,
    `- Coordenadas: ${birth.lat}, ${birth.lng}`,
    `- Zona horaria: ${birth.tz_str}`,
    ``,
    `Puntos principales:`,
    `- Sol: ${summary.sun?.sign ?? "—"} ${formatDeg(summary.sun?.position)}`,
    `- Luna: ${summary.moon?.sign ?? "—"} ${formatDeg(summary.moon?.position)}`,
    `- Ascendente: ${summary.ascendant?.sign ?? "—"} ${formatDeg(summary.ascendant?.position)}`,
    `- Medio cielo: ${summary.midheaven?.sign ?? "—"} ${formatDeg(summary.midheaven?.position)}`,
    ``,
    `Planetas:`,
    planetsList,
    ``,
    `Casas:`,
    housesList,
    ``,
    `Por favor, redacta una interpretación astrológica completa y personalizada de esta carta natal.`,
  ].join("\n");
}

function pad(n: number | null | undefined): string {
  if (n == null) return "00";
  return String(n).padStart(2, "0");
}

function formatDeg(pos: number | null | undefined): string {
  if (pos == null) return "";
  const deg = Math.floor(pos);
  const min = Math.floor((pos - deg) * 60);
  return `${deg}° ${pad(min)}'`;
}
