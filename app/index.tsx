import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  assistantSuggestions,
  colors,
  flagOptions,
  goalOptions,
  housingOptions,
  lifeTasks,
  vaultDocuments,
} from '@/src/data';
import { clearSnapshot, defaultSnapshot, loadSnapshot, saveSnapshot } from '@/src/storage';
import type { AppSnapshot, AppTab, LifeTask, UserProfile } from '@/src/types';
import {
  BottomNav,
  BrandMark,
  ChoiceCard,
  Field,
  GhostButton,
  Pill,
  PrimaryButton,
  ProgressBar,
  ScreenShell,
  SecondaryButton,
  SectionTitle,
  uiStyles,
} from '@/src/ui';

type Message = { id: string; role: 'user' | 'assistant'; text: string; source?: string };

export default function TutoVieApp() {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(defaultSnapshot);
  const [hydrated, setHydrated] = useState(false);
  const [selectedTask, setSelectedTask] = useState<LifeTask | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'hello', role: 'assistant', text: 'Salut. Explique-moi où tu en es, et je te dirai la prochaine étape sans jargon.' },
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
  const patchProfile = (next: Partial<UserProfile>) =>
    setSnapshot((current) => ({ ...current, profile: { ...current.profile, ...next } }));
  const toggleTask = (id: string) => setSnapshot((current) => ({
    ...current,
    completedTaskIds: current.completedTaskIds.includes(id)
      ? current.completedTaskIds.filter((taskId) => taskId !== id)
      : [...current.completedTaskIds, id],
  }));

  if (!hydrated) return <Splash />;

  return (
    <View style={styles.root}>
      {snapshot.stage === 'welcome' && (
        <Welcome onStart={() => patch({ stage: 'auth' })} onDemo={() => patch({ stage: 'onboarding', onboardingStep: 0 })} />
      )}
      {snapshot.stage === 'auth' && (
        <Auth
          email={snapshot.profile.email}
          onEmail={(email) => patchProfile({ email })}
          onBack={() => patch({ stage: 'welcome' })}
          onContinue={() => patch({ stage: 'onboarding', onboardingStep: 0 })}
        />
      )}
      {snapshot.stage === 'onboarding' && (
        <Onboarding snapshot={snapshot} patch={patch} patchProfile={patchProfile} onFinish={() => patch({ stage: 'generating' })} />
      )}
      {snapshot.stage === 'generating' && <Generating onDone={() => patch({ stage: 'app', selectedTab: 'home' })} />}
      {snapshot.stage === 'app' && (
        <MainApp
          snapshot={snapshot}
          messages={messages}
          onMessages={setMessages}
          onTab={(selectedTab) => patch({ selectedTab })}
          onOpenTask={setSelectedTask}
          onToggleTask={toggleTask}
          onReset={() => {
            Alert.alert('Réinitialiser TutoVie ?', 'Toutes les données locales seront supprimées.', [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Réinitialiser',
                style: 'destructive',
                onPress: () => void clearSnapshot().then(() => setSnapshot(defaultSnapshot)),
              },
            ]);
          }}
        />
      )}
      <TaskModal
        task={selectedTask}
        completed={selectedTask ? snapshot.completedTaskIds.includes(selectedTask.id) : false}
        onClose={() => setSelectedTask(null)}
        onToggle={toggleTask}
      />
    </View>
  );
}

function Splash() {
  const scale = useRef(new Animated.Value(0.84)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);
  return <View style={styles.center}><Animated.View style={{ opacity, transform: [{ scale }] }}><BrandMark /></Animated.View><Text style={styles.muted}>Le tuto de la vie adulte.</Text></View>;
}

