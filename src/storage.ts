import { Platform } from 'react-native';
import type { AppSnapshot, UserProfile } from './types';

const STORAGE_KEY = 'tutovie.snapshot.v1';

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
  completedTaskIds: [],
  selectedTab: 'home',
  onboardingStep: 0,
};

export async function loadSnapshot(): Promise<AppSnapshot | null> {
  if (Platform.OS !== 'web') return null;
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppSnapshot;
  } catch {
    return null;
  }
}

export async function saveSnapshot(snapshot: AppSnapshot): Promise<void> {
  if (Platform.OS !== 'web') return;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable in private browsing. The app still works in memory.
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
