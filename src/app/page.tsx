import Link from "next/link";
import Thermometer from "@/components/ui/Thermometer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#0a120c] to-black text-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:py-24">
        {/* Colonne gauche */}
        <div className="flex-1 animate-fadeUp">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-slate-200">
            <span className="h-2 w-2 rounded-full bg-savings" />
            Gratuit • Sans engagement • Aucun impact sur ton crédit
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Combien pourrais-tu{" "}
            <span className="neon-word inline-block pr-1 align-baseline text-[1.15em] leading-none">
              économiser
            </span>{" "}
            chaque mois en consolidant tes dettes?
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Réponds à quelques questions simples et notre calculateur intelligent estimera si une
            consolidation ou un refinancement pourrait réduire tes paiements mensuels.
          </p>

          <p className="ai-gradient-text mt-4 text-lg font-semibold">
            Analyse intelligente propulsée par l&apos;IA
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href="/calculator"
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-extrabold text-black shadow-glow transition hover:brightness-110 sm:w-auto"
            >
              Calculer mon potentiel d&apos;économie
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Gratuit. Sans engagement. Aucun impact sur ton crédit.
          </p>
        </div>

        {/* Colonne droite */}
        <div className="w-full lg:w-[40%]">
          <Thermometer score={0} level={null} hasEnoughInfo={false} />
        </div>
      </div>
    </main>
  );
}
