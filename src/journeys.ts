import type {
  AnswerValue,
  JourneyDefinition,
  JourneyId,
  JourneyResult,
  JourneyStep,
} from './types';

const checkedAt = '27 août 2026';

const source = (label: string, url: string) => ({ label, url, checkedAt });

const identityOptions = [
  { id: 'ready', label: 'Oui, il est prêt' },
  { id: 'expired', label: 'Je l’ai mais il est expiré ou à renouveler' },
  { id: 'missing', label: 'Je ne l’ai pas encore' },
  { id: 'unknown', label: 'Je ne sais pas où il est' },
];

const yesNoUnknown = [
  { id: 'yes', label: 'Oui' },
  { id: 'no', label: 'Non' },
  { id: 'unknown', label: 'Je ne sais pas' },
];

const steps = (...items: JourneyStep[]) => items;

export const journeys: JourneyDefinition[] = [
  {
    id: 'budget-logement',
    title: 'Calculer mon vrai budget logement',
    shortTitle: 'Budget logement',
    description: 'Additionne ce qui entre, ce qui sort et tous les coûts du logement pour obtenir un plafond réaliste.',
    category: 'Logement',
    icon: '€',
    duration: '8 à 12 min',
    timing: 'Avant de commencer les recherches',
    color: '#D8CBFF',
    source: source('ANIL — information logement', 'https://www.anil.org/'),
    steps: steps(
      {
        id: 'resources',
        eyebrow: '1 · CE QUI ENTRE',
        title: 'Combien as-tu réellement chaque mois ?',
        description: 'Indique seulement les revenus réguliers. Tu peux laisser un montant à zéro ou choisir « je ne sais pas ».',
        helpTitle: 'Où trouver ces montants ?',
        helpText: 'Regarde tes trois derniers relevés bancaires, ton avis de bourse, ta fiche de paie et les virements réguliers de ta famille.',
        fields: [
          { key: 'scholarship', label: 'Bourse mensuelle', kind: 'money', placeholder: '0', suffix: '€/mois', helper: 'Moyenne sur les mois où elle est versée.', allowUnknown: true },
          { key: 'salary', label: 'Salaire ou gratification', kind: 'money', placeholder: '0', suffix: '€/mois', allowUnknown: true },
          { key: 'familyHelp', label: 'Aide régulière de la famille', kind: 'money', placeholder: '0', suffix: '€/mois', allowUnknown: true },
          { key: 'otherIncome', label: 'Autres revenus réguliers', kind: 'money', placeholder: '0', suffix: '€/mois', allowUnknown: true },
          { key: 'housingAidEstimate', label: 'Aide au logement estimée', kind: 'money', placeholder: '0', suffix: '€/mois', helper: 'Ne mets rien si tu n’as pas encore fait de simulation officielle.', allowUnknown: true },
        ],
      },
      {
        id: 'life-costs',
        eyebrow: '2 · TA VIE COURANTE',
        title: 'Ce que tu dois garder pour vivre',
        description: 'On sépare les dépenses hors logement pour éviter de consacrer tout ton budget au loyer.',
        helpTitle: 'Tu ne connais pas encore tes dépenses ?',
        helpText: 'Entre une estimation prudente. Le récapitulatif signalera les montants inconnus pour que tu les vérifies plus tard.',
        fields: [
          { key: 'food', label: 'Courses et repas', kind: 'money', placeholder: '250', suffix: '€/mois', allowUnknown: true },
          { key: 'transport', label: 'Transport', kind: 'money', placeholder: '35', suffix: '€/mois', allowUnknown: true },
          { key: 'phone', label: 'Téléphone', kind: 'money', placeholder: '15', suffix: '€/mois', allowUnknown: true },
          { key: 'subscriptions', label: 'Abonnements et loisirs fixes', kind: 'money', placeholder: '30', suffix: '€/mois', allowUnknown: true },
          { key: 'otherFixed', label: 'Autres dépenses fixes', kind: 'money', placeholder: '0', suffix: '€/mois', allowUnknown: true },
          { key: 'safetyMargin', label: 'Marge pour les imprévus', kind: 'money', placeholder: '100', suffix: '€/mois', helper: 'Cette marge reste disponible, elle n’est pas dépensée d’avance.', allowUnknown: true },
        ],
      },
      {
        id: 'housing-costs',
        eyebrow: '3 · LE LOGEMENT',
        title: 'Quel logement envisages-tu ?',
        description: 'Le coût réel ne se limite pas au loyer affiché.',
        fields: [
          { key: 'targetRent', label: 'Loyer envisagé', kind: 'money', placeholder: '550', suffix: '€/mois', required: true, allowUnknown: true },
          { key: 'charges', label: 'Charges non comprises', kind: 'money', placeholder: '40', suffix: '€/mois', allowUnknown: true },
          { key: 'energy', label: 'Énergie et eau', kind: 'money', placeholder: '55', suffix: '€/mois', allowUnknown: true },
          { key: 'internet', label: 'Internet', kind: 'money', placeholder: '25', suffix: '€/mois', allowUnknown: true },
          { key: 'insurance', label: 'Assurance habitation', kind: 'money', placeholder: '12', suffix: '€/mois', allowUnknown: true },
          { key: 'moveInCash', label: 'Somme disponible pour l’installation', kind: 'money', placeholder: '1200', suffix: '€', helper: 'Dépôt, premier loyer, transport, petits équipements…', allowUnknown: true },
        ],
      },
    ),
  },
  {
    id: 'recherche-logement',
    title: 'Organiser ma recherche de logement',
    shortTitle: 'Recherche logement',
    description: 'Transforme tes contraintes en critères clairs, prépare tes canaux de recherche et une routine de candidature.',
    category: 'Logement',
    icon: '⌕',
    duration: '7 à 10 min',
    timing: 'Avant les premières candidatures',
    color: '#CFEAFF',
    source: source('Étudiant.gouv — Mon logement étudiant', 'https://www.etudiant.gouv.fr/fr/mon-logement-etudiant-vous-aide-trouver-un-logement-3378'),
    steps: steps(
      {
        id: 'search-area',
        eyebrow: '1 · TA ZONE',
        title: 'Où peux-tu vraiment habiter ?',
        description: 'On part du trajet acceptable, pas seulement du nom de la ville.',
        fields: [
          { key: 'studyPlace', label: 'Adresse ou quartier des études', kind: 'text', placeholder: 'Campus, école, hôpital…', required: true, allowUnknown: true },
          { key: 'moveDate', label: 'Date souhaitée d’entrée', kind: 'date', placeholder: 'JJ/MM/AAAA', allowUnknown: true },
          { key: 'maxCommute', label: 'Temps de trajet maximum', kind: 'choice', required: true, options: [
            { id: '20', label: '20 min' }, { id: '35', label: '35 min' }, { id: '50', label: '50 min' }, { id: 'flexible', label: 'Flexible' },
          ] },
          { key: 'transportModes', label: 'Transports possibles', kind: 'multi', options: [
            { id: 'walk', label: 'À pied' }, { id: 'bike', label: 'Vélo' }, { id: 'public', label: 'Transports en commun' }, { id: 'car', label: 'Voiture' },
          ] },
        ],
      },
      {
        id: 'search-brief',
        eyebrow: '2 · TES CRITÈRES',
        title: 'Quel logement te convient ?',
        description: 'Distingue ce qui est indispensable de ce qui est simplement agréable.',
        fields: [
          { key: 'maxHousingBudget', label: 'Budget mensuel logement maximum', kind: 'money', placeholder: '600', suffix: '€/mois', required: true, allowUnknown: true },
          { key: 'housingTypes', label: 'Formats acceptés', kind: 'multi', required: true, options: [
            { id: 'studio', label: 'Studio' }, { id: 'coloc', label: 'Colocation' }, { id: 'residence', label: 'Résidence étudiante' }, { id: 'room', label: 'Chambre chez l’habitant' },
          ] },
          { key: 'mustHaves', label: 'Indispensables', kind: 'multi', options: [
            { id: 'furnished', label: 'Meublé' }, { id: 'accessible', label: 'Accessible PMR' }, { id: 'laundry', label: 'Lave-linge ou laverie' }, { id: 'quiet', label: 'Environnement calme' }, { id: 'internet', label: 'Internet disponible' },
          ] },
          { key: 'dealBreakers', label: 'Refus absolus', kind: 'longText', placeholder: 'Ex. rez-de-chaussée, loin des transports…', allowUnknown: true },
        ],
      },
      {
        id: 'search-plan',
        eyebrow: '3 · TON PLAN',
        title: 'Comment vas-tu candidater ?',
        description: 'Une recherche efficace repose sur des alertes, un dossier prêt et des créneaux de réponse.',
        fields: [
          { key: 'channels', label: 'Canaux à utiliser', kind: 'checklist', required: true, options: [
            { id: 'student', label: 'Plateformes étudiantes et établissements' },
            { id: 'crous', label: 'Crous et résidences' },
            { id: 'private', label: 'Annonces privées' },
            { id: 'network', label: 'Réseau personnel et groupes locaux' },
          ] },
          { key: 'dailySlot', label: 'Créneau quotidien de recherche', kind: 'choice', options: [
            { id: 'morning', label: 'Le matin' }, { id: 'lunch', label: 'Le midi' }, { id: 'evening', label: 'Le soir' }, { id: 'twice', label: 'Deux fois par jour' },
          ], required: true },
          { key: 'applicationReady', label: 'Ton dossier est-il prêt à être envoyé ?', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'dossier-locatif',
    title: 'Préparer mon dossier locatif',
    shortTitle: 'Dossier locatif',
    description: 'Passe en revue les justificatifs utiles, identifie ce qui manque et prépare un dossier propre.',
    category: 'Documents',
    icon: '▤',
    duration: '10 à 15 min',
    timing: 'Avant de répondre aux annonces',
    color: '#FFE1D4',
    source: source('DossierFacile — service public', 'https://www.dossierfacile.logement.gouv.fr/'),
    secondarySource: source('Service-Public — justificatifs autorisés', 'https://www.service-public.fr/particuliers/vosdroits/F1169'),
    steps: steps(
      {
        id: 'tenant-docs',
        eyebrow: '1 · TON IDENTITÉ',
        title: 'Les documents de base',
        description: 'Le dossier doit correspondre à la personne qui signera le bail.',
        fields: [
          { key: 'identityStatus', label: 'Pièce d’identité', kind: 'choice', options: identityOptions, required: true },
          { key: 'currentAddressProof', label: 'Justificatif de domicile actuel', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'schoolCertificate', label: 'Certificat de scolarité de l’année en cours', kind: 'choice', options: yesNoUnknown, required: true },
        ],
        helpTitle: 'Ne partage pas plus que nécessaire',
        helpText: 'Le propriétaire ne peut demander que certaines catégories de pièces. DossierFacile aide à constituer et vérifier un dossier conforme.',
      },
      {
        id: 'resources-docs',
        eyebrow: '2 · TES RESSOURCES',
        title: 'Comment justifies-tu ta situation ?',
        description: 'Sélectionne ce que tu peux présenter. Le résultat préparera la liste manquante.',
        fields: [
          { key: 'resourceTypes', label: 'Ressources disponibles', kind: 'multi', options: [
            { id: 'scholarship', label: 'Notification de bourse' },
            { id: 'salary', label: 'Fiches de paie ou contrat' },
            { id: 'family', label: 'Prise en charge familiale' },
            { id: 'savings', label: 'Épargne, si utile et demandée' },
            { id: 'none', label: 'Aucune ressource personnelle' },
          ] },
          { key: 'taxNotice', label: 'Avis d’imposition adapté à ta situation', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'guaranteeProof', label: 'Justificatif de garant ou visa', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'share-ready',
        eyebrow: '3 · AVANT ENVOI',
        title: 'Ton dossier est-il partageable ?',
        description: 'On vérifie la lisibilité, le nommage et les réflexes de sécurité.',
        fields: [
          { key: 'fileQuality', label: 'Tous les documents sont lisibles', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'fileNames', label: 'Les fichiers portent des noms clairs', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'safeSharing', label: 'Tu utilises un lien contrôlé ou un dossier vérifié', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'paymentBeforeVisit', label: 'On t’a demandé de payer avant une visite ou un accord clair', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'garant-visale',
    title: 'Choisir mon garant et vérifier Visale',
    shortTitle: 'Garant et Visale',
    description: 'Clarifie ta situation, prépare les justificatifs et respecte l’ordre entre le visa et la signature du bail.',
    category: 'Logement',
    icon: '✓',
    duration: '7 à 10 min',
    timing: 'Avant la signature du bail',
    color: '#DFF3C0',
    source: source('Visale — site officiel', 'https://www.visale.fr/visale-pour-les-locataires/eligibilite/'),
    steps: steps(
      {
        id: 'eligibility-context',
        eyebrow: '1 · TA SITUATION',
        title: 'Peux-tu regarder Visale ?',
        description: 'TutoVie prépare la vérification, mais seule la plateforme Visale confirme ton éligibilité.',
        fields: [
          { key: 'visaleAge', label: 'Ton âge', kind: 'number', placeholder: '19', suffix: 'ans', required: true, allowUnknown: true },
          { key: 'visaleStatus', label: 'Ta situation', kind: 'choice', required: true, options: [
            { id: 'student', label: 'Étudiant·e' }, { id: 'apprentice', label: 'Alternant·e' }, { id: 'employee', label: 'Salarié·e' }, { id: 'other', label: 'Autre' },
          ] },
          { key: 'bailAlreadySigned', label: 'Le bail est-il déjà signé ?', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'guarantee-plan',
        eyebrow: '2 · TES OPTIONS',
        title: 'Quelle garantie peux-tu présenter ?',
        description: 'Tu peux préparer plusieurs solutions et laisser le bailleur vérifier ce qu’il accepte.',
        fields: [
          { key: 'guaranteeOptions', label: 'Solutions possibles', kind: 'multi', options: [
            { id: 'visale', label: 'Visale' }, { id: 'physical', label: 'Garant personne physique' }, { id: 'paid', label: 'Garantie privée payante' }, { id: 'none', label: 'Aucune solution pour l’instant' },
          ], required: true },
          { key: 'guarantorDocsReady', label: 'Les documents du garant sont prêts', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'targetLeaseDate', label: 'Date de signature envisagée', kind: 'date', placeholder: 'JJ/MM/AAAA', allowUnknown: true },
        ],
      },
      {
        id: 'visale-actions',
        eyebrow: '3 · ORDRE DES ACTIONS',
        title: 'Prépare la demande sans inverser les étapes',
        description: 'Le parcours final te donnera l’ordre exact à suivre et les points à confirmer.',
        fields: [
          { key: 'visaleAccount', label: 'Compte Visale créé', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'visaleDocuments', label: 'Justificatifs numériques disponibles', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'landlordInformed', label: 'Le bailleur sait quelle garantie tu proposes', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'verifier-annonce',
    title: 'Vérifier une annonce et éviter une arnaque',
    shortTitle: 'Vérifier une annonce',
    description: 'Passe en revue les signaux d’alerte avant d’envoyer des documents ou de l’argent.',
    category: 'Urgence',
    icon: '!',
    duration: '5 à 8 min',
    timing: 'Avant tout paiement ou envoi sensible',
    color: '#FFE3A8',
    source: source('Service-Public — devenir locataire', 'https://www.service-public.fr/particuliers/vosdroits/F34635'),
    steps: steps(
      {
        id: 'listing-context',
        eyebrow: '1 · L’ANNONCE',
        title: 'Qu’est-ce qui t’a attiré ou surpris ?',
        description: 'Aucun signal isolé ne prouve une fraude, mais leur accumulation doit ralentir la démarche.',
        fields: [
          { key: 'listingPrice', label: 'Loyer annoncé', kind: 'money', placeholder: '500', suffix: '€/mois', allowUnknown: true },
          { key: 'tooCheap', label: 'Le prix paraît nettement plus bas que les annonces similaires', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'listingCopied', label: 'Les photos ou le texte semblent copiés ou incohérents', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'addressKnown', label: 'L’adresse ou le quartier est identifiable', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'contact-behaviour',
        eyebrow: '2 · LE CONTACT',
        title: 'Comment la personne se comporte-t-elle ?',
        description: 'La pression, les excuses invérifiables et le refus d’échanger normalement sont des signaux importants.',
        fields: [
          { key: 'ownerAbroad', label: 'La personne dit être à l’étranger ou indisponible pour une visite', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'urgentPressure', label: 'Elle te pousse à décider immédiatement', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'refusesCall', label: 'Elle refuse un appel ou une visite vérifiable', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'oddContact', label: 'L’adresse e-mail, le numéro ou l’identité semblent incohérents', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'money-docs',
        eyebrow: '3 · ARGENT ET DOCUMENTS',
        title: 'Qu’est-ce qu’on te demande ?',
        description: 'C’est souvent ici que le risque devient concret.',
        fields: [
          { key: 'paymentBeforeVisit', label: 'Paiement avant visite, bail ou cadre clair', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'unusualPayment', label: 'Paiement par coupon, crypto, transfert inhabituel ou compte tiers', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'sensitiveDocs', label: 'Documents très sensibles demandés sans raison claire', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'alreadySent', label: 'As-tu déjà envoyé de l’argent ou des documents ?', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'comprendre-bail',
    title: 'Comprendre mon bail avant de signer',
    shortTitle: 'Comprendre le bail',
    description: 'Relève les informations importantes et prépare les questions à poser sans produire un avis juridique automatique.',
    category: 'Logement',
    icon: '§',
    duration: '10 à 15 min',
    timing: 'Avant la signature',
    color: '#E6DDFF',
    source: source('Service-Public — bail d’habitation', 'https://www.service-public.fr/particuliers/vosdroits/F920'),
    secondarySource: source('Service-Public — logement vide ou meublé', 'https://www.service-public.fr/particuliers/vosdroits/F1165'),
    steps: steps(
      {
        id: 'lease-type',
        eyebrow: '1 · LE CONTRAT',
        title: 'Quel type de bail lis-tu ?',
        description: 'Le type de logement influence la durée et certains documents.',
        fields: [
          { key: 'leaseType', label: 'Type indiqué', kind: 'choice', options: [
            { id: 'empty', label: 'Logement vide' }, { id: 'furnished', label: 'Meublé' }, { id: 'mobility', label: 'Bail mobilité' }, { id: 'unknown', label: 'Je ne sais pas' },
          ], required: true },
          { key: 'leaseDuration', label: 'Durée inscrite', kind: 'text', placeholder: 'Ex. 9 mois, 1 an…', allowUnknown: true },
          { key: 'startDate', label: 'Date de prise d’effet', kind: 'date', placeholder: 'JJ/MM/AAAA', allowUnknown: true },
          { key: 'partiesCorrect', label: 'Les noms et l’adresse du logement sont corrects', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'lease-money',
        eyebrow: '2 · LES MONTANTS',
        title: 'Reprends chaque somme séparément',
        description: 'Évite de retenir uniquement un total oral.',
        fields: [
          { key: 'leaseRent', label: 'Loyer hors charges', kind: 'money', placeholder: '550', suffix: '€/mois', allowUnknown: true },
          { key: 'leaseCharges', label: 'Charges', kind: 'money', placeholder: '50', suffix: '€/mois', allowUnknown: true },
          { key: 'deposit', label: 'Dépôt de garantie', kind: 'money', placeholder: '550', suffix: '€', allowUnknown: true },
          { key: 'agencyFees', label: 'Frais demandés', kind: 'money', placeholder: '0', suffix: '€', allowUnknown: true },
          { key: 'paymentDate', label: 'Date de paiement mensuelle', kind: 'text', placeholder: 'Ex. le 5 de chaque mois', allowUnknown: true },
        ],
      },
      {
        id: 'lease-annexes',
        eyebrow: '3 · LES ANNEXES',
        title: 'As-tu reçu ce qui accompagne le bail ?',
        description: 'Le récapitulatif transformera les réponses négatives en questions à poser.',
        fields: [
          { key: 'annexes', label: 'Éléments reçus ou prévus', kind: 'checklist', options: [
            { id: 'diagnostics', label: 'Diagnostics et informations réglementaires' },
            { id: 'inventory', label: 'État des lieux prévu' },
            { id: 'furniture', label: 'Inventaire du mobilier si meublé' },
            { id: 'rules', label: 'Règlement ou informations de copropriété utiles' },
            { id: 'insurance', label: 'Consigne concernant l’assurance habitation' },
          ] },
          { key: 'unclearClauses', label: 'Clauses ou mots que tu ne comprends pas', kind: 'longText', placeholder: 'Copie les passages à expliquer…', allowUnknown: true },
        ],
      },
    ),
  },
  {
    id: 'emmenagement',
    title: 'Préparer mon emménagement',
    shortTitle: 'Emménagement',
    description: 'Prépare la remise des clés, l’état des lieux, les compteurs et les premiers contrats.',
    category: 'Logement',
    icon: '→',
    duration: '8 à 12 min',
    timing: 'Une à deux semaines avant les clés',
    color: '#D9F0FF',
    source: source('Service-Public — état des lieux d’entrée', 'https://www.service-public.fr/particuliers/vosdroits/F31270'),
    secondarySource: source('Service-Public — assurance habitation', 'https://www.service-public.fr/particuliers/vosdroits/F1349'),
    steps: steps(
      {
        id: 'before-keys',
        eyebrow: '1 · AVANT LES CLÉS',
        title: 'Ce qui doit être prêt avant le jour J',
        description: 'Certaines démarches demandent un document ou un délai.',
        fields: [
          { key: 'moveInDate', label: 'Date de remise des clés', kind: 'date', placeholder: 'JJ/MM/AAAA', required: true, allowUnknown: true },
          { key: 'insuranceReady', label: 'Assurance habitation souscrite ou planifiée', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'electricityReady', label: 'Énergie activée ou rendez-vous prévu', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'internetReady', label: 'Internet vérifié ou commandé', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'inventory-day',
        eyebrow: '2 · ÉTAT DES LIEUX',
        title: 'Prépare une vérification pièce par pièce',
        description: 'La maquette te guidera sur place et conservera une checklist.',
        fields: [
          { key: 'inventoryTools', label: 'À prendre le jour de l’état des lieux', kind: 'checklist', options: [
            { id: 'phone', label: 'Téléphone chargé pour les photos' },
            { id: 'charger', label: 'Chargeur ou batterie externe' },
            { id: 'lease', label: 'Bail et inventaire annoncé' },
            { id: 'notes', label: 'De quoi noter les anomalies' },
            { id: 'light', label: 'Éclairage suffisant / visite de jour' },
          ] },
          { key: 'photoPlan', label: 'Tu prévois des photos détaillées et datées', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'metersPlan', label: 'Tu prévois de relever les compteurs', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'first-week',
        eyebrow: '3 · PREMIÈRE SEMAINE',
        title: 'Ce qui suit l’installation',
        description: 'On transforme les oublis classiques en liste de suivi.',
        fields: [
          { key: 'firstWeekItems', label: 'Démarches à programmer', kind: 'checklist', options: [
            { id: 'caf', label: 'Demande d’aide au logement' },
            { id: 'address', label: 'Changement d’adresse' },
            { id: 'mailbox', label: 'Nom sur la boîte aux lettres' },
            { id: 'bank', label: 'Adresse bancaire si nécessaire' },
            { id: 'school', label: 'Adresse auprès de l’établissement' },
            { id: 'repairs', label: 'Signalement écrit des anomalies' },
          ] },
          { key: 'landlordContact', label: 'Contact du bailleur ou gestionnaire enregistré', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'caf-logement',
    title: 'Préparer ma demande CAF logement',
    shortTitle: 'CAF logement',
    description: 'Réunis les informations avant d’ouvrir la demande officielle et prépare le suivi des messages.',
    category: 'Aides',
    icon: '€',
    duration: '8 à 12 min',
    timing: 'Après la signature du bail et l’entrée dans le logement',
    color: '#E0F3C7',
    source: source('CAF — aide au logement étudiant', 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/logement'),
    steps: steps(
      {
        id: 'caf-ready',
        eyebrow: '1 · AVANT LA DEMANDE',
        title: 'Ta situation permet-elle de commencer ?',
        description: 'La demande officielle s’appuie sur les informations exactes du logement et du bail.',
        fields: [
          { key: 'cafLeaseSigned', label: 'Bail signé', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'cafMoveInDate', label: 'Date d’entrée dans le logement', kind: 'date', placeholder: 'JJ/MM/AAAA', allowUnknown: true },
          { key: 'cafEmail', label: 'Adresse e-mail personnelle accessible', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'cafAccount', label: 'Compte CAF déjà existant', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'caf-docs',
        eyebrow: '2 · DOCUMENTS',
        title: 'Prépare ce que la demande peut te demander',
        description: 'Le résultat affichera une liste personnalisée à vérifier sur la CAF.',
        fields: [
          { key: 'cafRib', label: 'RIB à ton nom', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'cafLease', label: 'Bail accessible', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'landlordDetails', label: 'Coordonnées du bailleur ou de l’agence', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'rentDetails', label: 'Loyer et charges séparés', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'parentsCaf', label: 'Numéro de dossier CAF des parents si concerné', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'caf-situation',
        eyebrow: '3 · SITUATION',
        title: 'Évite les réponses approximatives',
        description: 'La CAF demandera des informations adaptées à ta situation réelle.',
        fields: [
          { key: 'cafHousehold', label: 'Tu habites', kind: 'choice', options: [
            { id: 'alone', label: 'Seul·e' }, { id: 'couple', label: 'En couple' }, { id: 'shared', label: 'En colocation' }, { id: 'unknown', label: 'Je ne sais pas comment déclarer' },
          ], required: true },
          { key: 'cafScholarship', label: 'Statut boursier connu', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'cafResourcesReady', label: 'Informations sur tes ressources disponibles', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'cafFollowUp', label: 'Tu sais où suivre les demandes complémentaires', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'radar-aides',
    title: 'Faire le point sur les aides',
    shortTitle: 'Radar des aides',
    description: 'Prépare une simulation officielle, repère les familles d’aides pertinentes et organise les demandes.',
    category: 'Aides',
    icon: '◎',
    duration: '10 à 15 min',
    timing: 'À chaque changement important',
    color: '#FFF0B7',
    source: source('Mes droits sociaux — simulateur officiel', 'https://www.mesdroitssociaux.gouv.fr/simulateurs'),
    steps: steps(
      {
        id: 'benefit-profile',
        eyebrow: '1 · TA SITUATION',
        title: 'Les éléments qui changent les aides',
        description: 'TutoVie ne calcule pas tes droits : il prépare les bonnes informations pour le simulateur officiel.',
        fields: [
          { key: 'benefitAge', label: 'Âge', kind: 'number', placeholder: '19', suffix: 'ans', required: true, allowUnknown: true },
          { key: 'benefitCity', label: 'Commune de résidence ou future commune', kind: 'text', placeholder: 'Lyon', required: true, allowUnknown: true },
          { key: 'benefitStatus', label: 'Situation principale', kind: 'choice', options: [
            { id: 'student', label: 'Étudiant·e' }, { id: 'apprentice', label: 'Alternant·e' }, { id: 'employee', label: 'Étudiant·e salarié·e' }, { id: 'international', label: 'Étudiant·e international·e' }, { id: 'other', label: 'Autre' },
          ], required: true },
          { key: 'benefitHousing', label: 'Situation de logement', kind: 'choice', options: [
            { id: 'parents', label: 'Chez les parents' }, { id: 'tenant', label: 'Locataire' }, { id: 'residence', label: 'Résidence étudiante' }, { id: 'hosted', label: 'Hébergé·e' }, { id: 'searching', label: 'En recherche' },
          ], required: true },
        ],
      },
      {
        id: 'benefit-needs',
        eyebrow: '2 · TES BESOINS',
        title: 'Sur quoi veux-tu être orienté ?',
        description: 'Les catégories choisies deviendront une checklist, pas une promesse d’éligibilité.',
        fields: [
          { key: 'benefitCategories', label: 'Domaines à vérifier', kind: 'multi', required: true, options: [
            { id: 'housing', label: 'Logement' }, { id: 'food', label: 'Alimentation' }, { id: 'transport', label: 'Transport' }, { id: 'health', label: 'Santé' }, { id: 'study', label: 'Études et équipement' }, { id: 'emergency', label: 'Aide d’urgence' },
          ] },
          { key: 'benefitIncome', label: 'Revenus mensuels approximatifs', kind: 'money', placeholder: '0', suffix: '€/mois', allowUnknown: true },
          { key: 'benefitScholarship', label: 'Boursier·e', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'benefitDisability', label: 'Situation de handicap ou besoin d’aménagement à prendre en compte', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'benefit-prep',
        eyebrow: '3 · PRÉPARATION',
        title: 'As-tu les informations pour simuler ?',
        description: 'Tu pourras ensuite revenir dans TutoVie avec les résultats officiels.',
        fields: [
          { key: 'benefitInfoReady', label: 'Informations à préparer', kind: 'checklist', options: [
            { id: 'income', label: 'Ressources et revenus' }, { id: 'family', label: 'Situation familiale' }, { id: 'housing', label: 'Adresse, loyer et logement' }, { id: 'tax', label: 'Situation fiscale' }, { id: 'school', label: 'Statut étudiant et bourse' },
          ] },
          { key: 'officialSimulationDone', label: 'Simulation officielle déjà réalisée', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'benefitNotes', label: 'Résultats ou questions à conserver', kind: 'longText', placeholder: 'Ex. aide au logement à vérifier, rendez-vous Crous…', allowUnknown: true },
        ],
      },
    ),
  },
  {
    id: 'papiers-essentiels',
    title: 'Rassembler mes papiers essentiels',
    shortTitle: 'Papiers essentiels',
    description: 'Fais l’inventaire, repère les documents absents et prépare un rangement simple.',
    category: 'Documents',
    icon: '▣',
    duration: '8 à 12 min',
    timing: 'Dès le début de ton autonomie',
    color: '#E8E2FF',
    source: source('Service-Public — démarches et outils', 'https://www.service-public.fr/'),
    steps: steps(
      {
        id: 'paper-inventory',
        eyebrow: '1 · INVENTAIRE',
        title: 'Qu’as-tu déjà ?',
        description: 'Coche seulement les documents que tu peux retrouver maintenant.',
        fields: [
          { key: 'essentialDocs', label: 'Documents disponibles', kind: 'checklist', options: [
            { id: 'identity', label: 'Pièce d’identité' }, { id: 'rib', label: 'RIB à mon nom' }, { id: 'school', label: 'Certificat de scolarité' }, { id: 'tax', label: 'Avis d’imposition pertinent' }, { id: 'address', label: 'Justificatif de domicile' }, { id: 'vitale', label: 'Carte Vitale / attestation' }, { id: 'insurance', label: 'Attestations d’assurance' }, { id: 'lease', label: 'Bail / logement' },
          ] },
          { key: 'identityCondition', label: 'État de la pièce d’identité', kind: 'choice', options: identityOptions, required: true },
        ],
      },
      {
        id: 'paper-location',
        eyebrow: '2 · RANGEMENT',
        title: 'Où sont stockés tes documents ?',
        description: 'L’objectif est de pouvoir retrouver une pièce en moins de deux minutes.',
        fields: [
          { key: 'storagePlaces', label: 'Emplacements utilisés', kind: 'multi', options: [
            { id: 'phone', label: 'Téléphone' }, { id: 'computer', label: 'Ordinateur' }, { id: 'cloud', label: 'Cloud personnel' }, { id: 'email', label: 'Boîte e-mail' }, { id: 'paper', label: 'Classeur papier' }, { id: 'parents', label: 'Chez mes parents' },
          ], required: true },
          { key: 'backupExists', label: 'Une copie existe ailleurs en cas de perte', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'fileNaming', label: 'Les fichiers ont des noms compréhensibles', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'paper-plan',
        eyebrow: '3 · TON SYSTÈME',
        title: 'Choisis une organisation simple',
        description: 'La maquette préparera les dossiers et rappels sans télécharger de vrais fichiers.',
        fields: [
          { key: 'folderPlan', label: 'Dossiers à créer', kind: 'checklist', options: [
            { id: 'identity', label: 'Identité' }, { id: 'housing', label: 'Logement' }, { id: 'health', label: 'Santé' }, { id: 'tax', label: 'Impôts' }, { id: 'study', label: 'Études' }, { id: 'bank', label: 'Banque et revenus' },
          ] },
          { key: 'expiryReminder', label: 'Souhaites-tu des rappels d’expiration ?', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'firstMissingDoc', label: 'Premier document à retrouver', kind: 'text', placeholder: 'Ex. mon avis d’imposition', allowUnknown: true },
        ],
      },
    ),
  },
  {
    id: 'sante',
    title: 'Mettre ma santé administrative au clair',
    shortTitle: 'Santé administrative',
    description: 'Vérifie ton compte ameli, ton RIB, ta carte Vitale, ton adresse et ta couverture complémentaire.',
    category: 'Santé',
    icon: '+',
    duration: '8 à 12 min',
    timing: 'À 18 ans et après chaque changement important',
    color: '#D7F2E6',
    source: source('Ameli — bons réflexes dès 18 ans', 'https://www.ameli.fr/assure/droits-demarches/principes/18-ans-adoptez-bons-reflexes-ameli'),
    steps: steps(
      {
        id: 'ameli-account',
        eyebrow: '1 · TON COMPTE',
        title: 'Peux-tu accéder à tes informations ?',
        description: 'Le compte ameli sert notamment à suivre les remboursements et mettre à jour certaines coordonnées.',
        fields: [
          { key: 'ameliAccount', label: 'Compte ameli accessible', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'securityNumber', label: 'Numéro de sécurité sociale retrouvé', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'vitaleCard', label: 'Carte Vitale disponible', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'ameli-details',
        eyebrow: '2 · TES COORDONNÉES',
        title: 'Les remboursements arrivent-ils au bon endroit ?',
        description: 'Le récapitulatif distinguera les informations sûres de celles à vérifier.',
        fields: [
          { key: 'ameliRib', label: 'RIB personnel enregistré', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'ameliAddress', label: 'Adresse actuelle enregistrée', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'vitaleUpdated', label: 'Carte Vitale mise à jour récemment', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'doctorDeclared', label: 'Médecin traitant déclaré', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'health-cover',
        eyebrow: '3 · TA COUVERTURE',
        title: 'Sais-tu qui rembourse quoi ?',
        description: 'On prépare les questions à poser, sans analyser ton contrat médicalement.',
        fields: [
          { key: 'mutualStatus', label: 'Couverture complémentaire', kind: 'choice', options: [
            { id: 'parents', label: 'Mutuelle des parents' }, { id: 'personal', label: 'Ma propre mutuelle' }, { id: 'solidarity', label: 'Complémentaire santé solidaire' }, { id: 'none', label: 'Aucune' }, { id: 'unknown', label: 'Je ne sais pas' },
          ], required: true },
          { key: 'mutualCard', label: 'Carte ou attestation de mutuelle disponible', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'healthQuestion', label: 'Question administrative à résoudre', kind: 'longText', placeholder: 'Ex. mes remboursements arrivent encore sur le compte de mes parents…', allowUnknown: true },
        ],
      },
    ),
  },
  {
    id: 'premiers-impots',
    title: 'Comprendre mes premiers impôts',
    shortTitle: 'Premiers impôts',
    description: 'Prépare la discussion sur le rattachement, retrouve les informations utiles et organise la première déclaration.',
    category: 'Impôts',
    icon: '%',
    duration: '10 à 15 min',
    timing: 'Avant la campagne de déclaration',
    color: '#FFE6C7',
    source: source('Service-Public — première déclaration', 'https://www.service-public.fr/particuliers/vosdroits/F369'),
    secondarySource: source('Service-Public — rattachement d’un enfant majeur', 'https://www.service-public.fr/particuliers/vosdroits/F3085'),
    steps: steps(
      {
        id: 'tax-situation',
        eyebrow: '1 · TA SITUATION FISCALE',
        title: 'Sais-tu comment tu es déclaré·e ?',
        description: 'TutoVie prépare les options à vérifier. Il ne choisit pas à la place de ton foyer.',
        fields: [
          { key: 'taxAge', label: 'Âge', kind: 'number', placeholder: '19', suffix: 'ans', required: true, allowUnknown: true },
          { key: 'taxStudent', label: 'Tu poursuis des études', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'taxAttached', label: 'Rattaché·e au foyer fiscal des parents', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'taxDiscussion', label: 'La situation a été discutée avec les parents concernés', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'tax-access',
        eyebrow: '2 · ACCÈS ET ADRESSE',
        title: 'Peux-tu faire la démarche le moment venu ?',
        description: 'Certaines premières déclarations demandent de retrouver des identifiants ou de suivre une procédure spécifique.',
        fields: [
          { key: 'taxNumber', label: 'Numéro fiscal connu', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'taxOnlineAccess', label: 'Accès à un espace impots.gouv.fr personnel', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'taxAddressJanuary', label: 'Adresse au 1er janvier connue', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'tax-income',
        eyebrow: '3 · REVENUS À CLASSER',
        title: 'Quels revenus as-tu perçus ?',
        description: 'Le résultat ne calculera pas l’impôt ; il préparera les justificatifs à retrouver et les questions à vérifier.',
        fields: [
          { key: 'incomeKinds', label: 'Types de revenus', kind: 'multi', options: [
            { id: 'none', label: 'Aucun revenu' }, { id: 'student-job', label: 'Job étudiant' }, { id: 'apprentice', label: 'Alternance' }, { id: 'internship', label: 'Stage' }, { id: 'freelance', label: 'Activité indépendante' }, { id: 'foreign', label: 'Revenus étrangers' }, { id: 'other', label: 'Autre' },
          ], required: true },
          { key: 'incomeDocs', label: 'Justificatifs annuels disponibles', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'taxQuestions', label: 'Points à demander ou vérifier', kind: 'longText', placeholder: 'Ex. alternance, rattachement, revenus à l’étranger…', allowUnknown: true },
        ],
      },
    ),
  },
  {
    id: 'demenagement',
    title: 'Planifier mon déménagement administratif',
    shortTitle: 'Déménagement',
    description: 'Construit une chronologie avant, pendant et après le changement d’adresse.',
    category: 'Documents',
    icon: '⇢',
    duration: '8 à 12 min',
    timing: 'De trois mois avant à un mois après',
    color: '#DDEBFF',
    source: source('Service-Public — changement d’adresse', 'https://www.service-public.fr/particuliers/vosdroits/R11193'),
    secondarySource: source('Service-Public — je déménage', 'https://www.service-public.fr/particuliers/vosdroits/F14128'),
    steps: steps(
      {
        id: 'move-context',
        eyebrow: '1 · LE CHANGEMENT',
        title: 'Quand et vers où déménages-tu ?',
        description: 'La date permet d’ordonner les contrats et les déclarations.',
        fields: [
          { key: 'movingDate', label: 'Date du déménagement', kind: 'date', placeholder: 'JJ/MM/AAAA', required: true, allowUnknown: true },
          { key: 'oldCity', label: 'Ville actuelle', kind: 'text', placeholder: 'Ville actuelle', allowUnknown: true },
          { key: 'newCity', label: 'Nouvelle ville', kind: 'text', placeholder: 'Nouvelle ville', required: true, allowUnknown: true },
          { key: 'movePermanent', label: 'Installation durable', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'move-contracts',
        eyebrow: '2 · CONTRATS',
        title: 'Quels services faut-il ouvrir ou fermer ?',
        description: 'Le récapitulatif séparera les résiliations, transferts et nouvelles souscriptions.',
        fields: [
          { key: 'movingContracts', label: 'Contrats concernés', kind: 'checklist', options: [
            { id: 'electricity', label: 'Électricité / gaz' }, { id: 'water', label: 'Eau' }, { id: 'internet', label: 'Internet' }, { id: 'insurance', label: 'Assurance habitation' }, { id: 'transport', label: 'Abonnement transport' }, { id: 'parking', label: 'Stationnement' },
          ] },
          { key: 'noticeSent', label: 'Préavis du logement actuel envoyé', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'movingCompany', label: 'Transport ou aide au déménagement organisé', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'move-addresses',
        eyebrow: '3 · ADRESSE',
        title: 'Qui doit connaître la nouvelle adresse ?',
        description: 'Certaines modifications peuvent être regroupées, d’autres doivent être faites dans chaque espace.',
        fields: [
          { key: 'addressTargets', label: 'Organismes à vérifier', kind: 'checklist', options: [
            { id: 'caf', label: 'CAF' }, { id: 'ameli', label: 'Assurance Maladie' }, { id: 'tax', label: 'Impôts' }, { id: 'bank', label: 'Banque' }, { id: 'school', label: 'Établissement' }, { id: 'employer', label: 'Employeur' }, { id: 'subscriptions', label: 'Abonnements et livraisons' }, { id: 'vehicle', label: 'Immatriculation si véhicule' },
          ] },
          { key: 'mailForward', label: 'Réexpédition du courrier nécessaire', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'foreignStudentMove', label: 'Titre de séjour ou situation internationale à mettre à jour', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'comprendre-courrier',
    title: 'Comprendre un courrier administratif',
    shortTitle: 'Comprendre un courrier',
    description: 'Identifie l’expéditeur, la demande, la date limite et les documents à préparer.',
    category: 'Documents',
    icon: '✉',
    duration: '5 à 8 min',
    timing: 'Dès réception du courrier',
    color: '#F0E5FF',
    source: source('Service-Public — annuaire de l’administration', 'https://lannuaire.service-public.fr/'),
    steps: steps(
      {
        id: 'letter-origin',
        eyebrow: '1 · L’EXPÉDITEUR',
        title: 'Qui t’écrit ?',
        description: 'Tu peux recopier ce que tu vois. Le scan et l’OCR seront branchés plus tard.',
        fields: [
          { key: 'letterSender', label: 'Nom de l’organisme', kind: 'text', placeholder: 'CAF, Crous, Ameli, bailleur…', required: true, allowUnknown: true },
          { key: 'letterChannel', label: 'Format reçu', kind: 'choice', options: [
            { id: 'paper', label: 'Courrier papier' }, { id: 'email', label: 'E-mail' }, { id: 'portal', label: 'Message dans un espace en ligne' }, { id: 'sms', label: 'SMS' },
          ], required: true },
          { key: 'letterAuthenticity', label: 'Tu as vérifié que le message est authentique', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
      {
        id: 'letter-request',
        eyebrow: '2 · CE QU’ON TE DEMANDE',
        title: 'Recopie l’action et la date',
        description: 'L’IA réelle extraira ces éléments, mais la maquette permet déjà de suivre le parcours complet.',
        fields: [
          { key: 'letterSubject', label: 'Objet ou titre', kind: 'text', placeholder: 'Ex. pièce manquante, paiement, rendez-vous…', allowUnknown: true },
          { key: 'letterRequest', label: 'Action demandée', kind: 'longText', placeholder: 'Recopie la phrase importante…', required: true, allowUnknown: true },
          { key: 'letterDeadline', label: 'Date limite', kind: 'date', placeholder: 'JJ/MM/AAAA', allowUnknown: true },
          { key: 'letterConsequence', label: 'Conséquence annoncée si tu ne réponds pas', kind: 'longText', placeholder: 'Ex. dossier suspendu…', allowUnknown: true },
        ],
      },
      {
        id: 'letter-response',
        eyebrow: '3 · RÉPONSE',
        title: 'Que faut-il préparer ?',
        description: 'Le résultat produira une checklist et un brouillon de contact factice.',
        fields: [
          { key: 'letterDocs', label: 'Documents mentionnés', kind: 'longText', placeholder: 'Ex. RIB, bail, certificat de scolarité…', allowUnknown: true },
          { key: 'letterReplyChannel', label: 'Canal de réponse indiqué', kind: 'choice', options: [
            { id: 'portal', label: 'Espace en ligne' }, { id: 'email', label: 'E-mail' }, { id: 'mail', label: 'Courrier postal' }, { id: 'appointment', label: 'Rendez-vous' }, { id: 'unknown', label: 'Je ne sais pas' },
          ], required: true },
          { key: 'letterNeedHelp', label: 'Tu veux préparer une question à poser', kind: 'choice', options: yesNoUnknown, required: true },
        ],
      },
    ),
  },
  {
    id: 'qui-contacter',
    title: 'Trouver qui contacter et préparer ma demande',
    shortTitle: 'Qui contacter ?',
    description: 'Décris ton problème, identifie le bon interlocuteur et prépare un appel, un message ou un rendez-vous.',
    category: 'Urgence',
    icon: '?',
    duration: '5 à 10 min',
    timing: 'Quand tu es bloqué·e',
    color: '#FFE3E7',
    source: source('Service-Public — annuaire de l’administration', 'https://lannuaire.service-public.fr/'),
    secondarySource: source('ANIL — trouver son ADIL', 'https://www.anil.org/lanil-et-les-adil/votre-adil/'),
    steps: steps(
      {
        id: 'problem-topic',
        eyebrow: '1 · LE SUJET',
        title: 'Quel est le problème principal ?',
        description: 'Choisis la catégorie la plus proche ; le résultat proposera plusieurs interlocuteurs à vérifier.',
        fields: [
          { key: 'problemCategory', label: 'Catégorie', kind: 'choice', options: [
            { id: 'housing', label: 'Logement / propriétaire' }, { id: 'caf', label: 'CAF / aide' }, { id: 'health', label: 'Santé / Ameli' }, { id: 'tax', label: 'Impôts' }, { id: 'school', label: 'Établissement / Crous' }, { id: 'identity', label: 'Identité / titre' }, { id: 'other', label: 'Autre' },
          ], required: true },
          { key: 'problemSummary', label: 'Résume en une phrase', kind: 'longText', placeholder: 'Ex. mon dossier CAF est bloqué depuis trois semaines…', required: true, allowUnknown: true },
          { key: 'problemUrgency', label: 'Niveau d’urgence', kind: 'choice', options: [
            { id: 'today', label: 'Aujourd’hui / risque immédiat' }, { id: 'week', label: 'Cette semaine' }, { id: 'normal', label: 'Pas urgent' }, { id: 'unknown', label: 'Je ne sais pas' },
          ], required: true },
        ],
      },
      {
        id: 'problem-history',
        eyebrow: '2 · CE QUI A DÉJÀ ÉTÉ FAIT',
        title: 'Évite de recommencer de zéro',
        description: 'Prépare les références et les contacts précédents.',
        fields: [
          { key: 'problemReference', label: 'Numéro de dossier ou référence', kind: 'text', placeholder: 'Facultatif', allowUnknown: true },
          { key: 'problemContacted', label: 'As-tu déjà contacté quelqu’un ?', kind: 'choice', options: yesNoUnknown, required: true },
          { key: 'problemHistory', label: 'Dates et réponses reçues', kind: 'longText', placeholder: 'Ex. message envoyé le 12/08, aucune réponse…', allowUnknown: true },
          { key: 'problemDocuments', label: 'Preuves ou documents disponibles', kind: 'longText', placeholder: 'Ex. capture, courrier, bail, accusé de réception…', allowUnknown: true },
        ],
      },
      {
        id: 'problem-contact-plan',
        eyebrow: '3 · LE CONTACT',
        title: 'Comment veux-tu agir ?',
        description: 'Les boutons seront factices, mais toute la préparation est utilisable.',
        fields: [
          { key: 'contactPreference', label: 'Canal préféré', kind: 'choice', options: [
            { id: 'phone', label: 'Téléphone' }, { id: 'message', label: 'Message en ligne' }, { id: 'email', label: 'E-mail' }, { id: 'appointment', label: 'Rendez-vous' }, { id: 'letter', label: 'Courrier recommandé' },
          ], required: true },
          { key: 'contactAvailability', label: 'Créneau disponible', kind: 'text', placeholder: 'Ex. mardi après 14 h', allowUnknown: true },
          { key: 'contactGoal', label: 'Résultat concret attendu', kind: 'longText', placeholder: 'Ex. connaître la pièce manquante et le délai de traitement…', required: true, allowUnknown: true },
        ],
      },
    ),
  },
];

export const journeyById = Object.fromEntries(journeys.map((journey) => [journey.id, journey])) as Record<JourneyId, JourneyDefinition>;

const toNumber = (answers: Record<string, AnswerValue>, key: string): number => {
  const value = answers[key];
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string' || value === 'unknown') return 0;
  const parsed = Number(value.replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (answers: Record<string, AnswerValue>, key: string): string => {
  const value = answers[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const toList = (answers: Record<string, AnswerValue>, key: string): string[] => {
  const value = answers[key];
  return Array.isArray(value) ? value : [];
};

const unknownKeys = (answers: Record<string, AnswerValue>) => Object.entries(answers)
  .filter(([, value]) => value === 'unknown')
  .map(([key]) => key);

const yesCount = (answers: Record<string, AnswerValue>, keys: string[]) => keys.filter((key) => answers[key] === 'yes').length;
const noCount = (answers: Record<string, AnswerValue>, keys: string[]) => keys.filter((key) => answers[key] === 'no').length;

export function buildJourneyResult(id: JourneyId, answers: Record<string, AnswerValue>): JourneyResult {
  const unknown = unknownKeys(answers).length;

  if (id === 'budget-logement') {
    const resources = ['scholarship', 'salary', 'familyHelp', 'otherIncome', 'housingAidEstimate'].reduce((sum, key) => sum + toNumber(answers, key), 0);
    const life = ['food', 'transport', 'phone', 'subscriptions', 'otherFixed', 'safetyMargin'].reduce((sum, key) => sum + toNumber(answers, key), 0);
    const housing = ['targetRent', 'charges', 'energy', 'internet', 'insurance'].reduce((sum, key) => sum + toNumber(answers, key), 0);
    const availableBeforeHousing = resources - life;
    const remaining = resources - life - housing;
    const moveInCash = toNumber(answers, 'moveInCash');
    return {
      title: remaining >= 0 ? 'Ton budget tient sur le papier' : 'Le logement envisagé dépasse ton budget saisi',
      summary: `Avec les montants connus, tu disposes de ${Math.round(availableBeforeHousing)} € par mois avant logement. Le logement envisagé revient à environ ${Math.round(housing)} € par mois.`,
      metrics: [
        { label: 'Ressources mensuelles', value: `${Math.round(resources)} €` },
        { label: 'Vie courante + marge', value: `${Math.round(life)} €` },
        { label: 'Coût mensuel logement', value: `${Math.round(housing)} €`, tone: housing <= availableBeforeHousing ? 'good' : 'danger' },
        { label: 'Reste après logement', value: `${Math.round(remaining)} €`, tone: remaining >= 100 ? 'good' : remaining >= 0 ? 'warning' : 'danger' },
        { label: 'Trésorerie d’installation', value: `${Math.round(moveInCash)} €`, tone: moveInCash > 0 ? 'neutral' : 'warning' },
      ],
      nextActions: [
        'Utilise le coût logement total, pas uniquement le loyer, comme critère de comparaison.',
        'Remplace chaque montant inconnu par une estimation vérifiée avant de candidater.',
        'Fais une simulation officielle des aides sans les considérer comme garanties avant confirmation.',
      ],
      watchOut: unknown ? [`${unknown} montant(s) restent inconnus : le résultat est provisoire.`] : undefined,
    };
  }

  if (id === 'recherche-logement') {
    const types = toList(answers, 'housingTypes').length;
    const channels = toList(answers, 'channels').length;
    return {
      title: 'Ton brief de recherche est prêt',
      summary: `Tu as défini ${types || 'plusieurs'} format(s) de logement et ${channels || 'plusieurs'} canal(aux) de recherche.`,
      metrics: [
        { label: 'Budget maximum', value: `${toNumber(answers, 'maxHousingBudget') || 'À préciser'} € / mois` },
        { label: 'Trajet maximum', value: `${toStringValue(answers, 'maxCommute') || 'À préciser'} min` },
        { label: 'Dossier prêt', value: answers.applicationReady === 'yes' ? 'Oui' : 'À préparer', tone: answers.applicationReady === 'yes' ? 'good' : 'warning' },
      ],
      nextActions: [
        'Crée les alertes avec exactement les mêmes critères sur chaque canal choisi.',
        'Bloque un créneau quotidien pour répondre rapidement aux annonces crédibles.',
        answers.applicationReady === 'yes' ? 'Prépare un message de candidature court et réutilisable.' : 'Termine le parcours « Dossier locatif » avant d’envoyer des candidatures.',
      ],
    };
  }

  if (id === 'dossier-locatif') {
    const readinessKeys = ['identityStatus', 'currentAddressProof', 'schoolCertificate', 'taxNotice', 'guaranteeProof', 'fileQuality', 'fileNames', 'safeSharing'];
    const ready = readinessKeys.filter((key) => answers[key] === 'yes' || answers[key] === 'ready').length;
    const riskyPayment = answers.paymentBeforeVisit === 'yes';
    return {
      title: riskyPayment ? 'Stoppe l’envoi et vérifie la demande' : ready >= 6 ? 'Ton dossier est presque prêt' : 'Il reste des pièces à préparer',
      summary: `${ready}/${readinessKeys.length} points de préparation sont confirmés dans la maquette.`,
      metrics: [
        { label: 'Points prêts', value: `${ready}/${readinessKeys.length}`, tone: ready >= 6 ? 'good' : 'warning' },
        { label: 'Garantie', value: answers.guaranteeProof === 'yes' ? 'Prête' : 'À vérifier', tone: answers.guaranteeProof === 'yes' ? 'good' : 'warning' },
        { label: 'Partage sécurisé', value: answers.safeSharing === 'yes' ? 'Prévu' : 'À améliorer', tone: answers.safeSharing === 'yes' ? 'good' : 'warning' },
      ],
      nextActions: [
        'Crée ou mets à jour ton dossier sur DossierFacile.',
        'Nomme les fichiers clairement et vérifie leur lisibilité.',
        'Prépare séparément les justificatifs du garant si tu en utilises un.',
      ],
      watchOut: riskyPayment ? ['Un paiement demandé avant visite, bail ou cadre vérifiable est un signal d’alerte important.'] : undefined,
    };
  }

  if (id === 'garant-visale') {
    const age = toNumber(answers, 'visaleAge');
    const signed = answers.bailAlreadySigned === 'yes';
    const likelyAge = age >= 18 && age <= 30;
    return {
      title: signed ? 'Le bail est déjà signé : vérifie immédiatement la procédure officielle' : 'Tu peux préparer ta vérification Visale',
      summary: likelyAge ? 'Ton âge correspond au public jeune généralement visé, mais seule Visale confirme l’éligibilité complète.' : 'Ton âge ou ta situation nécessite une vérification directe sur Visale.',
      metrics: [
        { label: 'Âge saisi', value: age ? `${age} ans` : 'Non précisé' },
        { label: 'Bail déjà signé', value: signed ? 'Oui' : 'Non', tone: signed ? 'danger' : 'good' },
        { label: 'Compte Visale', value: answers.visaleAccount === 'yes' ? 'Créé' : 'À créer', tone: answers.visaleAccount === 'yes' ? 'good' : 'warning' },
        { label: 'Justificatifs', value: answers.visaleDocuments === 'yes' ? 'Prêts' : 'À préparer', tone: answers.visaleDocuments === 'yes' ? 'good' : 'warning' },
      ],
      nextActions: [
        'Lance le test d’éligibilité sur le site officiel Visale.',
        'Prépare les justificatifs demandés sans signer prématurément.',
        'Transmets le visa au bailleur et suis l’ordre indiqué par Visale avant le bail.',
      ],
      watchOut: signed ? ['Visale doit être préparée selon l’ordre officiel ; un bail déjà signé peut changer la situation.'] : undefined,
    };
  }

  if (id === 'verifier-annonce') {
    const riskKeys = ['tooCheap', 'listingCopied', 'ownerAbroad', 'urgentPressure', 'refusesCall', 'oddContact', 'paymentBeforeVisit', 'unusualPayment', 'sensitiveDocs'];
    const score = yesCount(answers, riskKeys);
    const sent = answers.alreadySent === 'yes';
    const level = score >= 4 ? 'Risque élevé' : score >= 2 ? 'Plusieurs signaux à vérifier' : 'Peu de signaux déclarés';
    return {
      title: level,
      summary: `${score} signal(aux) d’alerte ont été cochés. Ce score n’est pas une preuve, mais il détermine les vérifications à faire avant de continuer.`,
      metrics: [
        { label: 'Signaux relevés', value: String(score), tone: score >= 4 ? 'danger' : score >= 2 ? 'warning' : 'good' },
        { label: 'Paiement avant cadre clair', value: answers.paymentBeforeVisit === 'yes' ? 'Demandé' : 'Non déclaré', tone: answers.paymentBeforeVisit === 'yes' ? 'danger' : 'neutral' },
        { label: 'Argent ou documents déjà envoyés', value: sent ? 'Oui' : 'Non', tone: sent ? 'warning' : 'good' },
      ],
      nextActions: [
        'Ne paie rien tant que le logement, l’identité et le cadre contractuel ne sont pas vérifiés.',
        'Recherche l’adresse, les photos et l’identité par des moyens indépendants.',
        sent ? 'Conserve toutes les preuves et utilise le parcours « Qui contacter ? » pour préparer un signalement.' : 'Demande une visite et un échange vérifiable avant d’envoyer des pièces sensibles.',
      ],
      watchOut: score >= 4 ? ['Interromps la démarche tant que les incohérences ne sont pas levées.'] : undefined,
    };
  }

  if (id === 'comprendre-bail') {
    const annexes = toList(answers, 'annexes');
    const unclear = toStringValue(answers, 'unclearClauses');
    return {
      title: unclear ? 'Des questions sont à poser avant signature' : 'Les informations principales ont été relevées',
      summary: 'La maquette a transformé les montants, dates et annexes en une fiche de relecture. Elle ne valide pas juridiquement le contrat.',
      metrics: [
        { label: 'Type', value: toStringValue(answers, 'leaseType') || 'À préciser' },
        { label: 'Loyer + charges', value: `${Math.round(toNumber(answers, 'leaseRent') + toNumber(answers, 'leaseCharges')) || '—'} € / mois` },
        { label: 'Dépôt', value: `${toNumber(answers, 'deposit') || '—'} €` },
        { label: 'Annexes repérées', value: String(annexes.length), tone: annexes.length >= 3 ? 'good' : 'warning' },
      ],
      nextActions: [
        'Demande une réponse écrite pour chaque clause ou montant incompris.',
        'Compare le contrat aux informations officielles correspondant au type de bail.',
        'Conserve le bail et toutes ses annexes dans ton coffre après signature.',
      ],
      watchOut: unclear ? ['Ne signe pas un passage que tu ne comprends pas sans demander une explication ou un avis compétent.'] : undefined,
    };
  }

  if (id === 'emmenagement') {
    const beforeKeys = yesCount(answers, ['insuranceReady', 'electricityReady', 'internetReady']);
    const planned = toList(answers, 'inventoryTools').length;
    return {
      title: beforeKeys === 3 ? 'La remise des clés est bien préparée' : 'Il reste des actions avant les clés',
      summary: `${beforeKeys}/3 services principaux sont préparés et ${planned} élément(s) sont prévus pour l’état des lieux.`,
      metrics: [
        { label: 'Assurance', value: answers.insuranceReady === 'yes' ? 'Prête' : 'À traiter', tone: answers.insuranceReady === 'yes' ? 'good' : 'warning' },
        { label: 'Énergie', value: answers.electricityReady === 'yes' ? 'Prévue' : 'À traiter', tone: answers.electricityReady === 'yes' ? 'good' : 'warning' },
        { label: 'Photos et relevés', value: answers.photoPlan === 'yes' && answers.metersPlan === 'yes' ? 'Prévus' : 'À préparer', tone: answers.photoPlan === 'yes' && answers.metersPlan === 'yes' ? 'good' : 'warning' },
      ],
      nextActions: [
        'Prépare une checklist pièce par pièce pour l’état des lieux.',
        'Photographie précisément les anomalies et fais-les inscrire dans le document.',
        'Programme la CAF et les changements d’adresse après l’entrée effective.',
      ],
    };
  }

  if (id === 'caf-logement') {
    const ready = yesCount(answers, ['cafLeaseSigned', 'cafEmail', 'cafRib', 'cafLease', 'landlordDetails', 'rentDetails', 'cafResourcesReady']);
    return {
      title: answers.cafLeaseSigned === 'yes' ? 'Tu peux préparer l’ouverture de la demande officielle' : 'Attends le bail signé avant de finaliser',
      summary: `${ready}/7 éléments de préparation sont confirmés. La CAF reste la seule source du droit et du montant.`,
      metrics: [
        { label: 'Bail', value: answers.cafLeaseSigned === 'yes' ? 'Signé' : 'Non confirmé', tone: answers.cafLeaseSigned === 'yes' ? 'good' : 'warning' },
        { label: 'RIB', value: answers.cafRib === 'yes' ? 'Prêt' : 'Manquant ou inconnu', tone: answers.cafRib === 'yes' ? 'good' : 'warning' },
        { label: 'Bailleur', value: answers.landlordDetails === 'yes' ? 'Coordonnées prêtes' : 'À récupérer', tone: answers.landlordDetails === 'yes' ? 'good' : 'warning' },
        { label: 'Suivi', value: answers.cafFollowUp === 'yes' ? 'Prévu' : 'À organiser' },
      ],
      nextActions: [
        'Fais la demande depuis le site officiel de la CAF avec les informations exactes du bail.',
        'Conserve la confirmation et note le numéro de dossier.',
        'Consulte régulièrement les messages et réponds aux demandes complémentaires.',
      ],
    };
  }

  if (id === 'radar-aides') {
    const categories = toList(answers, 'benefitCategories');
    return {
      title: 'Ta simulation officielle est prête à être lancée',
      summary: `${categories.length} domaine(s) seront vérifiés. TutoVie prépare la démarche mais ne déclare aucune aide acquise.`,
      metrics: [
        { label: 'Domaines', value: String(categories.length) },
        { label: 'Revenus saisis', value: `${toNumber(answers, 'benefitIncome') || 'À vérifier'} € / mois` },
        { label: 'Simulation déjà faite', value: answers.officialSimulationDone === 'yes' ? 'Oui' : 'Non', tone: answers.officialSimulationDone === 'yes' ? 'good' : 'neutral' },
      ],
      nextActions: [
        'Lance le simulateur Mes droits sociaux avec les informations préparées.',
        'Enregistre seulement les aides proposées par la source officielle.',
        'Pour chaque résultat, crée ensuite une démarche avec pièces, date et organisme.',
      ],
    };
  }

  if (id === 'papiers-essentiels') {
    const docs = toList(answers, 'essentialDocs');
    const folders = toList(answers, 'folderPlan');
    return {
      title: docs.length >= 6 ? 'Ton socle documentaire est bien avancé' : 'Plusieurs documents restent à retrouver',
      summary: `${docs.length} document(s) essentiel(s) sont localisés et ${folders.length} dossier(s) de rangement sont prévus.`,
      metrics: [
        { label: 'Documents localisés', value: String(docs.length), tone: docs.length >= 6 ? 'good' : 'warning' },
        { label: 'Copie de secours', value: answers.backupExists === 'yes' ? 'Oui' : 'À créer', tone: answers.backupExists === 'yes' ? 'good' : 'warning' },
        { label: 'Nommage clair', value: answers.fileNaming === 'yes' ? 'Oui' : 'À améliorer' },
        { label: 'Rappels', value: answers.expiryReminder === 'yes' ? 'Souhaités' : 'Non' },
      ],
      nextActions: [
        'Retrouve d’abord le document indiqué comme prioritaire.',
        'Crée un emplacement principal et une copie de secours sécurisée.',
        'Nomme chaque fichier avec le type, la date et la personne concernée.',
      ],
    };
  }

  if (id === 'sante') {
    const ready = yesCount(answers, ['ameliAccount', 'securityNumber', 'vitaleCard', 'ameliRib', 'ameliAddress', 'vitaleUpdated', 'doctorDeclared', 'mutualCard']);
    return {
      title: ready >= 6 ? 'Ta santé administrative est presque à jour' : 'Il reste plusieurs vérifications utiles',
      summary: `${ready}/8 points sont confirmés dans ce parcours.`,
      metrics: [
        { label: 'Compte ameli', value: answers.ameliAccount === 'yes' ? 'Accessible' : 'À régler', tone: answers.ameliAccount === 'yes' ? 'good' : 'warning' },
        { label: 'RIB personnel', value: answers.ameliRib === 'yes' ? 'Enregistré' : 'À vérifier', tone: answers.ameliRib === 'yes' ? 'good' : 'warning' },
        { label: 'Adresse', value: answers.ameliAddress === 'yes' ? 'À jour' : 'À vérifier' },
        { label: 'Complémentaire', value: toStringValue(answers, 'mutualStatus') || 'À préciser' },
      ],
      nextActions: [
        'Connecte-toi au compte ameli depuis l’adresse officielle.',
        'Mets à jour les coordonnées nécessaires puis actualise la carte Vitale si demandé.',
        'Vérifie séparément ta mutuelle et la destination des remboursements.',
      ],
    };
  }

  if (id === 'premiers-impots') {
    const attached = answers.taxAttached;
    const accessReady = answers.taxNumber === 'yes' && answers.taxOnlineAccess === 'yes';
    return {
      title: attached === 'unknown' ? 'Commence par clarifier le rattachement' : 'Ton dossier fiscal peut être préparé',
      summary: 'Le parcours distingue le choix de rattachement, l’accès en ligne, l’adresse et les revenus. La décision doit être confirmée avec les règles de la campagne concernée.',
      metrics: [
        { label: 'Rattachement', value: attached === 'yes' ? 'Déclaré comme rattaché' : attached === 'no' ? 'Déclaration personnelle envisagée' : 'À clarifier', tone: attached === 'unknown' ? 'warning' : 'neutral' },
        { label: 'Accès en ligne', value: accessReady ? 'Prêt' : 'À préparer', tone: accessReady ? 'good' : 'warning' },
        { label: 'Adresse au 1er janvier', value: answers.taxAddressJanuary === 'yes' ? 'Connue' : 'À retrouver' },
        { label: 'Types de revenus', value: String(toList(answers, 'incomeKinds').length) },
      ],
      nextActions: [
        'Clarifie le rattachement avec les parents concernés avant la déclaration.',
        'Conserve les justificatifs annuels correspondant à chaque revenu.',
        'Consulte la procédure Service-Public et impots.gouv.fr de la campagne en cours.',
      ],
    };
  }

  if (id === 'demenagement') {
    const contracts = toList(answers, 'movingContracts');
    const targets = toList(answers, 'addressTargets');
    return {
      title: 'Ta chronologie de déménagement est prête',
      summary: `${contracts.length} contrat(s) et ${targets.length} organisme(s) sont à traiter.`,
      metrics: [
        { label: 'Date', value: toStringValue(answers, 'movingDate') || 'À préciser' },
        { label: 'Contrats', value: String(contracts.length) },
        { label: 'Changements d’adresse', value: String(targets.length) },
        { label: 'Préavis', value: answers.noticeSent === 'yes' ? 'Envoyé' : 'À vérifier', tone: answers.noticeSent === 'yes' ? 'good' : 'warning' },
      ],
      nextActions: [
        'Traite d’abord le préavis, l’assurance et les ouvertures de contrats liées aux clés.',
        'Utilise le téléservice officiel quand il permet de regrouper les changements d’adresse.',
        'Vérifie séparément les organismes qui exigent une mise à jour dans leur propre espace.',
      ],
    };
  }

  if (id === 'comprendre-courrier') {
    const authentic = answers.letterAuthenticity === 'yes';
    return {
      title: authentic ? 'Le courrier est transformé en plan d’action' : 'Vérifie d’abord l’authenticité du message',
      summary: `Expéditeur : ${toStringValue(answers, 'letterSender') || 'non identifié'}. Action : ${toStringValue(answers, 'letterRequest') || 'à préciser'}.`,
      metrics: [
        { label: 'Date limite', value: toStringValue(answers, 'letterDeadline') || 'Non trouvée', tone: toStringValue(answers, 'letterDeadline') ? 'neutral' : 'warning' },
        { label: 'Canal de réponse', value: toStringValue(answers, 'letterReplyChannel') || 'À préciser' },
        { label: 'Authenticité', value: authentic ? 'Vérifiée' : 'À vérifier', tone: authentic ? 'good' : 'warning' },
      ],
      nextActions: [
        'Accède à l’organisme par son site officiel, sans utiliser un lien douteux du message.',
        'Réunis les documents mentionnés et conserve une copie de l’envoi.',
        'Si la demande reste ambiguë, ouvre le parcours « Qui contacter ? » avec ce récapitulatif.',
      ],
    };
  }

  const category = toStringValue(answers, 'problemCategory');
  const contacts: Record<string, string> = {
    housing: 'ADIL, bailleur ou gestionnaire selon le problème',
    caf: 'CAF depuis l’espace officiel ou un point d’accueil',
    health: 'Assurance Maladie / CPAM depuis ameli',
    tax: 'Service des impôts des particuliers',
    school: 'Scolarité, service social ou Crous',
    identity: 'Mairie, préfecture ou service officiel correspondant',
    other: 'Annuaire Service-Public pour identifier le service compétent',
  };
  return {
    title: 'Ton contact est préparé',
    summary: contacts[category] ?? contacts.other ?? 'Annuaire Service-Public pour identifier le service compétent',
    metrics: [
      { label: 'Urgence', value: toStringValue(answers, 'problemUrgency') || 'À préciser' },
      { label: 'Canal préféré', value: toStringValue(answers, 'contactPreference') || 'À préciser' },
      { label: 'Référence', value: toStringValue(answers, 'problemReference') || 'Aucune' },
      { label: 'Historique', value: answers.problemContacted === 'yes' ? 'Contact précédent noté' : 'Premier contact' },
    ],
    nextActions: [
      'Ouvre le site officiel de l’organisme et retrouve le canal de contact adapté.',
      'Commence par la référence du dossier, puis résume le problème en une phrase.',
      'Demande une action précise et note la date, le nom du service et la réponse.',
    ],
    preparedItems: [
      `Problème : ${toStringValue(answers, 'problemSummary') || 'à compléter'}`,
      `Objectif : ${toStringValue(answers, 'contactGoal') || 'à compléter'}`,
      `Créneau : ${toStringValue(answers, 'contactAvailability') || 'à définir'}`,
    ],
  };
}

export function getRecommendedJourneyIds(needs: string[], housingStatus: string | null): JourneyId[] {
  const ids: JourneyId[] = [];
  if (needs.includes('housing') || housingStatus === 'searching' || housingStatus === 'parents') {
    ids.push('budget-logement', 'recherche-logement', 'dossier-locatif');
  }
  if (needs.includes('benefits')) ids.push('radar-aides', 'caf-logement');
  if (needs.includes('documents')) ids.push('papiers-essentiels', 'comprendre-courrier');
  if (needs.includes('health')) ids.push('sante');
  if (needs.includes('tax')) ids.push('premiers-impots');
  if (needs.includes('moving')) ids.push('demenagement', 'emmenagement');
  if (needs.includes('problem')) ids.push('qui-contacter', 'comprendre-courrier');
  if (!ids.length) ids.push('budget-logement', 'papiers-essentiels', 'radar-aides');
  return [...new Set(ids)].slice(0, 5);
}
