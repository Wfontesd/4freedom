export type AppStage = 'welcome' | 'auth' | 'onboarding' | 'app';
export type AppTab = 'home' | 'roadmap' | 'assistant' | 'vault' | 'profile';
export type HousingStatus = 'parents' | 'searching' | 'tenant' | 'residence';
export type StudyStatus = 'student' | 'apprentice' | 'internship' | 'international' | 'other';
export type YesNoUnknown = 'yes' | 'no' | 'unknown';
export type NeedId = 'housing' | 'benefits' | 'documents' | 'health' | 'tax' | 'moving' | 'problem';

export type JourneyId =
  | 'budget-logement'
  | 'recherche-logement'
  | 'dossier-locatif'
  | 'garant-visale'
  | 'verifier-annonce'
  | 'comprendre-bail'
  | 'emmenagement'
  | 'caf-logement'
  | 'radar-aides'
  | 'papiers-essentiels'
  | 'sante'
  | 'premiers-impots'
  | 'demenagement'
  | 'comprendre-courrier'
  | 'qui-contacter';

export type JourneyCategory = 'Logement' | 'Aides' | 'Documents' | 'Santé' | 'Impôts' | 'Urgence';
export type AnswerValue = string | number | boolean | string[] | null;
export type JourneyAnswers = Record<string, AnswerValue>;
export type JourneyFieldKind = 'text' | 'longText' | 'money' | 'number' | 'date' | 'choice' | 'multi' | 'checklist';
export type JourneyStatus = 'not-started' | 'in-progress' | 'completed';
export type DocumentStatus = 'missing' | 'ready' | 'review';

export interface UserProfile {
  firstName: string;
  email: string;
  age: string;
  city: string;
  housingStatus: HousingStatus | null;
  needs: NeedId[];
  livesAlone: YesNoUnknown;
  studyStatus: StudyStatus;
}

export interface ChoiceOption {
  id: string;
  label: string;
  caption?: string;
  emoji?: string;
}

export interface JourneySource {
  label: string;
  url: string;
  checkedAt: string;
}

export interface JourneyField {
  key: string;
  label: string;
  kind: JourneyFieldKind;
  placeholder?: string;
  suffix?: string;
  helper?: string;
  required?: boolean;
  allowUnknown?: boolean;
  options?: ChoiceOption[];
}

export interface JourneyStep {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  helpTitle?: string;
  helpText?: string;
  fields: JourneyField[];
}

export interface JourneyDefinition {
  id: JourneyId;
  title: string;
  shortTitle: string;
  description: string;
  category: JourneyCategory;
  icon: string;
  duration: string;
  timing: string;
  color: string;
  source: JourneySource;
  secondarySource?: JourneySource;
  steps: JourneyStep[];
}

export interface JourneyProgress {
  currentStep: number;
  answers: JourneyAnswers;
  status: JourneyStatus;
  updatedAt: string;
  completedAt?: string;
}

export interface JourneyMetric {
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'warning' | 'danger';
}

export interface JourneyResult {
  title: string;
  summary: string;
  metrics: JourneyMetric[];
  nextActions: string[];
  watchOut?: string[];
  preparedItems?: string[];
}

export interface DocumentDefinition {
  id: string;
  label: string;
  category: string;
  description: string;
  examples: string[];
  why: string;
  renewal?: string;
}

export interface AppSnapshot {
  stage: AppStage;
  profile: UserProfile;
  selectedTab: AppTab;
  onboardingStep: number;
  activeJourneyId: JourneyId | null;
  journeyProgress: Partial<Record<JourneyId, JourneyProgress>>;
  documentStates: Record<string, DocumentStatus>;
  demoSignedIn: boolean;
}