function Welcome({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -8, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, [float]);
  return (
    <ScreenShell contentStyle={styles.welcome}>
      <BrandMark />
      <Animated.View style={[styles.hero, { transform: [{ translateY: float }] }]}>
        <View style={[styles.miniCard, { left: 0, top: 24 }]}><Text>🏠  Premier appart</Text></View>
        <View style={[styles.miniCard, { right: 0, top: 58 }]}><Text>💸  Aides à vérifier</Text></View>
        <View style={[styles.miniCard, { left: 28, bottom: 5 }]}><Text>📁  Papiers carrés</Text></View>
        <View style={styles.orb}><Text style={styles.orbText}>?</Text></View>
      </Animated.View>
      <View>
        <Pill tone="lime">LE MODE D’EMPLOI QUI MANQUAIT</Pill>
        <Text style={styles.heroTitle}>La vie adulte aurait dû avoir un tuto.</Text>
        <Text style={uiStyles.subtitle}>Logement, aides, papiers, santé : TutoVie te dit quoi faire, dans quel ordre, et où trouver la bonne source.</Text>
      </View>
      <View style={styles.stack}>
        <PrimaryButton label="Créer mon parcours" icon="→" onPress={onStart} />
        <SecondaryButton label="Tester sans compte" onPress={onDemo} />
        <Text style={styles.caption}>Démo locale : aucune donnée n’est envoyée.</Text>
      </View>
    </ScreenShell>
  );
}

function Auth({ email, onEmail, onBack, onContinue }: { email: string; onEmail: (value: string) => void; onBack: () => void; onContinue: () => void }) {
  return (
    <ScreenShell>
      <View style={styles.top}><GhostButton label="← Retour" onPress={onBack} /><BrandMark compact /></View>
      <View style={styles.intro}><Text style={uiStyles.eyebrow}>CONNEXION</Text><Text style={uiStyles.title}>Ton parcours, retrouvé partout.</Text><Text style={uiStyles.subtitle}>La connexion est simulée. L’interface est prête pour une vraie authentification mobile et web.</Text></View>
      <View style={[uiStyles.card, styles.stack]}>
        <Field label="Adresse e-mail" value={email} onChangeText={onEmail} placeholder="prenom@ecole.fr" keyboardType="email-address" autoCapitalize="none" />
        <PrimaryButton label="Recevoir mon lien magique" onPress={onContinue} disabled={!email.includes('@')} />
        <Text style={styles.caption}>ou</Text>
        <SecondaryButton label="Continuer avec Google" icon="G" onPress={onContinue} />
        <SecondaryButton label="Continuer avec Apple" icon="●" onPress={onContinue} />
      </View>
      <Text style={styles.caption}>Aucun mot de passe réel n’est traité dans ce prototype.</Text>
    </ScreenShell>
  );
}

