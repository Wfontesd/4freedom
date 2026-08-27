# Plan de réalisation de TutoVie

## 1. Vision de la première version

La première version commercialement testable ne cherche pas à couvrir toute la vie adulte. Elle répond à un seul moment très concret :

> « Je quitte mes parents et je cherche ou viens d’obtenir mon premier logement étudiant en France. Qu’est-ce que je dois faire, dans quel ordre et avec quels documents ? »

Le produit doit accompagner l’utilisateur depuis la préparation de son budget jusqu’à son installation : dossier locatif, garantie, prévention des arnaques, bail, assurance, état des lieux, aide au logement, changement d’adresse et documents à conserver.

## 2. État actuel — prototype livré

Le prototype permet déjà de tester :

- la promesse et le ton de marque ;
- le parcours de connexion ou d’utilisation anonyme ;
- un onboarding court et personnalisé ;
- la hiérarchie « prochaine étape / à anticiper / plus tard » ;
- la fiche détaillée d’une démarche ;
- le système de progression ;
- la place du coffre documentaire ;
- l’assistant contextuel ;
- la navigation mobile et les animations essentielles.

Les éléments simulés sont explicitement signalés dans l’interface.

## 3. Phase 1 — validation utilisateur

### Objectif

Vérifier que le problème est assez douloureux et que l’interface est comprise sans explication.

### Protocole

- 20 étudiants de 17 à 25 ans préparant un premier logement ;
- 5 étudiants internationaux ;
- 5 parents ou accompagnateurs ;
- sessions de 20 à 30 minutes ;
- observation sans guider l’utilisateur ;
- entretien après le parcours.

### Mesures minimales

- au moins 80 % terminent l’onboarding ;
- au moins 70 % savent expliquer la prochaine action proposée ;
- au moins 60 % reviennent dans les sept jours ;
- au moins 50 % ajoutent ou cochent une démarche réelle ;
- score de confiance supérieur à 7/10 ;
- moins de 10 % interprètent TutoVie comme une source juridique officielle.

### Décision

Ne pas développer le backend complet tant que les étudiants ne réutilisent pas spontanément la roadmap.

## 4. Phase 2 — fondations de production

### Authentification

- mode anonyme local dès l’ouverture ;
- création de compte par lien magique ;
- Google et Apple sur mobile ;
- conversion transparente du compte anonyme vers un compte synchronisé ;
- consentement séparé pour le stockage des documents.

### Backend proposé

- Supabase Auth pour l’identité ;
- PostgreSQL pour profils, parcours et progression ;
- Storage privé pour les documents ;
- fonctions serveur pour l’IA et les intégrations ;
- Row Level Security sur chaque table ;
- journal des accès aux documents.

### Modèles principaux

- `profiles`
- `situations`
- `journeys`
- `tasks`
- `task_templates`
- `task_completions`
- `documents`
- `official_sources`
- `source_reviews`
- `assistant_threads`
- `notifications`

### Critères d’acceptation

- reprise du parcours sur deux appareils ;
- suppression complète du compte depuis l’application ;
- aucune URL publique directe vers un document privé ;
- isolation vérifiée entre deux comptes ;
- export des données personnelles.

## 5. Phase 3 — registre de sources officielles

Le cœur défendable de TutoVie n’est pas un chatbot. C’est un registre éditorial structuré.

Chaque source doit contenir :

- organisme ;
- URL canonique ;
- territoire concerné ;
- situation visée ;
- date de dernière vérification ;
- date de prochaine revue ;
- résumé rédigé ;
- documents demandés ;
- conditions et exceptions ;
- étapes associées ;
- statut : actif, à revoir ou archivé.

### Règle de publication

Une tâche ne peut pas être affichée comme « vérifiée » si sa source a dépassé sa date de revue.

### Back-office minimal

- ajouter ou modifier une source ;
- comparer une page officielle à la version précédente ;
- marquer une règle comme potentiellement modifiée ;
- valider manuellement une mise à jour ;
- connaître les utilisateurs concernés par la modification.

## 6. Phase 4 — assistant IA sourcé

### Rôle autorisé

