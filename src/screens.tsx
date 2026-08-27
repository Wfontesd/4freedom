import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { assistantSuggestions, colors, documents, housingOptions, needOptions, studyStatusOptions } from './data';
import { getRecommendedJourneyIds, journeyById, journeys } from './journeys';
import type {
  AppSnapshot,
  AppTab,
  DocumentDefinition,
  DocumentStatus,
  JourneyCategory,
  JourneyDefinition,
  JourneyId,
  NeedId,
  UserProfile,
} from './types';
import {
  BrandMark,
  ChoiceCard,
  Field,
  GhostButton,
  InfoCard,
  PrimaryButton,
  ProgressBar,
  ScreenShell,
  SecondaryButton,
  SectionTitle,
  SelectChip,
  StatusPill,
  uiStyles,
  useResponsiveLayout,
} from './ui';

export function HomeScreen({
  snapshot,
  onOpenJourney,
  onTab,
}: {
  snapshot: AppSnapshot;
  onOpenJourney: (journey: JourneyDefinition) => void;
  onTab: (tab: AppTab) => void;
}) {
  const { desktop } = useResponsiveLayout();
  const recommendedIds = getRecommendedJourneyIds(snapshot.profile.needs, snapshot.profile.housingStatus);
  const recommended = recommendedIds.map((id) => journeyById[id]).filter(Boolean);
  const active = recommended.find((journey) => snapshot.journeyProgress[journey.id]?.status !== 'completed') ?? recommended[0] ?? journeys[0];
  const completedCount = Object.values(snapshot.journeyProgress).filter((progress) => progress?.status === 'completed').length;
  const inProgressCount = Object.values(snapshot.journeyProgress).filter((progress) => progress?.status === 'in-progress').length;
  const readyDocuments = Object.values(snapshot.documentStates).filter((status) => status === 'ready').length;

  return (
    <ScreenShell contentStyle={styles.tabPage} maxWidth={1180}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.headerGreeting}>Bonjour {snapshot.profile.firstName || 'toi'}</Text>
          <Text style={styles.headerSub}>Voici ce qui est utile maintenant, sans te montrer tout le reste.</Text>
        </View>
        {!desktop ? <BrandMark compact /> : <StatusPill tone="purple">MAQUETTE GUIDÉE</StatusPill>}
      </View>

      <View style={[styles.homeLayout, desktop && styles.homeLayoutDesktop]}>
        <View style={[styles.homeMain, desktop && styles.homeMainDesktop]}>
          <Pressable onPress={() => onOpenJourney(active)} style={({ pressed }) => [styles.nextJourney, pressed && styles.pressed]}>
            <View style={[styles.nextIcon, { backgroundColor: active.color }]}><Text style={styles.nextIconText}>{active.icon}</Text></View>
            <View style={styles.nextCopy}>
              <StatusPill tone="lime">PROCHAINE DÉMARCHE CONSEILLÉE</StatusPill>
              <Text style={styles.nextTitle}>{active.title}</Text>
              <Text style={styles.nextDescription}>{active.description}</Text>
              <View style={styles.nextMetaRow}><Text style={styles.nextMeta}>{active.duration}</Text><Text style={styles.nextMeta}>·</Text><Text style={styles.nextMeta}>{active.timing}</Text></View>
            </View>
            <View style={styles.nextArrow}><Text style={styles.nextArrowText}>→</Text></View>
          </Pressable>

          <SectionTitle title="Les guides adaptés à ta situation" subtitle="Chaque guide te pose les questions une par une et accepte les informations inconnues." action={<Pressable onPress={() => onTab('roadmap')}><Text style={styles.link}>Tout afficher</Text></Pressable>} />
          <View style={[styles.journeyGrid, desktop && styles.journeyGridDesktop]}>
            {recommended.slice(0, desktop ? 4 : 3).map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                status={snapshot.journeyProgress[journey.id]?.status ?? 'not-started'}
                currentStep={snapshot.journeyProgress[journey.id]?.currentStep ?? 0}
                onPress={() => onOpenJourney(journey)}
                desktop={desktop}
              />
            ))}
          </View>

          <SectionTitle title="Accès directs" subtitle="Pour une situation précise, sans chercher dans un menu." />
          <View style={[styles.quickGrid, desktop && styles.quickGridDesktop]}>
            <QuickAction icon="€" title="Calculer mon budget" text="Saisis ce que tu connais et obtiens un plafond réaliste." onPress={() => onOpenJourney(journeyById['budget-logement'])} />
            <QuickAction icon="✉" title="Comprendre un courrier" text="Identifie la demande, la date limite et les pièces à préparer." onPress={() => onOpenJourney(journeyById['comprendre-courrier'])} />
            <QuickAction icon="?" title="Trouver qui contacter" text="Prépare le bon interlocuteur et ce que tu vas lui demander." onPress={() => onOpenJourney(journeyById['qui-contacter'])} />
            <QuickAction icon="▤" title="Faire le point sur mes papiers" text="Localise les documents essentiels et organise les manquants." onPress={() => onOpenJourney(journeyById['papiers-essentiels'])} />
          </View>
        </View>

        <View style={[styles.homeSide, desktop && styles.homeSideDesktop]}>
          <View style={styles.statusPanel}>
            <Text style={styles.statusPanelTitle}>Ton espace en un coup d’œil</Text>
            <StatusRow label="Guides terminés" value={String(completedCount)} />
            <StatusRow label="Guides commencés" value={String(inProgressCount)} />
            <StatusRow label="Documents localisés" value={`${readyDocuments}/${documents.length}`} />
            <View style={styles.statusProgress}><ProgressBar value={documents.length ? readyDocuments / documents.length : 0} /></View>
            <SecondaryButton label="Voir mes documents" onPress={() => onTab('vault')} compact />
          </View>

          <View style={styles.sideCard}>
            <Text style={styles.sideEyebrow}>TON PROFIL ACTUEL</Text>
            <Text style={styles.sideTitle}>{housingOptions.find((item) => item.id === snapshot.profile.housingStatus)?.label ?? 'Logement non renseigné'}</Text>
            <Text style={styles.sideText}>{snapshot.profile.city || 'Ville non renseignée'} · {studyStatusOptions.find((item) => item.id === snapshot.profile.studyStatus)?.label ?? 'Étudiant·e'}</Text>
            <View style={styles.tagList}>
              {snapshot.profile.needs.slice(0, 4).map((need) => <StatusPill key={need}>{needOptions.find((item) => item.id === need)?.label ?? need}</StatusPill>)}
            </View>
            <Pressable onPress={() => onTab('profile')} style={styles.sideLink}><Text style={styles.sideLinkText}>Modifier mon profil →</Text></Pressable>
          </View>

          <InfoCard title="Important" tone="yellow">TutoVie prépare les démarches et t’envoie vers les sources officielles. Il ne garantit ni un droit, ni un montant, ni une décision administrative.</InfoCard>
        </View>
      </View>
    </ScreenShell>
  );
}