function Onboarding({ snapshot, patch, patchProfile, onFinish }: { snapshot: AppSnapshot; patch: (next: Partial<AppSnapshot>) => void; patchProfile: (next: Partial<UserProfile>) => void; onFinish: () => void }) {
  const step = snapshot.onboardingStep;
  const profile = snapshot.profile;
  const canContinue = step === 0
    ? profile.firstName.trim().length > 1 && Boolean(profile.age) && profile.city.trim().length > 1
    : step === 1 ? profile.housingStatus !== null : step === 3 ? profile.goals.length > 0 : true;
  const toggle = (key: 'flags' | 'goals', value: string) => {
    const current = profile[key] as string[];
    patchProfile({ [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] } as Partial<UserProfile>);
  };
  return (
    <ScreenShell>
      <View style={styles.top}><GhostButton label={step ? '← Retour' : '← Accueil'} onPress={() => step ? patch({ onboardingStep: step - 1 }) : patch({ stage: 'welcome' })} /><Text style={styles.caption}>{step + 1}/4</Text></View>
      <ProgressBar value={(step + 1) / 4} />
      <View style={styles.intro}>
        {step === 0 && <><Text style={uiStyles.eyebrow}>D’ABORD, TOI</Text><Text style={uiStyles.title}>On fait connaissance ?</Text><Text style={uiStyles.subtitle}>Juste assez d’infos pour éviter les conseils génériques.</Text><View style={styles.form}><Field label="Ton prénom" value={profile.firstName} onChangeText={(firstName) => patchProfile({ firstName })} placeholder="Lina" /><View style={styles.row}><View style={styles.flex}><Field label="Ton âge" value={profile.age} onChangeText={(age) => patchProfile({ age: age.replace(/\D/g, '').slice(0, 2) })} keyboardType="number-pad" placeholder="19" /></View><View style={styles.flex}><Field label="Ta ville d’études" value={profile.city} onChangeText={(city) => patchProfile({ city })} placeholder="Lyon" /></View></View></View></>}
        {step === 1 && <><Text style={uiStyles.eyebrow}>TON LOGEMENT</Text><Text style={uiStyles.title}>Tu en es où ?</Text><Text style={uiStyles.subtitle}>Le bon ordre des démarches dépend surtout de cette étape.</Text><View style={styles.choices}>{housingOptions.map((option) => <ChoiceCard key={option.id} {...option} selected={profile.housingStatus === option.id} title={option.label} onPress={() => patchProfile({ housingStatus: option.id })} />)}</View></>}
        {step === 2 && <><Text style={uiStyles.eyebrow}>TA SITUATION</Text><Text style={uiStyles.title}>Qu’est-ce qui te concerne ?</Text><Text style={uiStyles.subtitle}>Tu peux passer cette étape. On ajustera plus tard.</Text><View style={styles.choices}>{flagOptions.map((option) => <ChoiceCard key={option.id} title={option.label} compact selected={profile.flags.includes(option.id)} onPress={() => toggle('flags', option.id)} />)}</View></>}
        {step === 3 && <><Text style={uiStyles.eyebrow}>TON OBJECTIF</Text><Text style={uiStyles.title}>Tu veux régler quoi en premier ?</Text><Text style={uiStyles.subtitle}>Choisis une ou plusieurs priorités.</Text><View style={styles.choices}>{goalOptions.map((option) => <ChoiceCard key={option.id} {...option} selected={profile.goals.includes(option.id)} title={option.label} onPress={() => toggle('goals', option.id)} />)}</View></>}
      </View>
      <PrimaryButton label={step === 3 ? 'Créer mon TutoVie' : 'Continuer'} onPress={() => step === 3 ? onFinish() : patch({ onboardingStep: step + 1 })} disabled={!canContinue} />
    </ScreenShell>
  );
}

function Generating({ onDone }: { onDone: () => void }) {
  const progress = useRef(new Animated.Value(0.04)).current;
  const [label, setLabel] = useState('On comprend ta situation…');
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 2200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    const a = setTimeout(() => setLabel('On vérifie les étapes utiles…'), 550);
    const b = setTimeout(() => setLabel('On met tout dans le bon ordre…'), 1250);
    const c = setTimeout(onDone, 2400);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, [onDone, progress]);
  return <ScreenShell scroll={false} contentStyle={styles.center}><View style={styles.generator}><Text style={styles.generatorText}>✦</Text></View><Text style={uiStyles.titleSmall}>On prépare ton tuto.</Text><Text style={styles.muted}>{label}</Text><View style={styles.progressWide}><ProgressBar value={0} animatedValue={progress} /></View><Text style={styles.caption}>Sources officielles · étapes personnalisées · validation humaine</Text></ScreenShell>;
}

function MainApp({ snapshot, messages, onMessages, onTab, onOpenTask, onToggleTask, onReset }: { snapshot: AppSnapshot; messages: Message[]; onMessages: (value: Message[]) => void; onTab: (tab: AppTab) => void; onOpenTask: (task: LifeTask) => void; onToggleTask: (id: string) => void; onReset: () => void }) {
  return <View style={styles.root}>{snapshot.selectedTab === 'home' && <Home snapshot={snapshot} onOpenTask={onOpenTask} onTab={onTab} onToggleTask={onToggleTask} />}{snapshot.selectedTab === 'roadmap' && <Roadmap snapshot={snapshot} onOpenTask={onOpenTask} onToggleTask={onToggleTask} />}{snapshot.selectedTab === 'assistant' && <Assistant profile={snapshot.profile} messages={messages} onMessages={onMessages} />}{snapshot.selectedTab === 'vault' && <Vault />}{snapshot.selectedTab === 'profile' && <Profile snapshot={snapshot} onReset={onReset} />}<BottomNav active={snapshot.selectedTab} onChange={onTab} /></View>;
}

