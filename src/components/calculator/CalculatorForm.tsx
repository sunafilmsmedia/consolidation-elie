"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CalculatorInput, DebtType } from "@/types/calculator";
import Thermometer from "@/components/ui/Thermometer";
import ProgressBar from "@/components/ui/ProgressBar";
import LoadingAI from "./LoadingAI";
import { computeLivePreview } from "@/lib/livePreview";
import {
  DEBT_AMOUNT_OPTIONS,
  DEBT_TYPE_OPTIONS,
  HAS_MORTGAGE_OPTIONS,
  INCOME_OPTIONS,
  MORTGAGE_BALANCE_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  PROPERTY_VALUE_OPTIONS,
  URGENCY_OPTIONS,
  USER_STATUS_OPTIONS,
  type ChoiceOption,
} from "./questions";

type StepKey =
  | "userStatus"
  | "primaryGoal"
  | "debtTypes"
  | "totalDebtAmount"
  | "currentDebtMonthlyPayment"
  | "hasMortgage"
  | "propertyValue"
  | "mortgageBalance"
  | "mortgageMonthlyPayment"
  | "income"
  | "urgency"
  | "contact";

interface Answers extends Partial<CalculatorInput> {
  hasMortgageChoice?: string;
  dontKnowDebtPayment?: boolean;
  dontKnowMortgagePayment?: boolean;
}

export default function CalculatorForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const isOwner = answers.userStatus === "owner";
  const hasMortgage = answers.hasMortgageChoice === "yes" || answers.hasMortgageChoice === "unsure";

  const steps = useMemo<StepKey[]>(() => {
    const base: StepKey[] = [
      "userStatus",
      "primaryGoal",
      "debtTypes",
      "totalDebtAmount",
      "currentDebtMonthlyPayment",
    ];
    if (isOwner) {
      base.push("hasMortgage", "propertyValue");
      if (hasMortgage) base.push("mortgageBalance", "mortgageMonthlyPayment");
    }
    base.push("income", "urgency", "contact");
    return base;
  }, [isOwner, hasMortgage]);

  const clampedIndex = Math.min(stepIndex, steps.length - 1);
  const currentStep = steps[clampedIndex];

  const preview = useMemo(() => computeLivePreview(answers), [answers]);

  function update(patch: Answers) {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setError(null);
  }

  function goNext() {
    if (clampedIndex < steps.length - 1) {
      setStepIndex(clampedIndex + 1);
    }
  }

  function goBack() {
    if (clampedIndex > 0) setStepIndex(clampedIndex - 1);
  }

  const canContinue = useMemo(
    () => validateStep(currentStep, answers),
    [currentStep, answers]
  );

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload = buildPayload(answers, honeypot);
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.error ?? "Il manque quelques informations avant de générer ton résultat."
        );
        setSubmitting(false);
        return;
      }

      // Délai minimum pour l'écran de chargement IA (perception de valeur).
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(2500 - elapsed, 0);
      sessionStorage.setItem(
        `result:${data.leadId}`,
        JSON.stringify({ result: data.result, firstName: payload.firstName })
      );
      setTimeout(() => router.push(data.resultUrl), wait);
    } catch {
      setError("Une erreur est survenue. Réessaie dans un instant.");
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ink via-[#111a33] to-ink text-white">
        <LoadingAI />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ink via-[#111a33] to-ink text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-10 lg:grid-cols-[1fr_360px] lg:py-16">
        <div>
          <ProgressBar current={clampedIndex + 1} total={steps.length} />

          <div key={currentStep} className="mt-8 animate-fadeUp">
            <StepContent
              step={currentStep}
              answers={answers}
              update={update}
              isOwner={isOwner}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-alert/40 bg-alert/10 px-4 py-3 text-sm text-orange-200">
              {error}
            </p>
          )}

          {/* Honeypot anti-spam (caché). */}
          <input
            type="text"
            name="company"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          <div className="mt-8 flex items-center gap-3">
            {clampedIndex > 0 && (
              <button
                onClick={goBack}
                className="h-14 rounded-2xl border border-white/15 px-6 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Retour
              </button>
            )}
            {currentStep === "contact" ? (
              <button
                onClick={handleSubmit}
                disabled={!canContinue}
                className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-bold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Voir mon résultat IA
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canContinue}
                className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-brand to-ai px-8 text-base font-bold text-white shadow-glow transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuer
              </button>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <Thermometer
            score={preview.score}
            level={preview.level}
            hasEnoughInfo={preview.hasEnoughInfo}
          />
        </aside>
      </div>
    </main>
  );
}

