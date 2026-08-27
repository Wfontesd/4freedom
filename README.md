# TutoVie — maquette guidée mobile et desktop

TutoVie aide les étudiants et jeunes adultes à comprendre les démarches de la vie autonome en France. Le produit ne se contente pas d’afficher des conseils : chaque sujet ouvre un parcours complet avec questions assistées, option « Je ne sais pas encore », explications contextuelles, récapitulatif et prochaine action officielle.

> **Statut : maquette interactive.** Les calculs locaux, la navigation, les formulaires, les brouillons et les résultats sont fonctionnels. L’authentification, l’IA, les appels aux organismes, les notifications et le stockage de vrais documents restent simulés.

## Interface

- une interface mobile avec navigation inférieure ;
- une interface desktop Expo Web avec barre latérale, formulaires en colonnes et panneau d’aide permanent ;
- les définitions de parcours, les données et les résultats sont partagés entre les plateformes ;
- `src/app-shell.tsx` contient le shell mobile natif ;
- `src/app-shell.web.tsx` contient le shell web responsive et desktop.

## Parcours disponibles

1. Calculer son vrai budget logement.
2. Organiser sa recherche de logement.
3. Préparer son dossier locatif.
4. Choisir son garant et vérifier Visale.
5. Vérifier une annonce et ses signaux d’alerte.
6. Comprendre son bail avant de signer.
7. Préparer la remise des clés et l’emménagement.
8. Préparer sa demande d’aide au logement CAF.
9. Faire le point sur les aides à vérifier.
10. Organiser les documents essentiels.
11. Mettre à jour sa situation administrative de santé.
12. Préparer sa première déclaration fiscale.
13. Organiser un déménagement et les changements d’adresse.
14. Comprendre un courrier administratif.
15. Identifier qui contacter et préparer la demande.

Chaque parcours comporte trois étapes détaillées et un résultat calculé ou synthétisé localement.

## Fonctionnalités maquettées

- accueil personnalisé et prochaine action recommandée ;
- authentification par lien magique, Google ou Apple ;
- onboarding en quatre étapes ;
- moteur générique de parcours ;
- sauvegarde locale après chaque réponse ;
- reprise d’un parcours interrompu ;
- résultats, alertes, actions suivantes et sources officielles ;
- assistant d’orientation local ;
- coffre documentaire et parcours complet d’ajout de document ;
- modification du profil, réglages de rappels, export et suppression de compte simulés ;
- aucun niveau, aucun XP, aucune streak et aucune récompense artificielle.

## Stack

- Expo SDK 57
- Expo Router
- React Native / React Native Web
- TypeScript strict
- export web statique pour GitHub Pages

## Lancer le projet

```bash
npm install
npm run web
```

Validation et export :

```bash
npm run typecheck
npm run build:web
```

## Limites de sécurité

TutoVie prépare et oriente, mais ne remplace pas un organisme public, un professionnel du droit, un travailleur social ou un service d’urgence. Une réponse importante devra toujours afficher sa source, sa date de vérification et son degré d’incertitude.
