import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consolidation IA — Calculateur d'économies",
  description:
    "Découvre combien tu pourrais économiser chaque mois en consolidant tes dettes, avec une analyse propulsée par l'IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
