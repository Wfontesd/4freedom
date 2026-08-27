import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  assistantSuggestions,
  colors,
  documentCatalog,
  flagOptions,
  getJourney,
  goalOptions,
  housingOptions,
  journeys,
} from '@/src/data';
import { clearSnapshot, defaultSnapshot, loadSnapshot, saveSnapshot } from '@/src/storage';
import type {
  AnswerValue,
  AppSnapshot,
  AppTab,
  DocumentItem,
  JourneyDefinition,
  JourneyId,
  JourneyProgress,
  JourneyStep,
  UserProfile,
} from '@/src/types';
import {
  BrandMark,
  CheckboxRow,
  ChoiceCard,
  DesktopNav,
  Field,
  GhostButton,
  MobileNav,
  Pill,
  PrimaryButton,
  ProgressBar,
  ScreenShell,
  SecondaryButton,
  SectionTitle,
  uiStyles,
} from '@/src/ui';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  journeyId?: JourneyId;
};

const UNKNOWN_KEY = '__unknown__';

function createJourneyProgress(): JourneyProgress {
  return {
    stepIndex: 0,
    status: 'not_started',
    answers: {},
    completedStepIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export default function TutoVieApp() {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(defaultSnapshot);
  const [hydrated, setHydrated] = useState(false);
  const [activeJourneyId, setActiveJourneyId] = useState<JourneyId | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'hello',
      role: 'assistant',
      text: 'Explique-moi ce que tu essaies de faire. Je peux t’orienter vers un parcours précis et te dire quoi préparer.',
    },
  ]);

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
  const patchProfile = (next: Partial<UserProfile>) => {
    setSnapshot((current) => ({ ...current, profile: { ...current.profile, ...next } }));
  };

  const updateJourney = (id: JourneyId, updater: (current: JourneyProgress) => JourneyProgress) => {
    setSnapshot((current) => {
      const previous = current.journeys[id] ?? createJourneyProgress();
      return {
        ...current,
        journeys: {
          ...current.journeys,
          [id]: updater(previous),
        },
      };
    });
  };

  const updateDocument = (id: string, status: DocumentItem['status']) => {
    setSnapshot((current) => ({
      ...current,
      documents: { ...current.documents, [id]: status },
    }));
  };

  const reset = async () => {
    let confirmed = true;
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      confirmed = globalThis.confirm('Réinitialiser toutes les données locales de la démo ?');
    } else {
      Alert.alert('Réinitialiser TutoVie ?', 'Toutes les données locales seront supprimées.');
    }
    if (!confirmed) return;
    await clearSnapshot();
    setActiveJourneyId(null);
    setSnapshot(defaultSnapshot);
  };

  if (!hydrated) return <Splash />;

  if (snapshot.stage === 'welcome') {
    return <Welcome onStart={() => patch({ stage: 'auth' })} onDemo={() => patch({ stage: 'onboarding', onboardingStep: 0 })} />;
  }

  if (snapshot.stage === 'auth') {
    return (
      <Auth
        email={snapshot.profile.email}
        onEmail={(email) => patchProfile({ email })}
        onBack={() => patch({ stage: 'welcome' })}
        onContinue={() => patch({ stage: 'onboarding', onboardingStep: 0 })}
      />
    );
  }

  if (snapshot.stage === 'onboarding') {
    return (
      <Onboarding
        snapshot={snapshot}
        patch={patch}
        patchProfile={patchProfile}
        onFinish={() => patch({ stage: 'app', selectedTab: 'home' })}
      />
    );
  }

  return (
    <MainSite
      snapshot={snapshot}
      activeJourneyId={activeJourneyId}
      messages={messages}
      onMessages={setMessages}
      onPatch={patch}
      onOpenJourney={setActiveJourneyId}
      onCloseJourney={() => setActiveJourneyId(null)}
      onUpdateJourney={updateJourney}
      onUpdateDocument={updateDocument}
      onReset={() => void reset()}
    />
  );
}

function Splash() {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.center}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}><BrandMark /></Animated.View>
      <Text style={styles.muted}>Le mode d’emploi de la vie autonome.</Text>
    </View>
  );
}

function Welcome({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -7, duration: 1450, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1450, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [float]);

  return (
    <ScreenShell contentStyle={styles.welcomeShell}>
      <View style={styles.welcomeTop}><BrandMark /></View>
      <View style={[styles.welcomeGrid, desktop && styles.welcomeGridDesktop]}>
        <View style={[styles.welcomeCopy, desktop && styles.welcomeCopyDesktop]}>
          <Pill>LE TUTO QUE PERSONNE NE T’A DONNÉ</Pill>
          <Text style={[styles.welcomeTitle, desktop && styles.welcomeTitleDesktop]}>Tu sais ce que tu veux faire. Pas forcément les démarches autour.</Text>
          <Text style={styles.welcomeSubtitle}>TutoVie transforme ta situation en parcours guidés : quoi faire, dans quel ordre, quels documents préparer et qui contacter.</Text>
          <View style={[styles.welcomeActions, desktop && styles.welcomeActionsDesktop]}>
            <View style={desktop ? styles.welcomeActionButton : undefined}>
              <PrimaryButton label="Créer mon parcours" icon="→" onPress={onStart} />
            </View>
            <View style={desktop ? styles.welcomeActionButton : undefined}>
              <SecondaryButton label="Tester sans compte" onPress={onDemo} />
            </View>
          </View>
          <Text style={styles.caption}>La connexion, les dépôts et les appels sont simulés dans cette maquette.</Text>
        </View>
        <Animated.View style={[styles.welcomePreview, desktop && styles.welcomePreviewDesktop, { transform: [{ translateY: float }] }]}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewEyebrow}>PROCHAINE ACTION</Text>
              <Text style={styles.previewTitle}>Calculer ton vrai budget</Text>
            </View>
            <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>8 min</Text></View>
          </View>
          <View style={styles.previewQuestion}>
            <Text style={styles.previewQuestionLabel}>Tu connais ton revenu mensuel moyen ?</Text>
            <View style={styles.fakeInput}><Text style={styles.fakeInputText}>Ex. 840 €</Text></View>
            <View style={styles.fakeHelp}><Text style={styles.fakeHelpTitle}>Tu ne sais pas ?</Text><Text style={styles.fakeHelpText}>On t’explique où trouver chaque montant et tu peux continuer sans réponse.</Text></View>
          </View>
          <View style={styles.previewFooter}><Text style={styles.previewFooterText}>Étape 2 sur 12</Text><View style={styles.previewLine}><View style={styles.previewLineFill} /></View></View>
        </Animated.View>
      </View>
    </ScreenShell>
  );
}

function Auth({ email, onEmail, onBack, onContinue }: { email: string; onEmail: (value: string) => void; onBack: () => void; onContinue: () => void }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <ScreenShell contentStyle={styles.authShell} maxWidth={980}>
      <View style={styles.topRow}><GhostButton label="← Retour" onPress={onBack} /><BrandMark compact /></View>
      <View style={[styles.authGrid, desktop && styles.authGridDesktop]}>
        <View style={styles.authIntro}>
          <Text style={uiStyles.eyebrow}>CONNEXION</Text>
          <Text style={uiStyles.title}>Retrouve ton avancement sur tous tes écrans.</Text>
          <Text style={uiStyles.subtitle}>Pour la maquette, les boutons passent directement à l’onboarding. L’interface est prête pour un lien magique, Google ou Apple.</Text>
          <View style={styles.securityCard}>
            <Text style={styles.securityTitle}>Prévu pour la vraie version</Text>
            <Text style={styles.securityLine}>• Pas de mot de passe à mémoriser</Text>
            <Text style={styles.securityLine}>• Mode découverte sans compte</Text>
            <Text style={styles.securityLine}>• Suppression du compte et des données</Text>
          </View>
        </View>
        <View style={[uiStyles.card, styles.stack]}>
          <Field label="Adresse e-mail" value={email} onChangeText={onEmail} placeholder="prenom@ecole.fr" keyboardType="email-address" autoCapitalize="none" />
          <PrimaryButton label="Recevoir mon lien magique" onPress={onContinue} disabled={!email.includes('@')} />
          <View style={styles.separator}><View style={styles.separatorLine} /><Text style={styles.separatorText}>ou</Text><View style={styles.separatorLine} /></View>
          <SecondaryButton label="Continuer avec Google" icon="G" onPress={onContinue} />
          <SecondaryButton label="Continuer avec Apple" icon="●" onPress={onContinue} />
          <GhostButton label="Continuer sans compte" onPress={onContinue} />
        </View>
      </View>
    </ScreenShell>
  );
}

