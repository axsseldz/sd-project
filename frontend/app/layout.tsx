import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit — Simulador DevOps",
  description:
    "Traduce lenguaje natural a scripts DevOps ejecutables. Previsualiza, aprueba y observa cómo corren.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-400/30 selection:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
