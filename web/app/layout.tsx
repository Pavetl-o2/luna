import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luna — Tu carta astral",
  description:
    "Calcula tu carta natal con precisión astronómica y obtén una interpretación personalizada con IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <h1>Luna</h1>
            <p className="tagline">Tu carta astral, con interpretación de IA</p>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <small>Cálculos astronómicos con Kerykeion · Swiss Ephemeris</small>
          </footer>
        </div>
      </body>
    </html>
  );
}
