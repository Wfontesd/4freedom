# Architecture cible

```text
Applications Expo
├── iOS / Android : shell mobile natif
└── Web / desktop : shell responsive avec barre latérale
        ↓
Moteur de parcours partagé
├── définitions versionnées
├── validation des étapes
├── résultats déterministes
└── sources officielles
        ↓
Services futurs
├── authentification
├── stockage chiffré
├── registre éditorial
├── IA sourcée
├── notifications
└── connecteurs d’organismes
```

## Séparation des responsabilités

- Le moteur déterministe choisit les étapes, valide les champs et calcule les résultats simples.
- L’IA reformule, explique et extrait, mais ne décide pas d’un droit.
- Le registre éditorial contient les faits administratifs et leurs dates de validité.
- Les documents restent dans un coffre séparé des réponses de parcours.
- Chaque intégration externe possède un adaptateur remplaçable.

## Composants actuels

- `src/journeys.ts` : quinze définitions de parcours et leurs résultats.
- `src/flow-engine.tsx` : rendu générique des étapes mobile et desktop.
- `src/results.tsx` : récapitulatif, alertes et sources.
- `src/screens.tsx` : accueil, démarches, orientation, documents et profil.
- `src/app-shell.tsx` : navigation mobile.
- `src/app-shell.web.tsx` : navigation web responsive et desktop.
- `src/storage.ts` : persistance locale de démonstration.