/* --------------------------- Validation par étape --------------------------- */

function validateStep(step: StepKey, a: Answers): boolean {
  switch (step) {
    case "userStatus":
      return !!a.userStatus;
    case "primaryGoal":
      return !!a.primaryGoal;
    case "debtTypes":
      return !!a.debtTypes && a.debtTypes.length > 0;
    case "totalDebtAmount":
      return typeof a.totalDebtAmount === "number";
    case "currentDebtMonthlyPayment":
      return (
        a.dontKnowDebtPayment === true ||
        (typeof a.currentDebtMonthlyPayment === "number" && a.currentDebtMonthlyPayment >= 0)
      );
    case "hasMortgage":
      return !!a.hasMortgageChoice;
    case "propertyValue":
      return typeof a.propertyValue === "number";
    case "mortgageBalance":
      return typeof a.mortgageBalance === "number";
    case "mortgageMonthlyPayment":
      return (
        a.dontKnowMortgagePayment === true ||
        typeof a.mortgageMonthlyPayment === "number"
      );
    case "income":
      return !!a.householdIncomeRange;
    case "urgency":
      return !!a.urgencyLevel;
    case "contact":
      return (
        !!a.firstName?.trim() &&
        !!a.email?.trim() &&
        /.+@.+\..+/.test(a.email ?? "") &&
        !!a.phone?.trim() &&
        a.consentContact === true
      );
    default:
      return false;
  }
}

/* ------------------------------- Payload final ------------------------------ */

function buildPayload(a: Answers, honeypot: string): CalculatorInput & { company: string } {
  const ownsProperty = a.userStatus === "owner";
  const propertyPaid = a.hasMortgageChoice === "no";

  return {
    firstName: a.firstName?.trim() ?? "",
    lastName: a.lastName?.trim() || undefined,
    email: a.email?.trim() ?? "",
    phone: a.phone?.trim() ?? "",
    userStatus: a.userStatus!,
    primaryGoal: a.primaryGoal!,
    debtTypes: a.debtTypes ?? [],
    totalDebtAmount: a.totalDebtAmount ?? 0,
    currentDebtMonthlyPayment: a.dontKnowDebtPayment
      ? undefined
      : a.currentDebtMonthlyPayment,
    ownsProperty,
    hasMortgage: ownsProperty ? !propertyPaid : undefined,
    propertyValue: ownsProperty ? a.propertyValue : undefined,
    mortgageBalance: ownsProperty ? (propertyPaid ? 0 : a.mortgageBalance) : undefined,
    mortgageMonthlyPayment:
      ownsProperty && !a.dontKnowMortgagePayment ? a.mortgageMonthlyPayment : undefined,
    householdIncomeRange: a.householdIncomeRange,
    urgencyLevel: a.urgencyLevel!,
    consentContact: a.consentContact === true,
    company: honeypot,
  };
}

/* ------------------------------- Rendu étapes ------------------------------- */

interface StepContentProps {
  step: StepKey;
  answers: Answers;
  update: (patch: Answers) => void;
  isOwner: boolean;
}

