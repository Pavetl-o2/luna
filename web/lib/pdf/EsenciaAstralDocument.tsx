import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
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
const pad = theme.spacing.pagePadding;

// ------------------------------ styles ------------------------------

const base = StyleSheet.create({
  page: {
    backgroundColor: c.background,
    padding: 0,
    fontFamily: theme.fonts.body,
    fontSize: s.body,
    color: c.text,
  },
  headerBar: {
    backgroundColor: c.headerBar,
    paddingVertical: 11,
    paddingHorizontal: pad,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 16,
    color: c.headerBarText,
  },
  headerLabel: {
    fontSize: s.caption,
    color: c.headerBarText,
  },
  content: {
    paddingHorizontal: pad,
    paddingTop: 24,
    paddingBottom: 50,
    flex: 1,
  },
  mainCard: {
    backgroundColor: c.cardBackground,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: c.cardBorder,
    padding: 28,
  },
  innerCard: {
    backgroundColor: c.innerCardBg,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: c.cardBorder,
    padding: 14,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: s.h1,
    color: c.accent,
    marginBottom: 8,
  },
  sectionIntro: {
    fontSize: s.body,
    lineHeight: 1.55,
    color: c.textSubtle,
    marginBottom: 18,
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
    color: c.text,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  pill: {
    backgroundColor: c.pillBg,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginTop: 24,
  },
  pillText: {
    fontFamily: theme.fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 10.5,
    color: c.pillText,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: pad,
    right: pad,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: s.footerText,
    color: c.textMuted,
  },
  planetCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 13,
    color: c.accent,
    marginBottom: 6,
    textAlign: "center",
  },
});

// ------------------------------ layout helpers ------------------------------

function InteriorPage({
  pageLabel,
  children,
}: {
  pageLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={base.page}>
      <View style={base.headerBar}>
        <Text style={base.headerTitle}>Luna Estelar</Text>
        <Text style={base.headerLabel}>{pageLabel}</Text>
      </View>
      <View style={base.content}>{children}</View>
      <View style={base.footer}>
        <Text style={base.footerText}>Luna Estelar · Informe astral</Text>
        <Text style={base.footerText}>{pageLabel}</Text>
      </View>
    </Page>
  );
}

function PlanetBadge({ abbr, label }: { abbr: string; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={base.planetCircle}>
        <Text style={base.planetAbbr}>{abbr}</Text>
      </View>
      <Text style={base.planetName}>{label}</Text>
    </View>
  );
}

// ------------------------------ cover ------------------------------

function CoverPage({ clientName }: { clientName: string }) {
  return (
    <Page size="A4" style={base.page}>
      {/* Inset border */}
      <View
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          right: 15,
          bottom: 15,
          borderWidth: 0.8,
          borderColor: c.pageBorder,
          borderRadius: 10,
        }}
      />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 60,
        }}
      >
        {/* Moon + stars icon */}
        <View style={{ marginBottom: 40 }}>
          <Svg width="80" height="90" viewBox="0 0 80 90">
            <Path
              d="M42 5 C20 5 3 24 3 48 C3 72 20 88 42 88 C27 80 17 65 17 48 C17 31 27 16 42 5 Z"
              fill={c.accent}
            />
            <Path
              d="M58 18 L60.5 25 L68 25 L62 29.5 L64 37 L58 32.5 L52 37 L54 29.5 L48 25 L55.5 25 Z"
              fill={c.accent}
            />
            <Path
              d="M70 36 L71 39 L74 39 L71.5 41 L72.5 44 L70 42 L67.5 44 L68.5 41 L66 39 L69 39 Z"
              fill={c.textMuted}
            />
          </Svg>
        </View>

        <Text
          style={{
            fontFamily: theme.fonts.serifBold,
            fontSize: 38,
            color: c.text,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Luna Estelar
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: c.textSubtle,
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Informe astral en PDF
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: c.textMuted,
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          {clientName}
        </Text>

        <View style={base.pill}>
          <Text style={base.pillText}>
            Mística, cósmica y luminosa
          </Text>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 40,
          left: 60,
          right: 60,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 8,
            color: c.textMuted,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Diseño sugerido para portada de tu servicio astrológico
        </Text>
        <Text
          style={{ fontSize: 8, color: c.textMuted, textAlign: "center" }}
        >
          PDF personalizado · estilo elegante · lectura intuitiva
        </Text>
      </View>
    </Page>
  );
}

