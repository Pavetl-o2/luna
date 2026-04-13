/**
 * Paleta y medidas del tema "Esencia Astral".
 * Inspirado en la plantilla editorial cálida, limpia y mística elegante.
 */
export const theme = {
  colors: {
    background: "#F6F2EA",
    cardBackground: "#FDFBF7",
    text: "#2A2A2A",
    textMuted: "#8A8A8A",
    textSubtle: "#6B6B6B",
    accent: "#A97A4B", // marrón dorado
    accentSoft: "#C9A474",
    cardBorder: "#DCD0BF",
    circleDecoration: "#E8D9C0",
    divider: "#A97A4B",
  },
  // React-pdf solo dispone de Courier, Helvetica y Times out of the box.
  fonts: {
    body: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique",
    boldItalic: "Helvetica-BoldOblique",
    // Para un look más editorial usamos Times en los títulos grandes.
    // Nota: react-pdf resuelve la variante italic a partir de "Times-Roman"
    // + fontStyle:"italic". Usar "Times-Italic" como fontFamily genera
    // "Could not resolve font for Times-Italic, fontStyle italic".
    serif: "Times-Roman",
    serifBold: "Times-Bold",
    serifItalic: "Times-Roman",
  },
  sizes: {
    body: 10.5,
    caption: 9,
    footerText: 8,
    label: 9,
    h1: 26,
    h2: 18,
    h3: 12,
  },
  spacing: {
    pagePadding: 50,
  },
} as const;

export const signSymbolAbbr: Record<string, string> = {
  Aries: "AR", Ari: "AR",
  Taurus: "TA", Tau: "TA",
  Gemini: "GE", Gem: "GE",
  Cancer: "CA", Can: "CA",
  Leo: "LE",
  Virgo: "VI", Vir: "VI",
  Libra: "LI", Lib: "LI",
  Scorpio: "SC", Sco: "SC",
  Sagittarius: "SA", Sag: "SA",
  Capricorn: "CP", Cap: "CP",
  Aquarius: "AQ", Aqu: "AQ",
  Pisces: "PI", Pis: "PI",
};

/** Traduce el nombre del signo de inglés a español. */
export function translateSign(sign: string | null | undefined): string {
  if (!sign) return "—";
  const map: Record<string, string> = {
    Aries: "Aries",
    Ari: "Aries",
    Taurus: "Tauro",
    Tau: "Tauro",
    Gemini: "Géminis",
    Gem: "Géminis",
    Cancer: "Cáncer",
    Can: "Cáncer",
    Leo: "Leo",
    Virgo: "Virgo",
    Vir: "Virgo",
    Libra: "Libra",
    Lib: "Libra",
    Scorpio: "Escorpio",
    Sco: "Escorpio",
    Sagittarius: "Sagitario",
    Sag: "Sagitario",
    Capricorn: "Capricornio",
    Cap: "Capricornio",
    Aquarius: "Acuario",
    Aqu: "Acuario",
    Pisces: "Piscis",
    Pis: "Piscis",
  };
  return map[sign] ?? sign;
}

/** Formato "15° 32'" a partir de una posición decimal. */
export function formatDegree(pos: number | null | undefined): string {
  if (pos == null) return "";
  const deg = Math.floor(pos);
  const min = Math.floor((pos - deg) * 60);
  return `${deg}° ${String(min).padStart(2, "0")}'`;
}
