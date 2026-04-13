/* eslint-disable react/no-unescaped-entities */
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Circle,
  Path,
} from "@react-pdf/renderer";
import type { ChartPlanet, ChartResponse } from "../types";
import type {
  BigThreeCardReading,
  HouseReading,
  PlanetPageReading,
  Reading,
} from "../reading-schema";
import { theme, translateSign, formatDegree } from "./theme";

const c = theme.colors;
const s = theme.sizes;

const styles = StyleSheet.create({
  page: {
    backgroundColor: c.background,
    paddingTop: theme.spacing.pagePadding,
    paddingBottom: theme.spacing.pagePadding + 20,
    paddingHorizontal: theme.spacing.pagePadding,
    fontFamily: theme.fonts.body,
    fontSize: s.body,
    color: c.text,
    position: "relative",
  },
  circleTopRight: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: c.circleDecoration,
  },
  circleBottomLeft: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: c.circleDecoration,
  },
  topDivider: {
    width: 220,
    height: 1.2,
    backgroundColor: c.divider,
    marginBottom: 22,
  },
  h1: {
    fontFamily: theme.fonts.serifBold,
    fontSize: s.h1,
    marginBottom: 10,
    color: c.text,
  },
  h2Label: {
    fontFamily: theme.fonts.bold,
    fontSize: s.label,
    color: c.accent,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  intro: {
    fontSize: s.body,
    lineHeight: 1.55,
    marginBottom: 18,
    color: c.textSubtle,
  },
  card: {
    borderWidth: 1,
    borderColor: c.cardBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: s.label,
    color: c.accent,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: s.body,
    lineHeight: 1.5,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: s.caption,
    color: c.textMuted,
    marginBottom: 2,
  },
  value: {
    fontSize: s.body,
    color: c.text,
    marginBottom: 6,
    fontFamily: theme.fonts.bold,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: theme.spacing.pagePadding,
    right: theme.spacing.pagePadding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: s.footerText,
    color: c.textMuted,
  },
  caption: {
    fontSize: s.caption,
    color: c.textMuted,
    fontStyle: "italic",
    lineHeight: 1.5,
    marginTop: 16,
  },
  planetCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: c.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  planetAbbr: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: c.accent,
  },
  planetName: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: c.accent,
    marginBottom: 8,
    textAlign: "center",
  },
  whatItShowsHeading: {
    fontFamily: theme.fonts.bold,
    fontSize: s.body,
    marginBottom: 4,
  },
  keywordsHeading: {
    fontFamily: theme.fonts.bold,
    fontSize: s.body,
    marginTop: 6,
    marginBottom: 2,
  },
  keyword: {
    fontSize: s.caption,
    color: c.textMuted,
    lineHeight: 1.5,
  },
  heroCircle: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginTop: 60,
    marginBottom: 80,
  },
  coverLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: c.accent,
    letterSpacing: 2,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  coverTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 36,
    textAlign: "center",
    color: c.text,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 11,
    color: c.textSubtle,
    textAlign: "center",
    marginBottom: 20,
  },
  coverDivider: {
    width: 120,
    height: 1.2,
    backgroundColor: c.accent,
    alignSelf: "center",
    marginBottom: 18,
  },
  coverName: {
    fontFamily: theme.fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 14,
    color: c.textSubtle,
    textAlign: "center",
    marginBottom: 40,
  },
  coverTagline: {
    position: "absolute",
    bottom: 55,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: c.textMuted,
  },
});

// ------------------------------ helpers ------------------------------

function PageDecorations() {
  return (
    <>
      <View style={styles.circleTopRight} fixed />
      <View style={styles.circleBottomLeft} fixed />
    </>
  );
}

function PageFooter({ pageNumber }: { pageNumber: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Esencia Astral · plantilla editorial</Text>
      <Text>{pageNumber}</Text>
    </View>
  );
}

function StandardPage({
  pageNumber,
  children,
}: {
  pageNumber: string;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <PageDecorations />
      <View style={styles.topDivider} />
      {children}
      <PageFooter pageNumber={pageNumber} />
    </Page>
  );
}

function PlanetBadge({ abbr, label }: { abbr: string; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={styles.planetCircle}>
        <Text style={styles.planetAbbr}>{abbr}</Text>
      </View>
      <Text style={styles.planetName}>{label}</Text>
    </View>
  );
}

// ------------------------------ pages ------------------------------