function Onboarding({
  snapshot,
  patch,
  patchProfile,
  onFinish,
}: {
  snapshot: AppSnapshot;
  patch: (next: Partial<AppSnapshot>) => void;
  patchProfile: (next: Partial<UserProfile>) => void;
  onFinish: () => void;
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 920;
  const step = snapshot.onboardingStep;
  const profile = snapshot.profile;
  const canContinue = step === 0
    ? profile.firstName.trim().length > 1 && profile.age.trim().length > 0
    : step === 1
      ? profile.housingStatus !== null
      : step === 3
        ? profile.goals.length > 0
        : true;

  const toggle = (key: 'flags' | 'goals', value: string) => {
    const current = profile[key] as string[];
    patchProfile({ [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] } as Partial<UserProfile>);
  };

  const copy = [
    { eyebrow: 'D’ABORD, TOI', title: 'On adapte les explications à ta situation.', subtitle: 'On ne demande que ce qui change réellement l’ordre des démarches.' },
    { eyebrow: 'TON LOGEMENT', title: 'Tu en es où aujourd’hui ?', subtitle: 'Le parcours n’est pas le même avant une recherche, après une signature ou en résidence.' },
    { eyebrow: 'CE QUI TE CONCERNE', title: 'Quels éléments peuvent changer tes démarches ?', subtitle: 'Tu peux ne rien sélectionner et compléter plus tard.' },
    { eyebrow: 'TA PRIORITÉ', title: 'Qu’est-ce que tu veux régler en premier ?', subtitle: 'TutoVie organisera l’accueil autour de ce choix.' },
  ][step];

  return (
    <ScreenShell maxWidth={1120} contentStyle={styles.onboardingShell}>
      <View style={styles.topRow}>
        <GhostButton label={step ? '← Retour' : '← Accueil'} onPress={() => step ? patch({ onboardingStep: step - 1 }) : patch({ stage: 'welcome' })} />
        <Text style={styles.stepCounter}>{step + 1} / 4</Text>
      </View>
      <ProgressBar value={(step + 1) / 4} />
      <View style={[styles.onboardingGrid, desktop && styles.onboardingGridDesktop]}>
        <View style={styles.onboardingIntro}>
          <Text style={uiStyles.eyebrow}>{copy.eyebrow}</Text>
          <Text style={uiStyles.title}>{copy.title}</Text>
          <Text style={uiStyles.subtitle}>{copy.subtitle}</Text>
          {desktop ? (
            <View style={styles.onboardingHelp}>
              <Text style={styles.onboardingHelpTitle}>Pourquoi on te demande ça ?</Text>
              <Text style={styles.onboardingHelpText}>Pour éviter les conseils génériques et mettre les actions dans un ordre réaliste. Tu pourras modifier toutes ces réponses ensuite.</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.onboardingContent}>
          {step === 0 ? (
            <View style={styles.formStack}>
              <Field label="Ton prénom" value={profile.firstName} onChangeText={(firstName) => patchProfile({ firstName })} placeholder="Lina" hint="Seulement pour personnaliser l’interface." />
              <View style={[styles.fieldRow, desktop && styles.fieldRowDesktop]}>
                <View style={styles.flex}><Field label="Ton âge" value={profile.age} onChangeText={(age) => patchProfile({ age: age.replace(/\D/g, '').slice(0, 2) })} keyboardType="number-pad" placeholder="19" /></View>
                <View style={styles.flex}><Field label="Ta ville principale" value={profile.city} onChangeText={(city) => patchProfile({ city })} placeholder="Lyon" hint="Tu peux laisser vide si tu ne sais pas encore." /></View>
              </View>
            </View>
          ) : null}
          {step === 1 ? <View style={styles.choices}>{housingOptions.map((option) => <ChoiceCard key={option.id} {...option} title={option.label} selected={profile.housingStatus === option.id} onPress={() => patchProfile({ housingStatus: option.id })} />)}</View> : null}
          {step === 2 ? <View style={styles.choices}>{flagOptions.map((option) => <ChoiceCard key={option.id} compact title={option.label} selected={profile.flags.includes(option.id)} onPress={() => toggle('flags', option.id)} />)}</View> : null}
          {step === 3 ? <View style={styles.choices}>{goalOptions.map((option) => <ChoiceCard key={option.id} {...option} title={option.label} selected={profile.goals.includes(option.id)} onPress={() => toggle('goals', option.id)} />)}</View> : null}
          {!desktop ? (
            <View style={styles.onboardingHelp}>
              <Text style={styles.onboardingHelpTitle}>Pourquoi on te demande ça ?</Text>
              <Text style={styles.onboardingHelpText}>Pour mettre les actions dans le bon ordre. Tu pourras modifier tes réponses plus tard.</Text>
            </View>
          ) : null}
          <PrimaryButton label={step === 3 ? 'Préparer mon tableau de bord' : 'Continuer'} icon="→" onPress={() => step === 3 ? onFinish() : patch({ onboardingStep: step + 1 })} disabled={!canContinue} />
        </View>
      </View>
    </ScreenShell>
  );
}

function MainSite({
  snapshot,
  activeJourneyId,
  messages,
  onMessages,
  onPatch,
  onOpenJourney,
  onCloseJourney,
  onUpdateJourney,
  onUpdateDocument,
  onReset,
}: {
  snapshot: AppSnapshot;
  activeJourneyId: JourneyId | null;
  messages: Message[];
  onMessages: (messages: Message[]) => void;
  onPatch: (next: Partial<AppSnapshot>) => void;
  onOpenJourney: (id: JourneyId) => void;
  onCloseJourney: () => void;
  onUpdateJourney: (id: JourneyId, updater: (current: JourneyProgress) => JourneyProgress) => void;
  onUpdateDocument: (id: string, status: DocumentItem['status']) => void;
  onReset: () => void;
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 980;
  const journey = getJourney(activeJourneyId);

  const content = journey ? (
    <JourneyRunner
      journey={journey}
      progress={snapshot.journeys[journey.id] ?? createJourneyProgress()}
      desktop={desktop}
      onClose={onCloseJourney}
      onUpdate={(updater) => onUpdateJourney(journey.id, updater)}
      onOpenDocument={(id) => onUpdateDocument(id, 'checking')}
    />
  ) : (
    <TabContent
      snapshot={snapshot}
      messages={messages}
      desktop={desktop}
      onMessages={onMessages}
      onOpenJourney={onOpenJourney}
      onUpdateDocument={onUpdateDocument}
      onReset={onReset}
    />
  );

  if (desktop) {
    return (
      <View style={styles.desktopRoot}>
        <DesktopNav active={snapshot.selectedTab} onChange={(selectedTab) => { onCloseJourney(); onPatch({ selectedTab }); }} onLogo={() => { onCloseJourney(); onPatch({ selectedTab: 'home' }); }} />
        <View style={styles.desktopMain}>
          <View style={styles.desktopTopbar}>
            <View>
              <Text style={styles.desktopTopbarTitle}>{journey ? journey.shortTitle : tabLabel(snapshot.selectedTab)}</Text>
              <Text style={styles.desktopTopbarSubtitle}>TutoVie · prototype web responsive</Text>
            </View>
            <View style={styles.desktopTopbarRight}>
              <Pill tone="neutral">Données locales</Pill>
              <View style={styles.avatar}><Text style={styles.avatarText}>{(snapshot.profile.firstName || 'T').slice(0, 1).toUpperCase()}</Text></View>
            </View>
          </View>
          <View style={styles.desktopContent}>{content}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      <View style={styles.mobileContent}>{content}</View>
      {!journey ? <MobileNav active={snapshot.selectedTab} onChange={(selectedTab) => onPatch({ selectedTab })} /> : null}
    </View>
  );
}

function tabLabel(tab: AppTab) {
  return ({ home: 'Accueil', journeys: 'Parcours', documents: 'Documents', assistant: 'Assistant', profile: 'Profil' } as const)[tab];
}

function TabContent({
  snapshot,
  messages,
  desktop,
  onMessages,
  onOpenJourney,
  onUpdateDocument,
  onReset,
}: {
  snapshot: AppSnapshot;
  messages: Message[];
  desktop: boolean;
  onMessages: (messages: Message[]) => void;
  onOpenJourney: (id: JourneyId) => void;
  onUpdateDocument: (id: string, status: DocumentItem['status']) => void;
  onReset: () => void;
}) {
  switch (snapshot.selectedTab) {
    case 'home': return <HomeScreen snapshot={snapshot} desktop={desktop} onOpenJourney={onOpenJourney} />;
    case 'journeys': return <JourneysScreen snapshot={snapshot} desktop={desktop} onOpenJourney={onOpenJourney} />;
    case 'documents': return <DocumentsScreen snapshot={snapshot} desktop={desktop} onOpenJourney={onOpenJourney} onUpdateDocument={onUpdateDocument} />;
    case 'assistant': return <AssistantScreen messages={messages} onMessages={onMessages} desktop={desktop} onOpenJourney={onOpenJourney} />;
    case 'profile': return <ProfileScreen snapshot={snapshot} onReset={onReset} />;
  }
}

function HomeScreen({ snapshot, desktop, onOpenJourney }: { snapshot: AppSnapshot; desktop: boolean; onOpenJourney: (id: JourneyId) => void }) {
  const recommended = useMemo(() => {
    const goals = snapshot.profile.goals;
    const matched = journeys.filter((journey) => journey.recommendedFor.some((goal) => goals.includes(goal)));
    return [...matched, ...journeys.filter((journey) => !matched.some((candidate) => candidate.id === journey.id))];
  }, [snapshot.profile.goals]);
  const nextJourney = recommended.find((journey) => snapshot.journeys[journey.id]?.status !== 'completed') ?? recommended[0];
  const completedJourneys = journeys.filter((journey) => snapshot.journeys[journey.id]?.status === 'completed').length;
  const readyDocuments = documentCatalog.filter((document) => (snapshot.documents[document.id] ?? document.status) === 'ready').length;

  return (
    <ScreenShell maxWidth={1220} contentStyle={styles.tabShell}>
      {!desktop ? <View style={styles.mobileHeader}><BrandMark compact /><View style={styles.avatar}><Text style={styles.avatarText}>{(snapshot.profile.firstName || 'T').slice(0, 1).toUpperCase()}</Text></View></View> : null}
      <View style={styles.homeIntro}>
        <Text style={styles.greetingTitle}>Bonjour {snapshot.profile.firstName || 'toi'}.</Text>
        <Text style={styles.greetingSubtitle}>Voici ce que tu peux faire maintenant, avec une aide à chaque étape.</Text>
      </View>
      <View style={[styles.homeGrid, desktop && styles.homeGridDesktop]}>
        <View style={styles.homePrimaryColumn}>
          <View style={styles.nextActionCard}>
            <View style={styles.nextActionTop}>
              <View><Text style={styles.nextActionEyebrow}>ACTION RECOMMANDÉE</Text><Text style={styles.nextActionTitle}>{nextJourney?.title}</Text></View>
              <Text style={styles.nextActionIcon}>{nextJourney?.icon}</Text>
            </View>
            <Text style={styles.nextActionSubtitle}>{nextJourney?.subtitle}</Text>
            <View style={styles.nextActionOutcome}><Text style={styles.nextActionOutcomeLabel}>Ce que tu obtiens</Text><Text style={styles.nextActionOutcomeText}>{nextJourney?.outcome}</Text></View>
            <PrimaryButton label={snapshot.journeys[nextJourney?.id ?? 'first-home']?.status === 'in_progress' ? 'Reprendre le parcours' : 'Commencer le parcours'} icon="→" onPress={() => nextJourney && onOpenJourney(nextJourney.id)} />
          </View>
          <SectionTitle title="Tes parcours" subtitle="Tu peux les faire dans l’ordre qui correspond à ta situation." />
          <View style={[styles.journeyGrid, desktop && styles.journeyGridDesktop]}>
            {recommended.slice(0, desktop ? 4 : 3).map((journey) => (
              <JourneyCard key={journey.id} journey={journey} progress={snapshot.journeys[journey.id]} onPress={() => onOpenJourney(journey.id)} />
            ))}
          </View>
        </View>
        <View style={styles.homeSideColumn}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Ton point de départ</Text>
            <SummaryLine label="Parcours terminés" value={`${completedJourneys} / ${journeys.length}`} />
            <SummaryLine label="Documents repérés" value={`${readyDocuments} / ${documentCatalog.length}`} />
            <SummaryLine label="Situation logement" value={housingLabel(snapshot.profile.housingStatus)} />
            <Text style={styles.summaryHint}>Ce résumé n’est pas un score. Il sert uniquement à voir ce qui est déjà clair et ce qui reste à préparer.</Text>
          </View>
          <View style={styles.helpCard}>
            <Text style={styles.helpCardIcon}>🧭</Text>
            <Text style={styles.helpCardTitle}>Tu ne sais pas par où commencer ?</Text>
            <Text style={styles.helpCardText}>Le parcours “Qui contacter ?” transforme ton problème en plan d’action et en message clair.</Text>
            <SecondaryButton label="M’orienter" onPress={() => onOpenJourney('contact-router')} />
          </View>
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Maquette fonctionnelle</Text>
            <Text style={styles.noticeText}>Les calculs locaux, formulaires et états fonctionnent. Les connexions aux organismes, l’IA et le stockage de fichiers sont simulés.</Text>
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

function housingLabel(value: UserProfile['housingStatus']) {
  return housingOptions.find((option) => option.id === value)?.label ?? 'À préciser';
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryLine}><Text style={styles.summaryLineLabel}>{label}</Text><Text style={styles.summaryLineValue}>{value}</Text></View>;
}

function JourneyCard({ journey, progress, onPress }: { journey: JourneyDefinition; progress?: JourneyProgress; onPress: () => void }) {
  const index = progress?.stepIndex ?? 0;
  const ratio = progress?.status === 'completed' ? 1 : index / Math.max(1, journey.steps.length - 1);
  const statusLabel = progress?.status === 'completed' ? 'Terminé' : progress?.status === 'in_progress' ? `Étape ${index + 1} / ${journey.steps.length}` : 'À commencer';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.journeyCard, pressed && styles.pressed]}>
      <View style={styles.journeyCardTop}><Text style={styles.journeyIcon}>{journey.icon}</Text><Pill tone={progress?.status === 'completed' ? 'success' : 'neutral'}>{statusLabel}</Pill></View>
      <Text style={styles.journeyCardTitle}>{journey.shortTitle}</Text>
      <Text style={styles.journeyCardText}>{journey.subtitle}</Text>
      <ProgressBar value={ratio} />
      <Text style={styles.journeyCardAction}>{progress?.status === 'in_progress' ? 'Reprendre →' : progress?.status === 'completed' ? 'Revoir →' : 'Ouvrir →'}</Text>
    </Pressable>
  );
}

function JourneysScreen({ snapshot, desktop, onOpenJourney }: { snapshot: AppSnapshot; desktop: boolean; onOpenJourney: (id: JourneyId) => void }) {
  return (
    <ScreenShell maxWidth={1220} contentStyle={styles.tabShell}>
      {!desktop ? <View style={styles.mobileHeader}><BrandMark compact /><Text style={styles.mobilePageTitle}>Parcours</Text></View> : null}
      <View style={styles.pageIntro}>
        <Text style={uiStyles.eyebrow}>GUIDAGE PAS À PAS</Text>
        <Text style={uiStyles.title}>Une vraie démarche, pas une simple fiche.</Text>
        <Text style={uiStyles.subtitle}>Chaque parcours te pose les bonnes questions, explique pourquoi, accepte “je ne sais pas” et produit un récapitulatif exploitable.</Text>
      </View>
      <View style={[styles.journeyGrid, desktop && styles.journeyGridDesktopWide]}>
        {journeys.map((journey) => <JourneyCard key={journey.id} journey={journey} progress={snapshot.journeys[journey.id]} onPress={() => onOpenJourney(journey.id)} />)}
      </View>
    </ScreenShell>
  );
}

function DocumentsScreen({ snapshot, desktop, onOpenJourney, onUpdateDocument }: { snapshot: AppSnapshot; desktop: boolean; onOpenJourney: (id: JourneyId) => void; onUpdateDocument: (id: string, status: DocumentItem['status']) => void }) {
  const groups = [...new Set(documentCatalog.map((document) => document.category))];
  const ready = documentCatalog.filter((document) => (snapshot.documents[document.id] ?? document.status) === 'ready').length;
  return (
    <ScreenShell maxWidth={1220} contentStyle={styles.tabShell}>
      {!desktop ? <View style={styles.mobileHeader}><BrandMark compact /><Text style={styles.mobilePageTitle}>Documents</Text></View> : null}
      <View style={[styles.documentsIntro, desktop && styles.documentsIntroDesktop]}>
        <View style={styles.documentsIntroCopy}>
          <Text style={uiStyles.eyebrow}>INVENTAIRE</Text>
          <Text style={uiStyles.title}>Sais ce que tu as, ce qui manque et où le trouver.</Text>
          <Text style={uiStyles.subtitle}>Aucun fichier réel n’est téléversé. Tu testes ici les statuts et l’organisation future du coffre.</Text>
        </View>
        <View style={styles.documentCountCard}><Text style={styles.documentCount}>{ready}</Text><Text style={styles.documentCountLabel}>documents prêts sur {documentCatalog.length}</Text><PrimaryButton compact label="Faire le parcours documents" onPress={() => onOpenJourney('documents')} /></View>
      </View>
      {groups.map((group) => (
        <View key={group}>
          <SectionTitle title={group} />
          <View style={[styles.documentGrid, desktop && styles.documentGridDesktop]}>
            {documentCatalog.filter((document) => document.category === group).map((document) => {
              const status = snapshot.documents[document.id] ?? document.status;
              return <DocumentCard key={document.id} document={document} status={status} onStatus={(next) => onUpdateDocument(document.id, next)} />;
            })}
          </View>
        </View>
      ))}
    </ScreenShell>
  );
}

function DocumentCard({ document, status, onStatus }: { document: DocumentItem; status: DocumentItem['status']; onStatus: (status: DocumentItem['status']) => void }) {
  return (
    <View style={styles.documentCard}>
      <View style={styles.documentCardTop}><Text style={styles.documentCardTitle}>{document.label}</Text><Pill tone={status === 'ready' ? 'success' : status === 'checking' ? 'warning' : 'neutral'}>{status === 'ready' ? 'Prêt' : status === 'checking' ? 'À vérifier' : 'Manquant'}</Pill></View>
      <Text style={styles.documentWhy}>{document.why}</Text>
      <View style={styles.documentWhere}><Text style={styles.documentWhereLabel}>Où le trouver</Text><Text style={styles.documentWhereText}>{document.where}</Text></View>
      <View style={styles.documentActions}>
        <Pressable onPress={() => onStatus('ready')} style={[styles.statusButton, status === 'ready' && styles.statusButtonActive]}><Text style={[styles.statusButtonText, status === 'ready' && styles.statusButtonTextActive]}>Je l’ai</Text></Pressable>
        <Pressable onPress={() => onStatus('checking')} style={[styles.statusButton, status === 'checking' && styles.statusButtonActive]}><Text style={[styles.statusButtonText, status === 'checking' && styles.statusButtonTextActive]}>À retrouver</Text></Pressable>
        <Pressable onPress={() => onStatus('missing')} style={[styles.statusButton, status === 'missing' && styles.statusButtonActive]}><Text style={[styles.statusButtonText, status === 'missing' && styles.statusButtonTextActive]}>Manquant</Text></Pressable>
      </View>
    </View>
  );
}

function AssistantScreen({ messages, onMessages, desktop, onOpenJourney }: { messages: Message[]; onMessages: (messages: Message[]) => void; desktop: boolean; onOpenJourney: (id: JourneyId) => void }) {
  const [draft, setDraft] = useState('');

  const send = (text = draft) => {
    const clean = text.trim();
    if (!clean) return;
    const reply = routeAssistant(clean);
    onMessages([
      ...messages,
      { id: `u-${Date.now()}`, role: 'user', text: clean },
      { id: `a-${Date.now() + 1}`, role: 'assistant', text: reply.text, journeyId: reply.journeyId },
    ]);
    setDraft('');
  };

  return (
    <ScreenShell maxWidth={1180} contentStyle={styles.assistantShell} scroll={false}>
      {!desktop ? <View style={styles.mobileHeader}><BrandMark compact /><Text style={styles.mobilePageTitle}>Assistant</Text></View> : null}
      <View style={[styles.assistantGrid, desktop && styles.assistantGridDesktop]}>
        <View style={styles.assistantMain}>
          <View style={styles.assistantIntro}><Text style={styles.assistantIcon}>✦</Text><View><Text style={styles.assistantTitle}>Qu’est-ce que tu essaies de faire ?</Text><Text style={styles.assistantSubtitle}>L’assistant t’oriente vers un parcours et ne remplace pas une source officielle.</Text></View></View>
          <ScrollView style={styles.chat} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <View key={message.id} style={[styles.message, message.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
                <Text style={[styles.messageText, message.role === 'user' && styles.messageTextUser]}>{message.text}</Text>
                {message.journeyId ? <View style={styles.messageAction}><SecondaryButton compact label="Ouvrir le parcours" onPress={() => onOpenJourney(message.journeyId as JourneyId)} /></View> : null}
              </View>
            ))}
          </ScrollView>
          <View style={styles.composer}>
            <TextInput value={draft} onChangeText={setDraft} placeholder="Ex. J’ai trouvé un appartement, je fais quoi ensuite ?" placeholderTextColor="#948D9D" style={styles.composerInput} multiline />
            <Pressable onPress={() => send()} style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}><Text style={styles.sendButtonText}>→</Text></Pressable>
          </View>
        </View>
        <View style={styles.assistantSide}>
          <Text style={styles.assistantSideTitle}>Questions fréquentes</Text>
          {assistantSuggestions.map((suggestion) => <Pressable key={suggestion} onPress={() => send(suggestion)} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}><Text style={styles.suggestionText}>{suggestion}</Text><Text style={styles.suggestionArrow}>→</Text></Pressable>)}
          <View style={styles.assistantWarning}><Text style={styles.assistantWarningTitle}>Important</Text><Text style={styles.assistantWarningText}>Ne colle pas de mot de passe, numéro fiscal, numéro de sécurité sociale ou document personnel dans la maquette.</Text></View>
        </View>
      </View>
    </ScreenShell>
  );
}

