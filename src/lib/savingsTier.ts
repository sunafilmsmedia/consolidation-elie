/**
 * Classification d'un dossier selon l'économie mensuelle estimée.
 *
 * Barème (défini par le courtier) :
 *  - Moins de 300 $/mois : avantage trop faible — on est honnête avec la personne,
 *    réduire ses paiements ne vaut souvent pas la peine de toucher à son crédit.
 *  - 300 à 500 $/mois    : dossier potentiellement intéressant.
 *  - 500 à 1 000 $/mois  : proposition très intéressante.
 *  - Plus de 1 000 $/mois : excellente accroche (à valider avec le coût total).
 */

export type SavingsTier = "too_low" | "interesting" | "strong" | "excellent";

export interface SavingsTierContent {
  tier: SavingsTier;
  /** Étiquette courte (CRM, badges). */
  label: string;
  /** Titre affiché sur la page de résultat. */
  headline: string;
  /** Paragraphe explicatif honnête. */
  message: string;
  /** Vrai si le dossier vaut la peine d'être poussé comme lead. */
  isWorthwhile: boolean;
}

// Seuil sous lequel on décourage honnêtement la consolidation.
export const MIN_WORTHWHILE_SAVINGS = 300;

export function classifySavings(monthlySavings: number): SavingsTierContent {
  if (monthlySavings < MIN_WORTHWHILE_SAVINGS) {
    return {
      tier: "too_low",
      label: "Avantage trop faible",
      headline: "L'économie estimée est modeste",
      message:
        "Selon les informations fournies, réduire tes paiements par une consolidation ne semble pas assez avantageux pour justifier de toucher à ton crédit et à ta situation actuelle. Ce serait pertinent d'y revenir seulement si ta situation change (nouvelles dettes, valeur de propriété plus élevée, etc.).",
      isWorthwhile: false,
    };
  }

  if (monthlySavings < 500) {
    return {
      tier: "interesting",
      label: "Dossier intéressant",
      headline: "Ton dossier est potentiellement intéressant",
      message:
        "Selon les informations fournies, une consolidation pourrait réduire tes paiements mensuels de façon notable. Ça vaut la peine de faire valider tes vraies options par un courtier.",
      isWorthwhile: true,
    };
  }

  if (monthlySavings <= 1000) {
    return {
      tier: "strong",
      label: "Proposition très intéressante",
      headline: "Ta situation semble très intéressante",
      message:
        "Selon les informations fournies, tu pourrais réduire tes paiements mensuels de manière importante en regroupant tes dettes dans ton hypothèque. C'est le genre de dossier qui mérite une analyse rapide.",
      isWorthwhile: true,
    };
  }

  return {
    tier: "excellent",
    label: "Excellent potentiel",
    headline: "Ton potentiel d'économie est excellent",
    message:
      "Selon les informations fournies, l'économie mensuelle potentielle est très élevée. C'est une excellente accroche — reste à valider le coût total de la stratégie sur la durée avec un courtier pour t'assurer que c'est réellement gagnant.",
    isWorthwhile: true,
  };
}
