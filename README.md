# TutoVie

TutoVie est un site web responsive destiné aux étudiants et jeunes adultes en France. Il transforme une situation concrète — premier logement, aides, documents, santé, impôts ou déménagement — en parcours guidés, expliqués et sauvegardés.

> **Statut : maquette fonctionnelle.** Les formulaires, calculs locaux, checklists, récapitulatifs, navigation et sauvegarde navigateur sont utilisables. L’authentification, l’IA distante, les appels aux organismes, les notifications et le stockage de fichiers sont simulés.

## Démo

- Démo web : `https://wfontesd.github.io/tripulse-site/tutovie/`
- Les données de la démo restent dans le stockage local du navigateur.
- Aucun véritable document ne doit être déposé dans le prototype.

## Stack

- Expo SDK 57
- React Native Web
- Expo Router
- TypeScript
- Une base de code web avec deux présentations : mobile et desktop
- Export statique compatible GitHub Pages

Expo est utilisé ici pour produire un site web responsive. Il ne s’agit pas d’une application Windows ou macOS.

## Démarrer en local

```bash
npm install
npm run web
```

Vérifier le projet et produire l’export statique :

```bash
npm run typecheck
npm run build:web
```

L’export est généré dans `dist/`.

## Expérience implémentée

- accueil responsive mobile/desktop ;
- connexion simulée par e-mail, Google, Apple ou mode sans compte ;
- onboarding expliquant pourquoi chaque information est demandée ;
- tableau de bord sans niveaux, XP ni mécanisme de gamification ;
- moteur de parcours générique avec reprise automatique ;
- aide contextuelle visible pendant toute la saisie ;
- option « Je ne sais pas » sur les questions ;
- calculateur détaillé du vrai budget logement ;
- formulaires, choix multiples, checklists, faux dépôts et liens officiels ;
- récapitulatifs séparant les réponses connues des éléments à compléter ;
- inventaire documentaire avec statuts et explications ;
- assistant d’orientation vers le bon parcours ;
- persistance locale versionnée.

## Parcours disponibles

1. Premier logement : projet, budget, garant, dossier, recherche, annonce, visite, bail, installation et CAF.
2. Aides et droits : situation, ressources, simulation officielle, pistes et suivi.
3. Documents essentiels : identité, études, banque, logement, santé, impôts et rangement.
4. Santé administrative : Ameli, carte Vitale, médecin, mutuelle et contacts.
5. Premiers impôts : foyer fiscal, numéro fiscal, revenus, déclaration et archivage.
6. Déménagement : dates, préavis, contrats, adresse, sortie et arrivée.
7. Qui contacter : sujet, contexte, preuves, canal, message et suivi.

## Principes produit

1. L’utilisateur est guidé en permanence et peut continuer même lorsqu’il ne connaît pas une réponse.
2. TutoVie prépare et suit les démarches sans se substituer aux organismes publics.
3. Une aide, une règle ou une obligation doit être confirmée par une source officielle à jour.
4. Les données sensibles ne doivent pas être demandées sans nécessité.
5. Les documents réels devront être chiffrés, supprimables et soumis à une durée de conservation explicite.
6. L’interface desktop n’est pas un simple mobile étiré : elle utilise une navigation latérale, un contenu central et une aide permanente.

## Organisation

```text
app/index.tsx       Application et moteur de parcours
src/data.ts         Parcours, documents et textes d’aide
src/storage.ts      Sauvegarde locale et migration du prototype
src/types.ts        Modèles TypeScript
src/ui.tsx          Composants et navigation responsive
```

## Limites actuelles

- aucune authentification réelle ;
- aucun backend ;
- aucune synchronisation entre appareils ;
- aucun téléversement réel ;
- aucune analyse IA distante ;
- aucune notification ;
- aucune démarche envoyée automatiquement ;
- sources non administrables depuis un CMS.