function Home({ snapshot, onOpenTask, onTab, onToggleTask }: { snapshot: AppSnapshot; onOpenTask: (task: LifeTask) => void; onTab: (tab: AppTab) => void; onToggleTask: (id: string) => void }) {
  const nextTask = lifeTasks.find((task) => !snapshot.completedTaskIds.includes(task.id)) ?? lifeTasks[0];
  const progress = Math.min(0.92, 0.22 + snapshot.completedTaskIds.length * 0.11);
  if (!nextTask) return null;
  return <ScreenShell contentStyle={styles.tab}><View style={styles.top}><BrandMark compact /><View style={styles.avatar}><Text style={styles.avatarText}>{(snapshot.profile.firstName || 'T')[0]}</Text></View></View><View style={styles.greeting}><View><Text style={styles.greetingTitle}>Salut {snapshot.profile.firstName || 'toi'} 👋</Text><Text style={styles.muted}>Voilà la prochaine chose utile à faire.</Text></View><Pill tone="lime">NIV. 2</Pill></View><View style={styles.darkCard}><View style={styles.top}><Text style={styles.darkLabel}>TON INDÉPENDANCE</Text><Pill tone="neutral">+{120 + snapshot.completedTaskIds.length * 50} XP</Pill></View><Text style={styles.darkValue}>{Math.round(progress * 100)}%</Text><ProgressBar value={progress} /><Text style={styles.darkHint}>{snapshot.completedTaskIds.length ? `${snapshot.completedTaskIds.length} démarche terminée.` : 'Complète ta première démarche pour avancer.'}</Text></View><Pressable onPress={() => onOpenTask(nextTask)} style={({ pressed }) => [styles.nextCard, pressed && styles.pressed]}><View style={styles.top}><Pill tone="lime">PROCHAINE ÉTAPE</Pill><Text style={styles.nextMeta}>{nextTask.duration}</Text></View><Text style={styles.nextTitle}>{nextTask.title}</Text><Text style={styles.nextText}>{nextTask.subtitle}</Text><Text style={styles.nextMeta}>⏱ {nextTask.timing}  →</Text></Pressable><View style={styles.quick}><Quick icon="📷" title="Comprendre un courrier" caption="Scan factice" /><Quick icon="✦" title="Poser une question" caption="Assistant" onPress={() => onTab('assistant')} /><Quick icon="📁" title="Voir mes papiers" caption="2 manquent" onPress={() => onTab('vault')} /></View><SectionTitle title="Ta roadmap" action={<Pressable onPress={() => onTab('roadmap')}><Text style={styles.link}>Tout voir</Text></Pressable>} /><View style={styles.list}>{lifeTasks.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} done={snapshot.completedTaskIds.includes(task.id)} onOpen={() => onOpenTask(task)} onToggle={() => onToggleTask(task.id)} />)}</View><View style={styles.info}><Text style={styles.infoTitle}>✓  TutoVie ne remplace pas les organismes.</Text><Text style={styles.infoText}>L’app t’oriente et renvoie vers la source officielle pour confirmer.</Text></View></ScreenShell>;
}

function Quick({ icon, title, caption, onPress }: { icon: string; title: string; caption: string; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickCaption}>{caption}</Text></Pressable>;
}

