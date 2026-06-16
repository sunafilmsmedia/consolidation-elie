"use client";

import { useState } from "react";

const PHONE_DISPLAY = "819 210 7843";
const PHONE_TEL = "+18192107843";
const PHOTO_SRC = "/elie.jpg";

export default function BrokerCard() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-5 backdrop-blur">
      <div className="flex items-center gap-4">
        {/* Avatar + pastille en ligne */}
        <div className="relative shrink-0">
          {imgError ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon/15 text-lg font-extrabold text-neon">
              EI
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={PHOTO_SRC}
              alt="Elie Ibrahim"
              onError={() => setImgError(true)}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-neon/60"
            />
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-black bg-neon shadow-neon" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-neon/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-neon">
              <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-neon" />
              En ligne
            </span>
          </div>
          <p className="mt-1.5 truncate text-base font-extrabold text-white">Elie Ibrahim</p>
          <p className="truncate text-xs text-white/60">Courtier hypothécaire</p>
        </div>
      </div>

      <a
        href={`tel:${PHONE_TEL}`}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-ai text-sm font-extrabold text-black shadow-glow transition hover:brightness-110"
      >
        <span aria-hidden>📞</span> Appeler {PHONE_DISPLAY}
      </a>
    </div>
  );
}