function JourneyCard({
  journey,
  status,
  currentStep,
  onPress,
  desktop,
}: {
  journey: JourneyDefinition;
  status: 'not-started' | 'in-progress' | 'completed';
  currentStep: number;
  onPress: () => void;
  desktop: boolean;
}) {
  const progress = status === 'completed' ? 1 : Math.min(0.92, currentStep / journey.steps.length);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.journeyCard, desktop && styles.journeyCardDesktop, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { backgroundColor: journey.color }]}><Text style={styles.cardIconText}>{journey.icon}</Text></View>
        <StatusPill tone={status === 'completed' ? 'good' : status === 'in-progress' ? 'purple' : 'neutral'}>{status === 'completed' ? 'TERMINÉ' : status === 'in-progress' ? 'À REPRENDRE' : journey.category.toUpperCase()}</StatusPill>
      </View>
      <Text style={styles.journeyCardTitle}>{journey.shortTitle}</Text>
      <Text style={styles.journeyCardText}>{journey.description}</Text>
      {status === 'in-progress' ? <View style={styles.cardProgress}><ProgressBar value={progress} /></View> : null}
      <Text style={styles.journeyCardMeta}>{status === 'in-progress' ? `Étape ${Math.min(currentStep + 1, journey.steps.length)} sur ${journey.steps.length}` : `${journey.duration} · ${journey.steps.length} étapes`}</Text>
    </Pressable>
  );
}

function QuickAction({ icon, title, text, onPress }: { icon: string; title: string; text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
      <View style={styles.quickIcon}><Text style={styles.quickIconText}>{icon}</Text></View>
      <View style={styles.flex}><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickText}>{text}</Text></View>
      <Text style={styles.quickArrow}>→</Text>
    </Pressable>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.statusRow}><Text style={styles.statusLabel}>{label}</Text><Text style={styles.statusValue}>{value}</Text></View>;
}

