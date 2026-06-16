# Consolidation IA — Calculateur d'économies (formulaire lead)

Formulaire intelligent multi-étapes pour un courtier hypothécaire. Le visiteur répond à
quelques questions, l'app estime son potentiel d'économie par consolidation/refinancement,
génère une explication (IA) et prépare un **lead qualifié prêt à envoyer au CRM**.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

## Statut des intégrations

| Service | État | Où le brancher |
|---|---|---|
| Calculs financiers | ✅ réels, en local | `src/lib/calculations.ts`, `scoring.ts`, `recommendation.ts` |
| Réponse IA | 🟡 **stub** (texte local) | `src/lib/ai.ts` → remplacer le TODO par l'appel OpenAI (clé `OPENAI_API_KEY`) |
| Envoi CRM | 🟡 **stub** (log serveur) | `src/lib/crm.ts` → définir `CRM_WEBHOOK_URL` pour POST réel (format GoHighLevel) |
| Base de données | ⛔ non branché | Supabase (table `leads`) — voir TODO dans `src/app/api/submit-lead/route.ts` |

Copie `.env.example` vers `.env.local` et remplis les clés au besoin. Sans clés, tout
fonctionne en mode stub : le payload CRM est imprimé dans la console serveur.

## Flux

`/` (landing + thermomètre) → `/calculator` (formulaire multi-étapes) →
`POST /api/submit-lead` (validation Zod → calculs → score → recommandation → IA → CRM) →
`/results/[id]` (résultat) → `/thank-you`.

## Données du lead (ce que le courtier récupère)

Le payload CRM est construit dans `src/lib/crm.ts` (`buildCrmPayload`) : coordonnées,
statut, objectif, types de dettes, montants, équité, économie estimée, score, niveau de
potentiel, recommandation et réponse IA, avec des tags automatiques.

## Configuration métier

Taux par défaut, taux hypothécaire estimé, amortissement, LTV max : `src/lib/config.ts`.
