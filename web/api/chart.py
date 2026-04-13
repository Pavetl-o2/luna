"""
Vercel Python serverless function: /api/chart

Recibe los datos de nacimiento (ya geocodificados desde el frontend con
lat/lng/tz_str) y devuelve la carta natal calculada con Kerykeion:
    - SVG de la rueda astrológica
    - Resumen con los puntos principales (Sol, Luna, Ascendente, MC)
    - Listado completo de planetas con signo, grado, casa y retrogradación
    - Listado de casas con signo y cúspide

Contrato esperado del request (JSON POST):
{
  "name": "Ana",
  "year": 1992,
  "month": 7,
  "day": 15,
  "hour": 14,
  "minute": 30,
  "lat": 40.4168,
  "lng": -3.7038,
  "tz_str": "Europe/Madrid",
  "city": "Madrid",
  "nation": "ES",
  "gender": "mujer"
}
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import tempfile
import traceback

# TimezoneFinder es pesado de instanciar; lo hacemos una sola vez
# a nivel de módulo para que el lambda warm lo reutilice.
_tf_instance = None


def _get_timezone_finder():
    global _tf_instance
    if _tf_instance is None:
        from timezonefinder import TimezoneFinder
        _tf_instance = TimezoneFinder()
    return _tf_instance


def _resolve_timezone(lat: float, lng: float) -> str:
    tf = _get_timezone_finder()
    tz = tf.timezone_at(lat=lat, lng=lng)
    if not tz:
        # Fallback defensivo: si el punto cae en aguas internacionales
        # o en una zona sin cobertura, usamos UTC.
        tz = "UTC"
    return tz


def _safe_get(obj, key, default=None):
    """Acceso tolerante: soporta tanto dicts como objetos Kerykeion."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _planet_to_dict(p):
    if p is None:
        return None
    return {
        "name": _safe_get(p, "name"),
        "sign": _safe_get(p, "sign"),
        "sign_num": _safe_get(p, "sign_num"),
        "position": _safe_get(p, "position"),
        "abs_pos": _safe_get(p, "abs_pos"),
        "house": _safe_get(p, "house"),
        "retrograde": bool(_safe_get(p, "retrograde", False)),
        "element": _safe_get(p, "element"),
        "quality": _safe_get(p, "quality"),
    }


def _extract_chart_data(subject):
    """Extrae los datos relevantes del AstrologicalSubject de Kerykeion."""

    planet_attrs = [
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "uranus", "neptune", "pluto",
        "mean_node", "true_node", "mean_south_node", "true_south_node",
        "chiron", "mean_lilith",
    ]
    planets = {}
    for attr in planet_attrs:
        if hasattr(subject, attr):
            val = getattr(subject, attr)
            if val is not None:
                planets[attr] = _planet_to_dict(val)

    house_attrs = [
        "first_house", "second_house", "third_house", "fourth_house",
        "fifth_house", "sixth_house", "seventh_house", "eighth_house",
        "ninth_house", "tenth_house", "eleventh_house", "twelfth_house",
    ]
    houses = {}
    for attr in house_attrs:
        if hasattr(subject, attr):
            val = getattr(subject, attr)
            if val is not None:
                houses[attr] = _planet_to_dict(val)

    # Puntos principales para el resumen
    asc = planets.get("first_house") or houses.get("first_house")
    mc = planets.get("tenth_house") or houses.get("tenth_house")

    summary = {
        "name": getattr(subject, "name", None),
        "sun": planets.get("sun"),
        "moon": planets.get("moon"),
        "ascendant": houses.get("first_house"),
        "midheaven": houses.get("tenth_house"),
    }

    return {
        "summary": summary,
        "planets": planets,
        "houses": houses,
        "birth": {
            "year": getattr(subject, "year", None),
            "month": getattr(subject, "month", None),
            "day": getattr(subject, "day", None),
            "hour": getattr(subject, "hour", None),
            "minute": getattr(subject, "minute", None),
            "city": getattr(subject, "city", None),
            "nation": getattr(subject, "nation", None),
            "lat": getattr(subject, "lat", None),
            "lng": getattr(subject, "lng", None),
            "tz_str": getattr(subject, "tz_str", None),
        },
    }


def _generate_svg(subject):
    """
    Genera el SVG de la carta usando KerykeionChartSVG.

    En función de la versión, la API puede exponer ``makeTemplate()`` que
    devuelve el SVG como string, o ``makeSVG()`` que lo escribe en disco.
    Probamos ambas.
    """
    from kerykeion import KerykeionChartSVG

    tmpdir = tempfile.mkdtemp(prefix="kery_")
    chart = KerykeionChartSVG(subject, new_output_directory=tmpdir)

    # Ruta 1: makeTemplate (devuelve string sin escribir a disco)
    if hasattr(chart, "makeTemplate"):
        try:
            svg_str = chart.makeTemplate()
            if isinstance(svg_str, str) and svg_str.strip().startswith("<"):
                return svg_str
        except Exception:
            pass

    # Ruta 2: makeSVG → escribe a disco → leemos el resultado
    if hasattr(chart, "makeSVG"):
        try:
            chart.makeSVG()
        except Exception:
            pass
        for fname in os.listdir(tmpdir):
            if fname.lower().endswith(".svg"):
                with open(os.path.join(tmpdir, fname), "r", encoding="utf-8") as fp:
                    return fp.read()

    return ""


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw.decode("utf-8"))

            # Validación básica (tz_str es opcional: si no viene, lo derivamos
            # del par lat/lng con timezonefinder)
            required = ["name", "year", "month", "day", "hour", "minute", "lat", "lng"]
            missing = [k for k in required if k not in data]
            if missing:
                return self._send_json(400, {"error": f"Faltan campos: {', '.join(missing)}"})

            lat = float(data["lat"])
            lng = float(data["lng"])
            tz_str = data.get("tz_str")
            if not tz_str:
                tz_str = _resolve_timezone(lat, lng)

            from kerykeion import AstrologicalSubject

            subject = AstrologicalSubject(
                name=str(data["name"]),
                year=int(data["year"]),
                month=int(data["month"]),
                day=int(data["day"]),
                hour=int(data["hour"]),
                minute=int(data["minute"]),
                lat=lat,
                lng=lng,
                tz_str=str(tz_str),
                city=str(data.get("city") or "Unknown"),
                nation=str(data.get("nation") or "XX"),
                online=False,
            )

            chart_data = _extract_chart_data(subject)
            svg = _generate_svg(subject)

            chart_data["svg"] = svg
            chart_data["gender"] = data.get("gender")

            return self._send_json(200, chart_data)

        except Exception as exc:
            return self._send_json(500, {
                "error": str(exc),
                "trace": traceback.format_exc(),
            })