// ------------------------------ welcome / birth data ------------------------------

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
    <InteriorPage pageLabel="Datos natales">
      <View style={base.mainCard}>
        <Text style={base.sectionTitle}>Bienvenida y datos natales</Text>
        <Text style={base.sectionIntro}>{reading.introduction}</Text>

        <View style={base.row}>
          {/* Birth data card */}
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>DATOS DE NACIMIENTO</Text>
            <Text style={base.label}>Nombre</Text>
            <Text style={base.value}>{chart.summary.name ?? "—"}</Text>
            <Text style={base.label}>Fecha</Text>
            <Text style={base.value}>{dateStr}</Text>
            <Text style={base.label}>Hora</Text>
            <Text style={base.value}>{timeStr}</Text>
            <Text style={base.label}>Lugar</Text>
            <Text style={base.value}>{birth.city}</Text>
            <Text style={base.label}>Zona horaria</Text>
            <Text style={base.value}>{birth.tz_str}</Text>
          </View>

          {/* Chart image card */}
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>MAPA NATAL</Text>
            {chartImage ? (
              <Image
                src={chartImage}
                style={{ width: "100%", height: 200 }}
              />
            ) : (
              <Text
                style={{
                  ...base.label,
                  textAlign: "center",
                  marginTop: 60,
                }}
              >
                Gráfico no disponible
              </Text>
            )}
          </View>
        </View>

        {/* Tres grandes summary */}
        <View
          style={{
            ...base.row,
            marginTop: 14,
            backgroundColor: c.innerCardBg,
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: c.cardBorder,
            padding: 14,
          }}
        >
          <ThreeGrandCell label="Sol" planet={chart.summary.sun} />
          <ThreeGrandCell label="Luna" planet={chart.summary.moon} />
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
    </InteriorPage>
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
      <Text style={base.label}>{label}</Text>
      <Text style={base.value}>
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

// ------------------------------ big three ------------------------------

