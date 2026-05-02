/**
 * Paleta y medidas del tema "Luna Estelar".
 * Diseño oscuro, cósmico y elegante — navy + oro cálido.
 * Paleta: Fondo #1E2742 · Acento #D9C18A · Texto #F7F1E8
 */
export const theme = {
  colors: {
    background: "#1E2742",
    cardBackground: "#283656",
    innerCardBg: "#1E2742",
    text: "#F7F1E8",
    textMuted: "#9BA3B7",
    textSubtle: "#C0C5D0",
    accent: "#D9C18A",
    accentSoft: "#C4AD76",
    headerBar: "#D9C18A",
    headerBarText: "#1E2742",
    cardBorder: "#3A4A6B",
    pageBorder: "#4A5A7B",
    divider: "#D9C18A",
    pillBg: "#D9C18A",
    pillText: "#1E2742",
  },
  fonts: {
    body: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique",
    boldItalic: "Helvetica-BoldOblique",
    serif: "Times-Roman",
    serifBold: "Times-Bold",
    serifItalic: "Times-Roman",
  },
  sizes: {
    body: 10.5,
    caption: 9,
    footerText: 8,
    label: 9,
    h1: 24,
    h2: 18,
    h3: 12,
  },
  spacing: {
    pagePadding: 40,
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
