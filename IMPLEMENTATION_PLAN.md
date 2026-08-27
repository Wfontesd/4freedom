# Plan de réalisation de TutoVie

## État actuel : maquette V0.2

La V0.2 valide l’expérience complète avant tout backend : onboarding, navigation mobile/desktop, quinze parcours, formulaires assistés, valeurs inconnues, résultats, coffre documentaire et états de compte simulés.

## Phase 1 — validation produit

Tester la maquette avec des étudiants en recherche de premier logement, déjà installés et étudiants internationaux. Mesurer : compréhension de chaque question, abandon par étape, valeur du récapitulatif, capacité à effectuer la prochaine action et confiance dans les sources.

Seuils proposés :

- au moins 80 % des testeurs terminent le parcours budget ;
- au moins 70 % savent expliquer leur prochaine action sans aide ;
- moins de 10 % des champs sont jugés incompréhensibles ;
- aucune personne ne croit que TutoVie décide de son éligibilité.

## Phase 2 — comptes et synchronisation

Brancher une authentification par lien magique, Apple et Google. Conserver un mode anonyme. Prévoir la migration des réponses locales, la gestion des sessions, l’export et la suppression du compte.

## Phase 3 — registre éditorial

Sortir les textes administratifs du code et créer un registre versionné : source officielle, date de vérification, territoire, conditions, responsable éditorial et historique des changements. Une règle expirée doit pouvoir désactiver automatiquement le parcours concerné.

## Phase 4 — documents

Ajouter caméra, import, OCR, classification et chiffrement. L’analyse ne doit jamais envoyer automatiquement un document à un organisme. L’utilisateur valide chaque extraction, chaque masquage et chaque durée de conservation.

## Phase 5 — IA sourcée

Limiter l’IA à l’explication, l’extraction et l’orientation. Les faits administratifs proviennent d’un contenu validé. En cas d’incertitude, l’assistant doit demander une information, afficher qu’il ne sait pas ou orienter vers un humain.

## Phase 6 — intégrations

Préparer des connecteurs sans automatiser des décisions : ouverture du bon site officiel, préremplissage local, génération de checklist, suivi du statut déclaré par l’utilisateur et rappels de relance.

## Phase 7 — notifications

Uniquement des rappels utiles : échéance, document expirant, réponse attendue et parcours interrompu. Aucun XP, aucune streak et aucune notification d’engagement artificiel.

## Phase 8 — mobile natif

Utiliser EAS Build pour Android et iOS. Brancher caméra, notifications, partage de fichiers, biométrie et stockage sécurisé via des adaptateurs natifs, sans dupliquer le moteur de parcours.

## Phase 9 — desktop

Conserver Expo Web pour l’interface navigateur et PWA. Ajouter glisser-déposer, raccourcis clavier, impression, export des récapitulatifs et comparaison de documents. Une application native Windows/macOS pourra ensuite envelopper le frontend avec Electron/Tauri ou utiliser un port React Native dédié si le besoin est validé.