function TaskRow({ task, done, onOpen, onToggle }: { task: LifeTask; done: boolean; onOpen: () => void; onToggle: () => void }) {
  return <Pressable onPress={onOpen} style={({ pressed }) => [styles.task, pressed && styles.pressed]}><Pressable onPress={onToggle} style={[styles.check, done && styles.checkDone]}><Text style={styles.checkText}>{done ? '✓' : ''}</Text></Pressable><View style={styles.flex}><Text style={[styles.taskTitle, done && styles.strike]}>{task.title}</Text><Text style={styles.taskMeta}>{task.category} · {task.duration}</Text></View><Text style={styles.chevron}>›</Text></Pressable>;
}

function Roadmap({ snapshot, onOpenTask, onToggleTask }: { snapshot: AppSnapshot; onOpenTask: (task: LifeTask) => void; onToggleTask: (id: string) => void }) {
  return <ScreenShell contentStyle={styles.tab}><Text style={uiStyles.eyebrow}>TON PARCOURS</Text><Text style={uiStyles.title}>Tout, dans le bon ordre.</Text><Text style={uiStyles.subtitle}>Les étapes s’adaptent à ta situation.</Text><View style={styles.timeline}>{lifeTasks.map((task, index) => { const done = snapshot.completedTaskIds.includes(task.id); return <View key={task.id} style={styles.timelineRow}><Pressable onPress={() => onToggleTask(task.id)} style={[styles.timelineDot, done && styles.checkDone]}><Text style={styles.checkText}>{done ? '✓' : index + 1}</Text></Pressable><Pressable onPress={() => onOpenTask(task)} style={({ pressed }) => [styles.timelineCard, pressed && styles.pressed]}><View style={styles.top}><Pill tone={task.priority === 'urgent' ? 'warning' : 'neutral'}>{task.priority === 'urgent' ? 'À FAIRE MAINTENANT' : task.priority === 'soon' ? 'À ANTICIPER' : 'PLUS TARD'}</Pill><Text style={styles.taskMeta}>{task.duration}</Text></View><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.taskMeta}>{task.subtitle}</Text></Pressable></View>; })}</View></ScreenShell>;
}

function Assistant({ profile, messages, onMessages }: { profile: UserProfile; messages: Message[]; onMessages: (value: Message[]) => void }) {
  const [input, setInput] = useState('');
  const send = (forced?: string) => {
    const value = (forced ?? input).trim();
    if (!value) return;
    const user: Message = { id: `${Date.now()}-u`, role: 'user', text: value };
    const next = [...messages, user];
    onMessages(next);
    setInput('');
    setTimeout(() => onMessages([...next, { id: `${Date.now()}-a`, role: 'assistant', text: 'Dans cette démo, je commencerais par vérifier ton logement puis je créerais une checklist sourcée. Le moteur réel devra vérifier la règle officielle à jour.', source: 'Réponse simulée · source officielle à brancher' }]), 650);
  };
  return <SafeAreaView style={styles.assistantSafe} edges={['top']}><View style={styles.assistantHead}><View><Text style={styles.assistantTitle}>Assistant TutoVie</Text><Text style={styles.online}>● Démo locale</Text></View><Text style={styles.spark}>✦</Text></View><ScrollView contentContainerStyle={styles.chat}><View style={styles.context}><Text style={styles.infoTitle}>Je connais ton parcours</Text><Text style={styles.taskMeta}>Premier logement · {profile.city || 'Lyon'} · démarches prioritaires</Text></View>{messages.map((message) => <View key={message.id} style={[styles.message, message.role === 'user' && styles.messageUser]}><Text style={[styles.messageText, message.role === 'user' && styles.messageTextUser]}>{message.text}</Text>{message.source && <Text style={styles.messageSource}>{message.source}</Text>}</View>)}{messages.length === 1 && <View style={styles.suggestions}>{assistantSuggestions.map((suggestion) => <Pressable key={suggestion} onPress={() => send(suggestion)} style={styles.suggestion}><Text style={styles.suggestionText}>{suggestion}</Text></Pressable>)}</View>}</ScrollView><View style={styles.composer}><TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send()} placeholder="Ex. J’ai trouvé un appart…" placeholderTextColor="#9992A1" style={styles.composerInput} /><Pressable onPress={() => send()} style={styles.send}><Text style={styles.sendText}>↑</Text></Pressable></View><Text style={styles.aiNote}>L’IA peut se tromper. Confirme les démarches importantes sur la source affichée.</Text></SafeAreaView>;
}

