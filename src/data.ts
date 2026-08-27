import type {
  AppTab,
  ChoiceOption,
  DocumentDefinition,
  HousingStatus,
  NeedId,
  StudyStatus,
} from './types';

export const colors = {
  ink: '#19141F',
  inkSoft: '#423A49',
  muted: '#746D7B',
  primary: '#6847F5',
  primaryDark: '#4B31CD',
  primarySoft: '#EEE9FF',
  lime: '#CFF56B',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F0F6',
  canvas: '#F8F6FC',
  line: '#E8E2ED',
  lineStrong: '#D8D0DF',
  success: '#237A52',
  successSoft: '#E5F7EE',
  warning: '#9A5A00',
  warningSoft: '#FFF0D5',
  danger: '#B43C4A',
  dangerSoft: '#FFE7EA',
  skySoft: '#E8F6FF',
  yellowSoft: '#FFF8D8',
} as const;

export const housingOptions: (ChoiceOption & { id: HousingStatus })[] = [
  { id: 'parents', label: 'Chez mes parents', caption: 'Je prépare mon départ', emoji: '⌂' },
  { id: 'searching', label: 'Je cherche un logement', caption: 'Premier appartement, studio ou colocation', emoji: '⌕' },
  { id: 'tenant', label: 'Déjà en location', caption: 'Je veux mettre mes démarches au clair', emoji: '⌑' },
  { id: 'residence', label: 'En résidence', caption: 'Crous, foyer ou résidence privée', emoji: '▦' },
];

export const studyStatusOptions: (ChoiceOption & { id: StudyStatus })[] = [
  { id: 'student', label: 'Étudiant·e', caption: 'Université, école, BTS, prépa…' },
  { id: 'apprentice', label: 'Alternant·e', caption: 'Contrat d’apprentissage ou de professionnalisation' },
  { id: 'internship', label: 'En stage', caption: 'Stage long ou court' },
  { id: 'international', label: 'Étudiant·e international·e', caption: 'Je viens étudier en France' },
  { id: 'other', label: 'Autre situation', caption: 'Je préciserai plus tard' },
];

export const needOptions: (ChoiceOption & { id: NeedId })[] = [
  { id: 'housing', label: 'Trouver et prendre mon logement', caption: 'Budget, recherche, dossier, garant, bail et installation', emoji: '⌂' },
  { id: 'benefits', label: 'Vérifier mes aides', caption: 'Identifier les organismes et préparer mes demandes', emoji: '€' },
  { id: 'documents', label: 'Organiser mes papiers', caption: 'Savoir quoi garder, où le trouver et quand le renouveler', emoji: '▤' },
  { id: 'health', label: 'Gérer ma santé administrative', caption: 'Ameli, carte Vitale, RIB, mutuelle et contacts', emoji: '✚' },
  { id: 'tax', label: 'Comprendre ma première déclaration', caption: 'Rattachement, documents et calendrier', emoji: '§' },
  { id: 'moving', label: 'Préparer mon déménagement', caption: 'Faire les démarches dans le bon ordre', emoji: '□' },
  { id: 'problem', label: 'Résoudre un problème précis', caption: 'Trouver le bon interlocuteur et préparer le contact', emoji: '?' },
];

export const documents: DocumentDefinition[] = [
  {
    id: 'identity',
    label: "Pièce d’identité",
    category: 'Identité',
    description: 'Carte nationale d’identité, passeport ou titre accepté selon la démarche.',
    examples: ['Carte d’identité recto-verso', 'Passeport', 'Titre de séjour selon la situation'],
    why: 'Demandée pour de nombreuses démarches et pour un dossier locatif.',
    renewal: 'Vérifier la date de validité avant un dossier important.',
  },
  {
    id: 'school',
    label: 'Certificat de scolarité',
    category: 'Études',
    description: 'Document délivré par ton établissement pour l’année universitaire en cours.',
    examples: ['PDF depuis l’ENT', 'Document remis à l’inscription'],
    why: 'Justifie ton statut étudiant auprès de bailleurs et organismes.',
    renewal: 'À remplacer à chaque nouvelle année universitaire.',
  },
  {
    id: 'rib',
    label: 'RIB à ton nom',
    category: 'Banque',
    description: 'Relevé d’identité bancaire du compte sur lequel tu veux recevoir les versements.',
    examples: ['PDF téléchargé depuis ta banque', 'RIB imprimé'],
    why: 'Souvent nécessaire pour la CAF, l’Assurance Maladie et les remboursements.',
  },
  {
    id: 'tax',
    label: "Avis d’imposition",
    category: 'Impôts',
    description: 'Ton avis ou celui du foyer fiscal, selon ta situation et la démarche.',
    examples: ['Avis d’impôt sur le revenu', 'Avis de situation déclarative'],
    why: 'Peut être demandé pour un logement, une aide ou une tarification.',
    renewal: 'À actualiser lors de la mise à disposition du nouvel avis.',
  },
  {
    id: 'lease',
    label: 'Bail signé',
    category: 'Logement',
    description: 'Contrat de location signé et annexes associées.',
    examples: ['Bail complet', 'Annexes et diagnostics', 'État des lieux'],
    why: 'Sert pour les démarches liées au logement et pour retrouver tes obligations.',
  },
  {
    id: 'insurance',
    label: 'Attestation d’assurance habitation',
    category: 'Logement',
    description: 'Attestation couvrant le logement loué.',
    examples: ['Attestation annuelle PDF', 'Attestation provisoire avant les clés'],
    why: 'Le bailleur peut la demander lors de la remise des clés et ensuite chaque année.',
    renewal: 'À remplacer à chaque renouvellement du contrat.',
  },
  {
    id: 'ameli',
    label: 'Attestation de droits Ameli',
    category: 'Santé',
    description: 'Document récapitulant tes droits à l’Assurance Maladie.',
    examples: ['Attestation téléchargée depuis ameli'],
    why: 'Utile pour certaines inscriptions, mutuelles et démarches de santé.',
  },
];

export const assistantSuggestions = [
  "J’ai trouvé un appartement, qu’est-ce que je fais maintenant ?",
  "Je ne comprends pas le courrier que j’ai reçu.",
  "Je n’ai pas de garant, quelles étapes suivre ?",
  "Je suis bloqué avec la CAF, qui contacter ?",
];

export const navItems: { id: AppTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '⌂' },
  { id: 'roadmap', label: 'Mes démarches', icon: '→' },
  { id: 'assistant', label: 'Être orienté', icon: '?' },
  { id: 'vault', label: 'Mes documents', icon: '▤' },
  { id: 'profile', label: 'Mon profil', icon: '○' },
];
