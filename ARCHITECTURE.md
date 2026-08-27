# Architecture cible

## Vue d’ensemble

```text
Expo iOS / Android / Web
        │
        ├── Mode anonyme local
        │
        └── Compte synchronisé
                │
                ▼
       API et authentification
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
 PostgreSQL   Storage   Fonctions IA
       │        privé      │
       └────────┬───────────┘
                ▼
       Registre de sources
                │
                ▼
   Back-office de vérification
```

## Frontend

- Expo Router pour la navigation universelle ;
- composants React Native partagés ;
- thème centralisé ;
- état serveur séparé de l’état local ;
- cache hors ligne des tâches déjà chargées ;
- interfaces par feature : onboarding, journey, task, assistant, vault, profile ;
- télémétrie minimale et désactivable.

## Backend

La proposition initiale est Supabase afin de réduire le temps d’infrastructure : authentification, base PostgreSQL, stockage privé et fonctions serveur peuvent être réunis derrière un seul projet. Cette décision reste remplaçable grâce à une couche `services/` dans l’application.

## Contrats de service prévus

```ts
interface AuthService {
  signInWithMagicLink(email: string): Promise<void>;
  signInWithProvider(provider: 'google' | 'apple'): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}

interface JourneyService {
  getCurrentJourney(): Promise<Journey>;
  completeTask(taskId: string): Promise<void>;
  reopenTask(taskId: string): Promise<void>;
}

interface DocumentService {
  upload(input: LocalDocument): Promise<StoredDocument>;
  createTemporaryShare(documentIds: string[]): Promise<ShareToken>;
  delete(documentId: string): Promise<void>;
}

interface AssistantService {
  ask(input: AssistantRequest): Promise<SourcedAnswer>;
}
```

## Réponse IA structurée

```ts
type SourcedAnswer = {
  answer: string;
  confidence: 'high' | 'medium' | 'needs-human-check';
  sources: Array<{
    id: string;
    title: string;
    url: string;
    verifiedAt: string;
  }>;
  proposedTasks: string[];
  missingInformation: string[];
};
```

Une réponse sensible sans source valide doit être rejetée côté serveur et remplacée par une orientation vers l’organisme compétent.

## Sécurité

- aucune clé de fournisseur IA dans le client ;
- règles d’accès au niveau des lignes ;
- stockage privé et URLs temporaires ;
- chiffrement en transit et au repos ;
- limitation de débit ;
- validation des fichiers ;
- journal d’accès ;
- durée de conservation configurable ;
- suppression de compte et de fichiers testée automatiquement ;
- environnement de démonstration sans données réelles.

## Déploiement

- GitHub Actions : typage et export web ;
- GitHub Pages : prototype public statique ;
- EAS Build : builds de test iOS et Android ;
- EAS Update seulement après définition d’une politique de version et de retour arrière ;
- backend séparé par environnements `development`, `staging` et `production`.