function StepContent({ step, answers, update }: StepContentProps) {
  switch (step) {
    case "userStatus":
      return (
        <SingleChoice
          title="Quelle est ta situation actuelle?"
          options={USER_STATUS_OPTIONS}
          value={answers.userStatus}
          onSelect={(v) => update({ userStatus: v })}
        />
      );
    case "primaryGoal":
      return (
        <SingleChoice
          title="Qu'est-ce que tu aimerais améliorer en premier?"
          options={PRIMARY_GOAL_OPTIONS}
          value={answers.primaryGoal}
          onSelect={(v) => update({ primaryGoal: v })}
        />
      );
    case "debtTypes":
      return (
        <MultiChoice
          title="Quels types de dettes as-tu actuellement?"
          subtitle="Tu peux en choisir plusieurs."
          options={DEBT_TYPE_OPTIONS}
          values={answers.debtTypes ?? []}
          onChange={(vals) => update({ debtTypes: vals })}
        />
      );
    case "totalDebtAmount":
      return (
        <RangeChoice
          title="Environ combien dois-tu au total, sans compter ton hypothèque?"
          options={DEBT_AMOUNT_OPTIONS}
          value={answers.totalDebtAmount}
          onSelect={(v) => update({ totalDebtAmount: v })}
        />
      );
    case "currentDebtMonthlyPayment":
      return (
        <NumberWithUnknown
          title="Combien paies-tu environ chaque mois pour ces dettes?"
          placeholder="Ex. 850 $ / mois"
          value={answers.currentDebtMonthlyPayment}
          unknown={answers.dontKnowDebtPayment ?? false}
          onValue={(v) => update({ currentDebtMonthlyPayment: v, dontKnowDebtPayment: false })}
          onUnknown={() =>
            update({ dontKnowDebtPayment: true, currentDebtMonthlyPayment: undefined })
          }
        />
      );
    case "hasMortgage":
      return (
        <SingleChoice
          title="As-tu actuellement une hypothèque sur ta propriété?"
          options={HAS_MORTGAGE_OPTIONS}
          value={answers.hasMortgageChoice}
          onSelect={(v) => update({ hasMortgageChoice: v })}
        />
      );
    case "propertyValue":
      return (
        <RangeChoice
          title="Quelle est la valeur approximative de ta propriété aujourd'hui?"
          options={PROPERTY_VALUE_OPTIONS}
          value={answers.propertyValue}
          onSelect={(v) => update({ propertyValue: v })}
        />
      );
    case "mortgageBalance":
      return (
        <RangeChoice
          title="Combien reste-t-il environ sur ton hypothèque?"
          options={MORTGAGE_BALANCE_OPTIONS}
          value={answers.mortgageBalance}
          onSelect={(v) => update({ mortgageBalance: v })}
        />
      );
    case "mortgageMonthlyPayment":
      return (
        <NumberWithUnknown
          title="Ton paiement hypothécaire actuel est d'environ combien par mois?"
          placeholder="Ex. 2 100 $ / mois"
          value={answers.mortgageMonthlyPayment}
          unknown={answers.dontKnowMortgagePayment ?? false}
          onValue={(v) =>
            update({ mortgageMonthlyPayment: v, dontKnowMortgagePayment: false })
          }
          onUnknown={() =>
            update({ dontKnowMortgagePayment: true, mortgageMonthlyPayment: undefined })
          }
        />
      );
    case "income":
      return (
        <SingleChoice
          title="Quel est le revenu annuel approximatif de ton foyer avant impôts?"
          options={INCOME_OPTIONS}
          value={answers.householdIncomeRange}
          onSelect={(v) => update({ householdIncomeRange: v })}
        />
      );
    case "urgency":
      return (
        <SingleChoice
          title="À quel point aimerais-tu réduire tes paiements rapidement?"
          options={URGENCY_OPTIONS}
          value={answers.urgencyLevel}
          onSelect={(v) => update({ urgencyLevel: v })}
        />
      );
    case "contact":
      return <ContactStep answers={answers} update={update} />;
    default:
      return null;
  }
}