function Vault() {
  const ready = vaultDocuments.filter((document) => document.status === 'ready').length;
  return <ScreenShell contentStyle={styles.tab}><Text style={uiStyles.eyebrow}>TON COFFRE</Text><Text style={uiStyles.title}>Tes papiers, enfin retrouvables.</Text><Text style={uiStyles.subtitle}>L’ajout de fichiers est simulé dans cette V1.</Text><View style={styles.summary}><Text style={styles.darkLabel}>DOSSIER DE BASE</Text><Text style={styles.summaryValue}>{ready}/{vaultDocuments.length} prêts</Text><ProgressBar value={ready / vaultDocuments.length} /></View><PrimaryButton label="Ajouter un document" icon="＋" onPress={() => Alert.alert('Fonction préparée', 'Le sélecteur, le chiffrement et le stockage privé seront connectés au backend.')} /><SectionTitle title="Documents utiles" /><View style={styles.list}>{vaultDocuments.map((document) => <View key={document.id} style={styles.document}><View style={[styles.docIcon, document.status === 'ready' && styles.docReady]}><Text>{document.status === 'ready' ? '✓' : document.status === 'expires' ? '!' : '+'}</Text></View><View style={styles.flex}><Text style={styles.taskTitle}>{document.label}</Text><Text style={styles.taskMeta}>{document.hint}</Text></View><Pill tone={document.status === 'ready' ? 'success' : document.status === 'expires' ? 'warning' : 'neutral'}>{document.status === 'ready' ? 'PRÊT' : document.status === 'expires' ? 'À VÉRIFIER' : 'MANQUANT'}</Pill></View>)}</View></ScreenShell>;
}

function Profile({ snapshot, onReset }: { snapshot: AppSnapshot; onReset: () => void }) {
  const housing = housingOptions.find((option) => option.id === snapshot.profile.housingStatus)?.label ?? 'Non renseigné';
  return <ScreenShell contentStyle={styles.tab}><View style={styles.profile}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{(snapshot.profile.firstName || 'T')[0]}</Text></View><Text style={styles.profileName}>{snapshot.profile.firstName || 'Profil démo'}</Text><Text style={styles.muted}>{snapshot.profile.age || '—'} ans · {snapshot.profile.city || 'Ville non renseignée'}</Text><Pill tone="lime">PARCOURS EN COURS</Pill></View><SectionTitle title="Ta situation" /><View style={styles.profileCard}><ProfileRow label="Logement" value={housing} /><ProfileRow label="Priorités" value={`${snapshot.profile.goals.length || 1} sélectionnée(s)`} /><ProfileRow label="Démarches terminées" value={String(snapshot.completedTaskIds.length)} /></View><View style={styles.info}><Text style={styles.infoTitle}>Prototype interactif</Text><Text style={styles.infoText}>La connexion, le scanner, l’IA et les notifications sont simulés.</Text></View><SecondaryButton label="Réinitialiser la démo" onPress={onReset} /><Text style={styles.caption}>TutoVie 0.1.0 · Expo SDK 57</Text></ScreenShell>;
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.profileRow}><Text style={styles.taskTitle}>{label}</Text><Text style={styles.taskMeta}>{value}</Text></View>;
}

