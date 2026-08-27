import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import AppShell from '@/src/app-shell';
import { AuthScreen, OnboardingScreen, PreparingScreen, SplashScreen, WelcomeScreen } from '@/src/entry-screens';
import FlowEngine, { createEmptyProgress } from '@/src/flow-engine';
import { journeyById } from '@/src/journeys';
import { AssistantScreen, HomeScreen, ProfileScreen, RoadmapScreen, VaultScreen } from '@/src/screens';
import { clearSnapshot, defaultSnapshot, loadSnapshot, saveSnapshot } from '@/src/storage';
import type {
  AppSnapshot,
  AppTab,
  DocumentStatus,
  JourneyDefinition,
  JourneyId,
  JourneyProgress,
  UserProfile,
} from '@/src/types';

export default function TutoVieApp() {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(defaultSnapshot);
  const [hydrated, setHydrated] = useState(false);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    void loadSnapshot().then((stored) => {
      if (stored) setSnapshot(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) void saveSnapshot(snapshot);
  }, [hydrated, snapshot]);

  const patch = (next: Partial<AppSnapshot>) => setSnapshot((current) => ({ ...current, ...next }));
  const patchProfile = (next: Partial<UserProfile>) => setSnapshot((current) => ({ ...current, profile: { ...current.profile, ...next } }));
  const setTab = (selectedTab: AppTab) => patch({ selectedTab });
  const openJourney = (journey: JourneyDefinition) => patch({ activeJourneyId: journey.id });
  const activeJourney = snapshot.activeJourneyId ? journeyById[snapshot.activeJourneyId] : null;

  const activeProgress = useMemo<JourneyProgress>(() => {
    if (!activeJourney) return createEmptyProgress();
    return snapshot.journeyProgress[activeJourney.id] ?? createEmptyProgress();
  }, [activeJourney, snapshot.journeyProgress]);

  const updateProgress = (journeyId: JourneyId, progress: JourneyProgress) => {
    setSnapshot((current) => ({
      ...current,
      journeyProgress: { ...current.journeyProgress, [journeyId]: progress },
    }));
  };

  const finishOnboarding = () => setPreparing(true);
  const finishPreparing = useCallback(() => {
    setPreparing(false);
    patch({ stage: 'app', selectedTab: 'home', activeJourneyId: null });
  }, []);

  const completeJourney = () => {
    patch({ activeJourneyId: null, selectedTab: 'roadmap' });
  };

  const reset = () => {
    Alert.alert(
      'Réinitialiser la maquette ?',
      'Le profil, les réponses aux parcours et les statuts de documents seront supprimés de ce navigateur.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => void clearSnapshot().then(() => setSnapshot(defaultSnapshot)),
        },
      ],
    );
  };

  if (!hydrated) return <SplashScreen />;
  if (preparing) return <PreparingScreen onDone={finishPreparing} />;

  if (activeJourney) {
    return (
      <FlowEngine
        journey={activeJourney}
        progress={activeProgress}
        completed={activeProgress.status === 'completed'}
        onChange={(progress) => updateProgress(activeJourney.id, progress)}
        onClose={() => patch({ activeJourneyId: null })}
        onComplete={completeJourney}
      />
    );
  }

  if (snapshot.stage === 'welcome') {
    return <WelcomeScreen onStart={() => patch({ stage: 'auth' })} onDemo={() => patch({ stage: 'onboarding', onboardingStep: 0, demoSignedIn: false })} />;
  }

  if (snapshot.stage === 'auth') {
    return (
      <AuthScreen
        email={snapshot.profile.email}
        onEmail={(email) => patchProfile({ email })}
        onBack={() => patch({ stage: 'welcome' })}
        onContinue={() => patch({ stage: 'onboarding', onboardingStep: 0, demoSignedIn: true })}
      />
    );
  }

  if (snapshot.stage === 'onboarding') {
    return <OnboardingScreen snapshot={snapshot} patch={patch} patchProfile={patchProfile} onFinish={finishOnboarding} />;
  }

  return (
    <AppShell active={snapshot.selectedTab} onChange={setTab} firstName={snapshot.profile.firstName}>
      <MainApp
        snapshot={snapshot}
        onTab={setTab}
        onOpenJourney={openJourney}
        onDocumentStatesChange={(documentStates) => patch({ documentStates })}
        onProfileChange={(profile) => patch({ profile })}
        onReset={reset}
      />
    </AppShell>
  );
}

function MainApp({
  snapshot,
  onTab,
  onOpenJourney,
  onDocumentStatesChange,
  onProfileChange,
  onReset,
}: {
  snapshot: AppSnapshot;
  onTab: (tab: AppTab) => void;
  onOpenJourney: (journey: JourneyDefinition) => void;
  onDocumentStatesChange: (states: Record<string, DocumentStatus>) => void;
  onProfileChange: (profile: UserProfile) => void;
  onReset: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      {snapshot.selectedTab === 'home' ? <HomeScreen snapshot={snapshot} onOpenJourney={onOpenJourney} onTab={onTab} /> : null}
      {snapshot.selectedTab === 'roadmap' ? <RoadmapScreen snapshot={snapshot} onOpenJourney={onOpenJourney} /> : null}
      {snapshot.selectedTab === 'assistant' ? <AssistantScreen onOpenJourney={onOpenJourney} /> : null}
      {snapshot.selectedTab === 'vault' ? <VaultScreen documentStates={snapshot.documentStates} onChange={onDocumentStatesChange} /> : null}
      {snapshot.selectedTab === 'profile' ? <ProfileScreen snapshot={snapshot} onProfileChange={onProfileChange} onReset={onReset} /> : null}
    </View>
  );
}