export function RoadmapScreen({
  snapshot,
  onOpenJourney,
}: {
  snapshot: AppSnapshot;
  onOpenJourney: (journey: JourneyDefinition) => void;
}) {
  const { desktop } = useResponsiveLayout();
  const [category, setCategory] = useState<'Tous' | JourneyCategory>('Tous');
  const [query, setQuery] = useState('');
  const categories: ('Tous' | JourneyCategory)[] = ['Tous', 'Logement', 'Aides', 'Documents', 'Santé', 'Impôts', 'Urgence'];
  const normalizedQuery = query.trim().toLocaleLowerCase('fr');
  const filtered = journeys.filter((journey) => {
    const categoryMatch = category === 'Tous' || journey.category === category;
    const queryMatch = !normalizedQuery || `${journey.title} ${journey.description} ${journey.category}`.toLocaleLowerCase('fr').includes(normalizedQuery);
    return categoryMatch && queryMatch;
  });
  const completed = journeys.filter((journey) => snapshot.journeyProgress[journey.id]?.status === 'completed').length;

  return (
    <ScreenShell contentStyle={styles.tabPage} maxWidth={1180}>
      <View style={[styles.sectionHero, desktop && styles.sectionHeroDesktop]}>
        <View style={styles.flex}>
          <Text style={uiStyles.eyebrow}>MES DÉMARCHES</Text>
          <Text style={uiStyles.title}>Un guide complet pour chaque situation.</Text>
          <Text style={uiStyles.subtitle}>Tu peux commencer n’importe où. Les réponses sont conservées et chaque récapitulatif indique ce qu’il reste à vérifier.</Text>
        </View>
        <View style={styles.completionCard}>
          <Text style={styles.completionValue}>{completed}/{journeys.length}</Text>
          <Text style={styles.completionLabel}>guides enregistrés</Text>
          <ProgressBar value={completed / journeys.length} />
        </View>
      </View>

      <View style={[styles.filters, desktop && styles.filtersDesktop]}>
        <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Chercher une démarche" placeholderTextColor="#9C94A3" style={styles.searchInput} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {categories.map((item) => <SelectChip key={item} selected={category === item} label={item} onPress={() => setCategory(item)} />)}
        </ScrollView>
      </View>

      <View style={[styles.roadmapGrid, desktop && styles.roadmapGridDesktop]}>
        {filtered.map((journey) => {
          const progress = snapshot.journeyProgress[journey.id];
          const status = progress?.status ?? 'not-started';
          return (
            <Pressable key={journey.id} onPress={() => onOpenJourney(journey)} style={({ pressed }) => [styles.roadmapCard, desktop && styles.roadmapCardDesktop, pressed && styles.pressed]}>
              <View style={styles.roadmapCardTop}>
                <View style={[styles.roadmapIcon, { backgroundColor: journey.color }]}><Text style={styles.roadmapIconText}>{journey.icon}</Text></View>
                <StatusPill tone={status === 'completed' ? 'good' : status === 'in-progress' ? 'purple' : journey.category === 'Urgence' ? 'warning' : 'neutral'}>{status === 'completed' ? 'ENREGISTRÉ' : status === 'in-progress' ? 'EN COURS' : journey.category.toUpperCase()}</StatusPill>
              </View>
              <Text style={styles.roadmapTitle}>{journey.title}</Text>
              <Text style={styles.roadmapText}>{journey.description}</Text>
              <View style={styles.roadmapFooter}>
                <Text style={styles.roadmapMeta}>{journey.duration} · {journey.steps.length} étapes</Text>
                <Text style={styles.roadmapArrow}>{status === 'in-progress' ? 'Reprendre →' : status === 'completed' ? 'Revoir →' : 'Commencer →'}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {!filtered.length ? <InfoCard title="Aucun guide trouvé" tone="blue">Essaie un autre mot ou enlève le filtre de catégorie.</InfoCard> : null}
    </ScreenShell>
  );
}

type AssistantMessage = { id: string; role: 'assistant' | 'user'; text: string; journeyId?: JourneyId };

export function AssistantScreen({ onOpenJourney }: { onOpenJourney: (journey: JourneyDefinition) => void }) {
  const { desktop } = useResponsiveLayout();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: 'welcome', role: 'assistant', text: 'Décris simplement ce qui t’arrive. Je vais identifier le guide adapté et t’expliquer pourquoi.' },
  ]);

  const submit = (forced?: string) => {
    const value = (forced ?? input).trim();
    if (!value) return;
    const journeyId = routeQuestion(value);
    const journey = journeyById[journeyId];
    const user: AssistantMessage = { id: `${Date.now()}-user`, role: 'user', text: value };
    const answer: AssistantMessage = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: `Le guide “${journey.shortTitle}” correspond le mieux. Il va te demander uniquement les informations utiles, accepter ce que tu ne sais pas encore, puis préparer les prochaines actions.`,
      journeyId,
    };
    setMessages((current) => [...current, user, answer]);
    setInput('');
  };

  return (
    <ScreenShell contentStyle={[styles.assistantPage, desktop && styles.assistantPageDesktop]} maxWidth={1120}>
      <View style={[styles.assistantIntro, desktop && styles.assistantIntroDesktop]}>
        <Text style={uiStyles.eyebrow}>ÊTRE ORIENTÉ</Text>
        <Text style={uiStyles.title}>Tu ne sais pas par où commencer ?</Text>
        <Text style={uiStyles.subtitle}>Explique la situation avec tes mots. Dans cette maquette, un routeur local choisit le parcours ; l’IA sourcée sera branchée ensuite.</Text>
        <InfoCard title="En cas de danger immédiat" tone="danger">TutoVie ne remplace pas les secours, les services d’urgence, un travailleur social ou un professionnel du droit.</InfoCard>
        {desktop ? (
          <View style={styles.assistantExamples}>
            <Text style={styles.assistantExamplesTitle}>Exemples de situations</Text>
            {assistantSuggestions.map((suggestion) => <Pressable key={suggestion} onPress={() => submit(suggestion)} style={styles.exampleRow}><Text style={styles.exampleArrow}>→</Text><Text style={styles.exampleText}>{suggestion}</Text></Pressable>)}
          </View>
        ) : null}
      </View>

      <View style={[styles.chatPanel, desktop && styles.chatPanelDesktop]}>
        <View style={styles.chatHeader}>
          <View><Text style={styles.chatTitle}>Assistant TutoVie</Text><Text style={styles.chatStatus}>● Routeur de démonstration actif</Text></View>
          <View style={styles.chatMark}><Text style={styles.chatMarkText}>?</Text></View>
        </View>
        <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatMessages} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.message, message.role === 'user' && styles.messageUser]}>
              <Text style={[styles.messageText, message.role === 'user' && styles.messageTextUser]}>{message.text}</Text>
              {message.journeyId ? <View style={styles.messageAction}><PrimaryButton label="Ouvrir le guide pas à pas" icon="→" onPress={() => onOpenJourney(journeyById[message.journeyId!])} compact /></View> : null}
            </View>
          ))}
          {!desktop && messages.length === 1 ? <View style={styles.mobileSuggestions}>{assistantSuggestions.map((suggestion) => <Pressable key={suggestion} onPress={() => submit(suggestion)} style={styles.mobileSuggestion}><Text style={styles.mobileSuggestionText}>{suggestion}</Text></Pressable>)}</View> : null}
        </ScrollView>
        <View style={styles.composer}>
          <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => submit()} placeholder="Ex. mon bailleur me demande un document…" placeholderTextColor="#9B93A2" style={styles.composerInput} multiline />
          <Pressable onPress={() => submit()} style={styles.sendButton}><Text style={styles.sendButtonText}>→</Text></Pressable>
        </View>
        <Text style={styles.assistantDisclaimer}>La réponse est simulée. Une version IA devra afficher sa source et reconnaître ses incertitudes.</Text>
      </View>
    </ScreenShell>
  );
}

function routeQuestion(value: string): JourneyId {
  const text = value.toLocaleLowerCase('fr');
  if (/(courrier|mail|lettre|message|comprends pas)/.test(text)) return 'comprendre-courrier';
  if (/(garant|visale|caution)/.test(text)) return 'garant-visale';
  if (/(arnaque|annonce|payer avant|fraude)/.test(text)) return 'verifier-annonce';
  if (/(caf|apl|aide logement)/.test(text)) return 'caf-logement';
  if (/(aides|droit|éligible)/.test(text)) return 'radar-aides';
  if (/(budget|loyer|combien|argent)/.test(text)) return 'budget-logement';
  if (/(bail|contrat de location|signer)/.test(text)) return 'comprendre-bail';
  if (/(dossier|documents location|pièces)/.test(text)) return 'dossier-locatif';
  if (/(ameli|carte vitale|santé|mutuelle)/.test(text)) return 'sante';
  if (/(impôt|déclaration|fiscal)/.test(text)) return 'premiers-impots';
  if (/(déménag|adresse|quitter mon logement)/.test(text)) return 'demenagement';
  if (/(clés|emménag|état des lieux|assurance habitation)/.test(text)) return 'emmenagement';
  if (/(cherche|trouver.*logement|appart)/.test(text)) return 'recherche-logement';
  return 'qui-contacter';
}