function routeAssistant(text: string): { text: string; journeyId: JourneyId } {
  const lower = text.toLowerCase();
  if (/budget|loyer|appart|logement|bail|garant/.test(lower)) return { text: 'Le parcours “Premier logement” te guide du budget jusqu’à la CAF. Tu peux commencer par ce que tu sais et laisser les montants inconnus en attente.', journeyId: 'first-home' };
  if (/aide|caf|bourse|droit/.test(lower)) return { text: 'Le parcours “Aides et droits” prépare tes informations, ouvre le simulateur officiel et t’aide à suivre les demandes sans inventer ton éligibilité.', journeyId: 'benefits' };
  if (/papier|document|avis d.imposition|rib|certificat/.test(lower)) return { text: 'Le parcours “Documents essentiels” explique chaque pièce, où la trouver et comment marquer ce qui manque.', journeyId: 'documents' };
  if (/ameli|vitale|mutuelle|médecin|santé/.test(lower)) return { text: 'Le parcours “Santé” reste strictement administratif : compte Ameli, carte Vitale, médecin, mutuelle et contacts utiles.', journeyId: 'health' };
  if (/impôt|fiscal|déclaration/.test(lower)) return { text: 'Le parcours “Premiers impôts” clarifie rattachement, numéro fiscal, justificatifs et étapes officielles.', journeyId: 'taxes' };
  if (/déménag|préavis|état des lieux|adresse/.test(lower)) return { text: 'Le parcours “Déménagement” construit une chronologie avant, pendant et après le départ.', journeyId: 'moving' };
  return { text: 'Je te propose le parcours “Qui contacter ?”. Il t’aide à résumer le problème, préparer les preuves et choisir un canal officiel.', journeyId: 'contact-router' };
}

