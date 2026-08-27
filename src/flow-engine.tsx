import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from './data';
import JourneyResultScreen from './results';
import type {
  AnswerValue,
  JourneyDefinition,
  JourneyField,
  JourneyProgress,
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
  SelectChip,
  StatusPill,
  uiStyles,
  useResponsiveLayout,
} from './ui';

export default function FlowEngine({
  journey,
  progress,
  completed,
  onChange,
  onClose,
  onComplete,
}: {
  journey: JourneyDefinition;
  progress: JourneyProgress;
  completed: boolean;
  onChange: (progress: JourneyProgress) => void;
  onClose: () => void;
  onComplete: () => void;
}) {
  const { desktop } = useResponsiveLayout();
  const [showResult, setShowResult] = useState(completed || progress.currentStep >= journey.steps.length);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const currentIndex = Math.min(Math.max(progress.currentStep, 0), journey.steps.length - 1);
  const currentStep = journey.steps[currentIndex];

  const requiredMissing = useMemo(() => {
    if (!currentStep) return [];
    return currentStep.fields.filter((field) => field.required && !hasValue(progress.answers[field.key]));
  }, [currentStep, progress.answers]);

  const updateAnswer = (key: string, value: AnswerValue) => {
    onChange({
      ...progress,
      status: 'in-progress',
      answers: { ...progress.answers, [key]: value },
      updatedAt: new Date().toISOString(),
    });
  };

  const goBack = () => {
    setAttemptedNext(false);
    if (currentIndex === 0) {
      onClose();
      return;
    }
    onChange({ ...progress, currentStep: currentIndex - 1, status: 'in-progress', updatedAt: new Date().toISOString() });
  };

  const goNext = () => {
    setAttemptedNext(true);
    if (requiredMissing.length) return;
    setAttemptedNext(false);
    if (currentIndex === journey.steps.length - 1) {
      onChange({ ...progress, currentStep: journey.steps.length, status: 'in-progress', updatedAt: new Date().toISOString() });
      setShowResult(true);
      return;
    }
    onChange({ ...progress, currentStep: currentIndex + 1, status: 'in-progress', updatedAt: new Date().toISOString() });
  };

  const complete = () => {
    onChange({
      ...progress,
      currentStep: journey.steps.length,
      status: 'completed',
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    onComplete();
  };

  if (showResult) {
    return (
      <ScreenShell contentStyle={styles.resultShell} maxWidth={1180}>
        <View style={styles.flowTopBar}>
          <GhostButton label="← Fermer" onPress={onClose} />
          <BrandMark compact />
          <StatusPill tone="good">RÉCAPITULATIF</StatusPill>
        </View>
        <JourneyResultScreen
          journey={journey}
          answers={progress.answers}
          completed={completed || progress.status === 'completed'}
          onEdit={() => {
            onChange({ ...progress, currentStep: Math.max(0, journey.steps.length - 1), status: 'in-progress', updatedAt: new Date().toISOString() });
            setShowResult(false);
          }}
          onComplete={complete}
          onClose={onClose}
        />
      </ScreenShell>
    );
  }

  if (!currentStep) return null;

  return (
    <ScreenShell contentStyle={styles.flowShell} maxWidth={1320}>
      <View style={styles.flowTopBar}>
        <GhostButton label={currentIndex === 0 ? '← Mes démarches' : '← Étape précédente'} onPress={goBack} />
        <BrandMark compact />
        <Text style={styles.stepCounter}>{currentIndex + 1} / {journey.steps.length}</Text>
      </View>

      {!desktop ? (
        <View style={styles.mobileProgress}>
          <View style={styles.progressLabels}><Text style={styles.progressLabel}>{journey.shortTitle}</Text><Text style={styles.progressPercent}>{Math.round(((currentIndex + 1) / journey.steps.length) * 100)} %</Text></View>
          <ProgressBar value={(currentIndex + 1) / journey.steps.length} />
        </View>
      ) : null}

      <View style={[styles.workspace, desktop && styles.workspaceDesktop]}>
        {desktop ? (
          <View style={styles.stepRail}>
            <View style={[styles.journeyIdentity, { backgroundColor: journey.color }]}>
              <Text style={styles.journeyIdentityIcon}>{journey.icon}</Text>
              <Text style={styles.journeyIdentityTitle}>{journey.shortTitle}</Text>
              <Text style={styles.journeyIdentityTime}>{journey.duration}</Text>
            </View>
            <View style={styles.railSteps}>
              {journey.steps.map((step, index) => {
                const done = index < currentIndex;
                const active = index === currentIndex;
                return (
                  <Pressable
                    key={step.id}
                    onPress={() => onChange({ ...progress, currentStep: index, status: 'in-progress', updatedAt: new Date().toISOString() })}
                    style={[styles.railStep, active && styles.railStepActive]}
                  >
                    <View style={[styles.railDot, done && styles.railDotDone, active && styles.railDotActive]}>
                      <Text style={[styles.railDotText, (done || active) && styles.railDotTextActive]}>{done ? '✓' : index + 1}</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.railStepTitle, active && styles.railStepTitleActive]}>{step.title}</Text>
                      <Text style={styles.railStepHint}>{done ? 'Réponses enregistrées' : active ? 'Étape en cours' : 'À venir'}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.autoSave}>Tes réponses sont sauvegardées automatiquement dans cette maquette.</Text>
          </View>
        ) : null}

        <View style={[styles.questionColumn, desktop && styles.questionColumnDesktop]}>
          <View style={styles.stepHeading}>
            <Text style={uiStyles.eyebrow}>{currentStep.eyebrow}</Text>
            <Text style={[uiStyles.title, desktop && styles.desktopStepTitle]}>{currentStep.title}</Text>
            <Text style={uiStyles.subtitle}>{currentStep.description}</Text>
          </View>

          {!desktop && (currentStep.helpTitle || currentStep.helpText) ? (
            <InfoCard title={currentStep.helpTitle ?? 'Besoin d’aide ?'} tone="blue">
              {currentStep.helpText ?? 'Réponds uniquement avec ce que tu sais. Tu pourras modifier les réponses plus tard.'}
            </InfoCard>
          ) : null}

          <View style={styles.fields}>
            {currentStep.fields.map((field) => (
              <JourneyFieldView
                key={field.key}
                field={field}
                value={progress.answers[field.key]}
                invalid={Boolean(attemptedNext && field.required && !hasValue(progress.answers[field.key]))}
                onChange={(value) => updateAnswer(field.key, value)}
              />
            ))}
          </View>

          {attemptedNext && requiredMissing.length ? (
            <InfoCard title="Il manque une réponse" tone="danger">
              Complète les champs signalés. Quand le bouton “Je ne sais pas encore” est proposé, tu peux l’utiliser au lieu d’inventer une valeur.
            </InfoCard>
          ) : null}

          <View style={[styles.formActions, desktop && styles.formActionsDesktop]}>
            {currentIndex > 0 ? <View style={desktop && styles.actionButton}><SecondaryButton label="Étape précédente" onPress={goBack} /></View> : null}
            <View style={desktop && styles.actionButtonPrimary}><PrimaryButton label={currentIndex === journey.steps.length - 1 ? 'Voir mon récapitulatif' : 'Continuer'} icon="→" onPress={goNext} /></View>
          </View>
          <Text style={styles.formFootnote}>Tu n’as pas besoin de tout connaître pour avancer. Les éléments incertains seront signalés dans le résultat.</Text>
        </View>

        {desktop ? (
          <View style={styles.helpColumn}>
            <Text style={styles.helpEyebrow}>AIDE POUR CETTE ÉTAPE</Text>
            <Text style={styles.helpTitle}>{currentStep.helpTitle ?? 'Réponds avec ce que tu sais'}</Text>
            <Text style={styles.helpText}>{currentStep.helpText ?? 'Les réponses peuvent être complétées plus tard. Ne donne pas une valeur au hasard pour remplir un champ.'}</Text>
            <View style={styles.helpRule} />
            <Text style={styles.helpSectionTitle}>Comment utiliser le guide</Text>
            <HelpLine number="1" text="Lis l’explication avant de répondre." />
            <HelpLine number="2" text="Utilise “Je ne sais pas” quand l’information manque." />
            <HelpLine number="3" text="Le récapitulatif te dira quoi vérifier et auprès de qui." />
            <View style={styles.sourceMini}>
              <Text style={styles.sourceMiniLabel}>SOURCE PRINCIPALE</Text>
              <Text style={styles.sourceMiniTitle}>{journey.source.label}</Text>
              <Text style={styles.sourceMiniDate}>Vérifiée le {journey.source.checkedAt}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </ScreenShell>
  );
}

function JourneyFieldView({
  field,
  value,
  invalid,
  onChange,
}: {
  field: JourneyField;
  value: AnswerValue | undefined;
  invalid: boolean;
  onChange: (value: AnswerValue) => void;
}) {
  const { desktop } = useResponsiveLayout();
  const unknown = value === 'unknown';
  const options = field.options ?? [];

  if (field.kind === 'choice') {
    return (
      <View style={[styles.fieldGroup, invalid && styles.fieldGroupInvalid]}>
        <FieldLabel field={field} invalid={invalid} />
        <View style={[styles.choiceOptions, desktop && styles.choiceOptionsDesktop]}>
          {options.map((option) => (
            <View key={option.id} style={desktop && styles.choiceOptionDesktop}>
              <ChoiceCard
                compact
                selected={value === option.id}
                title={option.label}
                caption={option.caption}
                icon={option.emoji}
                onPress={() => onChange(option.id)}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (field.kind === 'multi' || field.kind === 'checklist') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <View style={[styles.fieldGroup, invalid && styles.fieldGroupInvalid]}>
        <FieldLabel field={field} invalid={invalid} />
        <View style={styles.chipOptions}>
          {options.map((option) => (
            <SelectChip
              key={option.id}
              selected={selected.includes(option.id)}
              label={option.label}
              onPress={() => onChange(selected.includes(option.id) ? selected.filter((item) => item !== option.id) : [...selected, option.id])}
            />
          ))}
        </View>
      </View>
    );
  }

  const stringValue = unknown ? '' : typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const numeric = field.kind === 'money' || field.kind === 'number';
  return (
    <View style={[styles.fieldGroup, invalid && styles.fieldGroupInvalid]}>
      <Field
        label={`${field.label}${field.required ? ' *' : ''}`}
        value={stringValue}
        onChangeText={(text) => onChange(numeric ? text.replace(/[^0-9,.-]/g, '') : text)}
        placeholder={unknown ? 'À vérifier plus tard' : field.placeholder}
        helper={invalid ? 'Une réponse est nécessaire pour continuer.' : field.helper}
        suffix={field.suffix}
        multiline={field.kind === 'longText'}
        keyboardType={numeric ? 'numeric' : 'default'}
        editable={!unknown}
        style={unknown ? styles.unknownField : undefined}
      />
      {field.allowUnknown ? (
        <Pressable
          onPress={() => onChange(unknown ? '' : 'unknown')}
          style={[styles.unknownButton, unknown && styles.unknownButtonActive]}
        >
          <View style={[styles.unknownCheck, unknown && styles.unknownCheckActive]}><Text style={styles.unknownCheckText}>{unknown ? '✓' : ''}</Text></View>
          <Text style={[styles.unknownButtonText, unknown && styles.unknownButtonTextActive]}>Je ne sais pas encore</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FieldLabel({ field, invalid }: { field: JourneyField; invalid: boolean }) {
  return (
    <View style={styles.fieldLabelRow}>
      <View style={styles.flex}>
        <Text style={styles.fieldLabel}>{field.label}{field.required ? ' *' : ''}</Text>
        {field.helper ? <Text style={styles.fieldHelper}>{field.helper}</Text> : null}
      </View>
      {invalid ? <Text style={styles.requiredText}>Réponse requise</Text> : null}
    </View>
  );
}

function HelpLine({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.helpLine}>
      <View style={styles.helpNumber}><Text style={styles.helpNumberText}>{number}</Text></View>
      <Text style={styles.helpLineText}>{text}</Text>
    </View>
  );
}

function hasValue(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function createEmptyProgress(): JourneyProgress {
  return {
    currentStep: 0,
    answers: {},
    status: 'not-started',
    updatedAt: new Date().toISOString(),
  };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  resultShell: { minHeight: '100%', gap: 30, paddingTop: 14 },
  flowShell: { minHeight: '100%', paddingTop: 12 },
  flowTopBar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  stepCounter: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  mobileProgress: { marginTop: 18, gap: 8 },
  progressLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLabel: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  progressPercent: { color: colors.muted, fontSize: 11 },
  workspace: { marginTop: 26, gap: 24 },
  workspaceDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 28, marginTop: 32 },
  stepRail: { width: 245, gap: 20 },
  journeyIdentity: { padding: 18, borderRadius: 23 },
  journeyIdentityIcon: { color: colors.ink, fontSize: 30, fontWeight: '900' },
  journeyIdentityTitle: { marginTop: 18, color: colors.ink, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  journeyIdentityTime: { marginTop: 6, color: colors.inkSoft, fontSize: 11.5 },
  railSteps: { gap: 6 },
  railStep: { minHeight: 64, padding: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  railStepActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  railDot: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.lineStrong },
  railDotDone: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  railDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  railDotText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  railDotTextActive: { color: '#FFFFFF' },
  railStepTitle: { color: colors.inkSoft, fontSize: 12.5, lineHeight: 17, fontWeight: '700' },
  railStepTitleActive: { color: colors.ink, fontWeight: '900' },
  railStepHint: { marginTop: 2, color: colors.muted, fontSize: 9.5 },
  autoSave: { color: colors.muted, fontSize: 10.5, lineHeight: 16 },
  questionColumn: { gap: 23 },
  questionColumnDesktop: { flex: 1, maxWidth: 650, minWidth: 0 },
  stepHeading: { gap: 1 },
  desktopStepTitle: { fontSize: 43, lineHeight: 48 },
  fields: { gap: 18 },
  fieldGroup: { gap: 10, padding: 16, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  fieldGroupInvalid: { borderColor: colors.danger, backgroundColor: '#FFF9FA' },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  fieldLabel: { color: colors.ink, fontSize: 13.5, lineHeight: 18, fontWeight: '800' },
  fieldHelper: { marginTop: 3, color: colors.muted, fontSize: 11.5, lineHeight: 16 },
  requiredText: { color: colors.danger, fontSize: 10.5, fontWeight: '800' },
  choiceOptions: { gap: 9 },
  choiceOptionsDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
  choiceOptionDesktop: { flexGrow: 1, flexBasis: 230, minWidth: 210 },
  chipOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unknownField: { color: colors.muted, backgroundColor: colors.surfaceAlt },
  unknownButton: { minHeight: 42, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 4 },
  unknownButtonActive: { opacity: 1 },
  unknownCheck: { width: 21, height: 21, borderRadius: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.lineStrong },
  unknownCheckActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  unknownCheckText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  unknownButtonText: { color: colors.muted, fontSize: 12.5, fontWeight: '700' },
  unknownButtonTextActive: { color: colors.primaryDark },
  formActions: { gap: 10, marginTop: 2 },
  formActionsDesktop: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionButton: { minWidth: 190 },
  actionButtonPrimary: { minWidth: 235 },
  formFootnote: { color: colors.muted, fontSize: 10.5, lineHeight: 16, textAlign: 'center' },
  helpColumn: { width: 270, padding: 20, borderRadius: 24, backgroundColor: colors.ink, position: 'sticky' as never, top: 24 as never },
  helpEyebrow: { color: colors.lime, fontSize: 9.5, fontWeight: '900', letterSpacing: 0.9 },
  helpTitle: { marginTop: 12, color: '#FFFFFF', fontSize: 18, lineHeight: 23, fontWeight: '900' },
  helpText: { marginTop: 10, color: '#C7C0CC', fontSize: 12.5, lineHeight: 19 },
  helpRule: { height: 1, marginVertical: 18, backgroundColor: '#4A424F' },
  helpSectionTitle: { marginBottom: 12, color: '#FFFFFF', fontSize: 12.5, fontWeight: '800' },
  helpLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 12 },
  helpNumber: { width: 23, height: 23, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B3440' },
  helpNumberText: { color: colors.lime, fontSize: 10.5, fontWeight: '900' },
  helpLineText: { flex: 1, color: '#C7C0CC', fontSize: 11.5, lineHeight: 17 },
  sourceMini: { marginTop: 8, padding: 14, borderRadius: 17, backgroundColor: '#2C2631' },
  sourceMiniLabel: { color: '#AFA6B4', fontSize: 8.5, fontWeight: '900', letterSpacing: 0.7 },
  sourceMiniTitle: { marginTop: 6, color: '#FFFFFF', fontSize: 12.5, lineHeight: 17, fontWeight: '800' },
  sourceMiniDate: { marginTop: 4, color: '#AFA6B4', fontSize: 9.5 },
});
