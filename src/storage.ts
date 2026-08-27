import { Platform } from 'react-native';
import { documents } from './data';
import type { AppSnapshot, DocumentStatus, UserProfile } from './types';

const STORAGE_KEY = 'tutovie.snapshot.v2';

export const emptyProfile: UserProfile = {
  firstName: '',
  email: '',
  age: '',
  city: '',
  housingStatus: null,
  needs: [],
  livesAlone: 'unknown',
  studyStatus: 'student',
};

const initialDocumentStates = Object.fromEntries(
  documents.map((document) => [document.id, 'missing' as DocumentStatus]),
);

export const defaultSnapshot: AppSnapshot = {
  stage: 'welcome',
  profile: emptyProfile,
  selectedTab: 'home',
  onboardingStep: 0,
  activeJourneyId: null,
  journeyProgress: {},
  documentStates: initialDocumentStates,
  demoSignedIn: false,
};

function normalizeSnapshot(value: Partial<AppSnapshot>): AppSnapshot {
  return {
    ...defaultSnapshot,
    ...value,
    profile: { ...emptyProfile, ...(value.profile ?? {}) },
    journeyProgress: value.journeyProgress ?? {},
    documentStates: { ...initialDocumentStates, ...(value.documentStates ?? {}) },
    activeJourneyId: value.activeJourneyId ?? null,
  };
}

export async function loadSnapshot(): Promise<AppSnapshot | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeSnapshot(JSON.parse(raw) as Partial<AppSnapshot>);
  } catch {
    return null;
  }
}

export async function saveSnapshot(snapshot: AppSnapshot): Promise<void> {
  if (Platform.OS !== 'web') return;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // La maquette reste utilisable en mémoire si le stockage est indisponible.
  }
}

export async function clearSnapshot(): Promise<void> {
  if (Platform.OS !== 'web') return;
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore les erreurs de stockage dans le prototype.
  }
}
