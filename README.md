# TutoVie

TutoVie est un assistant mobile-first destiné aux étudiants et jeunes adultes en France. Il transforme une situation personnelle — premier logement, aides, documents, santé, impôts, déménagement — en étapes simples, ordonnées et reliées à des sources officielles.

> **Statut : prototype interactif.** L’onboarding, la roadmap, le coffre documentaire, les détails de démarche et l’assistant sont utilisables. La connexion, l’analyse IA, le scanner, les notifications et le stockage distant sont simulés.

## Démo

- Démo web : `https://wfontesd.github.io/tripulse-site/tutovie/`
- Les données de la démo restent dans le stockage local du navigateur.
- Le bouton « Réinitialiser la démo » efface ces données.

## Stack

- Expo SDK 57
- React Native + React Native Web
- Expo Router
- TypeScript
- Animations React Native `Animated`
- Persistance locale abstraite pour fonctionner sur le web et préparer le passage mobile

Le même projet est prévu pour être exporté vers le web puis compilé pour iOS et Android avec Expo/EAS.

## Démarrer en local

```bash
npm install
npm run web
```

Pour vérifier le typage et produire un export web statique :

```bash
npm run typecheck
npm run build:web
```

L’export est généré dans `dist/`.

## Parcours implémentés

- Écran de marque et accueil animé
- Connexion simulée par e-mail, Google ou Apple
- Mode démo sans compte
- Onboarding en quatre étapes : profil, logement, situation, priorités
- Génération animée de roadmap
- Tableau de bord et progression gamifiée
- Roadmap de démarches classées dans le bon ordre
- Fiches détaillées : pourquoi, quand, pièces, étapes, source officielle
- Validation d’une démarche et gain d’XP
- Assistant conversationnel de démonstration
- Coffre documentaire avec statuts « prêt », « manquant » et « à vérifier »
- Profil et réinitialisation locale
- Interface responsive conçue d’abord pour le mobile
- Prise en charge de la réduction des animations sur le prototype web publié

## Principes produit

1. TutoVie oriente mais ne remplace pas un organisme public ou un professionnel.
2. Une recommandation importante doit afficher sa source, sa date de vérification et son périmètre.
3. L’IA ne doit pas inventer une aide, une obligation ou un document.
4. Le compte n’est pas obligatoire pour découvrir le produit.
5. Les documents personnels restent facultatifs et soumis à une politique de conservation explicite.
6. L’interface présente la prochaine action utile plutôt qu’une masse d’informations.

## Organisation du dépôt

```text
app/
  _layout.tsx       Navigation racine Expo Router
  index.tsx         Prototype produit complet
src/
  data.ts           Démarches, documents et choix d’onboarding
  storage.ts        Persistance locale web/native
  types.ts          Modèles TypeScript
  ui.tsx            Composants visuels et thème
.github/workflows/
  ci.yml            Typage et export web sur GitHub Actions
IMPLEMENTATION_PLAN.md
ARCHITECTURE.md
```

## Limites actuelles

- Aucune authentification réelle
- Aucun backend
- Aucune donnée synchronisée entre appareils
- Réponse de l’assistant statique
- Ajout de document et scanner simulés
- Pas de notifications push
- Contenu limité au premier logement et aux premières démarches d’autonomie
- Sources non encore administrables depuis un CMS

Consulter `IMPLEMENTATION_PLAN.md` pour le passage du prototype à une bêta réelle.
