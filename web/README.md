# Luna — Web (carta astral + IA)

Aplicación web para calcular cartas natales con **Kerykeion** (Swiss Ephemeris)
y generar interpretaciones astrológicas con **OpenRouter**.

Stack:

- **Next.js 15** (App Router, React 19) — frontend + Route Handlers en Node.
- **Python serverless function** (Vercel) — cálculo astrológico con Kerykeion.
- **OpenRouter** — interpretación LLM con streaming.
- **@react-pdf/renderer** — generación del PDF (fase 2).

## Arquitectura

```
Next.js (Vercel) ─┬─▶ api/chart.py          Python serverless + Kerykeion
                  ├─▶ app/api/interpret     Node + OpenRouter (streaming)
                  └─▶ app/api/pdf           Placeholder (fase 2)
```

- El usuario rellena el formulario (nombre, fecha, hora, ciudad, género).
- El frontend geocodifica la ciudad con Nominatim y obtiene la timezone
  de timeapi.io.
- Llama a `/api/chart` con lat/lng/tz_str → recibe SVG + datos de la carta.
- El botón "Generar análisis PDF" queda preparado para la fase 2.

## Desarrollo local

Requisitos: Node 20+, Python 3.11+, `pip`.

```bash
cd web
cp .env.local.example .env.local
# edita .env.local con tu OPENROUTER_API_KEY

npm install
# Para probar la función Python en local necesitas Vercel CLI:
# npm i -g vercel
# vercel dev
```

Alternativamente, `npm run dev` arranca solo el frontend Next.js; las
peticiones a `/api/chart` fallarán porque esa función solo existe en el
runtime de Vercel.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `OPENROUTER_API_KEY` | API key de OpenRouter. |
| `OPENROUTER_MODEL` | Slug del modelo a usar (default: `google/gemini-3.1-flash-lite-preview`). |
| `NEXT_PUBLIC_APP_NAME` | Nombre visible de la app (cabecera OpenRouter). |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (cabecera OpenRouter). |

## Despliegue en Vercel

1. En Vercel → **New Project** → importa el repo `pavetl-o2/luna`.
2. **Root Directory**: `web`.
3. Framework preset: **Next.js** (auto-detectado).
4. **Environment Variables**: añade `OPENROUTER_API_KEY` y opcionalmente
   `OPENROUTER_MODEL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL`.
5. Deploy.

Vercel detectará `web/api/chart.py` + `web/requirements.txt` y lo desplegará
como función Python serverless automáticamente.

## Fase 2 (pendiente)

- [ ] Diseño del PDF (el usuario proporcionará el diseño).
- [ ] Wiring del botón `Generar análisis PDF`: llama a `/api/interpret`
      (ya implementado, en streaming) + `/api/pdf` que compone el documento.
- [ ] Cache de interpretaciones por hash de carta.