export function VaultScreen({
  documentStates,
  onChange,
}: {
  documentStates: Record<string, DocumentStatus>;
  onChange: (states: Record<string, DocumentStatus>) => void;
}) {
  const { desktop } = useResponsiveLayout();
  const [selected, setSelected] = useState<DocumentDefinition | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [method, setMethod] = useState<'camera' | 'import' | 'manual' | null>(null);
  const [readable, setReadable] = useState<'yes' | 'no' | null>(null);
  const [sensitiveChecked, setSensitiveChecked] = useState(false);
  const ready = documents.filter((document) => documentStates[document.id] === 'ready').length;

  const openWizard = (document?: DocumentDefinition) => {
    setSelected(document ?? null);
    setWizardStep(document ? 1 : 0);
    setMethod(null);
    setReadable(null);
    setSensitiveChecked(false);
    setWizardOpen(true);
  };

  const closeWizard = () => setWizardOpen(false);
  const saveDocument = () => {
    if (!selected) return;
    onChange({ ...documentStates, [selected.id]: readable === 'yes' && sensitiveChecked ? 'ready' : 'review' });
    setWizardStep(4);
  };

  return (
    <ScreenShell contentStyle={styles.tabPage} maxWidth={1180}>
      <View style={[styles.sectionHero, desktop && styles.sectionHeroDesktop]}>
        <View style={styles.flex}>
          <Text style={uiStyles.eyebrow}>MES DOCUMENTS</Text>
          <Text style={uiStyles.title}>Sache ce que tu as, ce qui manque et où le trouver.</Text>
          <Text style={uiStyles.subtitle}>Aucun fichier réel n’est envoyé dans cette maquette. Le parcours d’ajout, de contrôle et de classement est cependant complet.</Text>
        </View>
        <View style={styles.documentSummary}>
          <Text style={styles.documentSummaryValue}>{ready}/{documents.length}</Text>
          <Text style={styles.documentSummaryLabel}>documents localisés</Text>
          <ProgressBar value={ready / documents.length} />
          <PrimaryButton label="Ajouter un document" icon="＋" onPress={() => openWizard()} compact />
        </View>
      </View>

      <View style={[styles.documentGrid, desktop && styles.documentGridDesktop]}>
        {documents.map((document) => {
          const status = documentStates[document.id] ?? 'missing';
          return (
            <Pressable key={document.id} onPress={() => openWizard(document)} style={({ pressed }) => [styles.documentCard, desktop && styles.documentCardDesktop, pressed && styles.pressed]}>
              <View style={styles.documentCardTop}>
                <View style={[styles.documentIcon, status === 'ready' && styles.documentIconReady, status === 'review' && styles.documentIconReview]}><Text style={styles.documentIconText}>{status === 'ready' ? '✓' : status === 'review' ? '!' : '+'}</Text></View>
                <StatusPill tone={status === 'ready' ? 'good' : status === 'review' ? 'warning' : 'neutral'}>{status === 'ready' ? 'LOCALISÉ' : status === 'review' ? 'À VÉRIFIER' : 'MANQUANT'}</StatusPill>
              </View>
              <Text style={styles.documentTitle}>{document.label}</Text>
              <Text style={styles.documentCategory}>{document.category}</Text>
              <Text style={styles.documentText}>{document.description}</Text>
              <Text style={styles.documentOpen}>{status === 'missing' ? 'Préparer ce document →' : 'Voir ou modifier →'}</Text>
            </Pressable>
          );
        })}
      </View>

      <DocumentWizard
        visible={wizardOpen}
        step={wizardStep}
        selected={selected}
        method={method}
        readable={readable}
        sensitiveChecked={sensitiveChecked}
        onSelect={setSelected}
        onMethod={setMethod}
        onReadable={setReadable}
        onSensitive={setSensitiveChecked}
        onStep={setWizardStep}
        onSave={saveDocument}
        onClose={closeWizard}
      />
    </ScreenShell>
  );
}