function ProfileScreen({ snapshot, onReset }: { snapshot: AppSnapshot; onReset: () => void }) {
  return (
    <ScreenShell maxWidth={900} contentStyle={styles.tabShell}>
      <View style={styles.profileHeader}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{(snapshot.profile.firstName || 'T').slice(0, 1).toUpperCase()}</Text></View><View><Text style={styles.profileName}>{snapshot.profile.firstName || 'Profil de démonstration'}</Text><Text style={styles.profileEmail}>{snapshot.profile.email || 'Mode sans compte'}</Text></View></View>
      <View style={[uiStyles.card, styles.profileCard]}>
        <Text style={styles.profileSectionTitle}>Situation utilisée pour les parcours</Text>
        <SummaryLine label="Âge" value={snapshot.profile.age || 'Non renseigné'} />
        <SummaryLine label="Ville" value={snapshot.profile.city || 'Non renseignée'} />
        <SummaryLine label="Logement" value={housingLabel(snapshot.profile.housingStatus)} />
        <SummaryLine label="Priorités" value={snapshot.profile.goals.length ? `${snapshot.profile.goals.length} sélectionnée(s)` : 'À préciser'} />
      </View>
      <View style={[uiStyles.card, styles.profileCard]}>
        <Text style={styles.profileSectionTitle}>Données et connexion</Text>
        <Text style={styles.profileText}>Cette version garde uniquement l’état de la démo dans le stockage local du navigateur. Aucun compte ni document réel n’est créé.</Text>
        <SecondaryButton label="Modifier mon onboarding" onPress={() => { /* Prepared for a future settings route. */ }} />
        <GhostButton danger label="Réinitialiser la démo" onPress={onReset} />
      </View>
    </ScreenShell>
  );
}