- reformuler un courrier ;
- expliquer un terme administratif ;
- retrouver la tâche pertinente ;
- poser les questions manquantes ;
- produire une checklist à partir des règles déjà validées ;
- citer la source officielle utilisée.

### Rôle interdit

- inventer une éligibilité ;
- annoncer qu’une personne « a droit » à une aide sans confirmation officielle ;
- produire un conseil juridique définitif ;
- envoyer une démarche sans validation ;
- interpréter librement un document médical ou fiscal sensible.

### Architecture

1. classification déterministe de la demande ;
2. récupération des sources validées correspondant au profil ;
3. génération d’une réponse structurée ;
4. vérification automatique que chaque affirmation sensible possède une source ;
5. affichage de la date de vérification ;
6. possibilité de signaler une réponse.

### Coûts

- petit modèle pour classification et extraction ;
- modèle plus puissant uniquement pour les demandes complexes ;
- mise en cache des explications communes ;
- limites d’usage visibles ;
- suivi du coût moyen par utilisateur actif.

## 7. Phase 5 — coffre documentaire

### V1

- ajout manuel d’un PDF ou d’une photo ;
- type de document choisi par l’utilisateur ;
- rappel d’expiration ;
- rattachement d’un document à une démarche ;
- suppression immédiate possible ;
- stockage privé.

### V2

- OCR local lorsque possible ;
- détection assistée du type de document ;
- extraction de dates ;
- vérification de lisibilité ;
- masquage guidé avant partage ;
- export temporaire d’un dossier.

L’application ne doit jamais considérer automatiquement qu’un document est juridiquement valide.

## 8. Phase 6 — notifications utiles

Les notifications doivent être rares et actionnables :

- échéance à J-7 et J-1 ;
- document expirant ;
- source officielle modifiée ;
- démarche bloquée faute de pièce ;
- suivi explicitement demandé par l’utilisateur.

Aucune notification générique destinée seulement à augmenter l’ouverture de l’application.

## 9. Phase 7 — applications mobiles

Le projet Expo permet de conserver les composants et la logique produit pour :

- PWA et site web ;
- application Android ;
- application iOS.

Travaux spécifiques :

- stockage sécurisé des secrets ;
- caméra et sélecteur de documents ;
- biométrie optionnelle pour le coffre ;
- liens universels ;
- notifications push ;
- gestion du clavier et des zones sûres ;
- tests sur petits écrans et appareils accessibles ;
- préparation App Store et Google Play.

## 10. Découpage prévisionnel

### Lot A — bêta logement

- backend et authentification ;
- roadmap synchronisée ;
- 25 à 40 tâches logement validées ;
- registre de sources ;
- notifications e-mail ;
- analytics respectueux de la vie privée.

### Lot B — assistant et documents

- assistant sourcé ;
- coffre privé ;
- analyse de courrier ;
- rappels d’expiration ;
- signalement d’erreur.

### Lot C — mobile

- caméra ;
- notifications push ;
- biométrie ;
- builds iOS et Android ;
- distribution bêta.

### Lot D — élargissement

- santé administrative ;
- première déclaration fiscale ;
- déménagement ;
- étudiants internationaux ;
- partenariats avec établissements et associations.

## 11. Indicateurs de réussite

- activation : première démarche ouverte ;
- valeur : première démarche terminée ;
- rétention à J7 et J30 ;
- pourcentage de parcours encore actifs après un changement de situation ;
- taux de clic vers une source officielle ;
- taux de signalement et correction ;
- nombre de démarches évitées ou finalisées déclaré par l’utilisateur ;
- coût IA par utilisateur actif ;
- taux de suppression des comptes et documents traité dans le délai annoncé.

## 12. Risques prioritaires

1. Informations obsolètes : registre éditorial et dates de revue obligatoires.
2. Faux sentiment de certitude : vocabulaire prudent et validation officielle.
3. Données sensibles : stockage facultatif, privé et supprimable.
4. Produit trop large : commencer exclusivement par le premier logement.
5. Faible volonté de payer des étudiants : tester un modèle freemium et des licences établissements.
6. Assistant facilement remplaçable : la valeur doit venir de la mémoire du parcours, de la roadmap et des sources vérifiées.
