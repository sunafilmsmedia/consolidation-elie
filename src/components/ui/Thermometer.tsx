"use client";

import type { PotentialLevel } from "@/types/calculator";
import { LEVEL_DESCRIPTIONS, LEVEL_LABELS } from "@/lib/scoring";

interface ThermometerProps {
  score: number;
  level: PotentialLevel | null;
  hasEnoughInfo: boolean;
  compact?: boolean;
}

const LEVEL_COLORS: Record<PotentialLevel, string> = {
  low: "#9ca3af",
  moderate: "#a3e635",
  good: "#2FE06A",
  strong: "#22d178",
  very_strong: "#13c97a",
};

export default function Thermometer({
  score,
  level,
  hasEnoughInfo,
  compact = false,
}: ThermometerProps) {
  const fill = hasEnoughInfo ? Math.max(score, 6) : 0;
  const color = level ? LEVEL_COLORS[level] : "#2FE06A";
  const label = hasEnoughInfo && level ? LEVEL_LABELS[level] : "À découvrir";
  const description =
    hasEnoughInfo && level
      ? LEVEL_DESCRIPTIONS[level]
      : "Réponds à quelques questions et ton potentiel d'économie se précisera ici.";

  return (
    <div
      className={`relative rounded-3xl border border-white/15 bg-white/[0.03] p-6 backdrop-blur ${
        compact ? "" : "shadow-card"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neon">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neon/15">
          ⚡
        </span>
        Ton potentiel actuel
      </div>

      <div className={`mt-5 flex items-end gap-5 ${compact ? "" : "min-h-[220px]"}`}>
        {/* Jauge verticale */}
        <div className="relative h-44 w-7 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-700 ease-out"
            style={{
              height: `${fill}%`,
              background: `linear-gradient(180deg, ${color}, ${color}aa)`,
            }}
          />
        </div>

        <div className="flex-1">
          <div className="text-2xl font-extrabold text-white transition-colors" style={{ color }}>
            {label}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
        </div>
      </div>

      {hasEnoughInfo && (
        <div className="mt-4 text-right text-xs text-slate-400">
          Indice de potentiel : {Math.round(score)} / 100
        </div>
      )}
    </div>
  );
}