function CoverPage({ clientName }: { clientName: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <PageDecorations />

      {/* Estrella de 8 puntas dentro de un círculo */}
      <View style={styles.heroCircle}>
        <Svg width="140" height="140" viewBox="0 0 140 140">
          <Circle cx="70" cy="70" r="55" stroke={c.accent} strokeWidth="1.2" fill="none" />
          <Path
            d="M70 38 L74 66 L102 70 L74 74 L70 102 L66 74 L38 70 L66 66 Z"
            fill={c.accent}
          />
        </Svg>
      </View>

      <Text style={styles.coverLabel}>ESENCIA ASTRAL</Text>
      <Text style={styles.coverTitle}>Carta Astral Natal</Text>
      <Text style={styles.coverSubtitle}>
        Lectura personalizada en PDF con enfoque de autoconocimiento
      </Text>
      <View style={styles.coverDivider} />
      <Text style={styles.coverName}>{clientName}</Text>

      <Text style={styles.coverTagline}>
        Diseño editorial cálido, limpio y místico elegante
      </Text>
    </Page>
  );
}

function WelcomePage({
  chart,
  reading,
  chartImage,
}: {
  chart: ChartResponse;
  reading: Reading;
  chartImage: string;
}) {
  const birth = chart.birth;
  const dateStr = `${String(birth.day).padStart(2, "0")}/${String(
    birth.month
  ).padStart(2, "0")}/${birth.year}`;
  const timeStr = `${String(birth.hour).padStart(2, "0")}:${String(
    birth.minute
  ).padStart(2, "0")}`;

  return (
    <StandardPage pageNumber="02">
      <Text style={styles.h1}>Bienvenida y datos natales</Text>
      <Text style={styles.intro}>{reading.introduction}</Text>

      <View style={styles.row}>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>DATOS DE NACIMIENTO</Text>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{chart.summary.name ?? "—"}</Text>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{dateStr}</Text>
          <Text style={styles.label}>Hora</Text>
          <Text style={styles.value}>{timeStr}</Text>
          <Text style={styles.label}>Lugar</Text>
          <Text style={styles.value}>{birth.city}</Text>
          <Text style={styles.label}>Zona horaria</Text>
          <Text style={styles.value}>{birth.tz_str}</Text>
        </View>

        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>MAPA NATAL</Text>
          {chartImage ? (
            <Image src={chartImage} style={{ width: "100%", height: 200, objectFit: "contain" }} />
          ) : (
            <Text style={{ ...styles.caption, textAlign: "center", marginTop: 60 }}>
              Gráfico no disponible
            </Text>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TUS TRES GRANDES</Text>
        <View style={[styles.row, { marginTop: 4 }]}>
          <ThreeGrandCell
            label="Sol"
            planet={chart.summary.sun}
          />
          <ThreeGrandCell
            label="Luna"
            planet={chart.summary.moon}
          />
          <ThreeGrandCell
            label="Ascendente"
            planet={chart.summary.ascendant}
          />
          <ThreeGrandCell
            label="Elemento dominante"
            customValue={chart.summary.dominant_element ?? "—"}
          />
        </View>
      </View>

      <Text style={styles.caption}>
        En esta apertura presentas los datos base y el tono de la lectura. Debe
        sentirse clara, ordenada y profesional desde la primera página.
      </Text>
    </StandardPage>
  );
}

function ThreeGrandCell({
  label,
  planet,
  customValue,
}: {
  label: string;
  planet?: ChartPlanet | null;
  customValue?: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {customValue ?? translateSign(planet?.sign)}
      </Text>
      {planet && planet.position != null ? (
        <Text style={{ fontSize: s.caption, color: c.textMuted }}>
          {formatDegree(planet.position)}
        </Text>
      ) : null}
    </View>
  );
}

function BigThreePage({
  chart,
  reading,
}: {
  chart: ChartResponse;
  reading: Reading;
}) {
  return (
    <StandardPage pageNumber="03">
      <Text style={styles.h1}>Tus tres grandes</Text>
      <Text style={styles.intro}>
        Esta sección resume la esencia central de la persona. Conecta cada
        energía con experiencias concretas de personalidad, emociones y
        vínculos.
      </Text>

      <View style={[styles.row, { marginTop: 14 }]}>
        <BigThreeColumn
          abbr="SO"
          label="Sol"
          sign={translateSign(chart.summary.sun?.sign)}
          reading={reading.threeBig.sun}
        />
        <BigThreeColumn
          abbr="LU"
          label="Luna"
          sign={translateSign(chart.summary.moon?.sign)}
          reading={reading.threeBig.moon}
        />
        <BigThreeColumn
          abbr="AC"
          label="Ascendente"
          sign={translateSign(chart.summary.ascendant?.sign)}
          reading={reading.threeBig.ascendant}
        />
      </View>

      <Text style={styles.caption}>
        Tip de redacción: evita describir solo el signo. Conecta siempre la
        energía con experiencias concretas de personalidad, emociones y
        vínculos.
      </Text>
    </StandardPage>
  );
}

function BigThreeColumn({
  abbr,
  label,
  sign,
  reading,
}: {
  abbr: string;
  label: string;
  sign: string;
  reading: BigThreeCardReading;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <PlanetBadge abbr={abbr} label={label} />
      <View style={[styles.card, { alignSelf: "stretch" }]}>
        <Text style={{ ...styles.label, textAlign: "center" }}>En {sign}</Text>
        <Text style={styles.whatItShowsHeading}>Qué muestra</Text>
        <Text style={styles.cardBody}>{reading.whatItShows}</Text>
        <Text style={styles.keywordsHeading}>Claves</Text>
        {reading.keywords.map((kw, i) => (
          <Text key={i} style={styles.keyword}>
            {kw}
          </Text>
        ))}
      </View>
    </View>
  );
}

function PlanetPage({
  pageNumber,
  abbr,
  planetName,
  planet,
  reading,
}: {
  pageNumber: string;
  abbr: string;
  planetName: string;
  planet: ChartPlanet | null | undefined;
  reading: PlanetPageReading;
}) {
  const sign = translateSign(planet?.sign);
  const house = planet?.house ?? "—";

  return (
    <StandardPage pageNumber={pageNumber}>
      <Text style={styles.h1}>{planetName}</Text>
      <Text style={styles.intro}>
        Esta sección está dedicada a explorar cómo se expresa {planetName} en
        tu carta natal. El objetivo es que se sienta útil, profunda y fácil de
        leer.
      </Text>

      <View style={[styles.row, { alignItems: "flex-start", marginBottom: 14 }]}>
        <View style={{ width: 90, alignItems: "center" }}>
          <PlanetBadge abbr={abbr} label={planetName} />
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.cardTitle}>UBICACIÓN</Text>
          <Text style={styles.label}>{planetName} en</Text>
          <Text style={styles.value}>
            {sign}
            {planet?.position != null ? `  ·  ${formatDegree(planet.position)}` : ""}
            {planet?.retrograde ? "  (retrógrado)" : ""}
          </Text>
          <Text style={styles.label}>Casa</Text>
          <Text style={styles.value}>{house}</Text>
          <Text style={styles.label}>Aspecto clave</Text>
          <Text style={styles.value}>{reading.keyAspect}</Text>
        </View>
      </View>

      <Text style={styles.whatItShowsHeading}>Qué significa</Text>
      <Text style={{ ...styles.cardBody, marginBottom: 14 }}>
        {reading.whatItMeans}
      </Text>

      <View style={styles.row}>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>LADO LUZ</Text>
          <Text style={styles.label}>Talento natural</Text>
          <Text style={styles.cardBody}>{reading.lightSide.naturalTalent}</Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Forma sana de expresarlo</Text>
          <Text style={styles.cardBody}>
            {reading.lightSide.healthyExpression}
          </Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Qué le suma en vínculos</Text>
          <Text style={styles.cardBody}>
            {reading.lightSide.contributionToBonds}
          </Text>
        </View>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>RETO O SOMBRA</Text>
          <Text style={styles.label}>Patrón de defensa</Text>
          <Text style={styles.cardBody}>{reading.shadow.defensePattern}</Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Lo que le cuesta mirar</Text>
          <Text style={styles.cardBody}>{reading.shadow.hardToSee}</Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Qué necesita trabajar</Text>
          <Text style={styles.cardBody}>{reading.shadow.needsToWork}</Text>
        </View>
      </View>

      <Text style={[styles.whatItShowsHeading, { marginTop: 14 }]}>
        Consejo integrador
      </Text>
      <Text style={styles.cardBody}>{reading.integrationTip}</Text>
    </StandardPage>
  );
}

function HousesPage({ reading }: { reading: Reading }) {
  const houses: Array<{
    num: string;
    title: string;
    theme: string;
    data: HouseReading;
  }> = [
    {
      num: "CASA 1",
      title: "Casa 1",
      theme: "Identidad, presencia y forma de iniciar",
      data: reading.houses.house1,
    },
    {
      num: "CASA 4",
      title: "Casa 4",
      theme: "Raíces, hogar y vida privada",
      data: reading.houses.house4,
    },
    {
      num: "CASA 7",
      title: "Casa 7",
      theme: "Pareja y manera de vincularse",
      data: reading.houses.house7,
    },
    {
      num: "CASA 10",
      title: "Casa 10",
      theme: "Vocación, imagen y dirección",
      data: reading.houses.house10,
    },
  ];

  return (
    <StandardPage pageNumber="09">
      <Text style={styles.h1}>Casas y áreas de vida</Text>
      <Text style={styles.intro}>
        Resumen temático de las casas angulares. Cada una traduce una energía
        concreta de la vida cotidiana.
      </Text>

      <View style={styles.row}>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>{houses[0].num}</Text>
          <Text style={[styles.cardBody, { marginBottom: 6 }]}>{houses[0].theme}</Text>
          <Text style={styles.label}>Planeta regente</Text>
          <Text style={styles.cardBody}>{houses[0].data.rulingPlanet}</Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Mensaje clave</Text>
          <Text style={styles.cardBody}>{houses[0].data.keyMessage}</Text>
        </View>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>{houses[1].num}</Text>
          <Text style={[styles.cardBody, { marginBottom: 6 }]}>{houses[1].theme}</Text>
          <Text style={styles.label}>Planeta regente</Text>
          <Text style={styles.cardBody}>{houses[1].data.rulingPlanet}</Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Mensaje clave</Text>
          <Text style={styles.cardBody}>{houses[1].data.keyMessage}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>{houses[2].num}</Text>
          <Text style={[styles.cardBody, { marginBottom: 6 }]}>{houses[2].theme}</Text>
          <Text style={styles.label}>Planeta regente</Text>
          <Text style={styles.cardBody}>{houses[2].data.rulingPlanet}</Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Mensaje clave</Text>
          <Text style={styles.cardBody}>{houses[2].data.keyMessage}</Text>
        </View>
        <View style={[styles.card, styles.col]}>
          <Text style={styles.cardTitle}>{houses[3].num}</Text>
          <Text style={[styles.cardBody, { marginBottom: 6 }]}>{houses[3].theme}</Text>
          <Text style={styles.label}>Planeta regente</Text>
          <Text style={styles.cardBody}>{houses[3].data.rulingPlanet}</Text>
          <Text style={[styles.label, { marginTop: 6 }]}>Mensaje clave</Text>
          <Text style={styles.cardBody}>{houses[3].data.keyMessage}</Text>
        </View>
      </View>

      <Text style={styles.caption}>
        Síntesis temática: no se explica toda la técnica, solo lo más importante
        para la historia de la persona.
      </Text>
    </StandardPage>
  );
}

function SynthesisPage({ reading }: { reading: Reading }) {
  return (
    <StandardPage pageNumber="10">
      <Text style={styles.h1}>Síntesis final</Text>
      <Text style={styles.intro}>
        La última impresión es íntima, cálida y humana. Aquí se integra la
        lectura para que puedas llevarte una idea clara de ti misma.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>TU ENERGÍA CENTRAL</Text>
        <Text style={styles.cardBody}>{reading.synthesis.centralEnergy}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>MENSAJE FINAL</Text>
        <Text style={styles.cardBody}>{reading.synthesis.finalMessage}</Text>
      </View>

      <Text
        style={{
          ...styles.caption,
          textAlign: "center",
          marginTop: 40,
          fontFamily: theme.fonts.serifItalic,
          fontSize: 11,
          color: c.textSubtle,
        }}
      >
        Que esta lectura te sirva como espejo, guía y recordatorio de tu esencia.
      </Text>
    </StandardPage>
  );
}

// ------------------------------ root document ------------------------------

export interface EsenciaAstralDocumentProps {
  chart: ChartResponse;
  reading: Reading;
  chartImage: string; // data URL base64 PNG
}

export function EsenciaAstralDocument({
  chart,
  reading,
  chartImage,
}: EsenciaAstralDocumentProps) {
  const clientName = chart.summary.name ?? "—";

  return (
    <Document
      title={`Esencia Astral · ${clientName}`}
      author="Esencia Astral"
      creator="Luna"
      producer="Luna"
      subject="Carta Astral Natal"
    >
      <CoverPage clientName={clientName} />
      <WelcomePage chart={chart} reading={reading} chartImage={chartImage} />
      <BigThreePage chart={chart} reading={reading} />
      <PlanetPage
        pageNumber="04"
        abbr="ME"
        planetName="Mercurio"
        planet={chart.planets.mercury}
        reading={reading.planets.mercury}
      />
      <PlanetPage
        pageNumber="05"
        abbr="VE"
        planetName="Venus"
        planet={chart.planets.venus}
        reading={reading.planets.venus}
      />
      <PlanetPage
        pageNumber="06"
        abbr="MA"
        planetName="Marte"
        planet={chart.planets.mars}
        reading={reading.planets.mars}
      />
      <PlanetPage
        pageNumber="07"
        abbr="JU"
        planetName="Júpiter"
        planet={chart.planets.jupiter}
        reading={reading.planets.jupiter}
      />
      <PlanetPage
        pageNumber="08"
        abbr="SA"
        planetName="Saturno"
        planet={chart.planets.saturn}
        reading={reading.planets.saturn}
      />
      <HousesPage reading={reading} />
      <SynthesisPage reading={reading} />
    </Document>
  );
}