function BigThreePage({
  chart,
  reading,
}: {
  chart: ChartResponse;
  reading: Reading;
}) {
  return (
    <InteriorPage pageLabel="Tus tres grandes">
      <View style={base.mainCard}>
        <Text style={base.sectionTitle}>Tus tres grandes</Text>
        <Text style={base.sectionIntro}>
          La esencia central de tu carta: identidad, emociones y la energía que
          proyectas al mundo.
        </Text>

        <View style={[base.row, { marginTop: 8 }]}>
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
      </View>
    </InteriorPage>
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
      <View style={[base.innerCard, { alignSelf: "stretch" }]}>
        <Text
          style={{
            fontSize: 8,
            color: c.textMuted,
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          En {sign}
        </Text>
        <Text style={{ fontSize: 8.5, lineHeight: 1.4, color: c.text }}>
          {reading.whatItShows}
        </Text>
        <Text
          style={{
            fontSize: 7.5,
            color: c.accent,
            marginTop: 6,
          }}
        >
          {reading.keywords.join(" · ")}
        </Text>
      </View>
    </View>
  );
}

// ------------------------------ planet detail ------------------------------

function PlanetPage({
  pageLabel,
  abbr,
  planetName,
  planet,
  reading,
}: {
  pageLabel: string;
  abbr: string;
  planetName: string;
  planet: ChartPlanet | null | undefined;
  reading: PlanetPageReading;
}) {
  const sign = translateSign(planet?.sign);
  const house = planet?.house ?? "—";

  return (
    <InteriorPage pageLabel={pageLabel}>
      <View style={base.mainCard}>
        <View style={[base.row, { alignItems: "flex-start", marginBottom: 14 }]}>
          <View style={{ width: 80, alignItems: "center" }}>
            <PlanetBadge abbr={abbr} label={planetName} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={base.sectionTitle}>{planetName}</Text>
            <Text style={base.label}>{planetName} en</Text>
            <Text style={base.value}>
              {sign}
              {planet?.position != null
                ? `  ·  ${formatDegree(planet.position)}`
                : ""}
              {planet?.retrograde ? "  (retrógrado)" : ""}
            </Text>
            <Text style={base.label}>Casa</Text>
            <Text style={base.value}>{house}</Text>
            <Text style={base.label}>Aspecto clave</Text>
            <Text style={base.value}>{reading.keyAspect}</Text>
          </View>
        </View>

        <Text style={{ ...base.cardTitle, marginTop: 8 }}>QUÉ SIGNIFICA</Text>
        <Text style={{ ...base.cardBody, marginBottom: 14 }}>
          {reading.whatItMeans}
        </Text>

        <View style={base.row}>
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>LADO LUZ</Text>
            <Text style={base.label}>Talento natural</Text>
            <Text style={base.cardBody}>{reading.lightSide.naturalTalent}</Text>
            <Text style={[base.label, { marginTop: 6 }]}>
              Forma sana de expresarlo
            </Text>
            <Text style={base.cardBody}>
              {reading.lightSide.healthyExpression}
            </Text>
            <Text style={[base.label, { marginTop: 6 }]}>
              Qué le suma en vínculos
            </Text>
            <Text style={base.cardBody}>
              {reading.lightSide.contributionToBonds}
            </Text>
          </View>
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>RETO O SOMBRA</Text>
            <Text style={base.label}>Patrón de defensa</Text>
            <Text style={base.cardBody}>{reading.shadow.defensePattern}</Text>
            <Text style={[base.label, { marginTop: 6 }]}>
              Lo que le cuesta mirar
            </Text>
            <Text style={base.cardBody}>{reading.shadow.hardToSee}</Text>
            <Text style={[base.label, { marginTop: 6 }]}>
              Qué necesita trabajar
            </Text>
            <Text style={base.cardBody}>{reading.shadow.needsToWork}</Text>
          </View>
        </View>

        <Text style={{ ...base.cardTitle, marginTop: 14 }}>
          CONSEJO INTEGRADOR
        </Text>
        <Text style={base.cardBody}>{reading.integrationTip}</Text>
      </View>
    </InteriorPage>
  );
}

// ------------------------------ houses ------------------------------

function HousesPage({ reading }: { reading: Reading }) {
  const houses: Array<{
    num: string;
    themeDesc: string;
    data: HouseReading;
  }> = [
    {
      num: "CASA 1",
      themeDesc: "Identidad, presencia y forma de iniciar",
      data: reading.houses.house1,
    },
    {
      num: "CASA 4",
      themeDesc: "Raíces, hogar y vida privada",
      data: reading.houses.house4,
    },
    {
      num: "CASA 7",
      themeDesc: "Pareja y manera de vincularse",
      data: reading.houses.house7,
    },
    {
      num: "CASA 10",
      themeDesc: "Vocación, imagen y dirección",
      data: reading.houses.house10,
    },
  ];

  return (
    <InteriorPage pageLabel="Casas y áreas de vida">
      <View style={base.mainCard}>
        <Text style={base.sectionTitle}>Casas y áreas de vida</Text>
        <Text style={base.sectionIntro}>
          Las casas angulares revelan cómo se manifiesta tu energía en las áreas
          clave de tu vida cotidiana.
        </Text>

        <View style={base.row}>
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>{houses[0].num}</Text>
            <Text style={{ ...base.cardBody, marginBottom: 6 }}>
              {houses[0].themeDesc}
            </Text>
            <Text style={base.label}>Planeta regente</Text>
            <Text style={base.cardBody}>{houses[0].data.rulingPlanet}</Text>
            <Text style={[base.label, { marginTop: 6 }]}>Mensaje clave</Text>
            <Text style={base.cardBody}>{houses[0].data.keyMessage}</Text>
          </View>
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>{houses[1].num}</Text>
            <Text style={{ ...base.cardBody, marginBottom: 6 }}>
              {houses[1].themeDesc}
            </Text>
            <Text style={base.label}>Planeta regente</Text>
            <Text style={base.cardBody}>{houses[1].data.rulingPlanet}</Text>
            <Text style={[base.label, { marginTop: 6 }]}>Mensaje clave</Text>
            <Text style={base.cardBody}>{houses[1].data.keyMessage}</Text>
          </View>
        </View>

        <View style={[base.row, { marginTop: 12 }]}>
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>{houses[2].num}</Text>
            <Text style={{ ...base.cardBody, marginBottom: 6 }}>
              {houses[2].themeDesc}
            </Text>
            <Text style={base.label}>Planeta regente</Text>
            <Text style={base.cardBody}>{houses[2].data.rulingPlanet}</Text>
            <Text style={[base.label, { marginTop: 6 }]}>Mensaje clave</Text>
            <Text style={base.cardBody}>{houses[2].data.keyMessage}</Text>
          </View>
          <View style={base.innerCard}>
            <Text style={base.cardTitle}>{houses[3].num}</Text>
            <Text style={{ ...base.cardBody, marginBottom: 6 }}>
              {houses[3].themeDesc}
            </Text>
            <Text style={base.label}>Planeta regente</Text>
            <Text style={base.cardBody}>{houses[3].data.rulingPlanet}</Text>
            <Text style={[base.label, { marginTop: 6 }]}>Mensaje clave</Text>
            <Text style={base.cardBody}>{houses[3].data.keyMessage}</Text>
          </View>
        </View>
      </View>
    </InteriorPage>
  );
}

// ------------------------------ synthesis ------------------------------

function SynthesisPage({ reading }: { reading: Reading }) {
  return (
    <InteriorPage pageLabel="Síntesis final">
      <View style={base.mainCard}>
        <Text style={base.sectionTitle}>Síntesis final</Text>
        <Text style={base.sectionIntro}>
          Una mirada integradora de toda tu carta, para que puedas llevarte una
          imagen clara y cálida de tu esencia.
        </Text>

        <View style={{ ...base.innerCard, flex: undefined, marginBottom: 14 }}>
          <Text style={base.cardTitle}>TU ENERGÍA CENTRAL</Text>
          <Text style={base.cardBody}>{reading.synthesis.centralEnergy}</Text>
        </View>

        <View style={{ ...base.innerCard, flex: undefined }}>
          <Text style={base.cardTitle}>MENSAJE FINAL</Text>
          <Text style={base.cardBody}>{reading.synthesis.finalMessage}</Text>
        </View>
      </View>

      <View style={[base.pill, { marginTop: 30 }]}>
        <Text style={base.pillText}>
          Que esta lectura te sirva como espejo, guía y recordatorio de tu
          esencia.
        </Text>
      </View>
    </InteriorPage>
  );
}

// ------------------------------ root document ------------------------------

export interface EsenciaAstralDocumentProps {
  chart: ChartResponse;
  reading: Reading;
  chartImage: string;
}

export function EsenciaAstralDocument({
  chart,
  reading,
  chartImage,
}: EsenciaAstralDocumentProps) {
  const clientName = chart.summary.name ?? "—";

  return (
    <Document
      title={`Luna Estelar · ${clientName}`}
      author="Luna Estelar"
      creator="Luna"
      producer="Luna"
      subject="Informe Astral"
    >
      <CoverPage clientName={clientName} />
      <WelcomePage chart={chart} reading={reading} chartImage={chartImage} />
      <BigThreePage chart={chart} reading={reading} />
      <PlanetPage
        pageLabel="Mercurio"
        abbr="ME"
        planetName="Mercurio"
        planet={chart.planets.mercury}
        reading={reading.planets.mercury}
      />
      <PlanetPage
        pageLabel="Venus"
        abbr="VE"
        planetName="Venus"
        planet={chart.planets.venus}
        reading={reading.planets.venus}
      />
      <PlanetPage
        pageLabel="Marte"
        abbr="MA"
        planetName="Marte"
        planet={chart.planets.mars}
        reading={reading.planets.mars}
      />
      <PlanetPage
        pageLabel="Júpiter"
        abbr="JU"
        planetName="Júpiter"
        planet={chart.planets.jupiter}
        reading={reading.planets.jupiter}
      />
      <PlanetPage
        pageLabel="Saturno"
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