/* ------------------------------ Sous-composants ----------------------------- */

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

function SingleChoice<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: ChoiceOption<T>[];
  value?: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <StepTitle title={title} />
      <div className="grid gap-3">
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function RangeChoice({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: ChoiceOption<number>[];
  value?: number;
  onSelect: (v: number) => void;
}) {
  return (
    <div>
      <StepTitle title={title} subtitle="Choisis la plage qui se rapproche le plus." />
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <OptionButton
            key={opt.label}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function MultiChoice<T extends string>({
  title,
  subtitle,
  options,
  values,
  onChange,
}: {
  title: string;
  subtitle?: string;
  options: ChoiceOption<T>[];
  values: T[];
  onChange: (v: T[]) => void;
}) {
  function toggle(v: T) {
    // "none" est exclusif.
    if (v === ("none" as T)) {
      onChange(values.includes(v) ? [] : [v]);
      return;
    }
    const withoutNone = values.filter((x) => x !== ("none" as T));
    onChange(
      withoutNone.includes(v) ? withoutNone.filter((x) => x !== v) : [...withoutNone, v]
    );
  }

  return (
    <div>
      <StepTitle title={title} subtitle={subtitle} />
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            selected={values.includes(opt.value)}
            multi
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
  multi = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
        selected
          ? "border-ai bg-ai/15 text-white shadow-glow"
          : "border-white/12 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] ${
          multi ? "rounded-md" : "rounded-full"
        } ${selected ? "border-ai bg-ai text-white" : "border-white/30"}`}
      >
        {selected ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

function NumberWithUnknown({
  title,
  placeholder,
  value,
  unknown,
  onValue,
  onUnknown,
}: {
  title: string;
  placeholder: string;
  value?: number;
  unknown: boolean;
  onValue: (v: number | undefined) => void;
  onUnknown: () => void;
}) {
  return (
    <div>
      <StepTitle title={title} />
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={value ?? ""}
          disabled={unknown}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "");
            onValue(digits ? Number(digits) : undefined);
          }}
          className="h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-5 text-lg text-white placeholder:text-slate-500 focus:border-ai focus:outline-none disabled:opacity-40"
        />
      </div>
      <button
        onClick={onUnknown}
        className={`mt-4 rounded-xl border px-4 py-2 text-sm font-medium transition ${
          unknown
            ? "border-ai bg-ai/15 text-white"
            : "border-white/15 text-slate-300 hover:bg-white/5"
        }`}
      >
        Je ne sais pas
      </button>
      <p className="mt-3 text-xs text-slate-500">
        Si tu ne sais pas, on estimera ce montant à partir de tes autres réponses.
      </p>
    </div>
  );
}

function ContactStep({
  answers,
  update,
}: {
  answers: Answers;
  update: (patch: Answers) => void;
}) {
  return (
    <div>
      <StepTitle
        title="Où veux-tu recevoir ton analyse personnalisée?"
        subtitle="Aucun impact sur ton dossier de crédit ne sera effectué à cette étape."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Prénom"
          value={answers.firstName ?? ""}
          onChange={(v) => update({ firstName: v })}
        />
        <Field
          label="Nom"
          value={answers.lastName ?? ""}
          onChange={(v) => update({ lastName: v })}
        />
        <Field
          label="Courriel"
          type="email"
          value={answers.email ?? ""}
          onChange={(v) => update({ email: v })}
        />
        <Field
          label="Téléphone"
          type="tel"
          value={answers.phone ?? ""}
          onChange={(v) => update({ phone: v })}
        />
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={answers.consentContact === true}
          onChange={(e) => update({ consentContact: e.target.checked })}
          className="mt-0.5 h-5 w-5 rounded border-white/30 accent-ai"
        />
        J&apos;accepte d&apos;être contacté au sujet de mon analyse et de mes options de
        consolidation.
      </label>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder:text-slate-500 focus:border-ai focus:outline-none"
      />
    </label>
  );
}