function TaskModal({ task, completed, onClose, onToggle }: { task: LifeTask | null; completed: boolean; onClose: () => void; onToggle: (id: string) => void }) {
  return <Modal visible={Boolean(task)} animationType="slide" transparent onRequestClose={onClose}><View style={styles.backdrop}><Pressable style={styles.dismiss} onPress={onClose} />{task && <SafeAreaView edges={['bottom']} style={styles.sheet}><View style={styles.handle} /><ScrollView contentContainerStyle={styles.sheetContent}><View style={styles.top}><Pill tone={task.priority === 'urgent' ? 'warning' : 'purple'}>{task.category.toUpperCase()}</Pill><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View><Text style={styles.sheetTitle}>{task.title}</Text><Text style={uiStyles.subtitle}>{task.subtitle}</Text><View style={styles.facts}><View style={styles.fact}><Text style={styles.darkLabel}>TEMPS</Text><Text style={styles.taskTitle}>{task.duration}</Text></View><View style={styles.fact}><Text style={styles.darkLabel}>QUAND</Text><Text style={styles.taskTitle}>{task.timing}</Text></View></View><Detail title="Pourquoi ?"><Text style={styles.detailText}>{task.why}</Text></Detail><Detail title="À préparer">{task.documents.map((document) => <Text key={document} style={styles.detailText}>• {document}</Text>)}</Detail><Detail title="Pas à pas">{task.steps.map((step, index) => <View key={step} style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={[styles.detailText, styles.flex]}>{step}</Text></View>)}</Detail><Pressable onPress={() => void Linking.openURL(task.sourceUrl)} style={styles.source}><Text style={styles.spark}>↗</Text><View style={styles.flex}><Text style={styles.darkLabel}>SOURCE OFFICIELLE</Text><Text style={styles.taskTitle}>{task.sourceLabel}</Text></View><Text style={styles.chevron}>›</Text></Pressable><PrimaryButton label={completed ? 'Marquer comme à faire' : 'C’est fait'} icon={completed ? '↺' : '✓'} onPress={() => { onToggle(task.id); onClose(); }} /><Text style={styles.caption}>La version réelle affichera la date de dernière vérification de la source.</Text></ScrollView></SafeAreaView>}</View></Modal>;
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.detail}><Text style={styles.detailTitle}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 15, backgroundColor: colors.canvas },
  welcome: { justifyContent: 'space-between', paddingTop: 12 },
  hero: { height: 270, alignItems: 'center', justifyContent: 'center' },
  miniCard: { position: 'absolute', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  orb: { width: 154, height: 154, borderRadius: 77, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderWidth: 14, borderColor: '#E8E1FF' },
  orbText: { color: '#fff', fontSize: 80, fontWeight: '900' },
  heroTitle: { marginTop: 14, color: colors.ink, fontSize: 42, lineHeight: 45, fontWeight: '900', letterSpacing: -1.7 },
  stack: { gap: 12 },
  caption: { textAlign: 'center', color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  muted: { color: colors.muted, fontSize: 14 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  intro: { marginTop: 42, marginBottom: 28 },
  form: { marginTop: 28, gap: 18 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  choices: { marginTop: 26, gap: 11 },
  generator: { width: 112, height: 112, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  generatorText: { color: colors.primary, fontSize: 58, fontWeight: '900' },
  progressWide: { width: '80%', marginVertical: 12 },
  tab: { paddingTop: 12, paddingBottom: 26 },
  avatar: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.peach },
  avatarText: { fontWeight: '900', fontSize: 16 },
  greeting: { marginTop: 26, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingTitle: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 },
  darkCard: { marginTop: 19, padding: 19, gap: 10, borderRadius: 24, backgroundColor: colors.ink },
  darkLabel: { color: '#9A91A4', fontSize: 10.5, fontWeight: '900', letterSpacing: 1 },
  darkValue: { color: '#fff', fontSize: 31, fontWeight: '900' },
  darkHint: { color: '#C5BDCC', fontSize: 12 },
  nextCard: { marginTop: 17, minHeight: 225, padding: 20, justifyContent: 'space-between', borderRadius: 27, backgroundColor: colors.primary },
  nextTitle: { color: '#fff', fontSize: 26, lineHeight: 31, fontWeight: '900' },
  nextText: { color: '#E8E1FF', fontSize: 14 },
  nextMeta: { color: '#F5F1FF', fontSize: 12, fontWeight: '700' },
  quick: { marginTop: 16, flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, minHeight: 126, padding: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  quickIcon: { fontSize: 21, marginBottom: 14 },
  quickTitle: { color: colors.ink, fontSize: 13, lineHeight: 16, fontWeight: '900' },
  quickCaption: { marginTop: 5, color: colors.muted, fontSize: 10.5 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  link: { color: colors.primary, fontWeight: '800' },
  list: { gap: 9 },
  task: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  check: { width: 30, height: 30, borderRadius: 10, borderWidth: 1, borderColor: '#D8D2E1', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { color: '#fff', fontWeight: '900' },
  taskTitle: { color: colors.ink, fontSize: 14, lineHeight: 18, fontWeight: '800' },
  taskMeta: { marginTop: 3, color: colors.muted, fontSize: 11.5, lineHeight: 16 },
  strike: { textDecorationLine: 'line-through', color: colors.muted },
  chevron: { color: '#AAA3B2', fontSize: 25 },
  info: { marginTop: 22, padding: 16, borderRadius: 20, backgroundColor: '#EBF8F1', borderWidth: 1, borderColor: '#CFECDD' },
  infoTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  infoText: { marginTop: 4, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  timeline: { marginTop: 28, gap: 13 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  timelineDot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  timelineCard: { flex: 1, padding: 16, gap: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  assistantSafe: { flex: 1, backgroundColor: colors.canvas },
  assistantHead: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assistantTitle: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  online: { marginTop: 3, color: colors.success, fontSize: 11, fontWeight: '700' },
  spark: { color: colors.primary, fontSize: 25, fontWeight: '900' },
  chat: { paddingHorizontal: 20, paddingBottom: 18, gap: 10 },
  context: { padding: 14, borderRadius: 18, backgroundColor: colors.primarySoft },
  message: { maxWidth: '86%', alignSelf: 'flex-start', padding: 13, borderRadius: 18, borderBottomLeftRadius: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  messageUser: { alignSelf: 'flex-end', borderBottomLeftRadius: 18, borderBottomRightRadius: 5, backgroundColor: colors.primary, borderColor: colors.primary },
  messageText: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  messageTextUser: { color: '#fff' },
  messageSource: { marginTop: 8, color: colors.muted, fontSize: 10.5 },
  suggestions: { gap: 8 },
  suggestion: { padding: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  suggestionText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  composer: { marginHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 7, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  composerInput: { flex: 1, minHeight: 42, paddingHorizontal: 10, color: colors.ink },
  send: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  sendText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  aiNote: { paddingHorizontal: 20, paddingVertical: 8, textAlign: 'center', color: colors.muted, fontSize: 9.5 },
  summary: { marginVertical: 22, padding: 18, gap: 11, borderRadius: 23, backgroundColor: colors.ink },
  summaryValue: { color: '#fff', fontSize: 25, fontWeight: '900' },
  document: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  docIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EDF4' },
  docReady: { backgroundColor: '#DFF5E8' },
  profile: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  profileAvatar: { width: 78, height: 78, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.peach },
  profileAvatarText: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  profileName: { color: colors.ink, fontSize: 27, fontWeight: '900' },
  profileCard: { borderRadius: 21, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  profileRow: { minHeight: 58, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23,19,31,0.48)' },
  dismiss: { flex: 1 },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.canvas },
  handle: { width: 46, height: 5, marginTop: 9, alignSelf: 'center', borderRadius: 99, backgroundColor: '#D8D1DF' },
  sheetContent: { padding: 20, paddingBottom: 28, gap: 14 },
  close: { color: colors.ink, fontSize: 28 },
  sheetTitle: { color: colors.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8 },
  facts: { flexDirection: 'row', gap: 10 },
  fact: { flex: 1, minHeight: 75, padding: 13, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  detail: { gap: 8, paddingVertical: 4 },
  detailTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  detailText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNumber: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  stepNumberText: { color: colors.primary, fontWeight: '900' },
  source: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
});
