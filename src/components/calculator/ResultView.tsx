"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CalculatorResult } from "@/types/calculator";
import { LEVEL_LABELS } from "@/lib/scoring";
import { formatCurrency } from "@/lib/format";
import { calculatorConfig } from "@/lib/config";
import BrokerCard from "@/components/ui/BrokerCard";

interface StoredResult {
  result: CalculatorResult;
  firstName: string;
}

const STRATEGY_LABELS: Record<CalculatorResult["recommendationType"], string> = {
  refinance_full: "Consolidation par refinancement",
  refinance_partial: "Consolidation partielle",
  not_enough_equity: "Analyse personnalisée requise",
  non_mortgage_consolidation: "Consolidation non hypothécaire",
  buying_process: "Préparation avant achat",
  general_review: "Analyse générale",
};

export default function ResultView({ leadId }: { leadId: string }) {
  const [data, setData] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`result:${leadId}`);
    if (raw) setData(JSON.parse(raw) as StoredResult);
    setLoaded(true);
  }, [leadId]);

  if (loaded && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-bold">Résultat introuvable</h1>
          <p className="mt-3 text-slate-400">
            Ton résultat n&apos;est plus disponible. Tu peux refaire l&apos;analyse en quelques
            minutes.
          </p>
          <Link
            href="/calculator"
            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-brand to-ai px-6 font-extrabold text-black"
          >
            Recommencer
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return <main className="min-h-screen bg-ink" />;
  }

  const { result, firstName } = data;
  const hasSavings = result.estimatedMonthlySavings >= calculatorConfig.minimumDisplayedSavings;
  const level = LEVEL_LABELS[result.potentialLevel];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#04130f] to-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="animate-fadeUp">
          <span className="ai-gradient-text text-sm font-bold uppercase tracking-wide">
            Ton analyse IA
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            {firstName}, ton potentiel d&apos;économie : {level.toLowerCase()}.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            {hasSavings
              ? `Selon les informations fournies, tu pourrais potentiellement économiser environ ${formatCurrency(
                  result.estimatedMonthlySavings
                )} par mois en consolidant tes dettes.`
              : "Une consolidation ne semble pas réduire tes paiements selon les informations fournies, mais elle pourrait quand même simplifier ta situation ou réduire le coût total selon les conditions."}
          </p>
        </div>

        {/* Prochaine étape — confirmation après soumission */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-neon/40 bg-neon/10 p-5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neon/20 text-neon">
            ✓
          </span>
          <p className="text-sm leading-relaxed text-white sm:text-base">
            Tu recevras une réponse précise lors de ton appel avec Elie. Nous allons analyser
            ton dossier en détail et te rappeler dans les prochaines heures.
          </p>
        </div>

        {/* Cartes */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Économie mensuelle estimée"
            value={hasSavings ? `${formatCurrency(result.estimatedMonthlySavings)} / mois` : "À valider"}
            accent="savings"
          />
          <ResultCard
            label="Économie annuelle estimée"
            value={hasSavings ? `${formatCurrency(result.estimatedAnnualSavings)} / année` : "À valider"}
            accent="savings"
          />
          <ResultCard label="Niveau de potentiel" value={level} accent="ai" />
          <ResultCard
            label="Type de stratégie suggérée"
            value={STRATEGY_LABELS[result.recommendationType]}
            accent="brand"
          />
        </div>

        {/* Réponse IA */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <span>⚡</span> Ton analyse personnalisée
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-200">
            {result.aiResponse.split("\n").map((line, i) =>
              line.trim() === "" ? (
                <div key={i} className="h-1" />
              ) : (
                <p key={i}>{line}</p>
              )
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-slate-400">
          Cette estimation est fournie à titre informatif seulement. Elle ne constitue pas une
          approbation hypothécaire, une offre de financement ou un conseil financier personnalisé.
          Les résultats réels peuvent varier selon votre dossier, votre crédit, vos revenus, la
          valeur de votre propriété, les taux disponibles et les critères des prêteurs.
        </p>

        {/* Carte courtier */}
        <div className="mt-8">
          <BrokerCard />
        </div>

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={calculatorConfig.calendarLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-brand to-ai px-6 text-base font-extrabold text-black shadow-glow transition hover:brightness-110"
          >
            Valider mon résultat avec un courtier
          </a>
          <Link
            href="/thank-you"
            className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl border border-white/15 px-6 text-base font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Recevoir mon analyse par courriel
          </Link>
        </div>
      </div>
    </main>
  );
}

function ResultCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "savings" | "ai" | "brand";
}) {
  const accentClass =
    accent === "savings" ? "text-savings" : accent === "ai" ? "text-ai" : "text-white";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${accentClass}`}>{value}</div>
    </div>
  );
}
