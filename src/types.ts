export type AppStage = 'welcome' | 'auth' | 'onboarding' | 'app';
export type AppTab = 'home' | 'journeys' | 'documents' | 'assistant' | 'profile';
export type HousingStatus = 'parents' | 'searching' | 'tenant' | 'residence';
export type GoalId = 'housing' | 'benefits' | 'documents' | 'health' | 'taxes' | 'moving';
export type JourneyId = 'first-home' | 'benefits' | 'documents' | 'health' | 'taxes' | 'moving' | 'contact-router';
export type JourneyStatus = 'not_started' | 'in_progress' | 'completed';
export type AnswerValue = string | number | boolean | string[] | Record<string, string>;

export interface UserProfile {
  firstName: string;
  email: string;
  age: string;
  city: string;
  housingStatus: HousingStatus | null;
  flags: string[];
  goals: GoalId[];
}

export interface StepField {
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  inputMode?: 'text' | 'numeric' | 'email';
  suffix?: string;
}

export interface JourneyOption {
  id: string;
  label: string;
  caption?: string;
  emoji?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  hint?: string;
}

export interface JourneyStep {
  id: string;
  kind: 'intro' | 'form' | 'single' | 'multi' | 'checklist' | 'budget' | 'text' | 'upload' | 'external' | 'summary';
  eyebrow: string;
  title: string;
  description: string;
  why: string;
  help: string[];
  fields?: StepField[];
  options?: JourneyOption[];
  checklist?: ChecklistItem[];
  placeholder?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  ctaLabel?: string;
}

export interface JourneyDefinition {
  id: JourneyId;
  title: string;
  shortTitle: string;
  subtitle: string;
  icon: string;
  outcome: string;
  estimatedTime: string;
  steps: JourneyStep[];
  recommendedFor: GoalId[];
}

export interface JourneyProgress {
  stepIndex: number;
  status: JourneyStatus;
  answers: Record<string, AnswerValue>;
  completedStepIds: string[];
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  label: string;
  category: 'Identité' | 'Études' | 'Banque' | 'Logement' | 'Santé' | 'Impôts';
  why: string;
  where: string;
  status: 'missing' | 'ready' | 'checking';
}

export interface AppSnapshot {
  stage: AppStage;
  profile: UserProfile;
  selectedTab: AppTab;
  onboardingStep: number;
  journeys: Partial<Record<JourneyId, JourneyProgress>>;
  documents: Record<string, 'missing' | 'ready' | 'checking'>;
}