function DocumentWizard({
  visible,
  step,
  selected,
  method,
  readable,
  sensitiveChecked,
  onSelect,
  onMethod,
  onReadable,
  onSensitive,
  onStep,
  onSave,
  onClose,
}: {
  visible: boolean;
  step: number;
  selected: DocumentDefinition | null;
  method: 'camera' | 'import' | 'manual' | null;
  readable: 'yes' | 'no' | null;
  sensitiveChecked: boolean;
  onSelect: (document: DocumentDefinition) => void;
  onMethod: (method: 'camera' | 'import' | 'manual') => void;
  onReadable: (value: 'yes' | 'no') => void;
  onSensitive: (value: boolean) => void;
  onStep: (step: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { desktop } = useResponsiveLayout();
  const canContinue = step === 0 ? Boolean(selected) : step === 1 ? Boolean(method) : step === 2 ? Boolean(readable) : step === 3 ? sensitiveChecked : true;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismiss} onPress={onClose} />
        <SafeAreaView style={[styles.modalCard, desktop && styles.modalCardDesktop]} edges={['bottom']}>
          <View style={styles.modalHeader}>
            <View><Text style={styles.modalEyebrow}>AJOUT DE DOCUMENT · {Math.min(step + 1, 4)}/4</Text><Text style={styles.modalTitle}>{step === 4 ? 'Document classé' : selected?.label ?? 'Quel document veux-tu ajouter ?'}</Text></View>
            <Pressable onPress={onClose} style={styles.modalClose}><Text style={styles.modalCloseText}>×</Text></Pressable>
          </View>
          {step < 4 ? <ProgressBar value={(step + 1) / 4} /> : null}
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {step === 0 ? (
              <View style={styles.wizardChoices}>{documents.map((document) => <ChoiceCard key={document.id} selected={selected?.id === document.id} title={document.label} caption={`${document.category} · ${document.why}`} onPress={() => onSelect(document)} />)}</View>
            ) : null}
            {step === 1 && selected ? (
              <View style={styles.wizardStack}>
                <InfoCard title="Le fichier reste factice" tone="blue">Ces boutons préparent la caméra, le sélecteur de fichiers et le classement manuel. Aucun document n’est lu dans la maquette.</InfoCard>
                {[
                  { id: 'camera', title: 'Prendre une photo', text: 'Prévisualisation, cadrage et contrôle de lisibilité.' },
                  { id: 'import', title: 'Importer un PDF ou une image', text: 'Sélection de fichier et extraction à brancher.' },
                  { id: 'manual', title: 'Je sais où il est', text: 'Marquer le document comme localisé sans l’envoyer.' },
                ].map((option) => <ChoiceCard key={option.id} selected={method === option.id} title={option.title} caption={option.text} onPress={() => onMethod(option.id as 'camera' | 'import' | 'manual')} />)}
              </View>
            ) : null}
            {step === 2 && selected ? (
              <View style={styles.wizardStack}>
                <View style={styles.previewMock}><Text style={styles.previewMockIcon}>▤</Text><Text style={styles.previewMockTitle}>{selected.label}</Text><Text style={styles.previewMockText}>{method === 'manual' ? 'Emplacement déclaré manuellement' : 'Aperçu factice du fichier sélectionné'}</Text></View>
                <Text style={styles.wizardQuestion}>Le document est-il lisible et complet ?</Text>
                <View style={styles.wizardChoiceRow}><View style={styles.flex}><ChoiceCard compact selected={readable === 'yes'} title="Oui" caption="Toutes les informations utiles sont visibles" onPress={() => onReadable('yes')} /></View><View style={styles.flex}><ChoiceCard compact selected={readable === 'no'} title="Pas encore" caption="Je dois reprendre ou retrouver le fichier" onPress={() => onReadable('no')} /></View></View>
              </View>
            ) : null}
            {step === 3 && selected ? (
              <View style={styles.wizardStack}>
                <Text style={styles.wizardQuestion}>Dernier contrôle avant classement</Text>
                <InfoCard title="Données sensibles" tone="yellow">Dans la version réelle, TutoVie expliquera quelles informations masquer avant de partager le document et demandera toujours une validation humaine.</InfoCard>
                <Pressable onPress={() => onSensitive(!sensitiveChecked)} style={[styles.confirmBox, sensitiveChecked && styles.confirmBoxSelected]}>
                  <View style={[styles.confirmCheck, sensitiveChecked && styles.confirmCheckSelected]}><Text style={styles.confirmCheckText}>{sensitiveChecked ? '✓' : ''}</Text></View>
                  <View style={styles.flex}><Text style={styles.confirmTitle}>J’ai vérifié le document</Text><Text style={styles.confirmText}>Je sais que l’ajout et l’analyse sont simulés et je ne dépose aucune vraie donnée ici.</Text></View>
                </Pressable>
                <View style={styles.reviewRows}><ReviewRow label="Document" value={selected.label} /><ReviewRow label="Méthode" value={method === 'camera' ? 'Photo' : method === 'import' ? 'Import' : 'Localisé manuellement'} /><ReviewRow label="Lisibilité" value={readable === 'yes' ? 'Confirmée' : 'À revoir'} /></View>
              </View>
            ) : null}
            {step === 4 && selected ? (
              <View style={styles.wizardSuccess}>
                <View style={styles.wizardSuccessIcon}><Text style={styles.wizardSuccessIconText}>✓</Text></View>
                <Text style={styles.wizardSuccessTitle}>{readable === 'yes' ? 'Le document est marqué comme localisé.' : 'Le document est marqué “à vérifier”.'}</Text>
                <Text style={styles.wizardSuccessText}>La future version conservera le fichier chiffré, sa date et ses règles de suppression. Cette maquette ne stocke qu’un statut.</Text>
                <PrimaryButton label="Retour à mes documents" onPress={onClose} />
              </View>
            ) : null}
          </ScrollView>
          {step < 4 ? (
            <View style={styles.modalFooter}>
              {step > 0 ? <SecondaryButton label="Retour" onPress={() => onStep(step - 1)} compact /> : null}
              <View style={styles.flex}><PrimaryButton label={step === 3 ? 'Classer le document' : 'Continuer'} icon="→" onPress={step === 3 ? onSave : () => onStep(step + 1)} disabled={!canContinue} compact /></View>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.reviewRow}><Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{value}</Text></View>;
}

export function ProfileScreen({
  snapshot,
  onProfileChange,
  onReset,
}: {
  snapshot: AppSnapshot;
  onProfileChange: (profile: UserProfile) => void;
  onReset: () => void;
}) {
  const { desktop } = useResponsiveLayout();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(snapshot.profile);
  const [notifications, setNotifications] = useState({ deadlines: true, documents: true, inactivity: false });
  const housing = housingOptions.find((option) => option.id === snapshot.profile.housingStatus)?.label ?? 'Non renseigné';
  const study = studyStatusOptions.find((option) => option.id === snapshot.profile.studyStatus)?.label ?? 'Non renseigné';

  const saveProfile = () => {
    onProfileChange(draft);
    setEditing(false);
  };

  return (
    <ScreenShell contentStyle={styles.tabPage} maxWidth={1050}>
      <View style={[styles.profileHero, desktop && styles.profileHeroDesktop]}>
        <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{(snapshot.profile.firstName || 'T').slice(0, 1).toUpperCase()}</Text></View>
        <View style={styles.flex}><Text style={styles.profileName}>{snapshot.profile.firstName || 'Profil démo'}</Text><Text style={styles.profileMeta}>{snapshot.profile.age || '—'} ans · {snapshot.profile.city || 'Ville non renseignée'} · {study}</Text></View>
        <SecondaryButton label="Modifier mon profil" onPress={() => { setDraft(snapshot.profile); setEditing(true); }} compact />
      </View>

      <View style={[styles.profileColumns, desktop && styles.profileColumnsDesktop]}>
        <View style={styles.profileMainColumn}>
          <SectionTitle title="Ma situation" />
          <View style={styles.settingsCard}>
            <ProfileRow label="Statut" value={study} />
            <ProfileRow label="Logement" value={housing} />
            <ProfileRow label="Priorités" value={`${snapshot.profile.needs.length} sujet(s)`} />
            <ProfileRow label="Compte" value={snapshot.demoSignedIn ? 'Connexion maquettée' : 'Mode local'} />
          </View>

          <SectionTitle title="Rappels" subtitle="Seulement des informations utiles, jamais de streak ou de récompense artificielle." />
          <View style={styles.settingsCard}>
            <ToggleRow label="Échéances de démarches" text="Date limite ou réponse attendue" value={notifications.deadlines} onChange={(value) => setNotifications((current) => ({ ...current, deadlines: value }))} />
            <ToggleRow label="Documents à renouveler" text="Attestation ou justificatif à actualiser" value={notifications.documents} onChange={(value) => setNotifications((current) => ({ ...current, documents: value }))} />
            <ToggleRow label="Relance après inactivité" text="Désactivée par défaut" value={notifications.inactivity} onChange={(value) => setNotifications((current) => ({ ...current, inactivity: value }))} />
          </View>
        </View>

        <View style={styles.profileSideColumn}>
          <SectionTitle title="Compte et données" />
          <View style={styles.settingsCard}>
            <SettingAction title="Connecter mon compte" text="Lien magique, Apple ou Google seront branchés plus tard." action="Prévisualiser" onPress={() => Alert.alert('Connexion préparée', 'Le parcours de connexion visible à l’entrée sera relié au backend. Les réponses locales pourront alors être migrées vers le compte.')} />
            <SettingAction title="Exporter mes données" text="Profil, réponses et statuts de documents." action="Préparer" onPress={() => Alert.alert('Export préparé', 'La version réelle générera une archive lisible et téléchargeable.')} />
            <SettingAction title="Supprimer mon compte" text="Suppression définitive et révocation des sessions." action="Voir le parcours" danger onPress={() => Alert.alert('Parcours de suppression', 'La version connectée demandera une confirmation forte, affichera les données concernées et indiquera la date de suppression.')} />
          </View>
          <InfoCard title="Données de cette maquette" tone="blue">Le navigateur conserve uniquement le profil, les réponses et les statuts simulés. Aucun document réel n’est envoyé.</InfoCard>
          <SecondaryButton label="Réinitialiser toute la maquette" onPress={onReset} />
          <Text style={styles.versionText}>TutoVie 0.2 · Expo SDK 57 · interface mobile et desktop</Text>
        </View>
      </View>

      <ProfileEditor visible={editing} profile={draft} onChange={setDraft} onSave={saveProfile} onClose={() => setEditing(false)} />
    </ScreenShell>
  );
}

function ProfileEditor({ visible, profile, onChange, onSave, onClose }: { visible: boolean; profile: UserProfile; onChange: (profile: UserProfile) => void; onSave: () => void; onClose: () => void }) {
  const { desktop } = useResponsiveLayout();
  const toggleNeed = (need: NeedId) => onChange({ ...profile, needs: profile.needs.includes(need) ? profile.needs.filter((item) => item !== need) : [...profile.needs, need] });
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismiss} onPress={onClose} />
        <SafeAreaView style={[styles.modalCard, desktop && styles.profileEditorDesktop]} edges={['bottom']}>
          <View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>MON PROFIL</Text><Text style={styles.modalTitle}>Modifier ma situation</Text></View><Pressable onPress={onClose} style={styles.modalClose}><Text style={styles.modalCloseText}>×</Text></Pressable></View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.wizardStack}>
              <Field label="Prénom" value={profile.firstName} onChangeText={(firstName) => onChange({ ...profile, firstName })} />
              <View style={[styles.wizardChoiceRow, !desktop && styles.wizardChoiceColumn]}><View style={styles.flex}><Field label="Âge" value={profile.age} onChangeText={(age) => onChange({ ...profile, age: age.replace(/\D/g, '').slice(0, 2) })} keyboardType="numeric" suffix="ans" /></View><View style={styles.flex}><Field label="Ville d’études" value={profile.city} onChangeText={(city) => onChange({ ...profile, city })} /></View></View>
              <Text style={styles.wizardQuestion}>Situation de logement</Text>
              <View style={styles.wizardChoices}>{housingOptions.map((option) => <ChoiceCard key={option.id} compact selected={profile.housingStatus === option.id} title={option.label} caption={option.caption} onPress={() => onChange({ ...profile, housingStatus: option.id })} />)}</View>
              <Text style={styles.wizardQuestion}>Priorités</Text>
              <View style={styles.filterChips}>{needOptions.map((option) => <SelectChip key={option.id} selected={profile.needs.includes(option.id)} label={option.label} onPress={() => toggleNeed(option.id)} />)}</View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}><SecondaryButton label="Annuler" onPress={onClose} compact /><View style={styles.flex}><PrimaryButton label="Enregistrer" onPress={onSave} compact /></View></View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.profileRow}><Text style={styles.profileRowLabel}>{label}</Text><Text style={styles.profileRowValue}>{value}</Text></View>;
}

