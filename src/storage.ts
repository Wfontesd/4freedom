import { Platform } from 'react-native';
import type { AppSnapshot, UserProfile } from './types';

const STORAGE_KEY = 'tutovie.snapshot.v2';

export const emptyProfile: UserProfile = {
  firstName: '',
  email: '',
  age: '',
  city: '',
  housingStatus: null,
  flags: [],
  goals: [],
};

export const defaultSnapshot: AppSnapshot = {
  stage: 'welcome',
  profile: emptyProfile,
  selectedTab: 'home',
  onboardingStep: 0,
  journeys: {},
  documents: {},
};

function normalizeSnapshot(value: Partial<AppSnapshot> | null): AppSnapshot | null {
  if (!value) return null;
  const legacyTab = value.selectedTab as string | undefined;
  const selectedTab = legacyTab === 'roadmap' ? 'journeys' : legacyTab;
  return {
    ...defaultSnapshot,
    ...value,
    selectedTab: ['home', 'journeys', 'documents', 'assistant', 'profile'].includes(selectedTab ?? '')
      ? selectedTab as AppSnapshot['selectedTab']
      : 'home',
    profile: { ...emptyProfile, ...(value.profile ?? {}) },
    journeys: value.journeys ?? {},
    documents: value.documents ?? {},
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
    // The prototype remains usable in memory when browser storage is unavailable.
  }
}

export async function clearSnapshot(): Promise<void> {
  if (Platform.OS !== 'web') return;
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors in demo mode.
  }
}
