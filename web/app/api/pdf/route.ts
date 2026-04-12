import type { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/pdf
 *
 * Placeholder para la fase 2: recibirá el objeto de la carta + la
 * interpretación generada por /api/interpret y devolverá un PDF con el
 * diseño que definamos.
 *
 * De momento responde con 501 Not Implemented.
 */
export async function POST(_req: NextRequest) {
  return new Response(
    JSON.stringify({
      error:
        "La generación del análisis en PDF estará disponible en la próxima fase.",
    }),
    {
      status: 501,
      headers: { "Content-Type": "application/json" },
    }
  );
}