function ToggleRow({ label, text, value, onChange }: { label: string; text: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.toggleRow}>
      <View style={styles.flex}><Text style={styles.toggleTitle}>{label}</Text><Text style={styles.toggleText}>{text}</Text></View>
      <View style={[styles.toggle, value && styles.toggleActive]}><View style={[styles.toggleKnob, value && styles.toggleKnobActive]} /></View>
    </Pressable>
  );
}

function SettingAction({ title, text, action, onPress, danger = false }: { title: string; text: string; action: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.settingAction}>
      <View style={styles.flex}><Text style={[styles.toggleTitle, danger && styles.dangerText]}>{title}</Text><Text style={styles.toggleText}>{text}</Text></View>
      <Text style={[styles.settingActionText, danger && styles.dangerText]}>{action} →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
  tabPage: { minHeight: '100%', paddingTop: 18 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 26 },
  headerGreeting: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 },
  headerSub: { marginTop: 4, color: colors.muted, fontSize: 13.5, lineHeight: 19 },
  homeLayout: { gap: 22 },
  homeLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 26 },
  homeMain: { gap: 2 },
  homeMainDesktop: { flex: 1, minWidth: 0 },
  homeSide: { gap: 15 },
  homeSideDesktop: { width: 315 },
  nextJourney: { padding: 19, borderRadius: 27, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', gap: 16, shadowColor: '#251F29', shadowOpacity: 0.13, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  nextIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  nextIconText: { color: colors.ink, fontSize: 29, fontWeight: '900' },
  nextCopy: { flex: 1 },
  nextTitle: { marginTop: 12, color: '#FFFFFF', fontSize: 23, lineHeight: 27, fontWeight: '900' },
  nextDescription: { marginTop: 5, color: '#C9C2CE', fontSize: 13, lineHeight: 19 },
  nextMetaRow: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  nextMeta: { color: '#AFA7B4', fontSize: 10.5, fontWeight: '700' },
  nextArrow: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#302A35' },
  nextArrowText: { color: colors.lime, fontSize: 21, fontWeight: '900' },
  link: { color: colors.primary, fontSize: 12.5, fontWeight: '800' },
  journeyGrid: { gap: 11 },
  journeyGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  journeyCard: { minHeight: 210, padding: 17, borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  journeyCardDesktop: { flexGrow: 1, flexBasis: 285, minWidth: 260, maxWidth: 360 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  journeyCardTitle: { marginTop: 16, color: colors.ink, fontSize: 17, fontWeight: '900' },
  journeyCardText: { marginTop: 6, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  cardProgress: { marginTop: 14 },
  journeyCardMeta: { marginTop: 'auto', paddingTop: 13, color: colors.muted, fontSize: 10.5, fontWeight: '700' },
  quickGrid: { gap: 9 },
  quickGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  quickCard: { minHeight: 93, padding: 15, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 12, flexGrow: 1, flexBasis: 320 },
  quickIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  quickIconText: { color: colors.primaryDark, fontSize: 19, fontWeight: '900' },
  quickTitle: { color: colors.ink, fontSize: 14.5, fontWeight: '900' },
  quickText: { marginTop: 3, color: colors.muted, fontSize: 11.5, lineHeight: 16 },
  quickArrow: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  statusPanel: { padding: 19, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 12 },
  statusPanelTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginBottom: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  statusLabel: { color: colors.muted, fontSize: 12.5 },
  statusValue: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  statusProgress: { marginVertical: 2 },
  sideCard: { padding: 19, borderRadius: 24, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#DDD3FF' },
  sideEyebrow: { color: colors.primaryDark, fontSize: 9.5, fontWeight: '900', letterSpacing: 0.8 },
  sideTitle: { marginTop: 10, color: colors.ink, fontSize: 18, fontWeight: '900' },
  sideText: { marginTop: 5, color: colors.muted, fontSize: 12, lineHeight: 17 },
  tagList: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sideLink: { marginTop: 15, paddingVertical: 5 },
  sideLinkText: { color: colors.primary, fontSize: 12.5, fontWeight: '800' },
  sectionHero: { gap: 21, marginBottom: 25 },
  sectionHeroDesktop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 },
  completionCard: { width: 210, padding: 16, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 8 },
  completionValue: { color: colors.ink, fontSize: 27, fontWeight: '900' },
  completionLabel: { color: colors.muted, fontSize: 11.5 },
  filters: { gap: 13, marginBottom: 20 },
  filtersDesktop: { flexDirection: 'row', alignItems: 'center' },
  searchBox: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineStrong, minWidth: 250 },
  searchIcon: { color: colors.muted, fontSize: 18 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 14 },
  filterChips: { flexDirection: 'row', gap: 8 },
  roadmapGrid: { gap: 11 },
  roadmapGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  roadmapCard: { minHeight: 230, padding: 18, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  roadmapCardDesktop: { flexGrow: 1, flexBasis: 330, minWidth: 300, maxWidth: 370 },
  roadmapCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roadmapIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  roadmapIconText: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  roadmapTitle: { marginTop: 17, color: colors.ink, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  roadmapText: { marginTop: 7, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  roadmapFooter: { marginTop: 'auto', paddingTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  roadmapMeta: { color: colors.muted, fontSize: 10.5 },
  roadmapArrow: { color: colors.primary, fontSize: 11.5, fontWeight: '800' },
  assistantPage: { minHeight: '100%', gap: 23, paddingTop: 18 },
  assistantPageDesktop: { flexDirection: 'row', alignItems: 'stretch', gap: 34, paddingTop: 38, minHeight: 720 },
  assistantIntro: { gap: 18 },
  assistantIntroDesktop: { width: 370, justifyContent: 'center' },
  assistantExamples: { paddingTop: 5, gap: 3 },
  assistantExamplesTitle: { marginBottom: 7, color: colors.ink, fontSize: 13, fontWeight: '900' },
  exampleRow: { paddingVertical: 10, flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  exampleArrow: { color: colors.primary, fontWeight: '900' },
  exampleText: { flex: 1, color: colors.inkSoft, fontSize: 12.5, lineHeight: 18 },
  chatPanel: { flex: 1, minHeight: 620, borderRadius: 26, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  chatPanelDesktop: { minHeight: 650, shadowColor: '#2B2430', shadowOpacity: 0.07, shadowRadius: 23, shadowOffset: { width: 0, height: 14 } },
  chatHeader: { padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line },
  chatTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  chatStatus: { marginTop: 3, color: colors.success, fontSize: 10.5, fontWeight: '700' },
  chatMark: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  chatMarkText: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  chatScroll: { flex: 1 },
  chatMessages: { padding: 17, gap: 12 },
  message: { maxWidth: '86%', alignSelf: 'flex-start', padding: 14, borderRadius: 18, borderBottomLeftRadius: 5, backgroundColor: colors.surfaceAlt },
  messageUser: { alignSelf: 'flex-end', borderBottomLeftRadius: 18, borderBottomRightRadius: 5, backgroundColor: colors.primary },
  messageText: { color: colors.inkSoft, fontSize: 13.5, lineHeight: 20 },
  messageTextUser: { color: '#FFFFFF' },
  messageAction: { marginTop: 12 },
  mobileSuggestions: { gap: 8 },
  mobileSuggestion: { padding: 12, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  mobileSuggestionText: { color: colors.inkSoft, fontSize: 12.5, lineHeight: 18 },
  composer: { margin: 13, minHeight: 57, paddingLeft: 14, paddingRight: 7, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 19, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.line },
  composerInput: { flex: 1, minHeight: 45, maxHeight: 100, color: colors.ink, fontSize: 14 },
  sendButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  sendButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  assistantDisclaimer: { paddingHorizontal: 17, paddingBottom: 12, color: colors.muted, fontSize: 9.5, textAlign: 'center' },
  documentSummary: { width: 235, padding: 17, borderRadius: 23, backgroundColor: colors.ink, gap: 10 },
  documentSummaryValue: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  documentSummaryLabel: { color: '#BBB3C0', fontSize: 11.5 },
  documentGrid: { gap: 11 },
  documentGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  documentCard: { minHeight: 235, padding: 18, borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  documentCardDesktop: { flexGrow: 1, flexBasis: 300, minWidth: 275, maxWidth: 350 },
  documentCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  documentIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  documentIconReady: { backgroundColor: colors.successSoft },
  documentIconReview: { backgroundColor: colors.warningSoft },
  documentIconText: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  documentTitle: { marginTop: 17, color: colors.ink, fontSize: 17, fontWeight: '900' },
  documentCategory: { marginTop: 3, color: colors.primary, fontSize: 10.5, fontWeight: '800' },
  documentText: { marginTop: 9, color: colors.muted, fontSize: 12.5, lineHeight: 18 },
  documentOpen: { marginTop: 'auto', paddingTop: 14, color: colors.primary, fontSize: 11.5, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(24,19,29,0.52)', alignItems: 'center', justifyContent: 'flex-end' },
  modalDismiss: { ...StyleSheet.absoluteFillObject },
  modalCard: { width: '100%', maxHeight: '92%', padding: 18, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.canvas },
  modalCardDesktop: { width: 760, maxHeight: '88%', marginBottom: 30, borderRadius: 30 },
  profileEditorDesktop: { width: 790, maxHeight: '90%', marginBottom: 25, borderRadius: 30 },
  modalHeader: { paddingBottom: 13, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  modalEyebrow: { color: colors.primary, fontSize: 9.5, fontWeight: '900', letterSpacing: 0.8 },
  modalTitle: { marginTop: 5, color: colors.ink, fontSize: 23, lineHeight: 28, fontWeight: '900' },
  modalClose: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  modalCloseText: { color: colors.ink, fontSize: 25, lineHeight: 27 },
  modalContent: { paddingVertical: 18 },
  wizardChoices: { gap: 9 },
  wizardStack: { gap: 16 },
  previewMock: { minHeight: 210, alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 23, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.lineStrong, backgroundColor: colors.surface },
  previewMockIcon: { color: colors.primary, fontSize: 41, fontWeight: '900' },
  previewMockTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  previewMockText: { color: colors.muted, fontSize: 12 },
  wizardQuestion: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  wizardChoiceRow: { flexDirection: 'row', gap: 10 },
  wizardChoiceColumn: { flexDirection: 'column' },
  confirmBox: { padding: 15, borderRadius: 19, borderWidth: 1.5, borderColor: colors.lineStrong, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  confirmBoxSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  confirmCheck: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  confirmCheckSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  confirmCheckText: { color: '#FFFFFF', fontWeight: '900' },
  confirmTitle: { color: colors.ink, fontSize: 13.5, fontWeight: '900' },
  confirmText: { marginTop: 4, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  reviewRows: { borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15 },
  reviewRow: { paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  reviewLabel: { color: colors.muted, fontSize: 12 },
  reviewValue: { color: colors.ink, fontSize: 12.5, fontWeight: '800', textAlign: 'right' },
  wizardSuccess: { minHeight: 410, alignItems: 'center', justifyContent: 'center', gap: 13 },
  wizardSuccessIcon: { width: 78, height: 78, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successSoft },
  wizardSuccessIconText: { color: colors.success, fontSize: 38, fontWeight: '900' },
  wizardSuccessTitle: { maxWidth: 480, color: colors.ink, fontSize: 23, lineHeight: 29, fontWeight: '900', textAlign: 'center' },
  wizardSuccessText: { maxWidth: 480, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  modalFooter: { paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileHero: { gap: 12, alignItems: 'center', marginBottom: 20 },
  profileHeroDesktop: { flexDirection: 'row' },
  profileAvatar: { width: 66, height: 66, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
  profileAvatarText: { color: colors.ink, fontSize: 29, fontWeight: '900' },
  profileName: { color: colors.ink, fontSize: 25, fontWeight: '900', textAlign: 'center' },
  profileMeta: { marginTop: 4, color: colors.muted, fontSize: 12.5, textAlign: 'center' },
  profileColumns: { gap: 20 },
  profileColumnsDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 26 },
  profileMainColumn: { flex: 1 },
  profileSideColumn: { width: 345, gap: 14 },
  settingsCard: { borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 17 },
  profileRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  profileRowLabel: { color: colors.ink, fontSize: 13.5, fontWeight: '800' },
  profileRowValue: { color: colors.muted, fontSize: 12.5, textAlign: 'right' },
  toggleRow: { minHeight: 70, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  toggleTitle: { color: colors.ink, fontSize: 13.5, fontWeight: '800' },
  toggleText: { marginTop: 3, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  toggle: { width: 45, height: 27, borderRadius: 14, padding: 3, backgroundColor: colors.lineStrong },
  toggleActive: { backgroundColor: colors.primary },
  toggleKnob: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#FFFFFF' },
  toggleKnobActive: { marginLeft: 18 },
  settingAction: { minHeight: 76, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  settingActionText: { color: colors.primary, fontSize: 11.5, fontWeight: '800' },
  dangerText: { color: colors.danger },
  versionText: { color: colors.muted, fontSize: 10.5, lineHeight: 16, textAlign: 'center' },
});