function JourneyRunner({
  journey,
  progress,
  desktop,
  onClose,
  onUpdate,
  onOpenDocument,
}: {
  journey: JourneyDefinition;
  progress: JourneyProgress;
  desktop: boolean;
  onClose: () => void;
  onUpdate: (updater: (current: JourneyProgress) => JourneyProgress) => void;
  onOpenDocument: (id: string) => void;
}) {
  const safeIndex = Math.min(progress.stepIndex, journey.steps.length - 1);
  const step = journey.steps[safeIndex];
  const answeredUnknown = Boolean(progress.answers[`${step.id}:${UNKNOWN_KEY}`]);

  const setAnswer = (key: string, value: AnswerValue) => {
    onUpdate((current) => ({
      ...current,
      status: current.status === 'not_started' ? 'in_progress' : current.status,
      answers: { ...current.answers, [key]: value, [`${key}:${UNKNOWN_KEY}`]: false },
      updatedAt: new Date().toISOString(),
    }));
  };

  const markUnknown = () => {
    onUpdate((current) => ({
      ...current,
      status: 'in_progress',
      answers: { ...current.answers, [`${step.id}:${UNKNOWN_KEY}`]: true },
      updatedAt: new Date().toISOString(),
    }));
  };

  const goNext = () => {
    onUpdate((current) => {
      const completedStepIds = current.completedStepIds.includes(step.id) ? current.completedStepIds : [...current.completedStepIds, step.id];
      const final = safeIndex >= journey.steps.length - 1;
      return {
        ...current,
        stepIndex: final ? safeIndex : safeIndex + 1,
        status: final ? 'completed' : 'in_progress',
        completedStepIds,
        updatedAt: new Date().toISOString(),
      };
    });
    if (safeIndex >= journey.steps.length - 1) onClose();
  };

  const goBack = () => {
    if (safeIndex === 0) onClose();
    else onUpdate((current) => ({ ...current, stepIndex: safeIndex - 1, updatedAt: new Date().toISOString() }));
  };

  const jump = (index: number) => {
    onUpdate((current) => ({ ...current, stepIndex: index, status: current.status === 'not_started' ? 'in_progress' : current.status, updatedAt: new Date().toISOString() }));
  };

  return (
    <View style={styles.journeyRoot}>
      {!desktop ? (
        <View style={styles.journeyMobileHeader}>
          <GhostButton label="← Quitter" onPress={onClose} />
          <View style={styles.journeyMobileHeaderCopy}><Text style={styles.journeyMobileTitle}>{journey.shortTitle}</Text><Text style={styles.journeyMobileStep}>{safeIndex + 1} / {journey.steps.length}</Text></View>
        </View>
      ) : null}
      <View style={[styles.journeyLayout, desktop && styles.journeyLayoutDesktop]}>
        {desktop ? <JourneyRail journey={journey} progress={progress} activeIndex={safeIndex} onJump={jump} onClose={onClose} /> : null}
        <ScrollView style={styles.journeyScroll} contentContainerStyle={styles.journeyScrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {!desktop ? <ProgressBar value={(safeIndex + 1) / journey.steps.length} /> : null}
          <View style={styles.stepHeader}>
            <Text style={uiStyles.eyebrow}>{step.eyebrow}</Text>
            <Text style={[uiStyles.title, styles.stepTitle]}>{step.title}</Text>
            <Text style={uiStyles.subtitle}>{step.description}</Text>
          </View>
          {answeredUnknown ? <View style={styles.unknownBanner}><Text style={styles.unknownBannerTitle}>Réponse mise en attente</Text><Text style={styles.unknownBannerText}>Tu peux continuer. TutoVie gardera cette question visible dans le récapitulatif.</Text></View> : null}
          <StepRenderer
            journey={journey}
            step={step}
            progress={progress}
            desktop={desktop}
            setAnswer={setAnswer}
            onOpenDocument={onOpenDocument}
          />
          {!desktop ? <StepHelp step={step} /> : null}
          <View style={styles.stepFooter}>
            <View style={styles.stepFooterSecondary}>
              <SecondaryButton label={safeIndex === 0 ? 'Quitter' : 'Étape précédente'} onPress={goBack} />
            </View>
            <View style={styles.stepFooterPrimary}>
              {step.kind !== 'intro' && step.kind !== 'summary' ? <GhostButton label="Je ne sais pas" onPress={markUnknown} /> : null}
              <PrimaryButton label={safeIndex === journey.steps.length - 1 ? 'Terminer le parcours' : (step.ctaLabel ?? 'Continuer')} icon="→" onPress={goNext} />
            </View>
          </View>
        </ScrollView>
        {desktop ? <StepHelp step={step} /> : null}
      </View>
    </View>
  );
}

function JourneyRail({ journey, progress, activeIndex, onJump, onClose }: { journey: JourneyDefinition; progress: JourneyProgress; activeIndex: number; onJump: (index: number) => void; onClose: () => void }) {
  return (
    <View style={styles.journeyRail}>
      <GhostButton label="← Tous les parcours" onPress={onClose} />
      <View style={styles.journeyRailIntro}><Text style={styles.journeyRailIcon}>{journey.icon}</Text><Text style={styles.journeyRailTitle}>{journey.shortTitle}</Text><Text style={styles.journeyRailTime}>{journey.estimatedTime}</Text></View>
      <ScrollView style={styles.journeyRailScroll} showsVerticalScrollIndicator={false}>
        {journey.steps.map((item, index) => {
          const done = progress.completedStepIds.includes(item.id) || progress.status === 'completed';
          const active = index === activeIndex;
          return (
            <Pressable key={item.id} onPress={() => onJump(index)} style={[styles.railStep, active && styles.railStepActive]}>
              <View style={[styles.railStepIndex, done && styles.railStepDone, active && styles.railStepIndexActive]}><Text style={[styles.railStepIndexText, (done || active) && styles.railStepIndexTextActive]}>{done ? '✓' : index + 1}</Text></View>
              <Text numberOfLines={2} style={[styles.railStepText, active && styles.railStepTextActive]}>{item.title}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function StepHelp({ step }: { step: JourneyStep }) {
  return (
    <View style={styles.stepHelp}>
      <View style={styles.stepHelpHeader}><Text style={styles.stepHelpIcon}>?</Text><Text style={styles.stepHelpTitle}>Aide pendant cette étape</Text></View>
      <Text style={styles.stepHelpLabel}>Pourquoi on te demande ça</Text>
      <Text style={styles.stepHelpText}>{step.why}</Text>
      <Text style={styles.stepHelpLabel}>À savoir</Text>
      {step.help.map((item) => <View key={item} style={styles.helpBullet}><View style={styles.helpBulletDot} /><Text style={styles.helpBulletText}>{item}</Text></View>)}
      <View style={styles.stepHelpNote}><Text style={styles.stepHelpNoteText}>Tu peux toujours continuer avec “Je ne sais pas” et revenir plus tard.</Text></View>
    </View>
  );
}

function StepRenderer({
  journey,
  step,
  progress,
  desktop,
  setAnswer,
  onOpenDocument,
}: {
  journey: JourneyDefinition;
  step: JourneyStep;
  progress: JourneyProgress;
  desktop: boolean;
  setAnswer: (key: string, value: AnswerValue) => void;
  onOpenDocument: (id: string) => void;
}) {
  const answer = progress.answers[step.id];
  if (step.kind === 'intro') return <IntroStep journey={journey} />;
  if (step.kind === 'form') return <FormStep step={step} answer={asRecord(answer)} setAnswer={(value) => setAnswer(step.id, value)} desktop={desktop} />;
  if (step.kind === 'single') return <OptionsStep step={step} value={typeof answer === 'string' ? answer : ''} multi={false} setAnswer={(value) => setAnswer(step.id, value)} />;
  if (step.kind === 'multi') return <OptionsStep step={step} value={asStringArray(answer)} multi setAnswer={(value) => setAnswer(step.id, value)} />;
  if (step.kind === 'checklist') return <ChecklistStep step={step} value={asStringArray(answer)} setAnswer={(value) => { setAnswer(step.id, value); value.forEach(onOpenDocument); }} />;
  if (step.kind === 'budget') return <BudgetStep value={asRecord(answer)} setAnswer={(value) => setAnswer(step.id, value)} desktop={desktop} />;
  if (step.kind === 'text') return <TextStep step={step} value={typeof answer === 'string' ? answer : ''} setAnswer={(value) => setAnswer(step.id, value)} />;
  if (step.kind === 'upload') return <UploadStep step={step} value={typeof answer === 'string' ? answer : ''} setAnswer={(value) => setAnswer(step.id, value)} />;
  if (step.kind === 'external') return <ExternalStep step={step} value={asStringArray(answer)} setAnswer={(value) => setAnswer(step.id, value)} />;
  return <SummaryStep journey={journey} progress={progress} />;
}

function asRecord(value: AnswerValue | undefined): Record<string, string> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, string>;
  return {};
}

function asStringArray(value: AnswerValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function IntroStep({ journey }: { journey: JourneyDefinition }) {
  return (
    <View style={styles.introStep}>
      <Text style={styles.introStepIcon}>{journey.icon}</Text>
      <Text style={styles.introStepOutcomeTitle}>Ce que tu auras à la fin</Text>
      <Text style={styles.introStepOutcome}>{journey.outcome}</Text>
      <View style={styles.introStepMeta}><Pill tone="neutral">{journey.steps.length} étapes</Pill><Pill tone="neutral">{journey.estimatedTime}</Pill><Pill tone="neutral">Reprise automatique</Pill></View>
      <View style={styles.introStepFlow}>
        <FlowItem index="1" text="Tu réponds avec ce que tu sais." />
        <FlowItem index="2" text="L’aide explique chaque question." />
        <FlowItem index="3" text="Le récapitulatif garde les points à compléter." />
      </View>
    </View>
  );
}

function FlowItem({ index, text }: { index: string; text: string }) {
  return <View style={styles.flowItem}><View style={styles.flowIndex}><Text style={styles.flowIndexText}>{index}</Text></View><Text style={styles.flowText}>{text}</Text></View>;
}

function FormStep({ step, answer, setAnswer, desktop }: { step: JourneyStep; answer: Record<string, string>; setAnswer: (value: Record<string, string>) => void; desktop: boolean }) {
  return (
    <View style={[styles.formGrid, desktop && styles.formGridDesktop]}>
      {step.fields?.map((field) => (
        <Field
          key={field.id}
          label={field.label}
          value={answer[field.id] ?? ''}
          onChangeText={(value) => setAnswer({ ...answer, [field.id]: value })}
          placeholder={field.placeholder}
          hint={field.hint}
          suffix={field.suffix}
          keyboardType={field.inputMode === 'numeric' ? 'numeric' : field.inputMode === 'email' ? 'email-address' : 'default'}
        />
      ))}
    </View>
  );
}

function OptionsStep({ step, value, multi, setAnswer }: { step: JourneyStep; value: string | string[]; multi: boolean; setAnswer: (value: string | string[]) => void }) {
  const selectedValues = Array.isArray(value) ? value : [value];
  const toggle = (id: string) => {
    if (!multi) setAnswer(id);
    else setAnswer(selectedValues.includes(id) ? selectedValues.filter((item) => item !== id) : [...selectedValues, id]);
  };
  return <View style={styles.choices}>{step.options?.map((option) => <ChoiceCard key={option.id} {...option} title={option.label} selected={selectedValues.includes(option.id)} onPress={() => toggle(option.id)} />)}</View>;
}

function ChecklistStep({ step, value, setAnswer }: { step: JourneyStep; value: string[]; setAnswer: (value: string[]) => void }) {
  const toggle = (id: string) => setAnswer(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  return <View style={styles.checklist}>{step.checklist?.map((item) => <CheckboxRow key={item.id} checked={value.includes(item.id)} label={item.label} hint={item.hint} onPress={() => toggle(item.id)} />)}</View>;
}

const budgetFields = {
  income: [
    { id: 'scholarship', label: 'Bourse', hint: 'Moyenne mensuelle reçue', placeholder: '0' },
    { id: 'family', label: 'Aide familiale', hint: 'Montant régulier uniquement', placeholder: '0' },
    { id: 'salary', label: 'Salaire ou revenu étudiant', hint: 'Moyenne nette mensuelle', placeholder: '0' },
    { id: 'other', label: 'Autres ressources', hint: 'Seulement si elles sont régulières', placeholder: '0' },
    { id: 'housingAid', label: 'Aide logement déjà estimée', hint: 'Laisse vide sans simulation officielle', placeholder: '0' },
  ],
  living: [
    { id: 'food', label: 'Courses et repas', hint: 'Budget mensuel', placeholder: '0' },
    { id: 'transport', label: 'Transport', hint: 'Abonnement + trajets', placeholder: '0' },
    { id: 'phone', label: 'Téléphone et abonnements', hint: 'Hors internet du logement', placeholder: '0' },
    { id: 'school', label: 'Études et matériel', hint: 'Moyenne mensuelle', placeholder: '0' },
    { id: 'leisure', label: 'Loisirs et sorties', hint: 'Budget réaliste, pas idéal', placeholder: '0' },
    { id: 'safety', label: 'Marge de sécurité', hint: 'Somme à ne pas consommer', placeholder: '0' },
  ],
  housing: [
    { id: 'energy', label: 'Énergie estimée', hint: 'Électricité / gaz', placeholder: '0' },
    { id: 'internet', label: 'Internet', hint: 'Part personnelle en coloc', placeholder: '0' },
    { id: 'insurance', label: 'Assurance habitation', hint: 'Montant mensuel', placeholder: '0' },
    { id: 'extraCharges', label: 'Charges non incluses', hint: 'Eau, entretien, autres', placeholder: '0' },
  ],
};

function money(value: string | undefined) {
  const parsed = Number((value ?? '').replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function BudgetStep({ value, setAnswer, desktop }: { value: Record<string, string>; setAnswer: (value: Record<string, string>) => void; desktop: boolean }) {
  const income = budgetFields.income.reduce((sum, field) => sum + money(value[field.id]), 0);
  const living = budgetFields.living.reduce((sum, field) => sum + money(value[field.id]), 0);
  const housingExtras = budgetFields.housing.reduce((sum, field) => sum + money(value[field.id]), 0);
  const rentCeiling = Math.max(0, income - living - housingExtras);
  const hasInput = Object.values(value).some((item) => item.trim().length > 0);

  const renderFields = (items: typeof budgetFields.income) => (
    <View style={[styles.budgetFields, desktop && styles.budgetFieldsDesktop]}>
      {items.map((field) => (
        <Field
          key={field.id}
          label={field.label}
          value={value[field.id] ?? ''}
          onChangeText={(next) => setAnswer({ ...value, [field.id]: next.replace(/[^0-9,.]/g, '') })}
          placeholder={field.placeholder}
          hint={field.hint}
          suffix="€"
          keyboardType="numeric"
        />
      ))}
    </View>
  );

  return (
    <View style={styles.budgetRoot}>
      <View style={styles.budgetSection}><Text style={styles.budgetSectionTitle}>1. Ce qui entre chaque mois</Text><Text style={styles.budgetSectionText}>Ajoute seulement les ressources suffisamment régulières pour payer un loyer.</Text>{renderFields(budgetFields.income)}</View>
      <View style={styles.budgetSection}><Text style={styles.budgetSectionTitle}>2. Ce qui doit rester pour vivre</Text><Text style={styles.budgetSectionText}>Un budget réaliste inclut aussi les dépenses que tu ne peux pas supprimer tous les mois.</Text>{renderFields(budgetFields.living)}</View>
      <View style={styles.budgetSection}><Text style={styles.budgetSectionTitle}>3. Les coûts du logement hors loyer</Text><Text style={styles.budgetSectionText}>Ils réduisent directement le loyer maximal supportable.</Text>{renderFields(budgetFields.housing)}</View>
      <View style={styles.budgetResult}>
        <View style={styles.budgetResultTop}><View><Text style={styles.budgetResultLabel}>Plafond de loyer prudent</Text><Text style={styles.budgetResultHint}>Après les dépenses et coûts estimés</Text></View><Text style={styles.budgetResultValue}>{hasInput ? `${Math.round(rentCeiling)} €` : '— €'}</Text></View>
        <View style={styles.budgetBreakdown}><SummaryLine label="Ressources mensuelles" value={`${Math.round(income)} €`} /><SummaryLine label="Budget de vie + marge" value={`− ${Math.round(living)} €`} /><SummaryLine label="Coûts logement hors loyer" value={`− ${Math.round(housingExtras)} €`} /></View>
        <Text style={styles.budgetDisclaimer}>Estimation de préparation uniquement. Les aides doivent être confirmées par un simulateur officiel et le budget doit être adapté à ta situation réelle.</Text>
      </View>
    </View>
  );
}

function TextStep({ step, value, setAnswer }: { step: JourneyStep; value: string; setAnswer: (value: string) => void }) {
  const risk = /étranger|virement|mandat|western|avant la visite|avant visite|urgence|crypto|coupon|carte cadeau/i.test(value);
  const analyzed = value.trim().length >= 25;
  return (
    <View style={styles.textStep}>
      <Field label="Texte ou résumé" value={value} onChangeText={setAnswer} placeholder={step.placeholder} multiline />
      {analyzed ? (
        <View style={[styles.analysisCard, risk ? styles.analysisCardRisk : styles.analysisCardNeutral]}>
          <View style={styles.analysisTop}><Text style={styles.analysisTitle}>{risk ? 'Plusieurs signaux méritent une vérification' : 'Aucun signal évident détecté par la démo'}</Text><Pill tone={risk ? 'warning' : 'neutral'}>Analyse locale simulée</Pill></View>
          <Text style={styles.analysisText}>{risk ? 'Ne paie rien et vérifie l’identité, le logement, l’adresse et le canal utilisé. Conserve les messages.' : 'Cela ne garantit pas que l’annonce ou la demande est fiable. Vérifie toujours l’identité, les documents et le contexte.'}</Text>
        </View>
      ) : <View style={styles.emptyAnalysis}><Text style={styles.emptyAnalysisText}>Écris au moins quelques phrases pour afficher l’état prévu de l’analyse.</Text></View>}
    </View>
  );
}

function UploadStep({ step, value, setAnswer }: { step: JourneyStep; value: string; setAnswer: (value: string) => void }) {
  const isLease = step.id.includes('lease');
  const simulatedName = isLease ? 'bail-exemple.pdf' : step.id.includes('docs') ? 'piece-identite-exemple.pdf' : 'dossier-locatif-exemple.zip';
  return (
    <View style={styles.uploadRoot}>
      <Pressable onPress={() => setAnswer(value ? '' : simulatedName)} style={({ pressed }) => [styles.uploadZone, value && styles.uploadZoneReady, pressed && styles.pressed]}>
        <Text style={styles.uploadIcon}>{value ? '✓' : '＋'}</Text>
        <Text style={styles.uploadTitle}>{value ? value : 'Ajouter un fichier de démonstration'}</Text>
        <Text style={styles.uploadText}>{value ? 'Le fichier n’a pas été envoyé. Clique pour le retirer.' : 'PDF, image ou archive — aucun fichier réel ne quitte ton appareil dans cette maquette.'}</Text>
      </Pressable>
      {value ? (
        <View style={styles.fakeExtraction}>
          <Text style={styles.fakeExtractionTitle}>{isLease ? 'Aperçu des informations qui seraient extraites' : 'Contrôles préparés dans l’interface'}</Text>
          {isLease ? <><SummaryLine label="Loyer" value="À détecter" /><SummaryLine label="Charges" value="À détecter" /><SummaryLine label="Dépôt de garantie" value="À détecter" /><SummaryLine label="Préavis" value="À vérifier" /></> : <><SummaryLine label="Lisibilité" value="À contrôler" /><SummaryLine label="Type de pièce" value="À confirmer" /><SummaryLine label="Date" value="À détecter" /><SummaryLine label="Informations sensibles" value="À masquer si nécessaire" /></>}
        </View>
      ) : null}
    </View>
  );
}

function ExternalStep({ step, value, setAnswer }: { step: JourneyStep; value: string[]; setAnswer: (value: string[]) => void }) {
  const toggle = (id: string) => setAnswer(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  return (
    <View style={styles.externalRoot}>
      {step.checklist?.length ? <View style={styles.checklist}>{step.checklist.map((item) => <CheckboxRow key={item.id} checked={value.includes(item.id)} label={item.label} hint={item.hint} onPress={() => toggle(item.id)} />)}</View> : null}
      {step.sourceUrl ? <View style={styles.externalCard}><View style={styles.externalCardIcon}><Text style={styles.externalCardIconText}>↗</Text></View><View style={styles.externalCardCopy}><Text style={styles.externalCardTitle}>Continuer sur une source officielle</Text><Text style={styles.externalCardText}>Le site s’ouvrira dans un nouvel onglet. TutoVie ne transmet aucune réponse automatiquement.</Text></View><View style={styles.externalCardButton}><PrimaryButton compact label={step.sourceLabel ?? 'Ouvrir'} onPress={() => void Linking.openURL(step.sourceUrl as string)} /></View></View> : null}
    </View>
  );
}

function SummaryStep({ journey, progress }: { journey: JourneyDefinition; progress: JourneyProgress }) {
  const answered = journey.steps.filter((step) => progress.answers[step.id] !== undefined).length;
  const unknown = journey.steps.filter((step) => progress.answers[`${step.id}:${UNKNOWN_KEY}`]).length;
  const remaining = Math.max(0, journey.steps.length - 2 - answered);
  return (
    <View style={styles.finalSummary}>
      <View style={styles.finalSummaryHero}><Text style={styles.finalSummaryIcon}>✓</Text><View><Text style={styles.finalSummaryTitle}>Le parcours est structuré.</Text><Text style={styles.finalSummaryText}>Tu peux terminer maintenant et revenir sur n’importe quelle étape.</Text></View></View>
      <View style={styles.finalSummaryStats}><SummaryStat value={answered} label="étapes renseignées" /><SummaryStat value={unknown} label="questions en attente" /><SummaryStat value={remaining} label="éléments à compléter" /></View>
      <View style={styles.finalSummaryList}>
        <Text style={styles.finalSummaryListTitle}>Le futur récapitulatif contiendra</Text>
        <CheckboxRow checked label="Tes réponses et calculs" onPress={() => undefined} />
        <CheckboxRow checked label="Les documents manquants" onPress={() => undefined} />
        <CheckboxRow checked label="Les liens vers les sources officielles" onPress={() => undefined} />
        <CheckboxRow checked label="Les prochaines dates et relances" onPress={() => undefined} />
      </View>
      <SecondaryButton label="Simuler l’export PDF" onPress={() => Alert.alert('Export préparé', 'Le PDF sera branché dans une prochaine version.')} />
    </View>
  );
}

function SummaryStat({ value, label }: { value: number; label: string }) {
  return <View style={styles.finalSummaryStat}><Text style={styles.finalSummaryStatValue}>{value}</Text><Text style={styles.finalSummaryStatLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colors.canvas },
  muted: { color: colors.muted, fontSize: 14 },
  caption: { textAlign: 'center', color: colors.muted, fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.992 }] },
  stack: { gap: 12 },
  topRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors.line },
  separatorText: { color: colors.muted, fontSize: 12 },
  welcomeShell: { minHeight: '100%', paddingTop: 22, justifyContent: 'center' },
  welcomeTop: { position: 'absolute', top: 20, left: 20 },
  welcomeGrid: { paddingTop: 88, gap: 36, justifyContent: 'center' },
  welcomeGridDesktop: { minHeight: 720, flexDirection: 'row', alignItems: 'center', gap: 70 },
  welcomeCopy: { gap: 20 },
  welcomeCopyDesktop: { flex: 1, maxWidth: 590 },
  welcomeTitle: { color: colors.ink, fontWeight: '900', fontSize: 42, lineHeight: 47, letterSpacing: -1.5 },
  welcomeTitleDesktop: { fontSize: 58, lineHeight: 63, letterSpacing: -2.2 },
  welcomeSubtitle: { color: colors.muted, fontSize: 17, lineHeight: 26, maxWidth: 620 },
  welcomeActions: { gap: 11 },
  welcomeActionsDesktop: { flexDirection: 'row' },
  welcomeActionButton: { minWidth: 205 },
  welcomePreview: { alignSelf: 'center', width: '100%', maxWidth: 470, borderRadius: 30, padding: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, shadowColor: '#3B285E', shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 18 }, gap: 20 },
  welcomePreviewDesktop: { flex: 1, minHeight: 470, justifyContent: 'space-between' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  previewEyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  previewTitle: { marginTop: 5, color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: -0.6 },
  previewBadge: { height: 36, paddingHorizontal: 12, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  previewBadgeText: { color: colors.primaryDark, fontWeight: '800', fontSize: 12 },
  previewQuestion: { gap: 11 },
  previewQuestionLabel: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  fakeInput: { height: 56, borderRadius: 16, borderWidth: 1, borderColor: colors.line, justifyContent: 'center', paddingHorizontal: 16 },
  fakeInputText: { color: '#9A93A4', fontSize: 16 },
  fakeHelp: { borderRadius: 16, padding: 14, backgroundColor: colors.lavender },
  fakeHelpTitle: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  fakeHelpText: { marginTop: 4, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  previewFooter: { gap: 8 },
  previewFooterText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  previewLine: { height: 8, borderRadius: 8, backgroundColor: '#ECE8F0', overflow: 'hidden' },
  previewLineFill: { width: '24%', height: '100%', backgroundColor: colors.primary, borderRadius: 8 },
  authShell: { minHeight: '100%', paddingTop: 14 },
  authGrid: { flex: 1, justifyContent: 'center', gap: 30, paddingVertical: 36 },
  authGridDesktop: { flexDirection: 'row', alignItems: 'center', gap: 70 },
  authIntro: { flex: 1, gap: 10 },
  securityCard: { marginTop: 20, borderRadius: 20, padding: 18, backgroundColor: colors.dark, gap: 7 },
  securityTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, marginBottom: 4 },
  securityLine: { color: '#D7D1DE', fontSize: 13, lineHeight: 19 },
  onboardingShell: { minHeight: '100%', paddingTop: 12 },
  stepCounter: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  onboardingGrid: { gap: 30, paddingVertical: 34 },
  onboardingGridDesktop: { flexDirection: 'row', gap: 70, alignItems: 'flex-start' },
  onboardingIntro: { flex: 1 },
  onboardingContent: { flex: 1.15, gap: 22 },
  onboardingHelp: { marginTop: 24, borderRadius: 18, padding: 17, backgroundColor: colors.primarySoft },
  onboardingHelpTitle: { color: colors.primaryDark, fontWeight: '900', fontSize: 13 },
  onboardingHelpText: { marginTop: 6, color: colors.muted, fontSize: 13, lineHeight: 19 },
  formStack: { gap: 18 },
  fieldRow: { gap: 18 },
  fieldRowDesktop: { flexDirection: 'row' },
  choices: { gap: 11 },
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: colors.canvas },
  desktopMain: { flex: 1 },
  desktopTopbar: { minHeight: 78, paddingHorizontal: 28, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  desktopTopbarTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  desktopTopbarSubtitle: { marginTop: 3, color: colors.muted, fontSize: 11.5 },
  desktopTopbarRight: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  desktopContent: { flex: 1 },
  mobileRoot: { flex: 1, backgroundColor: colors.canvas },
  mobileContent: { flex: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  avatarText: { color: colors.primaryDark, fontWeight: '900' },
  tabShell: { paddingTop: 20 },
  mobileHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mobilePageTitle: { color: colors.ink, fontWeight: '900', fontSize: 17 },
  homeIntro: { marginTop: 14, marginBottom: 24 },
  greetingTitle: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -0.9 },
  greetingSubtitle: { marginTop: 7, color: colors.muted, fontSize: 15, lineHeight: 22 },
  homeGrid: { gap: 24 },
  homeGridDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  homePrimaryColumn: { flex: 1.65 },
  homeSideColumn: { flex: 0.85, gap: 16 },
  nextActionCard: { borderRadius: 28, padding: 24, backgroundColor: colors.dark, gap: 17 },
  nextActionTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  nextActionEyebrow: { color: colors.lime, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  nextActionTitle: { marginTop: 6, color: '#FFFFFF', fontSize: 27, lineHeight: 32, fontWeight: '900', letterSpacing: -0.7 },
  nextActionIcon: { fontSize: 38 },
  nextActionSubtitle: { color: '#D7D1DE', fontSize: 14, lineHeight: 21 },
  nextActionOutcome: { borderRadius: 17, padding: 15, backgroundColor: 'rgba(255,255,255,0.08)' },
  nextActionOutcomeLabel: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  nextActionOutcomeText: { marginTop: 5, color: '#D7D1DE', fontSize: 12.5, lineHeight: 18 },
  journeyGrid: { gap: 13 },
  journeyGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  journeyGridDesktopWide: { marginTop: 26, flexDirection: 'row', flexWrap: 'wrap' },
  journeyCard: { minHeight: 230, flex: 1, minWidth: 250, borderRadius: 22, padding: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 11 },
  journeyCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  journeyIcon: { fontSize: 29 },
  journeyCardTitle: { color: colors.ink, fontWeight: '900', fontSize: 18, letterSpacing: -0.3 },
  journeyCardText: { flex: 1, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  journeyCardAction: { color: colors.primary, fontWeight: '900', fontSize: 12.5 },
  summaryCard: { borderRadius: 22, padding: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  summaryCardTitle: { color: colors.ink, fontWeight: '900', fontSize: 17, marginBottom: 10 },
  summaryLine: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 15, borderBottomWidth: 1, borderBottomColor: '#F0EDF3' },
  summaryLineLabel: { flex: 1, color: colors.muted, fontSize: 12.5 },
  summaryLineValue: { color: colors.ink, fontSize: 12.5, fontWeight: '800', textAlign: 'right' },
  summaryHint: { marginTop: 13, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  helpCard: { borderRadius: 22, padding: 19, backgroundColor: colors.primarySoft, gap: 10 },
  helpCardIcon: { fontSize: 26 },
  helpCardTitle: { color: colors.ink, fontWeight: '900', fontSize: 17 },
  helpCardText: { color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  noticeCard: { borderRadius: 19, padding: 16, borderWidth: 1, borderColor: '#E8D9B6', backgroundColor: '#FFF9EA' },
  noticeTitle: { color: colors.warning, fontWeight: '900', fontSize: 12.5 },
  noticeText: { marginTop: 5, color: '#7A6442', fontSize: 11.5, lineHeight: 17 },
  pageIntro: { maxWidth: 760, marginTop: 18 },
  documentsIntro: { gap: 20, marginTop: 18 },
  documentsIntroDesktop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  documentsIntroCopy: { flex: 1, maxWidth: 760 },
  documentCountCard: { minWidth: 220, borderRadius: 22, padding: 18, backgroundColor: colors.dark, gap: 8 },
  documentCount: { color: colors.lime, fontSize: 38, fontWeight: '900' },
  documentCountLabel: { color: '#D7D1DE', fontSize: 12, marginBottom: 5 },
  documentGrid: { gap: 12 },
  documentGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  documentCard: { flex: 1, minWidth: 300, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, gap: 11 },
  documentCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  documentCardTitle: { flex: 1, color: colors.ink, fontWeight: '900', fontSize: 16 },
  documentWhy: { color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  documentWhere: { borderRadius: 14, padding: 12, backgroundColor: colors.lavender },
  documentWhereLabel: { color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  documentWhereText: { marginTop: 4, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  documentActions: { flexDirection: 'row', gap: 7 },
  statusButton: { flex: 1, minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  statusButtonActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  statusButtonText: { color: colors.muted, fontSize: 10.5, fontWeight: '800' },
  statusButtonTextActive: { color: colors.primaryDark },
  assistantShell: { flex: 1, paddingBottom: 14 },
  assistantGrid: { flex: 1, gap: 18 },
  assistantGridDesktop: { flexDirection: 'row', paddingTop: 20 },
  assistantMain: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  assistantIntro: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  assistantIcon: { width: 42, height: 42, borderRadius: 15, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.primary, color: '#FFFFFF', fontWeight: '900', fontSize: 20 },
  assistantTitle: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  assistantSubtitle: { marginTop: 3, color: colors.muted, fontSize: 11.5 },
  chat: { flex: 1 },
  chatContent: { padding: 18, gap: 10 },
  message: { maxWidth: '85%', borderRadius: 17, padding: 13 },
  messageAssistant: { alignSelf: 'flex-start', backgroundColor: colors.lavender },
  messageUser: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  messageText: { color: colors.ink, fontSize: 13.5, lineHeight: 20 },
  messageTextUser: { color: '#FFFFFF' },
  messageAction: { marginTop: 10 },
  composer: { minHeight: 78, flexDirection: 'row', alignItems: 'flex-end', gap: 9, padding: 12, borderTopWidth: 1, borderTopColor: colors.line },
  composerInput: { flex: 1, minHeight: 52, maxHeight: 110, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 13, backgroundColor: colors.canvas, color: colors.ink, fontSize: 14 },
  sendButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  sendButtonText: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  assistantSide: { width: 320, gap: 10 },
  assistantSideTitle: { color: colors.ink, fontWeight: '900', fontSize: 16, marginBottom: 3 },
  suggestion: { minHeight: 58, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  suggestionText: { flex: 1, color: colors.ink, fontSize: 12.5, lineHeight: 17, fontWeight: '700' },
  suggestionArrow: { color: colors.primary, fontWeight: '900' },
  assistantWarning: { marginTop: 8, borderRadius: 16, padding: 14, backgroundColor: '#FFF5E5' },
  assistantWarningTitle: { color: colors.warning, fontWeight: '900', fontSize: 12 },
  assistantWarningText: { marginTop: 5, color: '#7B6647', fontSize: 11.5, lineHeight: 17 },
  profileHeader: { marginTop: 30, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 15 },
  profileAvatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: '#FFFFFF', fontSize: 27, fontWeight: '900' },
  profileName: { color: colors.ink, fontWeight: '900', fontSize: 23 },
  profileEmail: { marginTop: 4, color: colors.muted, fontSize: 13 },
  profileCard: { marginBottom: 16, gap: 12 },
  profileSectionTitle: { color: colors.ink, fontWeight: '900', fontSize: 17 },
  profileText: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  journeyRoot: { flex: 1, backgroundColor: colors.canvas },
  journeyMobileHeader: { minHeight: 66, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.surface },
  journeyMobileHeaderCopy: { alignItems: 'flex-end' },
  journeyMobileTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  journeyMobileStep: { marginTop: 2, color: colors.muted, fontSize: 10.5 },
  journeyLayout: { flex: 1 },
  journeyLayoutDesktop: { flexDirection: 'row' },
  journeyRail: { width: 270, padding: 18, borderRightWidth: 1, borderRightColor: colors.line, backgroundColor: colors.surface },
  journeyRailIntro: { marginTop: 12, marginBottom: 18, borderRadius: 18, padding: 15, backgroundColor: colors.lavender },
  journeyRailIcon: { fontSize: 25 },
  journeyRailTitle: { marginTop: 8, color: colors.ink, fontWeight: '900', fontSize: 17 },
  journeyRailTime: { marginTop: 4, color: colors.muted, fontSize: 11.5 },
  journeyRailScroll: { flex: 1 },
  railStep: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 13, paddingHorizontal: 8, paddingVertical: 7 },
  railStepActive: { backgroundColor: colors.primarySoft },
  railStepIndex: { width: 27, height: 27, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  railStepDone: { backgroundColor: colors.success, borderColor: colors.success },
  railStepIndexActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  railStepIndexText: { color: colors.muted, fontSize: 10.5, fontWeight: '900' },
  railStepIndexTextActive: { color: '#FFFFFF' },
  railStepText: { flex: 1, color: colors.muted, fontSize: 11.5, lineHeight: 15 },
  railStepTextActive: { color: colors.primaryDark, fontWeight: '800' },
  journeyScroll: { flex: 1 },
  journeyScrollContent: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 28, paddingBottom: 50 },
  stepHeader: { marginTop: 18, marginBottom: 25 },
  stepTitle: { maxWidth: 700 },
  unknownBanner: { marginBottom: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F0D8A9', backgroundColor: '#FFF8E8' },
  unknownBannerTitle: { color: colors.warning, fontWeight: '900', fontSize: 12.5 },
  unknownBannerText: { marginTop: 4, color: '#7A6645', fontSize: 11.5, lineHeight: 17 },
  stepFooter: { marginTop: 30, paddingTop: 22, borderTopWidth: 1, borderTopColor: colors.line, gap: 12 },
  stepFooterSecondary: { alignSelf: 'flex-start' },
  stepFooterPrimary: { gap: 8 },
  stepHelp: { width: 310, padding: 20, backgroundColor: '#F0ECFA', borderLeftWidth: 1, borderLeftColor: colors.line },
  stepHelpHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  stepHelpIcon: { width: 30, height: 30, borderRadius: 15, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.primary, color: '#FFFFFF', fontWeight: '900' },
  stepHelpTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  stepHelpLabel: { marginTop: 13, marginBottom: 6, color: colors.primaryDark, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 },
  stepHelpText: { color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  helpBullet: { flexDirection: 'row', gap: 8, marginTop: 8 },
  helpBulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 7, backgroundColor: colors.primary },
  helpBulletText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  stepHelpNote: { marginTop: 20, borderRadius: 14, padding: 12, backgroundColor: 'rgba(255,255,255,0.75)' },
  stepHelpNoteText: { color: colors.primaryDark, fontSize: 11.5, lineHeight: 17, fontWeight: '700' },
  introStep: { borderRadius: 24, padding: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  introStepIcon: { fontSize: 42 },
  introStepOutcomeTitle: { marginTop: 15, color: colors.ink, fontWeight: '900', fontSize: 16 },
  introStepOutcome: { marginTop: 7, color: colors.muted, fontSize: 14, lineHeight: 21 },
  introStepMeta: { marginTop: 17, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  introStepFlow: { marginTop: 22, gap: 12 },
  flowItem: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  flowIndex: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  flowIndexText: { color: colors.primaryDark, fontWeight: '900', fontSize: 12 },
  flowText: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  formGrid: { gap: 17 },
  formGridDesktop: { gap: 19 },
  checklist: { gap: 9 },
  budgetRoot: { gap: 22 },
  budgetSection: { borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  budgetSectionTitle: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  budgetSectionText: { marginTop: 5, marginBottom: 17, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  budgetFields: { gap: 16 },
  budgetFieldsDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  budgetResult: { borderRadius: 24, padding: 21, backgroundColor: colors.dark },
  budgetResultTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15 },
  budgetResultLabel: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  budgetResultHint: { marginTop: 4, color: '#C9C2D0', fontSize: 11.5 },
  budgetResultValue: { color: colors.lime, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  budgetBreakdown: { marginTop: 17, borderRadius: 16, paddingHorizontal: 13, backgroundColor: 'rgba(255,255,255,0.08)' },
  budgetDisclaimer: { marginTop: 14, color: '#C9C2D0', fontSize: 10.5, lineHeight: 16 },
  textStep: { gap: 15 },
  analysisCard: { borderRadius: 18, padding: 16, borderWidth: 1 },
  analysisCardRisk: { backgroundColor: '#FFF5E4', borderColor: '#EDCF98' },
  analysisCardNeutral: { backgroundColor: '#F3F1F7', borderColor: colors.line },
  analysisTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  analysisTitle: { flex: 1, color: colors.ink, fontWeight: '900', fontSize: 14 },
  analysisText: { marginTop: 8, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  emptyAnalysis: { borderRadius: 16, padding: 14, backgroundColor: colors.lavender },
  emptyAnalysisText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  uploadRoot: { gap: 16 },
  uploadZone: { minHeight: 210, borderRadius: 23, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C9C1D6', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.surface },
  uploadZoneReady: { borderStyle: 'solid', borderColor: '#A7D9BC', backgroundColor: '#F1FAF5' },
  uploadIcon: { color: colors.primary, fontSize: 32, fontWeight: '900' },
  uploadTitle: { marginTop: 12, color: colors.ink, fontWeight: '900', fontSize: 16, textAlign: 'center' },
  uploadText: { marginTop: 7, maxWidth: 430, color: colors.muted, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  fakeExtraction: { borderRadius: 20, padding: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  fakeExtractionTitle: { color: colors.ink, fontWeight: '900', fontSize: 14, marginBottom: 7 },
  externalRoot: { gap: 17 },
  externalCard: { borderRadius: 21, padding: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 13, flexWrap: 'wrap' },
  externalCardIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  externalCardIconText: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  externalCardCopy: { flex: 1, minWidth: 220 },
  externalCardTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  externalCardText: { marginTop: 5, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  externalCardButton: { minWidth: 170 },
  finalSummary: { gap: 18 },
  finalSummaryHero: { borderRadius: 23, padding: 20, backgroundColor: '#EEF9F3', flexDirection: 'row', alignItems: 'center', gap: 15 },
  finalSummaryIcon: { width: 48, height: 48, borderRadius: 24, textAlign: 'center', textAlignVertical: 'center', backgroundColor: colors.success, color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  finalSummaryTitle: { color: colors.ink, fontWeight: '900', fontSize: 18 },
  finalSummaryText: { marginTop: 4, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  finalSummaryStats: { flexDirection: 'row', gap: 10 },
  finalSummaryStat: { flex: 1, minHeight: 100, borderRadius: 18, padding: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  finalSummaryStatValue: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  finalSummaryStatLabel: { marginTop: 5, color: colors.muted, fontSize: 10.5, lineHeight: 15 },
  finalSummaryList: { gap: 9 },
  finalSummaryListTitle: { color: colors.ink, fontWeight: '900', fontSize: 15, marginBottom: 3 },
});
