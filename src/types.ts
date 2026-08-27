export type AppStage = 'welcome' | 'auth' | 'onboarding' | 'generating' | 'app';
export type AppTab = 'home' | 'roadmap' | 'assistant' | 'vault' | 'profile';
export type HousingStatus = 'parents' | 'searching' | 'tenant' | 'residence';
export type GoalId = 'housing' | 'benefits' | 'documents' | 'health' | 'moving';
export type TaskStatus = 'todo' | 'active' | 'done';
export type TaskCategory = 'Logement' | 'Aides' | 'Documents' | 'Santé' | 'Impôts';

export interface UserProfile {
  firstName: string;
  email: string;
  age: string;
  city: string;
  housingStatus: HousingStatus | null;
  flags: string[];
  goals: GoalId[];
}

export interface LifeTask {
  id: string;
  title: string;
  subtitle: string;
  category: TaskCategory;
  duration: string;
  timing: string;
  priority: 'urgent' | 'soon' | 'later';
  why: string;
  documents: string[];
  steps: string[];
  sourceLabel: string;
  sourceUrl: string;
}

export interface VaultDocument {
  id: string;
  label: string;
  hint: string;
  status: 'ready' | 'missing' | 'expires';
  expiresAt?: string;
}

export interface AppSnapshot {
  stage: AppStage;
  profile: UserProfile;
  completedTaskIds: string[];
  selectedTab: AppTab;
  onboardingStep: number;
}
